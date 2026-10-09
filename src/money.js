/**
 * SEMUA perubahan saldo ada di sini.
 *
 * D1 tidak mendukung transaksi interaktif (BEGIN ... COMMIT), tetapi db.batch()
 * dijalankan sebagai SATU transaksi atomik. Karena itu setiap operasi uang ditulis
 * sebagai satu batch berisi pernyataan "berpenjaga":
 *  - baris mutasi/klaim dibuat hanya jika syaratnya terpenuhi (mis. saldo cukup,
 *    status masih 'menunggu'), ditandai dengan ref/token unik;
 *  - perubahan saldo hanya dijalankan jika baris bertanda itu benar-benar ada.
 * Hasilnya: saldo tidak bisa minus dan satu struk tidak bisa diklaim dua kali,
 * walaupun ada permintaan bersamaan.
 */
import { now, today, addDays, randomCode, token, rupiah, esc, UserError } from './core.js';

const TBL = { user: 'users', kantin: 'kantin' };

/** Pernyataan menambah saldo + catat mutasi (tanpa syarat). */
export function creditStmts(ctx, pihak, id, n, jenis, ref, ket, oleh) {
  const t = TBL[pihak];
  return [
    ctx.st(`UPDATE ${t} SET saldo = saldo + ? WHERE id = ?`, n, id),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT ?, id, ?, ?, saldo, ?, ?, ?, ? FROM ${t} WHERE id = ?`, pihak, jenis, n, ref, ket, oleh, now(), id),
  ];
}

/** Kurangi saldo hanya jika cukup. Mengembalikan true jika berhasil. */
export async function debit(ctx, pihak, id, n, jenis, ket, oleh, prefix = 'MX') {
  const t = TBL[pihak];
  const ref = prefix + '-' + randomCode(10);
  await ctx.batch([
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT ?, id, ?, ?, saldo - ?, ?, ?, ?, ? FROM ${t} WHERE id = ? AND saldo >= ?`,
      pihak, jenis, -n, n, ref, ket, oleh, now(), id, n),
    ctx.st(`UPDATE ${t} SET saldo = saldo - ? WHERE id = ? AND EXISTS (SELECT 1 FROM mutasi WHERE ref = ?)`, n, id, ref),
  ]);
  return !!(await ctx.val('SELECT COUNT(*) FROM mutasi WHERE ref = ?', ref));
}

/** Pembayaran keranjang. items: Map(menuId -> qty), harga: Map(menuId -> harga di keranjang). */
export async function checkout(ctx, user, items, hargaKeranjang) {
  const ids = [...items.keys()];
  const ph = ids.map(() => '?').join(',');
  const menus = await ctx.all(`SELECT m.*, k.nama AS kantin_nama, k.aktif AS kantin_aktif FROM menu m
                               JOIN kantin k ON k.id = m.kantin_id WHERE m.id IN (${ph})`, ...ids);
  if (menus.length !== ids.length) throw new UserError('Ada menu yang sudah dihapus. Periksa kembali keranjang Anda.');

  const perKantin = new Map();
  let total = 0;
  for (const m of menus) {
    if (!m.tersedia || !m.kantin_aktif) throw new UserError(`Menu <b>${esc(m.nama)}</b> sedang habis/tidak tersedia.`);
    if (hargaKeranjang.get(m.id) !== m.harga) {
      throw new UserError(`Harga <b>${esc(m.nama)}</b> berubah menjadi ${rupiah(m.harga)}. Keranjang sudah diperbarui, silakan periksa lalu bayar lagi.`);
    }
    const qty = items.get(m.id);
    const pk = perKantin.get(m.kantin_id) || { nama: m.kantin_nama, items: [], subtotal: 0 };
    pk.items.push([m, qty]);
    pk.subtotal += m.harga * qty;
    perKantin.set(m.kantin_id, pk);
    total += m.harga * qty;
  }

  let kode;
  do { kode = 'SK-' + randomCode(8); } while (await ctx.val('SELECT COUNT(*) FROM transaksi WHERE kode = ?', kode));
  const t = now();
  const ket = 'Belanja di ' + [...perKantin.values()].map((p) => p.nama).join(', ');
  const guard = `EXISTS (SELECT 1 FROM mutasi WHERE ref = ? AND jenis = 'belanja')`;

  const stmts = [
    // 1. catat mutasi hanya jika saldo cukup & akun aktif
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', id, 'belanja', ?, saldo - ?, ?, ?, id, ? FROM users WHERE id = ? AND saldo >= ? AND status = 'aktif'`,
      -total, total, kode, ket, t, user.id, total),
    // 2. potong saldo jika langkah 1 berhasil
    ctx.st(`UPDATE users SET saldo = saldo - ? WHERE id = ? AND ${guard}`, total, user.id, kode),
    // 3. buat transaksi
    ctx.st(`INSERT INTO transaksi (kode, user_id, total, created_at) SELECT ?, ?, ?, ? WHERE ${guard}`, kode, user.id, total, t, kode),
  ];
  for (const [kid, pk] of perKantin) {
    stmts.push(ctx.st(`INSERT INTO pesanan (transaksi_id, kantin_id, subtotal, status, created_at)
                       SELECT id, ?, ?, 'menunggu', ? FROM transaksi WHERE kode = ?`, kid, pk.subtotal, t, kode));
    for (const [m, qty] of pk.items) {
      stmts.push(ctx.st(`INSERT INTO pesanan_item (pesanan_id, menu_id, nama, harga, qty)
                         SELECT ps.id, ?, ?, ?, ? FROM pesanan ps JOIN transaksi tr ON tr.id = ps.transaksi_id
                         WHERE tr.kode = ? AND ps.kantin_id = ?`, m.id, m.nama, m.harga, qty, kode, kid));
    }
  }
  await ctx.batch(stmts);

  if (!(await ctx.val('SELECT COUNT(*) FROM transaksi WHERE kode = ?', kode))) {
    const saldo = await ctx.val('SELECT saldo FROM users WHERE id = ?', user.id);
    throw new UserError(`Saldo tidak cukup. Total belanja <b>${rupiah(total)}</b>, saldo Anda <b>${rupiah(saldo)}</b>. Silakan top up di Petugas Kantin.`);
  }
  return kode;
}

/** Kantin menerima pesanan: status → selesai, saldo kantin bertambah. */
export async function klaimPesanan(ctx, pesanan, kantinId, kode, namaPembeli, olehId) {
  const tok = token();
  const cut = cutoffTerakhir(await jamTutup(ctx));
  const g = 'EXISTS (SELECT 1 FROM pesanan WHERE id = ? AND token = ?)';
  await ctx.batch([
    ctx.st(`UPDATE pesanan SET status = 'selesai', diproses_oleh = ?, diproses_at = ?, token = ?
            WHERE id = ? AND kantin_id = ? AND status = 'menunggu' AND created_at >= ?`, olehId, now(), tok, pesanan.id, kantinId, cut),
    ctx.st(`UPDATE kantin SET saldo = saldo + ? WHERE id = ? AND ${g}`, pesanan.subtotal, kantinId, pesanan.id, tok),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'kantin', id, 'penjualan', ?, saldo, ?, ?, ?, ? FROM kantin WHERE id = ? AND ${g}`,
      pesanan.subtotal, kode, 'Pesanan ' + namaPembeli, olehId, now(), kantinId, pesanan.id, tok),
  ]);
  return !!(await ctx.val('SELECT COUNT(*) FROM pesanan WHERE id = ? AND token = ?', pesanan.id, tok));
}

/** Batalkan/tolak pesanan yang masih menunggu, kembalikan dana ke pembeli. */
export async function batalkanPesanan(ctx, pesananId, statusBaru, alasan, olehId) {
  const p = await ctx.first(`SELECT ps.*, t.user_id, t.kode, k.nama AS kantin FROM pesanan ps
                             JOIN transaksi t ON t.id = ps.transaksi_id JOIN kantin k ON k.id = ps.kantin_id WHERE ps.id = ?`, pesananId);
  if (!p) return false;
  const tok = token();
  const g = 'EXISTS (SELECT 1 FROM pesanan WHERE id = ? AND token = ?)';
  const ket = 'Pengembalian dana ' + p.kantin + (alasan ? ' — ' + alasan : '');
  await ctx.batch([
    ctx.st(`UPDATE pesanan SET status = ?, catatan = ?, diproses_oleh = ?, diproses_at = ?, token = ?
            WHERE id = ? AND status = 'menunggu'`, statusBaru, alasan, olehId, now(), tok, pesananId),
    ctx.st(`UPDATE users SET saldo = saldo + ? WHERE id = ? AND ${g}`, p.subtotal, p.user_id, pesananId, tok),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', id, 'refund', ?, saldo, ?, ?, ?, ? FROM users WHERE id = ? AND ${g}`,
      p.subtotal, p.kode, ket, olehId, now(), p.user_id, pesananId, tok),
  ]);
  return !!(await ctx.val('SELECT COUNT(*) FROM pesanan WHERE id = ? AND token = ?', pesananId, tok));
}

/** Petugas memproses permintaan pencairan tunai. */
export async function prosesPenarikan(ctx, id, petugasId) {
  const r = await ctx.first('SELECT * FROM penarikan WHERE id = ?', id);
  if (!r) throw new UserError('Permintaan tidak ditemukan.');
  const t = TBL[r.pihak];
  const tok = token();
  const g = 'EXISTS (SELECT 1 FROM penarikan WHERE id = ? AND token = ?)';
  const pct = r.pihak === 'kantin' ? await persenPotongan(ctx) : 0;
  const potong = hitungPotongan(r.nominal, pct);
  const nama = await namaPihak(ctx, r.pihak, r.pihak_id);
  const extra = potong > 0 ? [stmtPotongan(ctx, potong, pct, nama, r.kode, petugasId, g, id, tok)] : [];
  await ctx.batch([
    ctx.st(`UPDATE penarikan SET status = 'selesai', diproses_oleh = ?, diproses_at = ?, token = ?
            WHERE id = ? AND status = 'menunggu' AND EXISTS (SELECT 1 FROM ${t} WHERE id = ? AND saldo >= ?)`,
      petugasId, now(), tok, id, r.pihak_id, r.nominal),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT ?, id, ?, ?, saldo - ?, ?, ?, ?, ? FROM ${t} WHERE id = ? AND ${g}`,
      r.pihak, r.pihak === 'kantin' ? 'pencairan' : 'tarik', -r.nominal, r.nominal, r.kode,
      'Dicairkan tunai (permintaan ' + r.kode + ')' + (potong ? ` · potongan ${fmtPct(pct)} = ${rupiah(potong)}, diterima ${rupiah(r.nominal - potong)}` : ''),
      petugasId, now(), r.pihak_id, id, tok),
    ctx.st(`UPDATE ${t} SET saldo = saldo - ? WHERE id = ? AND ${g}`, r.nominal, r.pihak_id, id, tok),
    ...extra,
  ]);
  if (await ctx.val('SELECT COUNT(*) FROM penarikan WHERE id = ? AND token = ?', id, tok)) {
    return `Serahkan uang tunai <b>${rupiah(r.nominal - potong)}</b> kepada <b>${esc(nama)}</b>` +
      (potong ? ` (saldo dikurangi ${rupiah(r.nominal)}, potongan ${fmtPct(pct)} = ${rupiah(potong)}).` : '.');
  }
  const now2 = await ctx.first('SELECT status FROM penarikan WHERE id = ?', id);
  if (now2 && now2.status !== 'menunggu') throw new UserError(`Permintaan ${r.kode} sudah diproses sebelumnya.`);
  throw new UserError(`Saldo tidak lagi mencukupi untuk penarikan ${rupiah(r.nominal)}. Tolak permintaan ini.`);
}

export async function namaPihak(ctx, pihak, id) {
  return (pihak === 'kantin'
    ? await ctx.val('SELECT nama FROM kantin WHERE id = ?', id)
    : await ctx.val('SELECT nama FROM users WHERE id = ?', id)) || '';
}

export async function penarikanMenunggu(ctx, pihak, id) {
  return (await ctx.val("SELECT COALESCE(SUM(nominal),0) FROM penarikan WHERE pihak = ? AND pihak_id = ? AND status = 'menunggu'", pihak, id)) || 0;
}

/* ---------------- Kedaluwarsa harian (default 18.00 WIB) ---------------- */
export async function jamTutup(ctx) {
  const j = String(await ctx.setting('jam_kedaluwarsa', '18:00'));
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(j) ? j : '18:00';
}
/** Batas kedaluwarsa terakhir yang sudah lewat, mis. "2026-10-08 18:00:00". */
export function cutoffTerakhir(jam) {
  const t = today() + ' ' + jam + ':00';
  return now() >= t ? t : addDays(today(), -1) + ' ' + jam + ':00';
}
/** Kapan struk yang dibuat pada createdAt kedaluwarsa. */
export function batasBerlaku(createdAt, jam) {
  const d = String(createdAt).slice(0, 10);
  const t = d + ' ' + jam + ':00';
  return createdAt < t ? t : addDays(d, 1) + ' ' + jam + ':00';
}
export const detikTersisa = (wib) => Math.max(0, Math.floor((Date.parse(wib.replace(' ', 'T') + '+07:00') - Date.now()) / 1000));

let sudahDisapu = '';
/**
 * Batalkan SEMUA pesanan 'menunggu' yang dibuat sebelum batas terakhir dan kembalikan dananya.
 * Satu batch atomik: status → kedaluwarsa, saldo pembeli bertambah, satu baris mutasi per pembeli.
 * Dipanggil di awal setiap permintaan, tetapi hanya bekerja sekali per batas waktu.
 */
export async function sapuKedaluwarsa(ctx) {
  const jam = await jamTutup(ctx);
  const cut = cutoffTerakhir(jam);
  if (sudahDisapu === cut) return 0;
  const tok = 'EXP' + token();
  const t = now();
  const ket = `Pengembalian otomatis: pesanan tidak diambil sampai ${jam.replace(':', '.')} WIB`;
  const ditandai = `SELECT ps.subtotal, tr.user_id FROM pesanan ps JOIN transaksi tr ON tr.id = ps.transaksi_id WHERE ps.token = ?`;
  await ctx.batch([
    ctx.st(`UPDATE pesanan SET status = 'kedaluwarsa', catatan = ?, diproses_at = ?, token = ?
            WHERE status = 'menunggu' AND created_at < ?`, `Kedaluwarsa otomatis ${jam.replace(':', '.')} WIB`, t, tok, cut),
    ctx.st(`UPDATE users SET saldo = saldo + (SELECT COALESCE(SUM(x.subtotal),0) FROM (${ditandai}) x WHERE x.user_id = users.id)
            WHERE id IN (SELECT x.user_id FROM (${ditandai}) x)`, tok, tok),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', x.user_id, 'refund', SUM(x.subtotal), u.saldo, ?, ?, NULL, ?
            FROM (${ditandai}) x JOIN users u ON u.id = x.user_id GROUP BY x.user_id, u.saldo`, 'EXP-' + cut.slice(0, 10), ket, t, tok),
  ]);
  sudahDisapu = cut;
  return 1;
}

/* ---------------- Potongan pencairan kantin (% diatur admin) ---------------- */
export async function persenPotongan(ctx) {
  const v = parseFloat(String(await ctx.setting('potongan_kantin', '0')).replace(',', '.'));
  return Number.isFinite(v) ? Math.min(50, Math.max(0, v)) : 0;
}
export const hitungPotongan = (n, pct) => Math.round((n * pct) / 100);
const fmtPct = (p) => String(p).replace('.', ',') + '%';

/** Pernyataan pencatatan potongan (milik sekolah), dijalankan hanya jika `guardSql` terpenuhi. */
function stmtPotongan(ctx, potong, pct, namaKantin, ref, oleh, guardSql, ...guardParams) {
  return ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
    SELECT 'sistem', 0, 'potongan', ?, ? + COALESCE((SELECT SUM(nominal) FROM mutasi WHERE jenis = 'potongan'), 0), ?, ?, ?, ?
    WHERE ${guardSql}`, potong, potong, ref, `Potongan ${fmtPct(pct)} pencairan ${namaKantin}`, oleh, now(), ...guardParams);
}

/** Pencairan langsung saldo kantin oleh petugas. Mengembalikan {potong, diterima} atau null jika saldo kurang. */
export async function cairkanKantin(ctx, kantin, n, oleh, namaOleh) {
  const pct = await persenPotongan(ctx);
  const potong = hitungPotongan(n, pct);
  const ref = 'CR-' + randomCode(10);
  const ket = `Dicairkan tunai oleh ${namaOleh}` + (potong ? ` (potongan ${fmtPct(pct)} = ${rupiah(potong)}, diterima ${rupiah(n - potong)})` : '');
  const g = `EXISTS (SELECT 1 FROM mutasi WHERE ref = ? AND jenis = 'pencairan')`;
  const st = [
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'kantin', id, 'pencairan', ?, saldo - ?, ?, ?, ?, ? FROM kantin WHERE id = ? AND saldo >= ?`,
      -n, n, ref, ket, oleh, now(), kantin.id, n),
    ctx.st(`UPDATE kantin SET saldo = saldo - ? WHERE id = ? AND ${g}`, n, kantin.id, ref),
  ];
  if (potong > 0) st.push(stmtPotongan(ctx, potong, pct, kantin.nama, ref, oleh, g, ref));
  await ctx.batch(st);
  if (!(await ctx.val("SELECT COUNT(*) FROM mutasi WHERE ref = ? AND jenis = 'pencairan'", ref))) return null;
  return { potong, diterima: n - potong, pct };
}

/* ---------------- Transfer saldo antarpembeli ---------------- */
/** Pindahkan saldo secara atomik. Mengembalikan ref jika berhasil, null jika saldo kurang / penerima tidak valid. */
export async function transferSaldo(ctx, pengirim, penerima, n, catatan) {
  const ref = 'TF-' + randomCode(10);
  const t = now();
  const ketK = `Transfer ke ${penerima.nama} (${penerima.username})` + (catatan ? ` — ${catatan}` : '');
  const ketM = `Transfer dari ${pengirim.nama} (${pengirim.username})` + (catatan ? ` — ${catatan}` : '');
  const g = `EXISTS (SELECT 1 FROM mutasi WHERE ref = ? AND jenis = 'transfer_keluar')`;
  await ctx.batch([
    // 1. catat keluar hanya jika saldo cukup DAN kedua akun aktif
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', id, 'transfer_keluar', ?, saldo - ?, ?, ?, id, ? FROM users
            WHERE id = ? AND role = 'pembeli' AND status = 'aktif' AND saldo >= ?
              AND EXISTS (SELECT 1 FROM users r WHERE r.id = ? AND r.role = 'pembeli' AND r.status = 'aktif' AND r.id <> users.id)`,
      -n, n, ref, ketK, t, pengirim.id, n, penerima.id),
    ctx.st(`UPDATE users SET saldo = saldo - ? WHERE id = ? AND ${g}`, n, pengirim.id, ref),
    ctx.st(`UPDATE users SET saldo = saldo + ? WHERE id = ? AND ${g}`, n, penerima.id, ref),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', id, 'transfer_masuk', ?, saldo, ?, ?, ?, ? FROM users WHERE id = ? AND ${g}`,
      n, ref, ketM, pengirim.id, t, penerima.id, ref),
  ]);
  return (await ctx.val("SELECT COUNT(*) FROM mutasi WHERE ref = ? AND jenis = 'transfer_keluar'", ref)) ? ref : null;
}

/* ---------------- Top up via transfer bank (diverifikasi petugas) ---------------- */
/** Terima permintaan top up transfer: saldo bertambah & akun 'belum' otomatis aktif. Atomik. */
export async function terimaTopupBank(ctx, reqId, oleh) {
  const r = await ctx.first('SELECT * FROM topup_req WHERE id = ?', reqId);
  if (!r) throw new UserError('Permintaan tidak ditemukan.');
  const usr = await ctx.first('SELECT * FROM users WHERE id = ?', r.user_id);
  if (!usr || usr.status === 'nonaktif') throw new UserError('Akun pengguna tidak aktif / sudah dihapus. Tolak permintaan ini.');
  const tok = token();
  const t = now();
  const g = 'EXISTS (SELECT 1 FROM topup_req WHERE id = ? AND token = ?)';
  const metode = r.metode === 'dana' ? 'dana' : 'bank';
  const ket = (usr.status === 'belum' ? 'Registrasi & top up' : 'Top up') + (metode === 'dana' ? ' via DANA (' : ' via transfer bank (') + r.kode + ')';
  await ctx.batch([
    ctx.st(`UPDATE topup_req SET status = 'diterima', diproses_oleh = ?, diproses_at = ?, token = ? WHERE id = ? AND status = 'menunggu'`,
      oleh, t, tok, reqId),
    ctx.st(`UPDATE users SET saldo = saldo + ?, status = CASE WHEN status = 'belum' THEN 'aktif' ELSE status END,
            aktivasi_at = NULL WHERE id = ? AND ${g}`, r.nominal, r.user_id, reqId, tok),
    ctx.st(`INSERT INTO mutasi (pihak, pihak_id, jenis, nominal, saldo_akhir, ref, keterangan, oleh, created_at)
            SELECT 'user', id, ?, ?, saldo, ?, ?, ?, ? FROM users WHERE id = ? AND ${g}`,
      'topup_' + metode, r.nominal, r.kode, ket, oleh, t, r.user_id, reqId, tok),
  ]);
  if (!(await ctx.val('SELECT COUNT(*) FROM topup_req WHERE id = ? AND token = ?', reqId, tok))) {
    throw new UserError('Permintaan ' + r.kode + ' sudah diproses sebelumnya.');
  }
  return { req: r, user: usr, aktivasi: usr.status === 'belum' };
}
