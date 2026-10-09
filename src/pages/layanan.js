/**
 * v2.5 — Banner promo, permohonan aktivasi (WA), top up via transfer bank & verifikasi petugas.
 */
import { html, raw, url, rupiah, ribuan, icon, tgl, now, today, intInput, avatar, esc, ucfirst, randomCode,
  randomPassword, hashPassword, normWa, tampilWa, waLink, UserError, APP_NAME } from '../core.js';
import { terimaTopupBank } from '../money.js';
import { simpanGambar, hapusGambar } from '../media.js';

const METODE = { bank: 'Transfer bank', dana: 'DANA' };
const normNama = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

async function infoBank(ctx) {
  return {
    aktif: String(await ctx.setting('topup_bank_aktif', '0')) === '1',
    bank: String(await ctx.setting('bank_nama', '')),
    norek: String(await ctx.setting('bank_norek', '')),
    an: String(await ctx.setting('bank_an', '')),
    min: parseInt(await ctx.setting('min_topup', 0), 10) || 0,
    maks: parseInt(await ctx.setting('maks_saldo', 0), 10) || 0,
    dana: {
      aktif: String(await ctx.setting('dana_aktif', '0')) === '1',
      nomor: String(await ctx.setting('dana_nomor', '')),
      nama: String(await ctx.setting('dana_nama', '')),
      qr: String(await ctx.setting('dana_qr', '')),
    },
  };
}
const kartuRekening = (b) => html`<div class="bank-card">
  <span class="bank-name">${icon('bank', 18)} ${b.bank || 'Bank'}</span>
  <span class="bank-no mono" data-copy="${b.norek.replace(/\s/g, '')}">${b.norek} <button type="button" class="chip copy-btn">Salin</button></span>
  <span class="bank-an">a.n. ${b.an}</span>
</div>`;

/* ======================= PROMO ======================= */
/** Carousel promo untuk beranda/halaman masuk. target: 'pembeli' | 'kantin' | 'login' */
export async function promoCarousel(ctx, target) {
  const h = today();
  const where = target === 'login' ? "target = 'semua'" : "target IN ('semua', ?)";
  const par = target === 'login' ? [] : [target];
  const list = await ctx.all(`SELECT * FROM promo WHERE aktif = 1 AND ${where}
      AND (mulai = '' OR mulai <= ?) AND (sampai = '' OR sampai >= ?) ORDER BY urutan, id DESC LIMIT 8`, ...par, h, h);
  if (!list.length) return '';
  return html`<section class="promo" data-promo aria-label="Info & promo">
  <div class="promo-track">${list.map((p) => {
    const img = html`<img src="${p.gambar}" alt="${p.judul || 'Promo'}" loading="lazy">`;
    return html`<div class="promo-slide">${p.tautan ? html`<a href="${p.tautan}" ${/^https?:/.test(p.tautan) ? raw('target="_blank" rel="noopener"') : ''}>${img}</a>` : img}</div>`;
  })}</div>
  ${list.length > 1 ? html`<div class="promo-dots">${list.map((_, i) => html`<i class="${i ? '' : 'on'}"></i>`)}</div>` : ''}
</section>`;
}

export async function promo(ctx) {
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const id = parseInt(f.id, 10) || 0;
    try {
      if (f.aksi === 'simpan') {
        const target = ['semua', 'pembeli', 'kantin'].includes(f.target) ? f.target : 'semua';
        const tautan = String(f.tautan || '').trim();
        if (tautan && !/^(https?:\/\/|\/)/.test(tautan)) throw new UserError('Tautan harus diawali https:// atau / (halaman aplikasi).');
        const tglOk = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : '');
        const d = [String(f.judul || '').trim().slice(0, 100), tautan, target, tglOk(f.mulai), tglOk(f.sampai), f.aktif ? 1 : 0, parseInt(f.urutan, 10) || 0];
        const gambar = await simpanGambar(ctx, f.gambar_data, 1_000_000);
        if (id) {
          await ctx.run('UPDATE promo SET judul=?, tautan=?, target=?, mulai=?, sampai=?, aktif=?, urutan=? WHERE id=?', ...d, id);
          if (gambar) {
            const lama = await ctx.val('SELECT gambar FROM promo WHERE id = ?', id);
            await ctx.run('UPDATE promo SET gambar = ? WHERE id = ?', gambar, id);
            await hapusGambar(ctx, lama);
          }
        } else {
          if (!gambar) throw new UserError('Pilih gambar banner terlebih dahulu.');
          await ctx.run('INSERT INTO promo (judul, tautan, target, mulai, sampai, aktif, urutan, gambar, created_at) VALUES (?,?,?,?,?,?,?,?,?)', ...d, gambar, now());
        }
        ctx.flash('ok', 'Banner promo disimpan.');
      } else if (f.aksi === 'toggle') {
        await ctx.run('UPDATE promo SET aktif = 1 - aktif WHERE id = ?', id);
      } else if (f.aksi === 'hapus') {
        const g = await ctx.val('SELECT gambar FROM promo WHERE id = ?', id);
        await ctx.run('DELETE FROM promo WHERE id = ?', id);
        await hapusGambar(ctx, g);
        ctx.flash('ok', 'Banner promo dihapus.');
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
    }
    return ctx.redirect(url('promo'));
  }
  const list = await ctx.all('SELECT * FROM promo ORDER BY urutan, id DESC');
  const edit = ctx.q.edit ? await ctx.first('SELECT * FROM promo WHERE id = ?', parseInt(ctx.q.edit, 10) || 0) : null;
  const form = edit || ctx.q.tambah;
  const fv = edit || { id: 0, judul: '', tautan: '', target: 'semua', mulai: '', sampai: '', aktif: 1, urutan: list.length + 1, gambar: '' };
  const tLabel = { semua: 'Semua (termasuk halaman masuk)', pembeli: 'Siswa & guru', kantin: 'Penjual kantin' };
  const h = today();
  return ctx.page('Promo', html`
<div class="row-between"><h1 class="page-title">Banner iklan / poster / promo</h1>
  <a class="btn btn-primary" href="${url('promo', { tambah: 1 })}">${icon('plus', 16)} Tambah banner</a></div>
<p class="hint">Banner tampil bergeser otomatis di beranda pengguna. Ukuran ideal <b>1200 × 500 px</b> (rasio 12:5); gambar otomatis dikecilkan saat diunggah.</p>
${form ? html`<section class="card form-card">
  <h3>${edit ? 'Ubah banner' : 'Banner baru'}</h3>
  <form method="post" action="/?p=promo" class="grid-form">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="simpan"><input type="hidden" name="id" value="${fv.id}">
    <label class="span2">Gambar banner ${edit ? '' : html`<small class="muted">(wajib)</small>`}
      <input type="file" accept="image/*" data-resize="1200" data-target="gambar_data">
      <input type="hidden" name="gambar_data">
      ${fv.gambar ? html`<img src="${fv.gambar}" alt="" class="banner-prev promo-prev">` : ''}
    </label>
    <label class="span2">Judul / keterangan singkat<input name="judul" maxlength="100" value="${fv.judul}" placeholder="mis. Promo Es Teh 2 ribu!"></label>
    <label class="span2">Tautan saat diklik (opsional)<input name="tautan" value="${fv.tautan}" placeholder="mis. /?p=kantin&id=2 atau https://instagram.com/sman1purwoasri"></label>
    <label>Tampil untuk<select name="target">${Object.entries(tLabel).map(([v, l]) => html`<option value="${v}"${fv.target === v ? ' selected' : ''}>${l}</option>`)}</select></label>
    <label>Urutan<input type="number" name="urutan" value="${fv.urutan}"></label>
    <label>Mulai tampil (opsional)<input type="date" name="mulai" value="${fv.mulai}"></label>
    <label>Selesai tampil (opsional)<input type="date" name="sampai" value="${fv.sampai}"></label>
    <label class="check span2"><input type="checkbox" name="aktif" value="1"${fv.aktif ? ' checked' : ''}> Aktif</label>
    <div class="span2 row gap"><button class="btn btn-primary">${icon('check', 16)} Simpan</button><a class="btn btn-ghost" href="${url('promo')}">Batal</a></div>
  </form>
</section>` : ''}
${!list.length ? html`<div class="card empty"><p>Belum ada banner promo.</p></div>` : ''}
<div class="kantin-admin">${list.map((p) => {
    const jalan = p.aktif && (!p.mulai || p.mulai <= h) && (!p.sampai || p.sampai >= h);
    return html`<article class="card flush">
    <img src="${p.gambar}" alt="" class="promo-thumb" loading="lazy">
    <div class="pad">
      <div class="row-between"><b>${p.judul || '(tanpa judul)'}</b>${jalan ? html`<span class="badge badge-ok">Tayang</span>` : html`<span class="badge badge-mute">${p.aktif ? 'Terjadwal / lewat' : 'Nonaktif'}</span>`}</div>
      <p class="small muted">${tLabel[p.target]}${p.mulai || p.sampai ? ` · ${p.mulai ? tgl(p.mulai, false) : '…'} s.d. ${p.sampai ? tgl(p.sampai, false) : '…'}` : ''}${p.tautan ? ' · ' + p.tautan : ''}</p>
      <div class="row gap">
        <a class="btn btn-sm" href="${url('promo', { edit: p.id })}">${icon('edit', 14)} Ubah</a>
        <form method="post" action="/?p=promo" class="inline">${ctx.csrfField()}<input type="hidden" name="aksi" value="toggle"><input type="hidden" name="id" value="${p.id}">
          <button class="btn btn-sm">${p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></form>
        <form method="post" action="/?p=promo" class="inline" data-confirm="Hapus banner ini?">${ctx.csrfField()}<input type="hidden" name="aksi" value="hapus"><input type="hidden" name="id" value="${p.id}">
          <button class="btn btn-sm danger">${icon('trash', 14)}</button></form>
      </div>
    </div>
  </article>`;
  })}</div>`);
}

/* ======================= PERMOHONAN AKTIVASI (tanpa login) ======================= */
export async function aktivasi(ctx) {
  const b = await infoBank(ctx);
  let f = {};
  let selesai = null;
  if (ctx.isPost) {
    f = await ctx.csrf();
    const un = String(f.username || '').trim();
    const wa = normWa(f.wa);
    const bisaTopup = b.aktif || b.dana.aktif;
    const metodeAkt = f.metode === 'dana' && b.dana.aktif ? 'dana' : b.aktif ? 'bank' : 'dana';
    const ikutTopup = bisaTopup && f.ikut_topup;
    try {
      const usr = await ctx.first("SELECT * FROM users WHERE username = ? AND role = 'pembeli'", un);
      const cocok = usr && [normNama(usr.nama), normNama(String(usr.nama).split(',')[0])].includes(normNama(f.nama));
      if (!usr || !cocok) throw new UserError('NISN/NIP dan nama lengkap tidak cocok dengan data sekolah. Periksa kembali, atau hubungi Petugas Kantin.');
      if (usr.status === 'aktif') throw new UserError('Akun ini sudah aktif. Silakan masuk. Lupa password? Hubungi Petugas Kantin.');
      if (usr.status !== 'belum') throw new UserError('Akun ini dinonaktifkan. Hubungi Petugas Kantin.');
      if (!wa) throw new UserError('Nomor WhatsApp tidak valid. Contoh: 081234567890.');
      if (!ikutTopup && usr.aktivasi_at && usr.aktivasi_at.slice(0, 10) === today() && normWa(usr.wa) === wa) {
        throw new UserError('Permohonan Anda sudah terkirim hari ini dan sedang diproses petugas.');
      }
      let kode = '';
      if (ikutTopup) {
        const n = intInput(f.nominal);
        if (n < b.min) throw new UserError(`Minimal top up ${rupiah(b.min)}.`);
        if (b.maks && n > b.maks) throw new UserError(`Maksimal saldo ${rupiah(b.maks)}.`);
        if ((await ctx.val("SELECT COUNT(*) FROM topup_req WHERE user_id = ? AND status = 'menunggu'", usr.id)) >= 2) {
          throw new UserError('Masih ada 2 bukti pembayaran yang menunggu verifikasi. Tunggu diproses petugas.');
        }
        const bukti = await simpanGambar(ctx, f.bukti_data, 400_000);
        if (!bukti) throw new UserError('Unggah foto/tangkapan layar bukti pembayaran.');
        do { kode = (metodeAkt === 'dana' ? 'TD-' : 'TB-') + randomCode(6); } while (await ctx.val('SELECT COUNT(*) FROM topup_req WHERE kode = ?', kode));
        await ctx.run('INSERT INTO topup_req (kode, user_id, nominal, metode, bukti, catatan, status, created_at) VALUES (?,?,?,?,?,?,?,?)',
          kode, usr.id, n, metodeAkt, bukti, 'Permohonan aktivasi', 'menunggu', now());
      }
      await ctx.run('UPDATE users SET wa = ?, aktivasi_at = ? WHERE id = ?', wa, now(), usr.id);
      selesai = { nama: usr.nama, wa: tampilWa(wa), kode };
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
    }
  }
  if (selesai) {
    return ctx.bare('Permohonan terkirim', html`
      <div class="result result-ok compact">${icon('check', 40)}<h2>Permohonan terkirim</h2></div>
      <p>Terima kasih, <b>${selesai.nama}</b>. Petugas Kantin akan memverifikasi data Anda dan mengirim <b>password</b> ke WhatsApp <b>${selesai.wa}</b>.</p>
      ${selesai.kode ? html`<p class="notice">Bukti pembayaran <b class="mono">${selesai.kode}</b> sedang diverifikasi. Saldo masuk setelah petugas mencocokkan dengan ${selesai.kode.startsWith('TD-') ? 'riwayat DANA' : 'mutasi rekening'}.</p>`
        : html`<p class="notice">Untuk aktivasi, akun perlu diisi saldo minimal <b>${rupiah(b.min)}</b> — tunai di Petugas Kantin${b.aktif ? ', transfer bank' : ''}${b.dana.aktif ? ', atau DANA' : ''}.</p>`}
      <a class="btn btn-primary btn-block" href="/?p=login">Kembali ke halaman masuk</a>`);
  }
  return ctx.bare('Aktivasi akun', html`
  <div class="auth-hero"><img src="/assets/img/logo-sma.png" alt="" class="auth-logo"><h1>Aktivasi <span>Akun</span></h1>
    <p class="muted small">Untuk siswa/guru yang sudah terdaftar di sekolah tetapi belum aktif.</p></div>
  <form method="post" action="/?p=aktivasi" class="stack">
    ${ctx.csrfField()}
    <label>NISN / NIP<input name="username" required value="${f.username || ''}" inputmode="numeric" autocapitalize="none"></label>
    <label>Nama lengkap (sesuai data sekolah)<input name="nama" required value="${f.nama || ''}"></label>
    <label>Nomor WhatsApp (siswa / orang tua)<input name="wa" required inputmode="tel" value="${f.wa || ''}" placeholder="08xxxxxxxxxx">
      <small class="muted">Password akan dikirim ke nomor ini.</small></label>
    ${b.aktif || b.dana.aktif ? html`<label class="check"><input type="checkbox" name="ikut_topup" value="1" data-toggle="#tb-box"${f.ikut_topup ? ' checked' : ''}> Sekalian isi saldo${b.aktif ? ' via transfer bank' : ''}${b.aktif && b.dana.aktif ? ' /' : ''}${b.dana.aktif ? ' via DANA' : ''}</label>
    <div id="tb-box" class="stack"${f.ikut_topup ? '' : ' hidden'}>
      ${b.aktif && b.dana.aktif ? html`<div class="metode">
        <label class="metode-opt"><input type="radio" name="metode" value="bank" data-toggle-group="akt" data-show="#akt-bank"${f.metode !== 'dana' ? ' checked' : ''}><span>${icon('bank', 18)} <b>${b.bank || 'Bank'}</b></span></label>
        <label class="metode-opt"><input type="radio" name="metode" value="dana" data-toggle-group="akt" data-show="#akt-dana"${f.metode === 'dana' ? ' checked' : ''}><span><b class="dana-logo sm">DANA</b></span></label></div>` : ''}
      ${b.aktif ? html`<div id="akt-bank" data-group="akt"${b.dana.aktif && f.metode === 'dana' ? ' hidden' : ''}>${kartuRekening(b)}</div>` : ''}
      ${b.dana.aktif ? html`<div id="akt-dana" data-group="akt"${b.aktif && f.metode !== 'dana' ? ' hidden' : ''}>${kartuDana(b.dana)}</div>` : ''}
      <label>Nominal yang dibayar (Rp)<input name="nominal" inputmode="numeric" data-rupiah placeholder="min. ${ribuan(b.min)}" value="${f.nominal || ''}"></label>
      <label>Foto / tangkapan layar bukti pembayaran
        <input type="file" accept="image/*" data-resize="1000" data-target="bukti_data"><input type="hidden" name="bukti_data"></label>
    </div>` : html`<p class="hint">Setelah permohonan terkirim, isi saldo minimal <b>${rupiah(b.min)}</b> tunai di Petugas Kantin untuk aktivasi.</p>`}
    <button class="btn btn-primary btn-block btn-lg">${icon('send', 18)} Kirim permohonan</button>
  </form>
  <p class="auth-foot"><a class="link" href="/?p=login">← Kembali ke halaman masuk</a></p>`);
}

/* ======================= ISI SALDO: TUNAI / TRANSFER BANK / DANA (pembeli) ======================= */

const LBL_REQ = { menunggu: ['Menunggu verifikasi', 'warn'], diterima: ['Saldo masuk', 'ok'], ditolak: ['Ditolak', 'bad'], dibatalkan: ['Dibatalkan', 'mute'] };

/** Kode unik 1–199 agar nominal mudah dicocokkan di riwayat DANA / mutasi rekening. */
async function kodeUnik(ctx, metode, nominal) {
  for (let i = 0; i < 30; i++) {
    const u = 1 + Math.floor(Math.random() * 199);
    if (!(await ctx.val("SELECT COUNT(*) FROM topup_req WHERE status = 'menunggu' AND metode = ? AND nominal = ?", metode, nominal + u))) return u;
  }
  return 0;
}

const kartuDana = (d) => html`<div class="dana-card">
  <span class="dana-logo">DANA</span>
  ${d.qr ? html`<img src="${d.qr}" alt="QR DANA" class="dana-qr">` : ''}
  <span class="bank-no mono" data-copy="${d.nomor}">${d.nomor} <button type="button" class="chip copy-btn">Salin</button></span>
  <span class="bank-an">a.n. ${d.nama}</span>
</div>`;

export async function isisaldo(ctx) {
  const u = ctx.user;
  const b = await infoBank(ctx);
  const tersedia = { bank: b.aktif, dana: b.dana.aktif };
  if (ctx.isPost) {
    const f = await ctx.csrf();
    try {
      if (f.aksi === 'buat') {
        const metode = tersedia[f.metode] ? f.metode : null;
        if (!metode) throw new UserError('Metode pembayaran tidak tersedia.');
        const n = intInput(f.nominal);
        if (n < b.min) throw new UserError(`Minimal top up ${rupiah(b.min)}.`);
        if (b.maks && u.saldo + n + 200 > b.maks) throw new UserError(`Saldo maksimal ${rupiah(b.maks)}. Saldo Anda ${rupiah(u.saldo)}.`);
        if ((await ctx.val("SELECT COUNT(*) FROM topup_req WHERE user_id = ? AND status = 'menunggu'", u.id)) >= 2) {
          throw new UserError('Masih ada 2 permintaan top up yang belum selesai. Selesaikan atau batalkan dulu.');
        }
        const uq = await kodeUnik(ctx, metode, n);
        let kode;
        do { kode = (metode === 'dana' ? 'TD-' : 'TB-') + randomCode(6); } while (await ctx.val('SELECT COUNT(*) FROM topup_req WHERE kode = ?', kode));
        await ctx.run('INSERT INTO topup_req (kode, user_id, nominal, kode_unik, metode, bukti, catatan, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
          kode, u.id, n + uq, uq, metode, '', String(f.catatan || '').trim().slice(0, 100), 'menunggu', now());
        return ctx.redirect(url('isisaldo', { kode }));
      }
      const r = await ctx.first("SELECT * FROM topup_req WHERE kode = ? AND user_id = ? AND status = 'menunggu'", String(f.kode || ''), u.id);
      if (!r) throw new UserError('Permintaan tidak ditemukan atau sudah diproses.');
      if (f.aksi === 'bukti') {
        const bukti = await simpanGambar(ctx, f.bukti_data, 400_000);
        if (!bukti) throw new UserError('Pilih foto / tangkapan layar bukti pembayaran.');
        await ctx.run('UPDATE topup_req SET bukti = ? WHERE id = ?', bukti, r.id);
        await hapusGambar(ctx, r.bukti);
        ctx.flash('ok', `Bukti pembayaran <b>${r.kode}</b> terkirim. Saldo bertambah setelah dicek Petugas Kantin.`);
      } else if (f.aksi === 'batal') {
        await ctx.run("UPDATE topup_req SET status = 'dibatalkan', alasan = 'Dibatalkan sendiri', diproses_at = ? WHERE id = ? AND status = 'menunggu'", now(), r.id);
        await hapusGambar(ctx, r.bukti);
        ctx.flash('ok', 'Permintaan top up dibatalkan.');
        return ctx.redirect(url('isisaldo'));
      }
      return ctx.redirect(url('isisaldo', { kode: r.kode }));
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
      return ctx.redirect(url('isisaldo', f.kode ? { kode: f.kode } : {}));
    }
  }

  /* ---- Halaman pembayaran satu permintaan ---- */
  if (ctx.q.kode) {
    const r = await ctx.first('SELECT * FROM topup_req WHERE kode = ? AND user_id = ?', String(ctx.q.kode), u.id);
    if (!r) return ctx.redirect(url('isisaldo'));
    const dana = r.metode === 'dana';
    const bayar = html`<div class="pay-amount"><span>Bayar <b>TEPAT</b></span><strong data-copy="${r.nominal}">${rupiah(r.nominal)} <button type="button" class="chip copy-btn">Salin</button></strong>
      ${r.kode_unik ? html`<small>termasuk kode unik ${rupiah(r.kode_unik)} — ikut masuk ke saldo Anda</small>` : ''}</div>`;
    return ctx.page('Bayar top up', html`
<h1 class="page-title">${dana ? 'Bayar dengan DANA' : 'Bayar dengan transfer bank'}</h1>
<section class="card stack pay-card ${dana ? 'is-dana' : ''}">
  <div class="row-between"><span class="mono">${r.kode}</span><span class="badge badge-${LBL_REQ[r.status][1]}">${LBL_REQ[r.status][0]}</span></div>
  ${r.status === 'menunggu' ? html`
    ${bayar}
    ${dana ? html`<ol class="small steps">
        <li>Buka aplikasi <b>DANA</b> → <b>Pindai</b> QR di bawah (atau Kirim ke nomor DANA).</li>
        <li>Masukkan nominal <b>tepat ${rupiah(r.nominal)}</b>, lalu bayar.</li>
        <li>Ambil tangkapan layar tanda berhasil, unggah di bawah.</li></ol>${kartuDana(b.dana)}`
      : html`<ol class="small steps"><li>Transfer <b>tepat ${rupiah(r.nominal)}</b> ke rekening berikut.</li><li>Unggah foto / tangkapan layar bukti transfer di bawah.</li></ol>${kartuRekening(b)}`}
    <form method="post" action="/?p=isisaldo" class="stack">
      ${ctx.csrfField()}<input type="hidden" name="aksi" value="bukti"><input type="hidden" name="kode" value="${r.kode}">
      <label>${r.bukti ? 'Ganti bukti pembayaran' : 'Unggah bukti pembayaran'}
        <input type="file" accept="image/*" required data-resize="1000" data-target="bukti_data"><input type="hidden" name="bukti_data"></label>
      ${r.bukti ? html`<img src="${r.bukti}" alt="Bukti" class="bukti-img">` : ''}
      <button class="btn btn-primary btn-lg btn-block">${icon('send', 18)} ${r.bukti ? 'Kirim ulang bukti' : 'Saya sudah bayar — kirim bukti'}</button>
    </form>
    <form method="post" action="/?p=isisaldo" data-confirm="Batalkan permintaan top up ini? Jangan batalkan jika Anda sudah membayar.">
      ${ctx.csrfField()}<input type="hidden" name="aksi" value="batal"><input type="hidden" name="kode" value="${r.kode}">
      <button class="btn btn-ghost btn-block danger">Batalkan (belum membayar)</button>
    </form>
    <p class="hint">Saldo masuk setelah Petugas Kantin mencocokkan pembayaran di ${dana ? 'riwayat DANA' : 'mutasi rekening'}. Nominal yang tepat mempercepat pengecekan.</p>`
    : html`<p class="big center">${rupiah(r.nominal)}</p>${r.alasan ? html`<p class="small muted center">${r.alasan}</p>` : ''}`}
</section>`, { back: url('isisaldo') });
  }

  /* ---- Halaman utama isi saldo ---- */
  const list = await ctx.all('SELECT * FROM topup_req WHERE user_id = ? ORDER BY id DESC LIMIT 15', u.id);
  const pilihan = Object.keys(METODE).filter((m) => tersedia[m]);
  return ctx.page('Isi saldo', html`
<h1 class="page-title">Isi saldo</h1>
<section class="card stack">
  <h3>${icon('cash', 18)} Tunai</h3>
  <p class="small">Datang ke <b>Petugas Kantin</b> dengan uang tunai, sebutkan NISN Anda. Saldo langsung masuk.</p>
</section>
${pilihan.length ? html`<section class="card stack">
  <h3>${icon('send', 18)} Non-tunai</h3>
  <form method="post" action="/?p=isisaldo" class="stack">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="buat">
    <div class="metode">${pilihan.map((m, i) => html`<label class="metode-opt metode-${m}"><input type="radio" name="metode" value="${m}"${i === 0 ? ' checked' : ''}>
      <span>${m === 'dana' ? html`<b class="dana-logo sm">DANA</b>` : html`${icon('bank', 18)} <b>${b.bank || 'Transfer bank'}</b>`}</span></label>`)}</div>
    <label>Nominal top up (Rp)<input name="nominal" inputmode="numeric" data-rupiah required class="input-xl" placeholder="0"></label>
    <div class="quick-amounts">${[10000, 20000, 50000, 100000].filter((x) => x >= b.min).map((x) => html`<button type="button" class="chip" data-amount="${x}">${rupiah(x)}</button>`)}</div>
    <p class="hint">Minimal ${rupiah(b.min)}. Sistem menambahkan <b>kode unik</b> beberapa rupiah agar pembayaran Anda mudah dikenali — kode unik ikut masuk ke saldo.</p>
    <button class="btn btn-primary btn-lg btn-block">Lanjut ke pembayaran</button>
  </form>
</section>` : html`<p class="hint">Pembayaran non-tunai belum dibuka oleh Admin.</p>`}
${list.length ? html`<section><h2 class="sec-title">Riwayat top up non-tunai</h2><div class="list">${list.map((r) => html`
  <a class="list-item" href="${url('isisaldo', { kode: r.kode })}">
    <span class="li-ic ${r.status === 'diterima' ? 'ok' : r.status === 'menunggu' ? 'warn' : 'bad'}">${r.metode === 'dana' ? html`<b class="dana-mini">D</b>` : icon('bank', 18)}</span>
    <span class="li-main"><b class="mono">${r.kode}</b><small>${METODE[r.metode] || r.metode} · ${tgl(r.created_at)}${r.status === 'menunggu' && !r.bukti ? ' · belum unggah bukti' : ''}${r.alasan ? ' · ' + r.alasan : ''}</small></span>
    <span class="li-end">${rupiah(r.nominal)}<small><span class="badge badge-${LBL_REQ[r.status][1]}">${LBL_REQ[r.status][0]}</span></small></span>
  </a>`)}</div></section>` : ''}`, { back: url('beranda') });
}

/* ======================= VERIFIKASI (petugas & admin) ======================= */
function pesanWa(ctx, usr, pw, saldo, aktivasi) {
  const origin = new URL(ctx.req.url).origin;
  return `Assalamu'alaikum, ${usr.nama}.\n` +
    (aktivasi ? `Akun ${APP_NAME} Anda sudah AKTIF.\n` : `Top up saldo ${APP_NAME} Anda sudah diterima.\n`) +
    `\nUsername (NISN/NIP): ${usr.username}\n` + (pw ? `Password: ${pw}\n` : '') + `Saldo: ${rupiah(saldo)}\n` +
    `\nMasuk di: ${origin}\n` + (pw ? 'Segera ganti password di menu Akun dan jangan bagikan ke siapa pun.\n' : '') + '\nPetugas Kantin SMAN 1 Purwoasri';
}

export async function verifikasi(ctx) {
  const me = ctx.user;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const id = parseInt(f.id, 10) || 0;
    try {
      if (f.aksi === 'terima') {
        const { req, user, aktivasi: akt } = await terimaTopupBank(ctx, id, me.id);
        const pw = f.kirim_pw ? randomPassword() : null;
        if (pw) await ctx.run('UPDATE users SET password = ? WHERE id = ?', await hashPassword(pw, ctx.env), user.id);
        const saldo = await ctx.val('SELECT saldo FROM users WHERE id = ?', user.id);
        ctx.flash('ok', `${akt ? 'Akun <b>' + esc(user.nama) + '</b> diaktifkan dan saldo' : 'Saldo <b>' + esc(user.nama) + '</b>'} bertambah <b>${rupiah(req.nominal)}</b> (${req.kode}).` +
          (pw ? ` Password baru: <b class="mono big">${pw}</b>.` : '') +
          (user.wa ? ` <a class="btn btn-sm wa-btn" target="_blank" rel="noopener" href="${esc(waLink(user.wa, pesanWa(ctx, user, pw, saldo, akt)))}">${icon('wa', 14)} Kirim via WhatsApp</a>`
            : ' (Nomor WA belum ada — sampaikan langsung.)'));
      } else if (f.aksi === 'tolak') {
        const alasan = String(f.alasan || '').trim().slice(0, 120) || 'Bukti transfer tidak sesuai';
        const n = await ctx.run("UPDATE topup_req SET status = 'ditolak', alasan = ?, diproses_oleh = ?, diproses_at = ? WHERE id = ? AND status = 'menunggu'",
          alasan, me.id, now(), id);
        const r = await ctx.first('SELECT t.*, u.nama, u.wa FROM topup_req t JOIN users u ON u.id = t.user_id WHERE t.id = ?', id);
        ctx.flash(n ? 'ok' : 'err', n ? `Bukti ${esc(r.kode)} ditolak. Saldo tidak berubah.` +
          (r.wa ? ` <a class="btn btn-sm wa-btn" target="_blank" rel="noopener" href="${esc(waLink(r.wa, `Assalamu'alaikum, ${r.nama}.\nBukti top up ${r.kode} sebesar ${rupiah(r.nominal)} BELUM dapat diterima: ${alasan}.\nSilakan hubungi Petugas Kantin.`))}">${icon('wa', 14)} Kabari via WhatsApp</a>` : '')
          : 'Permintaan sudah diproses sebelumnya.');
      } else if (f.aksi === 'abaikan') {
        await ctx.run("UPDATE users SET aktivasi_at = NULL WHERE id = ? AND status = 'belum'", id);
        ctx.flash('ok', 'Permohonan aktivasi dihapus dari daftar.');
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
    }
    return ctx.redirect(url('verifikasi'));
  }

  const b = await infoBank(ctx);
  const reqs = await ctx.all(`SELECT t.*, u.nama, u.username, u.kelas, u.jenis, u.status AS ustatus, u.foto, u.wa, u.saldo
      FROM topup_req t JOIN users u ON u.id = t.user_id WHERE t.status = 'menunggu' ORDER BY t.id`);
  const akt = await ctx.all(`SELECT * FROM users WHERE role = 'pembeli' AND status = 'belum' AND aktivasi_at IS NOT NULL
      AND id NOT IN (SELECT user_id FROM topup_req WHERE status = 'menunggu') ORDER BY aktivasi_at`);
  const riwayat = await ctx.all(`SELECT t.*, u.nama FROM topup_req t JOIN users u ON u.id = t.user_id WHERE t.status <> 'menunggu' ORDER BY t.diproses_at DESC LIMIT 15`);
  return ctx.page('Verifikasi', html`
<h1 class="page-title">Verifikasi top up &amp; aktivasi</h1>
<section>
  <h2 class="sec-title">Top up non-tunai menunggu <span class="count">${reqs.length}</span></h2>
  <p class="hint">Sebelum menekan Terima, cocokkan <b>nominal tepat</b> (termasuk kode unik) &amp; waktu dengan
    ${b.norek ? html`<b>mutasi rekening ${b.bank} ${b.norek}</b>` : ''}${b.norek && b.dana.nomor ? ' atau ' : ''}${b.dana.nomor ? html`<b>riwayat transaksi DANA ${b.dana.nomor}</b>` : ''}.
    Bukti gambar bisa dipalsukan — yang menentukan adalah uang yang benar-benar masuk.</p>
  ${!reqs.length ? html`<div class="card empty"><p>Tidak ada top up non-tunai yang menunggu.</p></div>` : ''}
  <div class="kantin-cair">${reqs.map((r) => html`
    <div class="card req-card">
      <div class="row-between"><span class="who">${avatar(r, 'md')}<span><b>${r.nama}</b><br><small class="muted">${r.username} · ${r.kelas || ucfirst(r.jenis)}</small></span></span>
        <span class="stack-r">${r.metode === 'dana' ? html`<b class="dana-logo sm">DANA</b>` : html`<span class="badge badge-mute">${icon('bank', 12)} Bank</span>`}<span class="mono small">${r.kode}</span></span></div>
      ${r.bukti ? html`<a href="${r.bukti}" target="_blank" rel="noopener"><img src="${r.bukti}" alt="Bukti ${r.kode}" class="bukti-img" loading="lazy"></a>`
        : html`<p class="potong-note">Belum mengunggah bukti. Tetap bisa diterima jika nominal <b>${rupiah(r.nominal)}</b> sudah tercatat masuk.</p>`}
      <div class="row-between"><span class="small muted">${tgl(r.created_at)}${r.catatan ? ' · ' + r.catatan : ''}</span>
        <span class="right"><b class="big">${rupiah(r.nominal)}</b>${r.kode_unik ? html`<br><small class="muted">kode unik ${r.kode_unik}</small>` : ''}</span></div>
      ${r.ustatus === 'belum' ? html`<p class="potong-note">Akun <b>belum aktif</b> — akan otomatis diaktifkan.${r.wa ? html` WA: <b>${tampilWa(r.wa)}</b>` : ''}</p>` : ''}
      <form method="post" action="/?p=verifikasi" class="stack" data-confirm="Nominal ${rupiah(r.nominal)} sudah masuk ke ${r.metode === 'dana' ? 'DANA' : 'rekening'}? Saldo ${r.nama} akan ditambah.">
        ${ctx.csrfField()}<input type="hidden" name="aksi" value="terima"><input type="hidden" name="id" value="${r.id}">
        <label class="check"><input type="checkbox" name="kirim_pw" value="1"${r.ustatus === 'belum' ? ' checked' : ''}> Buat password baru (untuk dikirim via WhatsApp)</label>
        <button class="btn btn-primary btn-block">${icon('check', 16)} Terima &amp; tambah saldo</button>
      </form>
      <details><summary class="small">Tolak bukti ini</summary>
        <form method="post" action="/?p=verifikasi" class="row gap" data-confirm="Tolak bukti transfer ini?">
          ${ctx.csrfField()}<input type="hidden" name="aksi" value="tolak"><input type="hidden" name="id" value="${r.id}">
          <input name="alasan" class="grow" placeholder="Alasan, mis. dana belum masuk"><button class="btn danger">Tolak</button>
        </form></details>
    </div>`)}</div>
</section>
<section>
  <h2 class="sec-title">Permohonan aktivasi (tanpa transfer) <span class="count">${akt.length}</span></h2>
  <p class="hint">Mereka perlu mengisi saldo minimal ${rupiah(b.min)} tunai. Kabari via WhatsApp, lalu proses di menu <b>Top Up</b> saat mereka datang.</p>
  ${!akt.length ? html`<div class="card empty"><p>Tidak ada permohonan aktivasi.</p></div>` : html`<div class="list">${akt.map((a) => html`
    <div class="list-item">
      ${avatar(a, 'sm')}
      <span class="li-main"><b>${a.nama}</b><small>${a.username} · ${a.kelas || ucfirst(a.jenis)} · WA ${tampilWa(a.wa)} · ${tgl(a.aktivasi_at)}</small></span>
      <span class="row gap">
        ${a.wa ? html`<a class="btn btn-sm wa-btn" target="_blank" rel="noopener" href="${waLink(a.wa, `Assalamu'alaikum, ${a.nama}.\nPermohonan aktivasi ${APP_NAME} sudah kami terima. Silakan datang ke Petugas Kantin dengan uang tunai minimal ${rupiah(b.min)} untuk aktivasi${b.aktif ? `, atau transfer ke ${b.bank} ${b.norek} a.n. ${b.an}` : ''}${b.dana.aktif ? `${b.aktif ? ' /' : ', atau'} kirim lewat DANA ${b.dana.nomor} a.n. ${b.dana.nama}` : ''}${b.aktif || b.dana.aktif ? ' lalu kirim buktinya lewat halaman aktivasi' : ''}.\nTerima kasih.`)}">${icon('wa', 14)} WA</a>` : ''}
        <a class="btn btn-sm" href="${url('topup', { id: a.id })}">${icon('wallet', 14)} Top up</a>
        <form method="post" action="/?p=verifikasi" class="inline" data-confirm="Hapus permohonan ${a.nama} dari daftar?">${ctx.csrfField()}
          <input type="hidden" name="aksi" value="abaikan"><input type="hidden" name="id" value="${a.id}"><button class="btn btn-sm danger">${icon('x', 14)}</button></form>
      </span>
    </div>`)}</div>`}
</section>
${riwayat.length ? html`<section class="card"><h3>Riwayat verifikasi</h3><table class="table">
  <thead><tr><th>Waktu</th><th>Kode</th><th>Nama</th><th class="num">Nominal</th><th>Status</th></tr></thead>
  <tbody>${riwayat.map((r) => html`<tr><td class="small">${tgl(r.diproses_at)}</td><td class="mono small">${r.bukti ? html`<a class="link" href="${r.bukti}" target="_blank" rel="noopener">${r.kode}</a>` : r.kode}</td>
    <td>${r.nama}<br><small class="muted">${METODE[r.metode] || r.metode}</small></td><td class="num">${rupiah(r.nominal)}</td><td><span class="badge badge-${LBL_REQ[r.status][1]}">${r.status === 'diterima' ? 'Diterima' : LBL_REQ[r.status][0]}</span>${r.alasan ? html`<br><small class="muted">${r.alasan}</small>` : ''}</td></tr>`)}</tbody>
</table></section>` : ''}`);
}
