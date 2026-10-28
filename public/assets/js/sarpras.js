/* SI-SARPRAS — Sistem Informasi Sarana & Prasarana SMKN 8 Surabaya
   Menu: Beranda · Inventaris Aset · Serah Terima (BAST/BAPB) · Scan QR · Laporan & Cetak
   Pengelola: akun Waka Sarpras & admin (login lewat panel admin website). */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https?:|\/)/i.test(String(u || '').trim()) ? String(u).trim() : '');
const P = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  xls: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 12l5 6M14 12l-5 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  dl: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', set: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
const COND = { Baik: '#16966a', 'Rusak Ringan': '#d98a06', 'Rusak Berat': '#d4364b' };
const COND_LABEL = { Baik: 'Baik', 'Rusak Ringan': 'Rusak Ringan', 'Rusak Berat': 'Rusak Berat' };
const TABS = [['beranda', 'Beranda', 'home'], ['inventaris', 'Inventaris Aset', 'box'], ['serah-terima', 'Serah Terima (BAST/BAPB)', 'doc'], ['scan', 'Scan QR', 'qr'], ['laporan', 'Laporan & Cetak', 'print']];
const DEFAULT_TEMPLATE = {
  instansi1: 'PEMERINTAH PROVINSI JAWA TIMUR', instansi2: 'DINAS PENDIDIKAN', sekolah: 'SMK NEGERI 8 SURABAYA',
  alamat: 'Jl. Kamboja No. 18-20, Ketabang, Kecamatan Genteng, Kota Surabaya, Jawa Timur 60272', kontak: '',
  judul: 'LAPORAN REKAPITULASI INVENTARIS SARANA DAN PRASARANA', kepalaSekolah: '', nipKepala: '', pengelolaSarpras: '', nipPengelola: '', kopImage: '', logo: '',
};

let S = { assets: [], bast: [], locations: [], announcement: {}, template: {}, canEdit: false, user: null };
let tab = 'beranda';
let charts = [];
let scanner = null;
const inv = { q: '', loc: 'ALL', cond: 'ALL' };
const rep = { loc: 'ALL' };
let bastFilter = 'ALL';

// ---------- Utilitas ----------
function toast(msg, type = '') {
  const d = document.createElement('div'); d.className = type; d.textContent = msg;
  $('#toast').appendChild(d); setTimeout(() => d.remove(), 3600);
}
async function api(path, opt = {}) {
  const r = await fetch('/api/' + path, { method: opt.method || 'GET', headers: opt.body ? { 'Content-Type': 'application/json' } : {}, body: opt.body ? JSON.stringify(opt.body) : undefined, credentials: 'same-origin' });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan');
  return d;
}
const loadScript = (src) => new Promise((ok, no) => {
  if ($(`script[src="${src}"]`)) { const t = setInterval(() => { if (src.includes('xlsx') ? window.XLSX : window.Html5Qrcode) { clearInterval(t); ok(); } }, 100); return; }
  const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Pustaka gagal dimuat. Periksa koneksi internet.')); document.head.appendChild(s);
});
const XLSX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const QRSCAN_SRC = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
const sumQty = (arr) => arr.reduce((n, a) => n + (Number(a.quantity) || 1), 0);
const condBadge = (c) => `<span class="badge" style="--c:${COND[c] || '#475569'}">${esc(COND_LABEL[c] || c || '-')}</span>`;
const typeBadge = (t) => `<span class="badge" style="--c:${t === 'BAPB' ? '#d4364b' : '#235ba4'}">${t === 'BAPB' ? 'BAPB' : 'BAST'}</span>`;
const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const fmtLong = (d = new Date()) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
const assetUrl = (a) => `${location.origin}/sarpras?asset=${encodeURIComponent(a.code || a.id)}`;
const findAsset = (key) => { const k = decodeURIComponent(String(key || '')).trim().toLowerCase(); return k && S.assets.find((a) => [a.id, a.code, a.kode_tu].some((v) => v && String(v).toLowerCase() === k)); };
const allLocations = () => { const l = [...S.locations]; S.assets.forEach((a) => { if (a.location && !l.includes(a.location)) l.push(a.location); }); return l; };
function qrInto(el, text, size = 170) {
  el.innerHTML = '';
  if (!window.QRCode) { el.textContent = 'QR belum siap'; return; }
  new QRCode(el, { text, width: size, height: size, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
}

// ---------- Kompres & unggah ----------
async function compress(file, maxW = 1400) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0, c.width, c.height);
  let q = 0.82, blob;
  do { blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q)); q -= 0.12; } while (blob.size > 1.8e6 && q > 0.3);
  return blob;
}
async function upload(file, maxW) {
  let blob = file;
  if (/^image\//.test(file.type)) blob = await compress(file, maxW);
  else if (file.type !== 'application/pdf') throw new Error('Berkas harus gambar (JPG/PNG) atau PDF.');
  if (blob.size > 1.9e6) throw new Error('Ukuran berkas maksimal ±1,9 MB. Kecilkan PDF terlebih dahulu.');
  const r = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': blob.type || 'image/jpeg' }, body: blob });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Gagal mengunggah berkas');
  return d.url;
}

// ---------- Modal ----------
function openModal(html, size = '') {
  $('#modalBody').innerHTML = html;
  $('.sp-dialog').className = 'sp-dialog ' + size;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#modalBody input:not([type=hidden]):not([type=file]), #modalBody select')?.focus(), 30);
}
function closeModal() {
  $('#modal').hidden = true; document.body.style.overflow = '';
  if (scanner && tab !== 'scan') stopScan();
}
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

// ---------- Data ----------
async function load() {
  const d = await api('sarpras?_=' + Date.now());
  S = { ...S, ...d, template: { ...DEFAULT_TEMPLATE, ...(d.template || {}) } };
  $('#mode').textContent = S.canEdit ? `Mode Admin · ${S.user?.name || ''}` : 'Mode: Publik';
  $('#mode').classList.toggle('admin', S.canEdit);
  $('#authBtn').innerHTML = S.canEdit
    ? `<a class="btn ghost-w sm" href="/admin/">Panel admin</a> <button class="btn ghost-w sm" id="logout">Keluar</button>`
    : `<a class="btn orange sm" href="/admin/?next=/sarpras">Login Admin</a>`;
  $('#logout')?.addEventListener('click', async () => { await api('auth/logout', { method: 'POST', body: {} }).catch(() => {}); location.reload(); });
}
async function refresh() { await load(); render(); }

// ---------- Navigasi ----------
function setTab(t, push = true) {
  if (!TABS.some((x) => x[0] === t)) t = 'beranda';
  if (tab === 'scan' && t !== 'scan') stopScan();
  tab = t;
  if (push) history.replaceState(null, '', '/sarpras#' + t);
  render();
  window.scrollTo({ top: 0 });
}
function renderTabs() {
  $('#tabs').innerHTML = TABS.map(([id, l, i]) => `<a href="#${id}" data-tab="${id}" class="${id === tab ? 'on' : ''}">${ic(i)}${l}</a>`).join('');
}
$('#tabs').addEventListener('click', (e) => { const a = e.target.closest('[data-tab]'); if (!a) return; e.preventDefault(); setTab(a.dataset.tab); });

function render() {
  renderTabs();
  charts.forEach((c) => c.destroy()); charts = [];
  const m = $('#main');
  ({ beranda: viewHome, inventaris: viewInventory, 'serah-terima': viewBast, scan: viewScan, laporan: viewReport })[tab](m);
}

// ---------- Beranda ----------
function viewHome(m) {
  const a = S.announcement || {};
  const good = sumQty(S.assets.filter((x) => x.condition === 'Baik'));
  const light = sumQty(S.assets.filter((x) => x.condition === 'Rusak Ringan'));
  const heavy = sumQty(S.assets.filter((x) => x.condition === 'Rusak Berat'));
  m.innerHTML = `
  <section class="banner" style="${safeUrl(a.bgImage) ? `background-image:url('${esc(safeUrl(a.bgImage))}')` : ''}">
    <div class="banner-in"><span class="tag mono">Pengumuman Sarpras</span>${a.date ? `<span class="date mono">${esc(a.date)}</span>` : ''}
      <h2>${esc(a.title || 'Selamat datang di SI-SARPRAS')}</h2><p>${esc(a.content || 'Sistem informasi sarana dan prasarana SMK Negeri 8 Surabaya.')}</p></div>
    ${S.canEdit ? `<button class="btn ghost-w sm edit" id="editBanner">${ic('edit')} Edit Banner</button>` : ''}
  </section>
  <div class="stats">
    <div class="stat" style="--c:#235ba4"><b>${sumQty(S.assets)}</b><span>Total Aset</span><small>${S.assets.length} jenis barang tercatat</small></div>
    <div class="stat" style="--c:#16966a"><b>${good}</b><span>Kondisi Baik</span><small>Siap digunakan</small></div>
    <div class="stat" style="--c:#d98a06"><b>${light}</b><span>Perlu Perbaikan</span><small>Rusak ringan</small></div>
    <div class="stat" style="--c:#d4364b"><b>${heavy}</b><span>Rusak Berat</span><small>Penggantian / afkir</small></div>
    <div class="stat" style="--c:#0d1a2e"><b>${S.bast.length}</b><span>Dokumen BAST</span><small>Surat terarsip</small></div>
  </div>
  <div class="charts">
    <div class="card"><div class="card-h"><div><h2>Sebaran Aset per Lokasi / Bengkel</h2><p>Distribusi unit barang berdasarkan lokasi</p></div><span class="live mono">Langsung dari data</span></div>
      <div class="card-b"><div class="chart-box tall" id="locBox"><canvas id="chLoc"></canvas></div></div></div>
    <div class="card"><div class="card-h"><div><h2>Proporsi Kondisi Aset</h2><p>Persentase kelayakan sarana</p></div></div>
      <div class="card-b"><div class="chart-box"><canvas id="chCond"></canvas></div></div></div>
  </div>
  <div class="card"><div class="card-h"><div><h2>Riwayat Serah Terima & BAPB Terkini</h2><p>Laporan BAST dan BAPB yang baru diinput</p></div><button class="btn sm" data-go="serah-terima">Lihat Semua</button></div>
    ${bastTable(S.bast.slice(0, 5), false)}</div>`;
  $('[data-go]', m).onclick = () => setTab('serah-terima');
  $('#editBanner')?.addEventListener('click', editBanner);
  drawCharts(good, light, heavy);
}
function drawCharts(good, light, heavy) {
  if (!window.Chart) { setTimeout(() => tab === 'beranda' && drawCharts(good, light, heavy), 300); return; }
  const counts = {};
  S.assets.forEach((a) => { const k = a.location || 'Belum diatur'; counts[k] = (counts[k] || 0) + (Number(a.quantity) || 1); });
  const rows = Object.entries(counts).sort((x, y) => y[1] - x[1]);
  $('#locBox').style.height = Math.max(260, rows.length * 24 + 40) + 'px';
  const short = (s) => (s.length > 34 ? s.slice(0, 32) + '…' : s);
  charts.push(new Chart($('#chLoc'), {
    type: 'bar',
    data: { labels: rows.map((r) => short(r[0])), datasets: [{ label: 'Jumlah unit', data: rows.map((r) => r[1]), backgroundColor: '#235ba4', borderRadius: 4, maxBarThickness: 18 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (it) => rows[it[0].dataIndex][0] } } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { ticks: { font: { size: 11 } } } } },
  }));
  charts.push(new Chart($('#chCond'), {
    type: 'doughnut',
    data: { labels: ['Baik', 'Rusak Ringan', 'Rusak Berat'], datasets: [{ data: [good, light, heavy], backgroundColor: ['#16966a', '#f2a51a', '#d4364b'], borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } },
  }));
}

// ---------- Inventaris ----------
function viewInventory(m) {
  const locs = allLocations();
  m.innerHTML = `
  <div class="page-h"><div><h1>Daftar Inventaris Sarpras</h1><p>Kelola dan pantau seluruh aset milik SMK Negeri 8 Surabaya.</p></div>
    ${S.canEdit ? `<div class="actions"><button class="btn" id="bImport">${ic('xls')} Impor Excel</button><button class="btn" id="bLoc">${ic('pin')} Kelola Lokasi</button><button class="btn primary" id="bAdd">${ic('plus')} Tambah Aset</button></div>` : ''}</div>
  <div class="card">
    <div class="tool">
      <label class="search">${ic('search')}<input type="search" id="q" placeholder="Cari nama barang, kode barang, atau kode TU…" value="${esc(inv.q)}"></label>
      <select id="fLoc"><option value="ALL">— Semua Lokasi / Bengkel —</option>${locs.map((l) => `<option ${l === inv.loc ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <select id="fCond"><option value="ALL">— Semua Kondisi —</option>${Object.keys(COND).map((c) => `<option value="${c}" ${c === inv.cond ? 'selected' : ''}>${c === 'Rusak Ringan' ? 'Perlu Perbaikan (Rusak Ringan)' : c}</option>`).join('')}</select>
    </div>
    <div class="count" id="invCount"></div>
    <div class="table-wrap"><table class="t"><thead><tr><th>No</th><th>QR</th><th>Nama Sarpras & Spesifikasi</th><th>Kode TU</th><th>Lokasi</th><th class="c">Jml</th><th>Kondisi</th><th>Pengadaan</th><th>Serah Terima</th><th>Foto</th>${S.canEdit ? '<th class="r">Aksi</th>' : ''}</tr></thead><tbody id="invBody"></tbody></table></div>
  </div>`;
  const draw = () => {
    const q = inv.q.toLowerCase();
    const list = S.assets.filter((a) => (!q || [a.name, a.code, a.kode_tu, a.specs].some((v) => String(v || '').toLowerCase().includes(q)))
      && (inv.loc === 'ALL' || a.location === inv.loc) && (inv.cond === 'ALL' || a.condition === inv.cond));
    $('#invCount').textContent = `${list.length} jenis barang · ${sumQty(list)} unit`;
    $('#invBody').innerHTML = list.length ? list.map((a, i) => `<tr>
      <td class="mono muted">${i + 1}</td>
      <td><button class="icon-btn qr" data-qr="${esc(a.id)}" title="Lihat & cetak QR Code">${ic('qr')}</button></td>
      <td><div class="nm">${esc(a.name)}</div><div class="sub">${esc(a.specs || '-')}</div><div class="sub mono" style="font-size:.66rem">${esc(a.code)}</div></td>
      <td class="tu">${esc(a.kode_tu || '-')}</td>
      <td class="loc">${esc(a.location || 'Belum diatur')}</td>
      <td class="c"><b>${esc(a.quantity)}</b></td>
      <td>${condBadge(a.condition)}</td>
      <td class="nowrap muted">${esc(a.procurement_date || '-')}</td>
      <td class="nowrap muted">${esc(a.handover_date || '-')}</td>
      <td>${a.photo || a.photo_link ? `<button class="link" data-detail="${esc(a.id)}">${ic('img')} Lihat Foto</button>` : '<span class="muted">-</span>'}</td>
      ${S.canEdit ? `<td class="r"><button class="icon-btn" data-detail="${esc(a.id)}" title="Rincian">${ic('search')}</button><button class="icon-btn" data-edit="${esc(a.id)}" title="Edit aset">${ic('edit')}</button><button class="icon-btn del" data-del="${esc(a.id)}" title="Hapus aset">${ic('trash')}</button></td>` : ''}
    </tr>`).join('') : `<tr><td colspan="11"><div class="empty">Tidak ada aset ditemukan.</div></td></tr>`;
  };
  draw();
  $('#q').oninput = (e) => { inv.q = e.target.value; draw(); };
  $('#fLoc').onchange = (e) => { inv.loc = e.target.value; draw(); };
  $('#fCond').onchange = (e) => { inv.cond = e.target.value; draw(); };
  $('#invBody').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.qr) showQR(b.dataset.qr);
    if (b.dataset.detail) showDetail(findAsset(b.dataset.detail));
    if (b.dataset.edit) assetForm(S.assets.find((a) => a.id === b.dataset.edit));
    if (b.dataset.del) deleteAsset(b.dataset.del);
  };
  $('#bAdd')?.addEventListener('click', () => assetForm());
  $('#bLoc')?.addEventListener('click', manageLocations);
  $('#bImport')?.addEventListener('click', importExcel);
}

function showDetail(a) {
  if (!a) { toast('Data barang tidak ditemukan dalam sistem!', 'error'); return false; }
  const photo = safeUrl(a.photo), link = safeUrl(a.photo_link);
  openModal(`<h3>${esc(a.name)}</h3><p class="lead">Rincian informasi sarpras</p>
    <div class="detail"><dl class="dl">
      <dt>Kode Barang</dt><dd class="mono" style="font-size:.85rem">${esc(a.code || '-')}</dd>
      <dt>Kode TU</dt><dd>${esc(a.kode_tu || '-')}</dd>
      <dt>Spesifikasi & Merk</dt><dd>${esc(a.specs || 'Tidak ada rincian spesifikasi.')}</dd>
      <dt>Lokasi / Bengkel</dt><dd>${esc(a.location || 'Belum diatur')}</dd>
      <dt>Jumlah</dt><dd>${esc(a.quantity || 1)} unit</dd>
      <dt>Kondisi</dt><dd>${condBadge(a.condition)}</dd>
      <dt>Tgl Pengadaan</dt><dd>${esc(a.procurement_date || '-')}</dd>
      <dt>Tgl Serah Terima</dt><dd>${esc(a.handover_date || '-')}</dd>
    </dl><div class="qrbox"><div class="qr-canvas" id="dq"></div><div class="mono muted" style="margin-top:6px">${esc(a.code)}</div></div></div>
    ${photo ? `<div class="photo"><a href="${esc(link || photo)}" target="_blank" rel="noopener"><img src="${esc(photo)}" alt="Foto ${esc(a.name)}" referrerpolicy="no-referrer" onerror="this.closest('.photo').innerHTML='<div class=empty>Foto tidak dapat ditampilkan. Buka melalui tautan Drive.</div>'"></a></div>` : ''}
    <div class="foot">${link ? `<a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${ic('cloud')} Buka di Google Drive</a>` : ''}
      <button class="btn" id="dPrint">${ic('print')} Cetak Stiker QR</button>
      ${S.canEdit ? `<button class="btn primary" id="dEdit">${ic('edit')} Edit</button>` : ''}</div>`, 'wide');
  qrInto($('#dq'), assetUrl(a), 150);
  $('#dPrint').onclick = () => printSticker(a);
  $('#dEdit')?.addEventListener('click', () => assetForm(a));
  return true;
}
function showQR(id) {
  const a = S.assets.find((x) => x.id === id); if (!a) return;
  openModal(`<h3>${esc(a.name)}</h3><p class="lead">Kode TU: ${esc(a.kode_tu || '-')}</p>
    <div style="text-align:center"><div class="qr-canvas" id="qv"></div><div class="mono muted" style="margin-top:8px">${esc(a.code)}</div>
    <p class="muted" style="font-size:.8rem;margin:10px 0 0">Pindai QR untuk membuka rincian barang ini.</p></div>
    <div class="foot"><button class="btn" data-close>Tutup</button><button class="btn primary" id="qp">${ic('print')} Cetak Stiker QR</button></div>`, 'narrow');
  qrInto($('#qv'), assetUrl(a));
  $('#qp').onclick = () => printSticker(a);
}
function printSticker(a) {
  const tmp = document.createElement('div'); qrInto(tmp, assetUrl(a), 200);
  setTimeout(() => {
    const img = tmp.querySelector('canvas')?.toDataURL('image/png') || tmp.querySelector('img')?.src || '';
    const w = window.open('', '_blank', 'width=460,height=600');
    if (!w) { toast('Izinkan pop-up untuk mencetak stiker.', 'error'); return; }
    w.document.write(`<!doctype html><html><head><title>Cetak QR - ${esc(a.name)}</title><style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center}
      .s{border:2px solid #000;border-radius:12px;padding:14px;max-width:300px;margin:0 auto}
      .h{font-size:11px;font-weight:bold;color:#1e3a8a;text-transform:uppercase}
      .t{font-size:14px;font-weight:bold;margin:8px 0 2px}.k{font-size:11px;font-weight:bold;color:#2563eb}
      .c{font-family:monospace;font-size:11px;color:#64748b;margin-bottom:8px}img{width:160px;height:160px;margin:4px auto;display:block}
      .f{font-size:9px;color:#94a3b8;margin-top:8px;border-top:1px dashed #ccc;padding-top:6px}</style></head><body>
      <div class="s"><div class="h">SMK NEGERI 8 SURABAYA</div><div class="t">${esc(a.name)}</div><div class="k">TU: ${esc(a.kode_tu || '-')}</div>
      <div class="c">${esc(a.code)}</div><img src="${img}" alt=""><div class="f">Sistem Informasi Sarpras SMEKDEL'S</div></div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}<\/script></body></html>`);
    w.document.close();
  }, 150);
}

function assetForm(a) {
  const isNew = !a; a = a || { code: 'INV-S8-' + Math.floor(1000 + Math.random() * 9000), condition: 'Baik', quantity: 1, procurement_date: today(), handover_date: today() };
  const locs = allLocations();
  openModal(`<h3>${isNew ? 'Tambah Aset Sarpras Baru' : 'Edit Aset Sarpras'}</h3><p class="lead">Isian bertanda * wajib diisi.</p>
  <form id="fa" class="grid2">
    <label class="field">Kode Barang / QR *<input name="code" required value="${esc(a.code)}"></label>
    <label class="field">Kode TU *<input name="kode_tu" required value="${esc(a.kode_tu || '')}"></label>
    <label class="field full">Nama Barang Sarpras *<input name="name" required value="${esc(a.name || '')}"></label>
    <label class="field full">Spesifikasi & Merk<textarea name="specs">${esc(a.specs || '')}</textarea></label>
    <label class="field">Lokasi / Bengkel *<input name="location" required list="locs" value="${esc(a.location || '')}" placeholder="Pilih atau ketik lokasi"><datalist id="locs">${locs.map((l) => `<option value="${esc(l)}">`).join('')}</datalist></label>
    <label class="field">Kondisi *<select name="condition">${Object.keys(COND).map((c) => `<option ${c === a.condition ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
    <label class="field">Jumlah Unit *<input name="quantity" type="number" min="1" required value="${esc(a.quantity || 1)}"></label>
    <span></span>
    <label class="field">Tgl Pengadaan<input name="procurement_date" value="${esc(a.procurement_date || '')}" placeholder="2026-01-15"><small>Format bebas, disarankan TTTT-BB-HH</small></label>
    <label class="field">Tgl Serah Terima<input name="handover_date" value="${esc(a.handover_date || '')}" placeholder="2026-01-20"></label>
    <div class="field full">Dokumentasi (foto barang)
      <div class="upl"><span class="pv" id="pv" style="${a.photo ? `background-image:url('${esc(safeUrl(a.photo))}')` : ''}">${a.photo ? '' : 'Belum ada'}</span>
        <input type="file" id="pf" accept="image/*" capture="environment"><button type="button" class="btn sm danger" id="pclr" ${a.photo ? '' : 'hidden'}>Hapus foto</button></div>
      <input type="hidden" name="photo" value="${esc(a.photo || '')}"><input type="hidden" name="photo_link" value="${esc(a.photo_link || '')}">
      <small>Foto otomatis diperkecil sebelum diunggah.</small></div>
    <div class="foot full"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" id="fs">Simpan Aset</button></div>
  </form>`, 'wide');
  const f = $('#fa');
  $('#pf').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    $('#fs').disabled = true; $('#pv').textContent = '…';
    try { const url = await upload(file, 1400); f.photo.value = url; f.photo_link.value = ''; $('#pv').style.backgroundImage = `url('${url}')`; $('#pv').textContent = ''; $('#pclr').hidden = false; }
    catch (er) { toast(er.message, 'error'); $('#pv').textContent = 'Gagal'; }
    $('#fs').disabled = false;
  };
  $('#pclr').onclick = () => { f.photo.value = ''; f.photo_link.value = ''; $('#pv').style.backgroundImage = ''; $('#pv').textContent = 'Belum ada'; $('#pclr').hidden = true; };
  f.onsubmit = async (e) => {
    e.preventDefault(); $('#fs').disabled = true;
    const body = Object.fromEntries(new FormData(f));
    try {
      await api('sarpras/assets' + (isNew ? '' : '/' + encodeURIComponent(a.id)), { method: isNew ? 'POST' : 'PUT', body });
      if (body.location && !S.locations.includes(body.location)) await api('sarpras/meta', { method: 'PUT', body: { locations: [...S.locations, body.location] } });
      closeModal(); toast(isNew ? 'Aset baru tersimpan!' : 'Perubahan aset tersimpan!', 'success'); await refresh();
    } catch (er) { toast(er.message, 'error'); $('#fs').disabled = false; }
  };
}
async function deleteAsset(id) {
  const a = S.assets.find((x) => x.id === id);
  if (!a || !confirm(`Hapus aset "${a.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
  try { await api('sarpras/assets/' + encodeURIComponent(id), { method: 'DELETE' }); toast('Aset dihapus.', 'success'); await refresh(); }
  catch (er) { toast(er.message, 'error'); }
}

function manageLocations() {
  const draw = () => {
    const used = {}; S.assets.forEach((a) => { used[a.location] = (used[a.location] || 0) + 1; });
    $('#ll').innerHTML = S.locations.length ? S.locations.map((l, i) => `<li><span>${esc(l)}</span><span><span class="n">${used[l] || 0} aset</span> <button class="icon-btn del" data-i="${i}" title="Hapus lokasi">${ic('trash')}</button></span></li>`).join('') : '<li class="muted">Belum ada lokasi.</li>';
  };
  openModal(`<h3>Kelola Lokasi / Bengkel</h3><p class="lead">Daftar lokasi untuk pilihan saat menambah aset. Menghapus lokasi tidak menghapus aset di dalamnya.</p>
    <form id="fl" style="display:flex;gap:8px"><label class="field" style="flex:1"><input id="nl" placeholder="Nama lokasi baru, mis. Lab Kuliner 2" required></label><button class="btn primary">${ic('plus')} Tambah</button></form>
    <ul class="loc-list" id="ll"></ul><div class="foot"><button class="btn" data-close>Selesai</button></div>`);
  draw();
  const save = async (locs) => { await api('sarpras/meta', { method: 'PUT', body: { locations: locs } }); S.locations = locs; draw(); };
  $('#fl').onsubmit = async (e) => {
    e.preventDefault(); const v = $('#nl').value.trim(); if (!v) return;
    if (S.locations.includes(v)) { toast('Lokasi sudah ada.'); return; }
    try { await save([...S.locations, v]); $('#nl').value = ''; toast('Lokasi ditambahkan!', 'success'); } catch (er) { toast(er.message, 'error'); }
  };
  $('#ll').onclick = async (e) => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    if (!confirm('Hapus lokasi ini dari daftar?')) return;
    try { await save(S.locations.filter((_, i) => i !== +b.dataset.i)); } catch (er) { toast(er.message, 'error'); }
  };
  $('#modal').addEventListener('click', function once(e) { if (e.target.id === 'modal' || e.target.closest('[data-close]')) { $('#modal').removeEventListener('click', once); render(); } });
}

function importExcel() {
  openModal(`<h3>Impor Data Aset via Excel</h3><p class="lead">Unggah file .xlsx dengan kolom: Kode Barang, Kode TU, Nama Barang, Spesifikasi, Lokasi, Kondisi, Jumlah, Tgl Pengadaan, Tgl Serah Terima.</p>
    <div class="note">Belum punya formatnya? <button class="link" id="tpl">${ic('dl')} Unduh template Excel</button></div>
    <form id="fx" style="margin-top:16px"><label class="field">Berkas Excel (.xlsx / .xls)<input type="file" id="xf" accept=".xlsx,.xls,.csv" required></label>
      <div id="xprev" class="muted" style="font-size:.85rem;margin-top:10px"></div>
      <div class="foot"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" id="xs">Proses Impor Aset</button></div></form>`);
  $('#tpl').onclick = async () => {
    try {
      await loadScript(XLSX_SRC);
      const rows = [
        { 'Kode Barang': 'INV-S8-1001', 'Kode TU': '12.01.05.10', 'Nama Barang': 'Laptop Core i5 16GB', Spesifikasi: 'Lenovo ThinkPad SSD 512GB', Lokasi: S.locations[0] || 'Lab RPL', Kondisi: 'Baik', Jumlah: 5, 'Tgl Pengadaan': '2026-01-15', 'Tgl Serah Terima': '2026-01-20' },
        { 'Kode Barang': 'INV-S8-1002', 'Kode TU': '12.01.05.11', 'Nama Barang': 'Proyektor EPSON 3300 Lumens', Spesifikasi: 'Epson EB-E500 HDMI', Lokasi: S.locations[1] || 'Ruang Guru', Kondisi: 'Baik', Jumlah: 2, 'Tgl Pengadaan': '2026-02-10', 'Tgl Serah Terima': '2026-02-12' },
      ];
      const ws = XLSX.utils.json_to_sheet(rows); ws['!cols'] = [16, 16, 30, 35, 22, 15, 10, 15, 15].map((wch) => ({ wch }));
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Template Inventaris');
      XLSX.writeFile(wb, 'Template_Inventaris_Sarpras_SMKN8.xlsx'); toast('Template Excel berhasil diunduh!', 'success');
    } catch (er) { toast(er.message, 'error'); }
  };
  let parsed = [];
  const pick = (r, keys) => { for (const k of keys) { const hit = Object.keys(r).find((x) => x.trim().toLowerCase() === k.toLowerCase()); if (hit && String(r[hit]).trim() !== '') return r[hit]; } return ''; };
  const dateStr = (v) => (v instanceof Date ? new Date(v.getTime() - v.getTimezoneOffset() * 60e3).toISOString().slice(0, 10) : String(v || '').trim());
  $('#xf').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    $('#xprev').textContent = 'Membaca berkas…';
    try {
      await loadScript(XLSX_SRC);
      const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: true });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      parsed = rows.map((r) => {
        let cond = String(pick(r, ['Kondisi']) || 'Baik').trim(); if (!COND[cond]) cond = 'Baik';
        const qty = parseInt(pick(r, ['Jumlah', 'Qty', 'Jml']), 10);
        return {
          code: String(pick(r, ['Kode Barang', 'Kode QR', 'Kode']) || '').trim(), kode_tu: String(pick(r, ['Kode TU']) || '').trim(),
          name: String(pick(r, ['Nama Barang', 'Nama', 'name']) || '').trim(), specs: String(pick(r, ['Spesifikasi', 'Specs', 'Spesifikasi & Merk']) || '').trim(),
          location: String(pick(r, ['Lokasi', 'Lokasi / Bengkel']) || S.locations[0] || 'Umum').trim(), condition: cond, quantity: qty > 0 ? qty : 1,
          procurement_date: dateStr(pick(r, ['Tgl Pengadaan', 'Tanggal Pengadaan'])) || today(), handover_date: dateStr(pick(r, ['Tgl Serah Terima', 'Tanggal Serah Terima'])) || today(),
        };
      }).filter((x) => x.name).map((x) => ({ ...x, kode_tu: x.kode_tu || '12.01.00.' + Math.floor(1000 + Math.random() * 9000) }));
      $('#xprev').innerHTML = parsed.length ? `<b>${parsed.length}</b> aset siap diimpor (${sumQty(parsed)} unit). Contoh: ${parsed.slice(0, 3).map((x) => esc(x.name)).join(', ')}…` : 'Tidak ada baris dengan kolom "Nama Barang".';
    } catch (er) { $('#xprev').textContent = 'Gagal membaca berkas: ' + er.message; parsed = []; }
  };
  $('#fx').onsubmit = async (e) => {
    e.preventDefault();
    if (!parsed.length) { toast('Tidak ada data aset valid di berkas Excel.', 'error'); return; }
    $('#xs').disabled = true; $('#xs').textContent = 'Memproses Excel…';
    try { const r = await api('sarpras/assets/import', { method: 'POST', body: { items: parsed } }); closeModal(); toast(`Berhasil mengimpor ${r.count} aset dari Excel!`, 'success'); await refresh(); }
    catch (er) { toast(er.message, 'error'); $('#xs').disabled = false; $('#xs').textContent = 'Proses Impor Aset'; }
  };
}

// ---------- Serah Terima ----------
function bastTable(list, actions) {
  if (!list.length) return `<div class="empty">Belum ada dokumen Berita Acara terarsip.</div>`;
  return `<div class="table-wrap"><table class="t"><thead><tr><th>No. Surat</th><th>Jenis</th><th>Pihak Pertama</th><th>Pihak Kedua / Alasan</th><th>Nama Barang</th><th>Tgl Berita Acara</th><th>Berkas</th>${actions ? '<th class="r">Aksi</th>' : ''}</tr></thead><tbody>
    ${list.map((d) => { const f = safeUrl(d.file) || safeUrl(d.file_link); return `<tr>
      <td class="mono" style="font-size:.74rem;font-weight:600">${esc(d.no_surat)}</td><td>${typeBadge(d.type)}</td>
      <td class="nm">${esc(d.pihak1)}</td><td>${esc(d.pihak2)}</td><td>${esc(d.asset_name)} <span class="muted">(${esc(d.qty)} unit)</span></td>
      <td class="nowrap muted">${esc(d.date)}</td>
      <td>${f ? `<a class="file-pill" href="${esc(f)}" target="_blank" rel="noopener">${ic(d.file ? 'doc' : 'cloud')}${d.file ? 'Lihat berkas' : 'Google Drive'}</a>` : '<span class="muted" style="font-size:.78rem">Tanpa berkas</span>'}</td>
      ${actions ? `<td class="r"><button class="icon-btn" data-bedit="${esc(d.id)}" title="Edit">${ic('edit')}</button><button class="icon-btn del" data-bdel="${esc(d.id)}" title="Hapus">${ic('trash')}</button></td>` : ''}
    </tr>`; }).join('')}</tbody></table></div>`;
}
function viewBast(m) {
  m.innerHTML = `
  <div class="page-h"><div><h1>Serah Terima & Penghapusan Barang</h1><p>Arsip Berita Acara Serah Terima (BAST) dan Berita Acara Penghapusan Barang (BAPB).</p></div>
    ${S.canEdit ? `<div class="actions"><button class="btn primary" id="bNew">${ic('plus')} Buat Berita Acara</button></div>` : ''}</div>
  <div class="card"><div class="tool"><select id="bf"><option value="ALL">— Semua Jenis Berita Acara —</option><option value="BAST">Berita Acara Serah Terima (BAST)</option><option value="BAPB">Berita Acara Penghapusan Barang (BAPB)</option></select></div>
    <div id="bt"></div></div>`;
  const draw = () => { $('#bt').innerHTML = bastTable(S.bast.filter((d) => bastFilter === 'ALL' || d.type === bastFilter), S.canEdit); };
  $('#bf').value = bastFilter; draw();
  $('#bf').onchange = (e) => { bastFilter = e.target.value; draw(); };
  $('#bNew')?.addEventListener('click', () => bastForm());
  $('#bt').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.bedit) bastForm(S.bast.find((d) => d.id === b.dataset.bedit));
    if (b.dataset.bdel) deleteBast(b.dataset.bdel);
  };
}
function bastForm(d) {
  const isNew = !d;
  const year = new Date().getFullYear();
  d = d || { type: 'BAST', no_surat: `${String(S.bast.length + 1).padStart(3, '0')}/BAST-SARPRAS/S8/${year}`, qty: 1, date: today() };
  openModal(`<h3>${isNew ? 'Buat Berita Acara BAST / BAPB' : 'Edit Berita Acara BAST / BAPB'}</h3><p class="lead">Isian bertanda * wajib diisi.</p>
  <form id="fb" class="grid2">
    <label class="field full">Jenis Berita Acara *<select name="type"><option value="BAST">Berita Acara Serah Terima (BAST)</option><option value="BAPB">Berita Acara Penghapusan Barang (BAPB)</option></select></label>
    <label class="field full">Nomor Surat / Berita Acara *<input name="no_surat" required value="${esc(d.no_surat)}"></label>
    <label class="field">Pihak 1 (Penyerah / Petugas) *<input name="pihak1" required value="${esc(d.pihak1 || '')}"></label>
    <label class="field">Pihak 2 (Penerima / Alasan) *<input name="pihak2" required value="${esc(d.pihak2 || '')}"></label>
    <label class="field full">Nama Barang Sarpras *<input name="asset_name" required list="anames" value="${esc(d.asset_name || '')}"><datalist id="anames">${[...new Set(S.assets.map((a) => a.name))].map((n) => `<option value="${esc(n)}">`).join('')}</datalist></label>
    <label class="field">Jumlah Unit *<input name="qty" type="number" min="1" required value="${esc(d.qty || 1)}"></label>
    <label class="field">Tanggal Berita Acara *<input name="date" type="date" required value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(d.date || '') ? d.date : today())}"></label>
    <div class="field full">Unggah berkas PDF / gambar
      <div class="upl"><input type="file" id="bfile" accept="application/pdf,image/*"><span id="bfn" class="muted" style="font-weight:400">${d.file ? `<a class="link" href="${esc(safeUrl(d.file))}" target="_blank">Berkas tersimpan</a>` : d.file_link ? `<a class="link" href="${esc(safeUrl(d.file_link))}" target="_blank">Google Drive</a>` : 'Belum ada berkas'}</span></div>
      <input type="hidden" name="file" value="${esc(d.file || '')}"><input type="hidden" name="file_link" value="${esc(d.file_link || '')}">
      <small>PDF maksimal ±1,9 MB. Gambar otomatis diperkecil.</small></div>
    <div class="foot full"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" id="bs">Simpan Berita Acara</button></div>
  </form>`, 'wide');
  const f = $('#fb'); f.type.value = d.type || 'BAST';
  $('#bfile').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    $('#bs').disabled = true; $('#bfn').textContent = 'Mengunggah…';
    try { f.file.value = await upload(file, 1800); $('#bfn').innerHTML = `<a class="link" href="${esc(f.file.value)}" target="_blank">${esc(file.name)}</a>`; }
    catch (er) { toast(er.message, 'error'); $('#bfn').textContent = 'Gagal mengunggah'; }
    $('#bs').disabled = false;
  };
  f.onsubmit = async (e) => {
    e.preventDefault(); $('#bs').disabled = true;
    try {
      await api('sarpras/bast' + (isNew ? '' : '/' + encodeURIComponent(d.id)), { method: isNew ? 'POST' : 'PUT', body: Object.fromEntries(new FormData(f)) });
      closeModal(); toast('Berita Acara tersimpan!', 'success'); await refresh();
    } catch (er) { toast(er.message, 'error'); $('#bs').disabled = false; }
  };
}
async function deleteBast(id) {
  if (!confirm('Hapus Berita Acara ini beserta berkasnya?')) return;
  try { await api('sarpras/bast/' + encodeURIComponent(id), { method: 'DELETE' }); toast('Berita Acara dihapus.', 'success'); await refresh(); }
  catch (er) { toast(er.message, 'error'); }
}

// ---------- Scan QR ----------
function viewScan(m) {
  m.innerHTML = `
  <div class="page-h"><div><h1>Scan QR Code Barang</h1><p>Arahkan kamera ke stiker QR pada barang untuk melihat rinciannya.</p></div></div>
  <div class="scan">
    <div class="card"><div class="card-b">
      <div id="qrReader"><div style="text-align:center;padding:30px">${ic('cam').replace('<svg', '<svg style="width:46px;height:46px;opacity:.6"')}<p style="margin:10px 0 0">Kamera belum aktif</p></div></div>
      <div class="actions" style="margin-top:14px"><button class="btn primary" id="sStart">${ic('cam')} Aktifkan Kamera</button><button class="btn" id="sStop" hidden>Matikan Kamera</button></div>
    </div></div>
    <div class="card"><div class="card-h"><div><h2>Cari manual</h2><p>Ketik kode barang atau kode TU bila QR rusak.</p></div></div>
      <div class="card-b"><form id="sManual" style="display:flex;gap:8px"><label class="field" style="flex:1"><input id="sCode" placeholder="mis. INV-S8-2479" required></label><button class="btn dark">Cari</button></form>
      <ul class="scan-tips muted" style="font-size:.86rem;margin-top:18px;padding-left:18px">
        <li>Izinkan akses kamera saat diminta browser.</li><li>Gunakan kamera belakang dan cahaya yang cukup.</li>
        <li>Stiker QR dicetak dari menu Inventaris → tombol QR.</li></ul></div></div>
  </div>`;
  $('#sStart').onclick = startScan;
  $('#sStop').onclick = stopScan;
  $('#sManual').onsubmit = (e) => { e.preventDefault(); showDetail(findAsset($('#sCode').value)); };
}
async function startScan() {
  try {
    await loadScript(QRSCAN_SRC);
    $('#qrReader').innerHTML = '';
    scanner = new Html5Qrcode('qrReader');
    await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, onScan, () => {});
    $('#sStart').hidden = true; $('#sStop').hidden = false;
  } catch (er) {
    console.error(er); toast('Kamera tidak dapat diakses. Pastikan izin kamera diberikan.', 'error'); stopScan();
  }
}
function stopScan() {
  const s = scanner; scanner = null;
  if (s) s.stop().then(() => s.clear()).catch(() => {});
  if ($('#sStart')) {
    $('#sStart').hidden = false; $('#sStop').hidden = true;
    $('#qrReader').innerHTML = `<div style="text-align:center;padding:30px"><p style="margin:0">Kamera belum aktif</p></div>`;
  }
}
function onScan(text) {
  let code = String(text || '').trim();
  try {
    if (/^https?:\/\//i.test(code)) { const u = new URL(code); code = u.searchParams.get('asset') || u.searchParams.get('qr') || code; }
    else if (code.includes('?asset=')) code = code.split('?asset=')[1].split('&')[0];
  } catch (_) { /* biarkan apa adanya */ }
  stopScan();
  if (!showDetail(findAsset(code))) toast(`Data barang (${code}) tidak ditemukan!`, 'error');
}

// ---------- Laporan ----------
function viewReport(m) {
  const t = S.template, locs = allLocations();
  const list = S.assets.filter((a) => rep.loc === 'ALL' || a.location === rep.loc);
  const kop = safeUrl(t.kopImage)
    ? `<div class="kop-img"><img src="${esc(safeUrl(t.kopImage))}" alt="Kop surat ${esc(t.sekolah)}"></div>`
    : `<div class="kop-text"><img src="${esc(safeUrl(t.logo) || '/assets/img/emblem-smkn8.png')}" alt=""><div class="t">
        <div class="i1">${esc(t.instansi1)}</div><div class="i2">${esc(t.instansi2)}</div><div class="sk">${esc(t.sekolah)}</div>
        <div class="al">${esc(t.alamat)}</div>${t.kontak ? `<div class="kt">${esc(t.kontak)}</div>` : ''}</div><div style="width:80px"></div></div>`;
  m.innerHTML = `
  <div class="page-h no-print"><div><h1>Laporan Rekapitulasi Inventaris</h1><p>Pratinjau laporan resmi dengan kop surat sekolah. Siap dicetak atau diunduh.</p></div>
    <div class="actions">
      <select id="rLoc" class="btn" style="font-weight:500"><option value="ALL">Semua lokasi</option>${locs.map((l) => `<option ${l === rep.loc ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      ${S.canEdit ? `<button class="btn" id="rTpl">${ic('set')} Edit Template & Kop</button>` : ''}
      <button class="btn" id="rCsv">${ic('dl')} Export CSV</button><button class="btn primary" id="rPrint">${ic('print')} Cetak Laporan</button></div></div>
  <div class="report">
    ${kop}
    <h3>${esc(t.judul || DEFAULT_TEMPLATE.judul)}</h3>
    <div class="rdate">${rep.loc === 'ALL' ? '' : `Lokasi: ${esc(rep.loc)} · `}Per tanggal ${fmtLong()}</div>
    <table><thead><tr><th>No</th><th>Kode Barang</th><th>Kode TU</th><th>Nama Barang (Spesifikasi)</th><th>Lokasi</th><th>Jml</th><th>Kondisi</th><th>Tgl Pengadaan</th></tr></thead><tbody>
      ${list.length ? list.map((a, i) => `<tr><td class="c">${i + 1}</td><td class="c" style="white-space:nowrap">${esc(a.code)}</td><td>${esc(a.kode_tu || '-')}</td><td><b>${esc(a.name)}</b> (${esc(a.specs || '-')})</td><td>${esc(a.location || '-')}</td><td class="c"><b>${esc(a.quantity)}</b></td><td class="c">${esc(a.condition)}</td><td class="c">${esc(a.procurement_date || '-')}</td></tr>`).join('')
        : '<tr><td colspan="8" class="c">Belum ada data aset.</td></tr>'}
      <tr><td colspan="5" style="text-align:right"><b>Jumlah total</b></td><td class="c"><b>${sumQty(list)}</b></td><td colspan="2"></td></tr>
    </tbody></table>
    <div class="sign">
      <div>Mengetahui,<br>Kepala ${esc(t.sekolah ? t.sekolah.replace(/^SMK/i, 'SMK') : 'Sekolah')}<div class="nm">${esc(t.kepalaSekolah || '........................')}</div><div>NIP. ${esc(t.nipKepala || '-')}</div></div>
      <div>Surabaya, ${fmtLong()}<br>Pengelola Sarana &amp; Prasarana<div class="nm">${esc(t.pengelolaSarpras || '........................')}</div><div>NIP. ${esc(t.nipPengelola || '-')}</div></div>
    </div>
  </div>`;
  $('#rLoc').onchange = (e) => { rep.loc = e.target.value; render(); };
  $('#rPrint').onclick = () => window.print();
  $('#rCsv').onclick = () => exportCSV(list);
  $('#rTpl')?.addEventListener('click', editTemplate);
}
function exportCSV(list) {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  let csv = 'No,Kode Barang,Kode TU,Nama Barang,Spesifikasi,Lokasi,Jumlah,Kondisi,Tgl Pengadaan,Tgl Serah Terima\n';
  list.forEach((a, i) => { csv += [i + 1, a.code, a.kode_tu, a.name, a.specs, a.location, a.quantity, a.condition, a.procurement_date, a.handover_date].map(q).join(',') + '\n'; });
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
  const l = document.createElement('a'); l.href = url; l.download = `LAPORAN_INVENTARIS_SARPRAS_SMKN8_${today()}.csv`; document.body.appendChild(l); l.click(); l.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('CSV berhasil diunduh!', 'success');
}
function imageField(name, label, val, help, wide) {
  return `<div class="field full">${label}<div class="upl"><span class="pv${wide ? ' wide' : ''}" data-pv="${name}" style="${val ? `background-image:url('${esc(safeUrl(val))}');background-size:contain` : ''}">${val ? '' : 'Belum ada'}</span>
    <input type="file" accept="image/*" data-up="${name}"><button type="button" class="btn sm danger" data-clr="${name}" ${val ? '' : 'hidden'}>Hapus</button></div>
    <input type="hidden" name="${name}" value="${esc(val || '')}">${help ? `<small>${help}</small>` : ''}</div>`;
}
function wireImages(form, maxW = 1600) {
  $$('[data-up]', form).forEach((inp) => inp.onchange = async () => {
    const n = inp.dataset.up, file = inp.files[0]; if (!file) return;
    const pv = $(`[data-pv="${n}"]`, form); pv.textContent = '…';
    try { const url = await upload(file, maxW); form[n].value = url; pv.style.backgroundImage = `url('${url}')`; pv.style.backgroundSize = 'contain'; pv.textContent = ''; $(`[data-clr="${n}"]`, form).hidden = false; }
    catch (er) { toast(er.message, 'error'); pv.textContent = 'Gagal'; }
  });
  $$('[data-clr]', form).forEach((b) => b.onclick = () => { const n = b.dataset.clr; form[n].value = ''; const pv = $(`[data-pv="${n}"]`, form); pv.style.backgroundImage = ''; pv.textContent = 'Belum ada'; b.hidden = true; });
}
function editTemplate() {
  const t = S.template;
  const fld = (n, l, full) => `<label class="field${full ? ' full' : ''}">${l}<input name="${n}" value="${esc(t[n] || '')}"></label>`;
  openModal(`<h3>Edit Template & Kop Surat Laporan</h3><p class="lead">Bila gambar kop surat utuh diunggah, kop teks di bawahnya tidak dipakai.</p>
  <form id="ft" class="grid2">
    ${imageField('kopImage', 'Gambar kop surat utuh (opsional)', t.kopImage, 'Disarankan gambar memanjang, mis. 1200 × 250 px.', true)}
    ${imageField('logo', 'Logo sekolah untuk kop teks (opsional)', t.logo, 'Bila kosong memakai logo SMKN 8.')}
    ${fld('instansi1', 'Nama Instansi 1 (baris atas)')}${fld('instansi2', 'Nama Instansi 2 (baris kedua)')}
    ${fld('sekolah', 'Nama Sekolah', true)}${fld('alamat', 'Alamat lengkap kop surat', true)}${fld('kontak', 'Kontak / Telepon / Email / Web', true)}
    ${fld('judul', 'Judul laporan rekapitulasi', true)}
    <div class="full mono muted" style="margin-top:6px">Tanda tangan penanggung jawab</div>
    ${fld('kepalaSekolah', 'Nama Kepala Sekolah')}${fld('nipKepala', 'NIP Kepala Sekolah')}
    ${fld('pengelolaSarpras', 'Nama Pengelola Sarpras')}${fld('nipPengelola', 'NIP Pengelola Sarpras')}
    <div class="foot full"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" id="ts">Simpan Template</button></div>
  </form>`, 'wide');
  const f = $('#ft'); wireImages(f, 1800);
  f.onsubmit = async (e) => {
    e.preventDefault(); $('#ts').disabled = true;
    try { await api('sarpras/meta', { method: 'PUT', body: { template: Object.fromEntries(new FormData(f)) } }); closeModal(); toast('Template laporan tersimpan!', 'success'); await refresh(); }
    catch (er) { toast(er.message, 'error'); $('#ts').disabled = false; }
  };
}
function editBanner() {
  const a = S.announcement || {};
  openModal(`<h3>Edit Pengumuman & Background Banner</h3><p class="lead">Tampil di bagian atas Beranda SI-SARPRAS.</p>
  <form id="fbn" class="grid2">
    <label class="field">Judul pengumuman<input name="title" required value="${esc(a.title || '')}"></label>
    <label class="field">Tanggal<input name="date" value="${esc(a.date || '')}" placeholder="03 Oktober 2026"></label>
    <label class="field full">Isi pengumuman<textarea name="content">${esc(a.content || '')}</textarea></label>
    ${imageField('bgImage', 'Gambar latar banner', a.bgImage, 'Gambar akan digelapkan agar tulisan tetap terbaca.', true)}
    <div class="foot full"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" id="ns">Simpan Pengumuman</button></div>
  </form>`, 'wide');
  const f = $('#fbn'); wireImages(f, 1600);
  f.onsubmit = async (e) => {
    e.preventDefault(); $('#ns').disabled = true;
    try { await api('sarpras/meta', { method: 'PUT', body: { announcement: Object.fromEntries(new FormData(f)) } }); closeModal(); toast('Pengumuman tersimpan!', 'success'); await refresh(); }
    catch (er) { toast(er.message, 'error'); $('#ns').disabled = false; }
  };
}

// ---------- Mulai ----------
(async () => {
  try { await load(); } catch (e) { $('#main').innerHTML = `<div class="sp-loading">Gagal memuat data: ${esc(e.message)}</div>`; return; }
  const h = location.hash.slice(1);
  tab = TABS.some((x) => x[0] === h) ? h : 'beranda';
  render();
  const code = new URLSearchParams(location.search).get('asset') || new URLSearchParams(location.search).get('qr');
  if (code) setTimeout(() => showDetail(findAsset(code)), window.QRCode ? 0 : 400);
})();
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== tab) setTab(h, false); });
})();
