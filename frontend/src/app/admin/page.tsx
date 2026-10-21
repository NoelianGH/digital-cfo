import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistik Sistem Global</h1>
      
      {/* Global Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Users</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">1,245</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Toko</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-2">890</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Feedback</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">342</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Server Health</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">99.9%</h3>
        </div>
      </div>
      
      {/* Today's Snapshot (Admin) */}
      <h2 className="text-xl font-bold mb-4">Aktivitas Hari Ini (Snapshot)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users" className="bg-blue-50 p-5 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-blue-800 text-sm font-medium mb-1">User Baru (Hari Ini)</p>
          <h4 className="text-xl font-bold text-blue-900">+15 User</h4>
        </Link>
        <Link href="/admin/stores" className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-indigo-800 text-sm font-medium mb-1">Toko Baru (Hari Ini)</p>
          <h4 className="text-xl font-bold text-indigo-900">+8 Toko</h4>
        </Link>
        <Link href="/admin/kritik-saran" className="bg-purple-50 p-5 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all hover:-translate-y-1 block cursor-pointer">
          <p className="text-purple-800 text-sm font-medium mb-1">Kritik & Saran (Hari Ini)</p>
          <h4 className="text-xl font-bold text-purple-900">+3 Laporan</h4>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
        <h3 className="font-bold text-lg mb-4">Grafik Pendaftaran Bulan Ini</h3>
        <div className="w-full h-48 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          Grafik akan tampil di sini
        </div>
      </div>
    </div>
  );
}
