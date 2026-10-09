/* Service worker: menyimpan aset tampilan agar aplikasi cepat dibuka.
   Halaman & data saldo SELALU diambil langsung dari server (tidak di-cache). */
const CACHE = 'skd-v2.6.0';
const ASSETS = ['/assets/css/app.css', '/assets/js/app.js', '/assets/js/qr.js', '/assets/js/scan.js',
  '/assets/img/logo-sma.png', '/assets/img/icon-192.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/img/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    })));
  }
});
