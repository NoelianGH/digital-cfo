# 💼 Digital CFO — Solusi Manajemen Keuangan & Sistem Rekomendasi UMKM

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%205-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger%20UI-85ea2d?style=flat-square&logo=swagger)](http://localhost:5000/api-docs)

**Digital CFO** adalah platform komprehensif manajemen keuangan dan sistem pendukung keputusan (DSS - *Decision Support System*) berbasis kecerdasan buatan (*AI Financial Health Engine*) yang dirancang khusus untuk memberdayakan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia.

---

## 📌 Daftar Isi
1. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
2. [Fitur Utama](#-fitur-utama)
3. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
4. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
5. [Dokumentasi API](#-dokumentasi-api-swagger)
6. [Algoritma & Mesin Keputusan](#-algoritma--mesin-keputusan)
7. [📓 Logbook & Riwayat Pengembangan](#-logbook--riwayat-pengembangan)
8. [Rencana Pengembangan Selanjutnya](#-rencana-pengembangan-selanjutnya-roadmap)

---

## 🏗️ Arsitektur & Tech Stack

Aplikasi ini menggunakan arsitektur monorepo modular yang memisahkan client application (*frontend*) dan RESTful API (*backend*):

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend                  │
│       React 19 • Tailwind CSS v4 • Lucide React        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼ (REST API / JSON / JWT)
┌────────────────────────────────────────────────────────┐
│                  Express.js 5 Backend                  │
│   Auth (JWT & Bcrypt) • Prisma ORM • Fuzzy Tsukamoto   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                   │
│   Users • Stores • Products • Transactions • Sales     │
└────────────────────────────────────────────────────────┘
```

### 💻 Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/), [Lucide React Icons](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Bahasa**: [TypeScript 5](https://www.typescriptlang.org/)

### ⚙️ Backend
- **Runtime & Web Framework**: [Node.js](https://nodejs.org/) & [Express.js 5](https://expressjs.com/)
- **ORM & Database**: [Prisma ORM 6](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)
- **Keamanan**: JSON Web Tokens (`jsonwebtoken`), hashing sandi (`bcryptjs`), proteksi CORS
- **Dokumentasi API**: Swagger OpenAPI 3.0 (`swagger-ui-express`, `swagger-jsdoc`)
- **Intelligence Engine**: Logika Samar (*Fuzzy Logic Tsukamoto*) untuk Skor Kesehatan Finansial & *Simple Additive Weighting (SAW)* untuk DSS.

---

## ✨ Fitur Utama

### 1. 👤 Portal Pemilik Usaha (User)
- 📊 **Dashboard Finansial Terpadu**: Pantauan real-time saldo kas, pemasukan, pengeluaran, margin keuntungan, dan status kesehatan usaha.
- 📝 **Pembukuan Pintar**:
  - Pencatatan transaksi **Kas Masuk** (Penjualan, Modal), **Kas Keluar** (Bahan Baku, Gaji, Operasional, Lainnya).
  - Pilihan metode pembayaran lengkap (Tunai, QRIS, Transfer Bank, Kartu Debit).
  - Status verifikasi transaksi (*Draft, Verified, Rejected*).
  - Form pencatatan cepat dengan dukungan upload bukti fisik struk/faktur.
- 📦 **Katalog Produk & Inventori**:
  - Manajemen produk UMKM (nama, kategori, harga modal/HPP, harga jual, stok minimum).
  - Kategorisasi produk (Makanan, Minuman, Jasa, Lainnya).
- 🏷️ **Sistem Penjualan & Kasir (POS)**:
  - Input transaksi kasir langsung per item produk dengan perhitungan subtotal & total otomatis.
- 🎁 **Manajemen Promo**:
  - Pembuatan promosi (Diskon persen/nominal, Cashback, Buy 1 Get 1).
  - Pengaturan periode berlaku dan kuota promo.
- 💡 **Rekomendasi Bisnis & Konsultasi CFO**:
  - Analisis otomatis kondisi likuiditas, efisiensi unit economics, dan saran operasional strategis.
- 📜 **Riwayat Transaksi**:
  - Filter rentang tanggal, kategori pemasukan/pengeluaran, pencarian transaksi, dan ringkasan mutasi kas.

### 2. 🛡️ Portal Administrator (Admin)
- 📈 **Admin Overview Dashboard**: Statistik metrik platform, total merchant/toko, pengguna terdaftar, dan aktivitas sistem.
- 🏬 **Manajemen Toko UMKM (`/admin/stores`)**:
  - Monitoring dan verifikasi permohonan toko (*Requested, Accepted, Active, Rejected, Suspended*).
  - Modal tambah toko baru, edit rincian pemilik & alamat, ubah status persetujuan, dan hapus toko.
  - Filter kategori usaha (Kuliner, Fashion, Elektronik, Kecantikan, Pertanian, Jasa, dll).
- 👥 **Manajemen Pengguna (`/admin/users`)**:
  - Tata kelola akun pengguna & administrator (*Role User / Admin*).
  - Status akun (*Active, Inactive, Suspended*).
  - Form modal tambah user, ubah data kontak/email/no telepon, dan hapus pengguna.
- 💬 **Kritik & Saran (`/admin/kritik-saran`)**:
  - Pengawasan umpan balik, rating kepuasan (*Poor, Average, Good, Excellent*), dan aspirasi merchant UMKM.

---

## 📂 Struktur Direktori Proyek

```
digital-cfo/
├── frontend/                     # Next.js 16 Web Client
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/        # Halaman Publik (Beranda, Tentang Kami, Panduan, Template)
│   │   │   ├── admin/            # Panel Admin (Dashboard, Stores, Users, Kritik-Saran)
│   │   │   ├── auth/             # Halaman Login & Registrasi
│   │   │   ├── user/             # Panel UMKM (Dashboard, Pembukuan, Produk, Promo, Rekomendasi, Riwayat)
│   │   │   ├── globals.css       # Tailwind CSS base styles
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/           # Komponen UI Reusable (Sidebar, Navbar, Card, Modal)
│   │   └── services/             # Integrasi API Client & Layanan Pendukung
│   ├── public/                   # Asset statis, ikon, dan ilustrasi
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Node.js + Express.js 5 REST API
│   ├── prisma/
│   │   ├── schema.prisma         # Definisi skema database PostgreSQL
│   │   └── migrations/           # Riwayat migrasi database
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Inisialisasi Prisma Client
│   │   │   └── swagger.js        # Konfigurasi Swagger OpenAPI docs
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Login, Register, JWT, Profile
│   │   │   ├── healthscore.controller.js # Perhitungan skor kesehatan keuangan
│   │   │   ├── product.controller.js     # CRUD produk & stok
│   │   │   ├── sales.controller.js       # Transaksi kasir / penjualan
│   │   │   └── transaction.controller.js # Pencatatan kas masuk & keluar
│   │   ├── middleware/
│   │   │   └── auth.middleware.js        # Verifikasi token Bearer JWT & role
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── healthscore.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── sales.routes.js
│   │   │   └── transaction.routes.js
│   │   ├── services/
│   │   │   ├── fuzzyTsukamoto.service.js # Engine Logika Samar (Tsukamoto)
│   │   │   └── saw.service.js            # Engine Simple Additive Weighting (DSS)
│   │   ├── seed.js               # Skrip inisialisasi data awal (seeder)
│   │   └── server.js             # Entrypoint server Express
│   ├── package.json
│   └── .env.example
│
└── README.md                     # Dokumentasi utama proyek & logbook aktivitas
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat Sistem
- **Node.js**: versi 18.x atau 20+
- **NPM**: versi 9+
- **PostgreSQL**: instance lokal atau cloud (misal: Supabase / Neon / Docker PostgreSQL)

---

### 1. Menjalankan Backend (Express.js API)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Siapkan file konfigurasi `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/digital_cfo?schema=public"
   JWT_SECRET="kunci_rahasia_jwt_digital_cfo_super_aman"
   ```
4. Jalankan migrasi database & generate Prisma client:
   ```bash
   npx prisma migrate dev --name init
   ```
5. *(Opsional)* Isi database dengan data awal / akun demo:
   ```bash
   node src/seed.js
   ```
6. Jalankan server backend (mode dev dengan nodemon):
   ```bash
   npm run dev
   ```
   - Server aktif di: `http://localhost:5000`
   - Dokumentasi Swagger UI: `http://localhost:5000/api-docs`

---

### 2. Menjalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembang Next.js:
   ```bash
   npm run dev
   ```
4. Buka peramban di: [http://localhost:3000](http://localhost:3000)

---

## 📖 Dokumentasi API (Swagger)

Seluruh endpoint REST API telah didokumentasikan secara interaktif menggunakan OpenAPI 3.0.

Setelah backend berjalan, kunjungi:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Daftar Kelompok Endpoint Utama:
| Modul | Endpoint | Metode | Deskripsi |
|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | Pendaftaran akun pengguna / UMKM baru |
| | `/api/auth/login` | `POST` | Masuk dan memperoleh Bearer JWT token |
| | `/api/auth/me` | `GET` | Mengambil data profil pengguna yang login |
| **Health Score** | `/api/healthscore` | `GET` | Kalkulasi Skor Kesehatan Keuangan (Fuzzy Tsukamoto) |
| **Transaksi** | `/api/transactions` | `GET` / `POST` | Daftar riwayat transaksi & input pembukuan baru |
| | `/api/transactions/:id` | `GET` / `DELETE` | Detail & pembatalan transaksi |
| **Produk** | `/api/products` | `GET` / `POST` | Katalog produk & penambahan produk |
| | `/api/products/:id` | `PUT` / `DELETE` | Pembaruan & penghapusan produk |
| **Penjualan (Sales)** | `/api/sales` | `GET` / `POST` | Daftar transaksi kasir & pencatatan penjualan multi-item |

---

## 🧠 Algoritma & Mesin Keputusan

### 1. Logika Samar (Fuzzy Tsukamoto) — Financial Health Engine
Modul [`fuzzyTsukamoto.service.js`](backend/src/services/fuzzyTsukamoto.service.js) menghitung status kesehatan keuangan UMKM berdasarkan transaksi riil dengan 3 variabel input:
1. **Cash Runway (Bulan)**: Rasio saldo kas terhadap rata-rata pengeluaran bulanan.
   - Himpunan Fuzzy: *Pendek* ($\le 3$ bln), *Sedang* (2–6 bln), *Panjang* ($\ge 5$ bln).
2. **Unit Economics / Profit Margin (%)**: Efisiensi laba dari penjualan dikurangi pengeluaran operasional.
   - Himpunan Fuzzy: *Rendah* ($< 15\%$), *Sedang* ($10\% - 35\%$), *Tinggi* ($> 30\%$).
3. **Pertumbuhan Penjualan (Trend Growth %)**: Perbandingan penjualan bulan berjalan terhadap bulan sebelumnya.
   - Himpunan Fuzzy: *Turun*, *Stabil*, *Naik*.

**Hasil Inferensi & Defuzzifikasi**:
Menghasilkan nilai tegas (*crisp value*) skala $0 - 100$ yang diklasifikasikan ke dalam kategori:
- 🟢 **SEHAT** (Skor $\ge 75$): Arus kas kokoh, margin sehat, dan tren penjualan positif.
- 🟡 **WASPADA** ($50 \le \text{Skor} < 75$): Likuiditas cukup namun rentan terhadap fluktuasi biaya.
- 🔴 **KRITIS** (Skor $< 50$): Runway kas tipis, margin negatif, atau terjadi penurunan drastis.

### 2. Simple Additive Weighting (SAW) — Decision Support System
Sedang dikembangkan di [`saw.service.js`](backend/src/services/saw.service.js) untuk memberikan rekomendasi prioritas tindakan strategis bagi UMKM (misalnya: penambahan modal, efisiensi biaya bahan baku, atau aktivasi promo penjualan).

---

## 📓 Logbook & Riwayat Pengembangan

Berikut adalah rekapitulasi terstruktur dari seluruh aktivitas riset, perancangan, implementasi, dan pengujian yang telah diselesaikan sepanjang siklus pengembangan proyek **Digital CFO**:

| No | Tanggal / Periode | Modul / Lingkup | Rincian Aktivitas & Hasil Implementasi | Status |
|:---:|:---|:---|:---|:---:|
| **1** | **13 September 2026** | **Inisiasi Proyek & Git** | • Inisialisasi repositori Git dan konfigurasi dasar `.gitignore`.<br>• Penyusunan konsep awal platform Digital CFO untuk UMKM. | ✅ Selesai |
| **2** | **25 September 2026** | **Frontend Core & Landing Pages** | • Setup proyek Next.js 16 dengan React 19, Tailwind CSS, dan TypeScript.<br>• Pembuatan Landing Page lengkap (`/`, Hero, Value Proposition, Fitur, Testimoni).<br>• Pembuatan Halaman Informasi (`/about`), Panduan (`/resources/guides`), dan Template (`/resources/templates`).<br>• Pembuatan UI Autentikasi Pengguna (`/auth`) dengan opsi Login & Register. | ✅ Selesai |
| **3** | **25 September 2026** | **UI Portal UMKM & Admin** | • Pembuatan kerangka antarmuka pengguna (`/user`): Dashboard, Produk, Promo, Rekomendasi, Riwayat.<br>• Pembuatan kerangka antarmuka admin (`/admin`): Dashboard metriks, Toko, Pengguna, Kritik-Saran.<br>• Implementasi komponen navigasi interaktif (`Sidebar.tsx`, Header) dengan mode responsif. | ✅ Selesai |
| **4** | **25 September 2026** | **Penyempurnaan Pembukuan & Riwayat** | • Pengembangan halaman Pembukuan Lanjutan (`/user/pembukuan`): form pencatatan kas masuk/keluar, modal usaha, kategori belanja, dan pemilihan metode pembayaran.<br>• Pembuatan modul riwayat transaksi (`/user/riwayat`) dengan filter dinamis dan indikator status. | ✅ Selesai |
| **5** | **21 Oktober 2026** | **Restrukturisasi Monorepo** | • Restrukturisasi arsitektur direktori proyek menjadi dua modul terpisah yang bersih: `frontend/` (Next.js) dan `backend/` (Node.js/Express).<br>• Pembersihan berkas konfigurasi root agar mandiri di masing-masing sub-proyek. | ✅ Selesai |
| **6** | **21 Oktober 2026** | **Database & Prisma ORM** | • Inisiasi Prisma ORM 6 dan koneksi database PostgreSQL.<br>• Perancangan skema relasional `schema.prisma` yang mencakup 9 entitas: `User`, `Store`, `Product`, `Transaction`, `Sale`, `SaleItem`, `Promo`, `Feedback`, dan `Alert`.<br>• Pembuatan migrasi database pertama (`migration.sql`).<br>• Pembuatan skrip seeder (`backend/src/seed.js`) untuk akun default. | ✅ Selesai |
| **7** | **21 Oktober 2026** | **Backend Core & Autentikasi JWT** | • Pembuatan server Express.js 5 dengan routing modular dan penanganan CORS.<br>• Implementasi autentikasi JWT (`auth.controller.js`, `auth.routes.js`) dan hashing sandi aman menggunakan `bcryptjs`.<br>• Pembuatan middleware proteksi token `auth.middleware.js`. | ✅ Selesai |
| **8** | **21 Oktober 2026** | **CRUD Produk & Transaksi Penjualan** | • Implementasi REST API Produk (`product.controller.js`): create, read, update, delete produk UMKM.<br>• Implementasi REST API Transaksi Pembukuan (`transaction.controller.js`) dengan validasi tipe kas.<br>• Implementasi REST API Penjualan / POS (`sales.controller.js`) untuk transaksi multi-item produk. | ✅ Selesai |
| **9** | **21 Oktober 2026** | **Dokumentasi Interaktif Swagger** | • Konfigurasi Swagger OpenAPI 3.0 (`swagger.js`, `swagger-ui-express`).<br>• Penambahan dokumentasi tag, skema request/response, dan skema otorisasi Bearer JWT di `/api-docs`. | ✅ Selesai |
| **10** | **21 Oktober 2026** | **AI Financial Health Engine (Fuzzy Tsukamoto)** | • Perancangan algoritma Logika Samar metode Tsukamoto di `fuzzyTsukamoto.service.js`.<br>• Pembuatan fungsi keanggotaan (Linear Naik/Turun, Segitiga) untuk Cash Runway, Unit Economics Margin, dan Tren Penjualan.<br>• Implementasi `healthscore.controller.js` yang menarik data transaksi riil dari PostgreSQL dan menghasilkan skor numerik (0–100) serta status (SEHAT / WASPADA / KRITIS).<br>• Pengujian endpoint `/api/healthscore` dengan otentikasi JWT. | ✅ Selesai |
| **11** | **21 Oktober 2026** | **Penyempurnaan Panel Admin Toko & Pengguna** | • Implementasi antarmuka lengkap Manajemen Toko (`/admin/stores`): modal CRUD toko, status persetujuan (*Requested, Accepted, Active, Rejected, Suspended*), filter kategori bisnis, dan pencarian.<br>• Implementasi antarmuka lengkap Manajemen Pengguna (`/admin/users`): modal tambah/edit/hapus user, manajemen role (User vs Admin), status keaktifan, dan pencarian. | ✅ Selesai |
| **12** | **21 Oktober 2026** | **Penyusunan Dokumentasi Komprehensif** | • Pembaruan menyeluruh `README.md` dengan deskripsi teknologi akurat (Express.js, Prisma, PostgreSQL, Fuzzy Tsukamoto).<br>• Penyusunan Logbook Resmi aktivitas pengembangan dari awal hingga kondisi terkini. | ✅ Selesai |

---

## 🗺️ Rencana Pengembangan Selanjutnya (Roadmap)

- [ ] **Integrasi API Penuh Frontend <-> Backend**: Menghubungkan seluruh form Next.js secara live ke endpoint Express.js via HTTP Client/Axios dengan token autentikasi.
- [ ] **OCR Scanner Faktur/Struk**: Implementasi pembacaan foto bukti transaksi otomatis menggunakan Python Computer Vision / Tesseract / Google Vision API.
- [ ] **Speech-to-Text Transaksi Suara**: Fitur pencatatan transaksi cepat lewat ucapan suara menggunakan Web Speech API / OpenAI Whisper.
- [ ] **Finalisasi Algoritma DSS (SAW)**: Penyelesaian skoring alternatif keputusan bisnis di `saw.service.js` untuk rekomendasi langkah strategis UMKM.
- [ ] **Ekspor Laporan Finansial**: Fitur cetak laporan laba/rugi, arus kas, dan neraca dalam format PDF dan Excel (.xlsx).

---

## 👥 Tim Pengembang
Dikembangkan dengan ❤️ untuk memberdayakan UMKM Indonesia menuju tata kelola finansial yang sehat, transparan, dan berkelanjutan.
