/**
 * Server uji lokal (tidak ikut dipakai di Cloudflare).
 * Menjalankan aplikasi yang sama dengan Cloudflare, memakai SQLite bawaan Node
 * sebagai pengganti D1. Jalankan:  npm run dev   lalu buka http://localhost:8788
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { handle } from '../src/app.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = parseInt(process.env.PORT || '8788', 10);
const DBFILE = process.env.DBFILE || path.join(ROOT, 'tests/data/dev.sqlite');
fs.mkdirSync(path.dirname(DBFILE), { recursive: true });
const sqlite = new DatabaseSync(DBFILE);

/* ---- Tiruan API D1 ---- */
class Stmt {
  constructor(sql, params = []) { this.sql = sql; this.params = params; }
  bind(...p) {
    for (const v of p) if (v === undefined) throw new Error('D1_TYPE_ERROR: undefined bind value');
    return new Stmt(this.sql, p);
  }
  _p() { return sqlite.prepare(this.sql); }
  async first(col) { const r = this._p().get(...this.params); return r ? (col ? r[col] : { ...r }) : null; }
  async all() { return { success: true, results: this._p().all(...this.params).map((r) => ({ ...r })), meta: {} }; }
  async run() { return this._runSync(); }
  _runSync() {
    const st = this._p();
    if (/^\s*(SELECT|WITH)/i.test(this.sql)) return { success: true, results: st.all(...this.params).map((r) => ({ ...r })), meta: { changes: 0 } };
    const info = st.run(...this.params);
    return { success: true, results: [], meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } };
  }
}
const DB = {
  prepare: (sql) => new Stmt(sql),
  async batch(stmts) {
    sqlite.exec('BEGIN');
    try { const r = stmts.map((s) => s._runSync()); sqlite.exec('COMMIT'); return r; }
    catch (e) { sqlite.exec('ROLLBACK'); throw e; }
  },
  async exec(sql) { sqlite.exec(sql); return { count: 1 }; },
};
const env = { DB, SECRET: process.env.SECRET || 'rahasia-uji-lokal-0123456789' };

/* ---- Berkas statis (meniru _routes.json) ---- */
const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/_routes.json'), 'utf8'));
const isStatic = (p) => routes.exclude.some((x) => (x.endsWith('/*') ? p.startsWith(x.slice(0, -1)) : p === x));
const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  if (isStatic(u.pathname)) {
    const f = path.join(ROOT, 'public', path.normalize(u.pathname));
    if (!f.startsWith(path.join(ROOT, 'public')) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(res);
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  try {
    const r = await handle(new Request(u, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
    const h = {};
    r.headers.forEach((v, k) => { h[k] = v; });
    res.writeHead(r.status, h);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end('Server error');
  }
}).listen(PORT, () => console.log(`Smanesa Kantin Digital (uji lokal) → http://localhost:${PORT}`));
