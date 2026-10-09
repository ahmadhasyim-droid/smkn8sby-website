import { html, raw, url, rupiah, ribuan, icon, tgl, nl2br, json, now, randomCode, intInput, menuIcon, statusBadge, jenisLabel, UserError } from '../core.js';
import { promoCarousel } from './layanan.js';
import { checkout, batalkanPesanan, penarikanMenunggu, jamTutup, batasBerlaku, detikTersisa, persenPotongan, hitungPotongan } from '../money.js';

const KAT = { makanan: 'Makanan', snack: 'Snack', minuman: 'Minuman', lainnya: 'Lainnya' };
const KAT_ORDER = Object.keys(KAT);

/* ---------------- Beranda pembeli ---------------- */
export async function pembeliBeranda(ctx) {
  const u = ctx.user;
  const kantins = await ctx.all(`SELECT k.*, (SELECT COUNT(*) FROM menu m WHERE m.kantin_id = k.id AND m.tersedia = 1) AS jml_menu
                                 FROM kantin k WHERE k.aktif = 1 ORDER BY k.urutan, k.id`);
  const aktif = await ctx.all(`SELECT t.kode, t.created_at, k.nama AS kantin, ps.subtotal
               FROM pesanan ps JOIN transaksi t ON t.id = ps.transaksi_id JOIN kantin k ON k.id = ps.kantin_id
               WHERE t.user_id = ? AND ps.status = 'menunggu' ORDER BY t.id DESC LIMIT 10`, u.id);
  const pengumuman = String(await ctx.setting('pengumuman', '')).trim();
  const jam = (await jamTutup(ctx)).replace(':', '.');
  return ctx.page('Beranda', html`
<section class="wallet">
  <div>
    <span class="wallet-label">Saldo Anda</span>
    <strong class="wallet-amount">${rupiah(u.saldo)}</strong>
    <span class="wallet-sub">Halo, ${String(u.nama).split(' ')[0]} 👋</span>
  </div>
</section>
<nav class="wallet-quick" aria-label="Aksi saldo">
  <a href="${url('isisaldo')}"><span class="wq-ic">${icon('plus', 22)}</span>Isi Saldo</a>
  <a href="${url('transfer')}"><span class="wq-ic">${icon('send', 22)}</span>Transfer</a>
  <a href="${url('terima')}"><span class="wq-ic">${icon('qr', 22)}</span>QR Saya</a>
  <a href="${url('tarik')}"><span class="wq-ic">${icon('cash', 22)}</span>Tarik tunai</a>
  <a href="${url('riwayat', { tab: 'saldo' })}"><span class="wq-ic">${icon('receipt', 22)}</span>Riwayat</a>
</nav>
${await promoCarousel(ctx, 'pembeli')}
${pengumuman ? html`<div class="notice">${nl2br(pengumuman)}</div>` : ''}
${aktif.length ? html`<section>
  <h2 class="sec-title">Pesanan belum diambil</h2>
  <p class="expire-note">${icon('clock', 16)} Ambil sebelum pukul <b>${jam} WIB</b>. Lewat dari itu pesanan otomatis dibatalkan dan uang kembali ke saldo.</p>
  <div class="list">${aktif.map((a) => html`
    <a class="list-item" href="${url('struk', { kode: a.kode })}">
      <span class="li-ic warn">${icon('clock', 18)}</span>
      <span class="li-main"><b>${a.kantin}</b><small>${a.kode} · ${tgl(a.created_at)}</small></span>
      <span class="li-end">${rupiah(a.subtotal)}<small>Tunjukkan QR</small></span>
    </a>`)}</div>
</section>` : ''}
<section>
  <div class="row-between">
    <h2 class="sec-title">Pilih kantin</h2>
    <a class="link small" href="${url('harga')}">Daftar harga</a>
  </div>
  <div class="kantin-grid">${kantins.map((k) => html`
    <a class="kantin-card" href="${url('kantin', { id: k.id })}" style="--k: ${k.warna}">
      ${k.banner ? html`<img src="${k.banner}" alt="Banner ${k.nama}" loading="lazy">` : html`<div class="kantin-ph">${icon('store', 40)}</div>`}
      <div class="kantin-info"><b>${k.nama}</b><small>${k.spesial} · ${k.jml_menu} menu</small></div>
    </a>`)}</div>
</section>`);
}

/* ---------------- Halaman kantin (menu) ---------------- */
export async function pembeliKantin(ctx) {
  const id = parseInt(ctx.q.id, 10) || 0;
  const k = await ctx.first('SELECT * FROM kantin WHERE id = ? AND aktif = 1', id);
  if (!k) { ctx.flash('err', 'Kantin tidak ditemukan.'); return ctx.redirect(url('beranda')); }
  const menus = await ctx.all('SELECT * FROM menu WHERE kantin_id = ? ORDER BY unggulan DESC, urutan, nama', id);
  const byKat = {};
  for (const m of menus) (byKat[m.kategori] = byKat[m.kategori] || []).push(m);
  const kats = Object.keys(byKat).sort((a, b) => KAT_ORDER.indexOf(a) - KAT_ORDER.indexOf(b));
  return ctx.page(k.nama, html`
<section class="hero" style="--k: ${k.warna}">
  ${k.banner ? html`<img src="${k.banner}" alt="Banner ${k.nama}">` : ''}
  <div class="hero-body">
    <h1>${k.nama}</h1>
    ${k.spesial ? html`<span class="pill">${k.spesial}</span>` : ''}
    ${k.deskripsi ? html`<p>${k.deskripsi}</p>` : ''}
  </div>
</section>
${kats.length > 1 ? html`<nav class="chips" aria-label="Kategori">${kats.map((kat) => html`<a href="#kat-${kat}" class="chip">${KAT[kat] || kat}</a>`)}</nav>` : ''}
${!menus.length ? html`<div class="card empty"><p>Belum ada menu di kantin ini.</p></div>` : ''}
${kats.map((kat) => html`
<section id="kat-${kat}" class="menu-sec">
  <h2 class="sec-title">${KAT[kat] || kat}</h2>
  <div class="menu-list">${byKat[kat].map((m) => html`
    <div class="menu-item${m.tersedia ? '' : ' is-off'}" data-menu="${JSON.stringify({ id: m.id, nama: m.nama, harga: m.harga, kantin_id: k.id, kantin: k.nama })}">
      <div class="menu-thumb">${m.foto ? html`<img src="${m.foto}" alt="" loading="lazy">` : html`<span>${menuIcon(m)}</span>`}</div>
      <div class="menu-main">
        <b>${m.nama}</b>
        ${m.unggulan ? html`<span class="tag-star">★ Spesial</span>` : ''}
        <span class="price">${rupiah(m.harga)}</span>
      </div>
      ${m.tersedia ? html`<div class="qty" data-qty>
        <button type="button" class="qty-btn" data-dec aria-label="Kurangi">${icon('minus', 16)}</button>
        <output data-val>0</output>
        <button type="button" class="qty-btn add" data-inc aria-label="Tambah">${icon('plus', 16)}</button>
      </div>` : html`<span class="badge badge-mute">Habis</span>`}
    </div>`)}</div>
</section>`)}
<a class="cartbar" href="${url('keranjang')}" data-cartbar hidden>
  <span>${icon('cart', 20)} <b data-cart-items>0</b> item</span>
  <span>Lihat keranjang · <b data-cart-total>Rp 0</b></span>
</a>`, { back: url('beranda') });
}

/* ---------------- Keranjang & pembayaran ---------------- */
export async function keranjang(ctx) {
  const u = ctx.user;
  if (ctx.isPost) {
    const f = await ctx.csrf();
    let cart = [];
    try { cart = JSON.parse(String(f.cart || '[]')); } catch (e) { cart = []; }
    const items = new Map();
    const harga = new Map();
    for (const c of Array.isArray(cart) ? cart : []) {
      const id = parseInt(c.id, 10) || 0;
      const qty = parseInt(c.qty, 10) || 0;
      if (id > 0 && qty > 0) {
        items.set(id, Math.min(50, (items.get(id) || 0) + qty));
        harga.set(id, parseInt(c.harga, 10) || 0);
      }
    }
    if (!items.size) { ctx.flash('err', 'Keranjang masih kosong.'); return ctx.redirect(url('keranjang')); }
    try {
      const kode = await checkout(ctx, u, items, harga);
      ctx.sess.clear_cart = 1;
      ctx.flash('ok', 'Pembayaran berhasil! Tunjukkan QR ini ke kantin untuk mengambil pesanan.');
      return ctx.redirect(url('struk', { kode }));
    } catch (e) {
      if (!(e instanceof UserError)) throw e;
      ctx.flash('err', e.message);
      return ctx.redirect(url('keranjang'));
    }
  }
  const menuNow = {};
  for (const m of await ctx.all('SELECT m.id, m.harga, m.tersedia, k.aktif FROM menu m JOIN kantin k ON k.id = m.kantin_id')) {
    menuNow[m.id] = { harga: m.harga, ok: !!(m.tersedia && m.aktif) };
  }
  const jamK = (await jamTutup(ctx)).replace(':', '.');
  return ctx.page('Keranjang', html`
<script>window.MENU_NOW = ${json(menuNow)};</script>
<h1 class="page-title">Keranjang</h1>
<div data-cart-view data-saldo="${u.saldo}">
  <div class="card empty" data-cart-empty hidden>
    <p>Keranjang masih kosong.</p>
    <a class="btn btn-primary" href="${url('beranda')}">Pilih menu</a>
  </div>
  <div data-cart-groups></div>
  <section class="card summary" data-cart-summary hidden>
    <div class="row-between"><span>Total belanja</span><b data-sum-total>Rp 0</b></div>
    <div class="row-between muted"><span>Saldo Anda</span><span>${rupiah(u.saldo)}</span></div>
    <div class="row-between"><span>Sisa saldo</span><b data-sum-sisa>Rp 0</b></div>
    <p class="alert alert-err" data-sum-kurang hidden>Saldo tidak cukup. Kurangi pesanan atau top up di Petugas Kantin.</p>
    <p class="hint">Satu QR struk berlaku untuk semua kantin dalam pesanan ini. Setiap kantin hanya bisa mengklaim bagiannya sendiri.</p>
    <div class="expire-warn">${icon('clock', 18)}<span><b>Struk berlaku sampai pukul ${jamK} WIB hari ini.</b> Pesanan yang belum diambil sampai jam tersebut otomatis dibatalkan dan uangnya dikembalikan ke saldo.</span></div>
    <form method="post" data-checkout>
      ${ctx.csrfField()}
      <input type="hidden" name="cart" value="[]">
      <button class="btn btn-primary btn-block btn-lg" data-pay>${icon('check', 18)} Bayar sekarang</button>
    </form>
    <button type="button" class="btn btn-ghost btn-block" data-cart-clear>Kosongkan keranjang</button>
  </section>
</div>`, { back: url('beranda') });
}

/* ---------------- Struk + QR (pembeli & petugas) ---------------- */
export async function struk(ctx) {
  const u = ctx.user;
  const kode = String(ctx.q.kode || '').trim().toUpperCase();
  const t = await ctx.first('SELECT t.*, us.nama, us.username, us.kelas FROM transaksi t JOIN users us ON us.id = t.user_id WHERE t.kode = ?', kode);
  if (!t || (u.role === 'pembeli' && t.user_id !== u.id)) {
    ctx.flash('err', 'Struk tidak ditemukan.');
    return ctx.redirect(url('beranda'));
  }
  if (ctx.isPost) {
    const f = await ctx.csrf();
    const pid = parseInt(f.batal, 10) || 0;
    const own = await ctx.val('SELECT COUNT(*) FROM pesanan WHERE id = ? AND transaksi_id = ?', pid, t.id);
    const alasan = u.role === 'pembeli' ? 'Dibatalkan pembeli' : 'Dibatalkan petugas';
    if (own && await batalkanPesanan(ctx, pid, 'dibatalkan', alasan, u.id)) ctx.flash('ok', 'Pesanan dibatalkan. Dana sudah dikembalikan ke saldo.');
    else ctx.flash('err', 'Pesanan tidak bisa dibatalkan (mungkin sudah diambil).');
    return ctx.redirect(url('struk', { kode }));
  }
  const pesanan = await ctx.all('SELECT ps.*, k.nama AS kantin, k.warna FROM pesanan ps JOIN kantin k ON k.id = ps.kantin_id WHERE ps.transaksi_id = ? ORDER BY ps.id', t.id);
  const items = {};
  for (const it of await ctx.all('SELECT pi.* FROM pesanan_item pi JOIN pesanan ps ON ps.id = pi.pesanan_id WHERE ps.transaksi_id = ?', t.id)) {
    (items[it.pesanan_id] = items[it.pesanan_id] || []).push(it);
  }
  const menunggu = pesanan.filter((p) => p.status === 'menunggu').length;
  const jam = await jamTutup(ctx);
  const batas = batasBerlaku(t.created_at, jam);
  const sisa = detikTersisa(batas);
  const stempel = pesanan.some((p) => p.status === 'selesai') ? 'SELESAI' : pesanan.some((p) => p.status === 'kedaluwarsa') ? 'KEDALUWARSA' : 'BATAL';
  const sig = pesanan.map((p) => p.status).join(',');
  const clear = !!ctx.sess.clear_cart;
  delete ctx.sess.clear_cart;
  return ctx.page('Struk ' + kode, html`
${clear ? raw('<script>window.CLEAR_CART = true;</script>') : ''}
<article class="struk" data-struk data-kode="${kode}" data-sig="${sig}" data-live="${menunggu ? '1' : '0'}">
  <header class="struk-head">
    <img src="/assets/img/logo-sma.png" alt="">
    <div><b>Smanesa Kantin Digital</b><small>Bukti pembayaran sah</small></div>
  </header>
  <div class="qr-box${menunggu ? '' : ' is-used'}">
    <div class="qr" data-qr="${kode}" aria-label="QR ${kode}"></div>
    ${menunggu ? '' : html`<div class="qr-stamp${stempel !== 'SELESAI' ? ' bad' : ''}">${stempel}</div>`}
  </div>
  <p class="kode">${kode}</p>
  <p class="center muted small">${menunggu ? `Tunjukkan QR ini ke kantin. Struk berlaku untuk ${pesanan.length} kantin.` : 'Semua pesanan pada struk ini sudah diproses.'}</p>
  ${menunggu ? html`<div class="expire-warn">${icon('clock', 18)}<span>
    <b>Berlaku sampai ${tgl(batas)} WIB</b> · <span data-countdown="${sisa}">${sisa > 0 ? 'menghitung…' : 'kedaluwarsa'}</span><br>
    Jika belum diambil sampai jam tersebut, pesanan otomatis dibatalkan dan uang dikembalikan ke saldo Anda.</span></div>` : ''}
  <dl class="struk-meta">
    <div><dt>Pembeli</dt><dd>${t.nama}${t.kelas ? ` (${t.kelas})` : ''}</dd></div>
    <div><dt>Waktu</dt><dd>${tgl(t.created_at)}</dd></div>
  </dl>
  ${pesanan.map((p) => html`
  <section class="struk-kantin" style="--k: ${p.warna}">
    <div class="row-between"><b>${p.kantin}</b>${statusBadge(p.status)}</div>
    <table class="struk-items">
      ${(items[p.id] || []).map((it) => html`<tr><td>${it.qty}×</td><td>${it.nama}<small>${rupiah(it.harga)}</small></td><td>${rupiah(it.harga * it.qty)}</td></tr>`)}
      <tr class="sub"><td></td><td>Subtotal</td><td>${rupiah(p.subtotal)}</td></tr>
    </table>
    ${p.status !== 'menunggu' && p.diproses_at ? html`<p class="small muted">${p.status === 'selesai' ? 'Diambil' : 'Diproses'} ${tgl(p.diproses_at)}${p.catatan ? ' — ' + p.catatan : ''}</p>` : ''}
    ${p.status === 'menunggu' ? html`<form method="post" data-confirm="Batalkan pesanan di ${p.kantin}? Dana ${rupiah(p.subtotal)} dikembalikan ke saldo.">
      ${ctx.csrfField()}
      <button class="btn btn-ghost btn-sm danger" name="batal" value="${p.id}">${icon('x', 14)} Batalkan pesanan ini</button>
    </form>` : ''}
  </section>`)}
  <div class="struk-total row-between"><span>Total dibayar</span><b>${rupiah(t.total)}</b></div>
</article>
<p class="center"><button type="button" class="btn btn-ghost" onclick="window.print()">${icon('printer', 16)} Cetak / simpan</button></p>`,
  { back: u.role === 'pembeli' ? url('beranda') : url('pesanan'), scripts: ['/assets/js/qr.js'] });
}

export async function status(ctx) {
  const kode = String(ctx.q.kode || '').trim().toUpperCase();
  const t = await ctx.first('SELECT id, user_id FROM transaksi WHERE kode = ?', kode);
  if (!t || t.user_id !== ctx.user.id) return ctx.json({ ok: false }, 404);
  const st = await ctx.all('SELECT status FROM pesanan WHERE transaksi_id = ? ORDER BY id', t.id);
  return ctx.json({ ok: true, sig: st.map((s) => s.status).join(',') });
}

/* ---------------- Riwayat ---------------- */
export async function pembeliRiwayat(ctx) {
  const u = ctx.user;
  const tab = ctx.q.tab === 'saldo' ? 'saldo' : 'belanja';
  let body;
  if (tab === 'belanja') {
    const trx = await ctx.all(`SELECT t.*,
        (SELECT COUNT(*) FROM pesanan ps WHERE ps.transaksi_id = t.id AND ps.status = 'menunggu') AS menunggu,
        (SELECT COUNT(*) FROM pesanan ps WHERE ps.transaksi_id = t.id) AS jml
      FROM transaksi t WHERE t.user_id = ? ORDER BY t.id DESC LIMIT 30`, u.id);
    body = html`${!trx.length ? html`<div class="card empty"><p>Belum ada belanja.</p></div>` : ''}
    <div class="list">${trx.map((t) => html`
      <a class="list-item" href="${url('struk', { kode: t.kode })}">
        <span class="li-ic ${t.menunggu ? 'warn' : 'ok'}">${icon(t.menunggu ? 'clock' : 'check', 18)}</span>
        <span class="li-main"><b>${t.kode}</b><small>${tgl(t.created_at)} · ${t.jml} kantin</small></span>
        <span class="li-end">${rupiah(t.total)}<small>${t.menunggu ? 'Belum diambil' : 'Selesai'}</small></span>
      </a>`)}</div>`;
  } else {
    const mut = await ctx.all("SELECT * FROM mutasi WHERE pihak = 'user' AND pihak_id = ? ORDER BY id DESC LIMIT 50", u.id);
    body = html`${!mut.length ? html`<div class="card empty"><p>Belum ada mutasi saldo.</p></div>` : ''}
    <div class="list">${mut.map((m) => {
      const plus = m.nominal > 0;
      return html`<div class="list-item">
        <span class="li-ic ${plus ? 'ok' : 'bad'}">${icon(plus ? 'plus' : 'minus', 18)}</span>
        <span class="li-main"><b>${jenisLabel(m.jenis)}</b><small>${m.keterangan} · ${tgl(m.created_at)}</small></span>
        <span class="li-end ${plus ? 'txt-ok' : 'txt-bad'}">${(plus ? '+' : '−') + rupiah(Math.abs(m.nominal))}<small>Saldo ${rupiah(m.saldo_akhir)}</small></span>
      </div>`;
    })}</div>`;
  }
  return ctx.page('Riwayat', html`
<h1 class="page-title">Riwayat</h1>
<div class="seg">
  <a href="${url('riwayat')}" class="${tab === 'belanja' ? 'active' : ''}">Belanja</a>
  <a href="${url('riwayat', { tab: 'saldo' })}" class="${tab === 'saldo' ? 'active' : ''}">Mutasi saldo</a>
</div>
${body}`);
}

export async function harga(ctx) {
  return ctx.page('Daftar harga', html`
<h1 class="page-title">Daftar harga Kantin Smanesa</h1>
<figure class="card flush"><img src="/assets/img/banner-daftar-harga.jpg" alt="Banner menu dan harga Kantin Smanesa" class="full-img"></figure>
<p class="muted small">Harga terkini di aplikasi mengikuti menu masing-masing kantin.</p>`, { back: url('beranda') });
}

/* ---------------- Ajukan pencairan tunai (pembeli & kantin) ---------------- */
export async function tarik(ctx) {
  const u = ctx.user;
  const isKantin = u.role === 'kantin';
  const pihak = isKantin ? 'kantin' : 'user';
  const pid = isKantin ? u.kantin_id : u.id;
  const saldo = (await ctx.val(isKantin ? 'SELECT saldo FROM kantin WHERE id = ?' : 'SELECT saldo FROM users WHERE id = ?', pid)) || 0;
  const tertunda = await penarikanMenunggu(ctx, pihak, pid);
  const bisa = Math.max(0, saldo - tertunda);

  if (ctx.isPost) {
    const f = await ctx.csrf();
    if (f.batal) {
      const n = await ctx.run(`UPDATE penarikan SET status = 'dibatalkan', catatan = 'Dibatalkan sendiri', diproses_at = ?
                               WHERE id = ? AND pihak = ? AND pihak_id = ? AND status = 'menunggu'`, now(), parseInt(f.batal, 10) || 0, pihak, pid);
      ctx.flash(n ? 'ok' : 'err', n ? 'Permintaan dibatalkan.' : 'Permintaan sudah diproses petugas.');
      return ctx.redirect(url('tarik'));
    }
    const n = intInput(f.nominal);
    if (n <= 0) ctx.flash('err', 'Isi nominal yang ingin dicairkan.');
    else if (n > bisa) ctx.flash('err', `Nominal melebihi saldo yang bisa dicairkan (${rupiah(bisa)}).`);
    else {
      let kode;
      do { kode = 'TR-' + randomCode(8); } while (await ctx.val('SELECT COUNT(*) FROM penarikan WHERE kode = ?', kode));
      await ctx.run('INSERT INTO penarikan (kode, pihak, pihak_id, nominal, status, created_at) VALUES (?,?,?,?,?,?)', kode, pihak, pid, n, 'menunggu', now());
      ctx.flash('ok', 'Permintaan dibuat. Tunjukkan QR ini ke <b>Petugas Kantin</b> untuk menerima uang tunai.');
      return ctx.redirect(url('tarik', { kode }));
    }
    return ctx.redirect(url('tarik'));
  }

  const aktif = ctx.q.kode ? await ctx.first('SELECT * FROM penarikan WHERE kode = ? AND pihak = ? AND pihak_id = ?', String(ctx.q.kode).toUpperCase(), pihak, pid) : null;
  const list = await ctx.all('SELECT * FROM penarikan WHERE pihak = ? AND pihak_id = ? ORDER BY id DESC LIMIT 20', pihak, pid);
  const label = { menunggu: ['Menunggu petugas', 'warn'], selesai: ['Uang sudah diterima', 'ok'], ditolak: ['Ditolak petugas', 'bad'], dibatalkan: ['Dibatalkan', 'mute'] };
  const nama = isKantin ? await ctx.val('SELECT nama FROM kantin WHERE id = ?', pid) : u.nama;
  const pct = isKantin ? await persenPotongan(ctx) : 0;
  const pctTxt = String(pct).replace('.', ',') + '%';
  return ctx.page('Cairkan ke tunai', html`
<h1 class="page-title">${isKantin ? 'Cairkan saldo penjualan' : 'Tarik saldo ke uang tunai'}</h1>
${aktif ? html`<article class="struk">
  <header class="struk-head"><img src="/assets/img/logo-sma.png" alt=""><div><b>Permintaan pencairan tunai</b><small>${nama}</small></div></header>
  <div class="qr-box${aktif.status === 'menunggu' ? '' : ' is-used'}">
    <div class="qr" data-qr="${aktif.kode}"></div>
    ${aktif.status !== 'menunggu' ? html`<div class="qr-stamp">${aktif.status === 'selesai' ? 'SELESAI' : 'BATAL'}</div>` : ''}
  </div>
  <p class="kode">${aktif.kode}</p>
  <p class="center big">${rupiah(aktif.nominal)}</p>
  ${pct ? html`<p class="center potong-note">Potongan ${pctTxt}: −${rupiah(hitungPotongan(aktif.nominal, pct))} · diterima <b>${rupiah(aktif.nominal - hitungPotongan(aktif.nominal, pct))}</b></p>` : ''}
  <p class="center"><span class="badge badge-${label[aktif.status][1]}">${label[aktif.status][0]}</span></p>
  <p class="center muted small">${aktif.status === 'menunggu' ? 'Tunjukkan QR ini ke Petugas Kantin. Saldo baru dipotong saat petugas menyerahkan uang tunai.' : tgl(aktif.diproses_at) + (aktif.catatan ? ' — ' + aktif.catatan : '')}</p>
</article>
${aktif.status === 'menunggu' ? raw("<script>setTimeout(function(){ if (document.visibilityState === 'visible') location.reload(); }, 8000);</script>") : ''}` : ''}
<section class="card">
  <div class="row-between"><span>Saldo saat ini</span><b class="big">${rupiah(saldo)}</b></div>
  ${tertunda ? html`<div class="row-between muted small"><span>Sedang diajukan</span><span>− ${rupiah(tertunda)}</span></div>` : ''}
  <div class="row-between"><span>Bisa dicairkan</span><b>${rupiah(bisa)}</b></div>
  ${bisa > 0 ? html`<form method="post" class="stack" data-confirm="Ajukan pencairan tunai?">
    ${ctx.csrfField()}
    <label>Nominal yang dicairkan (Rp)
      <input name="nominal" inputmode="numeric" data-rupiah required class="input-xl" value="${isKantin ? ribuan(bisa) : ''}" placeholder="0">
    </label>
    <div class="quick-amounts">
      ${[10000, 20000, 50000].filter((x) => x <= bisa).map((x) => html`<button type="button" class="chip" data-amount="${x}">${rupiah(x)}</button>`)}
      <button type="button" class="chip" data-amount="${bisa}">Semua</button>
    </div>
    <button class="btn btn-primary btn-lg btn-block">${icon('cash', 18)} Ajukan &amp; buat QR</button>
  </form>` : html`<p class="muted">Tidak ada saldo yang bisa dicairkan saat ini.</p>`}
  ${pct ? html`<p class="potong-note">Pencairan saldo kantin dikenai <b>potongan ${pctTxt}</b> (ketentuan sekolah).
    ${bisa > 0 ? html`Jika dicairkan semua: diterima <b>${rupiah(bisa - hitungPotongan(bisa, pct))}</b>.` : ''}</p>` : ''}
  <p class="hint">Uang tunai diambil langsung di Petugas Kantin dengan menunjukkan QR permintaan.</p>
</section>
${list.length ? html`<section>
  <h2 class="sec-title">Riwayat permintaan</h2>
  <div class="list">${list.map((r) => html`
    <div class="list-item">
      <a class="li-main" href="${url('tarik', { kode: r.kode })}"><b class="mono">${r.kode}</b><small>${tgl(r.created_at)}</small></a>
      <span class="li-end">${rupiah(r.nominal)}<small><span class="badge badge-${label[r.status][1]}">${label[r.status][0]}</span></small></span>
      ${r.status === 'menunggu' ? html`<form method="post" data-confirm="Batalkan permintaan ${r.kode}?">${ctx.csrfField()}
        <button class="btn btn-sm danger" name="batal" value="${r.id}" aria-label="Batalkan">${icon('x', 14)}</button></form>` : ''}
    </div>`)}</div>
</section>` : ''}`, { back: url(isKantin ? 'beranda' : 'akun'), scripts: ['/assets/js/qr.js'] });
}
