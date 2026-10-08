// =============================================================
//  API Website SMKN 8 Surabaya — Cloudflare Pages Functions + D1
//  Semua permintaan ke /api/* ditangani file ini.
//  Binding database yang dibutuhkan: DB (Cloudflare D1)
// =============================================================
import { SCHEMA_VERSION, TABLES, DEFAULT_SETTINGS, DEFAULT_UNITS, MIGRATIONS } from '../../lib/schema.js';

const SESSION_DAYS = 7;
const MAX_MEDIA_BYTES = 1_900_000;
const ROLES = ['admin', 'unit'];

// ---------------- util ----------------
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
const err = (message, status = 400) => json({ error: message }, status);
const now = () => new Date().toISOString();
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const randHex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha256(s) { return b64(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
const clampInt = (v, d, min, max) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);

function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post';
}

// Pembersih HTML sederhana untuk isi berita (tambahan dari sanitasi di browser)
function cleanHtml(html) {
  return String(html || '')
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link|base)[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|vbscript|data:text)[^"']*\2/gi, '$1="#"')
    .slice(0, 200_000);
}
const textOnly = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------- skema otomatis ----------------
let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  try {
    const row = await db.prepare(`SELECT value FROM settings WHERE key='schema_version'`).first();
    if (row && row.value === SCHEMA_VERSION) { schemaReady = true; return; }
  } catch (_) { /* tabel belum ada */ }
  await db.batch(TABLES.map((s) => db.prepare(s)));
  for (const m of MIGRATIONS) { try { await db.prepare(m).run(); } catch (_) { /* sudah diterapkan */ } }
  const dkv = DEFAULT_UNITS.find((u) => u.slug === 'dkv');
  try { // isi profil DKV menggantikan teks bawaan Multimedia (hanya bila belum diubah pengelola)
    await db.prepare(`UPDATE units SET description=?, kompetensi=?, prospek=? WHERE slug='dkv' AND description LIKE 'Program Keahlian Multimedia%'`)
      .bind(dkv.description, dkv.kompetensi, dkv.prospek).run();
  } catch (_) { /* abaikan */ }
  const stmts = [];
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) stmts.push(db.prepare(`INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)`).bind(k, v));
  for (const u of DEFAULT_UNITS) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO units(slug,type,name,short,tagline,color,icon,logo,description,kompetensi,prospek,parent,sort,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(u.slug, u.type, u.name, u.short, u.tagline, u.color, u.icon, u.logo || '', u.description, u.kompetensi, u.prospek, u.parent || null, u.sort, now()));
    if (u.parent) stmts.push(db.prepare(`UPDATE units SET parent=? WHERE slug=? AND parent IS NULL`).bind(u.parent, u.slug));
  }
  const t = now();
  stmts.push(db.prepare(`INSERT OR IGNORE INTO posts(id,slug,title,excerpt,content,category,unit_slug,status,featured,author_name,published_at,created_at,updated_at)
    VALUES(1,'selamat-datang-di-website-baru-smkn-8-surabaya',?,?,?,'pengumuman','sekolah','publish',1,'Admin',?,?,?)`).bind(
    'Selamat Datang di Website Baru SMKN 8 Surabaya',
    'Website resmi SMK Negeri 8 Surabaya kini hadir dengan halaman khusus untuk setiap program keahlian, LSP, dan Bursa Kerja Khusus.',
    '<p>Website resmi SMK Negeri 8 Surabaya kini hadir dengan tampilan baru. Setiap program keahlian — Kecantikan, Perhotelan, Kuliner/Tata Boga, Desain Komunikasi Visual (DKV), dan Tata Busana — serta Teaching Factory (TEFA) di setiap keahlian memiliki halaman sendiri yang berisi profil, kompetensi, kegiatan, agenda, dan galeri.</p><p>Selain itu, tersedia halaman <strong>LSP P1</strong> untuk informasi skema sertifikasi kompetensi, serta <strong>Bursa Kerja Khusus (BKK)</strong> untuk informasi lowongan kerja bagi lulusan.</p><p>Ikuti juga kabar terbaru kami di Instagram dan Facebook <strong>@smekdels</strong> serta kanal YouTube <strong>smkn8sbyofficial</strong>.</p>',
    t, t, t));
  stmts.push(db.prepare(`INSERT OR REPLACE INTO settings(key,value) VALUES('schema_version',?)`).bind(SCHEMA_VERSION));
  await db.batch(stmts);
  schemaReady = true;
}

// ---------------- password & sesi ----------------
async function hashPassword(pw, saltBytes) {
  const salt = saltBytes || crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
  return `pbkdf2$100000$${b64(salt)}$${b64(bits)}`;
}
async function verifyPassword(pw, stored) {
  const [, , salt] = String(stored).split('$');
  if (!salt) return false;
  const test = await hashPassword(pw, unb64(salt));
  if (test.length !== stored.length) return false;
  let diff = 0; for (let i = 0; i < test.length; i++) diff |= test.charCodeAt(i) ^ stored.charCodeAt(i);
  return diff === 0;
}
function getCookie(req, name) {
  const c = req.headers.get('Cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function sessionCookie(token, maxAge, req) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
async function currentUser(db, req) {
  const token = getCookie(req, 'sid');
  if (!token) return null;
  const row = await db.prepare(`SELECT u.id,u.username,u.name,u.role,u.unit_slug,u.active,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?`)
    .bind(await sha256(token)).first();
  if (!row || !row.active || row.expires_at < Date.now()) return null;
  return row;
}
async function createSession(db, userId, req) {
  const token = randHex(32);
  const exp = Date.now() + SESSION_DAYS * 86400e3;
  await db.batch([
    db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(Date.now()),
    db.prepare(`INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)`).bind(await sha256(token), userId, exp),
    db.prepare(`UPDATE users SET last_login=? WHERE id=?`).bind(now(), userId),
  ]);
  return sessionCookie(token, SESSION_DAYS * 86400, req);
}
const publicUser = (u) => u && ({ id: u.id, username: u.username, name: u.name, role: u.role, unit_slug: u.unit_slug });

// ---------------- izin akses ----------------
// admin  : semua data
// unit   : hanya data unit (jurusan/lembaga) miliknya; BKK -> lowongan, LSP -> skema
const RESOURCES = {
  posts: {
    table: 'posts', scope: 'unit', order: 'COALESCE(published_at,created_at) DESC',
    fields: { title: 200, excerpt: 400, content: 'html', cover: 300, category: 30, unit_slug: 40, status: 20, featured: 'bool', published_at: 40 },
    required: ['title'],
  },
  agenda: {
    table: 'agenda', scope: 'unit', order: 'date DESC',
    fields: { title: 200, description: 2000, date: 10, end_date: 10, time: 40, location: 200, unit_slug: 40 },
    required: ['title', 'date'],
  },
  gallery: {
    table: 'gallery', scope: 'unit', order: 'id DESC',
    fields: { image: 300, caption: 300, unit_slug: 40 },
    required: ['image'],
  },
  lowongan: {
    table: 'lowongan', scope: 'bkk', order: "CASE status WHEN 'buka' THEN 0 ELSE 1 END, id DESC",
    fields: { company: 150, position: 150, location: 150, job_type: 40, majors: 200, deadline: 10, description: 5000, apply_link: 300, logo: 300, status: 10 },
    required: ['company', 'position'],
  },
  skema: {
    table: 'skema', scope: 'lsp', order: 'sort ASC, id ASC',
    fields: { code: 60, name: 200, major: 40, level: 60, units_count: 'int', description: 2000, sort: 'int' },
    required: ['name'],
  },
};
function canUseResource(user, res) {
  if (user.role === 'admin') return true;
  if (res.scope === 'unit') return !!user.unit_slug;
  return user.unit_slug === res.scope;
}
function canTouchRow(user, res, row) {
  if (user.role === 'admin') return true;
  if (res.scope === 'unit') return row.unit_slug === user.unit_slug;
  return user.unit_slug === res.scope;
}
function pickFields(res, body) {
  const out = {};
  for (const [k, rule] of Object.entries(res.fields)) {
    if (!(k in body)) continue;
    const v = body[k];
    if (rule === 'html') out[k] = cleanHtml(v);
    else if (rule === 'bool') out[k] = v ? 1 : 0;
    else if (rule === 'int') out[k] = v === '' || v == null ? null : clampInt(v, 0, -1e9, 1e9);
    else out[k] = str(v, rule);
  }
  return out;
}

// ---------------- router ----------------
export async function onRequest(ctx) {
  const { request: req, env } = ctx;
  if (!env.DB) return err('Database D1 belum terhubung. Tambahkan binding "DB" di pengaturan Cloudflare Pages.', 500);
  const db = env.DB;
  try {
    await ensureSchema(db);
    const url = new URL(req.url);
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const method = req.method.toUpperCase();
    const q = url.searchParams;

    // Perlindungan CSRF: permintaan yang mengubah data wajib JSON / gambar (bukan form biasa)
    if (method !== 'GET' && method !== 'HEAD') {
      const ct = (req.headers.get('Content-Type') || '').toLowerCase();
      if (!ct.startsWith('application/json') && !ct.startsWith('image/')) return err('Content-Type tidak didukung', 415);
    }
    const body = async () => { try { return await req.json(); } catch { return {}; } };

    // ===== MEDIA (gambar) =====
    if (parts[0] === 'media' && parts[1] && method === 'GET') {
      const m = await db.prepare(`SELECT mime,data FROM media WHERE id=?`).bind(parts[1]).first();
      if (!m) return new Response('Not found', { status: 404 });
      const data = m.data instanceof ArrayBuffer ? m.data : new Uint8Array(m.data);
      return new Response(data, { headers: { 'Content-Type': m.mime, 'Cache-Control': 'public, max-age=31536000, immutable' } });
    }

    // ===== PUBLIK =====
    if (method === 'GET' && parts[0] === 'site') {
      const [s, u, counts] = await Promise.all([
        db.prepare(`SELECT key,value FROM settings`).all(),
        db.prepare(`SELECT slug,type,name,short,tagline,color,icon,logo,cover,parent,sort FROM units ORDER BY sort`).all(),
        db.prepare(`SELECT (SELECT COUNT(*) FROM posts WHERE status='publish') posts,
          (SELECT COUNT(*) FROM lowongan WHERE status='buka') lowongan, (SELECT COUNT(*) FROM skema) skema`).first(),
      ]);
      const settings = Object.fromEntries(s.results.filter((r) => r.key !== 'schema_version').map((r) => [r.key, r.value]));
      return json({ settings, units: u.results, counts }, 200, { 'Cache-Control': 'public, max-age=60' });
    }

    if (method === 'GET' && parts[0] === 'units' && parts[1]) {
      const unit = await db.prepare(`SELECT * FROM units WHERE slug=?`).bind(parts[1]).first();
      if (!unit) return err('Unit tidak ditemukan', 404);
      return json({ unit }, 200, { 'Cache-Control': 'public, max-age=60' });
    }

    if (method === 'GET' && parts[0] === 'posts') {
      if (parts[1]) {
        const post = await db.prepare(`SELECT * FROM posts WHERE slug=? AND status='publish'`).bind(parts[1]).first();
        if (!post) return err('Berita tidak ditemukan', 404);
        ctx.waitUntil(db.prepare(`UPDATE posts SET views=views+1 WHERE id=?`).bind(post.id).run());
        const related = await db.prepare(`SELECT slug,title,cover,category,unit_slug,published_at FROM posts
          WHERE status='publish' AND id<>? AND unit_slug=? ORDER BY published_at DESC LIMIT 3`).bind(post.id, post.unit_slug).all();
        return json({ post, related: related.results });
      }
      const where = [`status='publish'`]; const args = [];
      if (q.get('unit')) { where.push('unit_slug=?'); args.push(q.get('unit')); }
      if (q.get('category')) { where.push('category=?'); args.push(q.get('category')); }
      if (q.get('featured')) where.push('featured=1');
      if (q.get('q')) { where.push('(title LIKE ? OR excerpt LIKE ?)'); args.push(`%${q.get('q')}%`, `%${q.get('q')}%`); }
      const limit = clampInt(q.get('limit'), 9, 1, 50), page = clampInt(q.get('page'), 1, 1, 9999);
      const w = where.join(' AND ');
      const [rows, total] = await Promise.all([
        db.prepare(`SELECT id,slug,title,excerpt,cover,category,unit_slug,featured,views,author_name,published_at FROM posts WHERE ${w}
          ORDER BY published_at DESC LIMIT ? OFFSET ?`).bind(...args, limit, (page - 1) * limit).all(),
        db.prepare(`SELECT COUNT(*) n FROM posts WHERE ${w}`).bind(...args).first(),
      ]);
      return json({ items: rows.results, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)) });
    }

    if (method === 'GET' && parts[0] === 'agenda') {
      const where = ['1=1']; const args = [];
      if (q.get('unit')) { where.push('unit_slug=?'); args.push(q.get('unit')); }
      const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // WIB
      let order = 'date DESC';
      if (q.get('upcoming')) { where.push('COALESCE(end_date,date)>=?'); args.push(today); order = 'date ASC'; }
      if (q.get('past')) { where.push('COALESCE(end_date,date)<?'); args.push(today); }
      const limit = clampInt(q.get('limit'), 20, 1, 100);
      const rows = await db.prepare(`SELECT * FROM agenda WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ?`).bind(...args, limit).all();
      return json({ items: rows.results, today });
    }

    if (method === 'GET' && parts[0] === 'gallery') {
      const where = ['1=1']; const args = [];
      if (q.get('unit')) { where.push('unit_slug=?'); args.push(q.get('unit')); }
      const limit = clampInt(q.get('limit'), 24, 1, 60), page = clampInt(q.get('page'), 1, 1, 9999);
      const [rows, total] = await Promise.all([
        db.prepare(`SELECT id,image,caption,unit_slug,created_at FROM gallery WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...args, limit, (page - 1) * limit).all(),
        db.prepare(`SELECT COUNT(*) n FROM gallery WHERE ${where.join(' AND ')}`).bind(...args).first(),
      ]);
      return json({ items: rows.results, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)) });
    }

    if (method === 'GET' && parts[0] === 'lowongan') {
      const where = ['1=1']; const args = [];
      if (q.get('status')) { where.push('status=?'); args.push(q.get('status')); }
      if (q.get('major')) { where.push(`(','||majors||',' LIKE ? OR majors='' OR majors IS NULL)`); args.push(`%,${q.get('major')},%`); }
      const limit = clampInt(q.get('limit'), 50, 1, 100);
      const rows = await db.prepare(`SELECT * FROM lowongan WHERE ${where.join(' AND ')} ORDER BY ${RESOURCES.lowongan.order} LIMIT ?`).bind(...args, limit).all();
      return json({ items: rows.results });
    }

    if (method === 'GET' && parts[0] === 'skema') {
      const where = ['1=1']; const args = [];
      if (q.get('major')) { where.push('major=?'); args.push(q.get('major')); }
      const rows = await db.prepare(`SELECT * FROM skema WHERE ${where.join(' AND ')} ORDER BY sort, id`).bind(...args).all();
      return json({ items: rows.results });
    }

    if (method === 'POST' && parts[0] === 'pesan') {
      const b = await body();
      if (b.website) return json({ ok: true }); // honeypot anti-spam
      const name = str(b.name, 100), message = str(b.message, 3000);
      if (!name || message.length < 5) return err('Nama dan pesan wajib diisi.');
      await db.prepare(`INSERT INTO messages(name,email,phone,subject,message,created_at) VALUES(?,?,?,?,?,?)`)
        .bind(name, str(b.email, 120), str(b.phone, 30), str(b.subject, 150), message, now()).run();
      return json({ ok: true });
    }

    // ===== AUTENTIKASI =====
    if (parts[0] === 'auth') {
      const action = parts[1];
      if (action === 'status' && method === 'GET') {
        const n = await db.prepare(`SELECT COUNT(*) n FROM users`).first();
        return json({ needsSetup: n.n === 0, user: publicUser(await currentUser(db, req)) });
      }
      if (action === 'setup' && method === 'POST') {
        const n = await db.prepare(`SELECT COUNT(*) n FROM users`).first();
        if (n.n > 0) return err('Akun admin sudah dibuat.', 403);
        const b = await body();
        const username = str(b.username, 40).toLowerCase(), password = String(b.password || '');
        if (!/^[a-z0-9._-]{3,40}$/.test(username)) return err('Username 3–40 karakter: huruf kecil, angka, titik, strip.');
        if (password.length < 8) return err('Password minimal 8 karakter.');
        const r = await db.prepare(`INSERT INTO users(username,name,password,role,created_at) VALUES(?,?,?,'admin',?)`)
          .bind(username, str(b.name, 100) || 'Administrator', await hashPassword(password), now()).run();
        const cookie = await createSession(db, r.meta.last_row_id, req);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie });
      }
      if (action === 'login' && method === 'POST') {
        const b = await body();
        const username = str(b.username, 40).toLowerCase();
        const since = Date.now() - 15 * 60e3;
        const fails = await db.prepare(`SELECT COUNT(*) n FROM login_attempts WHERE username=? AND ts>?`).bind(username, since).first();
        if (fails.n >= 8) return err('Terlalu banyak percobaan. Coba lagi 15 menit lagi.', 429);
        const u = await db.prepare(`SELECT * FROM users WHERE username=?`).bind(username).first();
        if (!u || !u.active || !(await verifyPassword(String(b.password || ''), u.password))) {
          await db.prepare(`INSERT INTO login_attempts(username,ts) VALUES(?,?)`).bind(username, Date.now()).run();
          return err('Username atau password salah.', 401);
        }
        await db.prepare(`DELETE FROM login_attempts WHERE username=? OR ts<?`).bind(username, since).run();
        const cookie = await createSession(db, u.id, req);
        return json({ ok: true, user: publicUser(u) }, 200, { 'Set-Cookie': cookie });
      }
      if (action === 'logout' && method === 'POST') {
        const t = getCookie(req, 'sid');
        if (t) await db.prepare(`DELETE FROM sessions WHERE token=?`).bind(await sha256(t)).run();
        return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0, req) });
      }
    }

    // ===== ADMIN (wajib login) =====
    const user = await currentUser(db, req);
    if (!user) return err('Silakan login terlebih dahulu.', 401);
    const isAdmin = user.role === 'admin';

    if (parts[0] === 'auth' && parts[1] === 'me') return json({ user: publicUser(user) });
    if (parts[0] === 'auth' && parts[1] === 'password' && method === 'POST') {
      const b = await body();
      const full = await db.prepare(`SELECT password FROM users WHERE id=?`).bind(user.id).first();
      if (!(await verifyPassword(String(b.old || ''), full.password))) return err('Password lama salah.');
      if (String(b.new || '').length < 8) return err('Password baru minimal 8 karakter.');
      await db.prepare(`UPDATE users SET password=? WHERE id=?`).bind(await hashPassword(String(b.new)), user.id).run();
      return json({ ok: true });
    }

    // Upload gambar (badan permintaan = file gambar mentah)
    if (parts[0] === 'media' && method === 'POST') {
      const mime = (req.headers.get('Content-Type') || '').split(';')[0];
      if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) return err('Format gambar harus JPG, PNG, WEBP, atau GIF.');
      const buf = await req.arrayBuffer();
      if (buf.byteLength > MAX_MEDIA_BYTES) return err('Ukuran gambar terlalu besar (maks ±1,9 MB setelah dikompres).');
      const id = randHex(12);
      await db.prepare(`INSERT INTO media(id,mime,data,size,unit_slug,created_by,created_at) VALUES(?,?,?,?,?,?,?)`)
        .bind(id, mime, buf, buf.byteLength, user.unit_slug || 'sekolah', user.id, now()).run();
      return json({ ok: true, url: `/api/media/${id}` });
    }

    if (parts[0] !== 'admin') return err('Endpoint tidak ditemukan', 404);
    const area = parts[1];

    // Dashboard ringkas
    if (area === 'dashboard' && method === 'GET') {
      const scope = isAdmin ? '' : ' WHERE unit_slug=?';
      const a = isAdmin ? [] : [user.unit_slug];
      const one = (sql) => db.prepare(sql).bind(...a).first().then((r) => r.n);
      const [posts, agenda, gallery, views] = await Promise.all([
        one(`SELECT COUNT(*) n FROM posts${scope}`), one(`SELECT COUNT(*) n FROM agenda${scope}`),
        one(`SELECT COUNT(*) n FROM gallery${scope}`), one(`SELECT COALESCE(SUM(views),0) n FROM posts${scope}`),
      ]);
      const recent = await db.prepare(`SELECT id,title,status,unit_slug,published_at,views FROM posts${scope} ORDER BY id DESC LIMIT 6`).bind(...a).all();
      const extra = {};
      if (isAdmin) {
        extra.users = (await db.prepare(`SELECT COUNT(*) n FROM users`).first()).n;
        extra.unread = (await db.prepare(`SELECT COUNT(*) n FROM messages WHERE is_read=0`).first()).n;
      }
      if (isAdmin || user.unit_slug === 'bkk') extra.lowongan = (await db.prepare(`SELECT COUNT(*) n FROM lowongan WHERE status='buka'`).first()).n;
      if (isAdmin || user.unit_slug === 'lsp') extra.skema = (await db.prepare(`SELECT COUNT(*) n FROM skema`).first()).n;
      return json({ posts, agenda, gallery, views, recent: recent.results, ...extra });
    }

    // Profil unit (jurusan / lembaga)
    if (area === 'units') {
      if (method === 'GET' && !parts[2]) {
        const rows = await db.prepare(`SELECT slug,type,name,short,color,logo,parent,sort FROM units ORDER BY sort`).all();
        return json({ items: isAdmin ? rows.results : rows.results.filter((r) => r.slug === user.unit_slug) });
      }
      const slug = parts[2];
      if (!isAdmin && slug !== user.unit_slug) return err('Anda tidak memiliki akses ke unit ini.', 403);
      if (method === 'GET') return json({ unit: await db.prepare(`SELECT * FROM units WHERE slug=?`).bind(slug).first() });
      if (method === 'PUT') {
        const b = await body();
        const F = { name: 120, short: 20, tagline: 250, color: 9, logo: 300, cover: 300, description: 5000, visi: 2000, misi: 4000,
          kompetensi: 4000, prospek: 4000, head_name: 120, head_title: 120, head_photo: 300, phone: 40, email: 120, instagram: 60 };
        const sets = [], args = [];
        for (const [k, max] of Object.entries(F)) if (k in b) { sets.push(`${k}=?`); args.push(str(b[k], max)); }
        if (b.color && !/^#[0-9a-fA-F]{6}$/.test(b.color)) return err('Warna harus format hex, mis. #1E5AA8');
        if (!sets.length) return err('Tidak ada perubahan.');
        await db.prepare(`UPDATE units SET ${sets.join(',')}, updated_at=? WHERE slug=?`).bind(...args, now(), slug).run();
        return json({ ok: true });
      }
    }

    // Pengaturan situs (khusus admin)
    if (area === 'settings') {
      if (!isAdmin) return err('Khusus admin.', 403);
      if (method === 'GET') {
        const s = await db.prepare(`SELECT key,value FROM settings`).all();
        return json({ settings: Object.fromEntries(s.results.map((r) => [r.key, r.value])) });
      }
      if (method === 'PUT') {
        const b = await body();
        const stmts = Object.keys(DEFAULT_SETTINGS).filter((k) => k in b)
          .map((k) => db.prepare(`INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)`).bind(k, str(b[k], 8000)));
        if (stmts.length) await db.batch(stmts);
        return json({ ok: true });
      }
    }

    // Pengguna (khusus admin)
    if (area === 'users') {
      if (!isAdmin) return err('Khusus admin.', 403);
      const id = parts[2] ? clampInt(parts[2], 0, 0, 1e12) : null;
      if (method === 'GET') {
        const rows = await db.prepare(`SELECT id,username,name,role,unit_slug,active,created_at,last_login FROM users ORDER BY role, unit_slug, username`).all();
        return json({ items: rows.results });
      }
      const b = await body();
      const role = ROLES.includes(b.role) ? b.role : 'unit';
      const unit = role === 'admin' ? null : str(b.unit_slug, 40);
      if (role === 'unit' && !(await db.prepare(`SELECT slug FROM units WHERE slug=?`).bind(unit).first())) return err('Pilih unit (jurusan/lembaga) untuk pengguna ini.');
      if (method === 'POST') {
        const username = str(b.username, 40).toLowerCase();
        if (!/^[a-z0-9._-]{3,40}$/.test(username)) return err('Username 3–40 karakter: huruf kecil, angka, titik, strip.');
        if (String(b.password || '').length < 8) return err('Password minimal 8 karakter.');
        if (await db.prepare(`SELECT id FROM users WHERE username=?`).bind(username).first()) return err('Username sudah dipakai.');
        await db.prepare(`INSERT INTO users(username,name,password,role,unit_slug,active,created_at) VALUES(?,?,?,?,?,1,?)`)
          .bind(username, str(b.name, 100), await hashPassword(String(b.password)), role, unit, now()).run();
        return json({ ok: true });
      }
      if (method === 'PUT' && id) {
        if (id === user.id && (role !== 'admin' || !b.active)) return err('Anda tidak dapat menurunkan atau menonaktifkan akun Anda sendiri.');
        await db.prepare(`UPDATE users SET name=?, role=?, unit_slug=?, active=? WHERE id=?`).bind(str(b.name, 100), role, unit, b.active ? 1 : 0, id).run();
        if (b.password) {
          if (String(b.password).length < 8) return err('Password minimal 8 karakter.');
          await db.batch([
            db.prepare(`UPDATE users SET password=? WHERE id=?`).bind(await hashPassword(String(b.password)), id),
            db.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id),
          ]);
        }
        if (!b.active) await db.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id).run();
        return json({ ok: true });
      }
      if (method === 'DELETE' && id) {
        if (id === user.id) return err('Anda tidak dapat menghapus akun sendiri.');
        await db.batch([db.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id), db.prepare(`DELETE FROM users WHERE id=?`).bind(id)]);
        return json({ ok: true });
      }
    }

    // Pesan masuk (khusus admin)
    if (area === 'messages') {
      if (!isAdmin) return err('Khusus admin.', 403);
      const id = parts[2] ? clampInt(parts[2], 0, 0, 1e12) : null;
      if (method === 'GET') return json({ items: (await db.prepare(`SELECT * FROM messages ORDER BY id DESC LIMIT 200`).all()).results });
      if (method === 'PUT' && id) { await db.prepare(`UPDATE messages SET is_read=1 WHERE id=?`).bind(id).run(); return json({ ok: true }); }
      if (method === 'DELETE' && id) { await db.prepare(`DELETE FROM messages WHERE id=?`).bind(id).run(); return json({ ok: true }); }
    }

    // CRUD umum: posts, agenda, gallery, lowongan, skema
    const res = RESOURCES[area];
    if (res) {
      if (!canUseResource(user, res)) return err('Anda tidak memiliki akses ke menu ini.', 403);
      const id = parts[2] ? clampInt(parts[2], 0, 0, 1e12) : null;

      if (method === 'GET' && !id) {
        const where = ['1=1'], args = [];
        if (!isAdmin && res.scope === 'unit') { where.push('unit_slug=?'); args.push(user.unit_slug); }
        else if (q.get('unit') && res.scope === 'unit') { where.push('unit_slug=?'); args.push(q.get('unit')); }
        if (q.get('q') && res.fields.title) { where.push('title LIKE ?'); args.push(`%${q.get('q')}%`); }
        const limit = clampInt(q.get('limit'), 20, 1, 100), page = clampInt(q.get('page'), 1, 1, 9999);
        const cols = area === 'posts' ? 'id,slug,title,cover,category,unit_slug,status,featured,views,author_name,published_at' : '*';
        const [rows, total] = await Promise.all([
          db.prepare(`SELECT ${cols} FROM ${res.table} WHERE ${where.join(' AND ')} ORDER BY ${res.order} LIMIT ? OFFSET ?`).bind(...args, limit, (page - 1) * limit).all(),
          db.prepare(`SELECT COUNT(*) n FROM ${res.table} WHERE ${where.join(' AND ')}`).bind(...args).first(),
        ]);
        return json({ items: rows.results, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)) });
      }

      const existing = id ? await db.prepare(`SELECT * FROM ${res.table} WHERE id=?`).bind(id).first() : null;
      if (id && !existing) return err('Data tidak ditemukan.', 404);
      if (existing && !canTouchRow(user, res, existing)) return err('Anda tidak memiliki akses ke data ini.', 403);

      if (method === 'GET') return json({ item: existing });

      if (method === 'DELETE') {
        await db.prepare(`DELETE FROM ${res.table} WHERE id=?`).bind(id).run();
        if (area === 'gallery' && existing.image?.startsWith('/api/media/'))
          await db.prepare(`DELETE FROM media WHERE id=?`).bind(existing.image.split('/').pop()).run();
        return json({ ok: true });
      }

      if (method === 'POST' || method === 'PUT') {
        const b = await body();
        const data = pickFields(res, b);
        if (res.scope === 'unit') {
          if (!isAdmin) data.unit_slug = user.unit_slug;
          else if ('unit_slug' in data && data.unit_slug !== 'sekolah' &&
            !(await db.prepare(`SELECT slug FROM units WHERE slug=?`).bind(data.unit_slug).first())) data.unit_slug = 'sekolah';
        }
        if (method === 'POST') for (const r of res.required) if (!data[r]) return err(`Kolom "${r}" wajib diisi.`);
        if (method === 'PUT') for (const r of res.required) if (r in data && !data[r]) return err(`Kolom "${r}" wajib diisi.`);

        if (area === 'posts') {
          if (data.content !== undefined && !data.excerpt) data.excerpt = textOnly(data.content).slice(0, 220);
          if (data.status && !['publish', 'draft'].includes(data.status)) data.status = 'draft';
          if (data.category && !['berita', 'kegiatan', 'prestasi', 'pengumuman'].includes(data.category)) data.category = 'kegiatan';
          data.updated_at = now();
          if (method === 'POST') {
            let slug = slugify(data.title), n = 1;
            while (await db.prepare(`SELECT id FROM posts WHERE slug=?`).bind(slug).first()) slug = `${slugify(data.title)}-${++n}`;
            Object.assign(data, { slug, author_id: user.id, author_name: user.name || user.username, created_at: now() });
            if (!data.published_at) data.published_at = now();
          }
          if (!isAdmin) delete data.featured; // hanya admin yang bisa menandai berita utama
        } else if (method === 'POST') {
          data.created_by = user.id; data.created_at = now();
        }

        if (method === 'POST') {
          const keys = Object.keys(data);
          const r = await db.prepare(`INSERT INTO ${res.table}(${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`).bind(...keys.map((k) => data[k])).run();
          return json({ ok: true, id: r.meta.last_row_id, slug: data.slug });
        }
        const keys = Object.keys(data);
        if (!keys.length) return err('Tidak ada perubahan.');
        await db.prepare(`UPDATE ${res.table} SET ${keys.map((k) => `${k}=?`).join(',')} WHERE id=?`).bind(...keys.map((k) => data[k]), id).run();
        return json({ ok: true, id, slug: existing.slug });
      }
    }

    return err('Endpoint tidak ditemukan', 404);
  } catch (e) {
    console.error(e);
    return err('Terjadi kesalahan server: ' + (e && e.message ? e.message : e), 500);
  }
}
