import Link from "next/link";
import { LayoutDashboard, Users, Store, LogOut, MessageSquare } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            LaporKas!
          </Link>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Statistik Admin</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium">List User</span>
          </Link>
          <Link href="/admin/stores" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Store className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Toko & Produk</span>
          </Link>
          <Link href="/admin/kritik-saran" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Kritik & Saran</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/auth" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h2 className="font-semibold text-gray-800">Administrator Dashboard</h2>
        </header>
        <div className="p-8 flex-1 text-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}
