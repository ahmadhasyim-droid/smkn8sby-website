# Smanesa Kantin Digital — Panduan Pemasangan di Cloudflare + GitHub

Aplikasi pembayaran kantin non-tunai SMA Negeri 1 Purwoasri.
Berjalan di **Cloudflare Pages** (server) + **Cloudflare D1** (database), kode disimpan di **GitHub**.
Tidak memakai hosting sekolah sama sekali, sehingga LMS dan aplikasi kantin tidak saling memperlambat.

> Gunakan satu akun khusus kantin untuk semuanya: **kantinsmanesa@gmail.com**.
> Akun ini terpisah dari akun pribadi/SiAbsen, sehingga kuota gratis Cloudflare tidak terbagi dan mudah diserahkan ke sekolah kelak.
> Pasang nomor HP pengelola sebagai pemulihan akun Google, dan aktifkan verifikasi dua langkah (2FA) di Google, GitHub, dan Cloudflare.
> Waktu yang dibutuhkan: ± 30–45 menit.

---

## Langkah 0 — Persiapan
- Pastikan kotak masuk **kantinsmanesa@gmail.com** bisa dibuka (kode verifikasi dikirim ke sana).
- Ekstrak file ZIP `smanesa-kantin-cloudflare.zip` di komputer. Isinya folder `smanesa-kantin-cf` dengan subfolder `functions`, `public`, `src`, `tests`.
- Siapkan **kode rahasia (SECRET)**: kalimat acak minimal 32 karakter, misalnya hasil dari situs pembuat password.
  Contoh bentuknya: `Kx7#pQ2m...` (jangan pakai contoh ini).
  **Simpan baik-baik di tempat aman.** Lihat peringatan di Langkah 4.

## Langkah 1 — Akun GitHub
1. Buka **github.com** → *Sign up* → daftar dengan email kantinsmanesa@gmail.com.
2. Aktifkan **2FA**: foto profil → *Settings* → *Password and authentication* → *Enable two-factor authentication*. Simpan *recovery codes*.

## Langkah 2 — Unggah kode ke GitHub
1. Klik **+** (kanan atas) → **New repository**.
   - Repository name: `smanesa-kantin-digital`
   - Pilih **Private**
   - Klik **Create repository**.
2. Di halaman repository baru, klik tautan **uploading an existing file**.
3. Buka folder `smanesa-kantin-cf` di komputer, **pilih semua isinya** (folder `functions`, `public`, `src`, `tests` dan file `package.json`, `PANDUAN.md`, `.gitignore`), lalu seret ke halaman GitHub.
   Pastikan yang diseret adalah *isi* folder, bukan foldernya, sehingga di GitHub terlihat `functions/`, `public/`, `src/` di tingkat paling atas.
4. Klik **Commit changes**.

## Langkah 3 — Akun Cloudflare & database D1
1. Buka **dash.cloudflare.com** → *Sign up* dengan email kantinsmanesa@gmail.com. Aktifkan **2FA** di *My Profile → Authentication*.
2. Menu kiri: **Storage & databases → D1 SQL database → Create database**.
   - Name: `kantin-db`
   - Location: **Asia-Pacific** (agar dekat dengan Indonesia)
   - Klik **Create**.

## Langkah 4 — Membuat proyek Pages yang terhubung ke GitHub
1. Menu kiri: **Workers & Pages → Create**. Pilih tab/tautan **Pages** (bukan Workers) → **Connect to Git**.
   Jika yang muncul formulir Workers, cari tautan *"Looking to deploy Pages? Get started"*.
2. Hubungkan akun GitHub → pilih repository **smanesa-kantin-digital** → *Begin setup*.
3. Isi pengaturan build:
   - Project name: `smanesa-kantin` (alamat awal menjadi `smanesa-kantin.pages.dev`)
   - Framework preset: **None**
   - Build command: *(kosongkan)*
   - Build output directory: **`public`**
4. Klik **Save and Deploy**. Tunggu sampai selesai.
5. Buka proyek → **Settings → Bindings → Add → D1 database**:
   - Variable name: **`DB`** (huruf besar)
   - D1 database: `kantin-db` → *Save*.
6. **Settings → Variables and Secrets → Add**:
   - Type: **Secret**
   - Variable name: **`SECRET`**
   - Value: kode rahasia dari Langkah 0 → *Save*.

   > ⚠️ **PENTING:** SECRET dipakai untuk mengamankan password semua pengguna. **Jangan pernah mengubah atau menghilangkannya** setelah aplikasi dipakai. Jika berubah, semua password lama tidak bisa dipakai lagi dan harus di-reset satu per satu.
7. Buka tab **Deployments** → pada deployment teratas klik **⋯ → Retry deployment** agar pengaturan baru aktif.

## Langkah 5 — Instalasi aplikasi
1. Buka `https://smanesa-kantin.pages.dev`.
2. Muncul halaman **Instalasi**: isi username & password **Admin** dan password awal 4 akun kantin → **Pasang sekarang**.
   Setelah masuk sebagai Admin, buat akun **Petugas Kantin** di menu *Pengguna → Tambah* (peran: Petugas kantin).
3. Selesai. Instalasi otomatis membuat 4 kantin + menunya (harga sesuai banner) dan akun penjual:
   `kantinsekolah`, `busumiyati`, `buwinarsih`, `buin`.
   Halaman instalasi otomatis tertutup setelah ada pengguna.

## Langkah 6 — Alamat kantin.sman1purwoasri.sch.id (opsional, disarankan)
1. Di proyek Pages → **Custom domains → Set up a custom domain** → ketik `kantin.sman1purwoasri.sch.id` → lanjutkan. **Lakukan ini dulu sebelum langkah 2.**
2. Di pengelola DNS domain sekolah (biasanya cPanel hosting sekolah → **Zone Editor**, atau penyedia domain .sch.id), tambahkan catatan:
   - Type: **CNAME**
   - Name: `kantin`
   - Target/Value: `smanesa-kantin.pages.dev`
3. Tunggu beberapa menit sampai status di Cloudflare menjadi **Active**. HTTPS dipasang otomatis.

Menambah satu catatan CNAME ini **tidak mengganggu** website maupun LMS sekolah.

---

## Pemakaian sehari-hari

| Peran | Login dengan | Bisa melakukan |
|---|---|---|
| **Admin** | username admin | Semua menu, termasuk **Pengguna** (data siswa/guru, akun, foto) dan **Pengaturan** (minimal top up, potongan pencairan kantin, jam batas struk) |
| **Petugas kantin** | username petugas | Semua kecuali Pengguna & Pengaturan: top up, tarik tunai, pencairan, pesanan, kelola kantin & menu, laporan |
| **Penjual (kantin)** | username kantin | Melihat pesanan masuk, scan QR struk, terima/tolak pesanan, rekap penjualan, ajukan pencairan tunai |
| **Pembeli (siswa/guru)** | NISN / NIP + password | Pilih menu di semua kantin, bayar dari saldo, tunjukkan QR struk, ajukan tarik saldo ke tunai |

1. **Data awal** — Petugas → *Pengguna* → *Impor data siswa & guru (CSV)*. Unduh template, isi di Excel, simpan sebagai CSV, pilih file, lalu klik *Impor sekarang*. Data dikirim bertahap; biarkan halaman terbuka sampai muncul "Impor selesai". Semua berstatus *Belum registrasi* dengan saldo Rp 0.
2. **Registrasi / top up** — Petugas → *Top Up* → cari NISN → isi nominal → *Proses*. Top up pertama otomatis mengaktifkan akun.
3. **Belanja** — Pembeli login dari HP → pilih kantin → tambah menu → *Keranjang* → *Bayar sekarang*.
4. **Struk & QR** — Satu QR berlaku untuk semua kantin dalam satu pembayaran; setiap kantin hanya mengklaim bagiannya.
5. **Ambil pesanan** — Penjual → *Scan QR* → *Terima & serahkan pesanan*. QR yang sudah diklaim memunculkan peringatan merah bila di-scan lagi.
6. **Tolak/batal** — Dana otomatis kembali ke saldo pembeli.
   **Batas harian:** pesanan yang belum diambil sampai pukul **18.00 WIB** otomatis dibatalkan dan uangnya dikembalikan ke saldo pembeli (tercatat di Riwayat → Mutasi saldo). Peringatan dan hitung mundur tampil di keranjang dan struk. Jam batas bisa diubah di Petugas → *Pengaturan*.
   Karena Cloudflare Pages tidak memakai jadwal otomatis, pembatalan dijalankan pada saat pertama aplikasi dibuka setelah jam batas — sebelum ada yang bisa melihat atau mengklaim pesanan, jadi hasilnya sama. Struk kedaluwarsa tidak bisa diklaim kantin.
7. **Cairkan ke tunai** — Pembeli (*Beranda → Tarik tunai*) atau penjual (*Pesanan → Cairkan*) mengajukan, muncul QR `TR-…`. Petugas → *Pencairan → Scan QR* → **Serahkan tunai**.
8. **Foto profil** — Hanya **Admin** yang bisa memasang/mengganti foto: satu per satu lewat *Pengguna → Ubah*, atau **massal** lewat *Pengguna → Unggah foto massal*. Siswa, guru, kantin, dan petugas tidak bisa mengganti fotonya sendiri.
   **Foto massal:** beri nama file sesuai NISN/NIP (paling aman) atau nama lengkap, mis. `0081234567.jpg` / `Ahmad Fauzi.jpg`. Untuk foto di Google Drive: unduh foldernya (otomatis jadi ZIP), ekstrak, lalu klik *Pilih folder*. Aplikasi menampilkan daftar cocok / tidak ditemukan / nama ganda sebelum mengunggah. Foto otomatis dipotong persegi dan dikecilkan (± 20 KB). Foto pembeli tampil di layar kantin saat scan dan di layar petugas saat pencairan, sehingga mudah memastikan orangnya benar.
9. **Potongan pencairan kantin** — Admin mengatur persentasenya di *Pengaturan* (mis. 2,5%). Hanya berlaku saat saldo **kantin** dicairkan (tidak untuk tarik tunai siswa/guru). Contoh: kantin mencairkan Rp 100.000 → menerima Rp 97.500, Rp 2.500 tercatat sebagai *pendapatan sekolah* di Laporan.
10. **Transfer saldo antarsiswa/guru** — Hanya untuk akun yang **sudah registrasi**.
   - Penerima: *Beranda → QR Saya* lalu tunjukkan QR-nya.
   - Pengirim: *Beranda → Transfer → Scan QR penerima* (atau ketik NISN) → cek nama & foto penerima → isi nominal → masukkan **sandi (password login)** → *Kirim*.
   - Sandi salah 5 kali → transfer dikunci 5 menit. Minimal Rp 500 per transfer.
   - Admin dapat mematikan fitur ini atau membatasi nominal maksimal per transfer di *Pengaturan*. Semua transfer tercatat di Riwayat masing-masing dan di *Laporan*.
11. **Banner promo / poster / iklan** (Admin → *Promo*) — Unggah gambar (ideal 1200 × 500 px), atur tampil untuk *Semua* (juga di halaman masuk), *Siswa & guru*, atau *Penjual kantin*, beserta tanggal mulai/selesai dan tautan opsional. Banner bergeser otomatis di beranda.
12. **Permohonan aktivasi online** — Di halaman masuk ada tombol *Belum aktif? Ajukan aktivasi*. Siswa/guru mengisi NISN/NIP, **nama lengkap (harus cocok dengan data sekolah)**, dan **nomor WhatsApp**, boleh sekaligus mengunggah bukti transfer top up. Permohonan muncul di menu **Verifikasi**.
   Password dikirim lewat tombol **Kirim via WhatsApp** (membuka WhatsApp di HP/komputer petugas dengan pesan siap kirim — tinggal tekan Kirim). Pengiriman otomatis tanpa klik membutuhkan layanan WhatsApp API berbayar, sehingga tidak dipakai.
   Nomor WA juga bisa diisi Admin di *Pengguna*, lewat kolom `wa` pada impor CSV, atau oleh pengguna sendiri di menu *Akun*.
13. **Top up via transfer bank** — Admin mengisi nama bank, nomor rekening, dan atas nama di *Pengaturan*, lalu mencentang *Izinkan top up lewat transfer bank*.
   Siswa/guru: *Beranda → Isi Saldo* → pilih bank → isi nominal → *Lanjut ke pembayaran* → transfer **tepat** sesuai angka yang tampil (sudah termasuk kode unik Rp 1–199 yang ikut masuk saldo) → unggah foto bukti. Petugas/Admin: menu **Verifikasi** → cocokkan dengan **mutasi rekening** → *Terima* (saldo masuk, akun belum aktif sekaligus diaktifkan) atau *Tolak* dengan alasan.
   Uang top up transfer tercatat terpisah sebagai *Uang masuk via transfer bank (di rekening kantin)* di beranda petugas, sehingga cek **Seimbang** = uang tunai + rekening.
   ⚠️ Selalu cek mutasi rekening sungguhan sebelum menekan Terima — foto bukti transfer bisa dipalsukan.
14. **Top up via DANA** (pengganti kupon kertas) — Admin → *Pengaturan → Top up via DANA*: isi nomor DANA petugas (085772384510), nama akun DANA, unggah gambar **QR DANA** (aplikasi DANA → *Terima / QR Saya* → simpan gambar), centang *Izinkan top up lewat DANA*.
   Siswa/guru: *Isi Saldo* → pilih **DANA** → isi nominal → muncul **nominal tepat** (mis. Rp 20.080) + QR DANA petugas → bayar dari aplikasi DANA dengan nominal itu → unggah tangkapan layar. Uang langsung masuk ke akun DANA petugas.
   Petugas: menu **Verifikasi** → buka aplikasi DANA → *Riwayat* → cari uang masuk dengan nominal yang **persis sama** → *Terima*. Saldo siswa bertambah otomatis. Kode unik membuat setiap permintaan punya nominal berbeda sehingga mudah dicocokkan.
   Di beranda petugas tercatat *Uang masuk via DANA (di akun DANA petugas)* dan ikut dihitung dalam cek **Seimbang**. Saldo DANA ini milik kas kantin — sebaiknya rutin dipindahkan ke rekening sekolah dan dicatat.
   ℹ️ DANA pribadi tidak menyediakan sambungan otomatis (API) ke aplikasi lain, jadi pengecekan riwayat DANA tetap dilakukan petugas (cukup beberapa detik per siswa).
15. **Kontrol kas** — Beranda petugas menampilkan *Uang tunai di petugas* dan cek **Seimbang** (tunai + rekening + DANA).

### Pasang di HP seperti aplikasi
Chrome Android: menu ⋮ → *Tambahkan ke layar utama*. iPhone: Safari → Bagikan → *Tambah ke Layar Utama*.

---

## Memperbarui aplikasi
Setiap perubahan file di GitHub (edit langsung di github.com atau unggah ulang) otomatis dipasang Cloudflare dalam 1–2 menit. Data di database **tidak** terhapus; jika versi baru butuh kolom database tambahan (mis. foto profil di v2.1), aplikasi menambahkannya sendiri saat pertama dibuka.

## Batas paket gratis Cloudflare (dan cara memantau)
| Hal | Batas gratis per hari |
|---|---|
| Permintaan ke aplikasi | 100.000 |
| Baris database dibaca / ditulis | 5 juta / 100.000 |
| Ukuran satu database | 500 MB (total akun 5 GB) |

Gambar, CSS, dan JavaScript tidak dihitung dalam batas permintaan. Dengan ± 600 transaksi/hari, database 500 MB diperkirakan cukup untuk 2–3 tahun; pantau ukurannya di D1 → kantin-db. Batas direset setiap pukul **07.00 WIB**.
Pantau di Cloudflare → *Workers & Pages* (grafik permintaan) dan *D1 → kantin-db → Metrics*.
Jika suatu saat mendekati batas, paket **Workers Paid** (± US$5/bulan) menghapus batas harian tersebut.

## Cadangan data
- Unduh laporan rutin: Petugas → *Laporan* → **Unduh CSV (Excel)**.
- D1 punya fitur **Time Travel** untuk memulihkan database ke waktu sebelumnya (Cloudflare → D1 → kantin-db → *Time Travel*).

## Harga yang perlu dicek
Tidak tercantum di banner, diisi perkiraan — sesuaikan di Petugas → *Menu*:
- Bu Sumiyati: Nasi Bungkus (Rp 5.000)
- Bu Winarsih: Bakso (Rp 8.000), Nasi Putih (Rp 2.000)
- Bu In: Rice Bowl (Rp 10.000), Pentol (Rp 2.000)
- Kantin Sekolah: "Aneka Snack Rp 500 – Rp 3.500" dipecah menjadi 4 pilihan (500, 1.000, 2.000, 3.500)

## Keamanan
- Password disimpan terenkripsi (PBKDF2 + SECRET yang tidak tersimpan di database); login dikunci 5 menit setelah 5 kali salah.
- Sesi login terenkripsi; berganti password otomatis mengeluarkan sesi lain.
- Setiap perubahan saldo berjalan atomik: saldo tidak bisa minus dan satu struk/permintaan tidak bisa diproses dua kali, walau diklik bersamaan.
- Repository GitHub harus **Private**. Jangan membagikan SECRET kepada siapa pun.

## Uji coba di komputer (opsional, untuk pengembang)
Butuh Node.js 22+. Di folder proyek jalankan `npm run dev`, lalu buka `http://localhost:8788`. Database uji tersimpan di `tests/data/` dan tidak ikut ke GitHub.
