// =============================================================
//  Struktur database (Cloudflare D1) + data awal
//  Tabel dibuat OTOMATIS saat API pertama kali dipanggil,
//  jadi Anda tidak perlu menjalankan SQL manual.
// =============================================================

export const SCHEMA_VERSION = '2';

export const TABLES = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS units (
    slug TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, short TEXT, tagline TEXT,
    color TEXT, icon TEXT, logo TEXT, cover TEXT, description TEXT, visi TEXT, misi TEXT,
    kompetensi TEXT, prospek TEXT, head_name TEXT, head_title TEXT, head_photo TEXT,
    phone TEXT, email TEXT, instagram TEXT, parent TEXT, sort INTEGER DEFAULT 0, updated_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, name TEXT,
    password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'unit', unit_slug TEXT,
    active INTEGER DEFAULT 1, created_at TEXT, last_login TEXT)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (username TEXT, ts INTEGER)`,
  `CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE, title TEXT NOT NULL, excerpt TEXT,
    content TEXT, cover TEXT, category TEXT DEFAULT 'kegiatan', unit_slug TEXT DEFAULT 'sekolah',
    status TEXT DEFAULT 'publish', featured INTEGER DEFAULT 0, views INTEGER DEFAULT 0,
    author_id INTEGER, author_name TEXT, published_at TEXT, created_at TEXT, updated_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_unit ON posts(unit_slug, status, published_at)`,
  `CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, date TEXT NOT NULL,
    end_date TEXT, time TEXT, location TEXT, unit_slug TEXT DEFAULT 'sekolah', created_by INTEGER, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT NOT NULL, caption TEXT,
    unit_slug TEXT DEFAULT 'sekolah', created_by INTEGER, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS lowongan (
    id INTEGER PRIMARY KEY AUTOINCREMENT, company TEXT NOT NULL, position TEXT NOT NULL, location TEXT,
    job_type TEXT DEFAULT 'Penuh waktu', majors TEXT, deadline TEXT, description TEXT, apply_link TEXT,
    logo TEXT, status TEXT DEFAULT 'buka', created_by INTEGER, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS skema (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, name TEXT NOT NULL, major TEXT, level TEXT,
    units_count INTEGER, description TEXT, sort INTEGER DEFAULT 0, created_by INTEGER, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT, subject TEXT,
    message TEXT, is_read INTEGER DEFAULT 0, created_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY, mime TEXT, data BLOB, size INTEGER, unit_slug TEXT, created_by INTEGER, created_at TEXT)`,
];

// ---------- Pengaturan awal situs (semua bisa diubah di Admin > Pengaturan) ----------
export const DEFAULT_SETTINGS = {
  school_name: 'SMK Negeri 8 Surabaya',
  school_short: 'SMKN 8 Surabaya',
  tagline: 'Sekolah vokasi di jantung Kota Pahlawan',
  hero_title: 'Belajar di kota, siap berkarya di industri.',
  hero_subtitle: 'Lima program keahlian kreatif dan layanan — Kecantikan, Perhotelan, Kuliner, DKV, dan Tata Busana — dengan Teaching Factory di setiap keahlian, didukung LSP P1 dan Bursa Kerja Khusus.',
  hero_image: '',
  running_text: 'Selamat datang di website resmi SMK Negeri 8 Surabaya • Ikuti kegiatan terbaru kami di Instagram @smekdels',
  address: 'Jl. Kamboja No. 18, Surabaya, Jawa Timur',
  phone: '',
  whatsapp: '',
  email: 'admin@smkn8-sby.sch.id',
  instagram: 'smekdels',
  facebook: 'smekdels',
  youtube: 'smkn8sbyofficial',
  maps_query: 'SMK Negeri 8 Surabaya Jl. Kamboja No. 18',
  npsn: '',
  akreditasi: '',
  principal_name: '',
  principal_title: 'Kepala SMK Negeri 8 Surabaya',
  principal_photo: '',
  principal_message: 'Assalamu’alaikum warahmatullahi wabarakatuh, salam sejahtera bagi kita semua.\n\nSelamat datang di website resmi SMK Negeri 8 Surabaya. Website ini kami hadirkan sebagai ruang informasi dan etalase karya warga sekolah — dari kegiatan program keahlian, layanan sertifikasi profesi, hingga informasi lowongan kerja bagi lulusan.\n\nSemoga website ini bermanfaat bagi siswa, orang tua, alumni, dunia usaha dan dunia industri, serta masyarakat luas.',
  visi: 'Silakan isi visi sekolah melalui menu Admin > Pengaturan.',
  misi: 'Silakan isi misi sekolah (satu baris satu poin) melalui menu Admin > Pengaturan.',
  sejarah: 'Silakan isi sejarah singkat sekolah melalui menu Admin > Pengaturan.',
  stat_siswa: '',
  stat_guru: '',
  stat_mitra: '',
  stat_alumni: '',
  spmb_link: '',
};

// ---------- 5 Program Keahlian + 2 Lembaga ----------
export const DEFAULT_UNITS = [
  {
    slug: 'kecantikan', type: 'jurusan', sort: 1, name: 'Kecantikan', short: 'KCT', color: '#D6457E', icon: 'kecantikan',
    tagline: 'Tata kecantikan kulit & rambut, spa, dan perawatan profesional.',
    description: 'Program Keahlian Kecantikan membekali siswa dengan keterampilan perawatan kulit wajah dan badan, tata rias, perawatan rambut, serta layanan spa sesuai standar industri kecantikan. Pembelajaran dilaksanakan di laboratorium salon dan spa sekolah serta praktik kerja lapangan di mitra industri.',
    kompetensi: 'Perawatan kulit wajah & badan\nTata rias wajah (make-up) sehari-hari, pengantin, dan karakter\nPerawatan, pewarnaan, dan penataan rambut\nPerawatan tangan, kaki, dan kuku (manicure-pedicure)\nLayanan spa & body treatment\nKewirausahaan salon kecantikan',
    prospek: 'Beautician / terapis kecantikan\nMake-up artist (MUA)\nHair stylist\nTerapis spa\nBeauty advisor\nWirausaha salon & bridal',
  },
  {
    slug: 'perhotelan', type: 'jurusan', sort: 2, name: 'Perhotelan', short: 'PH', color: '#C08A1E', icon: 'perhotelan',
    tagline: 'Layanan akomodasi hotel berstandar hospitality internasional.',
    description: 'Program Keahlian Perhotelan menyiapkan tenaga profesional bidang akomodasi dan layanan tamu: front office, housekeeping, laundry, hingga food & beverage service. Siswa berlatih di mock-up hotel sekolah dan menjalani praktik kerja di hotel mitra di Surabaya dan sekitarnya.',
    kompetensi: 'Front office & reservasi\nHousekeeping & room division\nLaundry dan linen\nFood & beverage service\nKomunikasi & bahasa Inggris pelayanan tamu\nEtika dan standar layanan hospitality',
    prospek: 'Front office agent / receptionist\nRoom attendant & housekeeper\nWaiter / waitress & bartender\nStaf kapal pesiar (cruise)\nStaf event & MICE\nWirausaha homestay / guest house',
  },
  {
    slug: 'kuliner', type: 'jurusan', sort: 3, name: 'Kuliner / Tata Boga', short: 'KUL', color: '#D9481F', icon: 'kuliner',
    tagline: 'Dari dapur sekolah ke dapur profesional dan usaha kuliner.',
    description: 'Program Keahlian Kuliner (Tata Boga) membentuk juru masak dan pelaku usaha kuliner yang menguasai pengolahan makanan Indonesia dan kontinental, pastry & bakery, sanitasi dan higiene, serta manajemen usaha boga.',
    kompetensi: 'Pengolahan makanan Indonesia & kontinental\nPastry dan bakery\nHigiene dan sanitasi pangan (HACCP dasar)\nPenataan dan penyajian hidangan (plating)\nPengelolaan dapur profesional\nKewirausahaan kuliner',
    prospek: 'Cook / commis di hotel & restoran\nPastry chef / baker\nStaf katering\nFood stylist\nCrew kapal pesiar\nWirausaha kuliner & UMKM pangan',
  },
  {
    slug: 'dkv', type: 'jurusan', sort: 4, name: 'Desain Komunikasi Visual', short: 'DKV', color: '#1594C4', icon: 'dkv',
    tagline: 'Desain grafis, fotografi, videografi, dan animasi untuk industri kreatif.',
    description: 'Program Keahlian Desain Komunikasi Visual (DKV) mengembangkan kreativitas siswa dalam menyampaikan pesan secara visual melalui desain grafis, ilustrasi, fotografi, videografi, animasi, dan konten digital. Siswa terbiasa mengerjakan proyek nyata untuk sekolah, mitra industri, dan media sosial.',
    kompetensi: 'Dasar-dasar desain, nirmana & tipografi\nDesain grafis & identitas visual (branding)\nIlustrasi digital\nFotografi produk dan dokumentasi\nVideografi, editing video & motion graphic\nDesain konten media sosial & UI dasar',
    prospek: 'Desainer grafis\nIlustrator\nFotografer / videografer\nVideo editor & motion designer\nContent creator / social media designer\nFreelancer & wirausaha studio kreatif',
  },
  {
    slug: 'tata-busana', type: 'jurusan', sort: 5, name: 'Tata Busana', short: 'TB', color: '#7C4BC4', icon: 'busana',
    tagline: 'Merancang, membuat, dan memasarkan busana bernilai jual.',
    description: 'Program Keahlian Tata Busana membekali siswa dengan keterampilan desain busana, pembuatan pola, menjahit, menghias kain, hingga manajemen produksi dan pemasaran produk fashion.',
    kompetensi: 'Menggambar & mendesain busana\nPembuatan pola (konstruksi & draping)\nMenjahit busana wanita, pria, dan anak\nHiasan busana & kain (bordir, payet, ecoprint)\nProduksi busana industri\nPemasaran produk fashion',
    prospek: 'Fashion designer\nPattern maker\nPenjahit / tailor profesional\nQuality control garmen\nFashion stylist\nWirausaha butik & konveksi',
  },
  {
    slug: 'lsp', type: 'lembaga', sort: 6, name: 'LSP P1 SMKN 8 Surabaya', short: 'LSP', color: '#E3262B', icon: 'lsp', logo: '/assets/img/logo-lsp.png',
    tagline: 'Lembaga Sertifikasi Profesi Pihak Pertama — sertifikasi kompetensi siswa.',
    description: 'LSP P1 SMK Negeri 8 Surabaya melaksanakan uji kompetensi dan sertifikasi profesi bagi peserta didik sesuai skema yang ditetapkan, sehingga lulusan memiliki pengakuan kompetensi yang diakui dunia industri.',
    kompetensi: 'Asesmen dan uji kompetensi siswa\nPenerbitan sertifikat kompetensi\nPengembangan skema sertifikasi\nPembinaan asesor kompetensi\nPengelolaan Tempat Uji Kompetensi (TUK)',
    prospek: '',
  },
  {
    slug: 'bkk', type: 'lembaga', sort: 7, name: 'Bursa Kerja Khusus (BKK)', short: 'BKK', color: '#16966A', icon: 'bkk',
    tagline: 'Menghubungkan lulusan dengan dunia usaha dan dunia industri.',
    description: 'Bursa Kerja Khusus SMK Negeri 8 Surabaya memberikan layanan informasi lowongan kerja, rekrutmen bersama mitra industri, bimbingan karier, serta penelusuran alumni (tracer study).',
    kompetensi: 'Informasi lowongan kerja\nRekrutmen & seleksi bersama mitra industri\nBimbingan karier dan persiapan kerja\nPenelusuran alumni (tracer study)\nKerja sama penempatan magang/PKL',
    prospek: '',
  },
];

// ---------- 5 Teaching Factory (TEFA) — setara lembaga, terhubung ke jurusan induknya ----------
const TEFA = [
  ['tefa-kecantikan', 'kecantikan', 'TEFA Kecantikan', '#D6457E', 'kecantikan', 'Salon & spa sekolah — layanan kecantikan oleh siswa terlatih.',
    'Teaching Factory Kecantikan adalah unit produksi/jasa Program Keahlian Kecantikan yang melayani masyarakat dengan standar salon profesional. Siswa belajar langsung melayani pelanggan di bawah bimbingan guru.',
    'Perawatan wajah (facial)\nCreambath & perawatan rambut\nPotong & penataan rambut\nTata rias (make-up) acara & wisuda\nManicure & pedicure\nBody spa & lulur'],
  ['tefa-perhotelan', 'perhotelan', 'TEFA Perhotelan', '#C08A1E', 'perhotelan', 'Layanan hospitality sekolah dengan standar hotel.',
    'Teaching Factory Perhotelan adalah unit layanan hospitality Program Keahlian Perhotelan. Siswa mempraktikkan standar pelayanan hotel secara nyata kepada tamu dan pelanggan.',
    'Layanan laundry & linen\nPenataan kamar / ruang & housekeeping\nLayanan tamu & penyelenggaraan acara\nFood & beverage service\nCoffee & mocktail service'],
  ['tefa-kuliner', 'kuliner', 'TEFA Kuliner', '#D9481F', 'kuliner', 'Produksi kue, roti, dan katering hasil olahan siswa.',
    'Teaching Factory Kuliner adalah unit produksi Program Keahlian Kuliner/Tata Boga yang memproduksi dan memasarkan produk makanan dengan standar higiene dan kualitas industri.',
    'Pesanan kue & roti\nSnack box & nasi kotak\nKatering acara\nPastry & dessert\nProduk kuliner kemasan'],
  ['tefa-dkv', 'dkv', 'TEFA DKV', '#1594C4', 'dkv', 'Studio kreatif sekolah — desain, foto, dan video.',
    'Teaching Factory DKV adalah studio kreatif Program Keahlian Desain Komunikasi Visual yang menerima proyek desain dan produksi konten dari sekolah, UMKM, dan masyarakat.',
    'Desain logo & identitas visual\nDesain banner, poster & media cetak\nFoto produk & dokumentasi acara\nVideo profil & konten media sosial\nDesain kemasan produk'],
  ['tefa-busana', 'tata-busana', 'TEFA Busana', '#7C4BC4', 'busana', 'Jasa jahit dan produk fashion karya siswa.',
    'Teaching Factory Busana adalah unit produksi Program Keahlian Tata Busana yang menerima pesanan jahitan dan memproduksi produk fashion dengan standar industri garmen.',
    'Jahit seragam & busana custom\nPermak & alterasi pakaian\nBusana muslim & kebaya\nProduk ecoprint & aksesoris\nSouvenir dan merchandise kain'],
].map(([slug, parent, name, color, icon, tagline, description, kompetensi], i) => ({
  slug, parent, name, color, icon, tagline, description, kompetensi, type: 'tefa', short: name, prospek: '', sort: 8 + i,
}));
DEFAULT_UNITS.push(...TEFA);

// ---------- Migrasi untuk database yang sudah terpasang ----------
// Dijalankan sekali saat versi skema naik. Setiap perintah boleh gagal (mis. kolom sudah ada).
export const MIGRATIONS = [
  `ALTER TABLE units ADD COLUMN parent TEXT`,
  // Multimedia -> DKV (hanya jika data lama masih ada)
  `UPDATE units SET slug='dkv', name='Desain Komunikasi Visual', short='DKV', icon='dkv',
     logo=CASE WHEN logo='/assets/img/logo-mm.png' THEN '' ELSE logo END,
     tagline='Desain grafis, fotografi, videografi, dan animasi untuk industri kreatif.'
   WHERE slug='multimedia' AND NOT EXISTS (SELECT 1 FROM units WHERE slug='dkv')`,
  `UPDATE posts SET unit_slug='dkv' WHERE unit_slug='multimedia'`,
  `UPDATE agenda SET unit_slug='dkv' WHERE unit_slug='multimedia'`,
  `UPDATE gallery SET unit_slug='dkv' WHERE unit_slug='multimedia'`,
  `UPDATE media SET unit_slug='dkv' WHERE unit_slug='multimedia'`,
  `UPDATE users SET unit_slug='dkv' WHERE unit_slug='multimedia'`,
  `UPDATE skema SET major='dkv' WHERE major='multimedia'`,
  `UPDATE lowongan SET majors=trim(replace(','||majors||',', ',multimedia,', ',dkv,'), ',') WHERE ','||majors||',' LIKE '%,multimedia,%'`,
  `UPDATE settings SET value=replace(value, 'Kuliner, Multimedia, dan Tata Busana — didukung', 'Kuliner, DKV, dan Tata Busana — dengan Teaching Factory di setiap keahlian, didukung') WHERE key='hero_subtitle'`,
  `UPDATE posts SET content=replace(content, 'Multimedia, dan Tata Busana', 'Desain Komunikasi Visual (DKV), dan Tata Busana — serta Teaching Factory (TEFA) di setiap keahlian') WHERE id=1`,
];
