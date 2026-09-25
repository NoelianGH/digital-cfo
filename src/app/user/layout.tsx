import Link from "next/link";
import { LayoutDashboard, BookOpen, Package, Tag, Lightbulb, LogOut } from "lucide-react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            LaporKas!
          </Link>
          <p className="text-gray-400 text-sm mt-1">Customer Panel</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/user" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Statistik</span>
          </Link>
          <Link href="/user/pembukuan" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Pembukuan Kas</span>
          </Link>
          <Link href="/user/product" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Product</span>
          </Link>
          <Link href="/user/promo" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Tag className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Promo</span>
          </Link>
          <Link href="/user/rekomendasi" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Rekomendasi AI</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/auth" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h2 className="font-semibold text-gray-800">Dashboard Area</h2>
        </header>
        <div className="p-8 flex-1 text-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}
