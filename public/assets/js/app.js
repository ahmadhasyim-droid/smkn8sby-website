/* =============================================================
   SMKN 8 Surabaya — Skrip halaman publik
   Semua konten diambil dari API (/api/...) yang dikelola lewat Admin.
   ============================================================= */
(() => {
'use strict';

// ---------- Ikon (SVG garis) ----------
const ICONS = {
  kecantikan: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M19 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path d="M5 15.5l.6 1.4 1.4.6-1.4.6L5 19.5l-.6-1.4-1.4-.6 1.4-.6z"/>',
  perhotelan: '<path d="M3 18h18"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M12 11v0"/><path d="M12 8V6"/><path d="M10 6h4"/><path d="M4 21h16"/>',
  kuliner: '<path d="M6 13.9A4 4 0 0 1 7.6 6.3a5 5 0 0 1 8.8 0A4 4 0 0 1 18 13.9V17H6z"/><path d="M6 17h12v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M10 13v4M14 13v4"/>',
  multimedia: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M10 8.5v5l4.5-2.5z"/><path d="M8 21h8M12 17v4"/>',
  busana: '<path d="M10 6a2 2 0 1 1 3 1.7c-.6.4-1 .9-1 1.6V11"/><path d="M12 11l-8.6 6.4c-.8.6-.4 1.6.5 1.6h16.2c.9 0 1.3-1 .5-1.6z"/>',
  lsp: '<circle cx="12" cy="9" r="5.5"/><path d="M9.5 9l1.8 1.8L15 7.2"/><path d="M8.5 13.8L7 21l5-2.8 5 2.8-1.5-7.2"/>',
  dkv: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  factory: '<path d="M2 20h20"/><path d="M4 20V9l5 3V9l5 3V9l5 3v8"/><path d="M19 12V4h2v16"/><path d="M8 16h2M13 16h2"/>',
  bkk: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/><path d="M11 13v2h2v-2"/>',
  sekolah: '<path d="M3 10l9-5 9 5-9 5z"/><path d="M7 12.2V17c0 1.1 2.2 2.5 5 2.5s5-1.4 5-2.5v-4.8"/><path d="M21 10v5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUR: '<path d="M7 17L17 7M8 7h9v9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  wa: '<path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2.2-1-1 .9a5 5 0 0 1-2.6-2.6l.9-1-1-2.2z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  facebook: '<path d="M14 21v-7.5h2.6l.4-3H14V8.6c0-.9.3-1.6 1.6-1.6H17V4.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.4H8.5v3H11V21"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  news: '<path d="M4 5h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 17h3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
const ICON_ALIAS = { 'tata-busana': 'busana' };
const icon = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[ICON_ALIAS[n] || n] || ICONS.sekolah}</svg>`;

// ---------- Utilitas ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const api = async (p) => { const r = await fetch('/api/' + p); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Gagal memuat'); return d; };
const TZ = 'Asia/Jakarta';
const fmtDate = (iso, o = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!iso) return ''; const d = new Date(iso.length === 10 ? iso + 'T00:00:00+07:00' : iso);
  return isNaN(d) ? '' : d.toLocaleDateString('id-ID', { timeZone: TZ, ...o });
};
const CATS = { berita: 'Berita', kegiatan: 'Kegiatan', prestasi: 'Prestasi', pengumuman: 'Pengumuman' };
const safeUrl = (u) => (/^(https?:|mailto:|tel:|\/|#)/i.test(String(u || '').trim()) ? String(u).trim() : '#');
const params = new URLSearchParams(location.search);

let SITE = null; let UNITS = {};
const SCHOOL_UNIT = { slug: 'sekolah', name: 'Sekolah', short: 'SMKN 8', color: '#235ba4', icon: 'sekolah', type: 'sekolah' };
const unitOf = (slug) => UNITS[slug] || SCHOOL_UNIT;
const unitUrl = (u) => (u.type === 'lembaga' ? `/lembaga/${u.slug}` : u.type === 'tefa' ? `/tefa/${u.slug.replace(/^tefa-/, '')}` : u.type === 'jurusan' ? `/jurusan/${u.slug}` : '/profil');
const TYPE_LABEL = { jurusan: 'Program Keahlian', lembaga: 'Lembaga', tefa: 'Teaching Factory' };
const chipLabel = (u) => (u.type === 'jurusan' ? u.name : u.short || u.name);
const unitMark = (u, cls = 'ico') => (u.logo ? `<img src="${esc(u.logo)}" alt="Logo ${esc(u.name)}" loading="lazy">` : icon(u.icon || u.slug, cls));

// Pembersih HTML isi berita (daftar putih tag & atribut)
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  const ALLOWED = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'HR', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'SPAN', 'DIV']);
  const walk = (node) => {
    [...node.children].forEach((el) => {
      if (!ALLOWED.has(el.tagName)) { el.replaceWith(...el.childNodes); return walk(node); }
      [...el.attributes].forEach((a) => {
        const keep = (el.tagName === 'A' && a.name === 'href') || (el.tagName === 'IMG' && (a.name === 'src' || a.name === 'alt'));
        if (!keep) el.removeAttribute(a.name);
        else if (a.name !== 'alt') el.setAttribute(a.name, safeUrl(a.value));
      });
      if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      if (el.tagName === 'IMG') el.setAttribute('loading', 'lazy');
      walk(el);
    });
  };
  walk(doc.body.firstChild);
  return doc.body.firstChild.innerHTML;
}

const cover = (post, cls = '') => {
  const u = unitOf(post.unit_slug);
  return post.cover
    ? `<img src="${esc(post.cover)}" alt="" loading="lazy" class="${cls}">`
    : `<div class="ph-cover ${cls}" style="--c:${u.color}">${icon(u.icon || u.slug)}</div>`;
};
const unitBadge = (slug, soft) => { const u = unitOf(slug); return `<span class="badge${soft ? ' soft' : ''}" style="--c:${u.color}">${esc(u.short || u.name)}</span>`; };

const postCard = (p, feature = false) => `
  <a class="card${feature ? ' news-feature' : ''}" href="/berita/${encodeURIComponent(p.slug)}">
    <div class="thumb">${cover(p)}${unitBadge(p.unit_slug)}</div>
    <div class="body">
      <div class="meta"><span>${icon('calendar')}${fmtDate(p.published_at)}</span><span>${esc(CATS[p.category] || 'Berita')}</span></div>
      <h3>${esc(p.title)}</h3>
      ${p.excerpt ? `<p class="excerpt">${esc(p.excerpt)}</p>` : ''}
    </div>
  </a>`;

const agendaItem = (a, past = false) => {
  const u = unitOf(a.unit_slug);
  const d = new Date(a.date + 'T00:00:00+07:00');
  const range = a.end_date && a.end_date !== a.date ? ` – ${fmtDate(a.end_date, { day: 'numeric', month: 'short' })}` : '';
  return `<div class="agenda-item${past ? ' past' : ''}" style="--c:${u.color}">
    <div class="agenda-date"><b>${d.toLocaleDateString('id-ID', { day: '2-digit', timeZone: TZ })}</b><span>${d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit', timeZone: TZ })}</span></div>
    <div class="agenda-body">
      <h4>${esc(a.title)}</h4>
      <div class="meta">${unitBadge(a.unit_slug, true)}
        ${a.time ? `<span>${icon('clock')}${esc(a.time)}</span>` : ''}
        ${a.location ? `<span>${icon('pin')}${esc(a.location)}</span>` : ''}
        ${range ? `<span>${icon('calendar')}${fmtDate(a.date, { day: 'numeric', month: 'short' })}${range}</span>` : ''}
      </div>
      ${a.description ? `<p>${esc(a.description)}</p>` : ''}
    </div></div>`;
};

const empty = (msg) => `<div class="empty">${esc(msg)}</div>`;
const secHead = (num, label, title, sub = '', link = '') => `
  <div class="sec-head"><div>
    <div class="sec-label mono"><b>${num}</b>${esc(label)}</div>
    <h2 class="sec-title">${title}</h2>${sub ? `<p class="sec-sub">${esc(sub)}</p>` : ''}
  </div>${link}</div>`;

const socialLinks = (s) => {
  const out = [];
  if (s.instagram) out.push(`<a href="https://instagram.com/${esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a>`);
  if (s.facebook) out.push(`<a href="https://facebook.com/${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>`);
  if (s.youtube) out.push(`<a href="${esc(ytUrl(s.youtube))}" target="_blank" rel="noopener" aria-label="YouTube ${esc(ytName(s))}">${icon('youtube')}</a>`);
  return out.join('');
};
const ytUrl = (v) => (/^https?:\/\//i.test(v) ? safeUrl(v) : `https://youtube.com/@${encodeURIComponent(String(v).replace(/^@/, ''))}`);
const ytName = (s) => s.youtube_name || s.youtube;
const waLink = (n) => 'https://wa.me/' + String(n).replace(/\D/g, '').replace(/^0/, '62');

// ---------- Kerangka: header & footer ----------
function renderShell() {
  const s = SITE.settings, page = document.body.dataset.page;
  const units = Object.values(UNITS);
  const jur = units.filter((u) => u.type === 'jurusan'), lem = units.filter((u) => u.type === 'lembaga'), tefa = units.filter((u) => u.type === 'tefa');
  const ddItem = (u) => `<a class="dd-item" href="${unitUrl(u)}"><span class="chip" style="--c:${u.color}">${u.logo ? `<img src="${esc(u.logo)}" alt="">` : icon(u.icon || u.slug)}</span><span><b>${esc(u.name)}</b><small>${esc(u.tagline || '')}</small></span></a>`;
  const act = (p) => (page === p ? ' class="active"' : '');

  $('#site-header').innerHTML = `
  <div class="topbar"><div class="wrap">
    <div class="tb-left">
      ${s.email ? `<a href="mailto:${esc(s.email)}">${icon('mail')}${esc(s.email)}</a>` : ''}
      ${s.phone ? `<a href="tel:${esc(s.phone)}">${icon('phone')}${esc(s.phone)}</a>` : ''}
    </div>
    <div class="tb-right"><div class="social">${socialLinks(s)}</div><a class="login" href="/admin/">${icon('login')}Masuk</a></div>
  </div></div>
  <header class="site-header"><div class="wrap">
    <a class="brand" href="/" aria-label="Beranda ${esc(s.school_name)}">
      <img src="/assets/img/emblem-smkn8.png" alt="Logo SMKN 8 Surabaya" width="50" height="45">
      <span class="brand-text"><b>SMK Negeri 8</b><span>Surabaya</span></span>
    </a>
    <nav class="nav" id="nav" aria-label="Menu utama">
      <button class="nav-toggle nav-close" aria-label="Tutup menu">${icon('x')}</button>
      <a href="/"${act('home')}>Beranda</a>
      <a href="/profil"${act('profil')}>Profil</a>
      <div class="dd"><button aria-haspopup="true">Program Keahlian ${icon('chev')}</button><div class="dd-panel">${jur.map(ddItem).join('')}</div></div>
      <div class="dd"><button aria-haspopup="true">Lembaga ${icon('chev')}</button><div class="dd-panel">${lem.map(ddItem).join('')}</div></div>
      ${tefa.length ? `<div class="dd"><button aria-haspopup="true">TEFA ${icon('chev')}</button><div class="dd-panel">${tefa.map(ddItem).join('')}</div></div>` : ''}
      <a href="/berita"${act('berita')}>Berita</a>
      <a href="/agenda"${act('agenda')}>Agenda</a>
      <a href="/galeri"${act('galeri')}>Galeri</a>
      <a href="/kontak"${act('kontak')}>Kontak</a>
    </nav>
    <button class="nav-toggle" id="navOpen" aria-label="Buka menu">${icon('menu')}</button>
  </div></header><div class="scrim" id="scrim"></div>`;

  const nav = $('#nav'), scrim = $('#scrim');
  const close = () => { nav.classList.remove('open'); scrim.classList.remove('on'); };
  $('#navOpen').onclick = () => { nav.classList.add('open'); scrim.classList.add('on'); };
  $('.nav-close').onclick = close; scrim.onclick = close;
  $$('.dd > button').forEach((b) => b.addEventListener('click', () => {
    const dd = b.parentElement; const was = dd.classList.contains('open');
    $$('.dd').forEach((x) => x.classList.remove('open')); if (!was) dd.classList.add('open');
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.dd')) $$('.dd').forEach((x) => x.classList.remove('open')); });

  $('#site-footer').innerHTML = `
  <div class="foot-line"></div>
  <footer class="site-footer"><div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="foot-brand"><img src="/assets/img/emblem-smkn8.png" alt=""><div><b>${esc(s.school_name)}</b><span class="mono">${esc(s.tagline || '')}</span></div></div>
        <div class="contact-list">
          ${s.address ? `<div>${icon('pin')}<span>${esc(s.address)}</span></div>` : ''}
          ${s.email ? `<a href="mailto:${esc(s.email)}">${icon('mail')}${esc(s.email)}</a>` : ''}
          ${s.phone ? `<a href="tel:${esc(s.phone)}">${icon('phone')}${esc(s.phone)}</a>` : ''}
        </div>
        <div class="socials">${socialLinks(s)}</div>
      </div>
      <div><h4>Program Keahlian</h4><ul>${jur.map((u) => `<li><a href="${unitUrl(u)}">${esc(u.name)}</a></li>`).join('')}</ul></div>
      <div><h4>Lembaga & Layanan</h4><ul>${lem.map((u) => `<li><a href="${unitUrl(u)}">${esc(u.name)}</a></li>`).join('')}
        ${s.spmb_link ? `<li><a href="${esc(safeUrl(s.spmb_link))}" target="_blank" rel="noopener">Info SPMB / PPDB</a></li>` : ''}</ul></div>
      ${tefa.length ? `<div><h4>Teaching Factory</h4><ul>${tefa.map((u) => `<li><a href="${unitUrl(u)}">${esc(u.name)}</a></li>`).join('')}</ul></div>` : ''}
      <div><h4>Jelajahi</h4><ul>
        <li><a href="/profil">Profil Sekolah</a></li><li><a href="/berita">Berita & Kegiatan</a></li>
        <li><a href="/agenda">Agenda</a></li><li><a href="/galeri">Galeri</a></li><li><a href="/kontak">Kontak</a></li>
        <li><a href="/admin/">Login Pengelola</a></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(s.school_name)}. Hak cipta dilindungi.</span>
      <span>${[s.instagram && `IG @${esc(s.instagram)}`, s.facebook && `FB @${esc(s.facebook)}`, s.youtube && `YouTube ${esc(ytName(s))}`].filter(Boolean).join(' · ')}</span></div>
  </div></footer>
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true"><button aria-label="Tutup">${icon('x')}</button><div><img alt=""><p></p></div></div>`;

  const lb = $('#lightbox');
  lb.onclick = (e) => { if (e.target === lb || e.target.closest('button')) lb.classList.remove('open'); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { lb.classList.remove('open'); close(); } });
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-lightbox]'); if (!f) return;
    e.preventDefault(); $('img', lb).src = f.dataset.lightbox; $('p', lb).textContent = f.dataset.caption || ''; lb.classList.add('open');
  });
}

const setTitle = (t) => { document.title = t ? `${t} — ${SITE.settings.school_short}` : `${SITE.settings.school_name} — ${SITE.settings.tagline}`; };
const pageHero = (title, sub, crumbs = []) => `
  <section class="page-hero"><div class="wrap">
    <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Beranda</a>${crumbs.map((c) => `<span>${c}</span>`).join('')}</nav>
    <h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}
  </div><div class="bar"></div></section>`;

// Siluet gedung kota (dibuat acak tetapi konsisten)
function skyline() {
  let seed = 8; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const layer = (base, minH, maxH, fill, wMin, wMax) => {
    let x = 0, out = '';
    while (x < 1440) {
      const w = Math.round(wMin + rnd() * (wMax - wMin)), h = Math.round(minH + rnd() * (maxH - minH));
      out += `<rect x="${x}" y="${150 - h}" width="${w + 1}" height="${h}"/>`;
      if (rnd() > .8) out += `<rect x="${x + Math.round(w / 2) - 2}" y="${150 - h - 24}" width="4" height="24"/>`;
      x += w;
    }
    return `<g fill="${fill}">${out}</g>`;
  };
  return `<svg viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
    ${layer(0, 50, 120, 'rgba(58,120,201,.16)', 30, 70)}
    ${layer(0, 30, 90, 'rgba(35,91,164,.32)', 40, 90)}
    ${layer(0, 14, 56, '#0a1525', 50, 120)}</svg>`;
}

// =============================================================
//  HALAMAN
// =============================================================
const PAGES = {};

// ---------- Video YouTube & Instagram (otomatis) ----------
const relTime = (iso) => fmtDate(iso, { day: 'numeric', month: 'short', year: 'numeric' });
const ytThumb = (v) => `<span class="yt-thumb"><img src="${esc(v.thumb)}" alt="" loading="lazy"><span class="yt-play" aria-hidden="true"><svg viewBox="0 0 68 48"><path d="M66.5 7.7A8.5 8.5 0 0 0 60.5 1.7C55.2.3 34 .3 34 .3S12.8.3 7.5 1.7a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6c5.3 1.4 26.5 1.4 26.5 1.4s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00"/><path d="M45 24L27 14v20z" fill="#fff"/></svg></span>${v.short ? '<span class="yt-badge">Shorts</span>' : ''}</span>`;
const ytEmbed = (id) => `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
const ytCard = (v) => `<div class="yt-card"><button class="yt-frame" data-yt="${esc(v.id)}" aria-label="Putar: ${esc(v.title)}">${ytThumb(v)}</button>
  <a class="yt-title" href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a><span class="yt-meta">${relTime(v.published)}${v.views ? ` · ${v.views.toLocaleString('id-ID')}× ditonton` : ''}</span></div>`;
// Klik thumbnail -> putar video di tempat (video baru dimuat saat diklik, agar halaman tetap ringan)
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-yt]'); if (!b) return;
  e.preventDefault();
  const target = b.dataset.ytTarget ? document.getElementById(b.dataset.ytTarget) : b;
  if (b.dataset.ytTarget) { target.innerHTML = ytEmbed(b.dataset.yt); target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  else b.outerHTML = `<div class="yt-frame playing">${ytEmbed(b.dataset.yt)}</div>`;
});

async function renderYouTube(box, { limit = 5, layout = 'feature' } = {}) {
  const s = SITE.settings;
  const d = await api('feeds/youtube').catch(() => ({ items: [] }));
  const items = (d.items || []).slice(0, limit);
  if (!items.length && d.channelId) {
    // Cadangan: pemutar playlist "Uploads" resmi YouTube — selalu berisi video terbaru kanal
    const list = 'UU' + d.channelId.slice(2);
    box.innerHTML = `<div class="yt-frame yt-playlist"><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}&rel=0" title="Video terbaru ${esc(ytName(s))}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
      <p class="yt-meta" style="margin-top:12px">Daftar putar video terbaru · klik ikon daftar di pojok kanan atas pemutar untuk memilih video lain.</p>`;
    if (layout === 'grid') box.querySelector('.yt-frame').style.maxWidth = '900px';
    return;
  }
  if (!items.length) {
    box.innerHTML = `<div class="social-cta">${icon('youtube')}<div><b>Tonton video kegiatan kami</b><span>Kanal YouTube ${esc(ytName(s))}</span></div><a class="btn btn-orange" href="${esc(ytUrl(s.youtube))}" target="_blank" rel="noopener">Buka YouTube ${icon('arrowUR')}</a></div>`;
    return;
  }
  if (layout === 'grid') { box.innerHTML = `<div class="yt-grid">${items.map(ytCard).join('')}</div>`; return; }
  const [first, ...rest] = items;
  box.innerHTML = `<div class="yt-layout">
    <div class="yt-main"><div class="yt-frame" id="ytStage"><button class="yt-frame" data-yt="${esc(first.id)}" aria-label="Putar: ${esc(first.title)}">${ytThumb(first)}</button></div>
      <h3 id="ytStageTitle">${esc(first.title)}</h3><span class="yt-meta" id="ytStageMeta">${relTime(first.published)}</span></div>
    <div class="yt-list">${rest.map((v) => `<button class="yt-item" data-yt="${esc(v.id)}" data-yt-target="ytStage" data-title="${esc(v.title)}" data-date="${esc(relTime(v.published))}">${ytThumb(v)}<span><b>${esc(v.title)}</b><small>${relTime(v.published)}</small></span></button>`).join('')}</div>
  </div>`;
  box.querySelectorAll('.yt-item').forEach((b) => b.addEventListener('click', () => {
    $('#ytStageTitle').textContent = b.dataset.title; $('#ytStageMeta').textContent = b.dataset.date;
  }));
}

async function renderInstagram(box) {
  const s = SITE.settings, handle = s.instagram;
  const follow = `<a class="btn btn-dark" href="https://instagram.com/${esc(handle)}" target="_blank" rel="noopener">${icon('instagram')} Ikuti @${esc(handle)}</a>`;
  const d = s.ig_connected ? await api('feeds/instagram').catch(() => ({ items: [] })) : { items: [] };
  if (d.items && d.items.length) {
    box.innerHTML = `<div class="ig-grid">${d.items.slice(0, 12).map((m) => `<a class="ig-tile" href="${esc(safeUrl(m.permalink))}" target="_blank" rel="noopener">
      <img src="${/(cdninstagram\.com|fbcdn\.net)\//.test(m.image) ? '/api/feeds/ig-img?u=' + encodeURIComponent(m.image) : esc(m.image)}" alt="${esc(m.caption.slice(0, 120))}" loading="lazy">
      ${m.type === 'VIDEO' ? `<span class="ig-type">${icon('youtube')}</span>` : m.type === 'CAROUSEL_ALBUM' ? `<span class="ig-type">${icon('image')}</span>` : ''}
      <span class="ig-cap">${esc(m.caption.slice(0, 140))}</span></a>`).join('')}</div><p class="ig-foot">${follow}</p>`;
    return;
  }
  const manual = lines(s.ig_posts).filter((u) => /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(u)).slice(0, 6);
  if (manual.length) {
    box.innerHTML = `<div class="ig-embeds">${manual.map((u) => `<blockquote class="instagram-media" data-instgrm-permalink="${esc(u.split('?')[0])}" data-instgrm-version="14"><a href="${esc(u)}" target="_blank" rel="noopener">Lihat postingan di Instagram</a></blockquote>`).join('')}</div><p class="ig-foot">${follow}</p>`;
    if (window.instgrm) window.instgrm.Embeds.process();
    else { const sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.instagram.com/embed.js'; document.body.appendChild(sc); }
    return;
  }
  box.innerHTML = `<div class="social-cta ig">${icon('instagram')}<div><b>Ikuti kegiatan terbaru kami</b><span>Instagram @${esc(handle)}</span></div>${follow}</div>`;
}

// ---------- Beranda ----------
PAGES.home = async (main) => {
  const s = SITE.settings; setTitle('');
  const units = Object.values(UNITS);
  const jur = units.filter((u) => u.type === 'jurusan'), lem = units.filter((u) => u.type === 'lembaga'), tefa = units.filter((u) => u.type === 'tefa');
  const title = esc(s.hero_title || '').replace(/,\s*(.+)$/, ',<br><em>$1</em>');
  const pos = ['left:0;top:10%', 'right:0;top:2%', 'right:-2%;top:50%', 'right:8%;top:88%', 'left:0;top:74%'];
  const ticker = [s.running_text, ...jur.map((u) => u.name), ...lem.map((u) => u.short), ...tefa.map((u) => u.name)].filter(Boolean);
  const stats = [
    [jur.length, 'Program keahlian'], [tefa.length || '', 'Teaching Factory'], ['P1', 'Lembaga Sertifikasi Profesi'], ['BKK', 'Layanan bursa kerja khusus'],
    [s.stat_siswa, 'Peserta didik'], [s.stat_guru, 'Guru & tenaga kependidikan'], [s.stat_mitra, 'Mitra industri'], [s.stat_alumni, 'Lulusan terserap kerja'],
  ].filter(([v]) => v !== '' && v != null);

  main.innerHTML = `
  <section class="hero${s.hero_image ? ' has-photo' : ''}" ${s.hero_image ? `style="--hero-img:url('${esc(s.hero_image)}')"` : ''}>
    <div class="wrap">
      <div>
        <div class="hero-kicker mono">${esc(s.school_name)} · ${esc(s.tagline || '')}</div>
        <h1>${title}</h1>
        <p class="lead">${esc(s.hero_subtitle)}</p>
        <div class="hero-actions">
          <a class="btn btn-orange" href="#program">Jelajahi Program Keahlian ${icon('arrow')}</a>
          <a class="btn btn-ghost" href="/lembaga/bkk">Lowongan Kerja BKK</a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="orbit o2"></div><div class="orbit"></div><div class="orbit o3"></div>
        <div class="emblem"><img src="/assets/img/emblem-smkn8.png" alt=""></div>
        ${jur.map((u, i) => `<a class="orbit-chip" tabindex="-1" href="${unitUrl(u)}" style="--c:${u.color};${pos[i % 5]}"><i>${icon(u.icon || u.slug)}</i>${esc((n => n.length > 16 ? u.short : n)(u.name.split('/')[0].trim()))}</a>`).join('')}
      </div>
    </div>
    <div class="skyline">${skyline()}</div>
  </section>
  <div class="ticker" aria-hidden="true"><div class="ticker-track">${[0, 1].map(() => `<span>${ticker.map((t) => `<span>${esc(t)}</span>`).join('')}</span>`).join('')}</div></div>

  <section class="section" id="program"><div class="wrap">
    ${secHead('01', 'Program Keahlian', 'Lima keahlian,<br>satu kota kreatif', 'Setiap program keahlian punya laboratorium, kegiatan, dan halaman sendiri. Pilih untuk melihat profil, kompetensi, kegiatan, dan galerinya.')}
    <div class="prog-grid">${jur.map((u, i) => `
      <a class="prog" href="${unitUrl(u)}" style="--c:${u.color}">
        <span class="num">${String(i + 1).padStart(2, '0')} / ${String(jur.length).padStart(2, '0')}</span>
        <span class="go">${icon('arrow')}</span>
        <span class="p-ico">${unitMark(u)}</span>
        <h3>${esc(u.name)}</h3><p>${esc(u.tagline || '')}</p>
      </a>`).join('')}</div>
    <div class="lembaga-grid">${lem.map((u) => `
      <a class="lembaga-card" href="${unitUrl(u)}" style="--c:${u.color}">
        <span class="lg">${unitMark(u)}</span>
        <span><span class="mono" style="color:var(--c)">Lembaga</span><h3>${esc(u.name)}</h3><p>${esc(u.tagline || '')}</p></span>
        <span class="count">${u.slug === 'bkk' ? SITE.counts.lowongan : u.slug === 'lsp' ? SITE.counts.skema : ''}<small>${u.slug === 'bkk' ? 'Lowongan aktif' : u.slug === 'lsp' ? 'Skema' : ''}</small></span>
      </a>`).join('')}</div>
  </div></section>

  <section class="section dark" style="padding:56px 0"><div class="wrap">
    <div class="sec-label mono"><b>02</b>Sekilas</div>
    <div class="stats">${stats.map(([v, l]) => `<div class="stat"><b>${esc(v)}${/^\d+$/.test(String(v)) && l.includes('terserap') ? '<sup>%</sup>' : ''}</b><span>${esc(l)}</span></div>`).join('')}</div>
  </div></section>

  ${tefa.length ? `<section class="section tefa-sec"><div class="wrap">
    ${secHead('03', 'Teaching Factory', 'Belajar sambil<br>berproduksi', 'Setiap program keahlian punya TEFA — unit produksi dan jasa sungguhan yang melayani masyarakat dan industri.')}
    <div class="tefa-grid">${tefa.map((u) => `
      <a class="tefa-card" href="${unitUrl(u)}" style="--c:${u.color}">
        <span class="t-ico">${unitMark(u)}</span>
        <span class="mono">TEFA · ${esc(UNITS[u.parent]?.short || '')}</span>
        <h3>${esc(u.name.replace(/^TEFA\s*/i, ''))}</h3><p>${esc(u.tagline || '')}</p>
        <span class="t-go">Produk & layanan ${icon('arrow')}</span>
      </a>`).join('')}</div>
  </div></section>` : ''}

  <section class="section alt"><div class="wrap greet">
    <div class="greet-photo">${s.principal_photo ? `<img src="${esc(s.principal_photo)}" alt="${esc(s.principal_name)}">` : `<div class="ph"><img src="/assets/img/emblem-smkn8.png" alt=""></div>`}</div>
    <div>
      ${secHead('04', 'Sambutan', 'Sambutan Kepala Sekolah')}
      <blockquote>${esc(s.principal_message)}</blockquote>
      <div class="who"><b>${esc(s.principal_name || 'Kepala Sekolah')}</b><span>${esc(s.principal_title || '')}</span></div>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    ${secHead('05', 'Kabar Terbaru', 'Berita & Kegiatan', '', `<a class="link-arrow" href="/berita">Semua berita ${icon('arrow')}</a>`)}
    <div class="news-grid" id="homeNews">${'<div class="skel" style="height:320px"></div>'.repeat(3)}</div>
  </div></section>

  ${s.show_youtube !== '0' && s.youtube ? `<section class="section dark yt-sec"><div class="wrap">
    ${secHead('06', 'SMKN 8 TV', 'Video Terbaru', `Otomatis dari kanal YouTube ${ytName(s)}.`, `<a class="link-arrow" href="${esc(ytUrl(s.youtube))}" target="_blank" rel="noopener">Kunjungi kanal ${icon('arrowUR')}</a>`)}
    <div id="homeYT"><div class="skel" style="height:360px;opacity:.15"></div></div>
  </div></section>` : ''}

  ${s.show_instagram !== '0' && s.instagram ? `<section class="section alt"><div class="wrap">
    ${secHead('07', 'Instagram', '@' + esc(s.instagram), 'Momen terbaru dari akun Instagram resmi sekolah.')}
    <div id="homeIG"></div>
  </div></section>` : ''}

  <section class="section dark"><div class="wrap">
    ${secHead('08', 'Karier & Sertifikasi', 'Siap kerja,<br>tersertifikasi', 'Bursa Kerja Khusus menghubungkan lulusan dengan industri, LSP P1 memastikan kompetensinya diakui.')}
    <div class="duo" id="homeDuo"></div>
  </div></section>

  <section class="section alt"><div class="wrap">
    <div class="duo" style="grid-template-columns:1fr 1fr;align-items:start">
      <div>${secHead('09', 'Agenda', 'Agenda Terdekat', '', `<a class="link-arrow" href="/agenda">Semua agenda ${icon('arrow')}</a>`)}<div class="agenda-list" id="homeAgenda"></div></div>
      <div>${secHead('10', 'Galeri', 'Potret Kegiatan', '', `<a class="link-arrow" href="/galeri">Galeri ${icon('arrow')}</a>`)}<div class="gal-strip" id="homeGal" style="grid-template-columns:repeat(3,1fr)"></div></div>
    </div>
  </div></section>

  <section class="cta-band"><div class="wrap">
    <h2>Tertarik bergabung di ${esc(s.school_short)}?</h2>
    <div class="hero-actions">
      ${s.spmb_link ? `<a class="btn btn-orange" href="${esc(safeUrl(s.spmb_link))}" target="_blank" rel="noopener">Info SPMB ${icon('arrowUR')}</a>` : ''}
      <a class="btn btn-ghost" href="/kontak">Hubungi Kami</a>
    </div>
  </div></section>`;

  if ($('#homeYT')) renderYouTube($('#homeYT'));
  if ($('#homeIG')) renderInstagram($('#homeIG'));
  const [news, agenda, gal, low, sk] = await Promise.all([
    api('posts?limit=6'), api('agenda?upcoming=1&limit=4'), api('gallery?limit=6'), api('lowongan?status=buka&limit=4'), api('skema'),
  ]).catch(() => [{ items: [] }, { items: [] }, { items: [] }, { items: [] }, { items: [] }]);
  $('#homeNews').innerHTML = news.items.length ? news.items.map((p, i) => postCard(p, i === 0)).join('') : empty('Belum ada berita.');
  $('#homeAgenda').innerHTML = agenda.items.length ? agenda.items.map((a) => agendaItem(a)).join('') : empty('Belum ada agenda terdekat.');
  $('#homeGal').innerHTML = gal.items.length ? gal.items.map((g) => `<a href="${esc(g.image)}" data-lightbox="${esc(g.image)}" data-caption="${esc(g.caption || '')}"><img src="${esc(g.image)}" alt="${esc(g.caption || 'Foto kegiatan')}" loading="lazy"></a>`).join('') : `<div style="grid-column:1/-1">${empty('Foto kegiatan akan tampil di sini.')}</div>`;
  const bkk = UNITS.bkk, lsp = UNITS.lsp;
  $('#homeDuo').innerHTML = `
    ${bkk ? `<div class="panel" style="--c:${bkk.color}">
      <div class="panel-head"><span class="lg">${unitMark(bkk)}</span><div><h3>Lowongan Terbaru</h3><p>${esc(bkk.name)}</p></div></div>
      ${low.items.length ? low.items.map((j) => `<a class="job" href="/lembaga/bkk#lowongan"><b>${esc(j.position)}</b><span class="dl">${j.deadline ? 'Tutup<br>' + fmtDate(j.deadline, { day: 'numeric', month: 'short' }) : esc(j.job_type || '')}</span><span class="co">${esc(j.company)}${j.location ? ' · ' + esc(j.location) : ''}</span></a>`).join('') : empty('Belum ada lowongan aktif.')}
      <p style="margin:18px 0 0"><a class="link-arrow" href="/lembaga/bkk">Buka halaman BKK ${icon('arrow')}</a></p></div>` : ''}
    ${lsp ? `<div class="panel" style="--c:${lsp.color}">
      <div class="panel-head"><span class="lg">${unitMark(lsp)}</span><div><h3>Skema Sertifikasi</h3><p>${esc(lsp.name)}</p></div></div>
      ${sk.items.length ? sk.items.slice(0, 5).map((k) => `<div class="skema-row"><span>${esc(k.name)}<br><code>${esc(k.code || '')}</code></span>${k.major && UNITS[k.major] ? unitBadge(k.major) : ''}</div>`).join('') : empty('Daftar skema sertifikasi akan tampil di sini.')}
      <p style="margin:18px 0 0"><a class="link-arrow" href="/lembaga/lsp">Buka halaman LSP ${icon('arrow')}</a></p></div>` : ''}`;
};

// ---------- Profil ----------
PAGES.profil = async (main) => {
  const s = SITE.settings; setTitle('Profil Sekolah');
  const units = Object.values(UNITS);
  const ident = [['Nama sekolah', s.school_name], ['NPSN', s.npsn], ['Akreditasi', s.akreditasi], ['Alamat', s.address], ['Email', s.email], ['Telepon', s.phone]].filter(([, v]) => v);
  main.innerHTML = `${pageHero('Profil Sekolah', s.tagline, ['Profil'])}
  <section class="section alt"><div class="wrap greet">
    <div class="greet-photo">${s.principal_photo ? `<img src="${esc(s.principal_photo)}" alt="${esc(s.principal_name)}">` : `<div class="ph"><img src="/assets/img/emblem-smkn8.png" alt=""></div>`}</div>
    <div>${secHead('01', 'Sambutan', 'Sambutan Kepala Sekolah')}
      <blockquote>${esc(s.principal_message)}</blockquote>
      <div class="who"><b>${esc(s.principal_name || 'Kepala Sekolah')}</b><span>${esc(s.principal_title || '')}</span></div></div>
  </div></section>
  <section class="section"><div class="wrap unit-layout" style="--unit:var(--orange)">
    <div>
      <div class="unit-block" id="sejarah"><h2>Sejarah Singkat</h2><div class="prose"><p>${esc(s.sejarah)}</p></div></div>
      <div class="unit-block" id="visi"><h2>Visi & Misi</h2>
        <div class="vm"><div><h4>Visi</h4><p class="prose" style="margin:0">${esc(s.visi)}</p></div>
        <div><h4>Misi</h4><ol>${lines(s.misi).map((m) => `<li>${esc(m)}</li>`).join('')}</ol></div></div></div>
    </div>
    <aside>
      <div class="side-card"><h4>Identitas Sekolah</h4><div class="contact-list">${ident.map(([k, v]) => `<div><span style="min-width:96px;color:var(--muted)">${k}</span><b style="font-weight:600">${esc(v)}</b></div>`).join('')}</div></div>
      <div class="side-card"><h4>Unit di SMKN 8 Surabaya</h4><div class="other-units">${units.map((u) => `<a href="${unitUrl(u)}" style="--c:${u.color}"><i>${icon(u.icon || u.slug)}</i>${esc(u.name)}</a>`).join('')}</div></div>
    </aside>
  </div></section>`;
};

// ---------- Halaman Jurusan / Lembaga ----------
PAGES.unit = async (main) => {
  const segs = location.pathname.split('/').filter(Boolean);
  const slug = params.get('u') || (segs[0] === 'tefa' ? 'tefa-' + segs.pop() : segs.pop());
  let unit;
  try { unit = (await api('units/' + encodeURIComponent(slug))).unit; } catch { return notFound(main); }
  setTitle(unit.name);
  document.body.style.setProperty('--unit', unit.color);
  const isJur = unit.type === 'jurusan', isTefa = unit.type === 'tefa', isBKK = slug === 'bkk', isLSP = slug === 'lsp';
  const parent = isTefa ? UNITS[unit.parent] : null;
  const myTefa = isJur ? Object.values(UNITS).find((u) => u.type === 'tefa' && u.parent === slug) : null;
  const tabs = [['profil', 'Profil'], [isLSP ? 'skema' : isBKK ? 'lowongan' : isTefa ? 'layanan' : 'kompetensi', isLSP ? 'Skema Sertifikasi' : isBKK ? 'Lowongan Kerja' : isTefa ? 'Produk & Layanan' : 'Kompetensi'],
    ['kegiatan', 'Kegiatan'], ['agenda', 'Agenda'], ['galeri', 'Galeri']];
  const others = Object.values(UNITS).filter((u) => u.slug !== slug);
  const komp = lines(unit.kompetensi), prospek = lines(unit.prospek);

  main.innerHTML = `
  <section class="page-hero unit-hero${unit.cover ? ' has-photo' : ''}" ${unit.cover ? `style="--hero-img:url('${esc(unit.cover)}')"` : ''}><div class="wrap">
    <div class="unit-logo">${unitMark(unit)}</div>
    <div>
      <nav class="crumbs mono"><a href="/">Beranda</a><span>${TYPE_LABEL[unit.type] || 'Unit'}</span><span>${esc(unit.short || unit.name)}</span></nav>
      <span class="unit-type mono">${TYPE_LABEL[unit.type] || 'Unit'}</span>${parent ? ` <a class="unit-type mono" style="background:rgba(255,255,255,.12)" href="${unitUrl(parent)}">${esc(parent.name)} →</a>` : ''}
      <h1>${esc(unit.name)}</h1>${unit.tagline ? `<p>${esc(unit.tagline)}</p>` : ''}
    </div>
  </div><div class="bar"></div></section>
  <nav class="subnav"><div class="wrap">${tabs.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</div></nav>
  <section class="section" style="padding-top:48px"><div class="wrap unit-layout">
    <div>
      <div class="unit-block" id="profil"><h2>Profil</h2><div class="prose"><p>${esc(unit.description || 'Profil belum diisi.')}</p></div>
        ${unit.visi || unit.misi ? `<div class="vm" style="margin-top:20px">${unit.visi ? `<div><h4>Visi</h4><p style="margin:0">${esc(unit.visi)}</p></div>` : ''}${unit.misi ? `<div><h4>Misi</h4><ol>${lines(unit.misi).map((m) => `<li>${esc(m)}</li>`).join('')}</ol></div>` : ''}</div>` : ''}
      </div>
      ${isBKK ? `<div class="unit-block" id="lowongan"><h2>Lowongan Kerja</h2><div class="filters" id="jobFilter"></div><div id="jobs"></div></div>
                 <div class="unit-block"><h2>Layanan BKK</h2><div class="check-grid">${komp.map((k, i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(k)}</div>`).join('')}</div></div>` : ''}
      ${isLSP ? `<div class="unit-block" id="skema"><h2>Skema Sertifikasi</h2><div id="skemaList"></div></div>
                 <div class="unit-block"><h2>Layanan LSP</h2><div class="check-grid">${komp.map((k, i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(k)}</div>`).join('')}</div></div>` : ''}
      ${isTefa ? `<div class="unit-block" id="layanan"><h2>Produk & Layanan</h2><div class="svc-grid">${komp.map((k, i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(k)}</b></div>`).join('') || empty('Belum diisi.')}</div>
        ${unit.phone ? `<div class="order-band"><div><b>Ingin memesan atau reservasi?</b><span>Hubungi ${esc(unit.name)} melalui WhatsApp.</span></div><a class="btn btn-orange" href="${waLink(unit.phone)}?text=${encodeURIComponent('Halo ' + unit.name + ' SMKN 8 Surabaya, saya ingin bertanya/memesan:')}" target="_blank" rel="noopener">${icon('wa')} Pesan via WhatsApp</a></div>` : ''}</div>` : ''}
      ${isJur ? `<div class="unit-block" id="kompetensi"><h2>Kompetensi yang Dipelajari</h2><div class="check-grid">${komp.map((k, i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(k)}</div>`).join('') || empty('Belum diisi.')}</div>
        ${prospek.length ? `<h3 class="mono" style="margin:28px 0 12px;color:var(--muted)">Prospek karier lulusan</h3><div class="pill-list">${prospek.map((p) => `<span>${esc(p)}</span>`).join('')}</div>` : ''}
        <div id="jurLinks"></div></div>` : ''}
      <div class="unit-block" id="kegiatan"><h2>Kegiatan & Berita</h2><div class="news-grid" style="grid-template-columns:repeat(2,1fr)" id="unitNews"></div>
        <p style="margin-top:20px"><a class="link-arrow" href="/berita?unit=${esc(slug)}">Semua berita ${esc(unit.short || unit.name)} ${icon('arrow')}</a></p></div>
      <div class="unit-block" id="agenda"><h2>Agenda</h2><div class="agenda-list" id="unitAgenda"></div></div>
      <div class="unit-block" id="galeri"><h2>Galeri</h2><div class="gal-grid" id="unitGal" style="columns:3 180px"></div></div>
    </div>
    <aside>
      ${myTefa ? `<a class="side-card tefa-link" href="${unitUrl(myTefa)}" style="--c:${myTefa.color}"><h4>Teaching Factory</h4><span class="head-card"><span class="av">${icon('factory')}</span><span><b>${esc(myTefa.name)}</b><span>${esc(myTefa.tagline || '')}</span></span></span></a>` : ''}
      ${parent ? `<a class="side-card tefa-link" href="${unitUrl(parent)}" style="--c:${parent.color}"><h4>Program keahlian induk</h4><span class="head-card"><span class="av">${unitMark(parent)}</span><span><b>${esc(parent.name)}</b><span>Lihat program keahlian →</span></span></span></a>` : ''}
      ${unit.head_name ? `<div class="side-card"><h4>${isJur ? 'Ketua Program Keahlian' : isTefa ? 'Manajer TEFA' : 'Penanggung Jawab'}</h4><div class="head-card"><span class="av">${unit.head_photo ? `<img src="${esc(unit.head_photo)}" alt="">` : esc(unit.head_name.trim()[0] || '?')}</span><span><b>${esc(unit.head_name)}</b><span>${esc(unit.head_title || '')}</span></span></div></div>` : ''}
      <div class="side-card"><h4>Kontak ${esc(unit.short || '')}</h4><div class="contact-list">
        ${unit.phone ? `<a href="${waLink(unit.phone)}" target="_blank" rel="noopener">${icon('wa')}${esc(unit.phone)}</a>` : ''}
        ${unit.email ? `<a href="mailto:${esc(unit.email)}">${icon('mail')}${esc(unit.email)}</a>` : ''}
        ${unit.instagram ? `<a href="https://instagram.com/${esc(unit.instagram.replace('@', ''))}" target="_blank" rel="noopener">${icon('instagram')}@${esc(unit.instagram.replace('@', ''))}</a>` : ''}
        <a href="mailto:${esc(SITE.settings.email)}">${icon('mail')}${esc(SITE.settings.email)}</a>
        <div>${icon('pin')}<span>${esc(SITE.settings.address)}</span></div>
      </div></div>
      <div class="side-card"><h4>Unit lainnya</h4><div class="other-units">${others.map((u) => `<a href="${unitUrl(u)}" style="--c:${u.color}"><i>${icon(u.icon || u.slug)}</i>${esc(u.name)}</a>`).join('')}</div></div>
    </aside>
  </div></section>`;

  // Penanda tab aktif saat menggulir
  const links = $$('.subnav a');
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.hash === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  $$('.unit-block[id]').forEach((b) => io.observe(b));

  const [news, agenda, gal] = await Promise.all([api(`posts?unit=${slug}&limit=4`), api(`agenda?unit=${slug}&limit=8`), api(`gallery?unit=${slug}&limit=12`)]);
  $('#unitNews').innerHTML = news.items.length ? news.items.map((p) => postCard(p)).join('') : `<div style="grid-column:1/-1">${empty('Belum ada kegiatan yang dipublikasikan.')}</div>`;
  $('#unitAgenda').innerHTML = agenda.items.length ? agenda.items.map((a) => agendaItem(a, (a.end_date || a.date) < agenda.today)).join('') : empty('Belum ada agenda.');
  $('#unitGal').innerHTML = gal.items.length ? gal.items.map((g) => `<figure data-lightbox="${esc(g.image)}" data-caption="${esc(g.caption || '')}"><img src="${esc(g.image)}" alt="${esc(g.caption || '')}" loading="lazy">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('') : empty('Belum ada foto.');

  if (isBKK) {
    const jur = Object.values(UNITS).filter((u) => u.type === 'jurusan');
    let filter = '';
    const draw = async () => {
      const d = await api('lowongan?limit=100' + (filter ? '&major=' + filter : ''));
      $('#jobs').innerHTML = d.items.length ? d.items.map(jobCard).join('') : empty('Belum ada lowongan untuk filter ini.');
    };
    $('#jobFilter').innerHTML = [['', 'Semua jurusan', '#0d1a2e'], ...jur.map((u) => [u.slug, u.name, u.color])].map(([v, l, c]) => `<button class="chip-btn${v === filter ? ' on' : ''}" data-v="${v}"><span class="dot" style="--c:${c}"></span>${esc(l)}</button>`).join('');
    $('#jobFilter').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.v; $$('#jobFilter button').forEach((x) => x.classList.toggle('on', x === b)); draw(); };
    draw();
  }
  if (isLSP) {
    const d = await api('skema');
    $('#skemaList').innerHTML = d.items.length ? skemaTable(d.items) : empty('Daftar skema sertifikasi belum diisi.');
  }
  if (isJur) {
    const [sk, jb] = await Promise.all([api('skema?major=' + slug), api(`lowongan?status=buka&major=${slug}&limit=5`)]);
    let h = '';
    if (sk.items.length) h += `<h3 class="mono" style="margin:28px 0 12px;color:var(--muted)">Skema sertifikasi LSP untuk ${esc(unit.name)}</h3>${skemaTable(sk.items, true)}`;
    if (jb.items.length) h += `<h3 class="mono" style="margin:28px 0 12px;color:var(--muted)">Lowongan BKK yang relevan</h3>${jb.items.map(jobCard).join('')}`;
    $('#jurLinks').innerHTML = h;
  }
  if (location.hash) setTimeout(() => $(location.hash)?.scrollIntoView(), 50);
};

const jobCard = (j) => {
  const majors = String(j.majors || '').split(',').map((x) => x.trim()).filter((x) => UNITS[x]);
  const closed = j.status !== 'buka' || (j.deadline && j.deadline < new Date().toISOString().slice(0, 10));
  return `<div class="job-card${closed ? ' closed' : ''}">
    <div class="jl">${j.logo ? `<img src="${esc(j.logo)}" alt="">` : esc((j.company || '?').trim()[0])}</div>
    <div><h4>${esc(j.position)}</h4><div class="co">${esc(j.company)}${j.location ? ' · ' + esc(j.location) : ''}</div>
      <div class="meta" style="margin-top:8px"><span class="badge soft" style="--c:${closed ? '#888' : '#16966a'}">${closed ? 'Ditutup' : 'Dibuka'}</span>
        ${j.job_type ? `<span>${esc(j.job_type)}</span>` : ''}${j.deadline ? `<span>${icon('calendar')}Batas ${fmtDate(j.deadline)}</span>` : ''}
        ${majors.map((m) => unitBadge(m, true)).join('')}</div>
      ${j.description ? `<details><summary>Lihat detail</summary><div class="desc">${esc(j.description)}</div></details>` : ''}
    </div>
    <div>${j.apply_link && !closed ? `<a class="btn btn-dark btn-sm" href="${esc(safeUrl(j.apply_link))}" target="_blank" rel="noopener">Lamar ${icon('arrowUR')}</a>` : ''}</div>
  </div>`;
};
const skemaTable = (items, compact) => `<div class="table-wrap"><table class="skema-table"><thead><tr><th>Kode</th><th>Nama skema</th>${compact ? '' : '<th>Program keahlian</th>'}<th>Level</th><th>Unit</th></tr></thead><tbody>
  ${items.map((k) => `<tr><td><code>${esc(k.code || '-')}</code></td><td><b>${esc(k.name)}</b>${k.description ? `<br><small style="color:var(--muted)">${esc(k.description)}</small>` : ''}</td>
  ${compact ? '' : `<td>${k.major && UNITS[k.major] ? unitBadge(k.major, true) : '<span style="color:var(--muted)">Umum</span>'}</td>`}<td>${esc(k.level || '-')}</td><td>${k.units_count ?? '-'}</td></tr>`).join('')}
  </tbody></table></div>`;

// ---------- Daftar Berita ----------
PAGES.berita = async (main) => {
  setTitle('Berita & Kegiatan');
  let unit = params.get('unit') || '', cat = params.get('kategori') || '', q = params.get('q') || '', page = +params.get('page') || 1;
  const units = [SCHOOL_UNIT, ...Object.values(UNITS)];
  main.innerHTML = `${pageHero('Berita & Kegiatan', 'Kabar terbaru dari sekolah, program keahlian, LSP, dan BKK.', ['Berita'])}
  <section class="section" style="padding-top:48px"><div class="wrap">
    <div class="filters" id="fUnit"></div>
    <div class="filters" id="fCat" style="margin-top:-16px"></div>
    <div class="news-grid" id="list"></div><div class="pager" id="pager"></div>
  </div></section>`;
  const sync = () => {
    const p = new URLSearchParams(); if (unit) p.set('unit', unit); if (cat) p.set('kategori', cat); if (q) p.set('q', q); if (page > 1) p.set('page', page);
    history.replaceState(null, '', '/berita' + (p.toString() ? '?' + p : ''));
  };
  $('#fUnit').innerHTML = [['', 'Semua unit', '#0d1a2e'], ...units.map((u) => [u.slug, chipLabel(u), u.color])].map(([v, l, c]) => `<button class="chip-btn${v === unit ? ' on' : ''}" data-v="${v}"><span class="dot" style="--c:${c}"></span>${esc(l)}</button>`).join('');
  $('#fCat').innerHTML = [['', 'Semua kategori'], ...Object.entries(CATS)].map(([v, l]) => `<button class="chip-btn${v === cat ? ' on' : ''}" data-v="${v}">${esc(l)}</button>`).join('') +
    `<label class="search">${icon('search')}<input id="q" type="search" placeholder="Cari berita…" value="${esc(q)}" aria-label="Cari berita"></label>`;
  const load = async () => {
    sync(); $('#list').innerHTML = '<div class="skel" style="height:300px"></div>'.repeat(3);
    const d = await api(`posts?limit=9&page=${page}${unit ? '&unit=' + unit : ''}${cat ? '&category=' + cat : ''}${q ? '&q=' + encodeURIComponent(q) : ''}`);
    $('#list').innerHTML = d.items.length ? d.items.map((p) => postCard(p)).join('') : `<div style="grid-column:1/-1">${empty('Tidak ada berita yang cocok.')}</div>`;
    $('#pager').innerHTML = d.pages > 1 ? `<button ${page <= 1 ? 'disabled' : ''} data-p="${page - 1}">‹</button>${Array.from({ length: d.pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-p="${i + 1}">${i + 1}</button>`).join('')}<button ${page >= d.pages ? 'disabled' : ''} data-p="${page + 1}">›</button>` : '';
  };
  $('#fUnit').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; unit = b.dataset.v; page = 1; $$('#fUnit button').forEach((x) => x.classList.toggle('on', x === b)); load(); };
  $('#fCat').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.v; page = 1; $$('#fCat button').forEach((x) => x.classList.toggle('on', x === b)); load(); };
  let t; $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim(); page = 1; load(); }, 350); };
  $('#pager').onclick = (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; page = +b.dataset.p; load(); scrollTo({ top: 0, behavior: 'smooth' }); };
  load();
};

// ---------- Detail Berita ----------
PAGES.artikel = async (main) => {
  const slug = params.get('s') || location.pathname.split('/').filter(Boolean).pop();
  let d; try { d = await api('posts/' + encodeURIComponent(slug)); } catch { return notFound(main); }
  const p = d.post, u = unitOf(p.unit_slug);
  setTitle(p.title);
  document.body.style.setProperty('--unit', u.color);
  const url = location.origin + '/berita/' + p.slug;
  const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = p.excerpt || '';
  main.innerHTML = `
  <section class="page-hero"><div class="wrap">
    <nav class="crumbs mono"><a href="/">Beranda</a><span><a href="/berita">Berita</a></span><span><a href="${unitUrl(u)}">${esc(u.short || u.name)}</a></span></nav>
    <div class="meta" style="color:#c3cfe0;margin-bottom:16px">${unitBadge(p.unit_slug)}<span>${esc(CATS[p.category] || '')}</span></div>
    <h1 style="font-size:clamp(1.9rem,4.4vw,3.4rem);max-width:980px">${esc(p.title)}</h1>
    <div class="meta" style="color:#c3cfe0;margin-top:18px"><span>${icon('calendar')}${fmtDate(p.published_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      ${p.author_name ? `<span>${icon('user')}${esc(p.author_name)}</span>` : ''}<span>${icon('eye')}${(p.views || 0) + 1}× dibaca</span></div>
  </div><div class="bar"></div></section>
  <section class="section" style="padding-top:40px"><div class="wrap article-wrap">
    <article>
      ${p.cover ? `<div class="article-cover"><img src="${esc(p.cover)}" alt=""></div>` : ''}
      <div class="article-body">${sanitize(p.content)}</div>
      <div class="share"><span class="mono" style="color:var(--muted)">Bagikan</span>
        <a href="https://wa.me/?text=${encodeURIComponent(p.title + ' ' + url)}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">${icon('facebook')}Facebook</a>
        <button id="copy">${icon('link')}Salin tautan</button></div>
    </article>
    <aside>
      <div class="side-card" style="--c:${u.color}"><h4>Dipublikasikan oleh</h4>
        <a class="head-card" href="${unitUrl(u)}"><span class="av" style="background:${u.color}">${u.logo ? `<img src="${esc(u.logo)}" alt="" style="object-fit:contain;background:#fff">` : icon(u.icon || u.slug)}</span><span><b>${esc(u.name)}</b><span>Lihat halaman unit →</span></span></a></div>
      <div class="side-card related"><h4>Berita terkait</h4>${d.related.length ? d.related.map((r) => `<a href="/berita/${encodeURIComponent(r.slug)}"><span class="rt">${cover(r)}</span><span><b>${esc(r.title)}</b><small>${fmtDate(r.published_at)}</small></span></a>`).join('') : '<p style="color:var(--muted);font-size:.9rem;margin:0">Belum ada berita terkait.</p>'}</div>
    </aside>
  </div></section>`;
  $('#copy').onclick = async (e) => { try { await navigator.clipboard.writeText(url); e.currentTarget.lastChild.textContent = 'Tersalin!'; } catch { /* abaikan */ } };
};

// ---------- Agenda ----------
PAGES.agenda = async (main) => {
  setTitle('Agenda');
  let unit = params.get('unit') || '';
  const units = [SCHOOL_UNIT, ...Object.values(UNITS)];
  main.innerHTML = `${pageHero('Agenda', 'Jadwal kegiatan sekolah, program keahlian, dan lembaga.', ['Agenda'])}
  <section class="section" style="padding-top:48px"><div class="wrap">
    <div class="filters" id="fUnit"></div>
    <div class="duo" style="align-items:start"><div><h2 class="sec-title" style="font-size:1.8rem;margin-bottom:18px">Akan Datang</h2><div class="agenda-list" id="up"></div></div>
    <div><h2 class="sec-title" style="font-size:1.8rem;margin-bottom:18px;color:var(--muted)">Telah Berlalu</h2><div class="agenda-list" id="past"></div></div></div>
  </div></section>`;
  $('#fUnit').innerHTML = [['', 'Semua', '#0d1a2e'], ...units.map((u) => [u.slug, chipLabel(u), u.color])].map(([v, l, c]) => `<button class="chip-btn${v === unit ? ' on' : ''}" data-v="${v}"><span class="dot" style="--c:${c}"></span>${esc(l)}</button>`).join('');
  const load = async () => {
    const f = unit ? '&unit=' + unit : '';
    const [up, past] = await Promise.all([api('agenda?upcoming=1&limit=50' + f), api('agenda?past=1&limit=30' + f)]);
    $('#up').innerHTML = up.items.length ? up.items.map((a) => agendaItem(a)).join('') : empty('Belum ada agenda mendatang.');
    $('#past').innerHTML = past.items.length ? past.items.map((a) => agendaItem(a, true)).join('') : empty('Belum ada agenda.');
  };
  $('#fUnit').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; unit = b.dataset.v; $$('#fUnit button').forEach((x) => x.classList.toggle('on', x === b)); load(); };
  load();
};

// ---------- Galeri ----------
PAGES.galeri = async (main) => {
  setTitle('Galeri');
  let unit = params.get('unit') || '', page = 1;
  const units = [SCHOOL_UNIT, ...Object.values(UNITS)];
  const sset = SITE.settings;
  main.innerHTML = `${pageHero('Galeri', 'Foto dan video kegiatan, praktik, dan karya warga SMKN 8 Surabaya.', ['Galeri'])}
  ${sset.show_youtube !== '0' && sset.youtube ? `<section class="section dark yt-sec" style="padding:48px 0"><div class="wrap">
    <div class="sec-head" style="margin-bottom:24px"><div><div class="sec-label mono"><b>▶</b>YouTube</div><h2 class="sec-title" style="font-size:2rem">Video Terbaru</h2></div>
    <a class="link-arrow" href="${esc(ytUrl(sset.youtube))}" target="_blank" rel="noopener">${esc(ytName(sset))} ${icon('arrowUR')}</a></div>
    <div id="galYT"></div></div></section>` : ''}
  <section class="section" style="padding-top:48px"><div class="wrap">
    <h2 class="sec-title" style="font-size:2rem;margin-bottom:20px">Foto Kegiatan</h2>
    <div class="filters" id="fUnit"></div><div class="gal-grid" id="gal"></div>
    <div class="pager"><button class="btn btn-line" id="more" hidden>Muat lebih banyak</button></div>
  </div></section>`;
  if ($('#galYT')) renderYouTube($('#galYT'), { limit: 8, layout: 'grid' });
  $('#fUnit').innerHTML = [['', 'Semua', '#0d1a2e'], ...units.map((u) => [u.slug, chipLabel(u), u.color])].map(([v, l, c]) => `<button class="chip-btn${v === unit ? ' on' : ''}" data-v="${v}"><span class="dot" style="--c:${c}"></span>${esc(l)}</button>`).join('');
  const load = async (append) => {
    const d = await api(`gallery?limit=24&page=${page}${unit ? '&unit=' + unit : ''}`);
    const html = d.items.map((g) => `<figure data-lightbox="${esc(g.image)}" data-caption="${esc(g.caption || '')}"><img src="${esc(g.image)}" alt="${esc(g.caption || '')}" loading="lazy">${g.caption || g.unit_slug ? `<figcaption>${esc(g.caption || '')} <br>${esc(unitOf(g.unit_slug).name)}</figcaption>` : ''}</figure>`).join('');
    if (append) $('#gal').insertAdjacentHTML('beforeend', html); else $('#gal').innerHTML = html || empty('Belum ada foto.');
    $('#more').hidden = page >= d.pages;
  };
  $('#fUnit').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; unit = b.dataset.v; page = 1; $$('#fUnit button').forEach((x) => x.classList.toggle('on', x === b)); load(); };
  $('#more').onclick = () => { page++; load(true); };
  load();
};

// ---------- Kontak ----------
PAGES.kontak = async (main) => {
  const s = SITE.settings; setTitle('Kontak');
  const tiles = [
    ['pin', 'Alamat', esc(s.address)],
    s.email && ['mail', 'Email', `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`],
    s.phone && ['phone', 'Telepon', `<a href="tel:${esc(s.phone)}">${esc(s.phone)}</a>`],
    s.whatsapp && ['wa', 'WhatsApp', `<a href="${waLink(s.whatsapp)}" target="_blank" rel="noopener">${esc(s.whatsapp)}</a>`],
    s.instagram && ['instagram', 'Instagram', `<a href="https://instagram.com/${esc(s.instagram)}" target="_blank" rel="noopener">@${esc(s.instagram)}</a>`],
    s.facebook && ['facebook', 'Facebook', `<a href="https://facebook.com/${esc(s.facebook)}" target="_blank" rel="noopener">@${esc(s.facebook)}</a>`],
    s.youtube && ['youtube', 'YouTube', `<a href="${esc(ytUrl(s.youtube))}" target="_blank" rel="noopener">${esc(ytName(s))}</a>`],
  ].filter(Boolean);
  main.innerHTML = `${pageHero('Hubungi Kami', 'Ada pertanyaan seputar sekolah, program keahlian, sertifikasi, atau kerja sama industri? Kirim pesan kepada kami.', ['Kontak'])}
  <section class="section" style="padding-top:48px"><div class="wrap contact-grid">
    <div class="info-tiles">${tiles.map(([i, l, v]) => `<div class="info-tile"><span class="ic">${icon(i)}</span><div><b>${l}</b>${v}</div></div>`).join('')}</div>
    <form class="form side-card" id="cform" style="margin:0;padding:28px">
      <h3 class="sec-title" style="font-size:1.8rem">Kirim Pesan</h3>
      <div class="row"><label>Nama lengkap<input name="name" required maxlength="100" autocomplete="name"></label>
      <label>No. HP / WhatsApp<input name="phone" maxlength="30" inputmode="tel" autocomplete="tel"></label></div>
      <label>Email<input name="email" type="email" maxlength="120" autocomplete="email"></label>
      <label>Perihal<input name="subject" maxlength="150"></label>
      <label>Pesan<textarea name="message" rows="5" required maxlength="3000"></textarea></label>
      <input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
      <div id="cmsg"></div>
      <button class="btn btn-orange" type="submit">Kirim Pesan ${icon('arrow')}</button>
    </form>
  </div>
  <div class="wrap" style="margin-top:32px"><iframe class="map" title="Peta lokasi sekolah" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(s.maps_query || s.address)}&output=embed"></iframe></div>
  </section>`;
  $('#cform').onsubmit = async (e) => {
    e.preventDefault(); const f = e.target, b = $('button[type=submit]', f);
    b.disabled = true;
    const r = await fetch('/api/pesan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(f))) });
    const d = await r.json().catch(() => ({}));
    $('#cmsg').innerHTML = r.ok ? '<div class="notice ok">Terima kasih, pesan Anda sudah kami terima.</div>' : `<div class="notice bad">${esc(d.error || 'Gagal mengirim pesan.')}</div>`;
    if (r.ok) f.reset(); b.disabled = false;
  };
};

function notFound(main) {
  setTitle('Tidak ditemukan');
  main.innerHTML = `${pageHero('Halaman tidak ditemukan', 'Halaman yang Anda cari mungkin sudah dipindahkan atau dihapus.')}
  <section class="section"><div class="wrap"><a class="btn btn-dark" href="/">Kembali ke beranda ${icon('arrow')}</a></div></section>`;
}
PAGES.notfound = notFound;

// ---------- Mulai ----------
(async () => {
  const main = $('#main');
  try {
    SITE = await api('site');
    SITE.units.forEach((u) => (UNITS[u.slug] = u));
  } catch (e) {
    main.innerHTML = `<div class="loading-page"><div class="empty">Gagal memuat data situs. ${esc(e.message)}</div></div>`;
    return;
  }
  renderShell();
  const page = document.body.dataset.page;
  try { await (PAGES[page] || notFound)(main); } catch (e) { console.error(e); }
})();
})();
