# 🗺️ Backend Roadmap — Digital CFO UMKM
> Panduan belajar mandiri: **tanpa kode langsung**, tapi dengan penjelasan *apa*, *kenapa*, dan *bagaimana cara pikirnya*.
---
## 🔍 Gambaran Besar Arsitektur
```
Frontend (Next.js)
     │
     │  HTTP Request (fetch / axios)
     ▼
Backend (Express.js + Node.js)   ◄──────────────── Python Service (opsional)
     │                                              (OCR, Speech, AI)
     │  Prisma ORM
     ▼
Database (PostgreSQL)
```
---
## 📦 Tech Stack Backend Kamu
| Kebutuhan | Teknologi | Status |
|-----------|-----------|--------|
| Web Server | Express.js | ✅ Ada |
| Database ORM | Prisma | ✅ Ada |
| Database | PostgreSQL | ✅ Ada |
| API Docs | Swagger | ✅ Ada |
| Auth (JWT) | `jsonwebtoken` + `bcrypt` | ❌ Belum |
| OCR | Python (Tesseract / Google Vision) | ❌ Belum |
| Speech-to-Text | Python (Whisper / Web Speech API) | ❌ Belum |
| Health Score | Node.js (logika Fuzzy Tsukamoto) | ❌ Belum |
| DSS / SAW | Node.js | ❌ Belum |
---
## 🧱 Struktur Folder Backend yang Ideal
```
backend/
├── prisma/
│   ├── schema.prisma          ✅ Sudah ada
│   └── seed.js                ✅ Sudah ada
│
└── src/
    ├── server.js              ✅ Sudah ada 