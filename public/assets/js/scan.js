/* Pemindai QR untuk kantin.
 * 1) Pakai BarcodeDetector bawaan browser (Chrome Android) — tanpa internet tambahan.
 * 2) Jika tidak didukung (mis. iPhone), muat html5-qrcode dari CDN sebagai cadangan.
 */
(function () {
  'use strict';
  var video = document.getElementById('scan-video');
  var msg = document.getElementById('scan-msg');
  var view = document.getElementById('scan-view');
  var fb = document.getElementById('scan-fallback');
  var btnStart = document.getElementById('scan-start');
  var btnSwitch = document.getElementById('scan-switch');
  var stream = null, timer = null, done = false, cams = [], camIdx = -1, h5 = null;

  function say(t) { msg.textContent = t; msg.hidden = !t; }
  function go(text) {
    if (done) return;
    done = true;
    try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
    say('QR terbaca, membuka…');
    stop();
    location.href = '/?p=' + (view.getAttribute('data-target') || 'klaim') + '&kode=' + encodeURIComponent(String(text).trim());
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (h5) { try { h5.stop(); } catch (e) {} }
  }

  if (!window.isSecureContext) {
    say('Kamera butuh koneksi https://. Gunakan isian kode di bawah.');
    btnStart.disabled = btnSwitch.disabled = true;
    return;
  }

  function startNative() {
    var detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    var constraints = { audio: false, video: camIdx >= 0 && cams[camIdx] ? { deviceId: { exact: cams[camIdx].deviceId } } : { facingMode: 'environment' } };
    stop();
    done = false;
    say('Menyalakan kamera…');
    navigator.mediaDevices.getUserMedia(constraints).then(function (s) {
      stream = s;
      video.srcObject = s;
      return video.play();
    }).then(function () {
      say('Arahkan kamera ke QR struk pembeli');
      navigator.mediaDevices.enumerateDevices().then(function (d) {
        cams = d.filter(function (x) { return x.kind === 'videoinput'; });
        btnSwitch.hidden = cams.length < 2;
      });
      timer = setInterval(function () {
        if (video.readyState < 2) return;
        detector.detect(video).then(function (codes) {
          if (codes && codes.length) go(codes[0].rawValue);
        }).catch(function () {});
      }, 250);
    }).catch(function (err) {
      say('Kamera tidak bisa dibuka (' + (err && err.name || 'error') + '). Izinkan akses kamera atau ketik kode.');
    });
  }

  function startFallback() {
    view.hidden = true;
    fb.innerHTML = '<div id="h5qr" class="h5qr"></div><p class="hint center">Memuat pemindai…</p>';
    function run() {
      fb.querySelector('.hint').textContent = 'Arahkan kamera ke QR struk pembeli';
      h5 = new window.Html5Qrcode('h5qr');
      h5.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 230, height: 230 } }, go, function () {})
        .catch(function () { fb.querySelector('.hint').textContent = 'Kamera tidak bisa dibuka. Izinkan akses kamera atau ketik kode.'; });
    }
    if (window.Html5Qrcode) return run();
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    s.onload = run;
    s.onerror = function () { fb.querySelector('.hint').textContent = 'Pemindai tidak dapat dimuat (cek internet). Ketik kode struk di bawah.'; };
    document.head.appendChild(s);
  }

  function start() {
    if ('BarcodeDetector' in window) {
      window.BarcodeDetector.getSupportedFormats().then(function (f) {
        if (f.indexOf('qr_code') >= 0) startNative(); else startFallback();
      }).catch(startFallback);
    } else {
      startFallback();
    }
  }

  btnStart.addEventListener('click', start);
  btnSwitch.addEventListener('click', function () {
    if (cams.length < 2) return;
    camIdx = (camIdx + 1) % cams.length;
    startNative();
  });
  btnSwitch.hidden = true;
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  start();
})();
