/*!
 * qr.js — generator QR Code mandiri (byte mode, koreksi galat M, versi 1–10).
 * Tidak memerlukan library/CDN eksternal. Algoritma mengikuti standar ISO/IEC 18004.
 * Pemakaian: QR.svg("TEKS", {size:240}) -> string <svg>
 */
(function (root) {
  'use strict';
  var ECC_CW = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];   // level M
  var NUM_BLK = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];             // level M
  var FORMAT_ECC_M = 0;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_CW[ver] * NUM_BLK[ver];
  }
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }
  function rsDivisor(deg) {
    var res = [];
    for (var i = 0; i < deg - 1; i++) res.push(0);
    res.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (var j = 0; j < res.length; j++) {
        res[j] = gfMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return res;
  }
  function rsRemainder(data, div) {
    var res = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ res.shift();
      res.push(0);
      div.forEach(function (c, i) { res[i] ^= gfMul(c, f); });
    });
    return res;
  }
  function utf8(str) {
    var out = [], s = unescape(encodeURIComponent(str));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }
  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  function encode(text) {
    var bytes = utf8(text), ver;
    for (ver = 1; ver <= 10; ver++) {
      var ccBits = ver < 10 ? 8 : 16;
      if (4 + ccBits + bytes.length * 8 <= dataCodewords(ver) * 8) break;
    }
    if (ver > 10) throw new Error('Teks terlalu panjang untuk QR');
    var bb = [];
    function append(val, len) { for (var i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); }
    append(4, 4);
    append(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { append(b, 8); });
    var cap = dataCodewords(ver) * 8;
    append(0, Math.min(4, cap - bb.length));
    append(0, (8 - bb.length % 8) % 8);
    for (var pad = 0xEC; bb.length < cap; pad ^= 0xEC ^ 0x11) append(pad, 8);
    var data = [];
    for (var i = 0; i < bb.length; i += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bb[i + k];
      data.push(v);
    }
    // ECC + interleave
    var nb = NUM_BLK[ver], eccLen = ECC_CW[ver], raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var div = rsDivisor(eccLen), blocks = [], p = 0;
    for (i = 0; i < nb; i++) {
      var dat = data.slice(p, p + shortLen - eccLen + (i < nShort ? 0 : 1));
      p += dat.length;
      var ecc = rsRemainder(dat, div);
      if (i < nShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var cw = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (var j = 0; j < blocks.length; j++) {
        if (i !== shortLen - eccLen || j >= nShort) cw.push(blocks[j][i]);
      }
    }
    return build(ver, cw);
  }

  function build(ver, cw) {
    var size = ver * 4 + 17, mod = [], fn = [], x, y, i;
    for (y = 0; y < size; y++) {
      mod.push(new Array(size).fill(false));
      fn.push(new Array(size).fill(false));
    }
    function setF(x, y, d) { mod[y][x] = d; fn[y][x] = true; }
    for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = c[0] + dx, yy = c[1] + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4);
      }
    });
    var al = [];
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2;
      var step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      al = [6];
      for (var pos = size - 7; al.length < na; pos -= step) al.splice(1, 0, pos);
      for (i = 0; i < na; i++) for (var j = 0; j < na; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
        for (var dy2 = -2; dy2 <= 2; dy2++) for (var dx2 = -2; dx2 <= 2; dx2++)
          setF(al[i] + dx2, al[j] + dy2, Math.max(Math.abs(dx2), Math.abs(dy2)) !== 1);
      }
    }
    function drawFormat(mask) {
      var d = FORMAT_ECC_M << 3 | mask, r = d;
      for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var b = ((d << 10) | r) ^ 0x5412;
      for (i = 0; i <= 5; i++) setF(8, i, bit(b, i));
      setF(8, 7, bit(b, 6)); setF(8, 8, bit(b, 7)); setF(7, 8, bit(b, 8));
      for (i = 9; i < 15; i++) setF(14 - i, 8, bit(b, i));
      for (i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(b, i));
      for (i = 8; i < 15; i++) setF(8, size - 15 + i, bit(b, i));
      setF(8, size - 8, true);
    }
    drawFormat(0);
    if (ver >= 7) {
      var r = ver;
      for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      var vb = ver << 12 | r;
      for (i = 0; i < 18; i++) {
        var a = size - 11 + i % 3, b2 = Math.floor(i / 3);
        setF(a, b2, bit(vb, i)); setF(b2, a, bit(vb, i));
      }
    }
    // data
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var jj = 0; jj < 2; jj++) {
        x = right - jj;
        var up = ((right + 1) & 2) === 0;
        y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && bi < cw.length * 8) {
          mod[y][x] = bit(cw[bi >>> 3], 7 - (bi & 7));
          bi++;
        }
      }
    }
    function maskFn(m, x, y) {
      switch (m) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return x * y % 2 + x * y % 3 === 0;
        case 6: return (x * y % 2 + x * y % 3) % 2 === 0;
        default: return ((x + y) % 2 + x * y % 3) % 2 === 0;
      }
    }
    function applyMask(m) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++)
        if (!fn[y][x] && maskFn(m, x, y)) mod[y][x] = !mod[y][x];
    }
    function penalty() {
      var s = 0, y, x, run, dark = 0;
      for (y = 0; y < size; y++) {
        run = 1;
        for (x = 1; x < size; x++) {
          if (mod[y][x] === mod[y][x - 1]) { run++; if (run === 5) s += 3; else if (run > 5) s++; }
          else run = 1;
        }
      }
      for (x = 0; x < size; x++) {
        run = 1;
        for (y = 1; y < size; y++) {
          if (mod[y][x] === mod[y - 1][x]) { run++; if (run === 5) s += 3; else if (run > 5) s++; }
          else run = 1;
        }
      }
      for (y = 0; y < size - 1; y++) for (x = 0; x < size - 1; x++) {
        var c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) s += 3;
      }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (mod[y][x]) dark++;
      var total = size * size;
      s += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
      return s;
    }
    var best = 0, bestScore = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); drawFormat(m);
      var sc = penalty();
      if (sc < bestScore) { bestScore = sc; best = m; }
      applyMask(m);
    }
    applyMask(best); drawFormat(best);
    return mod;
  }

  function svg(text, opt) {
    opt = opt || {};
    var m = encode(text), n = m.length, q = 4, dim = n + q * 2, path = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++)
      if (m[y][x]) path += 'M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z';
    var sz = opt.size || 220;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz +
      '" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges" role="img" aria-label="QR ' +
      String(text).replace(/[<>"&]/g, '') + '"><rect width="100%" height="100%" fill="#fff"/><path d="' +
      path + '" fill="#000"/></svg>';
  }

  var api = { matrix: encode, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QR = api;
})(this);
