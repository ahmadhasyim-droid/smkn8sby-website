import { html, raw, url, rupiah, icon, tgl, jamSaja, today, addDays, menuIcon, statusBadge, jenisLabel, esc, avatar } from '../core.js';
import { promoCarousel } from './layanan.js';
import { klaimPesanan, batalkanPesanan, jamTutup, batasBerlaku } from '../money.js';

/* ---------------- Beranda penjual: pesanan masuk ---------------- */
export async function kantinBeranda(ctx) {
  const u = ctx.user;
  const k = await ctx.first('SELECT * FROM kantin WHERE id = ?', u.kantin_id);
  if (!k) return ctx.page('Kantin', html`<div class="card empty">Akun ini belum terhubung ke kantin. Hubungi petugas.</div>`);
  const h = today(), b = addDays(h, 1);
  const stat = await ctx.first(`SELECT COUNT(*) AS n, COALESCE(SUM(subtotal),0) AS omzet FROM pesanan
      WHERE kantin_id = ? AND status = 'selesai' AND diproses_at >= ? AND diproses_at < ?`, k.id, h, b);
  const antre = await ctx.all(`SELECT ps.*, t.kode, us.nama, us.kelas, us.foto FROM pesanan ps
      JOIN transaksi t ON t.id = ps.transaksi_id JOIN users us ON us.id = t.user_id
      WHERE ps.kantin_id = ? AND ps.status = 'menunggu' ORDER BY ps.id`, k.id);
  const items = {};
  if (antre.length) {
    const ids = antre.map((a) => a.id);
    for (const it of await ctx.all(`SELECT * FROM pesanan_item WHERE pesanan_id IN (${ids.map(() => '?').join(',')})`, ...ids)) {
      (items[it.pesanan_id] = items[it.pesanan_id] || []).push(it);
    }
  }
  return ctx.page('Pesanan', html`
<section class="wallet" style="--k: ${k.warna}">
  <div>
    <span class="wallet-label">Saldo penjualan (belum dicairkan)</span>
    <strong class="wallet-amount">${rupiah(k.saldo)}</strong>
    <span class="wallet-sub">${k.nama}</span>
  </div>
  <a class="wallet-btn" href="${url('tarik')}">${icon('cash', 18)} Cairkan</a>
</section>
<div class="stats">
  <div class="stat"><span>Pesanan diambil hari ini</span><b>${stat.n}</b></div>
  <div class="stat"><span>Penjualan hari ini</span><b>${rupiah(stat.omzet)}</b></div>
</div>
<a class="btn btn-primary btn-block btn-lg" href="${url('scan')}">${icon('scan', 20)} Scan QR pembeli</a>
${await promoCarousel(ctx, 'kantin')}
<section>
  <div class="row-between">
    <h2 class="sec-title">Pesanan masuk <span class="count">${antre.length}</span></h2>
    <a class="link small" href="${url('beranda')}">${icon('refresh', 14)} Muat ulang</a>
  </div>
  <p class="hint">Siapkan pesanan di bawah ini. Serahkan setelah QR struk pembeli di-scan.</p>
  ${!antre.length ? html`<div class="card empty"><p>Belum ada pesanan yang menunggu.</p></div>` : ''}
  ${antre.map((a) => html`<div class="card order">
    <div class="row-between"><span class="who">${avatar(a, 'sm')}<b>${a.nama}${a.kelas ? ' · ' + a.kelas : ''}</b></span><span class="mono small">${a.kode}</span></div>
    <ul class="order-items">${(items[a.id] || []).map((it) => html`<li><b>${it.qty}×</b> ${it.nama}</li>`)}</ul>
    <div class="row-between small muted"><span>${tgl(a.created_at)}</span><b class="txt">${rupiah(a.subtotal)}</b></div>
  </div>`)}
</section>
${raw("<script>setTimeout(function(){ if (document.visibilityState === 'visible') location.reload(); }, 30000);</script>")}`);
}

/* ---------------- Scan QR (penjual: struk, petugas: permintaan pencairan) ---------------- */
export async function scan(ctx) {
  const isPetugas = ctx.user.role === 'petugas' || ctx.user.role === 'admin';
  const isPembeli = ctx.user.role === 'pembeli';
  const target = isPetugas ? 'cairkan' : isPembeli ? 'transfer' : 'klaim';
  return ctx.page('Scan QR', html`
<h1 class="page-title">${isPetugas ? 'Scan QR permintaan pencairan' : isPembeli ? 'Scan QR penerima transfer' : 'Scan QR struk'}</h1>
<section class="scanner card flush">
  <div class="scan-view" id="scan-view" data-target="${target}">
    <video id="scan-video" playsinline muted></video>
    <div class="scan-frame" aria-hidden="true"></div>
    <div class="scan-msg" id="scan-msg">Menyiapkan kamera…</div>
  </div>
  <div id="scan-fallback"></div>
</section>
<div class="row gap center-row">
  <button type="button" class="btn" id="scan-start">${icon('scan', 18)} Mulai kamera</button>
  <button type="button" class="btn btn-ghost" id="scan-switch">Ganti kamera</button>
</div>
<section class="card">
  <h3>${isPembeli ? 'Atau ketik NISN / NIP penerima' : 'Atau ketik kode' + (isPetugas ? ' permintaan' : ' struk')}</h3>
  <form method="get" action="/" class="row gap">
    <input type="hidden" name="p" value="${target}">
    <input name="kode" placeholder="${isPetugas ? 'TR-XXXXXXXX' : isPembeli ? 'NISN / NIP' : 'SK-XXXXXXXX'}" required autocapitalize="characters" class="mono grow" pattern="[A-Za-z0-9._-]{3,60}">
    <button class="btn btn-primary">Cek</button>
  </form>
</section>
<p class="hint">Izinkan akses kamera saat diminta browser.</p>`, { scripts: ['/assets/js/scan.js'], back: isPetugas ? url('cairkan') : isPembeli ? url('transfer') : null });
}

/* ---------------- Klaim struk ---------------- */
export async function klaim(ctx) {
  const u = ctx.user;
  const kid = u.kantin_id;
  const rawKode = String(ctx.q.kode || '').trim().toUpperCase();
  const mm = rawKode.match(/(SK|TR)-[A-Z0-9]{8}/);
  const kode = mm ? mm[0] : rawKode;
  if (kode.startsWith('TR-')) {
    ctx.flash('err', `QR <b>${esc(kode)}</b> adalah permintaan pencairan tunai — hanya bisa diproses oleh Petugas Kantin.`);
    return ctx.redirect(url('scan'));
  }
  const t = await ctx.first('SELECT t.*, us.nama, us.kelas, us.username, us.foto FROM transaksi t JOIN users us ON us.id = t.user_id WHERE t.kode = ?', kode);
  const p = t ? await ctx.first('SELECT * FROM pesanan WHERE transaksi_id = ? AND kantin_id = ?', t.id, kid) : null;

  if (p && ctx.isPost) {
    const f = await ctx.csrf();
    if (f.aksi === 'terima') {
      if (await klaimPesanan(ctx, p, kid, t.kode, t.nama, u.id)) ctx.sess.just_claimed = p.id;
      else ctx.flash('err', 'Pesanan ini sudah diproses sebelumnya atau sudah kedaluwarsa.');
    } else if (f.aksi === 'tolak') {
      const alasan = String(f.alasan || '').trim().slice(0, 150) || 'Ditolak kantin';
      if (await batalkanPesanan(ctx, p.id, 'ditolak', alasan, u.id)) ctx.flash('ok', `Pesanan ditolak. Dana ${rupiah(p.subtotal)} dikembalikan ke saldo pembeli.`);
      else ctx.flash('err', 'Pesanan ini sudah diproses sebelumnya.');
    }
    return ctx.redirect(url('klaim', { kode }));
  }

  const just = p && ctx.sess.just_claimed === p.id;
  delete ctx.sess.just_claimed;
  const scanLagi = (label) => html`<a class="btn btn-primary btn-block btn-lg" href="${url('scan')}">${icon('scan', 18)} ${label}</a>`;
  let body;
  if (!t) {
    body = html`<div class="result result-bad">${icon('x', 48)}<h1>Kode tidak dikenal</h1>
      <p>QR/kode <b class="mono">${kode || '-'}</b> tidak terdaftar. Bukan struk sah Smanesa Kantin Digital.</p></div>${scanLagi('Scan lagi')}`;
  } else if (!p) {
    body = html`<div class="result result-bad">${icon('x', 48)}<h1>Bukan untuk kantin ini</h1>
      <p>Struk <b class="mono">${kode}</b> milik ${t.nama} tidak berisi pesanan di kantin Anda.</p></div>${scanLagi('Scan lagi')}`;
  } else {
    const items = await ctx.all('SELECT * FROM pesanan_item WHERE pesanan_id = ?', p.id);
    const lain = await ctx.all('SELECT k.nama, ps.status FROM pesanan ps JOIN kantin k ON k.id = ps.kantin_id WHERE ps.transaksi_id = ? AND ps.kantin_id <> ?', t.id, kid);
    let banner = '';
    if (just) banner = html`<div class="result result-ok">${icon('check', 48)}<h1>Pembayaran diterima</h1>
        <p>Serahkan pesanan di bawah ini kepada <b>${t.nama}</b>. Saldo kantin bertambah ${rupiah(p.subtotal)}.</p></div>`;
    else if (p.status === 'selesai') banner = html`<div class="result result-bad">${icon('x', 48)}<h1>Sudah pernah diambil!</h1>
        <p>Pesanan ini sudah diklaim pada ${tgl(p.diproses_at)}. Jangan serahkan lagi.</p></div>`;
    else if (p.status === 'kedaluwarsa') banner = html`<div class="result result-bad">${icon('clock', 48)}<h1>Struk kedaluwarsa</h1>
        <p>Pesanan tidak diambil sampai batas ${tgl(batasBerlaku(t.created_at, await jamTutup(ctx)))} WIB. Dana sudah dikembalikan otomatis ke pembeli. Jangan serahkan pesanan.</p></div>`;
    else if (p.status !== 'menunggu') banner = html`<div class="result result-bad">${icon('x', 48)}<h1>${p.status === 'ditolak' ? 'Pesanan ditolak' : 'Pesanan dibatalkan'}</h1>
        <p>${p.catatan} (${tgl(p.diproses_at)}). Dana sudah kembali ke pembeli.</p></div>`;
    body = html`${banner}
  <section class="card">
    <div class="buyer">
      ${avatar(t, 'lg')}
      <div class="grow"><b>${t.nama}</b><br><small class="muted">${t.kelas || t.username}</small><br>${statusBadge(p.status)}</div>
    </div>
    <p class="mono small muted">${t.kode} · ${tgl(t.created_at)}</p>
    ${p.status === 'menunggu' ? html`<p class="expire-note">${icon('clock', 14)} Berlaku sampai ${tgl(batasBerlaku(t.created_at, await jamTutup(ctx)))} WIB</p>` : ''}
    <table class="struk-items big">
      ${items.map((it) => html`<tr><td>${it.qty}×</td><td>${it.nama}</td><td>${rupiah(it.harga * it.qty)}</td></tr>`)}
      <tr class="sub"><td></td><td>Total untuk kantin ini</td><td>${rupiah(p.subtotal)}</td></tr>
    </table>
    ${lain.length ? html`<p class="small muted">Struk ini juga berisi pesanan di: ${lain.map((l) => l.nama).join(', ')} (diklaim terpisah oleh kantin tersebut).</p>` : ''}
  </section>
  ${p.status === 'menunggu' ? html`
    <form method="post">${ctx.csrfField()}
      <button class="btn btn-primary btn-block btn-xl" name="aksi" value="terima">${icon('check', 22)} Terima &amp; serahkan pesanan</button>
    </form>
    <details class="card">
      <summary>Tolak pesanan (menu habis, dll.)</summary>
      <form method="post" class="stack" data-confirm="Tolak pesanan ini? Dana dikembalikan ke pembeli.">
        ${ctx.csrfField()}<input type="hidden" name="aksi" value="tolak">
        <label>Alasan<input name="alasan" maxlength="150" placeholder="Contoh: Nasi soto habis"></label>
        <button class="btn btn-ghost danger">Tolak &amp; kembalikan dana</button>
      </form>
    </details>` : scanLagi('Scan berikutnya')}`;
  }
  return ctx.page('Klaim pesanan', body, { back: url('scan') });
}

/* ---------------- Rekap penjualan ---------------- */
export async function kantinRiwayat(ctx) {
  const kid = ctx.user.kantin_id;
  const k = await ctx.first('SELECT * FROM kantin WHERE id = ?', kid);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(ctx.q.tgl || '') ? ctx.q.tgl : today();
  const b = addDays(d, 1);
  const rekap = await ctx.all(`SELECT pi.nama, SUM(pi.qty) AS qty, SUM(pi.qty * pi.harga) AS jumlah
      FROM pesanan_item pi JOIN pesanan ps ON ps.id = pi.pesanan_id
      WHERE ps.kantin_id = ? AND ps.status = 'selesai' AND ps.diproses_at >= ? AND ps.diproses_at < ?
      GROUP BY pi.nama ORDER BY qty DESC`, kid, d, b);
  const total = rekap.reduce((s, r) => s + r.jumlah, 0);
  const mut = await ctx.all("SELECT * FROM mutasi WHERE pihak = 'kantin' AND pihak_id = ? AND created_at >= ? AND created_at < ? ORDER BY id DESC", kid, d, b);
  const cair = await ctx.all("SELECT * FROM mutasi WHERE pihak = 'kantin' AND pihak_id = ? AND jenis = 'pencairan' ORDER BY id DESC LIMIT 10", kid);
  return ctx.page('Penjualan', html`
<h1 class="page-title">Penjualan</h1>
<form class="row gap" method="get" action="/">
  <input type="hidden" name="p" value="riwayat">
  <input type="date" name="tgl" value="${d}" class="grow" onchange="this.form.submit()">
</form>
<div class="stats">
  <div class="stat"><span>Total penjualan ${tgl(d, false)}</span><b>${rupiah(total)}</b></div>
  <div class="stat"><span>Saldo belum dicairkan</span><b>${rupiah(k.saldo)}</b></div>
</div>
<section class="card">
  <h3>Rekap menu terjual</h3>
  ${!rekap.length ? html`<p class="muted">Belum ada penjualan pada tanggal ini.</p>` : html`<table class="table">
    <thead><tr><th>Menu</th><th class="num">Jml</th><th class="num">Rupiah</th></tr></thead>
    <tbody>${rekap.map((r) => html`<tr><td>${r.nama}</td><td class="num">${r.qty}</td><td class="num">${rupiah(r.jumlah)}</td></tr>`)}</tbody>
  </table>`}
</section>
<section>
  <h2 class="sec-title">Mutasi saldo kantin</h2>
  ${!mut.length ? html`<div class="card empty"><p>Tidak ada mutasi pada tanggal ini.</p></div>` : ''}
  <div class="list">${mut.map((m) => {
    const plus = m.nominal > 0;
    return html`<div class="list-item">
      <span class="li-ic ${plus ? 'ok' : 'bad'}">${icon(plus ? 'plus' : 'cash', 18)}</span>
      <span class="li-main"><b>${jenisLabel(m.jenis)}</b><small>${m.keterangan} · ${jamSaja(m.created_at)}</small></span>
      <span class="li-end ${plus ? 'txt-ok' : 'txt-bad'}">${(plus ? '+' : '−') + rupiah(Math.abs(m.nominal))}</span>
    </div>`;
  })}</div>
</section>
${cair.length ? html`<section class="card"><h3>Pencairan terakhir</h3><table class="table">
  ${cair.map((c) => html`<tr><td>${tgl(c.created_at)}</td><td class="num">${rupiah(Math.abs(c.nominal))}</td></tr>`)}
</table></section>` : ''}
<a class="btn btn-ghost btn-block" href="${url('menu')}">${icon('list', 16)} Lihat menu kantin saya</a>`);
}

export async function kantinMenu(ctx) {
  const k = await ctx.first('SELECT * FROM kantin WHERE id = ?', ctx.user.kantin_id);
  const menus = await ctx.all('SELECT * FROM menu WHERE kantin_id = ? ORDER BY kategori, urutan, nama', ctx.user.kantin_id);
  return ctx.page('Menu kantin', html`
<h1 class="page-title">Menu ${k?.nama || ''}</h1>
<p class="hint">Penambahan, perubahan harga, dan penghapusan menu dilakukan oleh Petugas Kantin.</p>
<div class="menu-list">${menus.map((m) => html`
  <div class="menu-item${m.tersedia ? '' : ' is-off'}">
    <div class="menu-thumb">${m.foto ? html`<img src="${m.foto}" alt="">` : html`<span>${menuIcon(m)}</span>`}</div>
    <div class="menu-main"><b>${m.nama}</b><span class="price">${rupiah(m.harga)}</span></div>
    ${m.tersedia ? html`<span class="badge badge-ok">Tersedia</span>` : html`<span class="badge badge-mute">Habis</span>`}
  </div>`)}</div>`, { back: url('riwayat') });
}
