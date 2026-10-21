import { BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Catat Keuangan Tanpa Pusing dengan <span className="text-blue-600">LaporKas!</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          Platform pembukuan modern yang dirancang khusus untuk UMKM dan bisnis berkembang. 
          Pantau kesehatan bisnis Anda secara real-time dan dapatkan rekomendasi cerdas.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#kontak" className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:scale-105">
            Jadwalkan Demo
          </a>
          <a href="/about" className="px-8 py-4 bg-gray-100 text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all">
            Pelajari Lebih Lanjut
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">10.000+</h3>
            <p className="text-gray-600 font-medium">UMKM Bergabung</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">Rp 500M+</h3>
            <p className="text-gray-600 font-medium">Transaksi Tercatat</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">99.9%</h3>
            <p className="text-gray-600 font-medium">Uptime Server</p>
          </div>
        </div>
      </section>

      {/* Features/Reasons */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Memilih LaporKas?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Kami mengerti bahwa waktu Anda berharga. Oleh karena itu kami membangun sistem yang cepat, aman, dan mudah digunakan.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pencatatan Secepat Kilat</h3>
            <p className="text-gray-600">Fitur input cerdas memungkinkan Anda mencatat transaksi dalam hitungan detik. Tanpa loading lama.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analisa Real-time</h3>
            <p className="text-gray-600">Ketahui secara pasti berapa Health Score bisnis Anda saat ini dengan visualisasi grafik yang interaktif.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Keamanan Data Bank-grade</h3>
            <p className="text-gray-600">Data finansial Anda dienkripsi dan disimpan dengan standar keamanan tinggi. Privasi Anda terjaga.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
