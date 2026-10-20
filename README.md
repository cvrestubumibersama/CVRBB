# CV. Restu Bumi Bersama — Company Profile Web App

Website company profile resmi **CV. Restu Bumi Bersama**, kontraktor & supplier bahan bangunan di Madiun, Jawa Timur. Dibangun dengan arsitektur fullstack modern: **TanStack Start** (SSR/SSG) untuk frontend dan **Express.js** untuk backend REST API yang terhubung ke database MySQL.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur](#fitur)
- [Arsitektur Proyek](#arsitektur-proyek)
- [Halaman & Routing](#halaman--routing)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Direktori](#struktur-direktori)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan Lokal](#instalasi--menjalankan-lokal)
- [Variabel Lingkungan](#variabel-lingkungan)
- [API Backend](#api-backend)
- [Database](#database)
- [Panel Admin](#panel-admin)
- [Build Produksi](#build-produksi)

---

## Gambaran Umum

Aplikasi ini adalah website company profile dinamis yang kontennya dikelola melalui panel admin dan disimpan di database MySQL. Seluruh data (layanan, produk, proyek, testimoni, dsb.) diambil secara real-time dari backend Express API, sehingga tidak ada konten yang di-hardcode di frontend.

**Bisnis:** CV. Restu Bumi Bersama  
**Bidang:** Kontraktor & supplier bahan bangunan  
**Lokasi:** Ngampel, Kabupaten Madiun, Jawa Timur  
**Berdiri:** 2021

---

## Fitur

### Frontend (Public Site)

- **Hero Section** — Slider gambar otomatis dengan efek parallax scroll dan teks typewriter animasi
- **Statistik Perusahaan** — Counter animasi (proyek selesai, tahun pengalaman, klien tetap)
- **Layanan** — Kartu layanan dengan auto-slider gambar per layanan, diambil dari backend
- **Produk / Katalog** — Grid produk dengan filter kategori & fitur pencarian real-time; unduh katalog PDF
- **Proyek & Legalitas** — Portfolio proyek dengan filter kategori, tampilan dokumen legalitas (NIB, NPWP, SBU, K3), unduh Company Profile PDF
- **Tentang Kami** — Sejarah perusahaan, visi & misi, struktur organisasi, keunggulan perusahaan
- **Klien & Kontak** — Marquee logo mitra, testimonial klien, peta lokasi (OpenStreetMap embed), formulir permintaan penawaran via WhatsApp
- **Artikel & Berita** — Halaman placeholder (dalam pengembangan), redirect otomatis dengan modal "Coming Soon"
- **Bilingual** — Struktur siap bilingual (ID/EN); bahasa Inggris dalam tahap pengembangan
- **Responsif** — Layout mobile-first, hamburger menu untuk layar kecil
- **SEO** — Meta tag lengkap per halaman, Open Graph, Twitter Card, structured data JSON-LD (LocalBusiness), `robots.txt`, `sitemap.xml`
- **WhatsApp Float** — Tombol WhatsApp mengambang di semua halaman
- **Loading Screen** — Splash screen animasi saat pertama kali memuat aplikasi

### Backend (Admin & API)

- REST API publik untuk semua data website
- Autentikasi admin berbasis JWT dengan bcrypt
- Upload file (gambar produk, layanan, proyek, dll.) menggunakan Multer
- Generate PDF katalog produk dan company profile dengan PDFKit
- Rate limiting pada endpoint sensitif
- CORS dikonfigurasi per environment

### Panel Admin

- Antarmuka admin terpisah (React + Vite) untuk mengelola seluruh konten website
- Akses di `/admin` (diproxy ke dev server admin pada mode development)

---

## Arsitektur Proyek

```
Browser
  │
  ▼
Frontend (TanStack Start — port 3000)
  │  /api/public/* → proxy ke Backend
  │  /admin        → proxy ke Admin Frontend dev server
  │
  ├── Backend API (Express.js — port 4000)
  │     └── MySQL Database (rbb)
  │
  └── Admin Frontend (React + Vite — port 5173)
```

**Development:** Tiga service berjalan bersamaan (frontend, backend, admin frontend).  
**Production:** Frontend di-build dengan Nitro/SSR, backend deploy terpisah, admin frontend di-build ke `admin-frontend/dist/`.

---

## Halaman & Routing

| Route | Halaman | Deskripsi |
|---|---|---|
| `/` | Beranda | Hero, statistik, preview layanan & proyek, strip mitra |
| `/tentang-kami` | Tentang Kami | Sejarah, visi misi, struktur organisasi, keunggulan |
| `/layanan` | Layanan | Daftar layanan lengkap + tahapan kerja |
| `/produk` | Katalog Produk | Grid produk, filter kategori, pencarian, unduh PDF |
| `/proyek-legalitas` | Proyek & Legalitas | Portfolio proyek, dokumen legalitas, unduh company profile |
| `/klien-kontak` | Klien & Kontak | Mitra, testimoni, peta, formulir penawaran via WA |
| `/artikel` | Artikel & Berita | Redirect → beranda + modal "Segera Hadir" |
| `/artikel/:slug` | Detail Artikel | Halaman detail artikel (konten dari DB) |
| `/admin/login` | Admin Login | Halaman login panel admin |

---

## Stack Teknologi

### Frontend

| Teknologi | Versi | Keterangan |
|---|---|---|
| React | 19 | UI library |
| TanStack Start | ~1.168 | SSR framework berbasis Vite + Nitro |
| TanStack Router | ~1.170 | File-based routing |
| TanStack Query | ~5.101 | Server state / data fetching |
| TypeScript | ~5.8 | Type safety |
| Tailwind CSS | ~4.2 | Utility-first CSS |
| Framer Motion | ~12 | Animasi scroll & reveal |
| Radix UI | — | Komponen UI primitif |
| Lucide React | — | Icon library |
| Vite | ~8 | Build tool |

### Backend

| Teknologi | Versi | Keterangan |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | ~4.18 | HTTP server |
| mysql2 | ~3.5 | MySQL driver |
| JSON Web Token | ~9 | Autentikasi admin |
| bcryptjs | ~3 | Hash password |
| Multer | ~1.4 | Upload file |
| PDFKit | ~0.20 | Generate PDF |
| express-rate-limit | ~8.7 | Rate limiting |
| dotenv | ~16 | Konfigurasi environment |

---

## Struktur Direktori

```
bumi-blueprint-main/
├── src/                        # Source frontend (TanStack Start)
│   ├── routes/                 # File-based routing
│   │   ├── __root.tsx          # Root layout, providers (QueryClient, i18n, ComingSoon)
│   │   ├── index.tsx           # Beranda (/)
│   │   ├── tentang-kami.tsx    # Tentang Kami (/tentang-kami)
│   │   ├── layanan.tsx         # Layanan (/layanan)
│   │   ├── produk.tsx          # Produk (/produk)
│   │   ├── proyek-legalitas.tsx # Proyek & Legalitas (/proyek-legalitas)
│   │   ├── klien-kontak.tsx    # Klien & Kontak (/klien-kontak)
│   │   ├── artikel.tsx         # Artikel (coming soon redirect)
│   │   └── artikel.$slug.tsx   # Detail artikel
│   ├── components/
│   │   ├── site/               # Komponen layout public site
│   │   │   ├── Navbar.tsx      # Navigasi sticky + mobile menu
│   │   │   ├── Footer.tsx      # Footer situs
│   │   │   ├── SiteLayout.tsx  # Wrapper Navbar + Footer + WhatsApp float
│   │   │   ├── ui.tsx          # Komponen reusable (Button, Card, Reveal, CountUp, AutoSlider, dll.)
│   │   │   ├── WhatsAppFloat.tsx # Tombol WhatsApp mengambang
│   │   │   └── ComingSoonModal.tsx # Modal fitur coming soon
│   │   └── ui/
│   │       └── LoadingScreen.tsx # Splash screen awal
│   ├── lib/
│   │   ├── api.ts              # React Query hooks & TypeScript interfaces untuk semua endpoint
│   │   ├── i18n.tsx            # Context & dictionary terjemahan (ID/EN)
│   │   ├── site-data.ts        # Data statis fallback
│   │   └── utils.ts            # Utility functions
│   ├── hooks/
│   │   └── use-mobile.tsx      # Hook deteksi mobile viewport
│   ├── styles.css              # Global CSS & Tailwind directives
│   ├── router.tsx              # Konfigurasi router
│   └── start.ts                # Entry point server SSR
├── backend/                    # Backend Express.js
│   ├── src/
│   │   ├── index.js            # Entry point & semua route API (~1500 baris)
│   │   ├── db.js               # Koneksi MySQL pool
│   │   └── catalogPdf.js       # Generator PDF katalog produk
│   ├── .env.example            # Contoh variabel environment backend
│   └── package.json
├── admin-frontend/             # Panel admin (React + Vite, deploy terpisah)
│   └── src/
├── public/                     # Asset statis
│   ├── RBB.png / RBB.svg       # Logo perusahaan
│   ├── hero1.webp, hero3.webp, hero4.webp  # Gambar hero section
│   ├── COMPANY PROFILE CV. RBB.pdf
│   ├── uploads/                # Folder upload gambar dari admin
│   ├── robots.txt
│   └── sitemap.xml
├── api/                        # Nitro API routes (production)
│   └── auth/
├── vite.config.ts              # Konfigurasi Vite + TanStack Start + Nitro + proxy
├── package.json                # Dependencies frontend
├── tsconfig.json
└── .env / .env.local           # Variabel environment frontend
```

---

## Prasyarat

- **Node.js** ≥ 18
- **MySQL** (lokal atau remote), database bernama `rbb`
- **npm** atau **bun**

---

## Instalasi & Menjalankan Lokal

### 1. Clone Repository

```bash
git clone <repository-url>
cd bumi-blueprint-main
```

### 2. Setup Frontend

```bash
npm install
```

Buat file `.env.local` di root:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:3000
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda
```

### 4. Siapkan Database MySQL

Buat database `rbb` di MySQL, lalu buat tabel sesuai skema. Tabel yang digunakan:

```
admins, advantages, articles, article_categories, leads, legal_docs,
media_files, organization_members, partners, products, product_categories,
projects, project_categories, seo_pages, services, site_settings,
site_texts, statistics, testimonials, work_steps
```

### 5. Jalankan Semua Service

Buka **3 terminal terpisah**:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Berjalan di http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
# Di root project
npm run dev
# Berjalan di http://localhost:3000
```

**Terminal 3 — Admin Frontend (opsional):**
```bash
cd admin-frontend
npm install
npm run dev
# Berjalan di http://localhost:5173, diakses via http://localhost:3000/admin
```

---

## Variabel Lingkungan

### Frontend (`.env.local` di root)

| Variable | Default | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000` | URL backend API |
| `VITE_SITE_URL` | `https://restubumibersama.co.id` | URL canonical situs |
| `VITE_DEFAULT_LANG` | `id` | Bahasa default (`id` atau `en`) |

### Backend (`backend/.env`)

| Variable | Default | Keterangan |
|---|---|---|
| `MYSQL_HOST` | `127.0.0.1` | Host MySQL |
| `MYSQL_PORT` | `3306` | Port MySQL |
| `MYSQL_USER` | `root` | User MySQL |
| `MYSQL_PASSWORD` | *(kosong)* | Password MySQL |
| `MYSQL_DATABASE` | `rbb` | Nama database |
| `CORS_ORIGIN` | `http://localhost:3000` | Origin yang diizinkan |
| `PORT` | `4000` | Port backend |
| `JWT_SECRET` | — | Secret untuk token JWT admin |

---

## API Backend

Semua endpoint publik menggunakan prefix `/api/public/`. Tidak memerlukan autentikasi.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/public/settings` | Pengaturan situs (nama, alamat, telepon, WhatsApp, dll.) |
| GET | `/api/public/site-texts` | Teks konten dinamis (key-value, bilingual) |
| GET | `/api/public/services` | Daftar layanan |
| GET | `/api/public/work-steps` | Tahapan kerja layanan |
| GET | `/api/public/products` | Daftar produk |
| GET | `/api/public/product-categories` | Kategori produk |
| GET | `/api/public/projects` | Daftar proyek |
| GET | `/api/public/project-categories` | Kategori proyek |
| GET | `/api/public/legal-docs` | Dokumen legalitas |
| GET | `/api/public/partners` | Klien & mitra |
| GET | `/api/public/testimonials` | Testimoni klien |
| GET | `/api/public/advantages` | Keunggulan perusahaan |
| GET | `/api/public/organization-members` | Anggota struktur organisasi |
| GET | `/api/public/articles` | Daftar artikel |
| GET | `/api/public/articles/:slug` | Detail artikel |
| GET | `/api/public/catalog-pdf` | Generate & unduh PDF katalog produk |
| GET | `/api/public/company-profile-download` | Unduh company profile PDF |

---

## Database

Database menggunakan **MySQL**. Koneksi dikelola via connection pool (`mysql2/promise`).

Semua field teks bilingual disimpan dalam dua kolom terpisah, misalnya:
- `title_id` / `title_en` — Judul dalam Bahasa Indonesia / Inggris
- `desc_id` / `desc_en` — Deskripsi dalam Bahasa Indonesia / Inggris

Di frontend, helper `pick(value, lang)` memilih teks sesuai bahasa aktif.

---

## Panel Admin

Panel admin adalah aplikasi React + Vite terpisah di direktori `admin-frontend/`. Fitur yang dikelola admin:

- **Konten** — Layanan, produk, proyek, artikel, mitra, testimoni, anggota organisasi, dokumen legalitas, keunggulan, tahapan kerja
- **Pengaturan situs** — Nama perusahaan, alamat, telepon, WhatsApp, Google Maps embed, jam operasional, tagline footer
- **Media** — Upload gambar produk, layanan, proyek, anggota organisasi
- **Teks dinamis** — Edit hero headline, subtitle, dan teks lain langsung dari dashboard

**Akses Admin:**
- Development: `http://localhost:3000/admin` (diproxy dari `http://localhost:5173`)
- Login via `POST /api/admin/login` menggunakan JWT

---

## Build Produksi

### Frontend

```bash
npm run build
```

Output di `.output/` (Nitro SSR bundle, siap deploy ke Vercel, Node.js, dll.).

### Backend

```bash
# Tidak ada build step — jalankan langsung dengan Node
node src/index.js
```

### Admin Frontend

```bash
cd admin-frontend
npm run build
# Output di admin-frontend/dist/
```

---

## Scripts

| Script | Keterangan |
|---|---|
| `npm run dev` | Jalankan frontend dev server (port 3000) |
| `npm run build` | Build produksi frontend |
| `npm run preview` | Preview build produksi |
| `npm run lint` | Jalankan ESLint |
| `npm run format` | Format kode dengan Prettier |
| `cd backend && npm run dev` | Jalankan backend dengan nodemon (auto-reload) |
| `cd backend && npm start` | Jalankan backend tanpa nodemon |

---

## Catatan Pengembangan

- **Proxy Vite** — Semua request ke `/api` diteruskan ke `http://localhost:4000`, request ke `/admin` diteruskan ke `http://localhost:5173`
- **Nitro plugin** hanya aktif pada mode produksi (non-dev) untuk menghindari konflik route dengan proxy backend
- **Upload file** — Gambar yang diupload via admin disimpan di `public/uploads/` dan dilayani sebagai file statis
- **Bilingual** — Bahasa Inggris saat ini di-disable di UI (tombol EN membuka modal "Coming Soon"); untuk mengaktifkan, ubah logika `setLang` di `i18n.tsx`

---

*Dikelola dan dikembangkan secara lokal. Gunakan Git untuk manajemen versi.*
