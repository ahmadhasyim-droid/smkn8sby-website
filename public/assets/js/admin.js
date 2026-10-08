/* =============================================================
   SMKN 8 Surabaya — Panel Admin
   Peran: admin (semua menu) · unit (jurusan / lembaga / TEFA miliknya)
   ============================================================= */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = {
  dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  news: '<path d="M4 5h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 17h3"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  unit: '<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
  job: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  badge: '<circle cx="12" cy="9" r="5.5"/><path d="M9.5 9l1.8 1.8L15 7.2"/><path d="M8.5 13.8L7 21l5-2.8 5 2.8-1.5-7.2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  ext: '<path d="M14 3h7v7M10 14L21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
};
const ic = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

async function api(path, opts = {}) {
  const o = { method: opts.method || 'GET', headers: {} };
  if (opts.body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(opts.body); }
  const r = await fetch('/api/' + path, o);
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && !path.startsWith('auth/')) { location.hash = ''; boot(); throw new Error('Sesi berakhir, silakan login lagi.'); }
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan');
  return d;
}
let toastT;
function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : ''); clearTimeout(toastT); toastT = setTimeout(() => (t.className = ''), 3200); }
const fmtDate = (iso) => (iso ? new Date(iso.length === 10 ? iso + 'T00:00:00+07:00' : iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-');
const wibDate = (iso) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 10) : '');

let ME = null, UNITS = [], UNIT = {};
const isAdmin = () => ME.role === 'admin';
const unitName = (slug) => (slug === 'sekolah' ? 'Sekolah (umum)' : UNIT[slug]?.name || slug);
const unitTag = (slug) => `<span class="tag" style="--c:${slug === 'sekolah' ? '#235ba4' : UNIT[slug]?.color || '#888'}">${esc(slug === 'sekolah' ? 'Sekolah' : UNIT[slug]?.short || slug)}</span>`;
const unitOptions = () => [{ v: 'sekolah', l: 'Sekolah (umum)' }, ...UNITS.map((u) => ({ v: u.slug, l: u.name }))];
const TYPE_LABEL = { jurusan: 'Program Keahlian', lembaga: 'Lembaga', tefa: 'Teaching Factory' };
const unitUrl = (u) => (u.type === 'lembaga' ? `/lembaga/${u.slug}` : u.type === 'tefa' ? `/tefa/${u.slug.replace(/^tefa-/, '')}` : `/jurusan/${u.slug}`);
const jurOptions = () => UNITS.filter((u) => u.type === 'jurusan').map((u) => ({ v: u.slug, l: u.name }));

// ---------- Unggah gambar (otomatis diperkecil di browser) ----------
async function compress(file, maxW = 1600) {
  if (file.type === 'image/gif' && file.size < 1.8e6) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  const keepPng = file.type === 'image/png' && maxW <= 800;
  const ctx = c.getContext('2d');
  if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const type = keepPng ? 'image/png' : 'image/jpeg';
  let q = 0.85, blob;
  do { blob = await new Promise((r) => c.toBlob(r, type, q)); q -= 0.12; } while (blob.size > 1.8e6 && q > 0.3 && !keepPng);
  return blob;
}
async function uploadImage(file, maxW) {
  if (!/^image\//.test(file.type)) throw new Error('File harus berupa gambar.');
  const blob = await compress(file, maxW);
  const r = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Gagal mengunggah gambar');
  return d.url;
}

// ---------- Pembuat formulir ----------
// tipe: text, textarea, select, date, image, logo, rich, color, check, number, checks, password, email, url
function fieldHtml(f, val) {
  const v = val ?? f.default ?? '';
  const name = `name="${f.k}"`;
  const wrap = (inner) => `<label class="field${f.half ? ' half' : ''}" data-k="${f.k}"><span>${esc(f.label)}${f.required ? ' *' : ''}</span>${inner}${f.help ? `<small>${esc(f.help)}</small>` : ''}</label>`;
  switch (f.type) {
    case 'textarea': return wrap(`<textarea ${name} rows="${f.rows || 4}" ${f.required ? 'required' : ''}>${esc(v)}</textarea>`);
    case 'select': return wrap(`<select ${name}>${f.opts().map((o) => `<option value="${esc(o.v)}"${String(o.v) === String(v) ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`);
    case 'check': return `<div class="field${f.half ? ' half' : ''}"><label class="inline"><input type="checkbox" ${name}${v ? ' checked' : ''}> ${esc(f.label)}</label>${f.help ? `<small>${esc(f.help)}</small>` : ''}</div>`;
    case 'checks': { const set = new Set(String(v).split(',').filter(Boolean)); return `<div class="field" data-k="${f.k}"><span>${esc(f.label)}</span><div class="checks">${f.opts().map((o) => `<label><input type="checkbox" data-checks="${f.k}" value="${esc(o.v)}"${set.has(o.v) ? ' checked' : ''}><span>${esc(o.l)}</span></label>`).join('')}</div>${f.help ? `<small>${esc(f.help)}</small>` : ''}</div>`; }
    case 'color': return wrap(`<div class="color-row"><input type="color" value="${esc(v || '#235ba4')}" oninput="this.nextElementSibling.value=this.value"><input type="text" ${name} value="${esc(v)}" pattern="#[0-9a-fA-F]{6}" oninput="if(/^#[0-9a-f]{6}$/i.test(this.value))this.previousElementSibling.value=this.value"></div>`);
    case 'image': case 'logo': return `<div class="field${f.half ? ' half' : ''}"><span>${esc(f.label)}</span><div class="img-field${f.type === 'logo' ? ' logo' : ''}" data-img="${f.k}">
      <div class="preview" style="${v ? `background-image:url('${esc(v)}')` : ''}">${v ? '' : 'Belum ada gambar'}</div>
      <input type="hidden" ${name} value="${esc(v)}"><input type="file" accept="image/*">
      <div class="row"><button type="button" class="btn btn-line btn-sm" data-pick>${ic('upload')}Pilih gambar</button><button type="button" class="btn btn-danger btn-sm" data-clear${v ? '' : ' hidden'}>Hapus</button></div></div>${f.help ? `<small>${esc(f.help)}</small>` : ''}</div>`;
    case 'rich': return `<div class="field"><span>${esc(f.label)}</span><div class="editor" data-rich="${f.k}">
      <div class="editor-bar">
        <button type="button" data-cmd="bold" title="Tebal"><b>B</b></button><button type="button" data-cmd="italic" title="Miring"><i>I</i></button><button type="button" data-cmd="underline" title="Garis bawah"><u>U</u></button>
        <span class="sep"></span><button type="button" data-block="h2" title="Judul">H2</button><button type="button" data-block="h3" title="Subjudul">H3</button><button type="button" data-block="p" title="Paragraf">¶</button><button type="button" data-block="blockquote" title="Kutipan">❝</button>
        <span class="sep"></span><button type="button" data-cmd="insertUnorderedList" title="Daftar">• List</button><button type="button" data-cmd="insertOrderedList" title="Daftar bernomor">1. List</button>
        <span class="sep"></span><button type="button" data-link title="Tautan">Link</button><button type="button" data-img-insert title="Sisipkan gambar">${ic('img')}</button><button type="button" data-cmd="removeFormat" title="Hapus format">Tx</button>
        <input type="file" accept="image/*" hidden>
      </div>
      <div class="editor-area" contenteditable="true" data-placeholder="Tulis isi berita di sini…">${v}</div></div></div>`;
    default: return wrap(`<input type="${f.type || 'text'}" ${name} value="${esc(v)}" ${f.required ? 'required' : ''} ${f.max ? `maxlength="${f.max}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>`);
  }
}
function bindForm(root, fields) {
  // gambar
  $$('[data-img]', root).forEach((box) => {
    const f = fields.find((x) => x.k === box.dataset.img) || {};
    const file = $('input[type=file]', box), hid = $('input[type=hidden]', box), pv = $('.preview', box), clr = $('[data-clear]', box);
    $('[data-pick]', box).onclick = () => file.click();
    clr.onclick = () => { hid.value = ''; pv.style.backgroundImage = ''; pv.textContent = 'Belum ada gambar'; clr.hidden = true; };
    file.onchange = async () => {
      if (!file.files[0]) return;
      pv.textContent = 'Mengunggah…';
      try { const url = await uploadImage(file.files[0], f.type === 'logo' ? 600 : 1600); hid.value = url; pv.style.backgroundImage = `url('${url}')`; pv.textContent = ''; clr.hidden = false; }
      catch (e) { pv.textContent = ''; toast(e.message, true); }
      file.value = '';
    };
  });
  // editor teks
  $$('[data-rich]', root).forEach((ed) => {
    const area = $('.editor-area', ed), fileIn = $('input[type=file]', ed);
    const focus = () => area.focus();
    $$('[data-cmd]', ed).forEach((b) => (b.onclick = () => { focus(); document.execCommand(b.dataset.cmd); }));
    $$('[data-block]', ed).forEach((b) => (b.onclick = () => { focus(); document.execCommand('formatBlock', false, b.dataset.block); }));
    $('[data-link]', ed).onclick = () => { const u = prompt('Alamat tautan (https://…)'); if (u) { focus(); document.execCommand('createLink', false, u); } };
    let range;
    $('[data-img-insert]', ed).onclick = () => { const s = getSelection(); range = s.rangeCount && area.contains(s.anchorNode) ? s.getRangeAt(0) : null; fileIn.click(); };
    fileIn.onchange = async () => {
      if (!fileIn.files[0]) return;
      toast('Mengunggah gambar…');
      try {
        const url = await uploadImage(fileIn.files[0], 1600);
        focus(); if (range) { const s = getSelection(); s.removeAllRanges(); s.addRange(range); }
        document.execCommand('insertImage', false, url); toast('Gambar ditambahkan');
      } catch (e) { toast(e.message, true); }
      fileIn.value = '';
    };
    area.addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
  });
}
function readForm(root, fields) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'rich') out[f.k] = $(`[data-rich="${f.k}"] .editor-area`, root).innerHTML.trim();
    else if (f.type === 'check') out[f.k] = $(`[name="${f.k}"]`, root)?.checked ? 1 : 0;
    else if (f.type === 'checks') out[f.k] = $$(`[data-checks="${f.k}"]:checked`, root).map((x) => x.value).join(',');
    else { const el = $(`[name="${f.k}"]`, root); if (el) out[f.k] = el.value.trim(); }
  }
  return out;
}

// ---------- Definisi menu konten ----------
const STATUS = () => [{ v: 'publish', l: 'Terbit' }, { v: 'draft', l: 'Draf' }];
const CATS = () => [{ v: 'kegiatan', l: 'Kegiatan' }, { v: 'berita', l: 'Berita' }, { v: 'prestasi', l: 'Prestasi' }, { v: 'pengumuman', l: 'Pengumuman' }];
const RES = {
  posts: {
    title: 'Berita & Kegiatan', single: 'berita', icon: 'news',
    cols: [
      ['', (r) => (r.cover ? `<img class="thumb" src="${esc(r.cover)}" alt="">` : `<span class="thumb" style="display:block"></span>`)],
      ['Judul', (r) => `<span class="t-title">${esc(r.title)}</span><span class="t-sub">${fmtDate(r.published_at)} · ${esc(r.author_name || '')} · ${r.views || 0}× dibaca</span>`],
      ['Unit', (r) => unitTag(r.unit_slug)],
      ['Kategori', (r) => esc(r.category)],
      ['Status', (r) => `<span class="tag ${r.status === 'publish' ? 'ok' : 'draft'}">${r.status === 'publish' ? 'Terbit' : 'Draf'}</span>${r.featured ? ' <span class="tag" style="--c:#f26836">Utama</span>' : ''}`],
    ],
    main: () => [
      { k: 'title', label: 'Judul', required: true, max: 200 },
      { k: 'content', label: 'Isi berita', type: 'rich' },
      { k: 'excerpt', label: 'Ringkasan (opsional)', type: 'textarea', rows: 2, help: 'Dikosongkan = diambil otomatis dari awal isi berita.' },
    ],
    side: () => [
      { k: 'status', label: 'Status', type: 'select', opts: STATUS, default: 'publish' },
      { k: 'category', label: 'Kategori', type: 'select', opts: CATS },
      ...(isAdmin() ? [{ k: 'unit_slug', label: 'Unit', type: 'select', opts: unitOptions, default: 'sekolah' }] : []),
      { k: 'published_at', label: 'Tanggal terbit', type: 'date' },
      ...(isAdmin() ? [{ k: 'featured', label: 'Jadikan berita utama', type: 'check' }] : []),
      { k: 'cover', label: 'Gambar sampul', type: 'image', help: 'Disarankan foto mendatar (landscape).' },
    ],
    view: (r) => r.status === 'publish' && `/berita/${r.slug}`,
  },
  agenda: {
    title: 'Agenda', single: 'agenda', icon: 'cal',
    cols: [
      ['Tanggal', (r) => `<b>${fmtDate(r.date)}</b>${r.end_date && r.end_date !== r.date ? `<br><span class="t-sub">s.d. ${fmtDate(r.end_date)}</span>` : ''}`],
      ['Kegiatan', (r) => `<span class="t-title">${esc(r.title)}</span><span class="t-sub">${esc([r.time, r.location].filter(Boolean).join(' · '))}</span>`],
      ['Unit', (r) => unitTag(r.unit_slug)],
    ],
    main: () => [
      { k: 'title', label: 'Nama kegiatan', required: true },
      { k: 'date', label: 'Tanggal mulai', type: 'date', required: true, half: true },
      { k: 'end_date', label: 'Tanggal selesai (opsional)', type: 'date', half: true },
      { k: 'time', label: 'Waktu', placeholder: 'mis. 07.30 – 12.00 WIB', half: true },
      { k: 'location', label: 'Tempat', half: true },
      ...(isAdmin() ? [{ k: 'unit_slug', label: 'Unit', type: 'select', opts: unitOptions, default: 'sekolah' }] : []),
      { k: 'description', label: 'Keterangan', type: 'textarea', rows: 3 },
    ],
  },
  lowongan: {
    title: 'Lowongan Kerja', single: 'lowongan', icon: 'job',
    cols: [
      ['Posisi', (r) => `<span class="t-title">${esc(r.position)}</span><span class="t-sub">${esc(r.company)}${r.location ? ' · ' + esc(r.location) : ''}</span>`],
      ['Jurusan', (r) => String(r.majors || '').split(',').filter(Boolean).map(unitTag).join(' ') || '<span class="t-sub">Semua</span>'],
      ['Batas', (r) => fmtDate(r.deadline)],
      ['Status', (r) => `<span class="tag ${r.status === 'buka' ? 'ok' : 'draft'}">${r.status === 'buka' ? 'Dibuka' : 'Ditutup'}</span>`],
    ],
    main: () => [
      { k: 'position', label: 'Posisi / jabatan', required: true, half: true },
      { k: 'company', label: 'Nama perusahaan', required: true, half: true },
      { k: 'location', label: 'Lokasi', half: true },
      { k: 'job_type', label: 'Jenis', type: 'select', half: true, opts: () => ['Penuh waktu', 'Kontrak', 'Paruh waktu', 'Magang', 'Luar negeri'].map((x) => ({ v: x, l: x })) },
      { k: 'deadline', label: 'Batas pendaftaran', type: 'date', half: true },
      { k: 'status', label: 'Status', type: 'select', half: true, opts: () => [{ v: 'buka', l: 'Dibuka' }, { v: 'tutup', l: 'Ditutup' }] },
      { k: 'majors', label: 'Untuk lulusan jurusan', type: 'checks', opts: jurOptions, help: 'Kosongkan bila terbuka untuk semua jurusan.' },
      { k: 'apply_link', label: 'Tautan pendaftaran / kontak', type: 'url', placeholder: 'https://… atau https://wa.me/62…' },
      { k: 'description', label: 'Deskripsi & persyaratan', type: 'textarea', rows: 6 },
      { k: 'logo', label: 'Logo perusahaan', type: 'logo' },
    ],
  },
  skema: {
    title: 'Skema Sertifikasi', single: 'skema', icon: 'badge',
    cols: [
      ['Kode', (r) => `<code>${esc(r.code || '-')}</code>`],
      ['Nama skema', (r) => `<span class="t-title">${esc(r.name)}</span><span class="t-sub">${esc(r.level || '')}${r.units_count ? ` · ${r.units_count} unit kompetensi` : ''}</span>`],
      ['Jurusan', (r) => (r.major ? unitTag(r.major) : '<span class="t-sub">Umum</span>')],
    ],
    main: () => [
      { k: 'name', label: 'Nama skema', required: true },
      { k: 'code', label: 'Kode skema', half: true },
      { k: 'major', label: 'Program keahlian', type: 'select', half: true, opts: () => [{ v: '', l: 'Umum / lintas jurusan' }, ...jurOptions()] },
      { k: 'level', label: 'Jenjang / jenis', placeholder: 'mis. KKNI Level II / Klaster', half: true },
      { k: 'units_count', label: 'Jumlah unit kompetensi', type: 'number', half: true },
      { k: 'sort', label: 'Urutan tampil', type: 'number', half: true, default: 0 },
      { k: 'description', label: 'Keterangan', type: 'textarea', rows: 3 },
    ],
  },
};

// ---------- Kerangka panel ----------
function menu() {
  const u = ME.unit_slug, items = [['dashboard', 'Dasbor', 'dash'], ['posts', 'Berita & Kegiatan', 'news'], ['agenda', 'Agenda', 'cal'], ['gallery', 'Galeri', 'img']];
  const groups = [['Konten', items]];
  if (isAdmin()) {
    groups.push(['Unit', [['units', 'Profil Jurusan, Lembaga & TEFA', 'unit'], ['lowongan', 'Lowongan (BKK)', 'job'], ['skema', 'Skema (LSP)', 'badge']]]);
    groups.push(['Sekolah', [['settings', 'Pengaturan Situs', 'gear'], ['users', 'Pengguna & Akses', 'users'], ['messages', 'Pesan Masuk', 'mail']]]);
  } else {
    const g = [[`units/${u}`, 'Profil Unit', 'unit']];
    if (u === 'bkk') g.push(['lowongan', 'Lowongan Kerja', 'job']);
    if (u === 'lsp') g.push(['skema', 'Skema Sertifikasi', 'badge']);
    groups.push([UNIT[u]?.short || 'Unit', g]);
  }
  return groups;
}
function renderShell() {
  const un = UNIT[ME.unit_slug];
  document.body.style.setProperty('--unit', isAdmin() ? '#f26836' : un?.color || '#f26836');
  $('#app').innerHTML = `<div class="shell">
    <aside class="side" id="side">
      <div class="side-brand"><img src="/assets/img/emblem-smkn8.png" alt=""><div><b>SMKN 8 Surabaya</b><span>Panel pengelola</span></div></div>
      <div class="side-role"><b>${esc(ME.name || ME.username)}</b><small>${isAdmin() ? 'Administrator sekolah' : `Pengelola ${esc(un?.name || ME.unit_slug)}`}</small></div>
      <nav id="menu">${menu().map(([g, it]) => `<div class="grp">${esc(g)}</div>${it.map(([h, l, i]) => `<a href="#/${h}" data-h="${h}">${ic(i)}${esc(l)}${h === 'messages' ? '<span class="count" id="unread" hidden></span>' : ''}</a>`).join('')}`).join('')}</nav>
      <div class="side-foot">
        <a href="/" target="_blank">${ic('ext')}Lihat website</a>
        <a href="#/account">${ic('key')}Ganti password</a>
        <button id="logout">${ic('out')}Keluar</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar"><button class="menu-btn" id="menuBtn" aria-label="Menu">${ic('menu')}</button><h1 id="pageTitle"></h1><div class="actions" id="pageActions"></div></header>
      <div class="content" id="view"></div>
    </div></div>`;
  $('#logout').onclick = async () => { await api('auth/logout', { method: 'POST', body: {} }).catch(() => {}); location.hash = ''; boot(); };
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
  $('#view').onclick = () => $('#side').classList.remove('open');
}
const setHead = (title, actions = '') => { $('#pageTitle').textContent = title; $('#pageActions').innerHTML = actions; document.title = `${title} — Panel SMKN 8 Surabaya`; };

// ---------- Halaman panel ----------
const V = {};

V.dashboard = async (view) => {
  setHead('Dasbor');
  const d = await api('admin/dashboard');
  const un = UNIT[ME.unit_slug];
  const stats = [[d.posts, 'Berita & kegiatan', '#235ba4'], [d.agenda, 'Agenda', '#16966a'], [d.gallery, 'Foto galeri', '#7c4bc4'], [d.views, 'Total dibaca', '#f26836']];
  if (d.lowongan !== undefined) stats.push([d.lowongan, 'Lowongan dibuka', '#16966a']);
  if (d.skema !== undefined) stats.push([d.skema, 'Skema sertifikasi', '#e3262b']);
  if (d.users !== undefined) stats.push([d.users, 'Pengguna', '#24282e']);
  if (d.unread !== undefined) stats.push([d.unread, 'Pesan belum dibaca', '#d2372b']);
  const quick = [['posts/new', 'Tulis berita / kegiatan', 'news'], ['agenda/new', 'Tambah agenda', 'cal'], ['gallery', 'Unggah foto galeri', 'img']];
  if (!isAdmin()) quick.push([`units/${ME.unit_slug}`, 'Perbarui profil unit', 'unit']);
  if (isAdmin() || ME.unit_slug === 'bkk') quick.push(['lowongan/new', 'Tambah lowongan', 'job']);
  if (isAdmin() || ME.unit_slug === 'lsp') quick.push(['skema/new', 'Tambah skema', 'badge']);
  if (isAdmin()) quick.push(['users', 'Kelola pengguna', 'users'], ['settings', 'Pengaturan situs', 'gear']);
  view.innerHTML = `
    <div class="welcome"><div><span class="mono" style="color:var(--sky)">${isAdmin() ? 'Administrator' : esc(TYPE_LABEL[un?.type] || 'Unit')}</span>
      <h2>Halo, ${esc(ME.name || ME.username)}</h2><p>${isAdmin() ? 'Anda dapat mengelola seluruh isi website, unit, dan pengguna.' : `Anda mengelola halaman ${esc(un?.name || '')}.`}</p></div>
      <div><a class="btn btn-primary" href="#/posts/new">${ic('plus')}Tulis berita</a>${!isAdmin() && un ? `<a class="btn btn-line" href="${unitUrl(un)}" target="_blank">${ic('ext')}Lihat halaman</a>` : ''}</div></div>
    <div class="grid-stats">${stats.map(([v, l, c]) => `<div class="stat" style="--c:${c}"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="form-grid">
      <div class="box"><h3>Berita terbaru</h3>${d.recent.length ? `<table><tbody>${d.recent.map((r) => `<tr><td><a href="#/posts/${r.id}"><span class="t-title">${esc(r.title)}</span><span class="t-sub">${fmtDate(r.published_at)} · ${r.views}× dibaca</span></a></td><td>${unitTag(r.unit_slug)}</td><td><span class="tag ${r.status === 'publish' ? 'ok' : 'draft'}">${r.status === 'publish' ? 'Terbit' : 'Draf'}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Belum ada berita.</div>'}</div>
      <div class="box"><h3>Aksi cepat</h3><div class="quick" style="grid-template-columns:1fr">${quick.map(([h, l, i]) => `<a href="#/${h}"><i>${ic(i)}</i>${esc(l)}</a>`).join('')}</div></div>
    </div>`;
};

// Daftar (tabel) umum
async function listView(view, key) {
  const R = RES[key];
  setHead(R.title, `<a class="btn btn-primary" href="#/${key}/new">${ic('plus')}Tambah ${R.single}</a>`);
  let page = 1, q = '', unit = '';
  view.innerHTML = `<div class="toolbar">
      ${key === 'posts' ? `<label class="search">${ic('search')}<input type="search" placeholder="Cari judul…" id="q"></label>` : ''}
      ${isAdmin() && ['posts', 'agenda'].includes(key) ? `<select id="fu"><option value="">Semua unit</option>${unitOptions().map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('')}</select>` : ''}
    </div><div class="table-wrap" id="tbl"></div><div class="pager" id="pg"></div>`;
  const load = async () => {
    const d = await api(`admin/${key}?page=${page}&limit=20${q ? '&q=' + encodeURIComponent(q) : ''}${unit ? '&unit=' + unit : ''}`);
    $('#tbl').innerHTML = d.items.length ? `<table><thead><tr>${R.cols.map(([h]) => `<th>${h}</th>`).join('')}<th></th></tr></thead><tbody>
      ${d.items.map((r) => `<tr>${R.cols.map(([, fn]) => `<td>${fn(r)}</td>`).join('')}<td class="act">
        ${R.view && R.view(r) ? `<a class="btn btn-line btn-sm" href="${R.view(r)}" target="_blank" title="Lihat">${ic('ext')}</a>` : ''}
        <a class="btn btn-line btn-sm" href="#/${key}/${r.id}">Ubah</a><button class="btn btn-danger btn-sm" data-del="${r.id}">Hapus</button></td></tr>`).join('')}
      </tbody></table>` : `<div class="empty">Belum ada data. <a href="#/${key}/new" style="color:var(--blue);font-weight:700">Tambah ${R.single} pertama</a></div>`;
    $('#pg').innerHTML = d.pages > 1 ? Array.from({ length: d.pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-p="${i + 1}">${i + 1}</button>`).join('') : '';
  };
  $('#tbl').onclick = async (e) => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    if (!confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) return;
    try { await api(`admin/${key}/${b.dataset.del}`, { method: 'DELETE' }); toast('Data dihapus'); load(); } catch (er) { toast(er.message, true); }
  };
  $('#pg').onclick = (e) => { const b = e.target.closest('button'); if (b) { page = +b.dataset.p; load(); } };
  let t; if ($('#q')) $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim(); page = 1; load(); }, 300); };
  if ($('#fu')) $('#fu').onchange = (e) => { unit = e.target.value; page = 1; load(); };
  await load();
}

// Formulir tambah/ubah umum
async function editView(view, key, id) {
  const R = RES[key];
  const item = id ? (await api(`admin/${key}/${id}`)).item : {};
  const original = { ...item };
  if (key === 'posts') item.published_at = wibDate(item.published_at) || wibDate(new Date().toISOString());
  setHead(`${id ? 'Ubah' : 'Tambah'} ${R.single}`, `<a class="btn btn-line" href="#/${key}">Kembali</a>`);
  const main = R.main(), side = R.side ? R.side() : [];
  const all = [...main, ...side];
  view.innerHTML = `<form id="f" novalidate><div class="${side.length ? 'form-grid' : ''}">
    <div class="box"><div class="fields">${main.map((f) => fieldHtml(f, item[f.k])).join('')}</div></div>
    ${side.length ? `<div class="box"><div class="fields">${side.map((f) => fieldHtml(f, item[f.k])).join('')}</div>
      <div class="form-actions"><button class="btn btn-primary btn-block" type="submit">Simpan</button></div></div>` : ''}
  </div>${side.length ? '' : `<div class="form-actions"><a class="btn btn-line" href="#/${key}">Batal</a><button class="btn btn-primary" type="submit">Simpan</button></div>`}</form>`;
  bindForm(view, all);
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    const data = readForm(view, all);
    for (const f of all) if (f.required && !data[f.k]) return toast(`"${f.label}" wajib diisi.`, true);
    if (key === 'posts') {
      data.published_at = data.published_at && data.published_at === wibDate(original.published_at) ? original.published_at
        : data.published_at ? new Date(data.published_at + 'T' + new Date(Date.now() + 7 * 3600e3).toISOString().slice(11, 19) + '+07:00').toISOString() : '';
    }
    const btns = $$('button[type=submit]', view); btns.forEach((b) => (b.disabled = true));
    try {
      await api(`admin/${key}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body: data });
      toast('Tersimpan'); location.hash = `#/${key}`;
    } catch (er) { toast(er.message, true); btns.forEach((b) => (b.disabled = false)); }
  };
}

// Galeri: unggah banyak foto sekaligus
V.gallery = async (view) => {
  setHead('Galeri');
  let page = 1, unit = '';
  view.innerHTML = `<div class="box"><h3>Unggah foto</h3><div class="toolbar" style="margin:0">
      ${isAdmin() ? `<select id="gu">${unitOptions().map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('')}</select>` : ''}
      <label class="search" style="max-width:none">${ic('img')}<input id="gc" placeholder="Keterangan foto (opsional, untuk semua foto yang dipilih)"></label>
      <input type="file" id="gf" accept="image/*" multiple hidden><button class="btn btn-primary" id="gb">${ic('upload')}Pilih & unggah foto</button>
    </div><small style="color:var(--muted)">Bisa memilih beberapa foto sekaligus. Foto otomatis diperkecil sebelum diunggah.</small></div>
    ${isAdmin() ? `<div class="toolbar"><select id="fu"><option value="">Semua unit</option>${unitOptions().map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('')}</select></div>` : ''}
    <div class="gal-admin" id="ga"></div><div class="pager" id="pg"></div>`;
  const load = async () => {
    const d = await api(`admin/gallery?page=${page}&limit=40${unit ? '&unit=' + unit : ''}`);
    $('#ga').innerHTML = d.items.length ? d.items.map((g) => `<figure><img src="${esc(g.image)}" alt="" loading="lazy"><figcaption>${unitTag(g.unit_slug)}<span>${esc(g.caption || '—')}</span>
      <span style="display:flex;gap:4px"><button class="btn btn-line btn-sm" data-cap="${g.id}">Keterangan</button><button class="btn btn-danger btn-sm" data-del="${g.id}">Hapus</button></span></figcaption></figure>`).join('') : '<div class="empty" style="grid-column:1/-1">Belum ada foto.</div>';
    $('#pg').innerHTML = d.pages > 1 ? Array.from({ length: d.pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-p="${i + 1}">${i + 1}</button>`).join('') : '';
  };
  $('#gb').onclick = () => $('#gf').click();
  $('#gf').onchange = async (e) => {
    const files = [...e.target.files]; if (!files.length) return;
    const b = $('#gb'); b.disabled = true; let ok = 0;
    for (const [i, file] of files.entries()) {
      b.textContent = `Mengunggah ${i + 1}/${files.length}…`;
      try { const url = await uploadImage(file, 1600); await api('admin/gallery', { method: 'POST', body: { image: url, caption: $('#gc').value, unit_slug: $('#gu')?.value } }); ok++; }
      catch (er) { toast(`${file.name}: ${er.message}`, true); }
    }
    b.disabled = false; b.innerHTML = `${ic('upload')}Pilih & unggah foto`; e.target.value = '';
    toast(`${ok} foto berhasil diunggah`); page = 1; load();
  };
  $('#ga').onclick = async (e) => {
    const del = e.target.closest('[data-del]'), cap = e.target.closest('[data-cap]');
    if (del && confirm('Hapus foto ini?')) { try { await api('admin/gallery/' + del.dataset.del, { method: 'DELETE' }); toast('Foto dihapus'); load(); } catch (er) { toast(er.message, true); } }
    if (cap) { const t = prompt('Keterangan foto:'); if (t !== null) { try { await api('admin/gallery/' + cap.dataset.cap, { method: 'PUT', body: { caption: t } }); load(); } catch (er) { toast(er.message, true); } } }
  };
  $('#pg').onclick = (e) => { const b = e.target.closest('button'); if (b) { page = +b.dataset.p; load(); } };
  if ($('#fu')) $('#fu').onchange = (e) => { unit = e.target.value; page = 1; load(); };
  await load();
};

// Profil jurusan / lembaga
V.units = async (view, slug) => {
  if (!slug) {
    if (!isAdmin()) { location.hash = `#/units/${ME.unit_slug}`; return; }
    setHead('Profil Jurusan, Lembaga & TEFA');
    view.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Unit</th><th>Jenis</th><th></th></tr></thead><tbody>${UNITS.map((u) => `<tr>
      <td><span style="display:flex;gap:10px;align-items:center"><span style="width:12px;height:36px;border-radius:3px;background:${u.color}"></span><span><span class="t-title">${esc(u.name)}</span><span class="t-sub">${esc(u.short)}</span></span></span></td>
      <td>${TYPE_LABEL[u.type] || u.type}${u.parent && UNIT[u.parent] ? `<br><span class="t-sub">Induk: ${esc(UNIT[u.parent].name)}</span>` : ''}</td>
      <td class="act"><a class="btn btn-line btn-sm" href="${unitUrl(u)}" target="_blank">${ic('ext')}</a><a class="btn btn-dark btn-sm" href="#/units/${u.slug}">Ubah profil</a></td></tr>`).join('')}</tbody></table></div>
      <div class="notice info" style="margin-top:16px">Akun untuk tiap jurusan, lembaga, dan TEFA dibuat di menu <a href="#/users"><b>Pengguna & Akses</b></a>.</div>`;
    return;
  }
  const { unit } = await api('admin/units/' + slug);
  const isJur = unit.type === 'jurusan', isTefa = unit.type === 'tefa';
  setHead(`Profil ${unit.name}`, `<a class="btn btn-line" href="${unitUrl(unit)}" target="_blank">${ic('ext')}Lihat halaman</a>`);
  const main = [
    { k: 'name', label: 'Nama', required: true, half: true }, { k: 'short', label: 'Singkatan', half: true, max: 20 },
    { k: 'tagline', label: 'Slogan singkat' },
    { k: 'description', label: 'Profil / deskripsi', type: 'textarea', rows: 6 },
    { k: 'visi', label: 'Visi', type: 'textarea', rows: 2, half: true }, { k: 'misi', label: 'Misi (satu baris satu poin)', type: 'textarea', rows: 2, half: true },
    { k: 'kompetensi', label: isJur ? 'Kompetensi yang dipelajari (satu baris satu poin)' : isTefa ? 'Produk & layanan (satu baris satu poin)' : 'Layanan (satu baris satu poin)', type: 'textarea', rows: 6 },
    ...(isJur ? [{ k: 'prospek', label: 'Prospek karier lulusan (satu baris satu poin)', type: 'textarea', rows: 5 }] : []),
  ];
  const side = [
    { k: 'color', label: 'Warna identitas', type: 'color' },
    { k: 'logo', label: 'Logo', type: 'logo', help: 'PNG latar transparan paling bagus.' },
    { k: 'cover', label: 'Foto sampul halaman', type: 'image' },
    { k: 'head_name', label: isJur ? 'Nama Kaprog / Kakomli' : isTefa ? 'Nama manajer TEFA' : 'Nama ketua / penanggung jawab' },
    { k: 'head_title', label: 'Jabatan' },
    { k: 'head_photo', label: 'Foto', type: 'logo' },
    { k: 'phone', label: isTefa ? 'No. WhatsApp pemesanan' : 'No. WhatsApp', help: isTefa ? 'Akan muncul tombol "Pesan via WhatsApp" di halaman TEFA.' : '' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'instagram', label: 'Instagram (tanpa @)' },
  ];
  view.innerHTML = `<form id="f"><div class="form-grid"><div class="box"><div class="fields">${main.map((f) => fieldHtml(f, unit[f.k])).join('')}</div></div>
    <div class="box"><div class="fields">${side.map((f) => fieldHtml(f, unit[f.k])).join('')}</div><div class="form-actions"><button class="btn btn-primary btn-block">Simpan profil</button></div></div></div></form>`;
  bindForm(view, [...main, ...side]);
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('admin/units/' + slug, { method: 'PUT', body: readForm(view, [...main, ...side]) }); toast('Profil tersimpan'); await loadUnits(); }
    catch (er) { toast(er.message, true); }
  };
};

// Pengaturan situs
V.settings = async (view) => {
  setHead('Pengaturan Situs');
  const { settings: s } = await api('admin/settings');
  const groups = [
    ['Identitas sekolah', [
      { k: 'school_name', label: 'Nama sekolah', half: true }, { k: 'school_short', label: 'Nama singkat', half: true },
      { k: 'tagline', label: 'Slogan' }, { k: 'npsn', label: 'NPSN', half: true }, { k: 'akreditasi', label: 'Akreditasi', half: true },
    ]],
    ['Beranda', [
      { k: 'hero_title', label: 'Judul besar', help: 'Teks setelah tanda koma akan berwarna oranye.' }, { k: 'hero_subtitle', label: 'Sub judul', type: 'textarea', rows: 2 },
      { k: 'hero_image', label: 'Foto latar beranda (opsional)', type: 'image' }, { k: 'running_text', label: 'Teks berjalan' },
      { k: 'spmb_link', label: 'Tautan info SPMB/PPDB (opsional)', type: 'url' },
    ]],
    ['Statistik (kosongkan bila tidak ingin ditampilkan)', [
      { k: 'stat_siswa', label: 'Jumlah peserta didik', half: true }, { k: 'stat_guru', label: 'Jumlah guru & tendik', half: true },
      { k: 'stat_mitra', label: 'Jumlah mitra industri', half: true }, { k: 'stat_alumni', label: 'Lulusan terserap kerja (%)', half: true },
    ]],
    ['Kepala sekolah', [
      { k: 'principal_name', label: 'Nama lengkap & gelar', half: true }, { k: 'principal_title', label: 'Jabatan', half: true },
      { k: 'principal_photo', label: 'Foto (potret)', type: 'image' }, { k: 'principal_message', label: 'Kata sambutan', type: 'textarea', rows: 8 },
    ]],
    ['Profil', [{ k: 'sejarah', label: 'Sejarah singkat', type: 'textarea', rows: 6 }, { k: 'visi', label: 'Visi', type: 'textarea', rows: 2 }, { k: 'misi', label: 'Misi (satu baris satu poin)', type: 'textarea', rows: 6 }]],
    ['Kontak & media sosial', [
      { k: 'address', label: 'Alamat' }, { k: 'maps_query', label: 'Kata kunci peta Google Maps', help: 'Nama/alamat sekolah persis seperti di Google Maps.' },
      { k: 'email', label: 'Email', type: 'email', half: true }, { k: 'phone', label: 'Telepon', half: true }, { k: 'whatsapp', label: 'WhatsApp', half: true },
      { k: 'instagram', label: 'Instagram (tanpa @)', half: true }, { k: 'facebook', label: 'Facebook (nama pengguna)', half: true }, { k: 'youtube', label: 'YouTube (nama kanal tanpa @)', half: true },
    ]],
  ];
  const all = groups.flatMap(([, f]) => f);
  view.innerHTML = `<form id="f">${groups.map(([t, fs]) => `<div class="box"><h3>${esc(t)}</h3><div class="fields">${fs.map((f) => fieldHtml(f, s[f.k])).join('')}</div></div>`).join('')}
    <div class="form-actions" style="position:sticky;bottom:0;background:var(--paper);padding:12px 0"><button class="btn btn-primary">Simpan pengaturan</button></div></form>`;
  bindForm(view, all);
  $('#f').onsubmit = async (e) => { e.preventDefault(); try { await api('admin/settings', { method: 'PUT', body: readForm(view, all) }); toast('Pengaturan tersimpan'); } catch (er) { toast(er.message, true); } };
};

// Pengguna & hak akses
V.users = async (view) => {
  setHead('Pengguna & Akses', `<button class="btn btn-primary" id="addU">${ic('plus')}Tambah pengguna</button>`);
  const roleOpts = () => [{ v: 'unit', l: 'Pengelola Jurusan / Lembaga / TEFA' }, { v: 'admin', l: 'Administrator (semua akses)' }];
  const form = (u = {}) => [
    { k: 'name', label: 'Nama lengkap', required: true },
    ...(u.id ? [] : [{ k: 'username', label: 'Username (untuk login)', required: true, help: 'Huruf kecil, angka, titik atau strip. Contoh: kuliner, mm.operator' }]),
    { k: 'role', label: 'Peran', type: 'select', opts: roleOpts, default: 'unit', half: true },
    { k: 'unit_slug', label: 'Jurusan / lembaga / TEFA', type: 'select', opts: () => UNITS.map((x) => ({ v: x.slug, l: `${x.name} (${TYPE_LABEL[x.type] || x.type})` })), half: true },
    { k: 'password', label: u.id ? 'Password baru (kosongkan bila tidak diganti)' : 'Password', type: 'password', required: !u.id, help: 'Minimal 8 karakter.' },
    ...(u.id ? [{ k: 'active', label: 'Akun aktif', type: 'check' }] : []),
  ];
  const open = (u = {}) => {
    const fs = form(u);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<form class="modal-card"><h2>${u.id ? 'Ubah pengguna' : 'Pengguna baru'}</h2><div class="fields">${fs.map((f) => fieldHtml(f, u[f.k])).join('')}</div>
      <div class="form-actions"><button type="button" class="btn btn-line" data-x>Batal</button><button class="btn btn-primary">Simpan</button></div></form>`;
    document.body.appendChild(m);
    const sync = () => { $('[data-k="unit_slug"]', m).style.display = $('[name=role]', m).value === 'admin' ? 'none' : ''; };
    $('[name=role]', m).onchange = sync; sync();
    m.onclick = (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); };
    $('form', m).onsubmit = async (e) => {
      e.preventDefault(); const d = readForm(m, fs);
      try { await api('admin/users' + (u.id ? '/' + u.id : ''), { method: u.id ? 'PUT' : 'POST', body: d }); m.remove(); toast('Pengguna tersimpan'); load(); } catch (er) { toast(er.message, true); }
    };
  };
  view.innerHTML = `<div class="notice info"><b>Administrator</b> dapat mengelola semua isi website. <b>Pengelola jurusan/lembaga/TEFA</b> hanya dapat mengelola berita, agenda, galeri, dan profil unitnya sendiri (pengelola BKK juga lowongan, pengelola LSP juga skema).</div><div class="table-wrap" id="tbl"></div>`;
  let rows = [];
  const load = async () => {
    rows = (await api('admin/users')).items;
    $('#tbl').innerHTML = `<table><thead><tr><th>Nama</th><th>Username</th><th>Akses</th><th>Login terakhir</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((u) => `<tr>
      <td><b>${esc(u.name || '-')}</b></td><td><code>${esc(u.username)}</code></td>
      <td>${u.role === 'admin' ? '<span class="tag" style="--c:#f26836">Administrator</span>' : unitTag(u.unit_slug) + ` <span class="t-sub">${esc(unitName(u.unit_slug))}</span>`}</td>
      <td>${u.last_login ? fmtDate(u.last_login) : '<span class="t-sub">Belum pernah</span>'}</td>
      <td><span class="tag ${u.active ? 'ok' : 'bad'}">${u.active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td class="act"><button class="btn btn-line btn-sm" data-ed="${u.id}">Ubah</button>${u.id !== ME.id ? `<button class="btn btn-danger btn-sm" data-del="${u.id}">Hapus</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
  };
  $('#addU').onclick = () => open();
  $('#tbl').onclick = async (e) => {
    const ed = e.target.closest('[data-ed]'), del = e.target.closest('[data-del]');
    if (ed) open(rows.find((r) => r.id === +ed.dataset.ed));
    if (del && confirm('Hapus pengguna ini?')) { try { await api('admin/users/' + del.dataset.del, { method: 'DELETE' }); toast('Pengguna dihapus'); load(); } catch (er) { toast(er.message, true); } }
  };
  await load();
};

// Pesan masuk
V.messages = async (view) => {
  setHead('Pesan Masuk');
  const load = async () => {
    const d = await api('admin/messages');
    view.innerHTML = d.items.length ? d.items.map((m) => `<div class="msg-item${m.is_read ? '' : ' unread'}">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>${esc(m.name)}</b> <span class="t-sub" style="color:var(--muted)">${esc([m.email, m.phone].filter(Boolean).join(' · '))}</span></div><span style="color:var(--muted);font-size:.82rem">${fmtDate(m.created_at)}</span></div>
      ${m.subject ? `<div style="font-weight:700;margin-top:6px">${esc(m.subject)}</div>` : ''}<p>${esc(m.message)}</p>
      <div style="display:flex;gap:6px">${m.email ? `<a class="btn btn-line btn-sm" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Pesan Anda'))}">Balas email</a>` : ''}
      ${m.phone ? `<a class="btn btn-line btn-sm" target="_blank" href="https://wa.me/${esc(m.phone.replace(/\D/g, '').replace(/^0/, '62'))}">WhatsApp</a>` : ''}
      ${m.is_read ? '' : `<button class="btn btn-dark btn-sm" data-read="${m.id}">Tandai dibaca</button>`}<button class="btn btn-danger btn-sm" data-del="${m.id}">Hapus</button></div></div>`).join('') : '<div class="box empty">Belum ada pesan.</div>';
  };
  view.onclick = async (e) => {
    const r = e.target.closest('[data-read]'), d = e.target.closest('[data-del]');
    try {
      if (r) { await api('admin/messages/' + r.dataset.read, { method: 'PUT', body: {} }); load(); refreshUnread(); }
      if (d && confirm('Hapus pesan ini?')) { await api('admin/messages/' + d.dataset.del, { method: 'DELETE' }); load(); refreshUnread(); }
    } catch (er) { toast(er.message, true); }
  };
  await load();
};

// Ganti password
V.account = async (view) => {
  setHead('Ganti Password');
  view.innerHTML = `<form class="box" id="f" style="max-width:480px"><div class="fields">
    ${fieldHtml({ k: 'old', label: 'Password lama', type: 'password', required: true })}
    ${fieldHtml({ k: 'new', label: 'Password baru', type: 'password', required: true, help: 'Minimal 8 karakter.' })}
    ${fieldHtml({ k: 'new2', label: 'Ulangi password baru', type: 'password', required: true })}</div>
    <div class="form-actions"><button class="btn btn-primary">Simpan password</button></div></form>`;
  $('#f').onsubmit = async (e) => {
    e.preventDefault(); const d = readForm(view, [{ k: 'old' }, { k: 'new' }, { k: 'new2' }]);
    if (d.new !== d.new2) return toast('Ulangan password tidak sama.', true);
    try { await api('auth/password', { method: 'POST', body: d }); toast('Password berhasil diganti'); e.target.reset(); } catch (er) { toast(er.message, true); }
  };
};

// ---------- Router ----------
async function route() {
  if (!ME) return;
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const view = $('#view');
  $$('#menu a').forEach((x) => x.classList.toggle('on', x.dataset.h === (b && a === 'units' ? `units/${b}` : a || 'dashboard') || (a === 'units' && x.dataset.h === 'units' && isAdmin())));
  $('#side')?.classList.remove('open');
  view.innerHTML = '<div class="empty">Memuat…</div>';
  window.scrollTo(0, 0);
  try {
    if (!a || a === 'dashboard') return await V.dashboard(view);
    if (RES[a]) {
      if (a === 'lowongan' && !isAdmin() && ME.unit_slug !== 'bkk') throw new Error('Menu ini khusus BKK.');
      if (a === 'skema' && !isAdmin() && ME.unit_slug !== 'lsp') throw new Error('Menu ini khusus LSP.');
      return b ? await editView(view, a, b === 'new' ? null : b) : await listView(view, a);
    }
    if (a === 'units') return await V.units(view, b);
    if (V[a] && (isAdmin() || ['gallery', 'account'].includes(a))) return await V[a](view);
    throw new Error('Halaman tidak ditemukan atau Anda tidak memiliki akses.');
  } catch (e) { setHead('Oops'); view.innerHTML = `<div class="notice bad">${esc(e.message)}</div>`; }
}
async function refreshUnread() {
  if (!isAdmin()) return;
  try { const d = await api('admin/dashboard'); const el = $('#unread'); if (el) { el.textContent = d.unread; el.hidden = !d.unread; } } catch { /* abaikan */ }
}
async function loadUnits() {
  const s = await fetch('/api/site').then((r) => r.json());
  UNITS = s.units; UNIT = Object.fromEntries(UNITS.map((u) => [u.slug, u]));
}

// ---------- Login / pembuatan admin pertama ----------
function authScreen(setup) {
  $('#app').innerHTML = `<div class="auth">
    <div class="auth-art"><div class="mono" style="color:var(--sky)">SMK Negeri 8 Surabaya</div>
      <div><h1>Panel<br><em>Pengelola</em><br>Website</h1><p>Kelola berita, agenda, galeri, dan profil program keahlian, Teaching Factory, LSP, serta Bursa Kerja Khusus.</p></div>
      <div class="mono" style="color:#6e83a2">Kecantikan · Perhotelan · Kuliner · DKV · Tata Busana · TEFA · LSP · BKK</div></div>
    <div class="auth-form">
      <div class="brand"><img src="/assets/img/emblem-smkn8.png" alt=""><div><b style="font-family:var(--display);font-stretch:80%;text-transform:uppercase;font-size:1.3rem;display:block;line-height:1">SMK Negeri 8</b><span class="mono" style="color:var(--blue)">Surabaya</span></div></div>
      <h2>${setup ? 'Buat akun admin' : 'Masuk'}</h2>
      <p class="sub">${setup ? 'Website baru saja dipasang. Buat akun administrator pertama untuk mulai mengelola.' : 'Gunakan akun yang diberikan administrator sekolah.'}</p>
      <form id="af" style="display:grid;gap:16px">
        ${setup ? fieldHtml({ k: 'name', label: 'Nama lengkap', required: true }) : ''}
        ${fieldHtml({ k: 'username', label: 'Username', required: true, help: setup ? 'Huruf kecil/angka, minimal 3 karakter.' : '' })}
        ${fieldHtml({ k: 'password', label: 'Password', type: 'password', required: true, help: setup ? 'Minimal 8 karakter. Simpan baik-baik.' : '' })}
        <div id="am"></div>
        <button class="btn btn-primary btn-block">${setup ? 'Buat akun & masuk' : 'Masuk'}</button>
        <a href="/" style="text-align:center;color:var(--muted);font-size:.88rem">← Kembali ke website</a>
      </form>
    </div></div>`;
  $('#af [name=username]').setAttribute('autocomplete', 'username');
  $('#af [name=password]').setAttribute('autocomplete', setup ? 'new-password' : 'current-password');
  $('#af').onsubmit = async (e) => {
    e.preventDefault(); const b = $('button', e.target); b.disabled = true;
    const d = readForm(e.target, [{ k: 'name' }, { k: 'username' }, { k: 'password' }]);
    try { await api(setup ? 'auth/setup' : 'auth/login', { method: 'POST', body: d }); boot(); }
    catch (er) { $('#am').innerHTML = `<div class="notice bad" style="margin:0">${esc(er.message)}</div>`; b.disabled = false; }
  };
}

async function boot() {
  try {
    const st = await api('auth/status');
    if (!st.user) { ME = null; return authScreen(st.needsSetup); }
    ME = st.user;
    await loadUnits();
    renderShell(); refreshUnread(); route();
  } catch (e) {
    $('#app').innerHTML = `<div class="boot" style="opacity:1"><div class="notice bad">${esc(e.message)}</div></div>`;
  }
}
window.addEventListener('hashchange', route);
boot();
})();
