/** Penyimpanan gambar (banner, foto menu, foto profil) di tabel `gambar` D1. */
import { now, UserError } from './core.js';

/** Simpan gambar dari data URL (sudah dikecilkan di browser). Mengembalikan '/img/ID' atau null. */
export async function simpanGambar(ctx, dataUrl, maxB64 = 1_400_000) {
  if (!dataUrl) return null;
  const m = String(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new UserError('Format gambar tidak dikenali. Gunakan JPG/PNG/WEBP.');
  if (m[2].length > maxB64) throw new UserError('Gambar terlalu besar. Gunakan gambar yang lebih kecil.');
  const id = await ctx.insert('INSERT INTO gambar (mime, data, created_at) VALUES (?, ?, ?)', m[1], m[2], now());
  return '/img/' + id;
}

/** Hapus gambar lama (agar database tidak penuh) jika berasal dari /img/ID. */
export async function hapusGambar(ctx, path) {
  const m = String(path || '').match(/^\/img\/(\d+)$/);
  if (m) await ctx.run('DELETE FROM gambar WHERE id = ?', parseInt(m[1], 10));
}
