import { html, raw, icon, url, rupiah, json, avatar, isStaf, APP_NAME, SCHOOL, VERSION } from './core.js';

export function navItems(role) {
  if (role === 'pembeli') return [['beranda', 'Beranda', 'home'], ['keranjang', 'Keranjang', 'cart'], ['riwayat', 'Riwayat', 'receipt'], ['akun', 'Akun', 'user']];
  if (role === 'kantin') return [['beranda', 'Pesanan', 'home'], ['scan', 'Scan QR', 'scan'], ['riwayat', 'Penjualan', 'chart'], ['akun', 'Akun', 'user']];
  const all = [
    ['beranda', 'Beranda', 'home'], ['topup', 'Top Up', 'wallet'], ['verifikasi', 'Verifikasi', 'shield'], ['cairkan', 'Pencairan', 'cash'],
    ['pesanan', 'Pesanan', 'receipt'], ['pengguna', 'Pengguna', 'users'], ['kantin', 'Kantin', 'store'],
    ['menu', 'Menu', 'list'], ['promo', 'Promo', 'image'], ['transaksi', 'Laporan', 'chart'], ['pengaturan', 'Pengaturan', 'sliders'],
    ['akun', 'Akun', 'user'],
  ];
  // Petugas: semua kecuali Pengguna, Promo & Pengaturan (khusus admin)
  return role === 'admin' ? all : all.filter(([k]) => !['pengguna', 'pengaturan', 'promo'].includes(k));
}

export const HEAD = (title) => html`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#c8202f">
<title>${title} · ${APP_NAME}</title>
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/assets/img/icon-192.png">
<link rel="apple-touch-icon" href="/assets/img/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/app.css?v=${VERSION}">
</head>`;

/**
 * Halaman lengkap. opt: back (url), scripts (array), wide (bool)
 */
export function layout(ctx, title, body, opt = {}) {
  const u = ctx.user;
  const role = u?.role || '';
  const page = ctx.p;
  const wide = isStaf(u) || opt.wide;
  const sub = u ? u.nama + (role === 'kantin' ? ' · Kantin' : role === 'petugas' ? ' · Petugas' : role === 'admin' ? ' · Admin' : '') : SCHOOL;
  return html`${HEAD(title)}
<body class="role-${role}${wide ? ' is-wide' : ''}">
<header class="topbar">
  <div class="topbar-in">
    ${opt.back
      ? html`<a class="icon-btn" href="${opt.back}" aria-label="Kembali">${icon('back')}</a>`
      : u ? html`<a href="${url('akun')}" class="me" aria-label="Akun saya">${avatar(u, 'sm')}</a>`
        : html`<img src="/assets/img/logo-sma.png" alt="" class="brand-logo">`}
    <div class="brand">
      <span class="brand-name">Smanesa <b>Kantin Digital</b></span>
      <span class="brand-sub">${sub}</span>
    </div>
    ${role === 'pembeli'
      ? html`<a class="saldo-chip" href="${url('riwayat')}">${icon('wallet', 16)} ${rupiah(u.saldo)}</a>`
      : u ? html`<a class="icon-btn" href="${url('logout')}" aria-label="Keluar" title="Keluar">${icon('logout')}</a>` : ''}
  </div>
  ${isStaf(u) ? html`<nav class="tabs" aria-label="Menu petugas">
    ${navItems(role).map(([k, label, ic]) => html`<a href="${url(k)}" class="${page === k ? 'active' : ''}">${icon(ic, 16)}${label}</a>`)}
  </nav>` : ''}
</header>
<main class="wrap">
${ctx.takeFlash().map(([t, m]) => html`<div class="alert alert-${t}">${raw(m)}</div>`)}
${body}
</main>
${role === 'pembeli' || role === 'kantin' ? html`<nav class="bottomnav" aria-label="Navigasi">
  ${navItems(role).map(([k, label, ic]) => html`<a href="${url(k)}" class="${page === k ? 'active' : ''}${k === 'scan' ? ' nav-scan' : ''}">
    ${icon(ic)}<span>${label}</span>${k === 'keranjang' ? html`<i class="cart-count" data-cart-count hidden>0</i>` : ''}
  </a>`)}
</nav>` : ''}
<script>window.APP = ${json({ uid: u?.id || 0, role, csrf: ctx.sess.csrf })};</script>
${(opt.scripts || []).map((s) => html`<script src="${s}?v=${VERSION}"></script>`)}
<script src="/assets/js/app.js?v=${VERSION}"></script>
</body>
</html>`;
}

/** Halaman tanpa navigasi (login, instalasi). */
export function bare(ctx, title, body) {
  return html`${HEAD(title)}
<body class="auth">
<main class="auth-card">
${ctx.takeFlash().map(([t, m]) => html`<div class="alert alert-${t}">${raw(m)}</div>`)}
${body}
</main>
<script>window.APP = ${json({ uid: 0, role: '', csrf: ctx.sess.csrf })};</script>
<script src="/assets/js/app.js?v=${VERSION}"></script>
</body>
</html>`;
}
