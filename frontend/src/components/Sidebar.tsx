import Link from 'next/link';
import { Home, PlusCircle, BarChart3, Activity } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Aplikasi Kita</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/5">
          <Home className="w-5 h-5 text-purple-400" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/input" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">Input Transaksi</span>
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Analisa</span>
        </Link>
      </nav>

      <div className="p-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20">
          <h4 className="text-sm font-semibold text-white mb-1">Upgrade ke Pro</h4>
          <p className="text-xs text-gray-400 mb-3">Dapatkan laporan mendalam.</p>
          <button className="w-full py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
