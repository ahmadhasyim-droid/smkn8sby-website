/* =============================================================
   Impor dokumen ke editor berita: Word (.docx), PDF, PowerPoint (.pptx)
   Semua diproses di browser pengguna — server hanya menerima gambar
   hasil konversi (lewat fungsi upload) dan teks HTML akhir.
   window.DocImport.convert(file, { upload, progress }) -> { html, title, images, warnings }
   ============================================================= */
(() => {
  const V = '/assets/js/vendor/';
  const loaded = {};
  const load = (src, globalName) => (loaded[src] ||= new Promise((ok, no) => {
    if (window[globalName]) return ok(window[globalName]);
    const s = document.createElement('script'); s.src = V + src;
    s.onload = () => ok(window[globalName]); s.onerror = () => { delete loaded[src]; no(new Error('Gagal memuat modul pembaca dokumen. Periksa koneksi lalu coba lagi.')); };
    document.head.appendChild(s);
  }));
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MIN_IMG = 60; // gambar lebih kecil dari ini (ikon/garis hias) diabaikan

  // ---------- Word (.docx) ----------
  async function fromDocx(file, ctx) {
    const mammoth = await load('mammoth-1.8.0.min.js', 'mammoth');
    ctx.progress('Membaca dokumen Word…');
    let n = 0;
    const res = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, {
      styleMap: ['p[style-name=\'Title\'] => h2:fresh', 'p[style-name=\'Judul\'] => h2:fresh', 'p[style-name=\'Heading 1\'] => h2:fresh', 'p[style-name=\'Heading 2\'] => h3:fresh',
        'p[style-name=\'Heading 3\'] => h4:fresh', 'p[style-name=\'Subtitle\'] => h3:fresh', 'p[style-name=\'Quote\'] => blockquote:fresh'],
      convertImage: mammoth.images.imgElement(async (img) => {
        n++; ctx.progress(`Mengunggah gambar ${n}…`);
        try {
          const blob = new Blob([await img.read()], { type: img.contentType });
          const url = await ctx.upload(blob);
          return url ? { src: url } : { src: '' };
        } catch (e) { ctx.warn(`Gambar ke-${n} tidak dapat dibaca (${img.contentType || 'format tidak dikenal'}) dan dilewati.`); return { src: '' }; }
      }),
    });
    return tidy(res.value);
  }

  // ---------- PDF ----------
  async function fromPdf(file, ctx) {
    const pdfjsLib = await load('pdf-3.11.174.min.js', 'pdfjsLib');
    pdfjsLib.GlobalWorkerOptions.workerSrc = V + 'pdf-3.11.174.worker.min.js';
    ctx.progress('Membaca PDF…');
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
    const OPS = pdfjsLib.OPS;
    const out = [];
    let imgCount = 0, textChars = 0;
    // ukuran huruf rata-rata seluruh dokumen (untuk mengenali judul)
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) pages.push(await pdf.getPage(i));
    const sizes = [];
    const pageText = [];
    for (const page of pages) {
      const tc = await page.getTextContent();
      const items = tc.items.filter((it) => it.str !== undefined);
      items.forEach((it) => { if (it.str.trim()) sizes.push(Math.abs(it.transform[3]) || it.height || 10); });
      pageText.push(items);
    }
    sizes.sort((a, b) => a - b);
    const body = sizes[Math.floor(sizes.length / 2)] || 10;
    for (let p = 0; p < pages.length; p++) {
      ctx.progress(`Memproses halaman ${p + 1} dari ${pages.length}…`);
      const page = pages[p];
      // --- teks: kelompokkan per baris ---
      const lines = [];
      for (const it of pageText[p]) {
        const y = it.transform[5], x = it.transform[4], h = Math.abs(it.transform[3]) || it.height || body;
        let ln = lines.find((l) => l.kind === 'line' && Math.abs(l.y - y) < h * 0.5);
        if (!ln) { ln = { kind: 'line', y, h, parts: [] }; lines.push(ln); }
        ln.parts.push({ x, s: it.str, w: it.width || 0 }); ln.h = Math.max(ln.h, h);
      }
      // --- gambar: posisi dihitung dari matriks transformasi agar urutannya sesuai halaman ---
      const ops = await page.getOperatorList();
      const imgs = [];
      let ctm = [1, 0, 0, 1, 0, 0]; const stack = [];
      const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
      const seen = new Set();
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i], a = ops.argsArray[i];
        if (fn === OPS.save) stack.push(ctm);
        else if (fn === OPS.restore) ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
        else if (fn === OPS.transform) ctm = mul(ctm, a);
        else if (fn === OPS.paintFormXObjectBegin) { stack.push(ctm); if (a[0]) ctm = mul(ctm, a[0]); }
        else if (fn === OPS.paintFormXObjectEnd) ctm = stack.pop() || ctm;
        else if (fn === OPS.paintImageXObject && !seen.has(a[0])) { seen.add(a[0]); imgs.push({ kind: 'img', name: a[0], y: ctm[5] + Math.max(ctm[3], 0), w: Math.abs(ctm[0]) }); }
      }
      const items = [...lines, ...imgs].sort((m, n) => n.y - m.y);
      // --- susun paragraf, daftar berbutir, judul, dan gambar sesuai urutan ---
      let para = null, list = [];
      const flushList = () => { if (list.length) out.push(`<ul>${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`); list = []; };
      const flush = () => { if (para && para.text.trim()) { if (para.kind === 'li') list.push(para.text.trim()); else { flushList(); out.push(`<${para.kind}>${esc(para.text.trim())}</${para.kind}>`); } } para = null; };
      let prevY = null, prevH = body;
      for (const it of items) {
        if (it.kind === 'img') {
          flush(); flushList();
          try {
            const store = it.name.startsWith('g_') ? page.commonObjs : page.objs;
            const img = await new Promise((ok) => { try { store.get(it.name, ok); } catch { ok(null); } });
            if (!img || img.width < MIN_IMG || img.height < MIN_IMG) continue;
            const blob = await imgToBlob(img);
            if (!blob) continue;
            imgCount++; ctx.progress(`Halaman ${p + 1}: mengunggah gambar ${imgCount}…`);
            const url = await ctx.upload(blob);
            const view = page.view[2] - page.view[0];
            const size = it.w > view * 0.6 ? 'img-l' : it.w > view * 0.35 ? 'img-m' : 'img-s';
            if (url) out.push(`<p><img src="${esc(url)}" alt="" class="${size} img-center"></p>`);
          } catch { /* lewati gambar yang tidak dapat dibaca */ }
          prevY = null; continue;
        }
        it.parts.sort((m, n) => m.x - n.x);
        // butir daftar: karakter pertama berupa simbol (•, ▪, -, atau simbol font khusus)
        let parts = it.parts.filter((pt) => pt.s.trim() !== ''), bullet = false; // abaikan potongan kosong
        const first = parts[0]?.s.trim() ?? '';
        if (parts.length > 1 && first.length === 1 && !/[\p{L}\p{N}]/u.test(first)) { bullet = true; parts = parts.slice(1); }
        let t = ''; let lastEnd = null;
        for (const pt of parts) { if (lastEnd !== null && pt.x - lastEnd > it.h * 0.25 && !t.endsWith(' ')) t += ' '; t += pt.s; lastEnd = pt.x + pt.w; }
        t = t.replace(/[-]/g, '').replace(/\s+/g, ' ').trim();
        if (!t) continue;
        const m = t.match(/^([•●▪◦‣\-–])\s+(.*)$/); if (m) { bullet = true; t = m[2]; }
        textChars += t.length;
        const kind = bullet ? 'li' : it.h > body * 1.45 ? 'h2' : it.h > body * 1.15 && t.length < 120 ? 'h3' : 'p';
        const gap = prevY === null ? 1e9 : prevY - it.y;
        const sameBlock = para && para.kind === kind && (kind === 'p' || kind === 'h2' || kind === 'h3') && gap <= Math.max(prevH, it.h) * 1.6;
        const contLi = para && para.kind === 'li' && kind === 'p' && gap <= Math.max(prevH, it.h) * 1.6 && !bullet; // lanjutan butir yang terbungkus ke baris berikutnya
        if (sameBlock || contLi) para.text = para.text.replace(/-$/, '') + (para.text.endsWith('-') ? '' : ' ') + t;
        else { flush(); if (kind !== 'li') flushList(); para = { kind, text: t }; }
        prevY = it.y; prevH = it.h;
      }
      flush(); flushList();
    }
    if (textChars < 20 && !imgCount) ctx.warn('PDF ini tampaknya hasil pindai (scan) tanpa teks. Ketik ulang isinya atau ekspor ulang dari dokumen aslinya.');
    else if (textChars < 20) ctx.warn('PDF ini tampaknya hasil pindai (scan): isinya dimasukkan sebagai gambar. Bila perlu, ketik ulang teksnya.');
    return out.join('\n');
  }
  async function imgToBlob(img) {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    if (img.bitmap) g.drawImage(img.bitmap, 0, 0);
    else if (img.data) {
      const id = g.createImageData(img.width, img.height), d = img.data, o = id.data;
      if (d.length === img.width * img.height * 4) o.set(d);
      else if (d.length === img.width * img.height * 3) { for (let s = 0, t = 0; s < d.length; s += 3, t += 4) { o[t] = d[s]; o[t + 1] = d[s + 1]; o[t + 2] = d[s + 2]; o[t + 3] = 255; } }
      else if (d.length === img.width * img.height) { for (let s = 0, t = 0; s < d.length; s++, t += 4) { o[t] = o[t + 1] = o[t + 2] = d[s]; o[t + 3] = 255; } }
      else { // 1 bit per piksel (hitam-putih)
        const rowB = Math.ceil(img.width / 8);
        for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) { const bit = (d[y * rowB + (x >> 3)] >> (7 - (x & 7))) & 1, t = (y * img.width + x) * 4; o[t] = o[t + 1] = o[t + 2] = bit ? 255 : 0; o[t + 3] = 255; }
      }
      g.putImageData(id, 0, 0);
    } else return null;
    return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
  }

  // ---------- PowerPoint (.pptx) ----------
  async function fromPptx(file, ctx) {
    const JSZip = await load('jszip-3.10.1.min.js', 'JSZip');
    ctx.progress('Membaca presentasi…');
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const xml = async (path) => { const f = zip.file(path); return f ? new DOMParser().parseFromString(await f.async('text'), 'application/xml') : null; };
    const rels = async (path) => {
      const d = await xml(path); const m = {};
      if (d) for (const r of d.getElementsByTagName('Relationship')) m[r.getAttribute('Id')] = r.getAttribute('Target');
      return m;
    };
    const resolve = (base, target) => { const parts = (base.replace(/[^/]+$/, '') + target).split('/'); const st = []; for (const p of parts) { if (p === '..') st.pop(); else if (p && p !== '.') st.push(p); } return st.join('/'); };
    // urutan slide sesuai presentasi
    const pres = await xml('ppt/presentation.xml'), presRels = await rels('ppt/_rels/presentation.xml.rels');
    let slides = [];
    if (pres) for (const s of pres.getElementsByTagName('p:sldId')) { const t = presRels[s.getAttribute('r:id')]; if (t) slides.push(resolve('ppt/', t)); }
    if (!slides.length) slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);
    const out = []; let imgCount = 0;
    const local = (el, name) => [...el.children].filter((c) => c.localName === name);
    const textOf = (p) => [...p.getElementsByTagName('a:t')].map((t) => t.textContent).join('');
    for (let si = 0; si < slides.length; si++) {
      ctx.progress(`Memproses slide ${si + 1} dari ${slides.length}…`);
      const path = slides[si], doc = await xml(path);
      if (!doc) continue;
      const srel = await rels(path.replace(/slides\/(slide\d+\.xml)$/, 'slides/_rels/$1.rels'));
      const tree = doc.getElementsByTagName('p:spTree')[0];
      if (!tree) continue;
      const block = [];
      let title = '';
      const walk = async (node) => {
        for (const el of node.children) {
          const n = el.localName;
          if (n === 'grpSp') { await walk(el); continue; }
          if (n === 'sp') {
            const ph = el.getElementsByTagName('p:ph')[0], type = ph?.getAttribute('type') || '';
            const tx = el.getElementsByTagName('p:txBody')[0];
            if (!tx) continue;
            const paras = local(tx, 'p').map((p) => ({ t: textOf(p).trim(), lvl: +(p.getElementsByTagName('a:pPr')[0]?.getAttribute('lvl') || 0) })).filter((x) => x.t);
            if (!paras.length) continue;
            if (/title|ctrTitle/i.test(type) && !title) { title = paras.map((x) => x.t).join(' '); continue; }
            if (type === 'sldNum' || type === 'dt' || type === 'ftr') continue;
            if (paras.length === 1) block.push(`<p>${esc(paras[0].t)}</p>`);
            else block.push(`<ul>${paras.map((x) => `<li${x.lvl ? ' style="margin-left:' + x.lvl * 1.2 + 'em"' : ''}>${esc(x.t)}</li>`).join('')}</ul>`);
          } else if (n === 'pic') {
            const blip = el.getElementsByTagName('a:blip')[0], rid = blip?.getAttribute('r:embed');
            const target = rid && srel[rid];
            if (!target) continue;
            const f = zip.file(resolve(path, target));
            if (!f) continue;
            const ext = target.split('.').pop().toLowerCase();
            const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp' }[ext];
            if (!mime) { ctx.warn(`Gambar format .${ext} pada slide ${si + 1} tidak didukung dan dilewati.`); continue; }
            imgCount++; ctx.progress(`Slide ${si + 1}: mengunggah gambar ${imgCount}…`);
            try { const url = await ctx.upload(new Blob([await f.async('arraybuffer')], { type: mime })); if (url) block.push(`<p><img src="${esc(url)}" alt="" class="img-l img-center"></p>`); }
            catch { ctx.warn(`Gambar pada slide ${si + 1} tidak dapat diunggah.`); }
          } else if (n === 'graphicFrame') {
            const tbl = el.getElementsByTagName('a:tbl')[0];
            if (!tbl) continue;
            const rows = [...tbl.getElementsByTagName('a:tr')].map((tr) => `<tr>${[...tr.getElementsByTagName('a:tc')].map((tc) => `<td>${esc(textOf(tc))}</td>`).join('')}</tr>`);
            if (rows.length) block.push(`<table>${rows.join('')}</table>`);
          }
        }
      };
      await walk(tree);
      if (title || block.length) out.push(`${title ? `<h3>${esc(title)}</h3>` : ''}${block.join('')}`);
    }
    return out.join('\n');
  }

  // rapikan HTML hasil konversi
  function tidy(html) {
    const d = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstChild;
    d.querySelectorAll('img').forEach((im) => { if (!im.getAttribute('src')) im.remove(); else if (!im.className) im.className = 'img-l img-center'; });
    d.querySelectorAll('p,h2,h3,h4,li').forEach((el) => { if (!el.textContent.trim() && !el.querySelector('img')) el.remove(); });
    d.querySelectorAll('a[id], a:not([href])').forEach((a) => { if (!a.getAttribute('href')) a.replaceWith(...a.childNodes); });
    return d.innerHTML;
  }

  async function convert(file, opt = {}) {
    const warnings = [], images = [];
    const ctx = {
      progress: opt.progress || (() => {}),
      warn: (m) => warnings.push(m),
      upload: async (blob) => { const u = await opt.upload(blob); if (u) images.push(u); return u; },
    };
    const name = file.name.toLowerCase();
    let html;
    if (/\.docx$/.test(name)) html = await fromDocx(file, ctx);
    else if (/\.pdf$/.test(name) || file.type === 'application/pdf') html = await fromPdf(file, ctx);
    else if (/\.pptx$/.test(name)) html = await fromPptx(file, ctx);
    else if (/\.(doc|ppt)$/.test(name)) throw new Error('Format lama (.doc / .ppt) belum didukung. Buka filenya di Word/PowerPoint lalu "Simpan sebagai" .docx / .pptx (atau PDF), kemudian impor lagi.');
    else throw new Error('Pilih file Word (.docx), PDF, atau PowerPoint (.pptx).');
    html = tidy(html);
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const firstHead = tmp.querySelector('h2,h3');
    const title = (firstHead?.textContent || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')).trim().slice(0, 200);
    if (!tmp.textContent.trim() && !images.length) throw new Error('Tidak ada isi yang bisa dibaca dari dokumen ini.');
    return { html, title, images, warnings };
  }
  window.DocImport = { convert };
})();
