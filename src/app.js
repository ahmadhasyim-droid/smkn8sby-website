/**
 * Pengendali utama: membuat konteks permintaan (sesi, pengguna, database),
 * lalu meneruskan ke halaman sesuai ?p=...
 */
import { html, raw, url, token, now, sealSession, openSession, UserError, unb64 } from './core.js';
import { layout, bare } from './layout.js';
import * as P from './pages/index.js';
import { sapuKedaluwarsa } from './money.js';
import { SCHEMA } from './schema.js';

const COOKIE = 'skd';
const SESSION_DAYS = 7;
let installed = false;
let migrated = false;

const ROUTES = {
  pembeli: {
    beranda: P.pembeliBeranda, kantin: P.pembeliKantin, keranjang: P.keranjang, struk: P.struk, riwayat: P.pembeliRiwayat,
    status: P.status, harga: P.harga, tarik: P.tarik, transfer: P.transfer, terima: P.terima, scan: P.scan, isisaldo: P.isisaldo,
  },
  kantin: {
    beranda: P.kantinBeranda, scan: P.scan, klaim: P.klaim, riwayat: P.kantinRiwayat, menu: P.kantinMenu, tarik: P.tarik,
  },
  petugas: {
    beranda: P.petugasBeranda, topup: P.topup, cairkan: P.cairkan, kantin: P.petugasKantin,
    menu: P.petugasMenu, pesanan: P.pesanan, transaksi: P.transaksi, struk: P.struk,
    harga: P.harga, scan: P.scan, verifikasi: P.verifikasi,
  },
};
// Admin: semua menu petugas + Pengguna + Pengaturan
ROUTES.admin = { ...ROUTES.petugas, pengguna: P.pengguna, pengaturan: P.pengaturan, promo: P.promo };

export async function handle(request, env) {
  const u = new URL(request.url);
  if (!env.DB || !env.SECRET || String(env.SECRET).length < 16) return setupError(env);

  if (u.pathname.startsWith('/img/')) return serveImage(env, u.pathname.slice(5));
  if (u.pathname !== '/' && u.pathname !== '/index.html') {
    return new Response('Halaman tidak ditemukan', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const ctx = await makeCtx(request, env, u);
  try {
    return await route(ctx);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e && e.stack || e);
    return ctx.page('Terjadi kesalahan', html`<div class="card empty"><p>Maaf, terjadi kesalahan pada server. Silakan coba lagi.</p>
      <a class="btn" href="/">Kembali ke beranda</a></div>`, {}, 500);
  }
}

async function route(ctx) {
  if (!installed) {
    const t = await ctx.first("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='users'");
    const n = t && t.n ? await ctx.val('SELECT COUNT(*) FROM users') : 0;
    installed = n > 0;
  }
  if (!installed) return P.install(ctx);
  if (!migrated) {
    if (parseInt(await ctx.setting('db_version', '2'), 10) < 3) {
      try { await ctx.run("ALTER TABLE users ADD COLUMN foto TEXT NOT NULL DEFAULT ''"); } catch (e) { /* kolom sudah ada */ }
      await ctx.run("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('db_version', '3')");
    }
    if (parseInt(await ctx.setting('db_version', '3'), 10) < 4) {
      // Versi 2.3: peran Admin. Jika belum ada admin, petugas pertama dijadikan admin.
      if (!(await ctx.val("SELECT COUNT(*) FROM users WHERE role = 'admin'"))) {
        await ctx.run("UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users WHERE role = 'petugas')");
      }
      await ctx.run("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('db_version', '4')");
    }
    if (parseInt(await ctx.setting('db_version', '4'), 10) < 5) {
      // Versi 2.5: nomor WA, permohonan aktivasi, promo, top up via transfer bank
      for (const sql of ["ALTER TABLE users ADD COLUMN wa TEXT NOT NULL DEFAULT ''", 'ALTER TABLE users ADD COLUMN aktivasi_at TEXT NULL']) {
        try { await ctx.run(sql); } catch (e) { /* sudah ada */ }
      }
      await ctx.batch(SCHEMA.filter((s) => /promo|topup_req/.test(s)).map((s) => ctx.st(s)));
      await ctx.run("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('db_version', '5')");
    }
    if (parseInt(await ctx.setting('db_version', '5'), 10) < 6) {
      // Versi 2.6: top up DANA (metode & kode unik)
      for (const sql of ["ALTER TABLE topup_req ADD COLUMN metode TEXT NOT NULL DEFAULT 'bank'", 'ALTER TABLE topup_req ADD COLUMN kode_unik INTEGER NOT NULL DEFAULT 0']) {
        try { await ctx.run(sql); } catch (e) { /* sudah ada */ }
      }
      await ctx.run("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('db_version', '6')");
    }
    migrated = true;
  }
  await sapuKedaluwarsa(ctx);
  if (ctx.p === 'install') return ctx.redirect('/');

  if (ctx.p === 'logout') {
    ctx.sess = { csrf: token(), flash: [] };
    return ctx.redirect(url('login'));
  }
  if (!ctx.user) return ctx.p === 'aktivasi' ? P.aktivasi(ctx) : P.login(ctx);
  if (ctx.p === '' || ctx.p === 'login') ctx.p = 'beranda';
  if (ctx.p === 'akun') return P.akun(ctx);
  const fn = ROUTES[ctx.user.role]?.[ctx.p];
  if (!fn) {
    return ctx.page('Halaman tidak ditemukan', html`<div class="card empty"><p>Halaman tidak ditemukan.</p>
      <a class="btn" href="${url('beranda')}">Kembali ke beranda</a></div>`, {}, 404);
  }
  return fn(ctx);
}

async function makeCtx(request, env, u) {
  const db = env.DB;
  const cookie = parseCookies(request.headers.get('Cookie') || '')[COOKIE];
  let sess = cookie ? await openSession(cookie, env.SECRET) : null;
  if (!sess) sess = { csrf: token(), flash: [] };
  sess.flash = sess.flash || [];

  const ctx = {
    req: request, env, db, u,
    q: Object.fromEntries(u.searchParams),
    p: (u.searchParams.get('p') || '').replace(/[^a-z_]/g, ''),
    method: request.method,
    sess,
    user: null,
    isPost: request.method === 'POST',

    /* --- database --- */
    st: (sql, ...p) => db.prepare(sql).bind(...p.map(norm)),
    all: async (sql, ...p) => (await db.prepare(sql).bind(...p.map(norm)).all()).results || [],
    first: async (sql, ...p) => (await db.prepare(sql).bind(...p.map(norm)).first()) || null,
    val: async (sql, ...p) => {
      const r = await db.prepare(sql).bind(...p.map(norm)).first();
      return r ? Object.values(r)[0] : null;
    },
    run: async (sql, ...p) => (await db.prepare(sql).bind(...p.map(norm)).run()).meta?.changes ?? 0,
    insert: async (sql, ...p) => (await db.prepare(sql).bind(...p.map(norm)).run()).meta?.last_row_id ?? 0,
    batch: (stmts) => db.batch(stmts),

    /* --- pengaturan --- */
    _set: null,
    async setting(k, d = null) {
      if (!this._set) {
        this._set = {};
        for (const r of await this.all('SELECT kunci, nilai FROM pengaturan')) this._set[r.kunci] = r.nilai;
      }
      return this._set[k] ?? d;
    },

    /* --- formulir --- */
    _form: null,
    async form() {
      if (this._form) return this._form;
      const ct = request.headers.get('Content-Type') || '';
      if (ct.includes('application/json')) {
        this._form = await request.json();
      } else {
        const fd = await request.formData();
        const o = {};
        for (const [k, v] of fd.entries()) o[k] = typeof v === 'string' ? v : v;
        this._form = o;
      }
      return this._form;
    },
    async csrf() {
      const f = await this.form();
      const t = f._csrf || request.headers.get('X-CSRF') || '';
      if (!t || t !== ctx.sess.csrf) {
        throw new Response('Sesi formulir kedaluwarsa. Silakan kembali dan muat ulang halaman.', {
          status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
      return f;
    },
    csrfField: () => raw(`<input type="hidden" name="_csrf" value="${ctx.sess.csrf}">`),

    /* --- pesan & respons --- */
    flash(type, msg) { (ctx.sess.flash = ctx.sess.flash || []).push([type, String(msg)]); },
    takeFlash() { const f = ctx.sess.flash || []; ctx.sess.flash = []; return f; },
    async cookieHeader() {
      ctx.sess.exp = Date.now() + SESSION_DAYS * 864e5;
      const v = await sealSession(ctx.sess, env.SECRET);
      const secure = u.protocol === 'https:' ? '; Secure' : '';
      return `${COOKIE}=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
    },
    async redirect(to) {
      return new Response(null, { status: 302, headers: { Location: to, 'Set-Cookie': await this.cookieHeader(), 'Cache-Control': 'no-store' } });
    },
    async htmlResponse(body, status = 200) {
      const s = String(body);
      return new Response(s, {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': await this.cookieHeader(), 'Cache-Control': 'no-store',
          'X-Frame-Options': 'SAMEORIGIN', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin',
        },
      });
    },
    page(title, body, opt = {}, status = 200) { return this.htmlResponse(layout(this, title, body, opt), status); },
    bare(title, body, status = 200) { return this.htmlResponse(bare(this, title, body), status); },
    json(data, status = 200) {
      return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
    },
    download(text, filename, type = 'text/csv; charset=utf-8') {
      return new Response(text, { headers: { 'Content-Type': type, 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } });
    },
  };

  if (ctx.sess.uid) {
    const usr = await ctx.first('SELECT * FROM users WHERE id = ?', ctx.sess.uid).catch(() => null);
    if (usr && usr.status === 'aktif' && ctx.sess.h === String(usr.password).slice(-12)) ctx.user = usr;
    else delete ctx.sess.uid;
  }
  return ctx;
}

function norm(v) {
  if (v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
}

function parseCookies(h) {
  const o = {};
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) o[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return o;
}

async function serveImage(env, id) {
  const r = await env.DB.prepare('SELECT mime, data FROM gambar WHERE id = ?').bind(parseInt(id, 10) || 0).first();
  if (!r) return new Response('Tidak ditemukan', { status: 404 });
  return new Response(unb64(r.data), {
    headers: { 'Content-Type': r.mime, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}

function setupError(env) {
  const miss = [];
  if (!env.DB) miss.push('Binding database D1 bernama <b>DB</b> belum dipasang');
  if (!env.SECRET || String(env.SECRET).length < 16) miss.push('Variabel rahasia <b>SECRET</b> (minimal 16 karakter) belum diisi');
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pengaturan belum lengkap</title><body style="font-family:system-ui;padding:24px;max-width:560px;margin:auto;line-height:1.5">
<h1 style="color:#c8202f">Smanesa Kantin Digital</h1><p>Pengaturan Cloudflare belum lengkap:</p><ul><li>${miss.join('</li><li>')}</li></ul>
<p>Buka Cloudflare → Workers &amp; Pages → proyek ini → <b>Settings</b>, lengkapi, lalu lakukan <b>Retry deployment</b>. Lihat PANDUAN.md.</p></body>`,
  { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export { UserError };
