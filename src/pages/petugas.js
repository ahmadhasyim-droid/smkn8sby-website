import { html, raw, url, rupiah, ribuan, icon, tgl, now, today, addDays, intInput, menuIcon, statusBadge, jenisLabel,
  randomPassword, hashPassword, esc, ucfirst, avatar, normWa, tampilWa, waLink, APP_NAME, UserError } from '../core.js';
import { creditStmts, debit, prosesPenarikan, batalkanPesanan, namaPihak, cairkanKantin, persenPotongan, hitungPotongan } from '../money.js';
import { simpanGambar, hapusGambar } from '../media.js';

const KAT = { makanan: 'Makanan', snack: 'Snack', minuman: 'Minuman', lainnya: 'Lainnya' };
const badgeStatus = (s) => s === 'aktif' ? html`<span class="badge badge-ok">Aktif</span>`
  : s === 'belum' ? html`<span class="badge badge-warn">Belum registrasi</span>` : html`<span class="badge badge-mute">Nonaktif</span>`;

/** Simpan/hapus foto profil pengguna dari formulir petugas. */
async function simpanFotoUser(ctx, id, f) {
  const lama = await ctx.val('SELECT foto FROM users WHERE id = ?', id);
  const baru = await simpanGambar(ctx, f.foto_data, 200_000);
  if (baru || f.hapus_foto) {
    await ctx.run('UPDATE users SET foto = ? WHERE id = ?', baru || '', id);
    await hapusGambar(ctx, lama);
  }
}

/* ================= Beranda ================= */
export async function petugasBeranda(ctx) {
  const h = today(), b = addDays(h, 1);
  const kas = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis IN ('topup','tarik','pencairan','potongan')");
  const pendapatan = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis = 'potongan'");
  const bank = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis = 'topup_bank'");
  const dana = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis = 'topup_dana'");
  const nVer = await ctx.val("SELECT COUNT(*) FROM topup_req WHERE status = 'menunggu'");
  const nAkt = await ctx.val("SELECT COUNT(*) FROM users WHERE role = 'pembeli' AND status = 'belum' AND aktivasi_at IS NOT NULL");
  const koreksi = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis = 'koreksi'");
  const saldoPembeli = await ctx.val("SELECT COALESCE(SUM(saldo),0) FROM users WHERE role = 'pembeli'");
  const saldoKantin = await ctx.val('SELECT COALESCE(SUM(saldo),0) FROM kantin');
  const tertahan = await ctx.val("SELECT COALESCE(SUM(subtotal),0) FROM pesanan WHERE status = 'menunggu'");
  const cocok = kas + bank + dana + koreksi === saldoPembeli + saldoKantin + tertahan + pendapatan;
  const topupHari = await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis = 'topup' AND created_at >= ? AND created_at < ?", h, b);
  const cairHari = Math.abs(await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM mutasi WHERE jenis IN ('pencairan','tarik') AND created_at >= ? AND created_at < ?", h, b));
  const kantins = await ctx.all(`SELECT k.id, k.nama, k.warna, k.saldo,
      (SELECT COALESCE(SUM(subtotal),0) FROM pesanan ps WHERE ps.kantin_id = k.id AND ps.status = 'selesai' AND ps.diproses_at >= ? AND ps.diproses_at < ?) AS jual,
      (SELECT COUNT(*) FROM pesanan ps WHERE ps.kantin_id = k.id AND ps.status = 'menunggu') AS antre
    FROM kantin k ORDER BY k.urutan, k.id`, h, b);
  const pg = await ctx.first(`SELECT SUM(CASE WHEN status='aktif' THEN 1 ELSE 0 END) AS aktif, SUM(CASE WHEN status='belum' THEN 1 ELSE 0 END) AS belum
                              FROM users WHERE role = 'pembeli'`);
  const nReq = await ctx.first("SELECT COUNT(*) AS n, COALESCE(SUM(nominal),0) AS total FROM penarikan WHERE status = 'menunggu'");
  return ctx.page('Beranda petugas', html`
${nReq.n > 0 ? html`<a class="notice row-between" href="${url('cairkan')}">
  <span>${icon('cash', 18)} <b>${nReq.n} permintaan pencairan tunai</b> menunggu (${rupiah(nReq.total)})</span><b class="link">Proses →</b></a>` : ''}
${nVer + nAkt > 0 ? html`<a class="notice row-between" href="${url('verifikasi')}">
  <span>${icon('shield', 18)} <b>${nVer} top up non-tunai</b> &amp; <b>${nAkt} permohonan aktivasi</b> menunggu</span><b class="link">Periksa →</b></a>` : ''}
<div class="row-between"><h1 class="page-title">Ringkasan hari ini</h1><span class="muted">${tgl(now(), false)}</span></div>
<div class="quick">
  <a href="${url('topup')}" class="quick-btn q-red">${icon('wallet', 26)}<span>Top up / Registrasi</span></a>
  <a href="${url('cairkan')}" class="quick-btn q-green">${icon('cash', 26)}<span>Pencairan tunai</span></a>
  <a href="${url('menu')}" class="quick-btn q-yellow">${icon('list', 26)}<span>Kelola menu</span></a>
  ${ctx.user.role === 'admin' ? html`<a href="${url('pengguna')}" class="quick-btn q-navy">${icon('users', 26)}<span>Data siswa &amp; guru</span></a>`
    : html`<a href="${url('pesanan')}" class="quick-btn q-navy">${icon('receipt', 26)}<span>Pesanan</span></a>`}
</div>
<div class="stats stats-4">
  <div class="stat stat-hero"><span>Uang tunai di petugas</span><b>${rupiah(kas)}</b><small>Top up − tarik tunai − pencairan bersih</small></div>
  <div class="stat"><span>Top up hari ini</span><b>${rupiah(topupHari)}</b></div>
  <div class="stat"><span>Dicairkan hari ini</span><b>${rupiah(cairHari)}</b></div>
  <div class="stat"><span>Pembeli aktif / belum registrasi</span><b>${pg.aktif || 0} / ${pg.belum || 0}</b></div>
</div>
<section class="card">
  <h3>Posisi saldo digital</h3>
  <table class="table">
    <tr><td>Total saldo pembeli</td><td class="num">${rupiah(saldoPembeli)}</td></tr>
    <tr><td>Pesanan belum diambil (dana tertahan)</td><td class="num">${rupiah(tertahan)}</td></tr>
    <tr><td>Saldo kantin belum dicairkan</td><td class="num">${rupiah(saldoKantin)}</td></tr>
    <tr><td>Pendapatan potongan pencairan kantin (milik sekolah)</td><td class="num">${rupiah(pendapatan)}</td></tr>
    <tr class="sub"><td>Jumlah</td><td class="num">${rupiah(saldoPembeli + tertahan + saldoKantin + pendapatan)}</td></tr>
    <tr><td>Uang tunai di petugas</td><td class="num">${rupiah(kas)}</td></tr>
    <tr><td>Uang masuk via transfer bank (di rekening kantin)</td><td class="num">${rupiah(bank)}</td></tr>
    <tr><td>Uang masuk via DANA (di akun DANA petugas)</td><td class="num">${rupiah(dana)}</td></tr>
    <tr class="sub"><td>Tunai + rekening + DANA (harus sama dengan Jumlah)</td><td class="num">${rupiah(kas + bank + dana)}</td></tr>
  </table>
  <p class="${cocok ? 'txt-ok' : 'txt-bad'}"><b>${cocok ? '✓ Seimbang — uang tunai + rekening + DANA cocok dengan saldo digital.' : '⚠ Tidak seimbang — periksa laporan transaksi.'}</b></p>
</section>
<section class="card">
  <h3>Kantin</h3>
  <table class="table">
    <thead><tr><th>Kantin</th><th class="num">Terjual hari ini</th><th class="num">Antre</th><th class="num">Saldo</th><th></th></tr></thead>
    <tbody>${kantins.map((k) => html`<tr>
      <td><span class="dot" style="background: ${k.warna}"></span>${k.nama}</td>
      <td class="num">${rupiah(k.jual)}</td><td class="num">${k.antre}</td><td class="num"><b>${rupiah(k.saldo)}</b></td>
      <td class="num">${k.saldo > 0 ? html`<a class="btn btn-sm" href="${url('cairkan', { kantin: k.id })}">Cairkan</a>` : ''}</td>
    </tr>`)}</tbody>
  </table>
</section>`);
}

/* ================= Top up & tarik tunai ================= */
export async function topup(ctx) {
  const me = ctx.user;
  const min = parseInt(await ctx.setting('min_topup', 0), 10) || 0;
  const maks = parseInt(await ctx.setting('maks_saldo', 0), 10) || 0;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const id = parseInt(f.id, 10) || 0;
    const jenis = f.jenis === 'tarik' ? 'tarik' : 'topup';
    const n = intInput(f.nominal);
    const target = await ctx.first("SELECT * FROM users WHERE id = ? AND role = 'pembeli'", id);
    try {
      if (!target) throw new UserError('Pengguna tidak ditemukan.');
      if (target.status === 'nonaktif') throw new UserError('Akun ini dinonaktifkan. Aktifkan dulu di menu Pengguna.');
      if (n <= 0) throw new UserError('Nominal belum diisi.');
      if (jenis === 'topup' && n < min) throw new UserError('Minimal top up ' + rupiah(min) + '.');
      if (jenis === 'topup' && maks > 0 && target.saldo + n > maks) throw new UserError(`Saldo maksimal ${rupiah(maks)}. Saldo saat ini ${rupiah(target.saldo)}.`);
      const pwBaru = f.reset_pw ? randomPassword() : null;
      const ref = 'TU-' + Date.now().toString(36).toUpperCase();
      let aktivasi = false;
      if (jenis === 'topup') {
        aktivasi = target.status === 'belum';
        const st = [];
        if (aktivasi) st.push(ctx.st("UPDATE users SET status = 'aktif', aktivasi_at = NULL WHERE id = ?", id));
        st.push(...creditStmts(ctx, 'user', id, n, 'topup', ref, aktivasi ? 'Registrasi & top up tunai' : 'Top up tunai di petugas', me.id));
        await ctx.batch(st);
      } else if (!(await debit(ctx, 'user', id, n, 'tarik', 'Tarik tunai di petugas', me.id, 'TT'))) {
        throw new UserError('Saldo tidak cukup untuk ditarik.');
      }
      if (pwBaru) await ctx.run('UPDATE users SET password = ? WHERE id = ?', await hashPassword(pwBaru, ctx.env), id);
      ctx.sess.receipt = {
        jenis, nominal: n, ref, aktivasi, nama: target.nama, username: target.username, kelas: target.kelas,
        saldo: await ctx.val('SELECT saldo FROM users WHERE id = ?', id), password: pwBaru, waktu: now(), petugas: me.nama, wa: target.wa,
      };
      return ctx.redirect(url('topup'));
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
      return ctx.redirect(url('topup', { id }));
    }
  }

  const rc = ctx.sess.receipt;
  delete ctx.sess.receipt;
  const cari = String(ctx.q.cari || '').trim();
  let sel = ctx.q.id ? await ctx.first("SELECT * FROM users WHERE id = ? AND role = 'pembeli'", parseInt(ctx.q.id, 10) || 0) : null;
  let hasil = [];
  if (cari) {
    const like = `%${cari}%`;
    hasil = await ctx.all("SELECT * FROM users WHERE role = 'pembeli' AND (username LIKE ? OR nama LIKE ? OR kelas LIKE ?) ORDER BY nama LIMIT 30", like, like, like);
    if (hasil.length === 1 && !sel) sel = hasil[0];
  }
  return ctx.page('Top up', html`
<h1 class="page-title">Top up &amp; registrasi saldo</h1>
${rc ? html`<section class="card receipt print-area">
  <div class="result result-ok compact">${icon('check', 36)}<h2>${rc.jenis === 'topup' ? (rc.aktivasi ? 'Registrasi & top up berhasil' : 'Top up berhasil') : 'Tarik tunai berhasil'}</h2></div>
  <table class="table">
    <tr><td>Nama</td><td class="num"><b>${rc.nama}</b>${rc.kelas ? ` (${rc.kelas})` : ''}</td></tr>
    <tr><td>NISN / Username</td><td class="num mono">${rc.username}</td></tr>
    ${rc.password ? html`<tr><td>Password baru</td><td class="num mono big">${rc.password}</td></tr>` : ''}
    <tr><td>${rc.jenis === 'topup' ? 'Uang diterima' : 'Uang diserahkan'}</td><td class="num big">${rupiah(rc.nominal)}</td></tr>
    <tr><td>Saldo sekarang</td><td class="num"><b>${rupiah(rc.saldo)}</b></td></tr>
    <tr><td>Waktu · Ref</td><td class="num small">${tgl(rc.waktu)} · ${rc.ref}</td></tr>
    <tr><td>Petugas</td><td class="num">${rc.petugas}</td></tr>
  </table>
  ${rc.password ? html`<p class="hint">Catat/berikan password ini ke pembeli. Password tidak bisa dilihat lagi setelah halaman ini ditutup.</p>` : ''}
  <div class="row gap no-print">
    <button class="btn" onclick="window.print()">${icon('printer', 16)} Cetak bukti</button>
    ${rc.wa ? html`<a class="btn wa-btn" target="_blank" rel="noopener" href="${waLink(rc.wa, `Assalamu'alaikum, ${rc.nama}.\n` +
      (rc.aktivasi ? `Akun ${APP_NAME} Anda sudah AKTIF.\n` : rc.jenis === 'topup' ? `Top up ${rupiah(rc.nominal)} berhasil.\n` : `Tarik tunai ${rupiah(rc.nominal)} berhasil.\n`) +
      `\nUsername (NISN/NIP): ${rc.username}\n` + (rc.password ? `Password: ${rc.password}\n` : '') + `Saldo: ${rupiah(rc.saldo)}\n` +
      `\nMasuk di: ${new URL(ctx.req.url).origin}\n` + (rc.password ? 'Segera ganti password di menu Akun.\n' : '') + '\nPetugas Kantin SMAN 1 Purwoasri')}">${icon('wa', 16)} Kirim via WhatsApp</a>` : ''}
    <a class="btn btn-primary" href="${url('topup')}">Transaksi berikutnya</a>
  </div>
</section>` : ''}
<form method="get" action="/" class="searchbar">
  <input type="hidden" name="p" value="topup">${icon('search', 18)}
  <input name="cari" value="${cari}" placeholder="Cari NISN / NIP / nama / kelas" autofocus>
  <button class="btn btn-primary">Cari</button>
</form>
${cari && !hasil.length ? html`<div class="card empty"><p>Tidak ada pembeli dengan kata kunci "${cari}".</p>${me.role === 'admin' ? html`<a class="btn" href="${url('pengguna', { tambah: 1 })}">Tambah pengguna baru</a>` : html`<p class="small">Minta Admin menambahkan data pengguna ini.</p>`}</div>` : ''}
${hasil.length > 1 ? html`<div class="list">${hasil.map((h) => html`
  <a class="list-item${sel && sel.id === h.id ? ' active' : ''}" href="${url('topup', { cari, id: h.id })}">
    ${avatar(h, 'sm')}
    <span class="li-main"><b>${h.nama}</b><small>${h.username} · ${h.kelas || ucfirst(h.jenis)}</small></span>
    <span class="li-end">${rupiah(h.saldo)}<small>${h.status === 'belum' ? 'Belum registrasi' : ucfirst(h.status)}</small></span>
  </a>`)}</div>` : ''}
${sel ? html`<section class="card topup-card">
  <div class="row-between">
    <div class="who">${avatar(sel, 'lg')}<div><h2>${sel.nama}</h2><p class="muted"><span class="mono">${sel.username}</span> · ${ucfirst(sel.jenis || 'pembeli')}${sel.kelas ? ' · ' + sel.kelas : ''}</p></div></div>
    <div class="right"><small class="muted">Saldo</small><br><b class="big">${rupiah(sel.saldo)}</b><br>${badgeStatus(sel.status)}</div>
  </div>
  ${sel.status === 'belum' ? html`<p class="notice">Akun belum diregistrasi. Top up minimal <b>${rupiah(min)}</b> sekaligus mengaktifkan akun agar bisa login.</p>` : ''}
  <form method="post" class="stack" data-confirm-topup>
    ${ctx.csrfField()}<input type="hidden" name="id" value="${sel.id}">
    <div class="seg seg-form">
      <label><input type="radio" name="jenis" value="topup" checked> Top up (terima tunai)</label>
      <label><input type="radio" name="jenis" value="tarik"${sel.saldo > 0 ? '' : ' disabled'}> Tarik tunai</label>
    </div>
    <label>Nominal (Rp)<input name="nominal" inputmode="numeric" required class="input-xl" data-rupiah placeholder="0" autocomplete="off"></label>
    <div class="quick-amounts">${[5000, 10000, 20000, 50000, 100000].filter((q) => q >= min).map((q) => html`<button type="button" class="chip" data-amount="${q}">${rupiah(q)}</button>`)}</div>
    <label class="check"><input type="checkbox" name="reset_pw" value="1"> Buat password baru &amp; tampilkan (jika pembeli lupa / belum tahu passwordnya)</label>
    <button class="btn btn-primary btn-lg btn-block">${icon('check', 18)} Proses</button>
  </form>
</section>` : ''}`);
}

/* ================= Pencairan ================= */
export async function cairkan(ctx) {
  const me = ctx.user;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    try {
      if (f.aksi === 'proses_req') {
        ctx.flash('ok', 'Pencairan berhasil. ' + await prosesPenarikan(ctx, parseInt(f.id, 10) || 0, me.id));
      } else if (f.aksi === 'tolak_req') {
        const alasan = String(f.alasan || '').trim().slice(0, 150) || 'Ditolak petugas';
        const n = await ctx.run("UPDATE penarikan SET status = 'ditolak', catatan = ?, diproses_oleh = ?, diproses_at = ? WHERE id = ? AND status = 'menunggu'",
          alasan, me.id, now(), parseInt(f.id, 10) || 0);
        ctx.flash(n ? 'ok' : 'err', n ? 'Permintaan ditolak. Saldo tidak berubah.' : 'Permintaan sudah diproses sebelumnya.');
      } else {
        const kid = parseInt(f.kantin_id, 10) || 0;
        const n = intInput(f.nominal);
        const k = await ctx.first('SELECT * FROM kantin WHERE id = ?', kid);
        if (!k) throw new UserError('Kantin tidak ditemukan.');
        if (n <= 0) throw new UserError('Nominal belum diisi.');
        const hasil = await cairkanKantin(ctx, k, n, me.id, me.nama);
        if (!hasil) throw new UserError('Saldo kantin tidak cukup.');
        ctx.flash('ok', `Pencairan ${esc(k.nama)} berhasil. Serahkan uang tunai <b>${rupiah(hasil.diterima)}</b>` +
          (hasil.potong ? ` (saldo kantin dikurangi ${rupiah(n)}, potongan ${String(hasil.pct).replace('.', ',')}% = ${rupiah(hasil.potong)}).` : '.'));
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', e.message);
    }
    return ctx.redirect(url('cairkan'));
  }

  let kodeCari = String(ctx.q.kode || '').trim().toUpperCase();
  const mm = kodeCari.match(/TR-[A-Z0-9]{8}/);
  if (mm) kodeCari = mm[0];
  const fokus = kodeCari ? await ctx.first('SELECT * FROM penarikan WHERE kode = ?', kodeCari) : null;
  if (kodeCari && !fokus) ctx.flash('err', `Kode permintaan <b>${esc(kodeCari)}</b> tidak ditemukan.`);
  const reqs = await ctx.all("SELECT * FROM penarikan WHERE status = 'menunggu' ORDER BY id");
  const pct = await persenPotongan(ctx);
  const pctTxt = String(pct).replace('.', ',') + '%';
  const kantins = await ctx.all('SELECT * FROM kantin ORDER BY urutan, id');
  const pilih = parseInt(ctx.q.kantin, 10) || 0;
  const riwayat = await ctx.all("SELECT * FROM mutasi WHERE jenis IN ('pencairan','tarik') ORDER BY id DESC LIMIT 30");
  const potRef = {};
  if (riwayat.length) {
    for (const x of await ctx.all(`SELECT ref, nominal FROM mutasi WHERE jenis = 'potongan' AND ref IN (${riwayat.map(() => '?').join(',')})`, ...riwayat.map((r) => r.ref))) potRef[x.ref] = x.nominal;
  }

  const card = async (r, focus = false) => {
    const saldo = await ctx.val(r.pihak === 'kantin' ? 'SELECT saldo FROM kantin WHERE id = ?' : 'SELECT saldo FROM users WHERE id = ?', r.pihak_id) || 0;
    const nama = await namaPihak(ctx, r.pihak, r.pihak_id);
    let info = 'Kantin';
    let foto = { nama };
    if (r.pihak !== 'kantin') {
      const x = await ctx.first('SELECT username, kelas, jenis, foto FROM users WHERE id = ?', r.pihak_id);
      info = x ? `${x.username} · ${x.kelas || ucfirst(x.jenis)}` : '';
      if (x) foto = { nama, foto: x.foto };
    }
    const cukup = saldo >= r.nominal;
    const potong = r.pihak === 'kantin' ? hitungPotongan(r.nominal, pct) : 0;
    return html`<div class="card req-card${focus ? ' focus' : ''}">
      <div class="row-between"><div class="who">${avatar(foto, 'md')}<div><b>${nama}</b><br><small class="muted">${info}</small></div></div><span class="mono small">${r.kode}</span></div>
      <div class="row-between"><span class="muted small">${tgl(r.created_at)} · saldo ${rupiah(saldo)}</span><b class="big">${rupiah(r.nominal)}</b></div>
      ${potong ? html`<p class="potong-note">Potongan ${pctTxt}: −${rupiah(potong)} → <b>serahkan ${rupiah(r.nominal - potong)}</b></p>` : ''}
      ${r.status !== 'menunggu' ? html`<p class="alert alert-err">Permintaan ini sudah <b>${r.status}</b> pada ${tgl(r.diproses_at)}. Jangan serahkan uang lagi.</p>` : html`
        ${!cukup ? html`<p class="alert alert-err">Saldo tidak mencukupi — tolak permintaan ini.</p>` : ''}
        <div class="row gap">
          <form method="post" action="/?p=cairkan" class="grow" data-confirm="Serahkan uang tunai ${rupiah(r.nominal - potong)} kepada ${nama}?">
            ${ctx.csrfField()}<input type="hidden" name="aksi" value="proses_req"><input type="hidden" name="id" value="${r.id}">
            <button class="btn btn-primary btn-block"${cukup ? '' : ' disabled'}>${icon('check', 16)} Serahkan tunai</button>
          </form>
          <form method="post" action="/?p=cairkan" data-confirm="Tolak permintaan ${r.kode}?">
            ${ctx.csrfField()}<input type="hidden" name="aksi" value="tolak_req"><input type="hidden" name="id" value="${r.id}">
            <button class="btn danger">Tolak</button>
          </form>
        </div>`}
    </div>`;
  };
  const reqCards = [];
  for (const r of reqs) if (!fokus || fokus.id !== r.id) reqCards.push(await card(r));
  const riwRows = [];
  for (const r of riwayat) {
    riwRows.push(html`<tr><td>${tgl(r.created_at)}</td><td>${await namaPihak(ctx, r.pihak, r.pihak_id)} <small class="muted">${r.pihak === 'kantin' ? 'kantin' : 'pembeli'}</small></td>
      <td class="num">${rupiah(Math.abs(r.nominal))}${potRef[r.ref] ? html`<br><small class="muted">potongan ${rupiah(potRef[r.ref])}</small>` : ''}</td><td class="mono small">${r.ref}</td></tr>`);
  }

  return ctx.page('Pencairan', html`
<div class="row-between"><h1 class="page-title">Pencairan ke uang tunai</h1>
  <a class="btn btn-primary" href="${url('scan')}">${icon('scan', 16)} Scan QR</a></div>
<form method="get" action="/" class="searchbar">
  <input type="hidden" name="p" value="cairkan">${icon('search', 18)}
  <input name="kode" value="${kodeCari}" placeholder="Ketik / scan kode permintaan (TR-XXXXXXXX)" autocapitalize="characters">
  <button class="btn">Cek</button>
</form>
${fokus ? await card(fokus, true) : ''}
<section>
  <h2 class="sec-title">Permintaan menunggu <span class="count">${reqs.length}</span></h2>
  <p class="hint">Pembeli dan penjual mengajukan dari aplikasinya, lalu menunjukkan QR. Saldo baru dipotong saat Anda menekan <b>Serahkan tunai</b>.</p>
  ${!reqs.length ? html`<div class="card empty"><p>Tidak ada permintaan pencairan.</p></div>` : ''}
  <div class="kantin-cair">${reqCards}</div>
</section>
<h2 class="sec-title">Cairkan langsung saldo kantin</h2>
<p class="hint">Saldo kantin bertambah setiap kali kantin meng-scan &amp; menerima struk. Bisa juga dicairkan langsung di sini tanpa permintaan.
  ${pct ? html`<b>Potongan pencairan kantin: ${pctTxt}</b> (diatur Admin di Pengaturan).` : ''}</p>
<div class="kantin-cair">${kantins.map((k) => html`
  <form method="post" action="/?p=cairkan" class="card cair-card${pilih === k.id ? ' focus' : ''}" style="--k: ${k.warna}" data-confirm="Cairkan saldo ${k.nama}?${pct ? ` Potongan ${pctTxt} akan dipotong dari nominal.` : ''} Pastikan uang tunai diserahkan.">
    ${ctx.csrfField()}<input type="hidden" name="kantin_id" value="${k.id}">
    <div class="row-between"><b>${k.nama}</b>${k.aktif ? '' : html`<span class="badge badge-mute">Nonaktif</span>`}</div>
    <span class="muted small">Saldo siap dicairkan</span>
    <strong class="big">${rupiah(k.saldo)}</strong>
    ${pct && k.saldo > 0 ? html`<span class="potong-note">Jika dicairkan semua: potongan ${pctTxt} = ${rupiah(hitungPotongan(k.saldo, pct))}, diterima ${rupiah(k.saldo - hitungPotongan(k.saldo, pct))}</span>` : ''}
    ${k.saldo > 0 ? html`<div class="row gap">
      <input name="nominal" inputmode="numeric" data-rupiah value="${ribuan(k.saldo)}" class="grow" aria-label="Nominal">
      <button class="btn btn-primary">Cairkan</button></div>` : ''}
  </form>`)}</div>
<section class="card">
  <h3>Riwayat pencairan</h3>
  ${!riwRows.length ? html`<p class="muted">Belum ada pencairan.</p>` : html`<table class="table">
    <thead><tr><th>Waktu</th><th>Penerima</th><th class="num">Nominal</th><th>Ref</th></tr></thead><tbody>${riwRows}</tbody></table>`}
</section>`);
}

/* ================= Pengguna ================= */
export async function pengguna(ctx) {
  const me = ctx.user;
  if (ctx.q.template) {
    return ctx.download('﻿nisn;nama;password;jenis;kelas;wa\r\n0081234567;Ahmad Fauzi;rahasia1;siswa;X-1;081234567890\r\n0081234568;Siti Aminah;;siswa;XI-2;\r\n198001012005011001;Budi Santoso, S.Pd.;guru123;guru;;085700000000\r\n',
      'template-pengguna-kantin.csv');
  }
  const kantins = await ctx.all('SELECT id, nama FROM kantin ORDER BY urutan, id');
  if (ctx.q.daftar_foto) {
    return ctx.json(await ctx.all('SELECT id, username, nama, role, kelas, foto FROM users ORDER BY nama'));
  }

  if (ctx.isPost) {
    const f = await ctx.csrf();
    const aksi = f.aksi || '';
    const id = parseInt(f.id, 10) || 0;

    if (aksi === 'foto_massal') {
      // Dipanggil bertahap dari browser: maks. 5 foto (sudah dikecilkan) per permintaan
      let ok = 0;
      const gagal = [];
      for (const it of (Array.isArray(f.items) ? f.items : []).slice(0, 5)) {
        const uid = parseInt(it.id, 10) || 0;
        const lama = await ctx.first('SELECT foto FROM users WHERE id = ?', uid);
        if (!lama) { gagal.push(it.file || uid); continue; }
        try {
          const baru = await simpanGambar(ctx, it.data, 200_000);
          await ctx.run('UPDATE users SET foto = ? WHERE id = ?', baru, uid);
          await hapusGambar(ctx, lama.foto);
          ok++;
        } catch (e) {
          if (!(e instanceof UserError)) throw e;
          gagal.push(it.file || uid);
        }
      }
      return ctx.json({ ok, gagal });
    }

    if (aksi === 'import') {
      // Dipanggil bertahap dari browser (maks. 5 baris per permintaan, agar muat batas CPU paket gratis)
      const rowsIn = Array.isArray(f.rows) ? f.rows.slice(0, 5) : [];
      let baru = 0, lewat = 0, update = 0;
      const gagal = [];
      const valid = [];
      for (const r of rowsIn) {
        const un = String(r[0] ?? '').replace(/\s+/g, '');
        const nama = String(r[1] ?? '').trim();
        if (!un && !nama) continue;
        if (!/^[A-Za-z0-9._-]{3,50}$/.test(un) || !nama) { gagal.push(r.baris || un); continue; }
        let jenis = String(r[3] || 'siswa').toLowerCase().trim();
        if (!['siswa', 'guru', 'staf'].includes(jenis)) jenis = 'siswa';
        valid.push({ un, nama, pw: String(r[2] ?? '').trim() || un, jenis, kelas: String(r[4] ?? '').trim(), wa: normWa(r[5]) });
      }
      const ada = {};
      if (valid.length) {
        for (const x of await ctx.all(`SELECT id, username, role FROM users WHERE username IN (${valid.map(() => '?').join(',')})`, ...valid.map((v) => v.un))) ada[x.username] = x;
      }
      const stmts = [];
      const seen = new Set();
      for (const v of valid) {
        if (seen.has(v.un)) { lewat++; continue; }
        seen.add(v.un);
        const x = ada[v.un];
        if (x) {
          if (f.timpa && x.role === 'pembeli') { stmts.push(ctx.st("UPDATE users SET nama = ?, jenis = ?, kelas = ?, wa = CASE WHEN ? <> '' THEN ? ELSE wa END WHERE id = ?", v.nama, v.jenis, v.kelas, v.wa, v.wa, x.id)); update++; }
          else lewat++;
          continue;
        }
        stmts.push(ctx.st("INSERT INTO users (username,nama,password,role,jenis,kelas,wa,status,saldo,created_at) VALUES (?,?,?,'pembeli',?,?,?,'belum',0,?)",
          v.un, v.nama, await hashPassword(v.pw, ctx.env), v.jenis, v.kelas, v.wa, now()));
        baru++;
      }
      if (stmts.length) await ctx.batch(stmts);
      return ctx.json({ ok: true, baru, update, lewat, gagal });
    }

    try {
      if (aksi === 'simpan') {
        const d = {
          username: String(f.username || '').trim(),
          nama: String(f.nama || '').trim(),
          role: ['pembeli', 'kantin', 'petugas', 'admin'].includes(f.role) ? f.role : 'pembeli',
          jenis: ['siswa', 'guru', 'staf'].includes(f.jenis) ? f.jenis : '',
          kelas: String(f.kelas || '').trim(),
          kantin_id: parseInt(f.kantin_id, 10) || null,
          status: ['belum', 'aktif', 'nonaktif'].includes(f.status) ? f.status : 'belum',
        };
        const wa = normWa(f.wa);
        if (f.wa && !wa) throw new UserError('Nomor WhatsApp tidak valid. Contoh: 081234567890.');
        const pw = String(f.password || '');
        if (!/^[A-Za-z0-9._-]{3,50}$/.test(d.username)) throw new UserError('NISN/username 3–50 karakter (huruf, angka, titik, strip).');
        if (!d.nama) throw new UserError('Nama wajib diisi.');
        if (d.role === 'kantin' && !d.kantin_id) throw new UserError('Pilih kantin untuk akun penjual.');
        if (d.role !== 'kantin') d.kantin_id = null;
        if (d.role !== 'pembeli' && d.status === 'belum') d.status = 'aktif';
        if (id === me.id && (d.role !== 'admin' || d.status !== 'aktif')) throw new UserError('Anda tidak bisa menonaktifkan/mengubah peran akun sendiri.');
        if (await ctx.val('SELECT id FROM users WHERE username = ? AND id <> ?', d.username, id)) throw new UserError('NISN/username sudah dipakai.');
        const vals = [d.username, d.nama, d.role, d.jenis, d.kelas, d.kantin_id, d.status];
        if (id) {
          await ctx.run('UPDATE users SET username=?, nama=?, role=?, jenis=?, kelas=?, kantin_id=?, status=? WHERE id=?', ...vals, id);
          if (pw) {
            if (pw.length < 6) throw new UserError('Password minimal 6 karakter.');
            await ctx.run('UPDATE users SET password = ? WHERE id = ?', await hashPassword(pw, ctx.env), id);
          }
          await simpanFotoUser(ctx, id, f);
          await ctx.run('UPDATE users SET wa = ? WHERE id = ?', wa, id);
          ctx.flash('ok', `Data ${esc(d.nama)} disimpan.`);
        } else {
          if (pw.length < 6) throw new UserError('Password minimal 6 karakter.');
          const nid = await ctx.insert('INSERT INTO users (username,nama,role,jenis,kelas,kantin_id,status,password,saldo,created_at) VALUES (?,?,?,?,?,?,?,?,0,?)',
            ...vals, await hashPassword(pw, ctx.env), now());
          await simpanFotoUser(ctx, nid, f);
          await ctx.run('UPDATE users SET wa = ? WHERE id = ?', wa, nid);
          ctx.flash('ok', `Pengguna ${esc(d.nama)} ditambahkan.`);
        }
      } else if (aksi === 'reset_pw') {
        const pw = randomPassword();
        await ctx.run('UPDATE users SET password = ? WHERE id = ?', await hashPassword(pw, ctx.env), id);
        const nm = await ctx.val('SELECT nama FROM users WHERE id = ?', id);
        ctx.flash('ok', `Password baru untuk <b>${esc(nm)}</b>: <b class="mono big">${pw}</b> — catat dan berikan ke pengguna.`);
      } else if (aksi === 'hapus') {
        const t = await ctx.first('SELECT * FROM users WHERE id = ?', id);
        if (!t) throw new UserError('Pengguna tidak ditemukan.');
        if (id === me.id) throw new UserError('Tidak bisa menghapus akun sendiri.');
        if (t.saldo !== 0) throw new UserError(`Saldo masih ${rupiah(t.saldo)}. Lakukan tarik tunai dulu atau nonaktifkan akun.`);
        if (await ctx.val('SELECT COUNT(*) FROM transaksi WHERE user_id = ?', id) || await ctx.val("SELECT COUNT(*) FROM mutasi WHERE pihak='user' AND pihak_id = ?", id)) {
          throw new UserError('Pengguna punya riwayat transaksi. Nonaktifkan saja agar laporan tetap utuh.');
        }
        await ctx.run('DELETE FROM users WHERE id = ?', id);
        ctx.flash('ok', `Pengguna ${esc(t.nama)} dihapus.`);
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
      return ctx.redirect(url('pengguna', aksi === 'simpan' ? (id ? { edit: id } : { tambah: 1 }) : {}));
    }
    return ctx.redirect(url('pengguna', { role: f._role, cari: f._cari }));
  }

  const role = ['pembeli', 'kantin', 'petugas', 'admin'].includes(ctx.q.role) ? ctx.q.role : 'pembeli';
  const status = ['belum', 'aktif', 'nonaktif'].includes(ctx.q.status) ? ctx.q.status : '';
  const cari = String(ctx.q.cari || '').trim();
  const hal = Math.max(1, parseInt(ctx.q.hal, 10) || 1);
  const per = 50;
  let where = 'u.role = ?';
  const par = [role];
  if (status) { where += ' AND u.status = ?'; par.push(status); }
  if (cari) { where += ' AND (u.username LIKE ? OR u.nama LIKE ? OR u.kelas LIKE ?)'; par.push(`%${cari}%`, `%${cari}%`, `%${cari}%`); }
  const total = await ctx.val(`SELECT COUNT(*) FROM users u WHERE ${where}`, ...par);
  const list = await ctx.all(`SELECT u.*, k.nama AS kantin FROM users u LEFT JOIN kantin k ON k.id = u.kantin_id WHERE ${where}
                              ORDER BY u.kelas, u.nama LIMIT ${per} OFFSET ${(hal - 1) * per}`, ...par);
  const hitung = {};
  for (const r of await ctx.all('SELECT role, COUNT(*) AS n FROM users GROUP BY role')) hitung[r.role] = r.n;
  const edit = ctx.q.edit ? await ctx.first('SELECT * FROM users WHERE id = ?', parseInt(ctx.q.edit, 10) || 0) : null;
  const form = edit || ctx.q.tambah;
  const fv = edit || { id: 0, username: '', nama: '', role, jenis: 'siswa', kelas: '', kantin_id: null, status: 'belum' };
  const opt = (v, cur, label) => html`<option value="${v}"${String(v) === String(cur ?? '') ? ' selected' : ''}>${label}</option>`;

  return ctx.page('Pengguna', html`
<div class="row-between"><h1 class="page-title">Pengguna</h1>
  <a class="btn btn-primary" href="${url('pengguna', { tambah: 1, role })}">${icon('plus', 16)} Tambah</a></div>
${form ? html`<section class="card form-card">
  <h3>${edit ? 'Ubah pengguna' : 'Tambah pengguna'}</h3>
  <form method="post" action="/?p=pengguna" class="grid-form">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="simpan"><input type="hidden" name="id" value="${fv.id}">
    <label>Peran<select name="role" data-role-select>
      ${opt('pembeli', fv.role, 'Pembeli (siswa/guru)')}${opt('kantin', fv.role, 'Penjual (kantin)')}${opt('petugas', fv.role, 'Petugas kantin')}${opt('admin', fv.role, 'Admin (akses penuh)')}
    </select></label>
    <label>NISN / NIP / Username<input name="username" required value="${fv.username}" autocapitalize="none"></label>
    <label class="span2">Nama lengkap<input name="nama" required value="${fv.nama}"></label>
    <label data-for-role="pembeli">Jenis<select name="jenis">${opt('siswa', fv.jenis, 'Siswa')}${opt('guru', fv.jenis, 'Guru')}${opt('staf', fv.jenis, 'Staf/Karyawan')}</select></label>
    <label data-for-role="pembeli">Kelas<input name="kelas" value="${fv.kelas}" placeholder="mis. X-1"></label>
    <label>No. WhatsApp<input name="wa" inputmode="tel" value="${tampilWa(fv.wa)}" placeholder="08xxxxxxxxxx"></label>
    <label data-for-role="kantin">Kantin<select name="kantin_id"><option value="">— pilih —</option>${kantins.map((k) => opt(k.id, fv.kantin_id, k.nama))}</select></label>
    <label>Status<select name="status">${opt('belum', fv.status, 'Belum registrasi')}${opt('aktif', fv.status, 'Aktif')}${opt('nonaktif', fv.status, 'Nonaktif')}</select></label>
    <label class="span2">Foto profil (opsional)
      <span class="row gap">${avatar(fv, 'lg')}
        <input type="file" accept="image/*" data-resize="320" data-square data-target="foto_data" class="grow"></span>
      <input type="hidden" name="foto_data">
      ${fv.foto ? html`<span class="check"><input type="checkbox" name="hapus_foto" value="1"> Hapus foto</span>` : ''}
    </label>
    <label>Password ${edit ? html`<small class="muted">(kosongkan jika tidak diubah)</small>` : ''}
      <input name="password" type="text"${edit ? '' : ' required'} minlength="6" autocomplete="off" value=""></label>
    <div class="span2 row gap">
      <button class="btn btn-primary">${icon('check', 16)} Simpan</button>
      <a class="btn btn-ghost" href="${url('pengguna', { role: fv.role })}">Batal</a>
    </div>
  </form>
</section>` : ''}
<div class="seg">${[['pembeli', 'Siswa & guru'], ['kantin', 'Akun kantin'], ['petugas', 'Petugas'], ['admin', 'Admin']].map(([r, l]) => html`
  <a href="${url('pengguna', { role: r })}" class="${role === r ? 'active' : ''}">${l} <small>(${hitung[r] || 0})</small></a>`)}</div>
<form method="get" action="/" class="searchbar">
  <input type="hidden" name="p" value="pengguna"><input type="hidden" name="role" value="${role}">${icon('search', 18)}
  <input name="cari" value="${cari}" placeholder="Cari NISN / nama / kelas">
  ${role === 'pembeli' ? html`<select name="status" onchange="this.form.submit()">
    <option value="">Semua status</option>${opt('belum', status, 'Belum registrasi')}${opt('aktif', status, 'Aktif')}${opt('nonaktif', status, 'Nonaktif')}
  </select>` : ''}
  <button class="btn">Cari</button>
</form>
<div class="card flush table-wrap"><table class="table">
  <thead><tr><th>NISN / Username</th><th>Nama</th><th>${role === 'kantin' ? 'Kantin' : 'Kelas'}</th><th>Status</th>${role === 'pembeli' ? html`<th class="num">Saldo</th>` : ''}<th class="num">Aksi</th></tr></thead>
  <tbody>
  ${!list.length ? html`<tr><td colspan="6" class="center muted">Tidak ada data.</td></tr>` : ''}
  ${list.map((r) => html`<tr>
    <td class="mono">${r.username}</td>
    <td><span class="who">${avatar(r, 'xs')}<span>${r.nama}${r.jenis && r.jenis !== 'siswa' ? html` <small class="muted">· ${r.jenis}</small>` : ''}</span></span></td>
    <td>${role === 'kantin' ? (r.kantin || '-') : (r.kelas || '-')}${r.wa ? html`<br><small class="muted">WA ${tampilWa(r.wa)}</small>` : ''}</td>
    <td>${badgeStatus(r.status)}</td>
    ${role === 'pembeli' ? html`<td class="num">${rupiah(r.saldo)}</td>` : ''}
    <td class="num actions">
      ${role === 'pembeli' ? html`<a class="btn btn-sm" href="${url('topup', { id: r.id })}" title="Top up">${icon('wallet', 14)}</a>` : ''}
      <a class="btn btn-sm" href="${url('pengguna', { edit: r.id, role })}" title="Ubah">${icon('edit', 14)}</a>
      <form method="post" action="/?p=pengguna" class="inline" data-confirm="Buat password baru untuk ${r.nama}?">
        ${ctx.csrfField()}<input type="hidden" name="aksi" value="reset_pw"><input type="hidden" name="id" value="${r.id}">
        <input type="hidden" name="_role" value="${role}"><input type="hidden" name="_cari" value="${cari}">
        <button class="btn btn-sm" title="Reset password">🔑</button>
      </form>
      <form method="post" action="/?p=pengguna" class="inline" data-confirm="Hapus ${r.nama}? Hanya bisa jika saldo 0 dan belum pernah bertransaksi.">
        ${ctx.csrfField()}<input type="hidden" name="aksi" value="hapus"><input type="hidden" name="id" value="${r.id}"><input type="hidden" name="_role" value="${role}">
        <button class="btn btn-sm danger" title="Hapus">${icon('trash', 14)}</button>
      </form>
    </td>
  </tr>`)}
  </tbody>
</table></div>
${total > per ? html`<nav class="pager">${Array.from({ length: Math.ceil(total / per) }, (_, i) => i + 1).map((i) => html`
  <a href="${url('pengguna', { role, status, cari, hal: i })}" class="${i === hal ? 'active' : ''}">${i}</a>`)}</nav>` : ''}
<details class="card" data-foto-massal>
  <summary>${icon('users', 16)} Unggah foto massal (dari folder komputer / Google Drive)</summary>
  <ol class="small">
    <li>Beri nama setiap file foto dengan <b>NISN/NIP</b> atau <b>nama lengkap</b> sesuai data, mis. <code>0081234567.jpg</code> atau <code>Ahmad Fauzi.jpg</code>.</li>
    <li>Jika foto ada di Google Drive: buka foldernya → klik kanan → <b>Download</b> (menjadi ZIP) → ekstrak di komputer.</li>
    <li>Klik <b>Pilih folder</b> (atau pilih banyak file sekaligus). Aplikasi mencocokkan nama file dan menampilkan hasilnya dulu sebelum diunggah.</li>
  </ol>
  <div class="row gap">
    <label class="btn">${icon('download', 16)} Pilih folder<input type="file" accept="image/*" webkitdirectory multiple hidden data-fm-input></label>
    <label class="btn btn-ghost">Pilih file<input type="file" accept="image/*" multiple hidden data-fm-input></label>
  </div>
  <div data-fm-preview></div>
  <button type="button" class="btn btn-primary" data-fm-go hidden>Unggah foto yang cocok</button>
  <p class="small" data-fm-status></p>
</details>
${role === 'pembeli' ? html`<details class="card">
  <summary>${icon('download', 16)} Impor data siswa &amp; guru dari Excel (CSV)</summary>
  <ol class="small">
    <li>Unduh <a href="${url('pengguna', { template: 1 })}">template CSV</a>, buka di Excel.</li>
    <li>Isi kolom: <b>nisn</b> (NIP untuk guru), <b>nama</b>, <b>password</b> (kosong = sama dengan NISN), <b>jenis</b> (siswa/guru/staf), <b>kelas</b>, <b>wa</b> (nomor WhatsApp, opsional).</li>
    <li>Simpan sebagai <b>CSV (dipisah titik koma / koma)</b>, lalu pilih file di sini.</li>
  </ol>
  <p class="small muted">Semua data yang diimpor berstatus <b>Belum registrasi</b> dengan saldo Rp 0 sampai melakukan top up pertama di petugas.</p>
  <div class="stack" data-import>
    <input type="file" accept=".csv,text/csv" data-import-file>
    <label class="check"><input type="checkbox" data-import-timpa> Perbarui nama/kelas jika NISN sudah ada</label>
    <button type="button" class="btn btn-primary" data-import-go>Impor sekarang</button>
    <p class="small" data-import-status></p>
  </div>
</details>` : ''}`);
}

/* ================= Kantin ================= */
export async function petugasKantin(ctx) {
  if (ctx.isPost) {
    const f = await ctx.csrf();
    let id = parseInt(f.id, 10) || 0;
    try {
      if (f.aksi === 'simpan') {
        const nama = String(f.nama || '').trim();
        if (!nama) throw new UserError('Nama kantin wajib diisi.');
        const warna = /^#[0-9a-fA-F]{6}$/.test(f.warna || '') ? f.warna : '#c8202f';
        const base = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kantin';
        let slug = base, i = 2;
        while (await ctx.val('SELECT COUNT(*) FROM kantin WHERE slug = ? AND id <> ?', slug, id)) slug = `${base}-${i++}`;
        const d = [nama, slug, String(f.pemilik || '').trim(), String(f.spesial || '').trim(), String(f.deskripsi || '').trim(), warna, f.aktif ? 1 : 0, parseInt(f.urutan, 10) || 0];
        const banner = await simpanGambar(ctx, f.banner_data);
        if (id) {
          await ctx.run('UPDATE kantin SET nama=?, slug=?, pemilik=?, spesial=?, deskripsi=?, warna=?, aktif=?, urutan=? WHERE id=?', ...d, id);
        } else {
          id = await ctx.insert("INSERT INTO kantin (nama, slug, pemilik, spesial, deskripsi, warna, aktif, urutan, banner, saldo) VALUES (?,?,?,?,?,?,?,?,'',0)", ...d);
          const un = String(f.akun_username || '').trim();
          const pw = String(f.akun_password || '');
          if (un) {
            if (!/^[A-Za-z0-9._-]{3,50}$/.test(un) || pw.length < 6) throw new UserError('Kantin dibuat, tetapi akun penjual gagal: username 3–50 karakter, password minimal 6.');
            if (await ctx.val('SELECT COUNT(*) FROM users WHERE username = ?', un)) throw new UserError('Kantin dibuat, tetapi username akun penjual sudah dipakai.');
            await ctx.run("INSERT INTO users (username,nama,password,role,kantin_id,status,saldo,created_at) VALUES (?,?,?,'kantin',?,'aktif',0,?)",
              un, d[2] || nama, await hashPassword(pw, ctx.env), id, now());
          }
        }
        if (banner) await ctx.run('UPDATE kantin SET banner = ? WHERE id = ?', banner, id);
        ctx.flash('ok', `Kantin ${esc(nama)} disimpan.`);
      } else if (f.aksi === 'hapus') {
        const k = await ctx.first('SELECT * FROM kantin WHERE id = ?', id);
        if (!k) throw new UserError('Kantin tidak ditemukan.');
        if (k.saldo !== 0) throw new UserError(`Saldo kantin masih ${rupiah(k.saldo)}. Cairkan dulu.`);
        if (await ctx.val('SELECT COUNT(*) FROM pesanan WHERE kantin_id = ?', id)) throw new UserError('Kantin punya riwayat pesanan. Nonaktifkan saja agar laporan tetap utuh.');
        await ctx.batch([
          ctx.st('DELETE FROM menu WHERE kantin_id = ?', id),
          ctx.st("UPDATE users SET status = 'nonaktif', kantin_id = NULL WHERE role = 'kantin' AND kantin_id = ?", id),
          ctx.st('DELETE FROM kantin WHERE id = ?', id),
        ]);
        ctx.flash('ok', `Kantin ${esc(k.nama)} dihapus.`);
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
    }
    return ctx.redirect(url('kantin'));
  }

  const list = await ctx.all(`SELECT k.*, (SELECT COUNT(*) FROM menu m WHERE m.kantin_id = k.id) AS jml_menu,
      (SELECT COUNT(*) FROM users u WHERE u.kantin_id = k.id AND u.role = 'kantin') AS jml_akun FROM kantin k ORDER BY k.urutan, k.id`);
  const edit = ctx.q.edit ? await ctx.first('SELECT * FROM kantin WHERE id = ?', parseInt(ctx.q.edit, 10) || 0) : null;
  const form = edit || ctx.q.tambah;
  const fv = edit || { id: 0, nama: '', pemilik: '', spesial: '', deskripsi: '', warna: '#c8202f', aktif: 1, urutan: list.length + 1, banner: '' };
  return ctx.page('Kantin', html`
<div class="row-between"><h1 class="page-title">Kantin <small class="muted">(${list.length})</small></h1>
  <a class="btn btn-primary" href="${url('kantin', { tambah: 1 })}">${icon('plus', 16)} Tambah kantin</a></div>
${form ? html`<section class="card form-card">
  <h3>${edit ? 'Ubah kantin' : 'Kantin baru'}</h3>
  <form method="post" action="/?p=kantin" class="grid-form">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="simpan"><input type="hidden" name="id" value="${fv.id}">
    <label class="span2">Nama kantin<input name="nama" required value="${fv.nama}" placeholder="mis. Warung Bu Siti"></label>
    <label>Pemilik / penanggung jawab<input name="pemilik" value="${fv.pemilik}"></label>
    <label>Menu spesial / slogan<input name="spesial" value="${fv.spesial}" placeholder="mis. Spesial Nasi Soto"></label>
    <label class="span2">Deskripsi singkat<textarea name="deskripsi" rows="2">${fv.deskripsi}</textarea></label>
    <label>Warna tema<input type="color" name="warna" value="${fv.warna}"></label>
    <label>Urutan tampil<input type="number" name="urutan" value="${fv.urutan}"></label>
    <label class="span2">Banner (JPG/PNG, rasio 8:3 seperti banner 160×60 cm)
      <input type="file" accept="image/jpeg,image/png,image/webp" data-resize="1600" data-target="banner_data">
      <input type="hidden" name="banner_data">
      ${fv.banner ? html`<img src="${fv.banner}" alt="" class="banner-prev">` : ''}
    </label>
    <label class="check span2"><input type="checkbox" name="aktif" value="1"${fv.aktif ? ' checked' : ''}> Kantin aktif (tampil di aplikasi pembeli)</label>
    ${!edit ? html`<fieldset class="span2 sub-fieldset"><legend>Akun penjual untuk kantin ini (opsional)</legend>
      <div class="grid-form">
        <label>Username<input name="akun_username" autocapitalize="none" placeholder="mis. busiti"></label>
        <label>Password<input name="akun_password" type="text" minlength="6" autocomplete="off"></label>
      </div></fieldset>` : ''}
    <div class="span2 row gap">
      <button class="btn btn-primary">${icon('check', 16)} Simpan</button>
      <a class="btn btn-ghost" href="${url('kantin')}">Batal</a>
    </div>
  </form>
</section>` : ''}
<div class="kantin-admin">${list.map((k) => html`
  <article class="card flush kantin-row" style="--k: ${k.warna}">
    ${k.banner ? html`<img src="${k.banner}" alt="" loading="lazy">` : html`<div class="kantin-ph">${icon('store', 36)}</div>`}
    <div class="pad">
      <div class="row-between"><b>${k.nama}</b>${k.aktif ? html`<span class="badge badge-ok">Aktif</span>` : html`<span class="badge badge-mute">Nonaktif</span>`}</div>
      <p class="small muted">${k.spesial} · ${k.jml_menu} menu · ${k.jml_akun} akun penjual · saldo ${rupiah(k.saldo)}</p>
      <div class="row gap">
        <a class="btn btn-sm" href="${url('kantin', { edit: k.id })}">${icon('edit', 14)} Ubah</a>
        <a class="btn btn-sm" href="${url('menu', { kantin: k.id })}">${icon('list', 14)} Menu</a>
        ${ctx.user.role === 'admin' ? html`<a class="btn btn-sm" href="${url('pengguna', { role: 'kantin' })}">${icon('users', 14)} Akun</a>` : ''}
        <form method="post" action="/?p=kantin" class="inline" data-confirm="Hapus kantin ${k.nama} beserta menunya?">
          ${ctx.csrfField()}<input type="hidden" name="aksi" value="hapus"><input type="hidden" name="id" value="${k.id}">
          <button class="btn btn-sm danger">${icon('trash', 14)}</button>
        </form>
      </div>
    </div>
  </article>`)}</div>`);
}

/* ================= Menu ================= */
export async function petugasMenu(ctx) {
  const kantins = await ctx.all('SELECT * FROM kantin ORDER BY urutan, id');
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const kid = parseInt(f.kantin_id, 10) || 0;
    let id = parseInt(f.id, 10) || 0;
    try {
      if (f.aksi === 'simpan') {
        const nama = String(f.nama || '').trim();
        const harga = intInput(f.harga);
        const kat = KAT[f.kategori] ? f.kategori : 'makanan';
        if (!nama) throw new UserError('Nama menu wajib diisi.');
        if (harga <= 0) throw new UserError('Harga harus lebih dari 0.');
        if (!(await ctx.val('SELECT COUNT(*) FROM kantin WHERE id = ?', kid))) throw new UserError('Pilih kantin.');
        const foto = await simpanGambar(ctx, f.foto_data);
        const d = [kid, nama, kat, harga, f.tersedia ? 1 : 0, f.unggulan ? 1 : 0, parseInt(f.urutan, 10) || 0];
        if (id) await ctx.run('UPDATE menu SET kantin_id=?, nama=?, kategori=?, harga=?, tersedia=?, unggulan=?, urutan=? WHERE id=?', ...d, id);
        else id = await ctx.insert("INSERT INTO menu (kantin_id, nama, kategori, harga, tersedia, unggulan, urutan, foto) VALUES (?,?,?,?,?,?,?,'')", ...d);
        if (foto) await ctx.run('UPDATE menu SET foto = ? WHERE id = ?', foto, id);
        if (f.hapus_foto) await ctx.run("UPDATE menu SET foto = '' WHERE id = ?", id);
        ctx.flash('ok', `Menu ${esc(nama)} disimpan.`);
      } else if (f.aksi === 'toggle') {
        await ctx.run('UPDATE menu SET tersedia = 1 - tersedia WHERE id = ?', id);
      } else if (f.aksi === 'hapus') {
        const nm = await ctx.val('SELECT nama FROM menu WHERE id = ?', id);
        await ctx.run('DELETE FROM menu WHERE id = ?', id);
        ctx.flash('ok', `Menu ${esc(nm || '')} dihapus.`);
      } else if (f.aksi === 'salin') {
        const dari = parseInt(f.dari, 10) || 0;
        const n = await ctx.run(`INSERT INTO menu (kantin_id, nama, kategori, harga, tersedia, unggulan, urutan, foto)
            SELECT ?, m.nama, m.kategori, m.harga, m.tersedia, 0, m.urutan, m.foto FROM menu m
            WHERE m.kantin_id = ? AND NOT EXISTS (SELECT 1 FROM menu x WHERE x.kantin_id = ? AND x.nama = m.nama)`, kid, dari, kid);
        ctx.flash('ok', `${n} menu disalin.`);
      }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
      return ctx.redirect(url('menu', { kantin: kid, ...(id ? { edit: id } : { tambah: 1 }) }));
    }
    return ctx.redirect(url('menu', { kantin: kid }));
  }

  const kid = parseInt(ctx.q.kantin, 10) || kantins[0]?.id || 0;
  const k = kantins.find((x) => x.id === kid);
  const menus = k ? await ctx.all('SELECT * FROM menu WHERE kantin_id = ? ORDER BY kategori, urutan, nama', kid) : [];
  const edit = ctx.q.edit ? await ctx.first('SELECT * FROM menu WHERE id = ?', parseInt(ctx.q.edit, 10) || 0) : null;
  const form = edit || ctx.q.tambah;
  const fv = edit || { id: 0, nama: '', kategori: 'makanan', harga: '', tersedia: 1, unggulan: 0, urutan: menus.length + 1, foto: '' };
  return ctx.page('Menu', html`
<div class="row-between"><h1 class="page-title">Menu kantin</h1>
  ${k ? html`<a class="btn btn-primary" href="${url('menu', { kantin: kid, tambah: 1 })}">${icon('plus', 16)} Tambah menu</a>` : ''}</div>
<nav class="seg seg-scroll">${kantins.map((x) => html`<a href="${url('menu', { kantin: x.id })}" class="${x.id === kid ? 'active' : ''}">${x.nama}</a>`)}</nav>
${form && k ? html`<section class="card form-card">
  <h3>${edit ? 'Ubah menu' : 'Menu baru'} — ${k.nama}</h3>
  <form method="post" action="/?p=menu" class="grid-form">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="simpan"><input type="hidden" name="id" value="${fv.id}">
    <label class="span2">Nama menu<input name="nama" required value="${fv.nama}"></label>
    <label>Harga (Rp)<input name="harga" required inputmode="numeric" data-rupiah value="${fv.harga !== '' ? ribuan(fv.harga) : ''}"></label>
    <label>Kategori<select name="kategori">${Object.entries(KAT).map(([v, l]) => html`<option value="${v}"${fv.kategori === v ? ' selected' : ''}>${l}</option>`)}</select></label>
    <label>Kantin<select name="kantin_id">${kantins.map((x) => html`<option value="${x.id}"${x.id === kid ? ' selected' : ''}>${x.nama}</option>`)}</select></label>
    <label>Urutan<input type="number" name="urutan" value="${fv.urutan}"></label>
    <label class="span2">Foto (opsional)
      <input type="file" accept="image/jpeg,image/png,image/webp" data-resize="600" data-target="foto_data">
      <input type="hidden" name="foto_data">
      ${fv.foto ? html`<span class="row gap"><img src="${fv.foto}" alt="" class="thumb-prev"><label class="check"><input type="checkbox" name="hapus_foto" value="1"> Hapus foto</label></span>` : ''}
    </label>
    <label class="check"><input type="checkbox" name="tersedia" value="1"${fv.tersedia ? ' checked' : ''}> Tersedia</label>
    <label class="check"><input type="checkbox" name="unggulan" value="1"${fv.unggulan ? ' checked' : ''}> Tandai sebagai menu spesial</label>
    <div class="span2 row gap">
      <button class="btn btn-primary">${icon('check', 16)} Simpan</button>
      <a class="btn btn-ghost" href="${url('menu', { kantin: kid })}">Batal</a>
    </div>
  </form>
</section>` : ''}
${!k ? html`<div class="card empty"><p>Belum ada kantin.</p><a class="btn" href="${url('kantin', { tambah: 1 })}">Tambah kantin</a></div>` : html`
<div class="card flush table-wrap"><table class="table">
  <thead><tr><th></th><th>Menu</th><th>Kategori</th><th class="num">Harga</th><th>Status</th><th class="num">Aksi</th></tr></thead>
  <tbody>
  ${!menus.length ? html`<tr><td colspan="6" class="center muted">Belum ada menu.</td></tr>` : ''}
  ${menus.map((m) => html`<tr class="${m.tersedia ? '' : 'is-off'}">
    <td class="ic-cell">${m.foto ? html`<img src="${m.foto}" alt="" class="thumb-sm">` : menuIcon(m)}</td>
    <td>${m.nama}${m.unggulan ? html` <span class="tag-star">★</span>` : ''}</td>
    <td>${KAT[m.kategori] || m.kategori}</td>
    <td class="num"><b>${rupiah(m.harga)}</b></td>
    <td><form method="post" action="/?p=menu" class="inline">
      ${ctx.csrfField()}<input type="hidden" name="aksi" value="toggle"><input type="hidden" name="id" value="${m.id}"><input type="hidden" name="kantin_id" value="${kid}">
      <button class="badge ${m.tersedia ? 'badge-ok' : 'badge-mute'} as-btn" title="Klik untuk mengubah">${m.tersedia ? 'Tersedia' : 'Habis'}</button>
    </form></td>
    <td class="num actions">
      <a class="btn btn-sm" href="${url('menu', { kantin: kid, edit: m.id })}">${icon('edit', 14)}</a>
      <form method="post" action="/?p=menu" class="inline" data-confirm="Hapus menu ${m.nama}?">
        ${ctx.csrfField()}<input type="hidden" name="aksi" value="hapus"><input type="hidden" name="id" value="${m.id}"><input type="hidden" name="kantin_id" value="${kid}">
        <button class="btn btn-sm danger">${icon('trash', 14)}</button>
      </form>
    </td>
  </tr>`)}
  </tbody>
</table></div>
${kantins.length > 1 ? html`<details class="card">
  <summary>Salin menu dari kantin lain ke ${k.nama}</summary>
  <form method="post" action="/?p=menu" class="row gap">
    ${ctx.csrfField()}<input type="hidden" name="aksi" value="salin"><input type="hidden" name="kantin_id" value="${kid}">
    <select name="dari" class="grow">${kantins.filter((x) => x.id !== kid).map((x) => html`<option value="${x.id}">${x.nama}</option>`)}</select>
    <button class="btn">Salin</button>
  </form>
  <p class="small muted">Menu dengan nama yang sama dilewati.</p>
</details>` : ''}`}`);
}

/* ================= Pesanan ================= */
export async function pesanan(ctx) {
  const me = ctx.user;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const ok = await batalkanPesanan(ctx, parseInt(f.batal, 10) || 0, 'dibatalkan', String(f.alasan || '').trim() || 'Dibatalkan petugas', me.id);
    ctx.flash(ok ? 'ok' : 'err', ok ? 'Pesanan dibatalkan dan dana dikembalikan ke pembeli.' : 'Pesanan tidak bisa dibatalkan (sudah diproses).');
    return ctx.redirect(url('pesanan', { status: ctx.q.status, cari: ctx.q.cari }));
  }
  const status = ['menunggu', 'selesai', 'dibatalkan', 'ditolak', 'kedaluwarsa'].includes(ctx.q.status) ? ctx.q.status : 'menunggu';
  const kid = parseInt(ctx.q.kantin, 10) || 0;
  const cari = String(ctx.q.cari || '').trim();
  let where = 'ps.status = ?';
  const par = [status];
  if (kid) { where += ' AND ps.kantin_id = ?'; par.push(kid); }
  if (cari) { where += ' AND (t.kode LIKE ? OR us.nama LIKE ? OR us.username LIKE ?)'; par.push(`%${cari}%`, `%${cari}%`, `%${cari}%`); }
  const list = await ctx.all(`SELECT ps.*, t.kode, t.created_at AS waktu, us.nama, us.kelas, k.nama AS kantin
      FROM pesanan ps JOIN transaksi t ON t.id = ps.transaksi_id JOIN users us ON us.id = t.user_id JOIN kantin k ON k.id = ps.kantin_id
      WHERE ${where} ORDER BY ps.id DESC LIMIT 200`, ...par);
  const kantins = await ctx.all('SELECT id, nama FROM kantin ORDER BY urutan, id');
  return ctx.page('Pesanan', html`
<h1 class="page-title">Pesanan</h1>
<div class="seg">${[['menunggu', 'Belum diambil'], ['selesai', 'Selesai'], ['dibatalkan', 'Dibatalkan'], ['ditolak', 'Ditolak'], ['kedaluwarsa', 'Kedaluwarsa']].map(([s, l]) => html`
  <a href="${url('pesanan', { status: s, kantin: kid || null })}" class="${status === s ? 'active' : ''}">${l}</a>`)}</div>
<form method="get" action="/" class="searchbar">
  <input type="hidden" name="p" value="pesanan"><input type="hidden" name="status" value="${status}">${icon('search', 18)}
  <input name="cari" value="${cari}" placeholder="Kode struk / nama / NISN">
  <select name="kantin" onchange="this.form.submit()"><option value="">Semua kantin</option>
    ${kantins.map((k) => html`<option value="${k.id}"${kid === k.id ? ' selected' : ''}>${k.nama}</option>`)}</select>
  <button class="btn">Cari</button>
</form>
<div class="card flush table-wrap"><table class="table">
  <thead><tr><th>Waktu</th><th>Kode</th><th>Pembeli</th><th>Kantin</th><th class="num">Nominal</th><th>Status</th><th class="num"></th></tr></thead>
  <tbody>
  ${!list.length ? html`<tr><td colspan="7" class="center muted">Tidak ada pesanan.</td></tr>` : ''}
  ${list.map((r) => html`<tr>
    <td class="small">${tgl(r.waktu)}</td>
    <td><a class="mono link" href="${url('struk', { kode: r.kode })}">${r.kode}</a></td>
    <td>${r.nama}${r.kelas ? html` <small class="muted">${r.kelas}</small>` : ''}</td>
    <td>${r.kantin}</td>
    <td class="num">${rupiah(r.subtotal)}</td>
    <td>${statusBadge(r.status)}${r.catatan ? html`<br><small class="muted">${r.catatan}</small>` : ''}</td>
    <td class="num">${r.status === 'menunggu' ? html`<form method="post" class="inline" data-confirm="Batalkan pesanan ${r.kode} di ${r.kantin} dan kembalikan ${rupiah(r.subtotal)} ke ${r.nama}?">
      ${ctx.csrfField()}<button class="btn btn-sm danger" name="batal" value="${r.id}">Batalkan</button></form>` : ''}</td>
  </tr>`)}
  </tbody>
</table></div>`);
}

/* ================= Laporan ================= */
export async function transaksi(ctx) {
  const valid = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const t0 = today();
  const dari = valid(ctx.q.dari) ? ctx.q.dari : t0.slice(0, 8) + '01';
  const sampai = valid(ctx.q.sampai) ? ctx.q.sampai : t0;
  const JENIS = ['topup', 'topup_bank', 'topup_dana', 'tarik', 'belanja', 'refund', 'penjualan', 'pencairan', 'potongan', 'transfer_keluar', 'transfer_masuk'];
  const jenis = JENIS.includes(ctx.q.jenis) ? ctx.q.jenis : '';
  const akhir = addDays(sampai, 1);
  let where = 'm.created_at >= ? AND m.created_at < ?';
  const par = [dari, akhir];
  if (jenis) { where += ' AND m.jenis = ?'; par.push(jenis); }
  const sql = `SELECT m.*, CASE WHEN m.pihak = 'kantin' THEN k.nama ELSE us.nama END AS nama_pihak,
        CASE WHEN m.pihak = 'kantin' THEN '' ELSE us.username END AS no_induk, us.kelas, op.nama AS operator
      FROM mutasi m
      LEFT JOIN users us ON m.pihak = 'user' AND us.id = m.pihak_id
      LEFT JOIN kantin k ON m.pihak = 'kantin' AND k.id = m.pihak_id
      LEFT JOIN users op ON op.id = m.oleh
      WHERE ${where} ORDER BY m.id DESC`;

  if (ctx.q.csv) {
    const rows = await ctx.all(sql, ...par);
    const cell = (v) => {
      const s = String(v ?? '');
      return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    let out = '﻿' + ['Waktu', 'Jenis', 'Pihak', 'NISN/Username', 'Kelas', 'Nominal', 'Saldo akhir', 'Ref', 'Keterangan', 'Oleh'].join(';') + '\r\n';
    for (const r of rows) out += [r.created_at, jenisLabel(r.jenis), r.nama_pihak, r.no_induk, r.kelas, r.nominal, r.saldo_akhir, r.ref, r.keterangan, r.operator].map(cell).join(';') + '\r\n';
    return ctx.download(out, `laporan-kantin-${dari}-sd-${sampai}.csv`);
  }

  const ringkas = {};
  for (const r of await ctx.all('SELECT jenis, COUNT(*) AS n, SUM(nominal) AS total FROM mutasi WHERE created_at >= ? AND created_at < ? GROUP BY jenis', dari, akhir)) ringkas[r.jenis] = r;
  const perKantin = await ctx.all(`SELECT k.nama, COUNT(ps.id) AS n, COALESCE(SUM(ps.subtotal),0) AS total
      FROM kantin k LEFT JOIN pesanan ps ON ps.kantin_id = k.id AND ps.status = 'selesai' AND ps.diproses_at >= ? AND ps.diproses_at < ?
      GROUP BY k.id ORDER BY k.urutan, k.id`, dari, akhir);
  const terlaris = await ctx.all(`SELECT pi.nama, k.nama AS kantin, SUM(pi.qty) AS qty, SUM(pi.qty * pi.harga) AS total
      FROM pesanan_item pi JOIN pesanan ps ON ps.id = pi.pesanan_id JOIN kantin k ON k.id = ps.kantin_id
      WHERE ps.status = 'selesai' AND ps.diproses_at >= ? AND ps.diproses_at < ?
      GROUP BY pi.nama, k.nama ORDER BY qty DESC LIMIT 10`, dari, akhir);
  const list = await ctx.all(sql + ' LIMIT 300', ...par);
  const v = (j) => Math.abs(ringkas[j]?.total || 0);
  const n = (j) => ringkas[j]?.n || 0;
  return ctx.page('Laporan', html`
<h1 class="page-title">Laporan transaksi</h1>
<form method="get" action="/" class="filterbar">
  <input type="hidden" name="p" value="transaksi">
  <label>Dari<input type="date" name="dari" value="${dari}"></label>
  <label>Sampai<input type="date" name="sampai" value="${sampai}"></label>
  <label>Jenis<select name="jenis"><option value="">Semua</option>${JENIS.map((j) => html`<option value="${j}"${jenis === j ? ' selected' : ''}>${jenisLabel(j)}</option>`)}</select></label>
  <button class="btn btn-primary">Tampilkan</button>
  <a class="btn" href="${url('transaksi', { dari, sampai, jenis, csv: 1 })}">${icon('download', 16)} Unduh CSV (Excel)</a>
</form>
<div class="stats stats-4">
  <div class="stat"><span>Top up diterima</span><b>${rupiah(v('topup') + v('topup_bank') + v('topup_dana'))}</b><small>Tunai ${rupiah(v('topup'))} · Bank ${rupiah(v('topup_bank'))} · DANA ${rupiah(v('topup_dana'))}</small></div>
  <div class="stat"><span>Penjualan kantin (diklaim)</span><b>${rupiah(v('penjualan'))}</b><small>${n('penjualan')} pesanan</small></div>
  <div class="stat"><span>Dicairkan ke kantin</span><b>${rupiah(v('pencairan'))}</b><small>${n('pencairan')} kali · potongan ${rupiah(v('potongan'))}</small></div>
  <div class="stat"><span>Tarik tunai pembeli</span><b>${rupiah(v('tarik'))}</b><small>Pengembalian dana: ${rupiah(v('refund'))}</small></div>
</div>
<div class="two-col">
  <section class="card"><h3>Penjualan per kantin</h3><table class="table">
    ${perKantin.map((r) => html`<tr><td>${r.nama}</td><td class="num small muted">${r.n} pesanan</td><td class="num"><b>${rupiah(r.total)}</b></td></tr>`)}
  </table></section>
  <section class="card"><h3>Menu terlaris</h3>
    ${!terlaris.length ? html`<p class="muted">Belum ada data.</p>` : ''}
    <table class="table">${terlaris.map((r) => html`<tr><td>${r.nama}<br><small class="muted">${r.kantin}</small></td><td class="num">${r.qty}×</td><td class="num">${rupiah(r.total)}</td></tr>`)}</table>
  </section>
</div>
<section class="card flush table-wrap"><table class="table">
  <thead><tr><th>Waktu</th><th>Jenis</th><th>Pihak</th><th>Keterangan</th><th class="num">Nominal</th><th class="num">Saldo akhir</th></tr></thead>
  <tbody>
  ${!list.length ? html`<tr><td colspan="6" class="center muted">Tidak ada transaksi pada periode ini.</td></tr>` : ''}
  ${list.map((r) => {
    const plus = r.nominal > 0;
    return html`<tr>
      <td class="small">${tgl(r.created_at)}</td>
      <td><span class="badge badge-${['topup', 'topup_bank', 'topup_dana', 'penjualan', 'refund', 'potongan'].includes(r.jenis) ? 'ok' : 'mute'}">${jenisLabel(r.jenis)}</span></td>
      <td>${r.pihak === 'sistem' ? 'Sekolah (pendapatan)' : r.nama_pihak || '-'}${r.kelas ? html` <small class="muted">${r.kelas}</small>` : ''}</td>
      <td class="small">${r.keterangan}${r.ref ? html` <span class="mono muted">${r.ref}</span>` : ''}</td>
      <td class="num ${plus ? 'txt-ok' : 'txt-bad'}">${(plus ? '+' : '−') + rupiah(Math.abs(r.nominal))}</td>
      <td class="num">${rupiah(r.saldo_akhir)}</td>
    </tr>`;
  })}
  </tbody>
</table>
${list.length === 300 ? html`<p class="small muted pad">Menampilkan 300 transaksi terbaru. Unduh CSV untuk data lengkap.</p>` : ''}
</section>`);
}

/* ================= Pengaturan ================= */
export async function pengaturan(ctx) {
  if (ctx.isPost) {
    const f = await ctx.csrf();
    // QR DANA (gambar) — hanya diganti bila ada unggahan baru / diminta hapus
    let danaQr = String(await ctx.setting('dana_qr', ''));
    try {
      const baru = await simpanGambar(ctx, f.dana_qr_data, 500_000);
      if (baru || f.dana_qr_hapus) { await hapusGambar(ctx, danaQr); danaQr = baru || ''; }
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', esc(e.message));
    }
    const danaNomor = String(f.dana_nomor || '').replace(/[^0-9]/g, '').slice(0, 16);
    await ctx.batch([
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'dana_aktif', f.dana_aktif && danaNomor ? '1' : '0'),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'dana_nomor', danaNomor),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'dana_nama', String(f.dana_nama || '').trim().slice(0, 80)),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'dana_qr', danaQr),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'min_topup', String(intInput(f.min_topup))),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'maks_saldo', String(intInput(f.maks_saldo))),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'pengumuman', String(f.pengumuman || '').trim().slice(0, 500)),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'potongan_kantin',
        String(Math.min(50, Math.max(0, Math.round((parseFloat(String(f.potongan_kantin || '0').replace(',', '.')) || 0) * 100) / 100)))),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'transfer_aktif', f.transfer_aktif ? '1' : '0'),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'topup_bank_aktif', f.topup_bank_aktif && f.bank_norek ? '1' : '0'),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'bank_nama', String(f.bank_nama || '').trim().slice(0, 40)),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'bank_norek', String(f.bank_norek || '').trim().slice(0, 40)),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'bank_an', String(f.bank_an || '').trim().slice(0, 80)),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'maks_transfer', String(intInput(f.maks_transfer))),
      ctx.st('INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES (?, ?)', 'jam_kedaluwarsa',
        /^([01]\d|2[0-3]):[0-5]\d$/.test(String(f.jam_kedaluwarsa || '')) ? f.jam_kedaluwarsa : '18:00'),
    ]);
    ctx.flash('ok', 'Pengaturan disimpan.');
    return ctx.redirect(url('pengaturan'));
  }
  const users = await ctx.val('SELECT COUNT(*) FROM users');
  const trx = await ctx.val('SELECT COUNT(*) FROM transaksi');
  return ctx.page('Pengaturan', html`
<h1 class="page-title">Pengaturan</h1>
<section class="card"><form method="post" action="/?p=pengaturan" class="stack">
  ${ctx.csrfField()}
  <label>Minimal top up (Rp)<input name="min_topup" inputmode="numeric" data-rupiah value="${ribuan(await ctx.setting('min_topup', 0))}">
    <small class="muted">Berlaku untuk registrasi dan setiap top up.</small></label>
  <label>Batas saldo maksimal per pembeli (Rp)<input name="maks_saldo" inputmode="numeric" data-rupiah value="${ribuan(await ctx.setting('maks_saldo', 0))}">
    <small class="muted">Isi 0 jika tidak dibatasi.</small></label>
  <label>Potongan pencairan kantin (%)
    <input name="potongan_kantin" type="number" min="0" max="50" step="0.1" inputmode="decimal" value="${await ctx.setting('potongan_kantin', '0')}">
    <small class="muted">Khusus saat saldo <b>kantin</b> dicairkan ke uang tunai. Contoh 2% dari Rp 100.000 → kantin menerima Rp 98.000, Rp 2.000 menjadi pendapatan sekolah. Isi 0 jika tanpa potongan. Tidak berlaku untuk tarik tunai siswa/guru.</small></label>
  <fieldset class="sub-fieldset"><legend>Top up via transfer bank</legend>
    <div class="grid-form">
      <label class="check span2"><input type="checkbox" name="topup_bank_aktif" value="1"${String(await ctx.setting('topup_bank_aktif', '0')) === '1' ? ' checked' : ''}> Izinkan top up lewat transfer bank (bukti diverifikasi petugas di menu Verifikasi)</label>
      <label>Nama bank<input name="bank_nama" value="${await ctx.setting('bank_nama', '')}" placeholder="mis. Bank Jatim"></label>
      <label>Nomor rekening<input name="bank_norek" value="${await ctx.setting('bank_norek', '')}" inputmode="numeric"></label>
      <label class="span2">Atas nama<input name="bank_an" value="${await ctx.setting('bank_an', '')}" placeholder="mis. Kantin SMAN 1 Purwoasri"></label>
    </div>
  </fieldset>
  <fieldset class="sub-fieldset"><legend>Top up via DANA</legend>
    <div class="grid-form">
      <label class="check span2"><input type="checkbox" name="dana_aktif" value="1"${String(await ctx.setting('dana_aktif', '0')) === '1' ? ' checked' : ''}> Izinkan top up lewat DANA (siswa membayar ke DANA petugas, lalu diverifikasi di menu Verifikasi)</label>
      <label>Nomor DANA<input name="dana_nomor" inputmode="numeric" value="${await ctx.setting('dana_nomor', '')}" placeholder="mis. 085772384510"></label>
      <label>Nama akun DANA<input name="dana_nama" value="${await ctx.setting('dana_nama', '')}" placeholder="nama yang tampil di DANA"></label>
      <div class="span2 stack">
        <span class="small"><b>QR DANA petugas</b> (Profil DANA → <i>QR Saya / Terima</i> → simpan gambar, lalu unggah di sini)</span>
        ${(await ctx.setting('dana_qr', '')) ? html`<img src="${await ctx.setting('dana_qr', '')}" alt="QR DANA" class="dana-qr sm">
          <label class="check"><input type="checkbox" name="dana_qr_hapus" value="1"> Hapus gambar QR</label>` : ''}
        <input type="file" accept="image/*" data-resize="900" data-target="dana_qr_data"><input type="hidden" name="dana_qr_data">
        <small class="muted">Sistem menambahkan kode unik Rp 1–199 ke setiap top up agar mudah dicocokkan di riwayat DANA. Uang tetap masuk langsung ke akun DANA di atas.</small>
      </div>
    </div>
  </fieldset>
  <fieldset class="sub-fieldset"><legend>Transfer saldo antarsiswa/guru</legend>
    <div class="stack">
      <label class="check"><input type="checkbox" name="transfer_aktif" value="1"${String(await ctx.setting('transfer_aktif', '1')) === '1' ? ' checked' : ''}> Izinkan transfer saldo (hanya untuk akun yang sudah registrasi)</label>
      <label>Maksimal per transfer (Rp)<input name="maks_transfer" inputmode="numeric" data-rupiah value="${ribuan(await ctx.setting('maks_transfer', '0'))}">
        <small class="muted">Isi 0 jika tidak dibatasi. Minimal transfer Rp 500.</small></label>
    </div>
  </fieldset>
  <label>Batas pengambilan pesanan setiap hari (WIB)<input type="time" name="jam_kedaluwarsa" value="${await ctx.setting('jam_kedaluwarsa', '18:00')}" required>
    <small class="muted">Pesanan yang belum diambil sampai jam ini otomatis dibatalkan dan uangnya dikembalikan ke saldo pembeli.</small></label>
  <label>Pengumuman di beranda pembeli<textarea name="pengumuman" rows="3" maxlength="500">${await ctx.setting('pengumuman', '')}</textarea></label>
  <button class="btn btn-primary">Simpan</button>
</form></section>
<section class="card"><h3>Informasi sistem</h3><table class="table">
  <tr><td>Platform</td><td class="num">Cloudflare Pages + D1</td></tr>
  <tr><td>Waktu server (WIB)</td><td class="num">${tgl(now())}</td></tr>
  <tr><td>Jumlah pengguna / transaksi</td><td class="num">${users} / ${trx}</td></tr>
</table></section>`);
}
