import Link from "next/link";

export default function UserHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistik Harian & Performa</h1>
      
      {/* Monthly Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Pemasukan Bulan Ini</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">Rp 15.000.000</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Pengeluaran Bulan Ini</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">Rp 8.500.000</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Saldo Aktif</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">Rp 6.500.000</h3>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Ringkasan Hari Ini</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Today's Bookkeeping */}
        <Link href="/user/pembukuan" className="bg-blue-50 p-5 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-blue-800 text-sm font-medium mb-1">Pembukuan (Hari Ini)</p>
          <h4 className="text-xl font-bold text-blue-900">5 Transaksi Baru</h4>
          <p className="text-xs text-blue-600 mt-2">+Rp 1.200.000</p>
        </Link>

        {/* Today's Products Sold */}
        <Link href="/user/product" className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-indigo-800 text-sm font-medium mb-1">Produk Terjual (Hari Ini)</p>
          <h4 className="text-xl font-bold text-indigo-900">12 Item</h4>
          <p className="text-xs text-indigo-600 mt-2">Kopi Susu Gula Aren terlaris</p>
        </Link>

        {/* Active Promos Today */}
        <Link href="/user/promo" className="bg-pink-50 p-5 rounded-xl border border-pink-100 hover:bg-pink-100 hover:border-pink-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-pink-800 text-sm font-medium mb-1">Promo Aktif (Hari Ini)</p>
          <h4 className="text-xl font-bold text-pink-900">2 Diskon Aktif</h4>
          <p className="text-xs text-pink-600 mt-2">Diklaim 8 kali hari ini</p>
        </Link>

        {/* Active AI Recommendations */}
        <Link href="/user/rekomendasi" className="bg-amber-50 p-5 rounded-xl border border-amber-100 hover:bg-amber-100 hover:border-amber-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-amber-800 text-sm font-medium mb-1">AI Actionable (Saat Ini)</p>
          <h4 className="text-xl font-bold text-amber-900">1 Prioritas Tinggi</h4>
          <p className="text-xs text-amber-600 mt-2">"Kurangi restock barang B"</p>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
        <h3 className="font-bold text-lg mb-4">Grafik Tren 7 Hari Terakhir</h3>
        <div className="w-full h-48 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          Grafik akan tampil di sini
        </div>
      </div>
    </div>
  );
}
