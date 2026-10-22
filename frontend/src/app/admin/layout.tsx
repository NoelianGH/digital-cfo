"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, Store, LogOut, MessageSquare, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = authService.getStoredUser();
    const token = authService.getStoredToken();

    if (!user || !token) {
      router.replace("/auth");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/user");
      return;
    }
    setChecking(false);
  }, [router]);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      authService.logout();
    }
  };

  const navItems = [
    { href: "/admin", label: "Statistik Admin", icon: LayoutDashboard },
    { href: "/admin/users", label: "List User", icon: Users },
    { href: "/admin/stores", label: "Toko & Produk", icon: Store },
    { href: "/admin/kritik-saran", label: "Kritik & Saran", icon: MessageSquare },
  ];

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-sm text-slate-300">Memverifikasi sesi admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">Digital CFO</span>
              <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Panel
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Admin</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Administrator Dashboard — Digital CFO</h2>
          </div>
        </header>
        <div className="p-8 flex-1 text-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}
