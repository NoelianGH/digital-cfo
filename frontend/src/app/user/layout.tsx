"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Store,
  BookOpen, 
  History, 
  Package, 
  Tag, 
  Lightbulb, 
  LogOut, 
  Plus, 
  Sparkles, 
  Menu, 
  X 
} from "lucide-react";
import { authService, UserProfile } from "@/services/authService";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check auth token — redirect immediately if not logged in
    if (!authService.isAuthenticated()) {
      router.replace('/auth');
      return;
    }

    // 2. Hydrate from localStorage first (no flash)
    const stored = authService.getStoredUser();
    if (stored) setUser(stored);

    // 3. Fetch fresh profile from backend
    authService.getProfile().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
      } else if (!res.success) {
        // Token invalid/expired — redirect to login
        authService.logout();
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      authService.logout();
    }
  };

  const navItems = [
    { href: "/user", label: "Statistik", icon: LayoutDashboard },
    { href: "/user/stores", label: "Toko & Bisnis", icon: Store },
    { href: "/user/pembukuan", label: "Pembukuan Kas", icon: BookOpen },
    { href: "/user/riwayat", label: "Riwayat Transaksi", icon: History },
    { href: "/user/product", label: "Product & POS", icon: Package },
    { href: "/user/promo", label: "Promo & Diskon", icon: Tag },
    { href: "/user/rekomendasi", label: "Rekomendasi AI", icon: Lightbulb },
  ];

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Block render entirely until auth is resolved — prevents any flash
  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <Link href="/user" className="flex items-center gap-2 text-lg font-bold text-white">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            CFO
          </div>
          <span>Digital CFO</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-64 bg-slate-950 text-white border-r border-slate-800 z-40`}
      >
        <div className="p-6 border-b border-slate-900 hidden md:block">
          <Link href="/user" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">Digital CFO</span>
              <span className="text-[11px] text-blue-400 font-medium">Platform Keuangan UMKM</span>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
          <Link
            href="/user/pembukuan"
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Kas</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-sm">Dashboard Digital CFO</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
              {user?.businessName || "UMKM Aktif"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/user/profile"
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-full hover:bg-gray-100 transition-colors text-xs text-gray-700"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {initials}
              </div>
              <span className="font-medium hidden sm:inline">{user?.name || "Akun Saya"}</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
