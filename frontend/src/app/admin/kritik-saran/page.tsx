export default function AdminKritikSaranPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Kritik dan Saran</h1>
      <p className="text-gray-500 mb-8">Baca umpan balik, komentar, dan rating dari pengguna aplikasi LaporKas!.</p>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Inbox Masukan</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">Toko Maju Jaya (⭐⭐⭐⭐⭐)</h4>
              <span className="text-xs text-gray-400">Hari ini, 14:30</span>
            </div>
            <p className="text-gray-600 text-sm">Aplikasinya sangat membantu pencatatan keuangan UMKM saya jadi lebih rapi.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">Budi Kopi (⭐⭐⭐)</h4>
              <span className="text-xs text-gray-400">Kemarin</span>
            </div>
            <p className="text-gray-600 text-sm">Mohon fitur scan nota dipercepat proses loading-nya.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
