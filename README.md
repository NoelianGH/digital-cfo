# Digital CFO

Solusi Manajemen Keuangan & Sistem Pengambilan Keputusan Bisnis untuk UMKM.

Proyek ini telah dipisahkan menjadi dua bagian:
- **`frontend/`**: Aplikasi Web Next.js 16 (React 19, Tailwind CSS, TypeScript).
- **`backend/`**: REST API Python FastAPI (AI Decision Engine, OCR Scanner, Speech-to-Text, Layanan Transaksi).

---

## 📂 Struktur Proyek

```
digital-cfo/
├── frontend/             # Next.js Web Application
│   ├── src/
│   │   ├── app/          # App router pages & layouts (user, admin, landing, auth)
│   │   ├── components/   # UI components
│   │   └── services/     # Client-side service wrappers / interfaces
│   ├── public/           # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── backend/              # Python FastAPI Application
│   ├── app/
│   │   ├── api/routers/  # Endpoint router (transactions, OCR, speech, health score, decision engine)
│   │   ├── core/         # Settings & CORS config
│   │   ├── models/       # Pydantic schemas
│   │   └── services/     # Business logic & AI algorithms
│   ├── main.py           # FastAPI entrypoint
│   ├── requirements.txt  # Dependencies
│   └── pyproject.toml
│
└── README.md
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Frontend (Next.js)
```bash
cd frontend
npm install # jika dependensi belum terpasang
npm run dev
```
Akses di peramban: [http://localhost:3000](http://localhost:3000)

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
# .\venv\Scripts\activate.bat
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Endpoint: [http://localhost:8000](http://localhost:8000)
- Swagger UI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
