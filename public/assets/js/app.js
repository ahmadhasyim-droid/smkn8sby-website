/* Smanesa Kantin Digital — skrip umum */
(function () {
  'use strict';
  var APP = window.APP || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rp = function (n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- Keranjang (disimpan di HP per pengguna) ---------- */
  var KEY = 'skd_cart_' + (APP.uid || 0);
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }
  var cart = load();

  if (window.CLEAR_CART) { cart = {}; save(cart); }

  // Selaraskan dengan harga & ketersediaan terkini
  if (window.MENU_NOW) {
    var changed = false;
    Object.keys(cart).forEach(function (id) {
      var now = window.MENU_NOW[id];
      if (!now) { delete cart[id]; changed = true; return; }
      if (cart[id].harga !== now.harga) { cart[id].harga = now.harga; changed = true; }
      cart[id].off = !now.ok;
    });
    if (changed) save(cart);
  }

  function totals() {
    var items = 0, total = 0;
    Object.keys(cart).forEach(function (k) { items += cart[k].qty; total += cart[k].qty * cart[k].harga; });
    return { items: items, total: total };
  }

  function refreshBadges() {
    var t = totals();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = t.items; el.hidden = t.items === 0; });
    var bar = $('[data-cartbar]');
    if (bar) {
      bar.hidden = t.items === 0;
      $('[data-cart-items]', bar).textContent = t.items;
      $('[data-cart-total]', bar).textContent = rp(t.total);
    }
  }

  function setQty(menu, qty) {
    qty = Math.max(0, Math.min(50, qty));
    if (qty === 0) delete cart[menu.id];
    else {
      cart[menu.id] = cart[menu.id] || { id: menu.id, nama: menu.nama, harga: menu.harga, kantin_id: menu.kantin_id, kantin: menu.kantin, qty: 0 };
      cart[menu.id].qty = qty;
      cart[menu.id].harga = menu.harga;
    }
    save(cart);
    refreshBadges();
  }

  // Halaman menu kantin
  $$('[data-menu]').forEach(function (row) {
    var menu = JSON.parse(row.getAttribute('data-menu'));
    var out = $('[data-val]', row);
    if (!out) return;
    function paint() {
      var q = cart[menu.id] ? cart[menu.id].qty : 0;
      out.textContent = q;
      row.classList.toggle('in-cart', q > 0);
    }
    $('[data-inc]', row).addEventListener('click', function () { setQty(menu, (cart[menu.id] ? cart[menu.id].qty : 0) + 1); paint(); });
    $('[data-dec]', row).addEventListener('click', function () { setQty(menu, (cart[menu.id] ? cart[menu.id].qty : 0) - 1); paint(); });
    paint();
  });

  // Halaman keranjang
  var view = $('[data-cart-view]');
  function renderCart() {
    if (!view) return;
    var saldo = parseInt(view.getAttribute('data-saldo'), 10) || 0;
    var groups = {};
    Object.keys(cart).forEach(function (k) {
      var it = cart[k];
      (groups[it.kantin_id] = groups[it.kantin_id] || { nama: it.kantin, items: [] }).items.push(it);
    });
    var t = totals();
    var anyOff = false;
    var html = '';
    Object.keys(groups).forEach(function (kid) {
      var g = groups[kid], sub = 0;
      html += '<section class="card cart-group"><h3>' + esc(g.nama) + '</h3>';
      g.items.forEach(function (it) {
        sub += it.qty * it.harga;
        if (it.off) anyOff = true;
        html += '<div class="cart-row' + (it.off ? ' is-off' : '') + '" data-id="' + it.id + '">' +
          '<div class="cart-name"><b>' + esc(it.nama) + '</b><small>' + rp(it.harga) + (it.off ? ' · <span class="txt-bad">habis, hapus dulu</span>' : '') + '</small></div>' +
          '<div class="qty"><button type="button" class="qty-btn" data-c-dec aria-label="Kurangi">−</button><output>' + it.qty +
          '</output><button type="button" class="qty-btn add" data-c-inc aria-label="Tambah">+</button></div>' +
          '<b class="cart-sub">' + rp(it.qty * it.harga) + '</b></div>';
      });
      html += '<div class="row-between cart-foot"><span>Subtotal ' + esc(g.nama) + '</span><b>' + rp(sub) + '</b></div></section>';
    });
    $('[data-cart-groups]', view).innerHTML = html;
    $('[data-cart-empty]', view).hidden = t.items > 0;
    $('[data-cart-summary]', view).hidden = t.items === 0;
    $('[data-sum-total]', view).textContent = rp(t.total);
    $('[data-sum-sisa]', view).textContent = rp(saldo - t.total);
    var kurang = t.total > saldo;
    $('[data-sum-kurang]', view).hidden = !kurang;
    $('[data-pay]', view).disabled = kurang || anyOff || t.items === 0;
    $('[data-checkout] input[name=cart]', view).value = JSON.stringify(Object.keys(cart).map(function (k) {
      return { id: cart[k].id, qty: cart[k].qty, harga: cart[k].harga };
    }));
    $$('.cart-row', view).forEach(function (row) {
      var id = row.getAttribute('data-id');
      $('[data-c-inc]', row).onclick = function () { setQty(cart[id], cart[id].qty + 1); renderCart(); };
      $('[data-c-dec]', row).onclick = function () { setQty(cart[id], cart[id].qty - 1); renderCart(); };
    });
  }
  if (view) {
    renderCart();
    $('[data-cart-clear]', view).addEventListener('click', function () {
      if (confirm('Kosongkan keranjang?')) { cart = {}; save(cart); refreshBadges(); renderCart(); }
    });
    $('[data-checkout]', view).addEventListener('submit', function (e) {
      var t = totals();
      if (!confirm('Bayar ' + rp(t.total) + ' dari saldo Anda?')) { e.preventDefault(); return; }
      $('[data-pay]', view).disabled = true;
      $('[data-pay]', view).textContent = 'Memproses…';
    });
  }
  refreshBadges();

  /* ---------- Konfirmasi formulir ---------- */
  $$('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (!confirm(f.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  /* ---------- Input rupiah ---------- */
  $$('[data-rupiah]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var d = inp.value.replace(/\D/g, '');
      inp.value = d ? parseInt(d, 10).toLocaleString('id-ID') : '';
    });
  });
  $$('[data-amount]').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = $('[name=nominal]', b.closest('form'));
      inp.value = parseInt(b.getAttribute('data-amount'), 10).toLocaleString('id-ID');
      inp.focus();
    });
  });
  $$('form[data-confirm-topup]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var n = $('[name=nominal]', f).value;
      var jenis = $('[name=jenis]:checked', f).value === 'tarik' ? 'TARIK TUNAI (serahkan uang)' : 'TOP UP (terima uang)';
      if (!confirm(jenis + ' sebesar Rp ' + n + '?')) e.preventDefault();
    });
  });

  $$('form[data-confirm-transfer]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var n = $('[name=nominal]', f).value;
      if (!confirm('Kirim Rp ' + n + ' ke ' + f.getAttribute('data-nama') + '?\nSaldo langsung berpindah dan tidak bisa dibatalkan.')) e.preventDefault();
    });
  });

  /* ---------- Form pengguna: tampilkan isian sesuai peran ---------- */
  var roleSel = $('[data-role-select]');
  if (roleSel) {
    var syncRole = function () {
      $$('[data-for-role]').forEach(function (el) { el.hidden = el.getAttribute('data-for-role') !== roleSel.value; });
    };
    roleSel.addEventListener('change', syncRole);
    syncRole();
  }

  /* ---------- QR struk & status otomatis ---------- */
  $$('[data-qr]').forEach(function (el) {
    if (window.QR) el.innerHTML = window.QR.svg(el.getAttribute('data-qr'), { size: 240 });
  });
  var struk = $('[data-struk]');
  if (struk && struk.getAttribute('data-live') === '1' && APP.role === 'pembeli') {
    var kode = struk.getAttribute('data-kode'), sig = struk.getAttribute('data-sig');
    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      fetch('/?p=status&kode=' + encodeURIComponent(kode), { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.ok && d.sig !== sig) location.reload(); })
        .catch(function () {});
    }, 5000);
  }

  /* ---------- Gambar: dikecilkan di HP/komputer sebelum diunggah ---------- */
  $$('input[type=file][data-resize]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0];
      var target = $('input[name="' + inp.getAttribute('data-target') + '"]', inp.closest('form'));
      if (!file || !target) return;
      var max = parseInt(inp.getAttribute('data-resize'), 10) || 1200;
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        if (inp.hasAttribute('data-square')) {
          // Foto profil: potong tengah menjadi persegi
          var side = Math.min(img.width, img.height), out = Math.min(max, side);
          c.width = c.height = out;
          c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
        } else {
          var s = Math.min(1, max / Math.max(img.width, img.height));
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        }
        target.value = c.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(img.src);
        if (inp.hasAttribute('data-autosubmit')) { inp.closest('form').submit(); return; }
        var prev = inp.parentNode.querySelector('img.banner-prev, img.thumb-prev');
        if (!prev) { prev = document.createElement('img'); prev.className = max > 800 ? 'banner-prev' : 'thumb-prev'; inp.parentNode.appendChild(prev); }
        prev.src = target.value;
      };
      img.src = URL.createObjectURL(file);
    });
  });

  /* ---------- Impor CSV siswa & guru (dikirim bertahap) ---------- */
  var imp = $('[data-import]');
  if (imp) {
    var st = $('[data-import-status]', imp);
    $('[data-import-go]', imp).addEventListener('click', function () {
      var file = $('[data-import-file]', imp).files[0];
      if (!file) { st.textContent = 'Pilih file CSV terlebih dahulu.'; return; }
      var btn = this;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result).replace(/^﻿/, '');
        var lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
        if (!lines.length) { st.textContent = 'File kosong.'; return; }
        var d = (lines[0].split(';').length >= lines[0].split(',').length) ? ';' : ',';
        var rows = [];
        lines.forEach(function (l, i) {
          var c = parseCsvLine(l, d);
          if (i === 0 && /nisn|username|nip/i.test(c[0] || '')) return;
          c.baris = i + 1;
          rows.push(c);
        });
        var timpa = $('[data-import-timpa]', imp).checked;
        var sum = { baru: 0, update: 0, lewat: 0, gagal: [] };
        var i = 0, size = 4;
        btn.disabled = true;
        (function next() {
          if (i >= rows.length) {
            btn.disabled = false;
            st.innerHTML = '<b>Impor selesai:</b> ' + sum.baru + ' baru, ' + sum.update + ' diperbarui, ' + sum.lewat + ' dilewati (sudah ada).' +
              (sum.gagal.length ? ' Baris tidak valid: ' + sum.gagal.slice(0, 20).join(', ') : '') + ' <a href="/?p=pengguna">Muat ulang daftar</a>';
            return;
          }
          var chunk = rows.slice(i, i + size);
          st.textContent = 'Mengimpor ' + Math.min(i + size, rows.length) + ' dari ' + rows.length + ' baris…';
          fetch('/?p=pengguna', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-CSRF': APP.csrf },
            body: JSON.stringify({ aksi: 'import', timpa: timpa, rows: chunk.map(function (r) { return { 0: r[0], 1: r[1], 2: r[2], 3: r[3], 4: r[4], baris: r.baris }; }) }),
          }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (res) {
              sum.baru += res.baru; sum.update += res.update; sum.lewat += res.lewat; sum.gagal = sum.gagal.concat(res.gagal);
              i += size; next();
            })
            .catch(function (e) { btn.disabled = false; st.textContent = 'Impor terhenti di baris ' + (i + 1) + ' (' + e.message + '). Coba lagi — data yang sudah masuk akan dilewati.'; });
        })();
      };
      reader.readAsText(file);
    });
  }
  function parseCsvLine(line, d) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === d) { out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  /* ---------- Unggah foto massal (admin): cocokkan nama file dengan NISN / nama ---------- */
  var fm = $('[data-foto-massal]');
  if (fm) {
    var fmFiles = [], fmPlan = [], users = null;
    var norm = function (t) {
      return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    };
    var fmStatus = $('[data-fm-status]', fm), fmPrev = $('[data-fm-preview]', fm), fmGo = $('[data-fm-go]', fm);
    function loadUsers() {
      if (users) return Promise.resolve(users);
      return fetch('/?p=pengguna&daftar_foto=1', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
        .then(function (list) { users = list; return list; });
    }
    function buildIndex(list) {
      var idx = {};
      function add(k, u) { if (!k) return; (idx[k] = idx[k] || []).push(u); }
      list.forEach(function (u) {
        add('u:' + norm(u.username), u);
        add('n:' + norm(u.nama), u);
        var pendek = norm(String(u.nama).split(',')[0]);   // tanpa gelar, mis. "Budi Santoso, S.Pd."
        if (pendek !== norm(u.nama)) add('n:' + pendek, u);
      });
      return idx;
    }
    $$('[data-fm-input]', fm).forEach(function (inp) {
      inp.addEventListener('change', function () {
        fmFiles = Array.prototype.filter.call(inp.files, function (f) { return /^image\//.test(f.type); });
        if (!fmFiles.length) { fmStatus.textContent = 'Tidak ada file gambar.'; return; }
        fmStatus.textContent = 'Mencocokkan ' + fmFiles.length + ' file…';
        loadUsers().then(function (list) {
          var idx = buildIndex(list), cocok = [], tidak = [], ganda = [], dipakai = {};
          fmFiles.forEach(function (f) {
            var base = f.name.replace(/\.[^.]+$/, '');
            var hit = idx['u:' + norm(base)] || idx['n:' + norm(base)] || [];
            var uniq = hit.filter(function (u, i) { return hit.findIndex(function (x) { return x.id === u.id; }) === i; });
            if (uniq.length === 1 && !dipakai[uniq[0].id]) { dipakai[uniq[0].id] = 1; cocok.push({ file: f, user: uniq[0] }); }
            else if (uniq.length > 1) ganda.push(f.name);
            else tidak.push(f.name);
          });
          fmPlan = cocok;
          var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
          fmPrev.innerHTML = '<p class="small"><b class="txt-ok">' + cocok.length + ' cocok</b> · ' +
            '<b class="txt-bad">' + tidak.length + ' tidak ditemukan</b> · ' + ganda.length + ' nama ganda (lewati)</p>' +
            (cocok.length ? '<div class="fm-list">' + cocok.slice(0, 60).map(function (c) {
              return '<span class="fm-item"><b>' + esc(c.file.name) + '</b> → ' + esc(c.user.nama) + (c.user.kelas ? ' (' + esc(c.user.kelas) + ')' : '') +
                (c.user.foto ? ' <i>ganti foto</i>' : '') + '</span>';
            }).join('') + (cocok.length > 60 ? '<span class="fm-item">… dan ' + (cocok.length - 60) + ' lainnya</span>' : '') + '</div>' : '') +
            (tidak.length ? '<p class="small muted">Tidak ditemukan: ' + esc(tidak.slice(0, 30).join(', ')) + (tidak.length > 30 ? '…' : '') + '</p>' : '') +
            (ganda.length ? '<p class="small muted">Nama sama dengan lebih dari satu pengguna (pakai NISN sebagai nama file): ' + esc(ganda.slice(0, 30).join(', ')) + '</p>' : '');
          fmGo.hidden = !cocok.length;
          fmGo.textContent = 'Unggah ' + cocok.length + ' foto yang cocok';
          fmStatus.textContent = '';
        }).catch(function () { fmStatus.textContent = 'Gagal memuat daftar pengguna.'; });
      });
    });
    function kecilkan(file) {
      return new Promise(function (res, rej) {
        var img = new Image();
        img.onload = function () {
          var side = Math.min(img.width, img.height), out = Math.min(320, side), c = document.createElement('canvas');
          c.width = c.height = out;
          c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
          URL.revokeObjectURL(img.src);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = function () { rej(new Error('gambar rusak')); };
        img.src = URL.createObjectURL(file);
      });
    }
    fmGo.addEventListener('click', function () {
      if (!confirm('Unggah ' + fmPlan.length + ' foto? Foto lama pada pengguna yang cocok akan diganti.')) return;
      fmGo.disabled = true;
      var i = 0, ok = 0, gagal = [];
      (function next() {
        if (i >= fmPlan.length) {
          fmGo.disabled = false; fmGo.hidden = true;
          fmStatus.innerHTML = '<b>Selesai:</b> ' + ok + ' foto terpasang.' + (gagal.length ? ' Gagal: ' + gagal.join(', ') : '') + ' <a href="/?p=pengguna">Muat ulang daftar</a>';
          users = null;
          return;
        }
        var chunk = fmPlan.slice(i, i + 3);
        fmStatus.textContent = 'Mengunggah ' + Math.min(i + 3, fmPlan.length) + ' dari ' + fmPlan.length + '…';
        Promise.all(chunk.map(function (c) {
          return kecilkan(c.file).then(function (d) { return { id: c.user.id, file: c.file.name, data: d }; })
            .catch(function () { gagal.push(c.file.name); return null; });
        })).then(function (items) {
          items = items.filter(Boolean);
          if (!items.length) return { ok: 0, gagal: [] };
          return fetch('/?p=pengguna', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-CSRF': APP.csrf },
            body: JSON.stringify({ aksi: 'foto_massal', items: items }),
          }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
        }).then(function (res) {
          ok += res.ok; gagal = gagal.concat(res.gagal || []);
          i += 3; next();
        }).catch(function (e) {
          fmGo.disabled = false;
          fmStatus.textContent = 'Terhenti (' + e.message + '). Klik unggah lagi untuk melanjutkan.';
          fmPlan = fmPlan.slice(i);
        });
      })();
    });
  }

  /* ---------- Banner promo: geser otomatis ---------- */
  $$('[data-promo]').forEach(function (box) {
    var track = $('.promo-track', box), dots = $$('.promo-dots i', box), n = dots.length;
    if (n < 2) return;
    var cur = 0, timer;
    function go(i) { cur = (i + n) % n; track.scrollTo({ left: track.clientWidth * cur, behavior: 'smooth' }); }
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      cur = i;
    }, { passive: true });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    function play() { clearInterval(timer); timer = setInterval(function () { if (document.visibilityState === 'visible') go(cur + 1); }, 4500); }
    track.addEventListener('touchstart', function () { clearInterval(timer); }, { passive: true });
    track.addEventListener('touchend', play, { passive: true });
    play();
  });

  /* ---------- Tampil/sembunyi bagian formulir & salin nomor rekening ---------- */
  $$('[data-toggle]').forEach(function (cb) {
    var box = document.querySelector(cb.getAttribute('data-toggle'));
    var sync = function () { if (box) box.hidden = !cb.checked; };
    cb.addEventListener('change', sync); sync();
  });
  $$('[data-toggle-group]').forEach(function (rb) {
    var g = rb.getAttribute('data-toggle-group');
    var sync = function () {
      if (!rb.checked) return;
      $$('[data-group="' + g + '"]').forEach(function (el) { el.hidden = true; });
      var t = document.querySelector(rb.getAttribute('data-show'));
      if (t) t.hidden = false;
    };
    rb.addEventListener('change', sync); sync();
  });
  $$('[data-copy]').forEach(function (el) {
    var btn = $('.copy-btn', el);
    if (btn) btn.addEventListener('click', function () {
      var t = el.getAttribute('data-copy');
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { btn.textContent = 'Tersalin ✓'; })
        .catch(function () { prompt('Salin:', t); });
    });
  });

  /* ---------- Hitung mundur batas struk ---------- */
  $$('[data-countdown]').forEach(function (el) {
    var end = Date.now() + (parseInt(el.getAttribute('data-countdown'), 10) || 0) * 1000;
    function tick() {
      var d = Math.max(0, Math.floor((end - Date.now()) / 1000));
      if (d <= 0) { el.textContent = 'kedaluwarsa'; setTimeout(function () { location.reload(); }, 3000); return; }
      var j = Math.floor(d / 3600), m = Math.floor((d % 3600) / 60);
      el.textContent = 'sisa ' + (j ? j + ' jam ' : '') + m + ' menit';
      el.className = d < 1800 ? 'cd-urgent' : '';
      setTimeout(tick, 30000);
    }
    tick();
  });

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    $$('[data-install]').forEach(function (el) { el.hidden = false; });
  });
  $$('[data-install-btn]').forEach(function (b) {
    b.addEventListener('click', function () { if (deferred) { deferred.prompt(); deferred = null; } });
  });
})();
