import { BookOpen, PlayCircle } from "lucide-react";

export default function GuidesPage() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Panduan Aplikasi</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Pelajari cara menggunakan LaporKas! dengan maksimal melalui panduan lengkap dan video tutorial di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Guide/Video */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 group cursor-pointer hover:bg-gray-50 transition-colors">
            <PlayCircle className="w-16 h-16 mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-600">Klik untuk memutar Video Panduan 1 Menit</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Langkah Pertama Menggunakan LaporKas!</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Selamat datang di aplikasi kami. Langkah pertama yang harus Anda lakukan adalah mendaftarkan profil toko Anda pada menu pengaturan.</p>
              <p>Setelah itu, Anda bisa mulai melakukan input transaksi harian melalui menu <strong>Pembukuan Kas</strong>. Jangan khawatir jika terjadi kesalahan input, karena sistem kami memungkinkan Anda untuk melakukan edit pada hari yang sama.</p>
            </div>
          </div>
        </div>

        {/* Article Sidebar */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Artikel Populer
          </h3>
          <ul className="space-y-4">
            <li>
              <a href="#" className="block hover:bg-white p-3 rounded-lg transition-colors group">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Cara Membaca Health Score</h4>
                <p className="text-xs text-gray-500 mt-1">Pahami indikator warna hijau, kuning, dan merah.</p>
              </a>
            </li>
            <li>
              <a href="#" className="block hover:bg-white p-3 rounded-lg transition-colors group">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Merespon Rekomendasi AI</h4>
                <p className="text-xs text-gray-500 mt-1">Apa yang harus dilakukan setelah AI memberi saran?</p>
              </a>
            </li>
            <li>
              <a href="#" className="block hover:bg-white p-3 rounded-lg transition-colors group">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Ekspor Data Laporan</h4>
                <p className="text-xs text-gray-500 mt-1">Tutorial mengunduh laporan bulanan ke format PDF & Excel.</p>
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
