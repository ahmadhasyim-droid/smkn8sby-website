# Website SMK Negeri 8 Surabaya

Website resmi SMKN 8 Surabaya dengan **5 Program Keahlian** (Kecantikan, Perhotelan, Kuliner/Tata Boga, Desain Komunikasi Visual/DKV, Tata Busana), **2 Lembaga** (LSP P1 & Bursa Kerja Khusus), dan **5 Teaching Factory (TEFA)** — masing-masing punya halaman, kegiatan, agenda, galeri, dan akun pengelola sendiri.

Teknologi: **GitHub** (penyimpanan kode) → **Cloudflare Pages** (hosting gratis) + **Cloudflare D1** (database gratis). Tidak perlu hosting berbayar.

---

## 1. Struktur website

```
Beranda
├── Profil Sekolah (sambutan, sejarah, visi-misi)
├── Program Keahlian
│   ├── Kecantikan        → /jurusan/kecantikan
│   ├── Perhotelan        → /jurusan/perhotelan
│   ├── Kuliner/Tata Boga → /jurusan/kuliner
│   ├── DKV               → /jurusan/dkv
│   └── Tata Busana       → /jurusan/tata-busana
├── Lembaga
│   ├── LSP P1            → /lembaga/lsp   (+ daftar skema sertifikasi)
│   └── BKK               → /lembaga/bkk   (+ daftar lowongan kerja)
├── TEFA (Teaching Factory) — setara lembaga, terhubung ke jurusan induknya
│   ├── TEFA Kecantikan   → /tefa/kecantikan
│   ├── TEFA Perhotelan   → /tefa/perhotelan
│   ├── TEFA Kuliner      → /tefa/kuliner
│   ├── TEFA DKV          → /tefa/dkv
│   └── TEFA Busana       → /tefa/busana
├── Berita & Kegiatan (bisa difilter per jurusan/lembaga)
├── Agenda
├── Galeri
├── Kontak (formulir pesan + peta)
└── Panel Admin           → /admin
```

Setiap halaman jurusan berisi: profil, visi-misi, kompetensi, prospek karier, **skema LSP untuk jurusan itu**, **lowongan BKK yang relevan**, **tautan ke TEFA-nya**, kegiatan, agenda, galeri, dan kontak Kaprog.

Setiap halaman TEFA berisi: profil, **produk & layanan**, tombol **Pesan via WhatsApp** (muncul setelah nomor WA diisi), kegiatan, agenda, galeri, dan tautan ke program keahlian induknya.

## 2. Tingkatan akses (user)

| Peran | Bisa mengelola |
|---|---|
| **Administrator** | Semua: berita semua unit, agenda, galeri, profil semua jurusan/lembaga, lowongan, skema, pengaturan situs, pengguna, pesan masuk |
| **Pengelola Jurusan** (mis. akun Kuliner) | Berita/kegiatan, agenda, galeri, dan profil **jurusannya sendiri saja** |
| **Pengelola Lembaga LSP** | Seperti di atas + **Skema Sertifikasi** |
| **Pengelola Lembaga BKK** | Seperti di atas + **Lowongan Kerja** |
| **Pengelola TEFA** (mis. akun TEFA Kuliner) | Berita/kegiatan, agenda, galeri, dan profil + produk/layanan **TEFA-nya sendiri** |

Saran nama akun (dibuat oleh admin di menu **Pengguna & Akses**):

| Unit | Username contoh |
|---|---|
| Kecantikan | `kecantikan` |
| Perhotelan | `perhotelan` |
| Kuliner/Tata Boga | `kuliner` |
| DKV | `dkv` |
| Tata Busana | `tatabusana` |
| LSP P1 | `lsp` |
| BKK | `bkk` |
| TEFA Kecantikan | `tefa.kecantikan` |
| TEFA Perhotelan | `tefa.perhotelan` |
| TEFA Kuliner | `tefa.kuliner` |
| TEFA DKV | `tefa.dkv` |
| TEFA Busana | `tefa.busana` |

---

## 3. Cara memasang (sekali saja)

> Siapkan: akun **GitHub** dan akun **Cloudflare** (gratis). Tampilan dasbor Cloudflare bisa sedikit berbeda dari panduan ini, tetapi nama menunya sama.

### Langkah A — Unggah kode ke GitHub
1. Masuk ke github.com → klik **New repository** → beri nama `smkn8sby-website` → **Create repository**.
2. Klik **uploading an existing file**, lalu seret **seluruh isi folder** proyek ini (folder `public`, `functions`, `lib`, dan file `wrangler.toml`, `package.json`, `README.md`, `.gitignore`).
   > Penting: yang diunggah adalah *isi* folder, sehingga di halaman repo langsung terlihat folder `public` dan `functions`.
3. Klik **Commit changes**.

### Langkah B — Buat database D1
1. Masuk ke dash.cloudflare.com → menu **Storage & Databases → D1 SQL Database** → **Create**.
2. Nama database: `smkn8sby-db` → **Create**.
3. Salin **Database ID** (deretan huruf-angka panjang).
4. Kembali ke GitHub, buka file `wrangler.toml` → klik ikon pensil (Edit) → ganti
   `GANTI-DENGAN-DATABASE-ID-ANDA` dengan Database ID tadi → **Commit changes**.

### Langkah C — Hubungkan ke Cloudflare Pages
1. Di Cloudflare: **Workers & Pages → Create → Pages → Import an existing Git repository**.
2. Hubungkan akun GitHub, pilih repo `smkn8sby-website` → **Begin setup**.
3. Pengaturan build:
   - Framework preset: **None**
   - Build command: *(kosongkan)*
   - Build output directory: **`public`**
4. Klik **Save and Deploy**. Tunggu 1–2 menit hingga selesai.
5. Website sudah bisa dibuka di alamat `https://smkn8sby.pages.dev` (atau nama serupa).

> Tabel database dibuat **otomatis** saat website pertama kali dibuka — tidak perlu menjalankan SQL apa pun.

### Langkah D — Buat akun admin (SEGERA setelah deploy)
1. Buka `https://alamat-website-anda/admin`
2. Karena belum ada akun, akan muncul formulir **Buat akun admin**. Isi nama, username, dan password (min. 8 karakter).
3. Selesai — Anda langsung masuk ke panel.

> ⚠️ Lakukan langkah ini segera, karena formulir pembuatan admin pertama hanya muncul sekali dan dapat diisi siapa pun yang lebih dulu membukanya.

### Langkah E — Pasang domain sekolah (opsional)
1. Di proyek Pages → tab **Custom domains** → **Set up a custom domain**.
2. Masukkan mis. `smkn8-sby.sch.id` atau `www.smkn8-sby.sch.id`.
3. Ikuti petunjuk Cloudflare. Jika DNS domain `.sch.id` belum dikelola Cloudflare, tambahkan **CNAME** di pengelola DNS domain sekolah yang mengarah ke `smkn8sby.pages.dev` sesuai yang ditampilkan Cloudflare.

---

## 4. Yang perlu diisi admin setelah login

Menu **Pengaturan Situs**:
- Nama & foto kepala sekolah, kata sambutan
- NPSN, akreditasi, nomor telepon/WhatsApp
- Sejarah, visi, misi sekolah
- Angka statistik (jumlah siswa, guru, mitra industri, % lulusan terserap) — kosongkan bila tidak ingin ditampilkan
- Foto latar beranda (opsional) dan tautan SPMB/PPDB

Menu **Profil Jurusan & Lembaga** (atau oleh masing-masing pengelola):
- Logo jurusan/TEFA (logo LSP sudah terpasang; yang lain memakai ikon sementara)
- Untuk TEFA: daftar produk & layanan serta nomor WhatsApp pemesanan
- Foto sampul, nama Kaprog, kontak, visi-misi
- Periksa kembali daftar kompetensi, prospek karier, serta produk & layanan TEFA (sudah terisi contoh umum, silakan disesuaikan dengan kondisi nyata)

Alamat awal: *Jl. Kamboja No. 18, Surabaya* — mohon dicek dan dilengkapi.

## 5. Cara memperbarui tampilan/kode

Ubah file di GitHub (atau unggah ulang) → Cloudflare Pages otomatis men-deploy ulang dalam 1–2 menit. **Isi website (berita, foto, dll.) tidak hilang** karena tersimpan di database D1.

## 5a. Video YouTube & feed Instagram otomatis

**YouTube** — beranda (bagian *SMKN 8 TV*) dan halaman Galeri otomatis menampilkan video terbaru dari kanal
**SMK NEGERI 8 SURABAYA OFFICIAL** (`https://www.youtube.com/channel/UCX2sYNy6UZ77yifIu7dr-TQ`).
Tidak perlu API key. Daftar video diperbarui tiap 1 jam. Video baru diputar saat diklik, sehingga halaman tetap ringan.
Link kanal bisa diganti di *Admin → Pengaturan Situs → Kontak & media sosial* (gunakan link berbentuk `/channel/UC…`).

**Instagram** — ada 3 kemungkinan tampilan di beranda:
1. **Feed otomatis** (12 postingan terbaru, diperbarui tiap jam) — pilih salah satu sumber:
   - **Cara mudah — Behold.so:** daftar di behold.so → *Connect Instagram* (login @skadela_sby) → buat feed tipe **JSON** →
     salin URL feed (`https://feeds.behold.so/…`) → tempel di *Admin → Pengaturan Situs → URL feed Instagram (JSON)* → Simpan.
   - **Tanpa layanan pihak ketiga — access token Meta** (langkah di bawah).
2. **Postingan pilihan** — bila token belum ada, tempel link postingan IG (satu per baris) di
   *Admin → Pengaturan Situs → Video & Instagram otomatis*.
3. Bila keduanya kosong, tampil tombol **Ikuti @skadela_sby**.

### Cara mendapatkan token Instagram (sekali saja)
> Tampilan situs Meta sering berubah; nama menu bisa sedikit berbeda.
1. Pastikan akun **@skadela_sby** adalah akun **Profesional** (Bisnis/Kreator):
   aplikasi Instagram → Pengaturan → *Jenis akun dan alat* → *Beralih ke akun profesional*.
2. Buka **developers.facebook.com** → login → **My Apps → Create App**.
   Pilih use case **Instagram** (mis. *Manage messaging & content on Instagram*), beri nama aplikasi mis. "Website SMKN 8".
3. Di dasbor aplikasi: **Instagram → API setup with Instagram login** → bagian **Generate access tokens** → **Add account** → login sebagai @skadela_sby → izinkan.
   - Bila diminta, tambahkan @skadela_sby sebagai **Instagram Tester** di *App roles*, lalu terima undangannya di aplikasi Instagram
     (Pengaturan → *Aplikasi dan situs web* → *Undangan penguji*).
4. Klik **Generate token**, salin token yang muncul.
5. Tempel di **Admin → Pengaturan Situs → Instagram access token** → **Simpan**.

Token berlaku 60 hari dan **diperpanjang otomatis** oleh website setiap ±7 hari selama website dikunjungi.
Token tersimpan di database dan tidak pernah dikirim ke pengunjung. Bila feed berhenti (mis. token kedaluwarsa), ulangi langkah 4–5.

## 6. Catatan teknis

- **Pembaruan versi:** bila website versi lama (dengan jurusan *Multimedia*) sudah terlanjur dipasang, cukup unggah kode baru ke GitHub. Database otomatis diperbarui: Multimedia berganti menjadi DKV beserta berita, agenda, galeri, akun, skema, dan lowongannya, serta 5 TEFA ditambahkan. Tidak ada data yang hilang.

- Foto otomatis diperkecil di browser (maks. 1600 px) sebelum diunggah, lalu disimpan di D1.
  Paket gratis D1 menampung ±500 MB per database (kira-kira 1.500–2.500 foto). Bila suatu saat penuh, foto bisa dipindahkan ke Cloudflare R2.
- Password disimpan terenkripsi (PBKDF2), sesi login 7 hari, percobaan login dibatasi (8× per 15 menit).
- Cadangan database: Cloudflare D1 → `smkn8sby-db` → menu **Time Travel** (pemulihan hingga 30 hari ke belakang).

### Struktur folder
```
public/            → halaman website (HTML, CSS, JS, logo)
  admin/           → panel admin
  assets/css       → tampilan
  assets/js        → app.js (situs publik), admin.js (panel)
  _redirects       → alamat cantik /jurusan/..., /lembaga/..., /tefa/..., /berita/...
functions/api/     → API (backend) yang berjalan di Cloudflare
lib/schema.js      → struktur database + data awal 5 jurusan, 2 lembaga, 5 TEFA
wrangler.toml      → konfigurasi Cloudflare (isi Database ID di sini)
```

### Menjalankan di komputer sendiri (opsional, untuk pengembang)
```bash
npm install
npx wrangler d1 create smkn8sby-db     # sekali saja, salin ID ke wrangler.toml
npm run dev                            # buka http://localhost:8788
```

---
Media sosial: Instagram **@skadela_sby** · Facebook **@smekdels** · YouTube **[SMK NEGERI 8 SURABAYA OFFICIAL](https://www.youtube.com/channel/UCX2sYNy6UZ77yifIu7dr-TQ)** · Email **email@smkn8-sby.sch.id**
