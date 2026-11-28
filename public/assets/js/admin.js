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
  handshake: '<path d="M11 17l2 2a1.4 1.4 0 0 0 2-2"/><path d="M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11l-1.5 1.5a2 2 0 0 1-3-3L13 7l-1-1-4 4"/><path d="M2 11l4-4 3 1M22 11l-4-4h-3"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  ext: '<path d="M14 3h7v7M10 14L21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  dl: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 16.5a3.5 3.5 0 0 1 7 0M15 10h4M15 14h3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  building: '<path d="M4 21V5l8-3 8 3v16M4 21h16M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
};
const ic = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

async function api(path, opts = {}) {
  const o = { method: opts.method || 'GET', headers: {} };
  // semua permintaan yang mengubah data dikirim sebagai JSON (server menolak tipe lain demi keamanan) — termasuk HAPUS
  if (opts.body !== undefined || o.method !== 'GET') { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(opts.body ?? {}); }
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
const isBkk = () => ['bkk', 'waka-humas'].includes(ME.unit_slug); // Waka Humas setara BKK (lowongan & DUDI)
const isGuru = () => ME.role === 'guru'; // guru penulis: opini, tips & tutorial, artikel praktis
const canReview = () => isAdmin() || ME.unit_slug === 'waka-wmm'; // persetujuan tulisan guru
const unitName = (slug) => (slug === 'sekolah' ? 'Sekolah (umum)' : UNIT[slug]?.name || slug);
const unitTag = (slug) => `<span class="tag" style="--c:${slug === 'sekolah' ? '#235ba4' : UNIT[slug]?.color || '#888'}">${esc(slug === 'sekolah' ? 'Sekolah' : UNIT[slug]?.short || slug)}</span>`;
const FAC_LABEL = { kelas: 'Ruang kelas', lab: 'Laboratorium / bengkel praktik', tefa: 'Ruang TEFA', studio: 'Studio', aula: 'Aula / ruang pertemuan', olahraga: 'Sarana olahraga',
  kreativitas: 'Ruang kreativitas siswa', perpustakaan: 'Perpustakaan', ibadah: 'Tempat ibadah', kesehatan: 'UKS / kesehatan', kantin: 'Kantin', toilet: 'Toilet', taman: 'Taman / ruang terbuka',
  kantor: 'Kantor / ruang layanan', parkir: 'Area parkir', lainnya: 'Lainnya' };
const unitOptions = () => [{ v: 'sekolah', l: 'Sekolah (umum)' }, ...UNITS.map((u) => ({ v: u.slug, l: u.name }))];
const TYPE_LABEL = { jurusan: 'Program Keahlian', lembaga: 'Lembaga', tefa: 'Teaching Factory', waka: 'Wakil Kepala Sekolah' };
const unitUrl = (u) => (u.type === 'lembaga' ? `/lembaga/${u.slug}` : u.type === 'waka' ? `/waka/${u.slug.replace(/^waka-/, '')}` : u.type === 'tefa' ? `/tefa/${u.slug.replace(/^tefa-/, '')}` : `/jurusan/${u.slug}`);
const BADGE = { terlaris: 'Terlaris', baru: 'Baru', promo: 'Promo', preorder: 'Pre-order' };
const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const jurOptions = () => UNITS.filter((u) => u.type === 'jurusan').map((u) => ({ v: u.slug, l: u.name }));

// ---------- Unggah gambar (otomatis diperkecil di browser) ----------
async function compress(file, maxW = 1600, jpeg = false) {
  if (file.type === 'image/gif' && file.size < 1.8e6) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  const keepPng = !jpeg && file.type === 'image/png' && maxW <= 800;
  const ctx = c.getContext('2d');
  if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const type = keepPng ? 'image/png' : 'image/jpeg';
  let q = 0.85, blob;
  do { blob = await new Promise((r) => c.toBlob(r, type, q)); q -= 0.12; } while (blob.size > 1.8e6 && q > 0.3 && !keepPng);
  return blob;
}
async function uploadImage(file, maxW, tag) {
  if (!/^image\//.test(file.type)) throw new Error('File harus berupa gambar.');
  const blob = await compress(file, maxW, tag === 'profil');
  const r = await fetch('/api/media' + (tag ? `?for=${tag}` : ''), { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
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
    case 'images': { const list = String(v || '').split(/\n+/).filter(Boolean);
      return `<div class="field"><span>${esc(f.label)}</span><div class="imgs-field" data-imgs="${f.k}"><input type="hidden" ${name} value="${esc(list.join('\n'))}"><input type="file" accept="image/*" multiple hidden>
        <div class="imgs-grid">${list.map((u) => `<span class="imgs-it" style="background-image:url('${esc(u)}')" data-u="${esc(u)}"><button type="button" title="Hapus foto" aria-label="Hapus foto">×</button></span>`).join('')}<button type="button" class="imgs-add" data-imgs-add>${ic('plus')}<span>Tambah foto</span></button></div></div></div>`; }
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
        <span class="sep"></span><button type="button" class="imp-btn" data-import title="Impor isi dari file Word, PDF, atau PowerPoint">${ic('upload')}Impor Word / PDF / PPT</button>
        <input type="file" accept="image/*" hidden data-imgfile><input type="file" accept=".docx,.pdf,.pptx,.doc,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" hidden data-docfile>
      </div>
      <div class="img-tools" hidden><span>Ukuran</span><button type="button" data-sz="img-s">Kecil</button><button type="button" data-sz="img-m">Sedang</button><button type="button" data-sz="img-l">Besar</button><button type="button" data-sz="img-f">Penuh</button>
        <span class="sep"></span><span>Posisi</span><button type="button" data-al="img-left" title="Kiri, teks mengalir di samping">Kiri</button><button type="button" data-al="img-center">Tengah</button><button type="button" data-al="img-right" title="Kanan, teks mengalir di samping">Kanan</button>
        <span class="sep"></span><button type="button" data-imgcap>Keterangan</button><button type="button" data-imgdel class="bad">${ic('trash')}Hapus</button></div>
      <div class="editor-area" contenteditable="true" data-placeholder="Tulis isi berita di sini…">${v}</div></div></div>`;
    default: return wrap(`<input type="${f.type || 'text'}" ${name} value="${esc(v)}" ${f.list ? `list="${f.list}" autocomplete="off"` : ''} ${f.required ? 'required' : ''} ${f.max ? `maxlength="${f.max}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>`);
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
      try { const url = await uploadImage(file.files[0], f.maxW || (f.type === 'logo' ? 600 : 1600), f.tag); hid.value = url; pv.style.backgroundImage = `url('${url}')`; pv.textContent = ''; clr.hidden = false; }
      catch (e) { pv.textContent = ''; toast(e.message, true); }
      file.value = '';
    };
  });
  // banyak foto (galeri kecil)
  $$('[data-imgs]', root).forEach((box) => {
    const hid = $('input[type=hidden]', box), file = $('input[type=file]', box), grid = $('.imgs-grid', box), add = $('[data-imgs-add]', box), MAX = 8;
    const sync = () => { const list = $$('.imgs-it', grid).map((x) => x.dataset.u); hid.value = list.join('\n'); add.hidden = list.length >= MAX; };
    const bindIt = (it) => { $('button', it).onclick = () => { it.remove(); sync(); }; };
    $$('.imgs-it', grid).forEach(bindIt); sync();
    add.onclick = () => file.click();
    file.onchange = async () => {
      const files = [...file.files].slice(0, MAX - $$('.imgs-it', grid).length); file.value = '';
      for (const fl of files) {
        const ph = document.createElement('span'); ph.className = 'imgs-it loading'; ph.textContent = 'Mengunggah…'; grid.insertBefore(ph, add);
        try { const u = await uploadImage(fl, 1600); ph.className = 'imgs-it'; ph.textContent = ''; ph.dataset.u = u; ph.style.backgroundImage = `url('${u}')`; ph.innerHTML = '<button type="button" title="Hapus foto" aria-label="Hapus foto">×</button>'; bindIt(ph); }
        catch (e) { ph.remove(); toast(e.message, true); }
        sync();
      }
    };
  });
  // editor teks
  $$('[data-rich]', root).forEach((ed) => {
    const area = $('.editor-area', ed), fileIn = $('[data-imgfile]', ed);
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
        document.execCommand('insertImage', false, url);
        $$(`img[src="${url}"]`, area).forEach((im) => { if (!im.className) im.className = 'img-l img-center'; });
        toast('Gambar ditambahkan. Klik gambar untuk mengatur ukuran & posisinya.');
      } catch (e) { toast(e.message, true); }
      fileIn.value = '';
    };
    area.addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
    bindImageTools(ed, area);
    bindDocImport(ed, area, root);
  });
}
// ---------- atur ukuran & posisi gambar di editor ----------
const IMG_SIZES = ['img-s', 'img-m', 'img-l', 'img-f'], IMG_ALIGN = ['img-left', 'img-center', 'img-right'];
function bindImageTools(ed, area) {
  const bar = $('.img-tools', ed);
  let cur = null;
  const tgt = () => (cur && cur.closest('figure') && area.contains(cur.closest('figure')) ? cur.closest('figure') : cur); // gambar berketerangan diatur lewat figure
  const mark = () => {
    const t = tgt();
    $$('[data-sz]', bar).forEach((b) => b.classList.toggle('on', !!t && t.classList.contains(b.dataset.sz)));
    $$('[data-al]', bar).forEach((b) => b.classList.toggle('on', !!t && t.classList.contains(b.dataset.al)));
  };
  const place = () => {
    if (!cur) return;
    const er = ed.getBoundingClientRect(), r = cur.getBoundingClientRect();
    bar.style.top = Math.max(48, r.top - er.top - bar.offsetHeight - 8) + 'px';
    bar.style.left = Math.max(8, Math.min(r.left - er.left, ed.clientWidth - bar.offsetWidth - 8)) + 'px';
  };
  const pick = (img) => {
    $$('img.sel', area).forEach((x) => x.classList.remove('sel'));
    cur = img; bar.hidden = !img;
    if (img) { img.classList.add('sel'); mark(); place(); }
  };
  area.addEventListener('click', (e) => pick(e.target.tagName === 'IMG' ? e.target : null));
  document.addEventListener('click', (e) => { if (cur && !ed.contains(e.target)) pick(null); });
  area.addEventListener('keydown', () => pick(null));
  window.addEventListener('scroll', place, { passive: true });
  const setCls = (list, c) => { const t = tgt(); if (!t) return; t.classList.remove(...list); t.classList.add(c); if (!IMG_SIZES.some((x) => t.classList.contains(x))) t.classList.add('img-l'); if (!IMG_ALIGN.some((x) => t.classList.contains(x))) t.classList.add('img-center'); mark(); setTimeout(place, 50); area.dispatchEvent(new Event('input', { bubbles: true })); };
  $$('[data-sz]', bar).forEach((b) => (b.onclick = () => setCls(IMG_SIZES, b.dataset.sz)));
  $$('[data-al]', bar).forEach((b) => (b.onclick = () => setCls(IMG_ALIGN, b.dataset.al)));
  $('[data-imgdel]', bar).onclick = () => { if (!cur) return; const fig = cur.closest('figure'); (fig && area.contains(fig) ? fig : cur).remove(); pick(null); };
  $('[data-imgcap]', bar).onclick = () => {
    if (!cur) return;
    let fig = cur.closest('figure');
    const old = fig?.querySelector('figcaption')?.textContent || '';
    const t = prompt('Keterangan gambar (kosongkan untuk menghapus keterangan):', old);
    if (t === null) return;
    const moveCls = (from, to) => { const cl = [...from.classList].filter((c) => /^img-/.test(c)); from.classList.remove(...cl); to.classList.add(...cl); };
    if (!fig && t.trim()) {
      fig = document.createElement('figure');
      const par = cur.parentElement; // bila gambar sendirian di dalam paragraf, paragrafnya diganti figure
      if (par && par !== area && par.tagName === 'P' && !par.textContent.trim() && par.querySelectorAll('img').length === 1) par.replaceWith(fig); else cur.replaceWith(fig);
      fig.appendChild(cur); moveCls(cur, fig);
    }
    if (fig) {
      let cap = fig.querySelector('figcaption');
      if (t.trim()) { if (!cap) { cap = document.createElement('figcaption'); fig.appendChild(cap); } cap.textContent = t.trim(); }
      else { if (cap) cap.remove(); moveCls(fig, cur); fig.replaceWith(cur); }
    }
    pick(cur);
  };
}
// ---------- impor Word / PDF / PowerPoint ----------
let docImportP = null;
const loadDocImport = () => (docImportP ||= new Promise((ok, no) => {
  if (window.DocImport) return ok(window.DocImport);
  const sc = document.createElement('script'); sc.src = '/assets/js/doc-import.js?v=35';
  sc.onload = () => ok(window.DocImport); sc.onerror = () => { docImportP = null; no(new Error('Gagal memuat fitur impor. Periksa koneksi lalu coba lagi.')); };
  document.head.appendChild(sc);
}));
function bindDocImport(ed, area, root) {
  const btn = $('[data-import]', ed), fin = $('[data-docfile]', ed);
  btn.onclick = () => fin.click();
  fin.onchange = async () => {
    const file = fin.files[0]; fin.value = '';
    if (!file) return;
    if (file.size > 40e6) return toast('File terlalu besar (maks. 40 MB). Perkecil gambar di dokumen atau bagi menjadi beberapa file.', true);
    const hasText = area.textContent.trim() || area.querySelector('img');
    if (hasText && !confirm('Editor sudah berisi tulisan.\n\nOK = tambahkan isi dokumen di BAGIAN AKHIR\nBatal = batalkan impor')) return;
    const ov = document.createElement('div'); ov.className = 'imp-overlay';
    ov.innerHTML = `<div><span class="spin"></span><b>Mengimpor ${esc(file.name)}</b><small id="impMsg">Menyiapkan…</small></div>`;
    ed.appendChild(ov);
    const say = (m) => { const el = $('#impMsg', ov); if (el) el.textContent = m; };
    try {
      const DI = await loadDocImport();
      const r = await DI.convert(file, { progress: say, upload: async (blob) => { try { return await uploadImage(blob, 1600); } catch { return ''; } } });
      // judul otomatis bila masih kosong; judul dokumen tidak diulang di awal isi
      const t = $('[name=title]', root);
      let html = r.html;
      if (t && !t.value.trim() && r.title) {
        t.value = r.title;
        const tmp = document.createElement('div'); tmp.innerHTML = html;
        const h = tmp.firstElementChild;
        if (h && /^H[1-4]$/.test(h.tagName) && h.textContent.trim() === r.title) { h.remove(); html = tmp.innerHTML; }
      }
      if (hasText) area.insertAdjacentHTML('beforeend', html); else area.innerHTML = html;
      // sampul otomatis bila masih kosong
      const cov = $('[name=cover]', root);
      if (cov && !cov.value && r.images[0]) {
        cov.value = r.images[0];
        const box = cov.closest('[data-img]'), pv = box && $('.preview', box);
        if (pv) { pv.style.backgroundImage = `url('${r.images[0]}')`; pv.textContent = ''; }
        const clr = box && $('[data-clear]', box); if (clr) clr.hidden = false;
      }
      ed.previousElementSibling?.classList?.contains('imp-note') && ed.previousElementSibling.remove();
      ed.insertAdjacentHTML('beforebegin', `<div class="notice ${r.warnings.length ? 'bad' : 'info'} imp-note"><b>Dokumen berhasil diimpor</b> (${r.images.length} gambar). Periksa kembali isinya: rapikan judul/paragraf bila perlu, dan <b>klik gambar</b> untuk mengatur ukuran, posisi, atau keterangannya.${r.warnings.length ? '<br>' + r.warnings.map(esc).join('<br>') : ''}</div>`);
      toast('Dokumen berhasil diimpor');
      area.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) { toast(e.message || 'Gagal mengimpor dokumen', true); }
    ov.remove();
  };
}
function readForm(root, fields) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'rich') { const c = $(`[data-rich="${f.k}"] .editor-area`, root).cloneNode(true); c.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); out[f.k] = c.innerHTML.replace(/ class=""/g, '').trim(); }
    else if (f.type === 'check') out[f.k] = $(`[name="${f.k}"]`, root)?.checked ? 1 : 0;
    else if (f.type === 'checks') out[f.k] = $$(`[data-checks="${f.k}"]:checked`, root).map((x) => x.value).join(',');
    else { const el = $(`[name="${f.k}"]`, root); if (el) out[f.k] = el.value.trim(); }
  }
  return out;
}

// Pratinjau video (YouTube / TikTok / Instagram) di formulir berita
function parseVideo(raw) {
  const u = String(raw || '').trim(); if (!u) return null;
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { label: 'YouTube', vertical: /\/shorts\//.test(u), embed: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` };
  m = u.match(/tiktok\.com\/.*\/video\/(\d+)/); if (m) return { label: 'TikTok', vertical: true, embed: `https://www.tiktok.com/embed/v2/${m[1]}` };
  m = u.match(/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/); if (m) return { label: 'Instagram', vertical: true, ig: true, embed: `https://www.instagram.com/${m[1] === 'p' ? 'p' : 'reel'}/${m[2]}/embed/` };
  if (/vt\.tiktok|vm\.tiktok|tiktok\.com\/t\//.test(u)) return { label: 'TikTok', short: true };
  return { bad: true };
}
function bindVideoPreview(root) {
  const inp = $('[name="video_url"]', root); if (!inp) return;
  const box = document.createElement('div'); box.className = 'vprev'; inp.closest('.field').appendChild(box);
  const draw = () => {
    const v = parseVideo(inp.value);
    box.innerHTML = !v ? '' : v.bad ? '<small style="color:var(--bad)">Link belum dikenali. Gunakan link video YouTube, TikTok, atau Reels/postingan Instagram.</small>'
      : v.short ? '<small>Link pendek TikTok terdeteksi. Pratinjau muncul setelah disimpan (sistem otomatis mencari alamat lengkapnya).</small>'
      : `<div class="vp${v.vertical ? ' vertical' : ''}${v.ig ? ' ig' : ''}"><iframe src="${esc(v.embed)}" title="Pratinjau video" loading="lazy" allowfullscreen scrolling="no"></iframe></div><small>Pratinjau ${v.label}: video ini akan tampil di bawah isi berita.</small>`;
  };
  let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 400); }); draw();
}

// ---------- Definisi menu konten ----------
const STATUS = () => [{ v: 'publish', l: 'Terbit' }, { v: 'draft', l: 'Draf' }];
const GURU_CATS = () => [{ v: 'opini', l: 'Opini' }, { v: 'tips', l: 'Tips & Tutorial' }, { v: 'artikel', l: 'Artikel Praktis' }];
const CATS = () => [{ v: 'kegiatan', l: 'Kegiatan' }, { v: 'berita', l: 'Berita' }, { v: 'prestasi', l: 'Prestasi' }, { v: 'pengumuman', l: 'Pengumuman' }, ...GURU_CATS()];
const CAT_LABEL = Object.fromEntries([{ v: 'kegiatan', l: 'Kegiatan' }, { v: 'berita', l: 'Berita' }, { v: 'prestasi', l: 'Prestasi' }, { v: 'pengumuman', l: 'Pengumuman' }, { v: 'opini', l: 'Opini' }, { v: 'tips', l: 'Tips & Tutorial' }, { v: 'artikel', l: 'Artikel Praktis' }].map((c) => [c.v, c.l]));
const STATUS_TAG = { publish: ['ok', 'Terbit'], draft: ['draft', 'Draf'], review: ['wait', 'Menunggu persetujuan WMM'], ditolak: ['bad', 'Perlu revisi'], arsip: ['draft', 'Diarsipkan'] };
const statusTag = (st) => { const [c, l] = STATUS_TAG[st] || ['draft', st]; return `<span class="tag ${c}">${l}</span>`; };
const RES = {
  posts: {
    get title() { return isGuru() ? 'Tulisan Saya' : 'Berita & Kegiatan'; }, get single() { return isGuru() ? 'tulisan' : 'berita'; }, icon: 'news',
    cols: [
      ['', (r) => (r.cover ? `<img class="thumb" src="${esc(r.cover)}" alt="">` : `<span class="thumb" style="display:block"></span>`)],
      ['Judul', (r) => `<span class="t-title">${esc(r.title)}</span><span class="t-sub">${fmtDate(r.published_at)} · ${esc(r.author_name || '')} · ${r.views || 0}× dibaca</span>`],
      ['Unit', (r) => unitTag(r.unit_slug), 'nonGuru'],
      ['Kategori', (r) => esc(CAT_LABEL[r.category] || r.category)],
      ['Status', (r) => `${statusTag(r.status)}${r.featured ? ' <span class="tag" style="--c:#f26836">Utama</span>' : ''}${(r.status === 'ditolak' || r.status === 'arsip') && r.review_note ? `<span class="t-sub" style="max-width:260px;white-space:normal">Catatan WMM: ${esc(r.review_note)}</span>` : ''}${r.status === 'publish' && r.reviewed_by ? `<span class="t-sub">Disetujui ${esc(r.reviewed_by)}</span>` : ''}${r.rev_state ? `<br><span class="tag ${{ review: 'wait', ditolak: 'bad', draft: 'draft' }[r.rev_state]}" style="margin-top:4px">${{ review: 'Revisi menunggu WMM', ditolak: 'Revisi dikembalikan', draft: 'Draf revisi' }[r.rev_state]}</span>${r.rev_state === 'ditolak' && r.rev_note ? `<span class="t-sub" style="max-width:260px;white-space:normal">Catatan WMM: ${esc(r.rev_note)}</span>` : ''}` : ''}`],
    ],
    main: () => [
      { k: 'title', label: 'Judul', required: true, max: 200 },
      { k: 'content', label: isGuru() ? 'Isi tulisan' : 'Isi berita', type: 'rich' },
      { k: 'video_url', label: 'Link video (opsional): YouTube, TikTok, atau Reels Instagram', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…  ·  https://www.tiktok.com/@akun/video/…  ·  https://www.instagram.com/reel/…', help: 'Tempel link videonya saja. Video otomatis bisa diputar langsung di halaman berita. Pastikan video/akun bersifat publik.' },
      { k: 'excerpt', label: 'Ringkasan (opsional)', type: 'textarea', rows: 2, help: 'Dikosongkan = diambil otomatis dari awal isi berita.' },
    ],
    side: () => isGuru() ? [
      { k: 'category', label: 'Jenis tulisan', type: 'select', opts: GURU_CATS, default: 'opini' },
      { k: 'cover', label: 'Gambar sampul (opsional)', type: 'image', help: 'Disarankan foto mendatar (landscape). Gunakan foto milik sendiri atau bebas hak cipta.' },
    ] : [
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
      { k: 'poster', label: 'Pamflet / poster lowongan', type: 'image', help: 'Gambar pamflet akan tampil di halaman BKK dan bisa diperbesar pengunjung.' },
      { k: 'logo', label: 'Logo perusahaan', type: 'logo' },
    ],
  },
  product: {
    title: 'Katalog Produk & Layanan', single: 'produk / layanan', icon: 'bag',
    cols: [
      ['', (r) => (r.image ? `<img class="thumb" src="${esc(r.image)}" alt="">` : `<span class="thumb" style="display:grid;place-items:center;color:var(--muted);font-size:.7rem">tanpa foto</span>`)],
      ['Produk / layanan', (r) => `<span class="t-title">${esc(r.name)}${r.badge ? ` <span class="tag" style="--c:#f26836">${esc(BADGE[r.badge] || r.badge)}</span>` : ''}</span><span class="t-sub">${esc(r.category || 'Tanpa kategori')}${r.duration ? ' · ' + esc(r.duration) : ''}</span>`],
      ['Harga', (r) => (r.price ? `<b>${rupiah(r.price)}</b>${r.price_note ? `<span class="t-sub">${esc(r.price_note)}</span>` : ''}` : `<span class="t-sub">${esc(r.price_note || 'Harga belum diisi')}</span>`)],
      ['Status', (r) => `<span class="tag ${r.active ? 'ok' : 'draft'}">${r.active ? 'Ditampilkan' : 'Disembunyikan'}</span>`],
      ['Unit', (r) => unitTag(r.unit_slug), 'adminOnly'],
    ],
    main: () => [
      { k: 'name', label: 'Nama produk / layanan', required: true, placeholder: 'mis. Kue Bolu Pandan, Creambath, Jasa Desain Logo' },
      { k: 'category', label: 'Kategori', half: true, list: 'catlist', placeholder: 'mis. Kue, Katering, Salon, Desain', help: 'Dipakai sebagai tombol filter. Pilih dari daftar atau ketik kategori baru.' },
      { k: 'duration', label: 'Estimasi waktu (opsional)', half: true, placeholder: 'mis. ±60 menit, jadi 3 hari, pesan H-2' },
      { k: 'price', label: 'Harga (Rp)', type: 'number', half: true, help: 'Angka saja tanpa titik, mis. 45000. Kosongkan bila harga menyesuaikan.' },
      { k: 'price_note', label: 'Keterangan harga (opsional)', half: true, placeholder: 'mis. mulai, per porsi, per jam, nego' },
      { k: 'description', label: 'Keterangan singkat', type: 'textarea', rows: 4, help: 'Isi, ukuran, varian, atau hal yang perlu diketahui pemesan (maks. ±3 kalimat).' },
    ],
    side: () => [
      { k: 'image', label: 'Foto produk / hasil layanan', type: 'image', help: 'Foto terang & jelas, sebaiknya persegi atau mendatar.' },
      { k: 'badge', label: 'Label (opsional)', type: 'select', opts: () => [{ v: '', l: '— Tanpa label —' }, ...Object.entries(BADGE).map(([v, l]) => ({ v, l }))] },
      { k: 'active', label: 'Tampilkan di website', type: 'check', default: 1 },
      { k: 'sort', label: 'Urutan tampil', type: 'number', default: 0, help: 'Angka kecil tampil lebih dulu.' },
      ...(isAdmin() ? [{ k: 'unit_slug', label: 'TEFA', type: 'select', opts: () => UNITS.filter((u) => u.type === 'tefa').map((u) => ({ v: u.slug, l: u.name })) }] : []),
    ],
    view: (r) => unitUrl(UNIT[r.unit_slug] || { type: 'tefa', slug: r.unit_slug }) + '#layanan',
  },
  program: {
    title: 'Program Sekolah', single: 'program', icon: 'clip',
    cols: [
      ['', (r) => (r.image ? `<img class="thumb" src="${esc(r.image)}" alt="">` : `<span class="thumb" style="display:block"></span>`)],
      ['Program', (r) => `<span class="t-title">${esc(r.title)}</span><span class="t-sub">${esc(r.period || '')}${r.summary ? ' · ' + esc(r.summary.slice(0, 80)) : ''}</span>`],
      ['Status', (r) => `<span class="tag ${r.status === 'selesai' ? 'draft' : 'ok'}">${esc({ rencana: 'Rencana', berjalan: 'Berjalan', selesai: 'Selesai' }[r.status] || r.status || '-')}</span>`],
      ['Unit', (r) => unitTag(r.unit_slug)],
    ],
    main: () => [
      { k: 'title', label: 'Nama program', required: true },
      { k: 'summary', label: 'Ringkasan singkat', type: 'textarea', rows: 2, help: 'Tampil di daftar program (1–2 kalimat).' },
      { k: 'period', label: 'Waktu / periode', placeholder: 'mis. Tahun Pelajaran 2026/2027, Semester Ganjil', half: true },
      { k: 'status', label: 'Status', type: 'select', half: true, opts: () => [{ v: 'berjalan', l: 'Berjalan' }, { v: 'rencana', l: 'Rencana' }, { v: 'selesai', l: 'Selesai' }] },
      ...(isAdmin() ? [{ k: 'unit_slug', label: 'Pengelola program', type: 'select', half: true, opts: unitOptions, default: 'sekolah' }] : []),
      { k: 'sort', label: 'Urutan tampil', type: 'number', half: true, default: 0 },
      { k: 'description', label: 'Uraian program (tujuan, sasaran, kegiatan, indikator)', type: 'textarea', rows: 7 },
      { k: 'image', label: 'Gambar / dokumentasi (opsional)', type: 'image' },
    ],
    view: (r) => '/program',
  },
  prestasi: {
    title: 'Prestasi Siswa', single: 'prestasi', icon: 'trophy',
    cols: [
      ['', (r) => (r.image ? `<img class="thumb" src="${esc(r.image)}" alt="">` : `<span class="thumb" style="display:block"></span>`)],
      ['Prestasi', (r) => `<span class="t-title">${esc(r.rank || '')} — ${esc(r.field || r.title)}</span><span class="t-sub">${esc(r.title)}</span>`],
      ['Peraih', (r) => esc(String(r.students || '').split('\n')[0].split(' — ')[0]) + (String(r.students || '').split('\n').length > 1 ? ' <span class="t-sub">dkk.</span>' : '')],
      ['Tingkat', (r) => `${esc(r.level || '-')}${r.year ? `<br><span class="t-sub">${r.year}</span>` : ''}`],
      ['Unit', (r) => unitTag(r.unit_slug)],
    ],
    main: () => [
      { k: 'rank', label: 'Juara / capaian', required: true, placeholder: 'mis. Juara 1, Medali Emas, Best Kontingen', half: true },
      { k: 'field', label: 'Bidang / cabang lomba', placeholder: 'mis. Hotel Reception, Pencak Silat — Tanding Putri', half: true },
      { k: 'title', label: 'Nama kejuaraan / lomba', required: true, placeholder: 'mis. LKS Dikmen Tingkat Nasional 2026' },
      { k: 'students', label: 'Peraih prestasi (satu baris satu orang: Nama — Kelas)', type: 'textarea', rows: 4, placeholder: 'Rehan Saputra — XI PH 2' },
      { k: 'level', label: 'Tingkat', type: 'select', half: true, opts: () => ['Kota', 'Provinsi', 'Nasional', 'Internasional'].map((x) => ({ v: x, l: x })) },
      { k: 'level_detail', label: 'Keterangan tingkat (opsional)', placeholder: 'mis. Provinsi Jawa Timur', half: true },
      { k: 'date_text', label: 'Tanggal pelaksanaan', placeholder: 'mis. 9–11 Februari 2026', half: true },
      { k: 'year', label: 'Tahun', type: 'number', half: true },
      { k: 'category', label: 'Kategori', type: 'select', half: true, opts: () => ['LKS', 'Olahraga', 'Seni & Budaya', 'Akademik', 'Kreativitas', 'Paskibra', 'Alumni', 'Lainnya'].map((x) => ({ v: x, l: x })) },
      ...(isAdmin() ? [{ k: 'unit_slug', label: 'Program keahlian', type: 'select', half: true, opts: unitOptions, default: 'sekolah' }] : []),
      { k: 'description', label: 'Keterangan tambahan (opsional)', type: 'textarea', rows: 2 },
      ...(isAdmin() ? [{ k: 'featured', label: 'Tampilkan di beranda', type: 'check', help: 'Prestasi tingkat nasional & internasional otomatis diutamakan di beranda.' }] : []),
      { k: 'image', label: 'Foto / sertifikat / poster', type: 'image' },
    ],
    view: () => '/prestasi',
  },
  facility: {
    title: 'Fasilitas', single: 'fasilitas', icon: 'building',
    cols: [
      ['', (r) => (r.image ? `<img class="thumb" src="${esc(r.image)}" alt="">` : `<span class="thumb" style="display:block"></span>`)],
      ['Fasilitas', (r) => `<span class="t-title">${esc(r.name)}</span><span class="t-sub">${esc(FAC_LABEL[r.category] || 'Lainnya')}${r.location ? ' · ' + esc(r.location) : ''}</span>`],
      ['Jumlah / kapasitas', (r) => [r.quantity ? `${r.quantity} ruang` : '', r.capacity ? `${r.capacity} orang` : '', r.area ? `${r.area} m²` : ''].filter(Boolean).join('<br>') || '-'],
      ['Kondisi', (r) => (r.condition ? `<span class="tag ${{ baik: 'ok', cukup: 'wait', perbaikan: 'bad' }[r.condition]}">${esc({ baik: 'Baik', cukup: 'Cukup', perbaikan: 'Perlu perbaikan' }[r.condition])}</span>` : '-')],
      ['Pengelola', (r) => (r.unit_slug === 'sekolah' ? '<span class="tag" style="--c:#5a6474">Sekolah / Sarpras</span>' : unitTag(r.unit_slug))],
    ],
    main: () => [
      { k: 'name', label: 'Nama fasilitas / ruang', required: true, placeholder: 'mis. Laboratorium Pastry & Bakery, Aula Utama, Ruang Kelas Gedung B' },
      { k: 'category', label: 'Jenis fasilitas', type: 'select', half: true, opts: () => Object.entries(FAC_LABEL).map(([v, l]) => ({ v, l })), default: 'kelas' },
      ...(isAdmin() || ME.unit_slug === 'waka-sarpras' ? [{ k: 'unit_slug', label: 'Pengelola / pemilik ruang', type: 'select', half: true, default: 'sekolah',
        opts: () => [{ v: 'sekolah', l: 'Sekolah (umum, dikelola Sarpras)' }, ...UNITS.filter((u) => u.type !== 'waka').map((u) => ({ v: u.slug, l: u.name }))],
        help: 'Ruang milik program keahlian/TEFA/lembaga bisa diedit juga oleh pengelolanya masing-masing.' }] : []),
      { k: 'location', label: 'Lokasi', half: true, placeholder: 'mis. Gedung B lantai 2' },
      { k: 'condition', label: 'Kondisi', type: 'select', half: true, default: 'baik', opts: () => [{ v: 'baik', l: 'Baik' }, { v: 'cukup', l: 'Cukup' }, { v: 'perbaikan', l: 'Perlu perbaikan' }] },
      { k: 'quantity', label: 'Jumlah ruang / unit', type: 'number', half: true, help: 'mis. 36 ruang kelas, 8 toilet' },
      { k: 'capacity', label: 'Kapasitas (orang per ruang)', type: 'number', half: true },
      { k: 'area', label: 'Luas (m², opsional)', type: 'number', half: true },
      { k: 'sort', label: 'Urutan tampil', type: 'number', half: true, default: 0 },
      { k: 'description', label: 'Deskripsi', type: 'textarea', rows: 3, placeholder: 'Fungsi ruang, kegiatan yang dilakukan, keunggulan…' },
      { k: 'features', label: 'Perlengkapan / fasilitas pendukung (satu baris satu item)', type: 'textarea', rows: 4, placeholder: 'AC\nProyektor & layar\nOven deck 3 tingkat\nWi-Fi' },
      ...(isAdmin() || ME.unit_slug === 'waka-sarpras' ? [{ k: 'featured', label: 'Unggulkan (tampil paling atas)', type: 'check' }] : []),
      { k: 'image', label: 'Foto utama', type: 'image' },
      { k: 'images', label: 'Foto lainnya (maks. 8)', type: 'images' },
    ],
    view: () => '/fasilitas',
  },
  dudi: {
    title: 'DUDI / Mitra Industri', single: 'DUDI', icon: 'handshake',
    cols: [
      ['Industri', (r) => `<span class="t-title">${esc(r.name)}</span><span class="t-sub">${esc(r.address || '')}</span>`],
      ['Bidang', (r) => esc(r.field || '-')],
      ['Jurusan', (r) => (r.major ? unitTag(r.major) : '-')],
    ],
    main: () => [
      { k: 'name', label: 'Nama industri / usaha', required: true },
      { k: 'address', label: 'Alamat', type: 'textarea', rows: 2 },
      ...(isAdmin() || isBkk() ? [{ k: 'major', label: 'Program keahlian', type: 'select', half: true, opts: jurOptions }] : []),
      { k: 'field', label: 'Bidang usaha (opsional)', placeholder: 'mis. Hotel, Salon, Percetakan, Butik', half: true },
      { k: 'website', label: 'Website / Instagram (opsional)', type: 'url', half: true },
      { k: 'sort', label: 'Urutan tampil', type: 'number', half: true, default: 0 },
      { k: 'description', label: 'Keterangan (opsional)', type: 'textarea', rows: 2 },
      { k: 'logo', label: 'Logo (opsional)', type: 'logo' },
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
  if (isGuru()) return [['Menulis', [['dashboard', 'Dasbor', 'dash'], ['notif', 'Notifikasi', 'bell'], ['posts', 'Tulisan Saya', 'pen']]], ['Profil', [['profil', 'Profil / CV Saya', 'idcard'], ['cv', 'Download CV (PDF)', 'dl']]]];
  const u = ME.unit_slug, items = [['dashboard', 'Dasbor', 'dash'], ['posts', 'Berita & Kegiatan', 'news'], ['agenda', 'Agenda', 'cal'], ['gallery', 'Galeri', 'img'], ['prestasi', 'Prestasi Siswa', 'trophy']];
  if (isAdmin() || UNIT[u]?.type === 'waka') items.splice(1, 0, ['program', 'Program Sekolah', 'clip']);
  if (canReview()) items.splice(1, 0, ['review', 'Persetujuan Tulisan', 'check']);
  const groups = [['Konten', items]];
  const facOk = isAdmin() || u === 'waka-sarpras' || ['jurusan', 'tefa'].includes(UNIT[u]?.type) || ['lsp', 'bkk'].includes(u);
  if (facOk) items.push(['facility', 'Fasilitas', 'building']);
  if (isAdmin()) {
    groups.push(['Unit', [['units', 'Profil Unit & Waka', 'unit'], ['product', 'Katalog TEFA', 'bag'], ['dudi', 'DUDI / Mitra Industri', 'handshake'], ['lowongan', 'Lowongan (BKK)', 'job'], ['skema', 'Skema (LSP)', 'badge'], ['/sarpras', 'SI-SARPRAS (Inventaris)', 'box']]]);
    groups.push(['Sekolah', [['settings', 'Pengaturan Situs', 'gear'], ['users', 'Pengguna & Akses', 'users'], ['profil-guru', 'Profil Guru', 'idcard'], ['messages', 'Pesan Masuk', 'mail'], ['backup', 'Backup & Pemulihan', 'shield']]]);
  } else {
    const g = [[`units/${u}`, 'Profil Unit', 'unit']];
    if (isBkk()) g.push(['lowongan', 'Lowongan Kerja (BKK)', 'job'], ['messages', 'Pesan Masuk', 'mail']);
    if (isBkk() || UNIT[u]?.type === 'jurusan') g.push(['dudi', 'DUDI / Mitra Industri', 'handshake']);
    if (u === 'lsp') g.push(['skema', 'Skema Sertifikasi', 'badge']);
    if (u === 'waka-sarpras') g.push(['/sarpras', 'SI-SARPRAS (Inventaris)', 'box']);
    if (UNIT[u]?.type === 'tefa') g.unshift(['product', 'Katalog Produk & Layanan', 'bag']);
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
      <div class="side-role"><b>${esc(ME.name || ME.username)}</b><small>${isAdmin() ? 'Administrator sekolah' : isGuru() ? 'Guru penulis' + (ME.title ? ' · ' + esc(ME.title) : '') : `Pengelola ${esc(un?.name || ME.unit_slug)}`}</small></div>
      <nav id="menu">${menu().map(([g, it]) => `<div class="grp">${esc(g)}</div>${it.map(([h, l, i]) => `<a href="${h.startsWith('/') ? h : '#/' + h}" data-h="${h}">${ic(i)}${esc(l)}${h === 'messages' ? '<span class="count" id="unread" hidden></span>' : h === 'review' ? '<span class="count" id="pending" hidden></span>' : h === 'notif' ? '<span class="count" id="notifc" hidden></span>' : ''}</a>`).join('')}`).join('')}</nav>
      <div class="side-foot">
        <a href="/" target="_blank">${ic('ext')}Lihat website</a>
        ${SITE_ALUMNI ? `<a href="${esc(SITE_ALUMNI)}" target="_blank" rel="noopener">${ic('users')}Portal Alumni</a>` : ''}
        <a href="#/account">${ic('key')}Ganti password</a>
        <button id="logout">${ic('out')}Keluar</button>
        <span style="font-size:.7rem;color:#6e83a2;padding:4px 12px">Versi website: 35</span>
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
  if (d.guru) return guruDashboard(view, d);
  const un = UNIT[ME.unit_slug];
  const stats = [[d.posts, 'Berita & kegiatan', '#235ba4'], [d.agenda, 'Agenda', '#16966a'], [d.gallery, 'Foto galeri', '#7c4bc4'], [d.views, 'Total dibaca', '#f26836']];
  if (d.lowongan !== undefined) stats.push([d.lowongan, 'Lowongan dibuka', '#16966a']);
  if (d.skema !== undefined) stats.push([d.skema, 'Skema sertifikasi', '#e3262b']);
  if (d.users !== undefined) stats.push([d.users, 'Pengguna', '#24282e']);
  if (d.unread !== undefined) stats.push([d.unread, 'Pesan belum dibaca', '#d2372b']);
  if (d.pending !== undefined) stats.unshift([d.pending, 'Tulisan guru menunggu persetujuan', '#d98a06']);
  const quick = [...(isAdmin() || UNIT[ME.unit_slug]?.type === 'waka' ? [['program/new', 'Tambah program sekolah', 'clip']] : []), ['posts/new', 'Tulis berita / kegiatan', 'news'], ['prestasi/new', 'Tambah prestasi siswa', 'trophy'], ['agenda/new', 'Tambah agenda', 'cal'], ['gallery', 'Unggah foto galeri', 'img']];
  if (!isAdmin()) quick.push([`units/${ME.unit_slug}`, 'Perbarui profil unit', 'unit']);
  if (isAdmin() || isBkk()) quick.push(['lowongan/new', 'Tambah lowongan', 'job']);
  if (isAdmin() || ME.unit_slug === 'lsp') quick.push(['skema/new', 'Tambah skema', 'badge']);
  if (isAdmin() || isBkk() || UNIT[ME.unit_slug]?.type === 'jurusan') quick.push(['dudi/new', 'Tambah mitra DUDI', 'handshake']);
  if (isAdmin()) quick.push(['users', 'Kelola pengguna', 'users'], ['settings', 'Pengaturan situs', 'gear'], ['backup', 'Backup data website', 'shield']);
  view.innerHTML = `
    <div class="welcome"><div><span class="mono" style="color:var(--sky)">${isAdmin() ? 'Administrator' : esc(TYPE_LABEL[un?.type] || 'Unit')}</span>
      <h2>Halo, ${esc(ME.name || ME.username)}</h2><p>${isAdmin() ? 'Anda dapat mengelola seluruh isi website, unit, dan pengguna.' : `Anda mengelola halaman ${esc(un?.name || '')}.`}</p></div>
      <div><a class="btn btn-primary" href="#/posts/new">${ic('plus')}Tulis berita</a>${!isAdmin() && un ? `<a class="btn btn-line" href="${unitUrl(un)}" target="_blank">${ic('ext')}Lihat halaman</a>` : ''}</div></div>
    ${isAdmin() ? backupReminder(d) : ''}
    ${d.pending ? `<div class="notice info" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span>${ic('pen')} <b>${d.pending} tulisan guru</b> menunggu persetujuan Anda.</span><a class="btn btn-primary btn-sm" href="#/review">Periksa sekarang</a></div>` : ''}
    <div class="grid-stats">${stats.map(([v, l, c]) => `<div class="stat" style="--c:${c}"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="form-grid">
      <div class="box"><h3>Berita terbaru</h3>${d.recent.length ? `<table><tbody>${d.recent.map((r) => `<tr><td><a href="#/posts/${r.id}"><span class="t-title">${esc(r.title)}</span><span class="t-sub">${fmtDate(r.published_at)} · ${r.views}× dibaca</span></a></td><td>${unitTag(r.unit_slug)}</td><td><span class="tag ${r.status === 'publish' ? 'ok' : 'draft'}">${r.status === 'publish' ? 'Terbit' : 'Draf'}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Belum ada berita.</div>'}</div>
      <div class="box"><h3>Aksi cepat</h3><div class="quick" style="grid-template-columns:1fr">${quick.map(([h, l, i]) => `<a href="#/${h}"><i>${ic(i)}</i>${esc(l)}</a>`).join('')}</div></div>
    </div>`;
};

// ---------- Impor fasilitas dari Excel ----------
let xlsxP = null;
const loadXlsx = () => (xlsxP ||= new Promise((ok, no) => {
  if (window.XLSX) return ok(window.XLSX);
  const sc = document.createElement('script'); sc.src = '/assets/js/vendor/xlsx-0.18.5.full.min.js';
  sc.onload = () => ok(window.XLSX); sc.onerror = () => { xlsxP = null; no(new Error('Gagal memuat modul Excel. Periksa koneksi lalu coba lagi.')); };
  document.head.appendChild(sc);
}));
const FAC_COLS = ['Nama Fasilitas', 'Jenis', 'Pengelola', 'Lokasi', 'Jumlah Ruang', 'Kapasitas (orang)', 'Luas (m2)', 'Kondisi', 'Deskripsi', 'Perlengkapan', 'Urutan'];
const facAll = () => isAdmin() || ME.unit_slug === 'waka-sarpras';
const facOwnerNames = () => (facAll() ? ['Sekolah', ...UNITS.filter((u) => u.type !== 'waka').map((u) => u.name)] : [UNIT[ME.unit_slug]?.name || ME.unit_slug]);
async function facTemplate() {
  try {
    const X = await loadXlsx();
    const ws = X.utils.aoa_to_sheet([FAC_COLS]);
    ws['!cols'] = [34, 30, 26, 24, 13, 16, 10, 16, 44, 44, 8].map((wch) => ({ wch }));
    const ex = [['Aula Utama', 'Aula & ruang pertemuan', 'Sekolah', 'Gedung A lantai 3', 1, 400, 600, 'Baik', 'Aula serbaguna untuk upacara, seminar, dan wisuda.', 'AC; Sound system; Proyektor; Panggung', 1],
      ['Ruang Kelas Teori', 'Ruang kelas', 'Sekolah', 'Gedung A & B', 36, 36, '', 'Baik', '', 'Smart TV; Kipas angin; Wi-Fi', 2],
      ['Laboratorium Pastry & Bakery', 'Laboratorium & bengkel praktik', facAll() ? 'Kuliner / Tata Boga' : facOwnerNames()[0], 'Gedung C lantai 1', 1, 24, 120, 'Baik', 'Praktik roti, kue, dan pastry.', 'Oven deck; Mixer planetary; Chiller', 3]];
    const guide = [['PETUNJUK PENGISIAN TEMPLATE FASILITAS'], [''],
      ['1. Isi data di sheet "Fasilitas" mulai baris ke-2 (baris 1 adalah judul kolom, jangan diubah).'],
      ['2. Hanya kolom "Nama Fasilitas" yang wajib diisi. Kolom lain boleh dikosongkan.'],
      ['3. Foto TIDAK diisi di Excel. Setelah impor, buka tiap fasilitas di panel lalu unggah foto utama & foto lainnya.'],
      ['4. Bila nama fasilitas + pengelola sudah ada di website, datanya akan DIPERBARUI (foto tetap aman), bukan dibuat ganda.'],
      ['5. Perlengkapan dipisahkan dengan titik koma ( ; ), contoh: AC; Proyektor; Wi-Fi'],
      [facAll() ? '6. Pengelola: tulis "Sekolah" untuk fasilitas umum (dikelola Sarpras), atau nama program/unit dari daftar di bawah.' : `6. Kolom Pengelola diabaikan: semua data otomatis tercatat milik ${UNIT[ME.unit_slug]?.name || 'unit Anda'}.`],
      [''], ['PILIHAN KOLOM "Jenis"'], ...Object.values(FAC_LABEL).map((l) => ['   ' + l]),
      [''], ['PILIHAN KOLOM "Pengelola"'], ...facOwnerNames().map((n) => ['   ' + n]),
      [''], ['PILIHAN KOLOM "Kondisi"'], ['   Baik'], ['   Cukup'], ['   Perlu perbaikan'],
      [''], ['CONTOH PENGISIAN (salin ke sheet "Fasilitas" bila perlu)'], FAC_COLS, ...ex];
    const wg = X.utils.aoa_to_sheet(guide); wg['!cols'] = [{ wch: 34 }, { wch: 30 }, { wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 40 }, { wch: 40 }];
    const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'Fasilitas'); X.utils.book_append_sheet(wb, wg, 'Petunjuk');
    X.writeFile(wb, 'Template_Impor_Fasilitas_SMKN8.xlsx');
    toast('Template diunduh. Lihat sheet "Petunjuk" untuk cara pengisian.');
  } catch (e) { toast(e.message, true); }
}
// pencocokan teks bebas ke kode
const facCatOf = (t) => {
  const v = String(t || '').toLowerCase().trim();
  if (!v) return 'lainnya';
  const byLabel = Object.entries(FAC_LABEL).find(([k, l]) => v === k || v === l.toLowerCase()); if (byLabel) return byLabel[0];
  const rules = [['tefa', /tefa|teaching factory/], ['lab', /lab|bengkel|praktik|workshop|dapur|salon|spa/], ['kelas', /kelas/], ['studio', /studio/], ['aula', /aula|pertemuan|rapat|auditorium/],
    ['olahraga', /olahraga|lapangan|gor|gym|basket|futsal|voli/], ['kreativitas', /kreativ|osis|ekskul|ekstrakurikuler/], ['perpustakaan', /perpus|pustaka|literasi/],
    ['ibadah', /ibadah|masjid|musholla|mushola|musala|kapel/], ['kesehatan', /uks|kesehatan|klinik/], ['kantin', /kantin|koperasi/], ['toilet', /toilet|wc|kamar mandi/],
    ['taman', /taman|terbuka|green|halaman/], ['kantor', /kantor|guru|tata usaha|\btu\b|layanan|kepala sekolah|bk\b|bimbingan/], ['parkir', /parkir/]];
  return (rules.find(([, r]) => r.test(v)) || ['lainnya'])[0];
};
const facUnitOf = (t) => {
  const v = String(t || '').toLowerCase().trim();
  if (!v || /^(sekolah|umum|sarpras|sarana|semua)/.test(v)) return 'sekolah';
  const u = UNITS.find((x) => [x.slug, x.name, x.short].filter(Boolean).some((n) => n.toLowerCase() === v)) || UNITS.find((x) => x.name.toLowerCase().includes(v) || v.includes(x.name.toLowerCase().split(' / ')[0]));
  return u ? u.slug : null;
};
const facCondOf = (t) => { const v = String(t || '').toLowerCase(); return !v ? '' : /perbaik|rusak/.test(v) ? 'perbaikan' : /cukup|sedang/.test(v) ? 'cukup' : 'baik'; };
const num = (v) => { const n = parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10); return Number.isFinite(n) ? n : ''; };
function facImport(done) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="modal-card" style="width:min(920px,100%)"><h2>Impor fasilitas dari Excel</h2>
    <p class="t-sub" style="white-space:normal;margin:0 0 14px">Gunakan <a href="#" id="tplLink" style="color:var(--blue);font-weight:700">template Excel</a> agar kolomnya sesuai. Foto diunggah manual setelah data masuk. Fasilitas dengan <b>nama & pengelola yang sama</b> akan diperbarui, tidak dibuat ganda.</p>
    <label class="field"><span>Pilih file Excel (.xlsx / .xls)</span><input type="file" id="xf" accept=".xlsx,.xls,.csv"></label>
    <div id="xprev" style="margin-top:14px"></div>
    <div class="form-actions"><button type="button" class="btn btn-line" data-x>Tutup</button><button class="btn btn-primary" id="xgo" disabled>Impor</button></div></div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  $('[data-x]', m).onclick = close; m.addEventListener('click', (e) => { if (e.target === m) close(); });
  $('#tplLink', m).onclick = (e) => { e.preventDefault(); facTemplate(); };
  let rows = [];
  $('#xf', m).onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    $('#xprev', m).innerHTML = '<div class="empty">Membaca file…</div>';
    try {
      const X = await loadXlsx();
      const wb = X.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
      const ws = wb.Sheets.Fasilitas || wb.Sheets[wb.SheetNames[0]];
      const aoa = X.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
      const hi = aoa.findIndex((r) => r.some((c) => /nama/i.test(String(c))));
      if (hi < 0) throw new Error('Kolom "Nama Fasilitas" tidak ditemukan. Gunakan template Excel yang disediakan.');
      const head = aoa[hi].map((h) => String(h).toLowerCase().replace(/\*/g, '').trim());
      const col = (re) => head.findIndex((h) => re.test(h));
      const C = { name: col(/nama/), cat: col(/jenis|kategori/), own: col(/pengelola|pemilik|unit|jurusan/), loc: col(/lokasi|letak|gedung/), qty: col(/jumlah/), cap: col(/kapasitas/),
        area: col(/luas/), cond: col(/kondisi/), desc: col(/deskripsi|keterangan/), feat: col(/perlengkapan|fasilitas pendukung|sarana/), sort: col(/urut/) };
      const g = (r, i) => (i >= 0 ? String(r[i] ?? '').trim() : '');
      rows = aoa.slice(hi + 1).filter((r) => g(r, C.name)).map((r) => {
        const ownTxt = g(r, C.own), u = facAll() ? facUnitOf(ownTxt) : ME.unit_slug;
        return { name: g(r, C.name).slice(0, 150), category: facCatOf(g(r, C.cat)), catTxt: g(r, C.cat), unit_slug: u || 'sekolah', ownWarn: facAll() && ownTxt && !u ? ownTxt : '',
          location: g(r, C.loc), quantity: num(g(r, C.qty)), capacity: num(g(r, C.cap)), area: num(g(r, C.area)), condition: facCondOf(g(r, C.cond)),
          description: g(r, C.desc), features: g(r, C.feat).split(/\s*[;\n]\s*/).filter(Boolean).join('\n'), sort: num(g(r, C.sort)) };
      });
      if (!rows.length) throw new Error('Tidak ada baris data. Isi data mulai baris ke-2 di sheet "Fasilitas".');
      const warn = rows.filter((r) => r.ownWarn).length;
      $('#xprev', m).innerHTML = `<div class="notice ${warn ? 'bad' : 'info'}"><b>${rows.length} fasilitas</b> siap diimpor.${warn ? ` ${warn} baris punya pengelola yang tidak dikenali dan akan dicatat sebagai <b>Sekolah</b> (bisa diubah nanti).` : ''}</div>
        <label class="inline" style="margin:4px 0 10px;display:flex;gap:8px;align-items:center;font-size:.88rem"><input type="checkbox" id="xupd" checked> Perbarui data yang sudah ada (nama & pengelola sama). Bila tidak dicentang, baris tersebut dilewati.</label>
        <div class="table-wrap" style="max-height:340px;overflow:auto"><table><thead><tr><th>#</th><th>Nama</th><th>Jenis</th><th>Pengelola</th><th>Lokasi</th><th>Jml</th><th>Kap.</th><th>Kondisi</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td>${i + 1}</td><td><span class="t-title">${esc(r.name)}</span>${r.features ? `<span class="t-sub">${esc(r.features.split('\n').length)} perlengkapan</span>` : ''}</td>
          <td>${esc(FAC_LABEL[r.category])}${r.catTxt && facCatOf(r.catTxt) === 'lainnya' && !/lain/i.test(r.catTxt) ? `<span class="t-sub" style="color:var(--bad)">"${esc(r.catTxt)}" tidak dikenal</span>` : ''}</td>
          <td>${r.unit_slug === 'sekolah' ? 'Sekolah' : esc(UNIT[r.unit_slug]?.name || r.unit_slug)}${r.ownWarn ? `<span class="t-sub" style="color:var(--bad)">"${esc(r.ownWarn)}" tidak dikenal</span>` : ''}</td>
          <td>${esc(r.location || '-')}</td><td>${r.quantity || '-'}</td><td>${r.capacity || '-'}</td><td>${esc({ baik: 'Baik', cukup: 'Cukup', perbaikan: 'Perbaikan' }[r.condition] || '-')}</td></tr>`).join('')}</tbody></table></div>`;
      $('#xgo', m).disabled = false; $('#xgo', m).textContent = `Impor ${rows.length} fasilitas`;
    } catch (er) { rows = []; $('#xgo', m).disabled = true; $('#xprev', m).innerHTML = `<div class="notice bad">${esc(er.message)}</div>`; }
  };
  $('#xgo', m).onclick = async () => {
    if (!rows.length) return;
    const btn = $('#xgo', m); btn.disabled = true; btn.textContent = 'Mengimpor…';
    try {
      const body = { mode: $('#xupd', m)?.checked ? 'update' : 'skip', rows: rows.map(({ catTxt, ownWarn, ...r }) => r) };
      const r = await api('admin/facility/import', { method: 'POST', body });
      $('#xprev', m).innerHTML = `<div class="notice info"><b>Impor selesai.</b> ${r.inserted} fasilitas baru, ${r.updated} diperbarui${r.skipped ? `, ${r.skipped} dilewati` : ''}.<br>Langkah berikutnya: buka tiap fasilitas (tombol <b>Edit</b>) untuk mengunggah <b>foto utama</b> dan foto lainnya.</div>`;
      btn.textContent = 'Selesai'; toast('Impor fasilitas selesai'); done && done();
    } catch (er) { toast(er.message, true); btn.disabled = false; btn.textContent = `Impor ${rows.length} fasilitas`; }
  };
}

// Daftar (tabel) umum
async function listView(view, key) {
  const R = RES[key];
  setHead(R.title, `${key === 'facility' ? `<button class="btn btn-line" id="facTpl">${ic('dl')}Template Excel</button><button class="btn btn-line" id="facImp">${ic('upload')}Impor Excel</button>` : ''}<a class="btn btn-primary" href="#/${key}/new">${ic('plus')}Tambah ${R.single}</a>`);
  if (key === 'facility') { $('#facTpl').onclick = facTemplate; $('#facImp').onclick = () => facImport(() => load()); }
  let page = 1, q = '', unit = '';
  view.innerHTML = `<div class="toolbar">
      ${['posts', 'dudi', 'prestasi'].includes(key) ? `<label class="search">${ic('search')}<input type="search" placeholder="${key === 'dudi' ? 'Cari nama industri…' : 'Cari judul…'}" id="q"></label>` : ''}
      ${key === 'dudi' && (isAdmin() || isBkk()) ? `<select id="fu"><option value="">Semua jurusan</option>${jurOptions().map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('')}</select>` : ''}
      ${isAdmin() && ['posts', 'agenda', 'prestasi', 'program'].includes(key) ? `<select id="fu"><option value="">Semua unit</option>${unitOptions().map((o) => `<option value="${o.v}">${esc(o.l)}</option>`).join('')}</select>` : ''}
    </div><div class="table-wrap" id="tbl"></div><div class="pager" id="pg"></div>`;
  const load = async () => {
    const d = await api(`admin/${key}?page=${page}&limit=20${q ? '&q=' + encodeURIComponent(q) : ''}${unit ? '&unit=' + unit : ''}`);
    const cols = R.cols.filter((c) => !(c[2] === 'nonGuru' && isGuru()) && !(c[2] === 'adminOnly' && !isAdmin()));
    $('#tbl').innerHTML = d.items.length ? `<table><thead><tr>${cols.map(([h]) => `<th>${h}</th>`).join('')}<th></th></tr></thead><tbody>
      ${d.items.map((r) => `<tr>${cols.map(([, fn]) => `<td>${fn(r)}</td>`).join('')}<td class="act">
        ${R.view && R.view(r) ? `<a class="btn btn-line btn-sm" href="${R.view(r)}" target="_blank" title="Lihat">${ic('ext')}</a>` : ''}
        <a class="btn btn-line btn-sm" href="#/${key}/${r.id}">${ic('pen')}Edit</a>${isGuru() && r.status === 'publish' ? '' : `<button class="btn btn-danger btn-sm" data-del="${r.id}">Hapus</button>`}</td></tr>`).join('')}
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
  const guruPost = key === 'posts' && isGuru();
  const isRev = guruPost && item.status === 'publish'; // edit tulisan yang sudah tayang = revisi
  if (isRev && item.rev_data) { try { Object.assign(item, JSON.parse(item.rev_data)); } catch { /* abaikan */ } }
  if (isRev) setHead('Edit tulisan yang sudah tayang', `<a class="btn btn-line" href="/berita/${esc(item.slug)}" target="_blank">${ic('ext')}Lihat versi tayang</a><a class="btn btn-line" href="#/${key}">Kembali</a>`);
  view.innerHTML = `${isRev ? `<div class="notice ${item.rev_state === 'ditolak' ? 'bad' : 'info'}">${item.rev_state === 'ditolak' ? `<b>Revisi dikembalikan.</b> Catatan dari ${esc(item.reviewed_by || 'WMM')}: ${esc(item.rev_note || '-')}<br>Perbaiki lalu klik <b>Kirim revisi ke WMM</b> lagi.<br>`
      : item.rev_state === 'review' ? '<b>Revisi sedang menunggu persetujuan WMM.</b> Anda masih boleh memperbaikinya. '
      : ''}Tulisan ini <b>sudah tayang</b>. Perubahan Anda disimpan sebagai <b>revisi</b> dan dikirim ke WMM; versi yang tayang sekarang <b>tidak berubah</b> sampai revisi disetujui.</div>`
    : guruPost && item.status === 'arsip' ? `<div class="notice bad"><b>Tulisan ini diarsipkan</b>${item.archive_reason === 'auto' ? ' otomatis karena belum direvisi dalam batas waktu' : ` oleh ${esc(item.reviewed_by || 'WMM')}`}.${item.review_note ? ` Catatan WMM: ${esc(item.review_note)}` : ''}<br>Anda masih dapat memperbaikinya lalu klik <b>Kirim ke WMM</b> untuk diperiksa ulang, atau menghapusnya dari <b>Tulisan Saya</b>.</div>`
    : guruPost ? `<div class="notice ${item.status === 'ditolak' ? 'bad' : 'info'}">${item.status === 'ditolak' ? `<b>Perlu revisi.</b> Catatan dari ${esc(item.reviewed_by || 'WMM')}: ${esc(item.review_note || '-')}<br>Perbaiki tulisan lalu klik <b>Kirim ke WMM</b> lagi.`
      : item.status === 'review' ? '<b>Sedang menunggu persetujuan WMM.</b> Anda masih boleh memperbaikinya; tulisan akan tetap dalam antrean.'
      : 'Tulisan Anda <b>tidak langsung tayang</b>. Setelah klik <b>Kirim ke WMM</b>, tulisan diperiksa Waka Manajemen Mutu terlebih dahulu. Nama Anda akan tercantum sebagai penulis.'}</div>` : ''}<form id="f" novalidate><div class="${side.length ? 'form-grid' : ''}">
    <div class="box"><div class="fields">${main.map((f) => fieldHtml(f, item[f.k])).join('')}</div></div>
    ${side.length ? `<div class="box"><div class="fields">${side.map((f) => fieldHtml(f, item[f.k])).join('')}</div>
      <div class="form-actions">${guruPost ? `<button class="btn btn-line btn-block" type="submit" data-st="draft">${isRev ? 'Simpan draf revisi' : 'Simpan draf'}</button><button class="btn btn-primary btn-block" type="submit" data-st="review">${ic('check')}${isRev ? 'Kirim revisi ke WMM' : 'Kirim ke WMM'}</button>${isRev && item.rev_state ? '<button class="btn btn-danger btn-block" type="button" id="cancelRev">Batalkan revisi</button>' : ''}` : '<button class="btn btn-primary btn-block" type="submit">Simpan</button>'}</div></div>` : ''}
  </div>${side.length ? '' : `<div class="form-actions"><a class="btn btn-line" href="#/${key}">Batal</a><button class="btn btn-primary" type="submit">Simpan</button></div>`}</form>`;
  bindForm(view, all);
  if (key === 'posts') bindVideoPreview(view);
  if (key === 'product') { // saran kategori: yang sudah dipakai + contoh umum
    const used = (await api('admin/product').catch(() => ({ items: [] }))).items.map((r) => r.category).filter(Boolean);
    const sug = { 'tefa-kuliner': ['Kue & Roti', 'Katering', 'Minuman', 'Snack Box'], 'tefa-kecantikan': ['Salon Rambut', 'Perawatan Wajah', 'Spa & Pijat', 'Rias / Make-up'],
      'tefa-perhotelan': ['Kamar', 'Laundry', 'Event & MICE', 'Food & Beverage'], 'tefa-dkv': ['Desain Grafis', 'Foto', 'Video', 'Cetak'], 'tefa-busana': ['Jasa Jahit', 'Seragam', 'Produk Fashion', 'Permak'] }[item.unit_slug || ME.unit_slug] || [];
    const dl = document.createElement('datalist'); dl.id = 'catlist';
    dl.innerHTML = [...new Set([...used, ...sug])].map((c) => `<option value="${esc(c)}">`).join(''); view.appendChild(dl);
  }
  if ($('#cancelRev')) $('#cancelRev').onclick = async () => {
    if (!confirm('Batalkan revisi? Tulisan yang tayang tetap seperti sekarang.')) return;
    try { await api(`admin/${key}/${id}`, { method: 'PUT', body: { cancel_revision: 1 } }); toast('Revisi dibatalkan'); location.hash = `#/${key}`; } catch (er) { toast(er.message, true); }
  };
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    const data = readForm(view, all);
    for (const f of all) if (f.required && !data[f.k]) return toast(`"${f.label}" wajib diisi.`, true);
    if (guruPost) {
      data.status = e.submitter?.dataset.st === 'draft' ? 'draft' : 'review';
      if (data.status === 'review' && !(data.content || '').replace(/<[^>]+>/g, '').trim()) return toast('Isi tulisan masih kosong.', true);
      delete data.published_at;
    } else if (key === 'posts') {
      data.published_at = data.published_at && data.published_at === wibDate(original.published_at) ? original.published_at
        : data.published_at ? new Date(data.published_at + 'T' + new Date(Date.now() + 7 * 3600e3).toISOString().slice(11, 19) + '+07:00').toISOString() : '';
    }
    const btns = $$('button[type=submit]', view); btns.forEach((b) => (b.disabled = true));
    try {
      await api(`admin/${key}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body: data });
      toast(isRev ? (data.status === 'review' ? 'Revisi terkirim ke WMM. Versi yang tayang tetap sampai revisi disetujui.' : 'Draf revisi tersimpan') : guruPost ? (data.status === 'review' ? 'Terkirim ke WMM. Anda akan melihat statusnya di "Tulisan Saya".' : 'Draf tersimpan') : 'Tersimpan'); location.hash = `#/${key}`;
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
    setHead('Profil Unit & Wakil Kepala Sekolah');
    view.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Unit</th><th>Jenis</th><th></th></tr></thead><tbody>${UNITS.map((u) => `<tr>
      <td><span style="display:flex;gap:10px;align-items:center"><span style="width:12px;height:36px;border-radius:3px;background:${u.color}"></span><span><span class="t-title">${esc(u.name)}</span><span class="t-sub">${esc(u.short)}</span></span></span></td>
      <td>${TYPE_LABEL[u.type] || u.type}${u.parent && UNIT[u.parent] ? `<br><span class="t-sub">Induk: ${esc(UNIT[u.parent].name)}</span>` : ''}</td>
      <td class="act"><a class="btn btn-line btn-sm" href="${unitUrl(u)}" target="_blank">${ic('ext')}</a><a class="btn btn-dark btn-sm" href="#/units/${u.slug}">Ubah profil</a></td></tr>`).join('')}</tbody></table></div>
      <div class="notice info" style="margin-top:16px">Akun untuk tiap jurusan, lembaga, dan TEFA dibuat di menu <a href="#/users"><b>Pengguna & Akses</b></a>.</div>`;
    return;
  }
  const { unit } = await api('admin/units/' + slug);
  const isJur = unit.type === 'jurusan', isTefa = unit.type === 'tefa', isWaka = unit.type === 'waka';
  setHead(`Profil ${unit.name}`, `<a class="btn btn-line" href="${unitUrl(unit)}" target="_blank">${ic('ext')}Lihat halaman</a>`);
  const main = [
    { k: 'name', label: 'Nama', required: true, half: true }, { k: 'short', label: 'Singkatan', half: true, max: 20 },
    { k: 'tagline', label: 'Slogan singkat' },
    { k: 'video', label: 'Link video profil YouTube (opsional)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'Tampil di bagian atas profil. Salin link video dari YouTube.' },
    { k: 'description', label: 'Profil / deskripsi', type: 'textarea', rows: 6 },
    { k: 'visi', label: 'Visi', type: 'textarea', rows: 2, half: true }, { k: 'misi', label: 'Misi (satu baris satu poin)', type: 'textarea', rows: 2, half: true },
    ...(isTefa ? [
      { k: 'hours', label: 'Jam layanan', half: true, placeholder: 'mis. Senin–Jumat, 08.00–14.00 WIB' },
      { k: 'address', label: 'Lokasi layanan', half: true, placeholder: 'mis. Gedung B lantai 1, Ruang TEFA Kuliner' },
      { k: 'order_note', label: 'Catatan pemesanan (opsional)', type: 'textarea', rows: 2, placeholder: 'mis. Pesanan kue minimal H-2. Pembayaran tunai/transfer saat konfirmasi.' },
    ] : []),
    { k: 'kompetensi', label: isJur ? 'Kompetensi yang dipelajari (satu baris satu poin)' : isTefa ? 'Ringkasan layanan (opsional, satu baris satu poin)' : isWaka ? 'Tugas & fungsi (satu baris satu poin)' : 'Layanan (satu baris satu poin)', type: 'textarea', rows: 6 },
    ...(isJur ? [{ k: 'prospek', label: 'Prospek karier lulusan (satu baris satu poin)', type: 'textarea', rows: 5 }] : []),
  ];
  const side = [
    { k: 'color', label: 'Warna identitas', type: 'color' },
    { k: 'logo', label: 'Logo', type: 'logo', help: 'PNG latar transparan paling bagus.' },
    { k: 'cover', label: 'Foto sampul halaman', type: 'image' },
    { k: 'head_name', label: isJur ? 'Nama Kaprog / Kakomli' : isTefa ? 'Nama manajer TEFA' : isWaka ? 'Nama wakil kepala sekolah' : 'Nama ketua / penanggung jawab' },
    { k: 'head_title', label: 'Jabatan' },
    { k: 'head_photo', label: 'Foto', type: 'logo' },
    { k: 'phone', label: isTefa ? 'No. WhatsApp pemesanan' : 'No. WhatsApp', help: isTefa ? 'Pesanan dari tombol "Pesan via WhatsApp" dikirim ke nomor ini. Bila kosong, memakai nomor WhatsApp sekolah.' : '' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'instagram', label: 'Instagram (tanpa @)' },
  ];
  view.innerHTML = `${isTefa ? `<div class="notice info">Produk & layanan TEFA dikelola di menu <a href="#/product" style="font-weight:700">Katalog Produk & Layanan</a> (dengan foto, harga, dan tombol pesan WhatsApp). Isi juga <b>No. WhatsApp pemesanan</b>, <b>jam</b>, dan <b>lokasi layanan</b> di bawah ini.</div>` : ''}<form id="f"><div class="form-grid"><div class="box"><div class="fields">${main.map((f) => fieldHtml(f, unit[f.k])).join('')}</div></div>
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
  const { settings: s, notif } = await api('admin/settings');
  const groups = [
    ['Identitas sekolah', [
      { k: 'school_name', label: 'Nama sekolah', half: true }, { k: 'school_short', label: 'Nama singkat', half: true },
      { k: 'tagline', label: 'Slogan' }, { k: 'npsn', label: 'NPSN', half: true }, { k: 'akreditasi', label: 'Akreditasi', half: true },
    ]],
    ['Beranda', [
      { k: 'hero_title', label: 'Judul besar', help: 'Teks setelah tanda koma akan berwarna oranye.' }, { k: 'hero_subtitle', label: 'Sub judul', type: 'textarea', rows: 2 },
      { k: 'hero_image', label: 'Foto latar beranda (opsional)', type: 'image' }, { k: 'running_text', label: 'Teks berjalan' },
      { k: 'spmb_link', label: 'Tautan info SPMB/PPDB (opsional)', type: 'url' },
      { k: 'alumni_link', label: 'Alamat portal Alumni', type: 'url', help: 'Menu "Alumni" di website dan panel mengarah ke alamat ini. Kosongkan untuk menyembunyikan menu.' },
    ]],
    ['Statistik (kosongkan bila tidak ingin ditampilkan)', [
      { k: 'stat_siswa', label: 'Jumlah peserta didik', half: true }, { k: 'stat_guru', label: 'Jumlah guru & tendik', half: true },
      { k: 'stat_mitra', label: 'Jumlah mitra industri', half: true }, { k: 'stat_alumni', label: 'Lulusan terserap kerja (%)', half: true },
    ]],
    ['Kepala sekolah', [
      { k: 'principal_name', label: 'Nama lengkap & gelar', half: true }, { k: 'principal_title', label: 'Jabatan', half: true },
      { k: 'principal_photo', label: 'Foto (potret)', type: 'image' }, { k: 'principal_message', label: 'Kata sambutan', type: 'textarea', rows: 8 },
    ]],
    ['Perpustakaan', [
      { k: 'library_name', label: 'Nama perpustakaan', half: true }, { k: 'library_url', label: 'Link perpustakaan digital', type: 'url', half: true },
      { k: 'library_video', label: 'Link video profil perpustakaan (YouTube)', type: 'url' },
      { k: 'library_desc', label: 'Deskripsi perpustakaan', type: 'textarea', rows: 4 },
      { k: 'library_hours', label: 'Jam layanan (opsional)', type: 'textarea', rows: 2, placeholder: 'Senin–Jumat 07.00–15.00' },
    ]],
    ['Profil', [{ k: 'profile_video', label: 'Link video profil sekolah (YouTube)', type: 'url', help: 'Tampil di halaman Profil Sekolah.' }, { k: 'sejarah', label: 'Sejarah singkat', type: 'textarea', rows: 6 }, { k: 'visi', label: 'Visi', type: 'textarea', rows: 2 }, { k: 'misi', label: 'Misi (satu baris satu poin)', type: 'textarea', rows: 6 }]],
    ['Video & Instagram otomatis', [
      { k: 'show_youtube', label: 'Video YouTube di beranda & galeri', type: 'select', half: true, opts: () => [{ v: '1', l: 'Tampilkan' }, { v: '0', l: 'Sembunyikan' }] },
      { k: 'show_instagram', label: 'Feed Instagram di beranda', type: 'select', half: true, opts: () => [{ v: '1', l: 'Tampilkan' }, { v: '0', l: 'Sembunyikan' }] },
      { k: 'ig_feed_url', label: 'Cara mudah: URL feed Instagram (JSON) dari Behold.so', type: 'url', placeholder: 'https://feeds.behold.so/…', help: 'Daftar gratis di behold.so, hubungkan akun Instagram sekolah, buat feed bertipe JSON, lalu tempel URL-nya di sini.' },
      { k: 'ig_token', label: 'Atau: Instagram access token (dari Meta Developer)', help: 'Opsional. Cara mendapatkannya ada di README bagian "Feed Instagram otomatis". Token diperpanjang otomatis oleh sistem dan tidak pernah ditampilkan ke pengunjung.' },
      { k: 'ig_posts', label: 'Atau: link postingan Instagram pilihan (satu per baris, maks. 6)', type: 'textarea', rows: 4, help: 'Dipakai bila token belum diisi. Contoh: https://www.instagram.com/p/XXXXXXXX/' },
    ]],
    ['Profil Guru (keamanan)', [
      { k: 'guru_profiles', label: 'Halaman Profil Guru di website', type: 'select', half: true, opts: () => [{ v: '1', l: 'Tampilkan' }, { v: '0', l: 'Sembunyikan semua' }],
        help: 'Pilih "Sembunyikan semua" bila ada indikasi penipuan yang mencatut nama guru. Halaman /guru, semua profil, dan tautan khusus langsung tidak bisa dibuka. Guru tetap bisa mengisi profil & mengunduh CV PDF.' },
      { k: 'guru_share', label: 'Tautan khusus untuk profil privat', type: 'select', half: true, opts: () => [{ v: '1', l: 'Izinkan guru membagikan' }, { v: '0', l: 'Matikan' }],
        help: 'Guru dengan profil privat dapat membuat tautan rahasia berbatas waktu untuk orang tertentu. Bila dimatikan, semua tautan khusus berhenti berlaku.' },
    ]],
    ['Notifikasi email pesan masuk', [
      { k: 'notif_email', label: 'Kirim salinan setiap pesan masuk ke email', type: 'text', placeholder: 'email@smkn8-sby.sch.id', help: 'Boleh lebih dari satu, pisahkan dengan koma (maks. 5). Kosongkan untuk mematikan.' },
      { k: 'notif_from', label: 'Alamat pengirim', type: 'text', placeholder: 'noreply@smkn8-sby.sch.id', help: 'Harus memakai domain yang sudah diverifikasi di Resend (lihat README bagian "Notifikasi email").' },
    ]],
    ['Persetujuan tulisan guru', [
      { k: 'review_archive_days', label: 'Arsipkan otomatis tulisan yang dikembalikan & tidak direvisi setelah', type: 'select', half: true,
        opts: () => [{ v: '14', l: '14 hari' }, { v: '30', l: '30 hari' }, { v: '60', l: '60 hari' }, { v: '90', l: '90 hari' }, { v: '0', l: 'Jangan arsipkan otomatis' }],
        help: 'Tulisan pindah dari tab "Dikembalikan" ke "Arsip" (tidak dihapus). Guru diberi notifikasi dan tetap bisa merevisi lalu mengirim ulang.' },
    ]],
    ['Layanan Pengaduan (WhatsApp)', [
      { k: 'show_pengaduan', label: 'Tombol pengaduan di website', type: 'select', half: true, opts: () => [{ v: '1', l: 'Tampilkan' }, { v: '0', l: 'Sembunyikan' }], help: 'Ikon petugas melayang di pojok kanan bawah setiap halaman.' },
      { k: 'pengaduan_wa', label: 'Nomor WhatsApp penerima', half: true, placeholder: '628113410120', help: 'Format 62…, tanpa tanda + atau spasi.' },
      { k: 'pengaduan_nama', label: 'Nama petugas yang tampil', half: true, placeholder: 'Bu Ita (Humas)' },
    ]],
    ['Kontak & media sosial', [
      { k: 'address', label: 'Alamat' }, { k: 'maps_query', label: 'Kata kunci peta Google Maps', help: 'Nama/alamat sekolah persis seperti di Google Maps.' },
      { k: 'email', label: 'Email', type: 'email', half: true }, { k: 'phone', label: 'Telepon', half: true }, { k: 'whatsapp', label: 'WhatsApp', half: true },
      { k: 'instagram', label: 'Instagram (tanpa @)', half: true }, { k: 'facebook', label: 'Facebook (nama pengguna)', half: true }, { k: 'youtube_name', label: 'Nama kanal YouTube (yang tampil)', half: true }, { k: 'youtube', label: 'Link kanal YouTube', help: 'Isi link kanal (https://www.youtube.com/channel/UC… atau https://www.youtube.com/@namakanal) atau nama kanal tanpa @.' },
    ]],
  ];
  const all = groups.flatMap(([, f]) => f);
  view.innerHTML = `<form id="f">${groups.map(([t, fs]) => `<div class="box"><h3>${esc(t)}</h3><div class="fields">${fs.map((f) => fieldHtml(f, s[f.k])).join('')}</div></div>`).join('')}
    <div class="form-actions" style="position:sticky;bottom:0;background:var(--paper);padding:12px 0"><button class="btn btn-primary">Simpan pengaturan</button></div></form>`;
  bindForm(view, all);
  // Status & uji notifikasi email
  const nf = [...$$('.box', view)].find((b) => b.querySelector('h3')?.textContent.startsWith('Notifikasi email'));
  if (nf) {
    const [st, at, info] = String(notif?.last || '').split('|');
    const status = !notif?.ready ? '<span class="tag bad">Belum aktif</span> Kunci <b>RESEND_API_KEY</b> belum dipasang di Cloudflare Pages — pesan tetap tersimpan di panel, tetapi belum dikirim ke email.'
      : st === 'ok' ? `<span class="tag ok">Aktif</span> Terakhir terkirim ${fmtDate(at)} ke ${esc(info)}.`
      : st === 'gagal' ? `<span class="tag bad">Gagal</span> Percobaan terakhir ${fmtDate(at)}: ${esc(info)}`
      : '<span class="tag ok">Siap</span> Belum ada email terkirim. Klik "Kirim email uji coba" setelah menyimpan pengaturan.';
    nf.insertAdjacentHTML('beforeend', `<div class="notice info" style="margin-top:12px">${status}</div><button type="button" class="btn btn-line btn-sm" id="nTest">Kirim email uji coba</button>`);
    $('#nTest').onclick = async () => {
      const b = $('#nTest'); b.disabled = true;
      try { await api('admin/settings', { method: 'PUT', body: readForm(view, all) }); await api('admin/notif-test', { method: 'POST', body: {} }); toast('Email uji coba terkirim. Periksa kotak masuk (dan folder Spam).'); }
      catch (er) { toast(er.message, true); }
      b.disabled = false;
    };
  }
  $('#f').onsubmit = async (e) => { e.preventDefault(); try { await api('admin/settings', { method: 'PUT', body: readForm(view, all) }); toast('Pengaturan tersimpan'); } catch (er) { toast(er.message, true); } };
};

// Pengguna & hak akses
V.users = async (view) => {
  setHead('Pengguna & Akses', `<button class="btn btn-line" id="bulkU">${ic('users')}Tambah guru sekaligus</button><button class="btn btn-primary" id="addU">${ic('plus')}Tambah pengguna</button>`);
  const roleOpts = () => [{ v: 'unit', l: 'Pengelola Unit (Waka / Jurusan / Lembaga / TEFA)' }, { v: 'guru', l: 'Guru Penulis (opini, tips & tutorial, artikel)' }, { v: 'admin', l: 'Administrator (semua akses)' }];
  const form = (u = {}) => [
    { k: 'name', label: 'Nama lengkap & gelar', required: true, help: 'Untuk guru, nama ini tampil sebagai penulis di website.' },
    { k: 'title', label: 'Jabatan / mata pelajaran (opsional)', placeholder: 'mis. Guru Tata Boga', help: 'Tampil di bawah nama penulis.' },
    ...(u.id ? [] : [{ k: 'username', label: 'Username (untuk login)', required: true, help: 'Huruf kecil, angka, titik atau strip. Contoh: kuliner, mm.operator' }]),
    { k: 'role', label: 'Peran', type: 'select', opts: roleOpts, default: 'unit', half: true },
    { k: 'unit_slug', label: 'Unit yang dikelola', type: 'select', opts: () => UNITS.map((x) => ({ v: x.slug, l: `${x.name} (${TYPE_LABEL[x.type] || x.type})` })), half: true },
    { k: 'password', label: u.id ? 'Password baru (kosongkan bila tidak diganti)' : 'Password', type: 'password', required: !u.id, help: 'Minimal 8 karakter.' },
    ...(u.id ? [{ k: 'active', label: 'Akun aktif', type: 'check' }] : []),
  ];
  const open = (u = {}) => {
    const fs = form(u);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<form class="modal-card"><h2>${u.id ? 'Ubah pengguna' : 'Pengguna baru'}</h2><div class="fields">${fs.map((f) => fieldHtml(f, u[f.k])).join('')}</div>
      <div class="form-actions"><button type="button" class="btn btn-line" data-x>Batal</button><button class="btn btn-primary">Simpan</button></div></form>`;
    document.body.appendChild(m);
    const sync = () => { $('[data-k="unit_slug"]', m).style.display = $('[name=role]', m).value === 'unit' ? '' : 'none'; };
    $('[name=role]', m).onchange = sync; sync();
    m.onclick = (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); };
    $('form', m).onsubmit = async (e) => {
      e.preventDefault(); const d = readForm(m, fs);
      try { await api('admin/users' + (u.id ? '/' + u.id : ''), { method: u.id ? 'PUT' : 'POST', body: d }); m.remove(); toast('Pengguna tersimpan'); load(); } catch (er) { toast(er.message, true); }
    };
  };
  view.innerHTML = `<div class="toolbar"><label class="search">${ic('search')}<input type="search" id="uq" placeholder="Cari nama atau username…"></label>
    <select id="ur"><option value="">Semua peran</option><option value="admin">Administrator</option><option value="unit">Pengelola unit</option><option value="guru">Guru penulis</option></select></div>
    <div class="notice info"><b>Guru penulis</b> hanya dapat menulis Opini, Tips & Tutorial, dan Artikel Praktis; tulisannya tayang setelah disetujui <b>Waka Manajemen Mutu (WMM)</b>. <b>Administrator</b> dapat mengelola semua isi website. <b>Pengelola unit</b> hanya dapat mengelola berita, agenda, galeri, prestasi, dan profil unitnya sendiri. <b>Waka</b> (WMM, Kurikulum, Kesiswaan, Sarpras, Humas) juga mengelola <b>Program Sekolah</b>; pengelola BKK dan <b>Waka Humas</b> juga lowongan kerja & DUDI semua jurusan, pengelola LSP juga skema.</div><div class="table-wrap" id="tbl"></div>`;
  let rows = [];
  const load = async () => {
    rows = (await api('admin/users')).items;
    draw();
  };
  const draw = () => {
    const q = ($('#uq').value || '').toLowerCase(), r = $('#ur').value;
    const list = rows.filter((u) => (!r || u.role === r) && (!q || `${u.name} ${u.username}`.toLowerCase().includes(q)));
    $('#tbl').innerHTML = `<table><thead><tr><th>Nama</th><th>Username</th><th>Akses</th><th>Login terakhir</th><th>Status</th><th></th></tr></thead><tbody>${list.map((u) => `<tr>
      <td><b>${esc(u.name || '-')}</b>${u.title ? `<span class="t-sub">${esc(u.title)}</span>` : ''}</td><td><code>${esc(u.username)}</code></td>
      <td>${u.role === 'admin' ? '<span class="tag" style="--c:#f26836">Administrator</span>' : u.role === 'guru' ? '<span class="tag" style="--c:#0f766e">Guru penulis</span>' : unitTag(u.unit_slug) + ` <span class="t-sub">${esc(unitName(u.unit_slug))}</span>`}</td>
      <td>${u.last_login ? fmtDate(u.last_login) : '<span class="t-sub">Belum pernah</span>'}</td>
      <td><span class="tag ${u.active ? 'ok' : 'bad'}">${u.active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td class="act"><button class="btn btn-line btn-sm" data-ed="${u.id}">Ubah</button>${u.id !== ME.id ? `<button class="btn btn-danger btn-sm" data-del="${u.id}">Hapus</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
  };
  $('#uq').oninput = draw; $('#ur').onchange = draw;
  $('#addU').onclick = () => open();
  $('#bulkU').onclick = () => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="modal-card" style="max-width:720px"><h2>Tambah akun guru sekaligus</h2>
      <p class="t-sub" style="white-space:normal;margin:0 0 12px">Tempel daftar guru, <b>satu guru per baris</b>. Format: <code>Nama lengkap & gelar</code> atau <code>Nama ; Jabatan/Mapel</code> atau <code>Nama ; Jabatan ; username ; password</code>. Bisa disalin langsung dari kolom Excel. Username & password dibuat otomatis bila dikosongkan.</p>
      <label class="field"><textarea id="bl" rows="10" placeholder="Dra. Siti Aminah, M.Pd. ; Guru Tata Boga&#10;Bambang Sutejo, S.Pd. ; Guru DKV&#10;Rina Wulandari, S.Tr.Par."></textarea></label>
      <div id="bres" style="margin-top:12px"></div>
      <div class="form-actions"><button type="button" class="btn btn-line" data-x>Tutup</button><button class="btn btn-primary" id="bgo">Buat akun</button></div></div>`;
    document.body.appendChild(m);
    m.onclick = (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); };
    $('#bgo', m).onclick = async () => {
      const lines = $('#bl', m).value.split(/\r?\n/).map((l) => l.split(/\s*[;\t]\s*/).map((x) => x.trim())).filter((x) => x[0]);
      if (!lines.length) return toast('Daftar guru masih kosong.', true);
      $('#bgo', m).disabled = true;
      try {
        const r = await api('admin/users/bulk', { method: 'POST', body: { rows: lines.map(([name, title, username, password]) => ({ name, title, username, password })) } });
        const csv = 'Nama,Jabatan,Username,Password\n' + r.created.map((c) => [c.name, c.title, c.username, c.password].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        $('#bres', m).innerHTML = `<div class="notice ok"><b>${r.created.length} akun guru dibuat.</b>${r.skipped.length ? ` ${r.skipped.length} baris dilewati.` : ''} Simpan daftar password ini sekarang — password tidak dapat dilihat lagi setelah jendela ditutup.</div>
          <div class="table-wrap" style="max-height:260px;overflow:auto"><table><thead><tr><th>Nama</th><th>Username</th><th>Password</th></tr></thead><tbody>${r.created.map((c) => `<tr><td>${esc(c.name)}</td><td><code>${esc(c.username)}</code></td><td><code>${esc(c.password)}</code></td></tr>`).join('')}</tbody></table></div>
          <div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-line btn-sm" id="bcsv">${ic('dl')}Unduh daftar (CSV/Excel)</button><button class="btn btn-line btn-sm" id="bprint">Cetak kartu login</button></div>`;
        $('#bcsv', m).onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'akun-guru-smkn8.csv'; a.click(); };
        $('#bprint', m).onclick = () => {
          const w = window.open('', '_blank'); if (!w) return toast('Izinkan pop-up untuk mencetak.', true);
          w.document.write(`<!doctype html><title>Akun Guru</title><style>body{font-family:Arial,sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px}.c{border:1px dashed #555;padding:12px;border-radius:8px;font-size:13px;page-break-inside:avoid}b{font-size:14px}code{font-size:14px}</style>
            ${r.created.map((c) => `<div class="c"><div style="color:#235ba4;font-weight:bold">Akun Penulis Website SMKN 8 Surabaya</div><b>${esc(c.name)}</b><br>Alamat: smkn8-sby.sch.id/admin<br>Username: <code>${esc(c.username)}</code><br>Password: <code>${esc(c.password)}</code><br><small>Segera ganti password setelah login pertama (menu Ganti password).</small></div>`).join('')}
            <script>onload=()=>print()<\/script>`);
          w.document.close();
        };
        load();
      } catch (er) { toast(er.message, true); }
      $('#bgo', m).disabled = false;
    };
  };
  $('#tbl').onclick = async (e) => {
    const ed = e.target.closest('[data-ed]'), del = e.target.closest('[data-del]');
    if (ed) open(rows.find((r) => r.id === +ed.dataset.ed));
    if (del && confirm('Hapus pengguna ini?')) { try { await api('admin/users/' + del.dataset.del, { method: 'DELETE' }); toast('Pengguna dihapus'); load(); } catch (er) { toast(er.message, true); } }
  };
  await load();
};

// ---------- Tulisan guru ----------
function profileCard(p) {
  const c = p?.completeness || 0, pub = p?.visibility === 'public' && !p?.hidden;
  return `<div class="box prof-card"><div class="pc-l"><span class="pc-ic">${ic('idcard')}</span><div><b>Profil / CV Saya</b>
    <span>${p && p.enabled === false ? 'Halaman Profil Guru sedang <b>disembunyikan admin</b>. Anda tetap bisa mengisi profil & mengunduh CV.' : !p ? 'Belum diisi. Lengkapi profil Anda: foto, pendidikan, keahlian & sertifikat kompetensi, prestasi.' : p.hidden ? 'Profil sedang disembunyikan oleh admin.' : pub ? 'Profil Anda <b>tampil di website</b>.' : 'Profil Anda masih <b>privat</b> (hanya Anda & admin yang bisa melihat).'}</span>
    <div class="meter"><i style="width:${c}%"></i></div><small>Kelengkapan ${c}%</small></div></div>
    <div class="pc-r"><a class="btn btn-primary btn-sm" href="#/profil">${ic('pen')}${p ? 'Perbarui profil' : 'Isi profil'}</a>${p ? `<a class="btn btn-line btn-sm" href="/guru/${encodeURIComponent(p.slug)}" target="_blank">${ic('eye')}Lihat</a><a class="btn btn-line btn-sm" href="#/cv">${ic('dl')}Download CV</a>` : ''}</div></div>`;
}
const NOTIF_KIND = { publish: ['ok', 'check'], ditolak: ['bad', 'pen'], arsip: ['draft', 'archive'], pengingat: ['wait', 'bell'], hapus: ['bad', 'trash'] };
const timeAgo = (iso) => { const m = Math.round((Date.now() - Date.parse(iso)) / 6e4); return m < 1 ? 'baru saja' : m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : m < 43200 ? `${Math.round(m / 1440)} hari lalu` : fmtDate(iso); };
const notifItem = (n) => { const [c, i] = NOTIF_KIND[n.kind] || ['draft', 'bell'];
  return `<a class="notif-item ${n.read_at ? '' : 'unread'} k-${c}" href="${esc(n.link || '#/posts')}" data-nid="${n.id}"${/^\//.test(n.link || '') ? ' target="_blank"' : ''}><span class="ni-ic">${ic(i)}</span><span class="ni-tx"><b>${esc(n.title)}</b>${n.body ? `<span>${esc(n.body)}</span>` : ''}<small>${timeAgo(n.created_at)}</small></span></a>`; };
V.notif = async (view) => {
  setHead('Notifikasi', '<button class="btn btn-line" id="nAll">Tandai semua dibaca</button>');
  const load = async () => {
    const d = await api('admin/notif');
    view.innerHTML = `<div class="box notif-box">${d.items.length ? d.items.map(notifItem).join('') : '<div class="empty">Belum ada notifikasi. Keputusan WMM atas tulisan Anda akan muncul di sini.</div>'}</div>`;
    $$('[data-nid]', view).forEach((a) => a.addEventListener('click', () => api('admin/notif', { method: 'POST', body: { id: +a.dataset.nid } }).then(refreshUnread).catch(() => {})));
  };
  $('#nAll').onclick = async () => { await api('admin/notif', { method: 'POST', body: { all: 1 } }); await load(); refreshUnread(); toast('Semua notifikasi ditandai dibaca'); };
  await load();
};
function guruDashboard(view, d) {
  const stats = [[d.publish, 'Tulisan tayang', '#16966a'], [d.review, 'Menunggu persetujuan', '#d98a06'], [d.ditolak, 'Perlu revisi', '#d4364b'], [d.draft, 'Draf', '#5a6474'], ...(d.arsip ? [[d.arsip, 'Diarsipkan', '#8792a2']] : []), [d.views, 'Total dibaca', '#235ba4']];
  view.innerHTML = `
    <div class="welcome"><div><span class="mono" style="color:var(--sky)">Guru penulis</span>
      <h2>Halo, ${esc(ME.name || ME.username)}</h2><p>Bagikan opini, tips & tutorial, atau artikel praktis Anda untuk website SMKN 8 Surabaya. Setiap tulisan diperiksa Waka Manajemen Mutu (WMM) sebelum tayang.</p></div>
      <div><a class="btn btn-primary" href="#/posts/new">${ic('pen')}Tulis artikel baru</a></div></div>
    ${d.notifs?.length ? `<div class="box notif-box"><div class="nb-head"><h3>${ic('bell')}Notifikasi baru <span class="count">${d.notif}</span></h3><a class="btn btn-line btn-sm" href="#/notif">Lihat semua</a></div>${d.notifs.map(notifItem).join('')}</div>` : ''}
    ${profileCard(d.profile)}
    ${d.ditolak ? `<div class="notice bad">${ic('pen')} Ada <b>${d.ditolak} tulisan</b> yang dikembalikan WMM untuk direvisi. Buka <a href="#/posts" style="font-weight:700">Tulisan Saya</a> untuk melihat catatannya.</div>` : ''}
    <div class="grid-stats">${stats.map(([v, l, c]) => `<div class="stat" style="--c:${c}"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="form-grid">
      <div class="box"><h3>Tulisan terakhir</h3>${d.recent.length ? `<table><tbody>${d.recent.map((r) => `<tr><td><a href="#/posts/${r.id}"><span class="t-title">${esc(r.title)}</span><span class="t-sub">${esc(CAT_LABEL[r.category] || '')}${r.status === 'publish' ? ` · ${r.views}× dibaca` : ''}</span></a>${r.status === 'ditolak' && r.review_note ? `<span class="t-sub" style="white-space:normal">Catatan WMM: ${esc(r.review_note)}</span>` : ''}</td><td>${statusTag(r.status)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Belum ada tulisan. Ayo mulai menulis!</div>'}</div>
      <div class="box"><h3>Alur tulisan</h3><ol style="margin:0;padding-left:18px;line-height:1.8;font-size:.9rem">
        <li>Klik <b>Tulis artikel baru</b>, pilih jenis: <b>Opini</b>, <b>Tips & Tutorial</b>, atau <b>Artikel Praktis</b>.</li>
        <li>Tulis isi, tambahkan gambar bila perlu, lalu <b>Simpan draf</b> atau langsung <b>Kirim ke WMM</b>.</li>
        <li>WMM memeriksa: <b>disetujui</b> → tayang di website dengan nama Anda sebagai penulis; atau <b>dikembalikan</b> dengan catatan revisi.</li>
        <li>Tulisan yang dikembalikan bisa diperbaiki lalu dikirim lagi. Bila tidak diperbaiki dalam batas waktu, tulisan otomatis masuk <b>Arsip</b> (tidak dihapus).</li></ol></div>
    </div>`;
  $$('[data-nid]', view).forEach((a) => a.addEventListener('click', () => api('admin/notif', { method: 'POST', body: { id: +a.dataset.nid } }).then(refreshUnread).catch(() => {})));
}

// ---------- Profil / CV guru ----------
const JENJANG = ['S3', 'S2', 'S1', 'D4', 'D3', 'D2', 'D1', 'Profesi (PPG)', 'SMA/SMK', 'Lainnya'];
const TINGKAT = ['Sekolah', 'Kota/Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];
const JENIS_KARYA = ['Buku', 'Artikel / Jurnal', 'Modul / Bahan Ajar', 'Produk / Karya Desain', 'Video Pembelajaran', 'Lainnya'];
const opt = (arr) => () => [{ v: '', l: '— pilih —' }, ...arr.map((x) => ({ v: x, l: x }))];
const CV = [
  ['pendidikan', 'Riwayat Pendidikan', 'Urutkan dari jenjang tertinggi.', 'Tambah pendidikan', [
    { k: 'jenjang', label: 'Jenjang', type: 'select', opts: opt(JENJANG), half: true }, { k: 'tahun', label: 'Tahun lulus', half: true, placeholder: 'mis. 2012' },
    { k: 'institusi', label: 'Nama kampus / sekolah', half: true, placeholder: 'mis. Universitas Negeri Surabaya' }, { k: 'prodi', label: 'Program studi / jurusan', half: true, placeholder: 'mis. Pendidikan Tata Boga' }]],
  ['kompetensi', 'Keahlian & Sertifikat Kompetensi', 'Bukti keahlian Anda: sertifikat BNSP/LSP, sertifikat industri, asesor, dsb. Bukti bisa berupa tautan (gratis kuota) atau foto sertifikat.', 'Tambah sertifikat / kompetensi', [
    { k: 'nama', label: 'Nama kompetensi / skema sertifikasi', placeholder: 'mis. Barista Level 2, Asesor Kompetensi, Adobe Certified Professional' },
    { k: 'bidang', label: 'Bidang keahlian', half: true, placeholder: 'mis. Tata Boga' }, { k: 'penerbit', label: 'Lembaga penerbit', half: true, placeholder: 'mis. BNSP / LSP P1 / industri' },
    { k: 'tahun', label: 'Tahun', half: true }, { k: 'berlaku', label: 'Berlaku sampai (opsional)', half: true, placeholder: 'mis. 2028 / seumur hidup' },
    { k: 'link', label: 'Tautan bukti (opsional)', type: 'url', placeholder: 'https://drive.google.com/…' }, { k: 'gambar', label: 'Foto sertifikat (opsional)', type: 'img' }]],
  ['pengalaman', 'Pengalaman Kerja & Industri', 'Termasuk pengalaman mengajar, kerja di industri, magang/praktik industri guru.', 'Tambah pengalaman', [
    { k: 'posisi', label: 'Posisi / jabatan', half: true, placeholder: 'mis. Guru Produktif Kuliner' }, { k: 'tempat', label: 'Tempat / perusahaan', half: true, placeholder: 'mis. SMKN 8 Surabaya' },
    { k: 'mulai', label: 'Tahun mulai', half: true }, { k: 'selesai', label: 'Tahun selesai', half: true, placeholder: 'kosongkan bila masih' },
    { k: 'ket', label: 'Keterangan singkat (opsional)', type: 'textarea' }]],
  ['prestasi', 'Prestasi & Penghargaan', 'Prestasi pribadi maupun sebagai pembimbing.', 'Tambah prestasi', [
    { k: 'judul', label: 'Nama prestasi / penghargaan', placeholder: 'mis. Juara 1 Lomba Inovasi Pembelajaran' },
    { k: 'tingkat', label: 'Tingkat', type: 'select', opts: opt(TINGKAT), half: true }, { k: 'tahun', label: 'Tahun', half: true },
    { k: 'penyelenggara', label: 'Penyelenggara', placeholder: 'mis. Dinas Pendidikan Provinsi Jawa Timur' },
    { k: 'link', label: 'Tautan bukti (opsional)', type: 'url' }, { k: 'gambar', label: 'Foto piagam / bukti (opsional)', type: 'img' }]],
  ['pelatihan', 'Pelatihan, Diklat & Workshop', '', 'Tambah pelatihan', [
    { k: 'nama', label: 'Nama pelatihan', placeholder: 'mis. Diklat Kurikulum Merdeka' },
    { k: 'penyelenggara', label: 'Penyelenggara', half: true }, { k: 'tahun', label: 'Tahun', half: true }, { k: 'jp', label: 'Jumlah jam (JP, opsional)', half: true }]],
  ['karya', 'Karya, Publikasi & Produk', 'Buku, artikel jurnal, modul ajar, karya desain, video pembelajaran, dll.', 'Tambah karya', [
    { k: 'judul', label: 'Judul karya' }, { k: 'jenis', label: 'Jenis', type: 'select', opts: opt(JENIS_KARYA), half: true }, { k: 'tahun', label: 'Tahun', half: true },
    { k: 'link', label: 'Tautan (opsional)', type: 'url' }]],
  ['organisasi', 'Organisasi & Kepanitiaan', '', 'Tambah organisasi', [
    { k: 'nama', label: 'Nama organisasi', half: true, placeholder: 'mis. MGMP Tata Boga Kota Surabaya' }, { k: 'peran', label: 'Peran', half: true, placeholder: 'mis. Ketua' }, { k: 'tahun', label: 'Tahun / periode', half: true }]],
];
const PROFILE_FIELDS = [
  { k: 'full_name', label: 'Nama lengkap & gelar', required: true, max: 120 },
  { k: 'position', label: 'Jabatan / peran', half: true, placeholder: 'mis. Guru Produktif Kuliner, Kaprog DKV' },
  { k: 'unit_slug', label: 'Bidang / program keahlian', type: 'select', half: true, opts: () => [{ v: '', l: '— pilih —' }, ...jurOptions(), { v: 'umum', l: 'Mata pelajaran umum / adaptif' }] },
  { k: 'subjects', label: 'Mata pelajaran yang diampu', placeholder: 'mis. Pengolahan Makanan Kontinental, Pastry' },
  { k: 'bio', label: 'Tentang saya (ringkasan profil)', type: 'textarea', rows: 4, help: 'Ceritakan singkat latar belakang, minat, dan fokus mengajar Anda (maks. 1.500 karakter).' },
  { k: 'skills', label: 'Keahlian utama (pisahkan dengan koma)', placeholder: 'mis. Pastry, Food Styling, Barista, Manajemen Dapur', help: 'Tampil sebagai label keahlian. Maksimal 20.' },
  { k: 'email', label: 'Email untuk dihubungi (opsional)', type: 'email', half: true, help: 'Kosongkan bila tidak ingin ditampilkan.' },
  { k: 'l_website', label: 'Website / portofolio', type: 'url', half: true, placeholder: 'https://' },
  { k: 'l_linkedin', label: 'LinkedIn', type: 'url', half: true, placeholder: 'https://linkedin.com/in/…' },
  { k: 'l_instagram', label: 'Instagram', type: 'url', half: true, placeholder: 'https://instagram.com/…' },
  { k: 'l_youtube', label: 'YouTube', type: 'url', half: true, placeholder: 'https://youtube.com/@…' },
];
function cvItemField(f, v) {
  v = v ?? '';
  const lab = `<span>${esc(f.label)}</span>`;
  if (f.type === 'img') return `<div class="field"><span>${esc(f.label)}</span><div class="img-field cv-img" data-cvimg>
      <div class="preview" style="${v ? `background-image:url('${esc(v)}')` : ''}">${v ? '' : 'Belum ada gambar'}</div>
      <input type="hidden" data-f="${f.k}" value="${esc(v)}"><input type="file" accept="image/*">
      <div class="row"><button type="button" class="btn btn-line btn-sm" data-pick>${ic('upload')}Pilih gambar</button><button type="button" class="btn btn-danger btn-sm" data-clear${v ? '' : ' hidden'}>Hapus</button></div></div></div>`;
  if (f.type === 'select') return `<label class="field${f.half ? ' half' : ''}">${lab}<select data-f="${f.k}">${f.opts().map((o) => `<option value="${esc(o.v)}"${o.v === v ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}${v && !f.opts().some((o) => o.v === v) ? `<option selected>${esc(v)}</option>` : ''}</select></label>`;
  if (f.type === 'textarea') return `<label class="field">${lab}<textarea data-f="${f.k}" rows="2">${esc(v)}</textarea></label>`;
  return `<label class="field${f.half ? ' half' : ''}">${lab}<input type="${f.type === 'url' ? 'url' : 'text'}" data-f="${f.k}" value="${esc(v)}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}></label>`;
}
const cvItemHtml = (fields, it = {}) => `<div class="cv-item"><div class="cv-tools"><button type="button" class="icon-btn" data-up title="Naikkan">${ic('up')}</button><button type="button" class="icon-btn bad" data-del title="Hapus">${ic('trash')}</button></div><div class="fields">${fields.map((f) => cvItemField(f, it[f.k])).join('')}</div></div>`;

V.profil = async (view) => {
  const d = await api('admin/profil');
  let p = d.profile, dirty = false;
  const url = () => `/guru/${encodeURIComponent(p.slug)}`;
  setHead('Profil / CV Saya', `<a class="btn btn-line" id="pvBtn" href="${url()}" target="_blank">${ic('eye')}Lihat profil</a><button class="btn btn-line" id="pdfBtn" type="button">${ic('dl')}PDF</button><button class="btn btn-primary" id="saveTop">${ic('check')}Simpan</button>`);
  const vals = { ...p, ...Object.fromEntries(Object.entries(p.links || {}).map(([k, v]) => [`l_${k}`, v])) };
  view.innerHTML = `<form id="pf" class="prof-form" novalidate>
    <div class="box vis-box">
      <div class="vis-opts">
        <label class="vis-opt"><input type="radio" name="visibility" value="private"${p.visibility !== 'public' ? ' checked' : ''}><span>${ic('lock')}<b>Privat</b><small>Tidak tampil di website. Hanya Anda, admin, dan orang yang Anda beri <b>tautan khusus</b> yang dapat melihat.</small></span></label>
        <label class="vis-opt"><input type="radio" name="visibility" value="public"${p.visibility === 'public' ? ' checked' : ''}><span>${ic('globe')}<b>Publik</b><small>Tampil di halaman <b>Profil Guru</b> website sekolah dan dapat dilihat siapa saja.</small></span></label>
      </div>
      <div class="vis-info"><div><span class="mono">Kelengkapan</span><div class="meter"><i id="cmp" style="width:${p.completeness}%"></i></div><small id="cmpT">${p.completeness}% lengkap</small></div>
        <div><span class="mono">Alamat profil</span><a href="${url()}" target="_blank" class="purl">smkn8-sby.sch.id${url()}</a></div>
        <div><span class="mono">Gambar bukti</span><small id="imgQ">${d.mediaCount ? Math.max(0, d.mediaCount - (p.photo ? 1 : 0)) : 0} dari ${d.maxImages} terpakai</small></div></div>
      ${!d.flags.enabled ? `<div class="notice bad" style="margin:14px 0 0">Admin sekolah sedang <b>menyembunyikan halaman Profil Guru</b> demi keamanan. Profil Anda (termasuk tautan khusus) tidak dapat dibuka orang lain untuk sementara. Anda tetap bisa mengisi profil dan mengunduh CV PDF.</div>` : ''}
      <div id="shareBox"></div>
      ${p.hidden ? `<div class="notice bad" style="margin:14px 0 0">Profil Anda sedang disembunyikan oleh admin, sehingga tidak tampil di website walaupun diatur Publik. Hubungi admin sekolah.</div>` : ''}
    </div>
    <div class="box"><h3>Data diri</h3><div class="prof-top">
      <div class="field"><span>Foto profil</span><div class="img-field logo photo" data-img="photo"><div class="preview" style="${p.photo ? `background-image:url('${esc(p.photo)}')` : ''}">${p.photo ? '' : 'Belum ada foto'}</div>
        <input type="hidden" name="photo" value="${esc(p.photo || '')}"><input type="file" accept="image/*">
        <div class="row"><button type="button" class="btn btn-line btn-sm" data-pick>${ic('upload')}Pilih foto</button><button type="button" class="btn btn-danger btn-sm" data-clear${p.photo ? '' : ' hidden'}>Hapus</button></div></div><small>Foto formal, wajah terlihat jelas. Otomatis diperkecil.</small></div>
      <div class="fields">${PROFILE_FIELDS.map((f) => fieldHtml(f, vals[f.k])).join('')}</div></div></div>
    ${CV.map(([k, title, help, add, fields]) => `<div class="box cv-sec" data-sec="${k}"><h3>${esc(title)}</h3>${help ? `<p class="t-sub" style="margin:-6px 0 14px;white-space:normal">${esc(help)}</p>` : ''}
      <div class="cv-list">${(p.data?.[k] || []).map((it) => cvItemHtml(fields, it)).join('')}</div>
      <button type="button" class="btn btn-line btn-sm" data-add>${ic('plus')}${esc(add)}</button></div>`).join('')}
    <div class="save-bar"><span id="dirtyT">Semua perubahan tersimpan.</span><button class="btn btn-primary">${ic('check')}Simpan profil</button></div>
  </form>`;
  const form = $('#pf');
  bindForm(form, [{ k: 'photo', type: 'logo', maxW: 500, tag: 'profil' }]);
  // ----- bagikan tautan khusus (profil privat) -----
  let share = d.share;
  const shareUrl = () => `${location.origin}/guru/${encodeURIComponent(p.slug)}?k=${share.token}`;
  const fmtExp = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  const drawShare = () => {
    const box = $('#shareBox'), isPub = $('[name=visibility]:checked', form)?.value === 'public';
    if (!d.flags.enabled) { box.innerHTML = ''; return; }
    if (isPub) { box.innerHTML = `<div class="share-box muted">${ic('globe')}<span>Profil Anda <b>publik</b>. Untuk membagikan, cukup kirim alamat profil di atas.${share ? ' Tautan khusus lama tidak diperlukan lagi.' : ''}</span></div>`; return; }
    if (!d.flags.share) { box.innerHTML = `<div class="share-box muted">${ic('lock')}<span>Fitur <b>bagikan tautan khusus</b> sedang dinonaktifkan admin sekolah.</span></div>`; return; }
    box.innerHTML = `<div class="share-box"><div class="sb-head">${ic('ext')}<div><b>Bagikan profil privat ke orang tertentu</b><span>Buat tautan rahasia berbatas waktu, misalnya untuk panitia lomba, asesor, atau mitra industri. Orang lain yang tidak memegang tautan tetap tidak bisa membuka profil Anda.</span></div></div>
      ${share ? `<div class="sb-link"><input readonly value="${esc(shareUrl())}" id="shareUrl" aria-label="Tautan khusus"><button type="button" class="btn btn-primary btn-sm" id="shCopy">Salin</button><a class="btn btn-line btn-sm" id="shWa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Profil/CV saya — ' + p.full_name + ': ' + shareUrl())}">WhatsApp</a></div>
        <div class="sb-meta"><span>Berlaku sampai <b>${fmtExp(share.expires)}</b> WIB</span><button type="button" class="link-btn" id="shRenew">Buat tautan baru</button><button type="button" class="link-btn bad" id="shRevoke">Cabut tautan</button></div>`
      : `<div class="sb-link"><select id="shDays" aria-label="Masa berlaku"><option value="1">Berlaku 1 hari</option><option value="7" selected>Berlaku 7 hari</option><option value="30">Berlaku 30 hari</option><option value="90">Berlaku 90 hari</option></select><button type="button" class="btn btn-primary btn-sm" id="shMake">${ic('plus')}Buat tautan khusus</button></div>`}
      <small class="sb-note">Siapa pun yang memegang tautan dapat melihat profil Anda sampai masa berlaku habis. Bagikan hanya ke orang yang Anda percaya, dan cabut bila sudah tidak diperlukan. Membuat tautan baru otomatis membatalkan tautan lama.</small></div>`;
    const make = async (days) => {
      if (dirty || p.visibility !== 'private') { if (!confirm('Simpan profil sebagai Privat terlebih dahulu?')) return; await save(); if (dirty) return; }
      try { share = (await api('admin/profil/share', { method: 'POST', body: { days } })).share; drawShare(); toast('Tautan khusus dibuat. Salin lalu kirim ke orang yang dituju.'); } catch (e) { toast(e.message, true); }
    };
    $('#shMake') && ($('#shMake').onclick = () => make(+$('#shDays').value));
    $('#shRenew') && ($('#shRenew').onclick = () => { if (confirm('Buat tautan baru? Tautan lama langsung tidak berlaku.')) make(7); });
    $('#shRevoke') && ($('#shRevoke').onclick = async () => {
      if (!confirm('Cabut tautan khusus? Orang yang sudah menerima tautan tidak bisa membukanya lagi.')) return;
      try { await api('admin/profil/share', { method: 'POST', body: { action: 'revoke' } }); share = null; drawShare(); toast('Tautan khusus dicabut'); } catch (e) { toast(e.message, true); }
    });
    $('#shCopy') && ($('#shCopy').onclick = async () => { const i = $('#shareUrl'); i.select(); try { await navigator.clipboard.writeText(i.value); } catch { document.execCommand('copy'); } toast('Tautan disalin'); });
  };
  $$('[name=visibility]', form).forEach((r) => r.addEventListener('change', drawShare));
  drawShare();
  const markDirty = () => { dirty = true; $('#dirtyT').textContent = 'Ada perubahan yang belum disimpan.'; $('#dirtyT').classList.add('warn'); };
  form.addEventListener('input', markDirty); form.addEventListener('change', markDirty);
  window.onbeforeunload = (e) => { if (dirty && location.hash.startsWith('#/profil')) { e.preventDefault(); e.returnValue = ''; } };
  const bindItem = (el) => {
    $('[data-del]', el).onclick = () => { if (confirm('Hapus baris ini?')) { el.remove(); markDirty(); } };
    $('[data-up]', el).onclick = () => { const prev = el.previousElementSibling; if (prev) { el.parentNode.insertBefore(el, prev); markDirty(); } };
    $$('[data-cvimg]', el).forEach((box) => {
      const file = $('input[type=file]', box), hid = $('input[type=hidden]', box), pv = $('.preview', box), clr = $('[data-clear]', box);
      $('[data-pick]', box).onclick = () => file.click();
      clr.onclick = () => { hid.value = ''; pv.style.backgroundImage = ''; pv.textContent = 'Belum ada gambar'; clr.hidden = true; markDirty(); };
      file.onchange = async () => {
        if (!file.files[0]) return;
        pv.textContent = 'Mengunggah…';
        try { const u = await uploadImage(file.files[0], 1100, 'profil'); hid.value = u; pv.style.backgroundImage = `url('${u}')`; pv.textContent = ''; clr.hidden = false; markDirty(); }
        catch (e) { pv.textContent = hid.value ? '' : 'Belum ada gambar'; toast(e.message, true); }
        file.value = '';
      };
    });
  };
  $$('.cv-item', form).forEach(bindItem);
  $$('.cv-sec', form).forEach((sec) => {
    const fields = CV.find((c) => c[0] === sec.dataset.sec)[4];
    $('[data-add]', sec).onclick = () => {
      const list = $('.cv-list', sec); list.insertAdjacentHTML('beforeend', cvItemHtml(fields));
      const el = list.lastElementChild; bindItem(el); $('input,select', el)?.focus(); markDirty();
    };
  });
  const collect = () => {
    const f = readForm(form, PROFILE_FIELDS);
    const out = { full_name: f.full_name, position: f.position, unit_slug: f.unit_slug, subjects: f.subjects, bio: f.bio, skills: f.skills, email: f.email,
      photo: $('[name=photo]', form).value, visibility: $('[name=visibility]:checked', form)?.value || 'private',
      links: { website: f.l_website, linkedin: f.l_linkedin, instagram: f.l_instagram, youtube: f.l_youtube }, data: {} };
    for (const [k] of CV) out.data[k] = $$(`[data-sec="${k}"] .cv-item`, form).map((it) => Object.fromEntries($$('[data-f]', it).map((x) => [x.dataset.f, x.value.trim()])));
    return out;
  };
  const save = async (e) => {
    e?.preventDefault();
    const b = collect();
    if (!b.full_name) { toast('Nama lengkap wajib diisi.', true); $('[name=full_name]', form).focus(); return; }
    const btns = $$('.save-bar .btn, #saveTop'); btns.forEach((x) => (x.disabled = true));
    try {
      const r = await api('admin/profil', { method: 'PUT', body: b });
      p = r.profile; dirty = false;
      $('#dirtyT').textContent = 'Semua perubahan tersimpan.'; $('#dirtyT').classList.remove('warn');
      $('#cmp').style.width = p.completeness + '%'; $('#cmpT').textContent = p.completeness + '% lengkap';
      toast(b.visibility === 'public' ? 'Profil tersimpan dan tampil di website.' : 'Profil tersimpan (privat).');
    } catch (er) { toast(er.message, true); }
    btns.forEach((x) => (x.disabled = false));
  };
  form.onsubmit = save; $('#saveTop').onclick = save;
  $('#pdfBtn').onclick = async (e) => {
    const btn = e.currentTarget;
    if (dirty) { if (!confirm('Ada perubahan yang belum disimpan. Simpan dulu lalu unduh PDF?')) return; await save(); if (dirty) return; }
    downloadCv(p, {}, btn);
  };
};

// ---------- Unduh CV (PDF) — dibuat di browser, tidak membebani server ----------
let jsPdfP = null;
const loadJsPdf = () => (jsPdfP ||= new Promise((ok, no) => {
  if (window.jspdf) return ok(window.jspdf.jsPDF);
  const sc = document.createElement('script'); sc.src = '/assets/js/vendor/jspdf-2.5.1.min.js';
  sc.onload = () => ok(window.jspdf.jsPDF); sc.onerror = () => { jsPdfP = null; no(new Error('Gagal memuat pembuat PDF. Periksa koneksi internet lalu coba lagi.')); };
  document.head.appendChild(sc);
}));
async function imgData(url, max) {
  try {
    const r = await fetch(url); if (!r.ok) return null;
    const bmp = await createImageBitmap(await r.blob());
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
    return { data: c.toDataURL('image/jpeg', 0.82), w: c.width, h: c.height };
  } catch { return null; }
}
const hexRgb = (h) => { const m = String(h || '').match(/^#?([0-9a-f]{6})$/i); const n = parseInt(m ? m[1] : '0f766e', 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
// teks aman untuk font standar PDF (Latin)
const pdfTxt = (t) => String(t ?? '').normalize('NFC').replace(/[•●]/g, '·').replace(/[^\x20-\x7E\xA0-\xFF–—‘’“”…\n]/g, '').trim();
async function cvPdf(p, { photo = true, attach = true } = {}) {
  const JsPDF = await loadJsPdf();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18, CW = W - 2 * M;
  const bid = p.unit_slug === 'umum' ? { name: 'Mata Pelajaran Umum / Adaptif', color: '#475569' } : UNIT[p.unit_slug] && UNIT[p.unit_slug].type === 'jurusan' ? UNIT[p.unit_slug] : null;
  const C = hexRgb(bid?.color || '#0f766e'), INK = [13, 26, 46], MUT = [90, 100, 116];
  const cv = p.data || {}, L = p.links || {};
  let y = 0;
  const color = (c) => doc.setTextColor(...c);
  const font = (st = 'normal', sz = 10) => { doc.setFont('helvetica', st); doc.setFontSize(sz); };
  const room = (h) => { if (y + h > H - 20) { doc.addPage(); y = 20; } };
  const para = (t, x, w, lh = 4.6) => { const ls = doc.splitTextToSize(pdfTxt(t), w); for (const l of ls) { room(lh); doc.text(l, x, y); y += lh; } };
  // ----- kepala -----
  doc.setFillColor(...INK); doc.rect(0, 0, W, 54, 'F');
  doc.setFillColor(...C); doc.rect(0, 54, W, 2.2, 'F');
  let tx = M;
  if (photo && p.photo) {
    const im = await imgData(p.photo, 500);
    if (im) {
      const s = 34;
      doc.setFillColor(...C); doc.rect(M - 1.2, 10 - 1.2, s + 2.4, s + 2.4, 'F');
      // potong tengah agar persegi
      const c = document.createElement('canvas'), z = Math.min(im.w, im.h); c.width = c.height = z;
      const img = new Image(); img.src = im.data; await img.decode();
      c.getContext('2d').drawImage(img, (im.w - z) / 2, (im.h - z) / 2, z, z, 0, 0, z, z);
      doc.addImage(c.toDataURL('image/jpeg', .85), 'JPEG', M, 10, s, s); tx = M + s + 9;
    }
  }
  const tw = W - M - tx;
  y = 16; color([200, 210, 225]); font('bold', 7.5);
  doc.text(pdfTxt((bid ? (bid.slug ? 'PROGRAM KEAHLIAN ' : '') + bid.name : 'SMK NEGERI 8 SURABAYA').toUpperCase()), tx, y, { charSpace: .4 });
  y += 8; color([255, 255, 255]); font('bold', 19);
  for (const l of doc.splitTextToSize(pdfTxt(p.full_name), tw).slice(0, 2)) { doc.text(l, tx, y); y += 7.5; }
  font('normal', 10.5); color([225, 232, 242]);
  for (const l of doc.splitTextToSize(pdfTxt(p.position || 'Guru SMK Negeri 8 Surabaya'), tw).slice(0, 2)) { doc.text(l, tx, y); y += 5; }
  if (p.subjects) { font('normal', 8.5); color([170, 185, 205]); for (const l of doc.splitTextToSize(pdfTxt('Mengampu: ' + p.subjects), tw).slice(0, 2)) { doc.text(l, tx, y); y += 4.2; } }
  // kontak
  const contacts = [p.email && ['Email', p.email, 'mailto:' + p.email], L.website && ['Web', L.website, L.website], L.linkedin && ['LinkedIn', L.linkedin, L.linkedin], L.instagram && ['Instagram', L.instagram, L.instagram], L.youtube && ['YouTube', L.youtube, L.youtube]].filter(Boolean);
  y = 62; font('normal', 8.3);
  if (contacts.length) {
    let cx = M;
    for (const [lab, val, href] of contacts) {
      const label = `${lab}: `, v = pdfTxt(val.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''));
      const wv = doc.getTextWidth(label) + doc.getTextWidth(v) + 7;
      if (cx + wv > W - M) { cx = M; y += 5; }
      color(MUT); doc.text(label, cx, y); color([35, 91, 164]); doc.textWithLink(v, cx + doc.getTextWidth(label), y, { url: href }); cx += wv;
    }
    y += 8;
  }
  // ringkasan angka
  const counts = [['kompetensi', 'Sertifikat'], ['prestasi', 'Prestasi'], ['pelatihan', 'Pelatihan'], ['pengalaman', 'Pengalaman']].map(([k, l]) => [(cv[k] || []).length, l]).filter(([n]) => n);
  if (counts.length) {
    const bw = CW / counts.length;
    doc.setDrawColor(222, 227, 235); doc.setLineWidth(.3); doc.line(M, y - 3, W - M, y - 3);
    counts.forEach(([n, l], i) => { const x = M + i * bw; color(C); font('bold', 15); doc.text(String(n), x, y + 4); const nw = doc.getTextWidth(String(n)); color(MUT); font('normal', 8); doc.text(l, x + nw + 2.2, y + 3.6); });
    y += 10; doc.line(M, y - 2, W - M, y - 2); y += 4;
  }
  // ----- bagian -----
  const head = (t) => { room(28); y += 3; doc.setFillColor(...C); doc.rect(M, y - 3.6, 1.6, 4.6, 'F'); color(INK); font('bold', 11.5); doc.text(pdfTxt(t).toUpperCase(), M + 4, y, { charSpace: .25 }); y += 2.5; doc.setDrawColor(222, 227, 235); doc.setLineWidth(.3); doc.line(M, y, W - M, y); y += 6; };
  const item = (title, meta, desc, link, right) => {
    const lt = doc.splitTextToSize(pdfTxt(title), CW - (right ? 34 : 0));
    room(lt.length * 4.8 + (meta ? 4.4 : 0) + 3);
    if (right) { color(C); font('bold', 8.3); doc.text(pdfTxt(right), W - M, y, { align: 'right' }); }
    color(INK); font('bold', 10); lt.forEach((l) => { doc.text(l, M, y); y += 4.8; });
    if (meta) { color(MUT); font('normal', 8.8); para(meta, M, CW, 4.3); }
    if (desc) { color([52, 65, 85]); font('normal', 9); para(desc, M, CW, 4.4); }
    if (link) { color([35, 91, 164]); font('normal', 8.3); room(4.4); const v = pdfTxt(link.replace(/^https?:\/\//, '')); doc.textWithLink('Bukti: ' + (v.length > 80 ? v.slice(0, 78) + '…' : v), M, y, { url: link }); y += 4.4; }
    y += 2.8;
  };
  const yrs = (a, b) => [a, b || (a ? 'sekarang' : '')].filter(Boolean).join(' – ');
  const j = (...a) => a.filter(Boolean).join(' · ');
  if (p.bio) { head('Tentang'); color([52, 65, 85]); font('normal', 9.6); para(p.bio, M, CW, 4.9); y += 2; }
  const sk = String(p.skills || '').split(',').map((x) => pdfTxt(x)).filter(Boolean);
  if (sk.length) {
    head('Keahlian Utama'); font('bold', 8.6); let x = M; room(8);
    for (const t of sk) {
      const w = doc.getTextWidth(t) + 7;
      if (x + w > W - M) { x = M; y += 8; room(8); }
      doc.setFillColor(...C.map((v) => Math.round(v + (255 - v) * .86))); doc.roundedRect(x, y - 4.4, w, 6.4, 3.2, 3.2, 'F');
      color(C.map((v) => Math.round(v * .7))); doc.text(t, x + 3.5, y); x += w + 2.5;
    }
    y += 9;
  }
  const S = (k) => cv[k] || [];
  if (S('kompetensi').length) { head('Sertifikat Kompetensi'); S('kompetensi').forEach((it) => item(it.nama, j(it.penerbit, it.bidang, it.berlaku && 'berlaku s.d. ' + it.berlaku), '', it.link, it.tahun)); }
  if (S('pengalaman').length) { head('Pengalaman Kerja & Industri'); S('pengalaman').forEach((it) => item(it.posisi, it.tempat, it.ket, '', yrs(it.mulai, it.selesai))); }
  if (S('pendidikan').length) { head('Riwayat Pendidikan'); S('pendidikan').forEach((it) => item(j(it.jenjang, it.prodi), it.institusi, '', '', it.tahun && 'Lulus ' + it.tahun)); }
  if (S('prestasi').length) { head('Prestasi & Penghargaan'); S('prestasi').forEach((it) => item(it.judul, j(it.tingkat && 'Tingkat ' + it.tingkat, it.penyelenggara), '', it.link, it.tahun)); }
  if (S('pelatihan').length) { head('Pelatihan, Diklat & Workshop'); S('pelatihan').forEach((it) => item(it.nama, j(it.penyelenggara, it.jp && it.jp + ' JP'), '', '', it.tahun)); }
  if (S('karya').length) { head('Karya, Publikasi & Produk'); S('karya').forEach((it) => item(it.judul, it.jenis, '', it.link, it.tahun)); }
  if (S('organisasi').length) { head('Organisasi & Kepanitiaan'); S('organisasi').forEach((it) => item(it.nama, it.peran, '', '', it.tahun)); }
  // ----- lampiran bukti -----
  const proofs = attach ? [...S('kompetensi').map((it) => [it.gambar, it.nama]), ...S('prestasi').map((it) => [it.gambar, it.judul])].filter(([g]) => g) : [];
  if (proofs.length) {
    doc.addPage(); y = 20; head('Lampiran: Bukti Sertifikat & Prestasi');
    const cw = (CW - 8) / 2; let col = 0, rowH = 0;
    for (const [g, cap] of proofs) {
      const im = await imgData(g, 1100); if (!im) continue;
      const ih = Math.min(cw * im.h / im.w, 95), iw = ih * im.w / im.h;
      if (col === 0) room(ih + 12);
      const x = M + col * (cw + 8);
      doc.setDrawColor(222, 227, 235); doc.rect(x, y, cw, ih, 'S');
      doc.addImage(im.data, 'JPEG', x + (cw - iw) / 2, y, iw, ih);
      color(MUT); font('normal', 8); doc.text(doc.splitTextToSize(pdfTxt(cap), cw).slice(0, 2), x, y + ih + 4.5);
      rowH = Math.max(rowH, ih + 13);
      if (++col === 2) { col = 0; y += rowH; rowH = 0; }
    }
  }
  // ----- kaki halaman -----
  const n = doc.getNumberOfPages(), url = `smkn8-sby.sch.id/guru/${p.slug || ''}`;
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setDrawColor(222, 227, 235); doc.setLineWidth(.3); doc.line(M, H - 13, W - M, H - 13);
    font('normal', 7.5); color(MUT);
    doc.text(pdfTxt(`CV ${p.full_name} · SMK Negeri 8 Surabaya · dicetak ${tgl}`), M, H - 8.5);
    doc.text(`Halaman ${i} dari ${n}`, W - M, H - 8.5, { align: 'right' });
  }
  doc.setProperties({ title: `CV ${pdfTxt(p.full_name)}`, subject: 'Curriculum Vitae', author: pdfTxt(p.full_name), creator: 'Website SMK Negeri 8 Surabaya' });
  const fname = 'CV-' + (pdfTxt(p.full_name).replace(/,.*$/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Guru') + '.pdf';
  doc.save(fname);
  return fname;
}
async function downloadCv(p, opts, btn) {
  const old = btn?.innerHTML; if (btn) { btn.disabled = true; btn.innerHTML = 'Menyiapkan PDF…'; }
  try { const f = await cvPdf(p, opts); toast(`CV diunduh: ${f}`); }
  catch (e) { toast(e.message || 'Gagal membuat PDF', true); }
  if (btn) { btn.disabled = false; btn.innerHTML = old; }
}

V.cv = async (view) => {
  setHead('Download CV (PDF)');
  const d = await api('admin/profil'); const p = d.profile;
  const nProof = ['kompetensi', 'prestasi'].reduce((a, k) => a + (p.data?.[k] || []).filter((x) => x.gambar).length, 0);
  view.innerHTML = `<div class="box" style="max-width:720px">
    <div class="cv-dl"><span class="cv-ic">${ic('dl')}</span><div><b>CV ${esc(p.full_name)}</b><span>Format PDF ukuran A4, dibuat dari data menu <a href="#/profil">Profil / CV Saya</a> yang sudah disimpan. Bisa diunduh kapan saja, walaupun profil masih <b>Privat</b>.</span></div></div>
    ${p.completeness < 60 ? `<div class="notice bad" style="margin:16px 0 0">Profil Anda baru ${p.completeness}% lengkap. Lengkapi dulu pendidikan, keahlian & sertifikat, dan pengalaman agar CV lebih meyakinkan. <a href="#/profil" style="font-weight:700">Lengkapi profil →</a></div>` : ''}
    <div class="fields" style="margin-top:18px">
      <div class="field"><label class="inline"><input type="checkbox" id="oPhoto"${p.photo ? ' checked' : ' disabled'}> Sertakan foto profil${p.photo ? '' : ' <small>(belum ada foto)</small>'}</label></div>
      <div class="field"><label class="inline"><input type="checkbox" id="oAttach"${nProof ? ' checked' : ' disabled'}> Sertakan lampiran foto bukti sertifikat & prestasi${nProof ? ` <small>(${nProof} gambar, di halaman terakhir)</small>` : ' <small>(belum ada foto bukti)</small>'}</label></div>
    </div>
    <div class="form-actions" style="justify-content:flex-start"><button class="btn btn-primary" id="dl">${ic('dl')}Download CV (PDF)</button><a class="btn btn-line" href="/guru/${encodeURIComponent(p.slug)}" target="_blank">${ic('eye')}Lihat versi web</a></div>
  </div>`;
  $('#dl').onclick = (e) => downloadCv(p, { photo: $('#oPhoto').checked, attach: $('#oAttach').checked }, e.currentTarget);
};

V['profil-guru'] = async (view) => {
  setHead('Profil Guru', `<a class="btn btn-line" href="/guru" target="_blank">${ic('ext')}Halaman Profil Guru</a>`);
  const { items, flags } = await api('admin/profil-guru');
  const st = (r) => (!r.slug ? ['Belum diisi', '#888'] : r.hidden ? ['Disembunyikan admin', '#d4364b'] : r.visibility === 'public' ? ['Publik', '#16966a'] : ['Privat', '#5a6474']);
  const n = { all: items.length, pub: items.filter((r) => r.slug && !r.hidden && r.visibility === 'public').length, none: items.filter((r) => !r.slug).length };
  view.innerHTML = `<div class="grid-stats">${[[n.all, 'Akun guru', '#235ba4'], [n.pub, 'Profil publik', '#16966a'], [n.all - n.pub - n.none, 'Privat / disembunyikan', '#5a6474'], [n.none, 'Belum mengisi', '#d98a06']].map(([v, l, c]) => `<div class="stat" style="--c:${c}"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="notice ${flags.enabled ? 'info' : 'bad'}" style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><span>${flags.enabled ? `${ic('globe')} Halaman Profil Guru <b>ditampilkan</b> di website. Tautan khusus profil privat: <b>${flags.share ? 'diizinkan' : 'dimatikan'}</b>.` : `${ic('lock')} Halaman Profil Guru sedang <b>disembunyikan</b> dari website (termasuk semua tautan khusus).`}</span><a class="btn btn-line btn-sm" href="#/settings">Ubah di Pengaturan Situs</a></div>
    <div class="notice info">Setiap guru mengisi profil/CV sendiri dari akunnya (menu <b>Profil / CV Saya</b>) dan memilih sendiri <b>Publik</b> atau <b>Privat</b>. Admin dapat <b>menyembunyikan</b> profil yang isinya tidak pantas.</div>
    <div class="toolbar"><div class="search">${ic('search')}<input id="q" placeholder="Cari nama guru…"></div>
      <select id="fs"><option value="">Semua status</option><option>Publik</option><option>Privat</option><option>Belum diisi</option><option>Disembunyikan admin</option></select></div>
    <div class="box" style="padding:0;overflow:auto"><table class="tbl"><thead><tr><th>Guru</th><th>Bidang</th><th>Kelengkapan</th><th>Status</th><th>Diperbarui</th><th></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  const draw = () => {
    const q = $('#q').value.toLowerCase(), fs = $('#fs').value;
    const rows = items.filter((r) => (!q || `${r.full_name || ''} ${r.name || ''} ${r.username}`.toLowerCase().includes(q)) && (!fs || st(r)[0] === fs));
    $('#tb').innerHTML = rows.length ? rows.map((r) => { const [l, c] = st(r); return `<tr>
      <td><div class="who"><span class="av" style="${r.photo ? `background-image:url('${esc(r.photo)}')` : ''}">${r.photo ? '' : esc((r.full_name || r.name || r.username).replace(/^(Drs?|Dra|Ir|H|Hj)\.?\s+/i, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase())}</span><span><span class="t-title">${esc(r.full_name || r.name || r.username)}</span><span class="t-sub">@${esc(r.username)}${r.position ? ' · ' + esc(r.position) : ''}${r.active ? '' : ' · akun nonaktif'}</span></span></div></td>
      <td>${r.unit_slug && UNIT[r.unit_slug] ? unitTag(r.unit_slug) : r.unit_slug === 'umum' ? '<span class="tag" style="--c:#5a6474">Umum</span>' : '-'}</td>
      <td style="min-width:120px">${r.slug ? `<div class="meter sm"><i style="width:${r.completeness}%"></i></div><span class="t-sub">${r.completeness}%</span>` : '-'}</td>
      <td style="white-space:nowrap"><span class="tag" style="--c:${c}">${l}</span>${r.shared ? `<br><span class="tag" style="--c:#1d4ed8;margin-top:4px">Tautan khusus aktif</span> <button class="link-btn bad" data-unshare="${r.user_id}">Cabut</button>` : ''}</td><td class="t-sub">${r.updated_at ? fmtDate(r.updated_at) : '-'}</td>
      <td style="white-space:nowrap">${r.slug ? `<a class="btn btn-line btn-sm" href="/guru/${encodeURIComponent(r.slug)}" target="_blank">${ic('eye')}Lihat</a> <button class="btn btn-line btn-sm" data-pdf="${esc(r.slug)}">${ic('dl')}PDF</button> <button class="btn ${r.hidden ? 'btn-line' : 'btn-danger'} btn-sm" data-hide="${r.user_id}" data-v="${r.hidden ? 0 : 1}">${r.hidden ? 'Tampilkan lagi' : 'Sembunyikan'}</button>` : ''}</td></tr>`; }).join('') : '<tr><td colspan="6"><div class="empty">Tidak ada data.</div></td></tr>';
    $$('[data-unshare]').forEach((b) => (b.onclick = async () => {
      if (!confirm('Cabut tautan khusus milik guru ini? Tautan yang sudah dibagikan tidak bisa dibuka lagi.')) return;
      try { await api(`admin/profil-guru/${b.dataset.unshare}`, { method: 'POST', body: { revokeShare: 1 } }); items.find((x) => String(x.user_id) === b.dataset.unshare).shared = false; draw(); toast('Tautan khusus dicabut'); }
      catch (e) { toast(e.message, true); }
    }));
    $$('[data-pdf]').forEach((b) => (b.onclick = async () => {
      try { const g = await api('guru/' + encodeURIComponent(b.dataset.pdf)); downloadCv(g.profile, {}, b); } catch (e) { toast(e.message, true); }
    }));
    $$('[data-hide]').forEach((b) => (b.onclick = async () => {
      const hide = b.dataset.v === '1';
      if (hide && !confirm('Sembunyikan profil ini dari website? Guru tetap dapat mengedit profilnya.')) return;
      try { await api(`admin/profil-guru/${b.dataset.hide}`, { method: 'POST', body: { hidden: hide ? 1 : 0 } }); const r = items.find((x) => String(x.user_id) === b.dataset.hide); r.hidden = hide ? 1 : 0; draw(); toast(hide ? 'Profil disembunyikan' : 'Profil ditampilkan kembali'); }
      catch (e) { toast(e.message, true); }
    }));
  };
  $('#q').oninput = draw; $('#fs').onchange = draw; draw();
};

V.review = async (view, id) => {
  if (id) return reviewDetail(view, id);
  setHead('Persetujuan Tulisan Guru');
  const TABS = [['review', 'Menunggu'], ['revisi', 'Revisi tulisan tayang'], ['ditolak', 'Dikembalikan'], ['publish', 'Sudah tayang'], ['arsip', 'Arsip']];
  const days = (iso) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 864e5));
  let tab = sessionStorage.getItem('rvTab') || 'review';
  const load = async () => {
    const d = await api('admin/review?status=' + tab);
    view.innerHTML = `<div class="notice info">Tulisan dari akun <b>Guru Penulis</b> (Opini, Tips & Tutorial, Artikel Praktis) tidak tayang sebelum disetujui di sini. Anda dapat memperbaiki salah ketik sebelum menyetujui, atau mengembalikannya dengan catatan revisi.</div>
      <div class="toolbar">${TABS.map(([v, l]) => `<button class="btn ${v === tab ? 'btn-dark' : 'btn-line'} btn-sm" data-tab="${v}">${l} (${d.counts[v] || 0})</button>`).join('')}</div>
      ${tab === 'ditolak' ? `<div class="notice info" style="margin-top:-6px">Tulisan di sini menunggu diperbaiki penulis. Gunakan <b>Ingatkan</b> untuk mengirim notifikasi pengingat, atau <b>Arsipkan</b> bila tulisan tidak layak terbit.${d.archiveDays ? ` Tulisan yang tidak direvisi dalam <b>${d.archiveDays} hari</b> otomatis pindah ke tab Arsip.` : ''}</div>` : ''}
      ${tab === 'arsip' ? '<div class="notice info" style="margin-top:-6px">Arsip berisi tulisan yang tidak layak terbit atau tidak direvisi penulis. Tulisan di sini <b>tidak tampil di daftar persetujuan</b>, namun penulis tetap bisa memperbaikinya dan mengirim ulang. Anda dapat menghapusnya permanen bila sudah tidak diperlukan.</div>' : ''}
      <div class="table-wrap">${d.items.length ? `<table><thead><tr><th>Tulisan</th><th>Penulis</th><th>Jenis</th><th>${{ publish: 'Tayang', ditolak: 'Dikembalikan', arsip: 'Diarsipkan', revisi: 'Revisi dikirim' }[tab] || 'Dikirim'}</th><th></th></tr></thead><tbody>${d.items.map((r) => `<tr>
        <td><span class="t-title">${esc(tab === 'revisi' && r.rev_title ? r.rev_title : r.title)}</span>${tab === 'revisi' && r.rev_title && r.rev_title !== r.title ? `<span class="t-sub">Judul tayang: ${esc(r.title)}</span>` : ''}<span class="t-sub" style="white-space:normal;max-width:420px">${esc((r.excerpt || '').slice(0, 140))}${(tab === 'ditolak' || tab === 'arsip') && r.review_note ? `<br><b>Catatan:</b> ${esc(r.review_note)}` : ''}</span></td>
        <td><b>${esc(r.author_name || "-")}</b>${r.author_title ? `<span class="t-sub" style="display:block">${esc(r.author_title)}</span>` : ''}</td>
        <td>${esc(CAT_LABEL[r.category] || r.category)}</td>
        <td>${tab === 'ditolak' ? `${fmtDate(r.reviewed_at)}<span class="t-sub" style="display:block">${days(r.reviewed_at)} hari lalu${d.archiveDays ? ` · arsip otomatis ${Math.max(0, d.archiveDays - days(r.reviewed_at))} hari lagi` : ''}</span>${r.reminded_at ? `<span class="t-sub" style="display:block">Diingatkan ${fmtDate(r.reminded_at)}</span>` : ''}` : tab === 'arsip' ? `${fmtDate(r.archived_at)}<span class="t-sub" style="display:block">${r.archive_reason === 'auto' ? 'Otomatis: tidak direvisi' : 'Diarsipkan WMM'}</span>` : fmtDate(tab === 'publish' ? r.published_at : tab === 'revisi' ? r.rev_at : r.submitted_at)}${r.reviewed_by && tab !== 'review' ? `<span class="t-sub" style="display:block">oleh ${esc(r.reviewed_by)}</span>` : ''}</td>
        <td class="act">${['publish', 'revisi'].includes(tab) ? `<a class="btn btn-line btn-sm" href="/berita/${esc(r.slug)}" target="_blank" title="Lihat di website">${ic('ext')}</a>` : ''}<a class="btn ${['review', 'revisi'].includes(tab) ? 'btn-primary' : 'btn-line'} btn-sm" href="#/review/${r.id}${tab === 'revisi' ? '?rev' : ''}">${tab === 'review' || tab === 'revisi' ? 'Periksa' : tab === 'publish' ? `${ic('pen')}Edit` : 'Buka'}</a>${tab === 'ditolak' ? `<button class="btn btn-line btn-sm" data-remind="${r.id}" title="Kirim notifikasi pengingat ke penulis">${ic('bell')}Ingatkan</button><button class="btn btn-line btn-sm" data-arch="${r.id}">${ic('archive')}Arsipkan</button>` : ''}${tab === 'arsip' ? `<button class="btn btn-danger btn-sm" data-purge="${r.id}">Hapus permanen</button>` : ''}</td></tr>`).join('')}</tbody></table>`
        : `<div class="empty">${tab === 'review' || tab === 'revisi' ? 'Tidak ada yang menunggu. 👍' : 'Belum ada data.'}</div>`}</div>`;
    $$('[data-tab]', view).forEach((b) => b.onclick = () => { tab = b.dataset.tab; sessionStorage.setItem('rvTab', tab); load(); });
    $$('[data-remind]', view).forEach((b) => b.onclick = async () => { try { await api('admin/review/' + b.dataset.remind, { method: 'POST', body: { action: 'remind' } }); toast('Pengingat terkirim ke penulis'); load(); } catch (e) { toast(e.message, true); } });
    $$('[data-arch]', view).forEach((b) => b.onclick = async () => {
      const note = prompt('Alasan pengarsipan (akan dikirim ke penulis):', 'Tulisan belum direvisi sesuai catatan.');
      if (note === null) return; if (!note.trim()) return toast('Alasan wajib diisi.', true);
      try { await api('admin/review/' + b.dataset.arch, { method: 'POST', body: { action: 'archive', note: note.trim() } }); toast('Tulisan dipindah ke Arsip'); load(); refreshUnread(); } catch (e) { toast(e.message, true); }
    });
    $$('[data-purge]', view).forEach((b) => b.onclick = async () => {
      if (!confirm('Hapus tulisan ini secara PERMANEN? Tindakan tidak dapat dibatalkan. Penulis akan diberi notifikasi.')) return;
      try { await api('admin/review/' + b.dataset.purge, { method: 'DELETE' }); toast('Tulisan dihapus permanen'); load(); } catch (e) { toast(e.message, true); }
    });
  };
  await load();
};
async function reviewDetail(view, id) {
  const rid = String(id).split('?')[0];
  const { item } = await api('admin/review/' + rid);
  const rev = item.status === 'publish' && item.rev_data && item.rev_state === 'review';
  if (rev) { try { Object.assign(item, JSON.parse(item.rev_data)); } catch { /* abaikan */ } }
  id = rid;
  setHead(rev ? 'Periksa revisi tulisan' : item.status === 'publish' ? 'Edit tulisan yang sudah tayang' : 'Periksa tulisan', `${item.status === 'publish' ? `<a class="btn btn-line" href="/berita/${esc(item.slug)}" target="_blank">${ic('ext')}Lihat versi tayang</a>` : ''}<a class="btn btn-line" href="#/review">Kembali</a>`);
  const fields = [
    { k: 'title', label: 'Judul', required: true },
    { k: 'content', label: 'Isi tulisan (boleh diperbaiki sebelum disetujui)', type: 'rich' },
    { k: 'video_url', label: 'Link video (YouTube / TikTok / Reels Instagram)', type: 'url' },
  ];
  const side = [{ k: 'category', label: 'Jenis tulisan', type: 'select', opts: GURU_CATS }, { k: 'cover', label: 'Gambar sampul', type: 'image' }];
  view.innerHTML = `${rev ? `<div class="notice info"><b>Revisi dari penulis</b> untuk tulisan yang sudah tayang (dikirim ${fmtDate(item.rev_at)}). Isi di bawah adalah <b>versi revisi</b>; versi lama tetap tayang sampai Anda menyetujui. Anda masih boleh memperbaiki salah ketik.</div>` : item.status === 'publish' ? '<div class="notice info">Tulisan ini sudah tayang. Perubahan yang Anda simpan langsung tampil di website.</div>' : ''}
  <div class="form-grid"><div class="box"><div class="fields">${fields.map((f) => fieldHtml(f, item[f.k])).join('')}</div></div>
    <div><div class="box"><h3>Penulis</h3><p style="margin:0"><b>${esc(item.author_name || '-')}</b>${item.author_title ? `<br><span class="t-sub" style="display:inline">${esc(item.author_title)}</span>` : ''}</p>
      <p class="t-sub" style="margin:8px 0 0">Dikirim ${fmtDate(item.submitted_at || item.updated_at)} · Status: ${statusTag(item.status)}</p>
      ${item.review_note ? `<p class="t-sub" style="white-space:normal;margin-top:8px">Catatan terakhir: ${esc(item.review_note)}</p>` : ''}</div>
    <div class="box"><div class="fields">${side.map((f) => fieldHtml(f, item[f.k])).join('')}
      <label class="field" data-k="note"><span>Catatan untuk penulis</span><textarea id="rvNote" rows="4" placeholder="Wajib diisi bila dikembalikan/diarsipkan. Opsional bila disetujui (mis. ucapan terima kasih).">${esc(item.status === 'ditolak' ? item.review_note || '' : '')}</textarea></label></div>
      <div class="form-actions" style="flex-direction:column;align-items:stretch">${rev ? `
        <button class="btn btn-primary btn-block" data-act="approve">${ic('check')}Setujui revisi & tayangkan</button>
        <button class="btn btn-danger btn-block" data-act="reject">Kembalikan revisi</button><small class="t-sub" style="text-align:center;white-space:normal">Bila dikembalikan, versi lama tetap tayang.</small>` : `
        <button class="btn btn-primary btn-block" data-act="approve">${ic('check')}${item.status === 'publish' ? 'Simpan perubahan (tetap tayang)' : 'Setujui & tayangkan'}</button>
        <button class="btn btn-danger btn-block" data-act="reject">${item.status === 'publish' ? 'Tarik dari website & kembalikan' : 'Kembalikan untuk revisi'}</button>
        <button class="btn btn-line btn-block" data-act="save">Simpan perbaikan saja</button>
        ${item.status !== 'publish' && item.status !== 'arsip' ? `<button class="btn btn-line btn-block" data-act="archive">${ic('archive')}Arsipkan (tidak layak terbit)</button>` : ''}`}</div></div></div></div>`;
  const all = [...fields, ...side];
  bindForm(view, all);
  bindVideoPreview(view);
  view.querySelectorAll('[data-act]').forEach((b) => b.onclick = async () => {
    const act = b.dataset.act, note = $('#rvNote').value.trim();
    if ((act === 'reject' || act === 'archive') && !note) return toast(act === 'archive' ? 'Tuliskan alasan pengarsipan untuk penulis.' : 'Tuliskan catatan revisi untuk penulis.', true);
    if (act === 'archive' && !confirm('Pindahkan tulisan ini ke Arsip? Penulis akan diberi notifikasi dan tetap bisa merevisi.')) return;
    if (act === 'approve' && (item.status !== 'publish' || rev) && !confirm(rev ? 'Setujui revisi? Versi revisi langsung menggantikan versi yang tayang.' : 'Setujui dan tayangkan tulisan ini di website?')) return;
    if (act === 'reject' && item.status === 'publish' && !rev && !confirm('Tarik tulisan ini dari website?')) return;
    const data = readForm(view, all);
    view.querySelectorAll('[data-act]').forEach((x) => (x.disabled = true));
    try {
      await api('admin/review/' + id, { method: 'POST', body: { ...data, note, action: act, revision: rev ? 1 : 0 } });
      toast(rev ? (act === 'approve' ? 'Revisi disetujui dan sudah tayang.' : 'Revisi dikembalikan ke penulis; versi lama tetap tayang.') : act === 'approve' ? (item.status === 'publish' ? 'Perubahan tersimpan dan tayang.' : 'Tulisan disetujui dan tayang di website.') : act === 'reject' ? 'Tulisan dikembalikan ke penulis.' : act === 'archive' ? 'Tulisan dipindah ke Arsip.' : 'Perbaikan tersimpan.');
      refreshUnread(); location.hash = '#/review';
    } catch (er) { toast(er.message, true); view.querySelectorAll('[data-act]').forEach((x) => (x.disabled = false)); }
  });
}

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
      ${m.is_read ? '' : `<button class="btn btn-dark btn-sm" data-read="${m.id}">Tandai dibaca</button>`}${isAdmin() ? `<button class="btn btn-danger btn-sm" data-del="${m.id}">Hapus</button>` : ''}</div></div>`).join('') : '<div class="box empty">Belum ada pesan.</div>';
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

// ---------- Backup & Pemulihan ----------
const TABLE_LABEL = {
  settings: 'Pengaturan situs', units: 'Profil unit (jurusan, lembaga, TEFA, Waka)', users: 'Akun pengguna', posts: 'Berita & kegiatan', agenda: 'Agenda',
  gallery: 'Galeri foto', programs: 'Program sekolah', prestasi: 'Prestasi siswa', lowongan: 'Lowongan kerja (BKK)', skema: 'Skema sertifikasi (LSP)',
  dudi: 'DUDI / mitra industri', messages: 'Pesan masuk', sarpras_meta: 'SI-SARPRAS: lokasi, pengumuman, template', sarpras_assets: 'SI-SARPRAS: inventaris aset',
  sarpras_bast: 'SI-SARPRAS: BAST/BAPB', teacher_profiles: 'Profil / CV guru', media: 'Gambar & berkas unggahan',
};
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : null);
const fmtBytes = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
const fmtDT = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : '-');
function backupReminder(d) {
  const n = daysSince(d.backup_last), iv = d.backup_interval || 7;
  if (n !== null && n < iv) return '';
  return `<div class="notice bad" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
    <span>${ic('shield')} ${n === null ? '<b>Data website belum pernah dibackup.</b>' : `<b>Backup terakhir ${n} hari lalu.</b>`} Disarankan backup setiap ${iv} hari agar data aman.</span>
    <a class="btn btn-primary btn-sm" href="#/backup">Backup sekarang</a></div>`;
}
function saveFile(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
async function buildBackup(info, { media = true, users = true } = {}, onProgress = () => {}) {
  const list = info.tables.filter((t) => (media || t.name !== 'media') && (users || t.name !== 'users'));
  const total = list.reduce((n, t) => n + t.count, 0) || 1;
  const out = { app: 'smkn8sby-website', format: 1, schema_version: info.schema, created_at: new Date().toISOString(), created_by: ME.name || ME.username, include_media: media, include_users: users, tables: {} };
  let done = 0;
  for (const t of list) {
    out.tables[t.name] = [];
    let offset = 0;
    while (offset !== null) {
      const d = await api(`admin/backup/table/${t.name}?offset=${offset}`);
      out.tables[t.name].push(...d.rows); done += d.rows.length; offset = d.next;
      onProgress(Math.min(99, Math.round(done / total * 100)), TABLE_LABEL[t.name] || t.name);
    }
  }
  const text = JSON.stringify(out);
  const stamp = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  return { text, name: `backup-smkn8sby-${stamp}${media ? '' : '-tanpa-gambar'}.json`, rows: done, tables: list.length };
}
V.backup = async (view) => {
  setHead('Backup & Pemulihan');
  const info = await api('admin/backup');
  const n = daysSince(info.last), late = n === null || n >= info.interval;
  const totalRows = info.tables.reduce((a, t) => a + t.count, 0);
  view.innerHTML = `
  <div class="notice ${late ? 'bad' : 'info'}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
    <span>${ic('shield')} ${info.last ? `Backup terakhir: <b>${fmtDT(info.last)}</b> (${n === 0 ? 'hari ini' : n + ' hari lalu'}).` : '<b>Belum pernah ada backup.</b>'} ${late ? 'Sudah waktunya backup lagi.' : 'Data dalam kondisi aman.'}</span>
    <label style="display:flex;gap:8px;align-items:center;font-size:.85rem">Ingatkan setiap
      <select id="iv">${[1, 3, 7, 14, 30].map((d) => `<option value="${d}" ${d === info.interval ? 'selected' : ''}>${d} hari</option>`).join('')}</select></label>
  </div>
  <div class="form-grid">
    <div>
      <div class="box"><h3>1 · Unduh backup</h3>
        <p style="margin:0 0 14px">Seluruh isi website diunduh menjadi satu file <b>.json</b>. Simpan file ini di tempat aman (Google Drive sekolah, flashdisk, atau laptop admin).</p>
        <div class="table-wrap" style="margin-bottom:14px"><table><thead><tr><th>Data</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>
          ${info.tables.map((t) => `<tr><td>${esc(TABLE_LABEL[t.name] || t.name)}</td><td style="text-align:right">${t.count.toLocaleString('id-ID')}${t.name === 'media' && info.mediaBytes ? ` <span class="t-sub" style="display:inline">(${fmtBytes(info.mediaBytes)})</span>` : ''}</td></tr>`).join('')}
          <tr><td><b>Total</b></td><td style="text-align:right"><b>${totalRows.toLocaleString('id-ID')} baris</b></td></tr></tbody></table></div>
        <label class="chk"><input type="checkbox" id="opMedia" checked> Sertakan gambar & berkas unggahan (${fmtBytes(info.mediaBytes || 0)})</label>
        <label class="chk"><input type="checkbox" id="opUsers" checked> Sertakan akun pengguna</label>
        <div class="notice info" style="margin:12px 0">File backup berisi akun pengguna (password tersimpan dalam bentuk acak/hash) dan pesan masuk. <b>Jangan dibagikan</b> ke orang lain.</div>
        <div id="dlProg"></div>
        <button class="btn btn-primary" id="bDl">${ic('dl')} Unduh backup sekarang</button>
      </div>
      <div class="box"><h3>2 · Pulihkan dari file backup</h3>
        <p style="margin:0 0 14px">Gunakan bila data terhapus atau rusak. Pilih file backup <b>.json</b> yang pernah diunduh dari menu ini.</p>
        <input type="file" id="rf" accept=".json,application/json">
        <div id="rInfo" style="margin-top:14px"></div>
      </div>
    </div>
    <div>
      <div class="box"><h3>Riwayat</h3>${info.log.length ? `<table><tbody>${info.log.map((l) => `<tr><td><span class="tag ${l.kind === 'pulihkan' ? 'bad' : 'ok'}">${l.kind === 'pulihkan' ? 'Pulihkan' : 'Unduh'}</span></td><td><span class="t-title" style="font-size:.85rem">${fmtDT(l.created_at)}</span><span class="t-sub">${esc(l.user_name || '')} · ${l.rows.toLocaleString('id-ID')} baris${l.size ? ' · ' + fmtBytes(l.size) : ''}${l.note ? ' · ' + esc(l.note) : ''}</span></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Belum ada riwayat.</div>'}</div>
      <div class="box"><h3>Tips keamanan data</h3>
        <ol style="margin:0;padding-left:18px;font-size:.88rem;line-height:1.6">
          <li>Unduh backup secara rutin. Panel akan mengingatkan bila sudah lewat ${info.interval} hari.</li>
          <li>Simpan minimal 2 salinan terakhir di tempat berbeda (mis. Google Drive & flashdisk).</li>
          <li>Selalu unduh backup sebelum perubahan besar (impor Excel, hapus banyak data).</li>
          <li>Cloudflare D1 juga memiliki fitur <b>Time Travel</b> untuk mengembalikan database ke titik waktu tertentu (lihat README).</li>
        </ol></div>
    </div>
  </div>`;
  $('#iv').onchange = async (e) => { try { await api('admin/backup/interval', { method: 'PUT', body: { days: +e.target.value } }); toast('Pengingat backup diperbarui'); } catch (er) { toast(er.message, true); } };
  const prog = (box, pct, label) => { box.innerHTML = `<div class="prog"><span style="width:${pct}%"></span></div><div class="t-sub" style="margin:6px 0 12px">${pct}% · ${esc(label)}</div>`; };
  $('#bDl').onclick = async () => {
    const b = $('#bDl'); b.disabled = true;
    try {
      const r = await buildBackup(info, { media: $('#opMedia').checked, users: $('#opUsers').checked }, (p, l) => prog($('#dlProg'), p, 'Mengambil ' + l));
      saveFile(r.text, r.name);
      await api('admin/backup/log', { method: 'POST', body: { kind: 'unduh', size: r.text.length, tables: r.tables, rows: r.rows, note: $('#opMedia').checked ? '' : 'tanpa gambar' } });
      toast('Backup berhasil diunduh: ' + r.name);
      setTimeout(() => route(), 800);
    } catch (er) { toast(er.message, true); $('#dlProg').innerHTML = ''; b.disabled = false; }
  };
  $('#rf').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch { $('#rInfo').innerHTML = '<div class="notice bad">File tidak dapat dibaca. Pastikan memilih file backup .json yang benar.</div>'; return; }
    if (data.app !== 'smkn8sby-website' || !data.tables || typeof data.tables !== 'object') { $('#rInfo').innerHTML = '<div class="notice bad">Ini bukan file backup website SMKN 8 Surabaya.</div>'; return; }
    const names = Object.keys(data.tables).filter((k) => Array.isArray(data.tables[k]));
    const rows = names.reduce((a, k) => a + data.tables[k].length, 0);
    $('#rInfo').innerHTML = `<div class="notice info"><b>File backup tanggal ${fmtDT(data.created_at)}</b> oleh ${esc(data.created_by || '-')} · ${rows.toLocaleString('id-ID')} baris dari ${names.length} jenis data${data.include_media ? '' : ' · tanpa gambar'}${data.include_users ? '' : ' · tanpa akun pengguna'}.</div>
      <div class="table-wrap" style="max-height:240px;overflow:auto;margin-bottom:12px"><table><tbody>${names.map((k) => `<tr><td><label class="chk" style="margin:0"><input type="checkbox" class="rt" value="${esc(k)}" checked> ${esc(TABLE_LABEL[k] || k)}</label></td><td style="text-align:right">${data.tables[k].length.toLocaleString('id-ID')}</td></tr>`).join('')}</tbody></table></div>
      <label class="chk"><input type="radio" name="rm" value="replace" checked> <span><b>Ganti</b> — isi data terpilih dihapus lalu diganti persis seperti di file backup</span></label>
      <label class="chk"><input type="radio" name="rm" value="merge"> <span><b>Gabungkan</b> — data di file ditambahkan/menimpa yang sama, data baru yang tidak ada di file tetap disimpan</span></label>
      <label class="chk"><input type="checkbox" id="preDl" checked> Unduh backup kondisi saat ini terlebih dahulu (sangat disarankan)</label>
      <label class="field" style="margin-top:10px"><span>Ketik <b>PULIHKAN</b> untuk konfirmasi</span><input id="rConf" autocomplete="off"></label>
      <div id="rProg" style="margin-top:12px"></div>
      <button class="btn btn-danger" id="bRs" style="margin-top:4px">${ic('upload')} Pulihkan data</button>`;
    $('#bRs').onclick = async () => {
      if ($('#rConf').value.trim().toUpperCase() !== 'PULIHKAN') { toast('Ketik PULIHKAN untuk melanjutkan.', true); return; }
      const sel = $$('.rt:checked').map((x) => x.value); if (!sel.length) { toast('Pilih minimal satu jenis data.', true); return; }
      const replace = $('input[name=rm]:checked').value === 'replace';
      const b = $('#bRs'); b.disabled = true;
      try {
        if ($('#preDl').checked) {
          const pre = await buildBackup(info, { media: true, users: true }, (p, l) => prog($('#rProg'), p, 'Mengamankan data saat ini: ' + l));
          saveFile(pre.text, pre.name.replace('backup-', 'sebelum-pulihkan-'));
          await api('admin/backup/log', { method: 'POST', body: { kind: 'unduh', size: pre.text.length, tables: pre.tables, rows: pre.rows, note: 'otomatis sebelum pemulihan' } });
        }
        const total = sel.reduce((a, k) => a + data.tables[k].length, 0) || 1; let done = 0;
        for (const k of sel) {
          const rowsK = data.tables[k], size = k === 'media' ? 3 : 200;
          if (!rowsK.length && replace) await api('admin/backup/restore', { method: 'POST', body: { table: k, rows: [], reset: true } });
          for (let i = 0; i < rowsK.length; i += size) {
            await api('admin/backup/restore', { method: 'POST', body: { table: k, rows: rowsK.slice(i, i + size), reset: replace && i === 0 } });
            done += Math.min(size, rowsK.length - i); prog($('#rProg'), Math.round(done / total * 100), 'Memulihkan ' + (TABLE_LABEL[k] || k));
          }
        }
        await api('admin/backup/log', { method: 'POST', body: { kind: 'pulihkan', rows: done, tables: sel.length, note: `${replace ? 'ganti' : 'gabung'} · file ${fmtDT(data.created_at)}` } });
        toast('Pemulihan selesai. Memuat ulang…'); setTimeout(() => location.reload(), 1200);
      } catch (er) { toast(er.message, true); b.disabled = false; }
    };
  };
};

// ---------- Router ----------
async function route() {
  if (!ME) return;
  if (!location.hash.startsWith('#/profil')) window.onbeforeunload = null;
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const view = $('#view');
  if (!view) return; // panel belum selesai dimuat; route() dipanggil lagi setelah tampilan siap
  $$('#menu a').forEach((x) => x.classList.toggle('on', x.dataset.h === (b && a === 'units' ? `units/${b}` : a || 'dashboard') || (a === 'units' && x.dataset.h === 'units' && isAdmin())));
  $('#side')?.classList.remove('open');
  view.innerHTML = '<div class="empty">Memuat…</div>';
  window.scrollTo(0, 0);
  try {
    if (!a || a === 'dashboard') return await V.dashboard(view);
    if (isGuru() && !['posts', 'account', 'profil', 'cv', 'notif'].includes(a)) throw new Error('Akun guru hanya dapat membuka menu Tulisan Saya dan Profil / CV Saya.');
    if (a === 'notif') return await V.notif(view);
    if (a === 'cv') { if (!isGuru()) throw new Error('Menu ini untuk akun guru.'); return await V.cv(view); }
    if (a === 'profil') { if (!isGuru()) throw new Error('Profil / CV hanya untuk akun guru.'); return await V.profil(view); }
    if (a === 'review') { if (!canReview()) throw new Error('Menu ini khusus WMM dan admin.'); return await V.review(view, b); }
    if (a === 'messages' && !isAdmin() && !isBkk()) throw new Error('Menu ini khusus admin, BKK, dan Waka Humas.');
    if (RES[a]) {
      if (a === 'program' && !isAdmin() && UNIT[ME.unit_slug]?.type !== 'waka') throw new Error('Menu ini khusus admin dan wakil kepala sekolah.');
      if (a === 'product' && !isAdmin() && UNIT[ME.unit_slug]?.type !== 'tefa') throw new Error('Menu ini khusus admin dan pengelola TEFA.');
      if (a === 'lowongan' && !isAdmin() && !isBkk()) throw new Error('Menu ini khusus BKK dan Waka Humas.');
      if (a === 'skema' && !isAdmin() && ME.unit_slug !== 'lsp') throw new Error('Menu ini khusus LSP.');
      if (a === 'dudi' && !isAdmin() && !isBkk() && UNIT[ME.unit_slug]?.type !== 'jurusan') throw new Error('Menu ini khusus admin, BKK, Waka Humas, dan pengelola jurusan.');
      return b ? await editView(view, a, b === 'new' ? null : b) : await listView(view, a);
    }
    if (a === 'units') return await V.units(view, b);
    if (V[a] && (isAdmin() || ['gallery', 'account'].includes(a) || (a === 'messages' && isBkk()))) return await V[a](view);
    throw new Error('Halaman tidak ditemukan atau Anda tidak memiliki akses.');
  } catch (e) { setHead('Oops'); view.innerHTML = `<div class="notice bad">${esc(e.message)}</div>`; }
}
async function refreshUnread() {
  if (isGuru()) {
    try { const d = await api('admin/notif'); const el = $('#notifc'); if (el) { el.textContent = d.unread || ''; el.hidden = !d.unread; } return d; } catch { return null; }
  }
  if (!isAdmin() && !isBkk() && !canReview()) return;
  try {
    const d = await api('admin/dashboard');
    for (const [id, n] of [['unread', d.unread], ['pending', d.pending]]) { const el = $('#' + id); if (el) { el.textContent = n || ''; el.hidden = !n; } }
  } catch { /* abaikan */ }
}
let SITE_ALUMNI = '';
async function loadUnits() {
  const s = await fetch('/api/site').then((r) => r.json());
  UNITS = s.units; UNIT = Object.fromEntries(UNITS.map((u) => [u.slug, u]));
  SITE_ALUMNI = /^https?:\/\//i.test(s.settings?.alumni_link || '') ? s.settings.alumni_link : '';
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
    try {
      await api(setup ? 'auth/setup' : 'auth/login', { method: 'POST', body: d });
      const next = new URLSearchParams(location.search).get('next') || '';
      if (/^\/[a-z0-9/_-]*$/i.test(next) && !next.startsWith('//')) { location.href = next; return; }
      boot();
    }
    catch (er) { $('#am').innerHTML = `<div class="notice bad" style="margin:0">${esc(er.message)}</div>`; b.disabled = false; }
  };
}

async function boot() {
  try {
    const st = await api('auth/status');
    if (!st.user) { ME = null; return authScreen(st.needsSetup); }
    ME = st.user;
    await loadUnits();
    renderShell(); route();
    refreshUnread().then((d) => { if (isGuru() && d?.unread) toast(`Anda punya ${d.unread} notifikasi baru dari WMM. Lihat di menu Notifikasi.`); });
  } catch (e) {
    $('#app').innerHTML = `<div class="boot" style="opacity:1"><div class="notice bad">${esc(e.message)}</div></div>`;
  }
}
window.addEventListener('hashchange', route);
boot();
})();
