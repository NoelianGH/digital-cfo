export default function RekomendasiAIPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Rekomendasi AI</h1>
          <p className="text-gray-500">Seluruh panduan cerdas dan riwayat keputusan bisnis yang disarankan AI.</p>
        </div>
        {/* Tidak ada tombol tambah karena ini AI generated */}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Riwayat Actionable Insights (Semua Riwayat)</h3>
        <p className="text-gray-400 text-sm">Belum ada insight sejauh ini.</p>
      </div>
    </div>
  );
}
