/** Struktur database D1 (SQLite) dan data awal. */

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pembeli',
    jenis TEXT NOT NULL DEFAULT '',
    kelas TEXT NOT NULL DEFAULT '',
    kantin_id INTEGER NULL,
    saldo INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'belum',
    foto TEXT NOT NULL DEFAULT '',
    wa TEXT NOT NULL DEFAULT '',
    aktivasi_at TEXT NULL,
    created_at TEXT NOT NULL,
    last_login TEXT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS kantin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    pemilik TEXT NOT NULL DEFAULT '',
    spesial TEXT NOT NULL DEFAULT '',
    deskripsi TEXT NOT NULL DEFAULT '',
    banner TEXT NOT NULL DEFAULT '',
    warna TEXT NOT NULL DEFAULT '#c8202f',
    saldo INTEGER NOT NULL DEFAULT 0,
    aktif INTEGER NOT NULL DEFAULT 1,
    urutan INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kantin_id INTEGER NOT NULL,
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'makanan',
    harga INTEGER NOT NULL,
    foto TEXT NOT NULL DEFAULT '',
    tersedia INTEGER NOT NULL DEFAULT 1,
    unggulan INTEGER NOT NULL DEFAULT 0,
    urutan INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pesanan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaksi_id INTEGER NOT NULL,
    kantin_id INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu',
    catatan TEXT NOT NULL DEFAULT '',
    diproses_oleh INTEGER NULL,
    diproses_at TEXT NULL,
    token TEXT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pesanan_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pesanan_id INTEGER NOT NULL,
    menu_id INTEGER NULL,
    nama TEXT NOT NULL,
    harga INTEGER NOT NULL,
    qty INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS mutasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pihak TEXT NOT NULL,
    pihak_id INTEGER NOT NULL,
    jenis TEXT NOT NULL,
    nominal INTEGER NOT NULL,
    saldo_akhir INTEGER NOT NULL,
    ref TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    oleh INTEGER NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS penarikan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT NOT NULL UNIQUE,
    pihak TEXT NOT NULL,
    pihak_id INTEGER NOT NULL,
    nominal INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu',
    catatan TEXT NOT NULL DEFAULT '',
    diproses_oleh INTEGER NULL,
    diproses_at TEXT NULL,
    token TEXT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gambar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mime TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_gagal (
    username TEXT PRIMARY KEY,
    n INTEGER NOT NULL DEFAULT 0,
    sampai INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS promo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL DEFAULT '',
    gambar TEXT NOT NULL,
    tautan TEXT NOT NULL DEFAULT '',
    target TEXT NOT NULL DEFAULT 'semua',
    mulai TEXT NOT NULL DEFAULT '',
    sampai TEXT NOT NULL DEFAULT '',
    aktif INTEGER NOT NULL DEFAULT 1,
    urutan INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS topup_req (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    nominal INTEGER NOT NULL,
    bukti TEXT NOT NULL,
    catatan TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'menunggu',
    alasan TEXT NOT NULL DEFAULT '',
    diproses_oleh INTEGER NULL,
    diproses_at TEXT NULL,
    token TEXT NULL,
    metode TEXT NOT NULL DEFAULT 'bank',
    kode_unik INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pengaturan (
    kunci TEXT PRIMARY KEY,
    nilai TEXT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users (role, status)`,
  `CREATE INDEX IF NOT EXISTS idx_menu_kantin ON menu (kantin_id)`,
  `CREATE INDEX IF NOT EXISTS idx_trx_user ON transaksi (user_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_pesanan_trx ON pesanan (transaksi_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pesanan_kantin ON pesanan (kantin_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_pesanan_token ON pesanan (token)`,
  `CREATE INDEX IF NOT EXISTS idx_item_pesanan ON pesanan_item (pesanan_id)`,
  `CREATE INDEX IF NOT EXISTS idx_mutasi_pihak ON mutasi (pihak, pihak_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_mutasi_jenis ON mutasi (jenis, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_mutasi_ref ON mutasi (ref)`,
  `CREATE INDEX IF NOT EXISTS idx_penarikan ON penarikan (status, pihak, pihak_id)`,
  `CREATE INDEX IF NOT EXISTS idx_penarikan_token ON penarikan (token)`,
  `CREATE INDEX IF NOT EXISTS idx_topup_req ON topup_req (status, user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_topup_req_token ON topup_req (token)`,
];

/* Data awal: 4 kantin + menu (harga sesuai banner "Menu Kantin Smanesa").
 * Item bertanda CEK tidak ada harganya di banner — sesuaikan di Petugas > Menu. */
const MIE = [
  ['Mie Sedap / sejenisnya (Goreng)', 'makanan', 6000],
  ['Mie Sedap / sejenisnya (Kuah)', 'makanan', 6000],
  ['Pop Mie / sejenisnya (Goreng)', 'makanan', 7000],
  ['Pop Mie / sejenisnya (Kuah)', 'makanan', 7000],
  ['Mie Sukses isi 2', 'makanan', 7000],
];
const MINUM = [
  ['Es Teh', 'minuman', 3000], ['Aneka Es', 'minuman', 2000], ['Kopi', 'minuman', 3500],
  ['Nutrisari', 'minuman', 3000], ['Le Minerale Biasa', 'minuman', 3000], ['Air Gelasan', 'minuman', 500],
];

export const SEED_KANTIN = [
  {
    nama: 'Kantin Sekolah', slug: 'kantin-sekolah', pemilik: 'Pengelola Kantin Sekolah',
    spesial: 'Aneka Snack, Makanan & Minuman', warna: '#e4572e', banner: '/assets/img/banner-kantin-sekolah.jpg',
    deskripsi: 'Kantin resmi SMAN 1 Purwoasri — bersih, sehat, bergizi.', akun: ['kantinsekolah', 'Kantin Sekolah'],
    menu: [
      ['Nasi Soto', 'makanan', 7000], ['Nasi Pecel', 'makanan', 6000], ['Mie Ayam', 'makanan', 6000],
      ['Tempe Penyet', 'makanan', 6000], ['Ayam Geprek', 'makanan', 6000], ...MIE,
      ['Aneka Gorengan / sejenisnya', 'makanan', 1000], ['Cireng Isi', 'makanan', 2000],
      ['Aneka Snack Rp 500', 'snack', 500], ['Aneka Snack Rp 1.000', 'snack', 1000],
      ['Aneka Snack Rp 2.000', 'snack', 2000], ['Aneka Snack Rp 3.500', 'snack', 3500],
      ['Kopi', 'minuman', 3500], ['Aneka Es', 'minuman', 2000], ['Es Teh', 'minuman', 3000],
      ['Nutrisari', 'minuman', 3000], ['Le Minerale Biasa', 'minuman', 3000], ['Le Minerale Dingin', 'minuman', 3500],
      ['Prima', 'minuman', 3000], ['Florida dll', 'minuman', 4000], ['Air Gelasan', 'minuman', 500],
      ['Tisu', 'lainnya', 3000],
    ],
  },
  {
    nama: 'Warung Makan Bu Sumiyati', slug: 'bu-sumiyati', pemilik: 'Bu Sumiyati', spesial: 'Spesial Nasi Penyet',
    warna: '#2f7d32', banner: '/assets/img/banner-bu-sumiyati.jpg',
    deskripsi: 'Nasi geprek, nasi tempe penyet, nasi bungkus, mie instan, gorengan & minuman.', akun: ['busumiyati', 'Bu Sumiyati'],
    menu: [
      ['Nasi Geprek', 'makanan', 6000, 1], ['Nasi Tempe Penyet', 'makanan', 6000, 1],
      ['Nasi Bungkus', 'makanan', 5000], // CEK
      ...MIE, ['Aneka Gorengan', 'makanan', 1000], ...MINUM,
    ],
  },
  {
    nama: 'Warung Bu Winarsih', slug: 'bu-winarsih', pemilik: 'Bu Winarsih', spesial: 'Spesial Mie Ayam',
    warna: '#7a1f2b', banner: '/assets/img/banner-bu-winarsih.jpg',
    deskripsi: 'Mie ayam, bakso, mie instan, nasi putih & aneka minuman.', akun: ['buwinarsih', 'Bu Winarsih'],
    menu: [
      ['Mie Ayam', 'makanan', 6000, 1],
      ['Bakso', 'makanan', 8000], // CEK
      ['Nasi Putih', 'makanan', 2000], // CEK
      ...MIE, ...MINUM,
    ],
  },
  {
    nama: 'Warung Bu In', slug: 'bu-in', pemilik: 'Bu In', spesial: 'Spesial Nasi Soto',
    warna: '#b3151b', banner: '/assets/img/banner-bu-in.jpg',
    deskripsi: 'Nasi soto, nasi pecel, rice bowl, mie instan, gorengan, pentol & minuman.', akun: ['buin', 'Bu In'],
    menu: [
      ['Nasi Soto', 'makanan', 7000, 1], ['Nasi Pecel', 'makanan', 6000],
      ['Rice Bowl', 'makanan', 10000], // CEK
      ...MIE, ['Aneka Gorengan', 'makanan', 1000],
      ['Pentol', 'makanan', 2000], // CEK
      ...MINUM,
    ],
  },
];
