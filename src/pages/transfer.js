/**
 * Transfer saldo antarpengguna (siswa & guru).
 * Alur: penerima menunjukkan "QR Saya" → pengirim scan → cek nama & foto → isi nominal + sandi → kirim.
 */
import { html, raw, url, rupiah, ribuan, icon, tgl, intInput, avatar, esc, verifyPassword, ucfirst } from '../core.js';
import { transferSaldo } from '../money.js';

const PREFIX = 'PY-';
const KUNCI_MENIT = 5;
const MAKS_SALAH = 5;

/** Ambil NISN dari isi QR ("PY-<nisn>") atau ketikan langsung. */
function bacaKode(raw) {
  let s = String(raw || '').trim();
  if (s.toUpperCase().startsWith(PREFIX)) s = s.slice(PREFIX.length);
  return s.replace(/\s+/g, '');
}

async function pengaturanTransfer(ctx) {
  return {
    aktif: String(await ctx.setting('transfer_aktif', '1')) === '1',
    maks: parseInt(await ctx.setting('maks_transfer', '0'), 10) || 0,
    min: 500,
  };
}

export async function transfer(ctx) {
  const u = ctx.user;
  const cfg = await pengaturanTransfer(ctx);
  if (!cfg.aktif) {
    return ctx.page('Transfer', html`<div class="card empty"><p>Fitur transfer saldo sedang dinonaktifkan oleh Admin.</p>
      <a class="btn" href="${url('beranda')}">Kembali</a></div>`, { back: url('beranda') });
  }

  /* ---------- Kirim ---------- */
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const kode = bacaKode(f.kode);
    const kunciKey = 'trf:' + u.id;
    const lock = await ctx.first('SELECT * FROM login_gagal WHERE username = ?', kunciKey);
    const back = url('transfer', { kode });
    if (lock && lock.sampai > Date.now()) {
      ctx.flash('err', `Terlalu banyak sandi salah. Transfer dikunci ${Math.ceil((lock.sampai - Date.now()) / 60000)} menit lagi.`);
      return ctx.redirect(url('transfer'));
    }
    const penerima = await ctx.first("SELECT * FROM users WHERE username = ? AND role = 'pembeli'", kode);
    const n = intInput(f.nominal);
    const catatan = String(f.catatan || '').trim().slice(0, 60);
    let err = '';
    if (!penerima) err = 'Penerima tidak ditemukan.';
    else if (penerima.id === u.id) err = 'Tidak bisa mentransfer ke diri sendiri.';
    else if (penerima.status !== 'aktif') err = 'Penerima belum registrasi / tidak aktif, sehingga belum bisa menerima transfer.';
    else if (n < cfg.min) err = `Minimal transfer ${rupiah(cfg.min)}.`;
    else if (cfg.maks && n > cfg.maks) err = `Maksimal transfer ${rupiah(cfg.maks)} per transaksi.`;
    else if (n > u.saldo) err = `Saldo tidak cukup. Saldo Anda ${rupiah(u.saldo)}.`;
    if (err) { ctx.flash('err', esc(err)); return ctx.redirect(back); }

    if (!(await verifyPassword(String(f.sandi || ''), u.password, ctx.env))) {
      const salah = (lock && lock.sampai <= Date.now() && lock.n === 0 ? 0 : lock?.n || 0) + 1;
      const terkunci = salah >= MAKS_SALAH;
      await ctx.run('INSERT OR REPLACE INTO login_gagal (username, n, sampai) VALUES (?, ?, ?)',
        kunciKey, terkunci ? 0 : salah, terkunci ? Date.now() + KUNCI_MENIT * 60000 : 0);
      ctx.flash('err', terkunci
        ? `Sandi salah ${MAKS_SALAH} kali. Transfer dikunci ${KUNCI_MENIT} menit.`
        : `Sandi salah. Sisa percobaan: ${MAKS_SALAH - salah}.`);
      return ctx.redirect(back);
    }
    if (lock) await ctx.run('DELETE FROM login_gagal WHERE username = ?', kunciKey);

    const ref = await transferSaldo(ctx, u, penerima, n, catatan);
    if (!ref) { ctx.flash('err', 'Transfer gagal: saldo tidak cukup atau akun penerima tidak aktif.'); return ctx.redirect(back); }
    return ctx.redirect(url('transfer', { bukti: ref }));
  }

  /* ---------- Bukti transfer ---------- */
  if (ctx.q.bukti) {
    const m = await ctx.first("SELECT * FROM mutasi WHERE ref = ? AND jenis = 'transfer_keluar' AND pihak = 'user' AND pihak_id = ?", String(ctx.q.bukti), u.id);
    if (!m) return ctx.redirect(url('transfer'));
    const masuk = await ctx.first("SELECT pihak_id FROM mutasi WHERE ref = ? AND jenis = 'transfer_masuk'", m.ref);
    const r = masuk ? await ctx.first('SELECT nama, username, kelas, foto FROM users WHERE id = ?', masuk.pihak_id) : null;
    return ctx.page('Bukti transfer', html`
<article class="struk transfer-ok">
  <div class="result result-ok compact">${icon('check', 40)}<h2>Transfer berhasil</h2></div>
  <p class="center big-amount">${rupiah(Math.abs(m.nominal))}</p>
  ${r ? html`<div class="buyer center-buyer">${avatar(r, 'lg')}<div><b>${r.nama}</b><br><small class="muted">${r.kelas || ''} · ${r.username}</small></div></div>` : ''}
  <dl class="struk-meta">
    <div><dt>Waktu</dt><dd>${tgl(m.created_at)}</dd></div>
    <div><dt>No. referensi</dt><dd class="mono">${m.ref}</dd></div>
    <div><dt>Saldo Anda sekarang</dt><dd>${rupiah(m.saldo_akhir)}</dd></div>
  </dl>
  <p class="small muted center">${m.keterangan}</p>
</article>
<div class="row gap center-row">
  <a class="btn btn-primary" href="${url('beranda')}">Selesai</a>
  <a class="btn" href="${url('transfer')}">Transfer lagi</a>
</div>`, { back: url('beranda') });
  }

  /* ---------- Konfirmasi penerima ---------- */
  const kode = bacaKode(ctx.q.kode);
  if (kode) {
    const r = await ctx.first("SELECT id, nama, username, kelas, jenis, status, foto FROM users WHERE username = ? AND role = 'pembeli'", kode);
    let masalah = '';
    if (!r) masalah = `NISN/NIP <b class="mono">${esc(kode)}</b> tidak terdaftar sebagai siswa/guru.`;
    else if (r.id === u.id) masalah = 'Ini QR Anda sendiri. Minta penerima menunjukkan QR miliknya.';
    else if (r.status !== 'aktif') masalah = `<b>${esc(r.nama)}</b> belum registrasi di Petugas Kantin, sehingga belum bisa menerima transfer.`;
    if (masalah) {
      return ctx.page('Transfer', html`<div class="result result-bad">${icon('x', 44)}<h1>Tidak bisa transfer</h1><p>${raw(masalah)}</p></div>
        <a class="btn btn-primary btn-block btn-lg" href="${url('scan')}">${icon('scan', 18)} Scan ulang</a>`, { back: url('transfer') });
    }
    const chips = [2000, 5000, 10000, 20000].filter((x) => x <= u.saldo && (!cfg.maks || x <= cfg.maks));
    return ctx.page('Transfer', html`
<h1 class="page-title">Kirim saldo</h1>
<section class="card recipient">
  <span class="muted small">Penerima</span>
  <div class="buyer">${avatar(r, 'lg')}<div class="grow"><b class="big">${r.nama}</b><br>
    <small class="muted">${ucfirst(r.jenis || 'siswa')}${r.kelas ? ' · ' + r.kelas : ''} · ${r.username}</small></div></div>
  <p class="hint">${icon('check', 14)} Pastikan nama dan foto sesuai dengan orang yang akan menerima.</p>
</section>
<form method="post" action="/?p=transfer" class="card stack" data-confirm-transfer data-nama="${r.nama}">
  ${ctx.csrfField()}<input type="hidden" name="kode" value="${r.username}">
  <div class="row-between"><span class="muted">Saldo Anda</span><b>${rupiah(u.saldo)}</b></div>
  <label>Nominal (Rp)<input name="nominal" inputmode="numeric" data-rupiah required class="input-xl" placeholder="0" autocomplete="off"></label>
  <div class="quick-amounts">${chips.map((x) => html`<button type="button" class="chip" data-amount="${x}">${rupiah(x)}</button>`)}</div>
  <label>Catatan (opsional)<input name="catatan" maxlength="60" placeholder="mis. bayar patungan"></label>
  <label class="sandi">${icon('lock', 16)} Sandi Anda (password login)
    <input name="sandi" type="password" required autocomplete="current-password" placeholder="Sandi Anda"></label>
  <p class="hint">Minimal ${rupiah(cfg.min)}${cfg.maks ? `, maksimal ${rupiah(cfg.maks)}` : ''} per transfer. Saldo langsung berpindah dan tidak bisa dibatalkan.</p>
  <button class="btn btn-primary btn-lg btn-block">${icon('send', 18)} Kirim sekarang</button>
</form>`, { back: url('transfer') });
  }

  /* ---------- Halaman awal transfer ---------- */
  const riwayat = await ctx.all(`SELECT * FROM mutasi WHERE pihak = 'user' AND pihak_id = ? AND jenis IN ('transfer_keluar','transfer_masuk')
                                 ORDER BY id DESC LIMIT 10`, u.id);
  return ctx.page('Transfer', html`
<h1 class="page-title">Transfer saldo</h1>
<section class="card transfer-hero">
  <p>Kirim saldo ke sesama siswa/guru yang <b>sudah registrasi</b>. Minta penerima membuka <b>QR Saya</b>, lalu pindai.</p>
  <a class="btn btn-primary btn-block btn-lg" href="${url('scan')}">${icon('scan', 20)} Scan QR penerima</a>
  <form method="get" action="/" class="row gap">
    <input type="hidden" name="p" value="transfer">
    <input name="kode" placeholder="atau ketik NISN / NIP penerima" class="grow mono" required>
    <button class="btn">Lanjut</button>
  </form>
</section>
<a class="card list-item link-card" href="${url('terima')}">
  <span class="li-ic ok">${icon('qr', 18)}</span>
  <span class="li-main"><b>Terima transfer</b><small>Tampilkan QR Saya agar teman bisa mengirim saldo</small></span>
</a>
${riwayat.length ? html`<section><h2 class="sec-title">Transfer terakhir</h2><div class="list">${riwayat.map((m) => {
    const plus = m.nominal > 0;
    return html`<div class="list-item">
      <span class="li-ic ${plus ? 'ok' : 'bad'}">${icon(plus ? 'plus' : 'send', 18)}</span>
      <span class="li-main"><b>${plus ? 'Masuk' : 'Keluar'}</b><small>${m.keterangan} · ${tgl(m.created_at)}</small></span>
      <span class="li-end ${plus ? 'txt-ok' : 'txt-bad'}">${(plus ? '+' : '−') + rupiah(Math.abs(m.nominal))}</span>
    </div>`;
  })}</div></section>` : ''}`, { back: url('beranda') });
}

/* ---------- QR Saya (untuk menerima transfer) ---------- */
export async function terima(ctx) {
  const u = ctx.user;
  return ctx.page('QR Saya', html`
<article class="struk my-qr">
  <div class="buyer center-buyer">${avatar(u, 'lg')}<div><b class="big">${u.nama}</b><br><small class="muted">${u.kelas || ucfirst(u.jenis || '')} · ${u.username}</small></div></div>
  <div class="qr-box"><div class="qr" data-qr="${PREFIX + u.username}" aria-label="QR penerima ${u.nama}"></div></div>
  <p class="center"><b>Tunjukkan QR ini ke teman</b> yang akan mengirim saldo kepada Anda.</p>
  <p class="center muted small">QR ini hanya untuk <b>menerima</b>. Saldo tidak bisa diambil orang lain hanya dengan QR ini — pengirim tetap memakai sandinya sendiri.</p>
</article>`, { back: url('beranda'), scripts: ['/assets/js/qr.js'] });
}
