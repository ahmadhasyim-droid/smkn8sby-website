/**
 * Fungsi inti: template HTML aman, format, waktu WIB, kripto (password & sesi).
 * Berjalan di Cloudflare Pages Functions (Web API standar).
 */

export const APP_NAME = 'Smanesa Kantin Digital';
export const SCHOOL = 'SMA Negeri 1 Purwoasri';
export const VERSION = '2.6.0';

/* ---------------- Template HTML (otomatis di-escape) ---------------- */
export class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(String(s ?? ''));
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
function rend(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(rend).join('');
  return esc(v);
}
export function html(strings, ...vals) {
  let o = strings[0];
  for (let i = 0; i < vals.length; i++) o += rend(vals[i]) + strings[i + 1];
  return new Raw(o);
}
export const nl2br = (s) => raw(esc(s).replace(/\n/g, '<br>'));
export const json = (v) => raw(JSON.stringify(v).replace(/</g, '\\u003c'));

/* ---------------- Format ---------------- */
export function ribuan(n) {
  n = Math.trunc(Number(n) || 0);
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + s;
}
export const rupiah = (n) => 'Rp ' + ribuan(n);
export const intInput = (v) => parseInt(String(v ?? '').replace(/\D/g, ''), 10) || 0;
export const ucfirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

/* ---------------- Waktu (WIB, UTC+7) ---------------- */
export function now() {
  return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
}
export const today = () => now().slice(0, 10);
export function addDays(ymd, n) {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function tgl(dt, jam = true) {
  if (!dt) return '-';
  const [d, t = ''] = String(dt).split(' ');
  const [y, m, dd] = d.split('-');
  const s = `${parseInt(dd, 10)} ${BULAN[parseInt(m, 10)]} ${y}`;
  return jam && t ? `${s}, ${t.slice(0, 5).replace(':', '.')}` : s;
}
export const jamSaja = (dt) => String(dt || '').slice(11, 16).replace(':', '.');

/* ---------------- Acak ---------------- */
const ABC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export function randomCode(len = 8) {
  const b = crypto.getRandomValues(new Uint8Array(len));
  let s = '';
  for (const x of b) s += ABC[x % ABC.length];
  return s;
}
export function randomPassword(len = 6) {
  const b = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(b, (x) => String(x % 10)).join('');
}
export const token = () => randomCode(16);

/* ---------------- Base64 ---------------- */
export function b64(buf) {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
export function unb64(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
const b64url = (buf) => b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => unb64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
const te = new TextEncoder();
const td = new TextDecoder();

/* ---------------- Password (PBKDF2-SHA256 + pepper rahasia) ----------------
 * Iterasi sengaja moderat agar muat di batas CPU paket gratis Cloudflare (10 ms).
 * Keamanan utama datang dari "pepper" (SECRET di pengaturan Cloudflare) yang
 * tidak tersimpan di database, plus pembatasan percobaan login.
 */
const ITER = 2000;
async function pbkdf2(pw, salt, iter, pepper) {
  const key = await crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const s = new Uint8Array([...salt, ...te.encode(pepper)]);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: s, iterations: iter }, key, 256);
  return new Uint8Array(bits);
}
export async function hashPassword(pw, env) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const h = await pbkdf2(String(pw), salt, ITER, env.SECRET);
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(h)}`;
}
export async function verifyPassword(pw, stored, env) {
  const p = String(stored || '').split('$');
  if (p.length !== 4 || p[0] !== 'pbkdf2') return false;
  const h = await pbkdf2(String(pw), unb64(p[2]), parseInt(p[1], 10), env.SECRET);
  const ref = unb64(p[3]);
  if (ref.length !== h.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h[i] ^ ref[i];
  return diff === 0;
}

/* ---------------- Sesi terenkripsi (AES-GCM) di cookie ---------------- */
const keyCache = new Map();
async function sessKey(secret) {
  if (!keyCache.has(secret)) {
    const raw = await crypto.subtle.digest('SHA-256', te.encode('skd-session:' + secret));
    keyCache.set(secret, await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']));
  }
  return keyCache.get(secret);
}
export async function sealSession(obj, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await sessKey(secret), te.encode(JSON.stringify(obj)));
  return b64url(new Uint8Array([...iv, ...new Uint8Array(ct)]));
}
export async function openSession(str, secret) {
  try {
    const u = unb64url(str);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, await sessKey(secret), u.subarray(12));
    const o = JSON.parse(td.decode(pt));
    if (!o || (o.exp && o.exp < Date.now())) return null;
    return o;
  } catch (e) {
    return null;
  }
}

/* ---------------- Label & ikon ---------------- */
export function statusBadge(s) {
  const map = {
    menunggu: ['Menunggu diambil', 'warn'], selesai: ['Sudah diambil', 'ok'],
    dibatalkan: ['Dibatalkan', 'mute'], ditolak: ['Ditolak kantin', 'bad'], kedaluwarsa: ['Kedaluwarsa · dana kembali', 'mute'],
  };
  const [t, c] = map[s] || [s, 'mute'];
  return html`<span class="badge badge-${c}">${t}</span>`;
}
export function jenisLabel(j) {
  return ({ topup: 'Top up', belanja: 'Belanja', refund: 'Pengembalian', tarik: 'Tarik tunai',
    penjualan: 'Penjualan', pencairan: 'Pencairan', potongan: 'Potongan pencairan', topup_bank: 'Top up transfer bank', topup_dana: 'Top up DANA', transfer_keluar: 'Transfer keluar', transfer_masuk: 'Transfer masuk', koreksi: 'Koreksi' })[j] || j;
}
export function menuIcon(m) {
  const n = String(m.nama).toLowerCase();
  const map = [
    ['soto', '🍲'], ['bakso', '🍲'], ['pentol', '🍢'], ['cireng', '🍢'], ['mie', '🍜'],
    ['pecel', '🥗'], ['geprek', '🍗'], ['ayam', '🍗'], ['tempe', '🍛'], ['penyet', '🍛'], ['rice bowl', '🍱'],
    ['nasi', '🍚'], ['gorengan', '🥟'], ['snack', '🍪'], ['tisu', '🧻'],
    ['kopi', '☕'], ['teh', '🧋'], ['mineral', '💧'], ['prima', '💧'], ['air', '💧'],
    ['nutrisari', '🍹'], ['florida', '🧃'], ['jus', '🧃'], ['jeruk', '🍊'],
  ];
  for (const [k, ic] of map) if (n.includes(k)) return ic;
  if (/\bes\b/.test(n)) return '🧊';
  return m.kategori === 'minuman' ? '🥤' : '🍽️';
}

const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  receipt: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
  wallet: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  bank: '<path d="M3 10h18L12 4 3 10z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
  wa: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2L9 9.5z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
};
export function icon(name, size = 22) {
  return raw(`<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`);
}

/* ---------------- Foto profil / avatar ---------------- */
const AV_GRAD = [
  ['#ff6a3d', '#c8202f'], ['#f7b733', '#fc4a1a'], ['#11998e', '#38ef7d'], ['#4568dc', '#b06ab3'],
  ['#ee0979', '#ff6a00'], ['#1d2756', '#4a5bd4'], ['#00b4db', '#0083b0'], ['#8e2de2', '#ff4b8b'],
];
export function avatar(u, cls = '') {
  const nama = String(u?.nama || '?');
  if (u?.foto) return html`<img class="avatar ${cls}" src="${u.foto}" alt="Foto ${nama}" loading="lazy">`;
  let h = 0;
  for (const ch of nama) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = AV_GRAD[h % AV_GRAD.length];
  const ini = nama.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return html`<span class="avatar ${cls}" style="background: linear-gradient(135deg, ${a}, ${b})" aria-hidden="true">${ini}</span>`;
}

/* ---------------- URL ---------------- */
export function url(page = '', params = {}) {
  const q = new URLSearchParams();
  if (page) q.set('p', page);
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== '') q.set(k, String(v));
  const s = q.toString();
  return '/' + (s ? '?' + s : '');
}

/* ---------------- WhatsApp ---------------- */
/** Normalisasi nomor WA Indonesia → 62xxxxxxxxxx, atau '' jika tidak valid. */
export function normWa(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return /^628\d{7,12}$/.test(d) ? d : '';
}
export const tampilWa = (d) => (d ? '0' + String(d).slice(2) : '');
/** Tautan klik-untuk-chat WhatsApp dengan pesan terisi. */
export const waLink = (nomor, pesan) => `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

/** Admin & petugas = staf kantin (admin punya akses penuh). */
export const isStaf = (u) => u && (u.role === 'petugas' || u.role === 'admin');

/** Pesan galat yang aman ditampilkan ke pengguna. */
export class UserError extends Error {}
