# 💚 QUALITY OF LOVE

Aplikasi relasi pasangan — bantu pasangan mengenali cinta lewat **Love Language Test**, **Relationship Wellness Check** (64 pertanyaan, hasil gabungan dua orang), **🎯 Tantangan Hari Ini** (tantangan harian berpasangan dengan streak, refleksi, dan badge), artikel edukasi, dan dashboard admin.

- **Live:** Vercel (repo ini terhubung ke project Vercel `aplikasi-relasi-node`)
- **GitHub Pages:** nonaktif (sengaja, lihat riwayat commit `fad4447`)
- **Backend:** Node.js + Express (serverless di Vercel via `@vercel/node`)
- **Database/Auth:** Firebase (Firestore + Authentication + firebase-admin)

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js, Express, `firebase-admin`, JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| Frontend | **Vanilla HTML/CSS/JS** (tanpa framework, tanpa build step) |
| Database | Firestore |
| Auth | Firebase Auth (Google + email/password) + JWT untuk admin |
| Fonts/Icons | Google Fonts (Poppins, Montserrat, Inter) + Font Awesome CDN |
| Deploy | Vercel (file `vercel.json` — static `public/` + serverless `server/server.js`) |

## 📁 Struktur Project

```
├── server/
│   └── server.js          # Seluruh backend: API, auth middleware, CSP, CORS
├── scripts/
│   └── seed-challenges.js # Seed bank 30 tantangan harian (idempotent)
├── public/                # Frontend statis (di-serve Vercel di root)
│   ├── index.html         # Beranda / dashboard user
│   ├── login.html         # Login user (Google / email)
│   ├── love-language.html # Test love language (30 pertanyaan)
│   ├── relationship-check.html  # Wellness check (64 pertanyaan, kode invitasi)
│   ├── hasil.html         # Halaman hasil (love language + wellness)
│   ├── profil.html        # Profil user
│   ├── firebase-config.js # Init Firebase + session helper + idle timeout
│   ├── css/style.css
│   ├── artikel/           # Halaman artikel (index + detail)
│   ├── admin/             # Dashboard admin (login + index)
│   ├── questions/
│   │   └── wellness-questions.js  # Bank soal wellness check
│   └── img/               # Logo + favicon
├── vercel.json            # Konfigurasi deploy Vercel
├── firebase.json          # Rules & indexes Firestore
└── .env                   # Credentials server (TIDAK di-commit)
```

## 🚀 Setup Lokal

```bash
npm install
npm run dev   # nodemon, port 3000 (atau npm start)
```

**`.env` wajib ada** (server menolak start tanpa 3 field pertama):

| Variable | Wajib | Keterangan |
|---|---|---|
| `FIREBASE_PROJECT_ID` | ✅ | ID project Firebase (`aplikasi-relasi`) |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Private key service account (dengan `\n` literal) |
| `FIREBASE_API_KEY` | ⚠️ | Untuk endpoint `/api/config` |
| `FIREBASE_AUTH_DOMAIN` | ⚠️ | idem |
| `FIREBASE_STORAGE_BUCKET` | ⚠️ | idem |
| `FIREBASE_MESSAGING_SENDER_ID` | ⚠️ | idem |
| `FIREBASE_APP_ID` | ⚠️ | idem |
| `JWT_SECRET` | ❌ | Auto-generate kalau kosong (session-only) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | ❌ | Override kredensial admin default |
| `PORT` | ❌ | Default `3000` |

> ⚠️ Kalau tidak diisi, admin login memakai **kredensial fallback yang ter-hardcode di server** — wajib di-override di produksi (lihat Ide Upgrade nomor 1).

## 🌱 Seed Data Tantangan Harian

Bank tantangan disimpan di koleksi Firestore `challenges` (30 dokumen, `ch001..ch030`, 8 kategori dimensi wellness). Seed sekali setelah clone / setelah ganti environment:

```bash
node scripts/seed-challenges.js   # idempotent — aman dijalankan ulang
```

Progress tantangan user tersimpan di subcollection `users/{userId}/challenge_progress/{YYYY-MM-DD}`.

## 🚦 Deploy Firestore Rules

Setelah mengubah `firestore.rules`, deploy dengan salah satu cara:

- CLI (firebase-tools sudah ada di devDependencies):
  ```bash
  npx firebase deploy --only firestore:rules
  ```
- Atau manual: Firebase Console → Firestore Database → Rules → paste isi `firestore.rules` → Publish

> Tanpa rules ter-deploy, fitur tantangan tetap menampilkan kartu (pakai bank fallback) tapi penyimpanan progress akan ditolak.

## 🌐 API Endpoints

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/config` | — | Konfigurasi Firebase untuk client |
| POST | `/api/admin/login` | rate-limit | Login admin (email + password → JWT) |
| GET | `/api/admin/verify` | JWT admin | Cek token admin |
| CRUD | `/api/admin/users` | JWT admin | Kelola user |
| CRUD | `/api/admin/articles` | JWT admin | Kelola artikel |
| CRUD | `/api/admin/ebooks` | JWT admin | Kelola ebook |
| CRUD | `/api/admin/videos` | JWT admin | Kelola video |
| GET/DELETE | `/api/admin/couples[/:id]` | JWT admin | Kelola pasangan |
| GET | `/api/admin/activities` | JWT admin | Log aktivitas user |
| POST | `/api/wellness/start` | Firebase token | Buat sesi tes + kode invitasi |
| GET | `/api/wellness/test/:testId` | Firebase token | Detail sesi tes |
| POST | `/api/wellness/submit` | Firebase token | Submit jawaban (user/partner, 64 soal) |
| POST | `/api/wellness/verify-invite` | Firebase token | Validasi kode invitasi |
| GET | `/api/wellness/result/:testId` | Firebase token | Hasil tes gabungan |

## 🔐 Keamanan yang Sudah Diterapkan

- **CSP header** ketat (`script-src`/`style-src`/`connect-src` whitelist)
- **CORS allowlist** khusus domain Vercel + localhost
- **JWT** untuk semua endpoint admin (`verifyAdminToken`)
- **Rate limiting** pada login admin
- **bcrypt** untuk password admin
- **Firebase Auth token verification** untuk endpoint user
- **Idle timeout 10 menit** + `Persistence.SESSION` (login hilang saat browser ditutup)
- Header keamanan: `X-Frame-Options`, `nosniff`, `Referrer-Policy`, COOP/COEP

## 📝 Konvensi Project

- Bahasa UI & komentar kode: **Bahasa Indonesia**
- Format judul tab: `Nama Halaman - QUALITY OF LOVE`
- Design **light-only** (dark mode sengaja dihapus — brand didesain untuk terang)
- Path asset di HTML memakai **path absolut** (`/css/...`) — aman di Vercel (root), akan pecah kalau di-serve di subpath
- Halaman hasil wellness hanya menampilkan **tes terbaru** (data lama tetap tersimpan di Firestore)

---

# 🚀 IDE UPGRADE

Daftar ini untuk programmer yang ingin melanjutkan. Diurutkan kasar berdasarkan prioritas.

## Prioritas Tinggi (Keamanan & Ketahanan)

1. **Ganti kredensial admin fallback** — kredensial default masih ter-hardcode sebagai fallback di `server/server.js` **dan terlihat di source code halaman admin (View Source)**. Set `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` di env Vercel (generate hash: `bcrypt.hashSync('<password-baru>', 10)`), lalu hapus fallback-nya dari server.
2. **Testing otomatis** — saat ini **nol test**. Paling berdampak: test endpoint wellness (`/api/wellness/*`) karena logika skoring gabungan (`calculateWellnessResults`) kompleks dan tanpa guard.
3. **Kurangi `'unsafe-inline'` di CSP** — saat ini script & style inline diizinkan. Perlu refactor besar (pindahkan inline JS/CSS ke file eksternal) tapi menaikkan keamanan signifikan.
4. **Rate limiting menyeluruh** — baru dipakai di login admin; endpoint wellness & user lain belum.
5. **Custom domain + migrasi project Firebase** — project ID `aplikasi-relasi` **tidak bisa direname** (immutable). Jalur bersih: beli custom domain (mis. `qualityoflove.com`) → tambah ke authorized domains Firebase; atau buat project Firebase baru + migrasi (auth export/import, Firestore export/import).

## Prioritas Menengah (Maintainability)

6. **Migrasi ke framework frontend** (React/Vue + build step) — frontend vanilla mulai besar: `firebase-config.js`, `hasil.html`, `admin/index.html` masing-masing ribuan baris dengan duplikasi logika (auth, render hasil, formatting tanggal).
7. **Refactor `firebase-config.js`** — file ini menangung terlalu banyak: init Firebase, session helper, idle timeout, activity logging, auth listener, API base. Pecah jadi modul (ES modules).
8. **TypeScript** — setidaknya untuk `server/server.js`; skema Firestore (`users`, `wellness_tests`, `activities`, `articles`) belum terdokumentasi tipe-nya.
9. **CI/CD** — GitHub Actions: lint + test + preview deploy otomatis per PR.
10. **Error tracking** — belum ada Sentry/logging terpusat; error server hanya `console.error`.

## Prioritas Rendah (Fitur & Polish)

11. **Riwayat tes** — hasil wellness lama tersimpan tapi UI hanya menampilkan terbaru. Bisa jadi halaman riwayat + grafik perkembangan skor per dimensi.
12. **PWA / offline** — service worker, installable, cache statis (perlu hati-hati dengan CSP).
13. **Notifikasi pasangan** — Firebase Cloud Messaging saat pasangan selesai mengisi / kode invitasi dibuat.
14. **i18n Bahasa Inggris** — semua teks hardcoded Bahasa Indonesia.
15. **Ganti CDN ke self-hosted** — Font Awesome & Google Fonts masih dari CDN (terdaftar di CSP); self-host mengurangi ketergantungan pihak ketiga.
16. **Rapikan path absolut** — `/css/...` dkk. fragile kalau pindah platform/CDN; pertimbangkan path relatif atau base URL config.
17. **Aksesibilitas & responsive polish** — audit kontras, fokus keyboard, ARIA di form tes (64 pertanyaan!).

## ⚠️ Jangan Diubah Tanpa Koordinasi

- **ID project Firebase** (`aplikasi-relasi`) — tertanam di `firebase-config.js`, `.env`, dan authorized domains. Salah ganti = semua user kehilangan akses.
- **Kredensial admin fallback** — dipakai di server dan banyak halaman admin; kalau mau ganti, ganti di server DAN semua halaman admin sekaligus.
- **Nama project Vercel** — kalau direname, domain `*.vercel.app` lama lepas; kode undangan & link artikel lama mati.
