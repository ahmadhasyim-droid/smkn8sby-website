import { html, raw, url, rupiah, icon, now, token, hashPassword, verifyPassword, SCHOOL, APP_NAME, VERSION, intInput, ucfirst, avatar, esc, normWa, tampilWa, UserError } from '../core.js';
import { simpanGambar, hapusGambar } from '../media.js';
import { promoCarousel } from './layanan.js';
import { SCHEMA, SEED_KANTIN } from '../schema.js';

/* ---------------- Instalasi (sekali, saat database masih kosong) ---------------- */
export async function install(ctx) {
  let err = '';
  let f = {};
  if (ctx.isPost) {
    f = await ctx.csrf();
    const nama = String(f.nama || '').trim();
    const user = String(f.username || '').trim().toLowerCase();
    const pass = String(f.password || '');
    const kpass = String(f.kantin_password || '');
    const min = intInput(f.min_topup ?? '10000');
    if (!nama || !/^[a-z0-9._-]{3,30}$/.test(user) || pass.length < 6 || kpass.length < 6) {
      err = 'Lengkapi isian. Username 3–30 huruf kecil/angka, password minimal 6 karakter.';
    } else {
      await ctx.batch(SCHEMA.map((s) => ctx.st(s)));
      if ((await ctx.val('SELECT COUNT(*) FROM users')) > 0) return ctx.redirect('/');
      const t = now();
      const kHash = await hashPassword(kpass, ctx.env);
      const stmts = [
        ctx.st("INSERT INTO users (username,nama,password,role,status,created_at) VALUES (?,?,?,'admin','aktif',?)",
          user, nama, await hashPassword(pass, ctx.env), t),
      ];
      SEED_KANTIN.forEach((k, i) => {
        stmts.push(ctx.st('INSERT INTO kantin (nama,slug,pemilik,spesial,deskripsi,banner,warna,saldo,aktif,urutan) VALUES (?,?,?,?,?,?,?,0,1,?)',
          k.nama, k.slug, k.pemilik, k.spesial, k.deskripsi, k.banner, k.warna, i + 1));
        k.menu.forEach((m, j) => stmts.push(ctx.st(
          'INSERT INTO menu (kantin_id,nama,kategori,harga,tersedia,unggulan,urutan) SELECT id,?,?,?,1,?,? FROM kantin WHERE slug = ?',
          m[0], m[1], m[2], m[3] || 0, j + 1, k.slug)));
        stmts.push(ctx.st("INSERT INTO users (username,nama,password,role,kantin_id,status,created_at) SELECT ?,?,?,'kantin',id,'aktif',? FROM kantin WHERE slug = ?",
          k.akun[0], k.akun[1], kHash, t, k.slug));
      });
      if (f.contoh) {
        const demo = await hashPassword('123456', ctx.env);
        for (const c of [['0081234501', 'Siswa Contoh Satu', 'siswa', 'X-1'], ['0081234502', 'Siswa Contoh Dua', 'siswa', 'XI-1'],
          ['198501012010011001', 'Guru Contoh', 'guru', '']]) {
          stmts.push(ctx.st("INSERT INTO users (username,nama,password,role,jenis,kelas,status,created_at) VALUES (?,?,?,'pembeli',?,?,'belum',?)",
            c[0], c[1], demo, c[2], c[3], t));
        }
      }
      for (const [k, v] of [['min_topup', String(min)], ['maks_saldo', '0'], ['db_version', '6'],
        ['pengumuman', 'Selamat datang di Smanesa Kantin Digital! Top up saldo di Petugas Kantin, pilih menu, lalu tunjukkan QR struk ke kantin.']]) {
        stmts.push(ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', k, v));
      }
      await ctx.batch(stmts);
      ctx.flash('ok', `Instalasi berhasil! 4 kantin beserta menunya sudah dibuat. Akun kantin: <code>kantinsekolah</code>, <code>busumiyati</code>, <code>buwinarsih</code>, <code>buin</code>. Silakan masuk sebagai <b>${user}</b>.`);
      return ctx.redirect('/?p=login');
    }
  }
  return ctx.bare('Instalasi', html`
    <img src="/assets/img/logo-sma.png" alt="" class="auth-logo">
    <h1>Instalasi Smanesa Kantin Digital</h1>
    ${err ? html`<div class="alert alert-err">${err}</div>` : ''}
    <p class="muted">Database D1 terhubung dan masih kosong. Buat akun Admin pertama (akses penuh). Akun petugas kantin bisa ditambahkan admin nanti di menu Pengguna.</p>
    <form method="post" class="stack">
      ${ctx.csrfField()}
      <label>Nama admin<input name="nama" required value="${f.nama || 'Admin Kantin'}"></label>
      <label>Username admin<input name="username" required value="${f.username || 'admin'}" autocapitalize="none"></label>
      <label>Password admin<input name="password" type="password" required minlength="6"></label>
      <label>Password awal 4 akun kantin<input name="kantin_password" type="password" required minlength="6"></label>
      <label>Minimal top up (Rp)<input name="min_topup" inputmode="numeric" value="${f.min_topup || '10000'}"></label>
      <label class="check"><input type="checkbox" name="contoh" value="1" checked> Tambahkan 3 akun pembeli contoh (password 123456)</label>
      <button class="btn btn-primary btn-block">Pasang sekarang</button>
    </form>`);
}

/* ---------------- Login ---------------- */
export async function login(ctx) {
  let err = '';
  let username = '';
  if (ctx.isPost) {
    const f = await ctx.csrf();
    username = String(f.username || '').trim();
    const pass = String(f.password || '');
    const nowMs = Date.now();
    const lock = await ctx.first('SELECT * FROM login_gagal WHERE username = ?', username.toLowerCase());
    const usr = await ctx.first('SELECT * FROM users WHERE username = ?', username);
    if (lock && lock.sampai > nowMs) {
      err = `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((lock.sampai - nowMs) / 60000)} menit.`;
    } else if (!usr || !(await verifyPassword(pass, usr.password, ctx.env))) {
      const n = (lock && lock.sampai <= nowMs && lock.n >= 5 ? 0 : lock?.n || 0) + 1;
      await ctx.run('INSERT OR REPLACE INTO login_gagal (username, n, sampai) VALUES (?, ?, ?)',
        username.toLowerCase(), n >= 5 ? 0 : n, n >= 5 ? nowMs + 5 * 60000 : 0);
      err = 'NISN/username atau password salah.';
    } else if (usr.status === 'belum') {
      err = `Akun Anda belum diregistrasi. Silakan datang ke <b>Petugas Kantin</b> untuk registrasi dan top up saldo minimal <b>${rupiah(await ctx.setting('min_topup', 0))}</b>, atau <a class="link" href="/?p=aktivasi">ajukan aktivasi online</a>.`;
    } else if (usr.status !== 'aktif') {
      err = 'Akun Anda dinonaktifkan. Hubungi Petugas Kantin.';
    } else {
      if (lock) await ctx.run('DELETE FROM login_gagal WHERE username = ?', username.toLowerCase());
      await ctx.run('UPDATE users SET last_login = ? WHERE id = ?', now(), usr.id);
      ctx.sess = { uid: usr.id, h: String(usr.password).slice(-12), csrf: token(), flash: [] };
      return ctx.redirect('/?p=beranda');
    }
  }
  return ctx.bare('Masuk', html`
  <div class="auth-hero">
    <img src="/assets/img/logo-sma.png" alt="Logo SMAN 1 Purwoasri" class="auth-logo">
    <h1>Smanesa<br><span>Kantin Digital</span></h1>
    <p class="tagline">Bersih · Sehat · Bergizi — tanpa uang tunai</p>
  </div>
  ${err ? html`<div class="alert alert-err">${raw(err)}</div>` : ''}
  <form method="post" action="/?p=login" class="stack" autocomplete="on">
    ${ctx.csrfField()}
    <label>NISN / NIP / Username
      <input name="username" value="${username}" required autocapitalize="none" autocomplete="username" autofocus>
    </label>
    <label>Password
      <input name="password" type="password" required autocomplete="current-password">
    </label>
    <button class="btn btn-primary btn-block btn-lg">Masuk</button>
  </form>
  <a class="btn btn-ghost btn-block" href="/?p=aktivasi">${icon('shield', 18)} Belum aktif? Ajukan aktivasi</a>
  ${await promoCarousel(ctx, 'login')}
  <p class="auth-foot">${SCHOOL}</p>`);
}

/* ---------------- Akun (semua peran) ---------------- */
export async function akun(ctx) {
  const u = ctx.user;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    if (f.aksi === 'wa') {
      const wa = normWa(f.wa);
      if (f.wa && !wa) ctx.flash('err', 'Nomor WhatsApp tidak valid. Contoh: 081234567890.');
      else { await ctx.run('UPDATE users SET wa = ? WHERE id = ?', wa, u.id); ctx.flash('ok', 'Nomor WhatsApp disimpan.'); }
      return ctx.redirect(url('akun'));
    }
    if ((f.aksi === 'foto' || f.aksi === 'hapus_foto') && u.role === 'admin') {
      try {
        const baruFoto = f.aksi === 'foto' ? await simpanGambar(ctx, f.foto_data, 200_000) : '';
        if (f.aksi === 'foto' && !baruFoto) throw new UserError('Pilih foto terlebih dahulu.');
        await ctx.run('UPDATE users SET foto = ? WHERE id = ?', baruFoto, u.id);
        await hapusGambar(ctx, u.foto);
        ctx.flash('ok', baruFoto ? 'Foto profil diperbarui.' : 'Foto profil dihapus.');
      } catch (e) {
        if (!(e instanceof UserError)) throw e;
        ctx.flash('err', esc(e.message));
      }
      return ctx.redirect(url('akun'));
    }
    const baru = String(f.baru || '');
    if (!(await verifyPassword(String(f.lama || ''), u.password, ctx.env))) ctx.flash('err', 'Password lama salah.');
    else if (baru.length < 6) ctx.flash('err', 'Password baru minimal 6 karakter.');
    else if (baru !== String(f.ulang || '')) ctx.flash('err', 'Ulangi password baru tidak sama.');
    else {
      const h = await hashPassword(baru, ctx.env);
      await ctx.run('UPDATE users SET password = ? WHERE id = ?', h, u.id);
      ctx.sess.h = h.slice(-12);
      ctx.flash('ok', 'Password berhasil diganti.');
    }
    return ctx.redirect(url('akun'));
  }
  const roleLabel = { pembeli: ucfirst(u.jenis || 'Pembeli'), kantin: 'Penjual (Kantin)', petugas: 'Petugas Kantin', admin: 'Admin' }[u.role];
  const bolehFoto = u.role === 'admin';
  const kantinNama = u.kantin_id ? await ctx.val('SELECT nama FROM kantin WHERE id = ?', u.kantin_id) : null;
  return ctx.page('Akun', html`
<section class="card profile-card">
  <div class="profile-cover"></div>
  <form method="post" class="profile-photo" data-photo-form>
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="foto"><input type="hidden" name="foto_data">
    ${avatar(u, 'xl')}
    ${bolehFoto ? html`<label class="photo-btn" title="Ganti foto">${icon('edit', 16)}
      <input type="file" accept="image/*" data-resize="320" data-square data-target="foto_data" data-autosubmit hidden>
    </label>` : ''}
  </form>
  <h2>${u.nama}</h2>
  <p class="muted">${roleLabel}${u.kelas ? ' · ' + u.kelas : ''}${kantinNama ? ' · ' + kantinNama : ''}</p>
  <p class="mono small">${u.username}</p>
  ${!bolehFoto ? html`<p class="hint">Foto profil dipasang dan diubah oleh Admin.</p>`
    : u.foto ? html`<form method="post" class="inline">${ctx.csrfField()}<input type="hidden" name="aksi" value="hapus_foto">
    <button class="btn btn-ghost btn-sm">Hapus foto</button></form>` : html`<p class="hint">Ketuk ikon pensil untuk memasang foto profil.</p>`}
</section>
${u.role === 'pembeli' ? html`<section class="card"><div class="row-between"><span>Saldo</span><b class="big">${rupiah(u.saldo)}</b></div></section>` : ''}
${u.role === 'pembeli' || u.role === 'kantin' ? html`<a class="card list-item link-card" href="${url('tarik')}">
  <span class="li-ic ok">${icon('cash', 18)}</span>
  <span class="li-main"><b>${u.role === 'kantin' ? 'Cairkan saldo penjualan' : 'Tarik saldo ke uang tunai'}</b><small>Ajukan, lalu tunjukkan QR ke Petugas Kantin</small></span>
</a>` : ''}
<section class="card">
  <h3>Nomor WhatsApp</h3>
  <form method="post" class="row gap">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="wa">
    <input name="wa" inputmode="tel" class="grow" value="${tampilWa(u.wa)}" placeholder="08xxxxxxxxxx">
    <button class="btn">Simpan</button>
  </form>
  <p class="hint">Dipakai petugas untuk mengirim informasi akun &amp; top up.</p>
</section>
<section class="card">
  <h3>Ganti password</h3>
  <form method="post" class="stack">
    ${ctx.csrfField()}
    <label>Password lama<input type="password" name="lama" required autocomplete="current-password"></label>
    <label>Password baru<input type="password" name="baru" required minlength="6" autocomplete="new-password"></label>
    <label>Ulangi password baru<input type="password" name="ulang" required minlength="6" autocomplete="new-password"></label>
    <button class="btn btn-primary">Simpan password</button>
  </form>
</section>
<section class="card install-card" data-install hidden>
  <h3>Pasang aplikasi di HP</h3>
  <p class="muted">Tambahkan Smanesa Kantin Digital ke layar utama agar bisa dibuka seperti aplikasi.</p>
  <button class="btn" data-install-btn>Pasang aplikasi</button>
</section>
<a class="btn btn-ghost btn-block danger" href="${url('logout')}">${icon('logout', 18)} Keluar</a>
<p class="center muted small">${APP_NAME} v${VERSION}</p>`);
}
