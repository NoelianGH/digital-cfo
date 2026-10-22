"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, TrendingUp, ShoppingBag, Store, Loader2, RefreshCw } from "lucide-react";
import { adminService, AdminStats } from "@/services/adminService";

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const res = await adminService.getStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Pengguna Terdaftar",
      value: stats?.totalUsers ?? 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Total Toko Terdaftar",
      value: stats?.totalStores ?? 0,
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: Store,
      href: "/admin/stores",
    },
    {
      label: "Total Transaksi",
      value: stats?.totalTransactions ?? 0,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: TrendingUp,
      href: null,
    },
    {
      label: "Total Produk",
      value: stats?.totalProducts ?? 0,
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: ShoppingBag,
      href: null,
    },
    {
      label: "Volume Kas Masuk",
      value: `Rp ${(stats?.totalVolume ?? 0).toLocaleString("id-ID")}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: Store,
      href: null,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistik Sistem Global</h1>
          <p className="text-gray-500 text-sm mt-1">Data real-time dari database platform Digital CFO</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
          title="Segarkan Data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Global Counters */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
          <span className="text-gray-500 text-sm">Memuat statistik platform...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                    <div className={`p-2 rounded-lg ${s.bg}`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${s.color}`}>{s.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Quick Links for Admin */}
          <h2 className="text-xl font-bold mb-4 text-gray-900">Aksi Cepat Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/admin/users"
              className="bg-blue-50 p-5 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all hover:-translate-y-1 block cursor-pointer"
            >
              <p className="text-blue-800 text-sm font-medium mb-1">Manajemen Pengguna</p>
              <h4 className="text-xl font-bold text-blue-900">{stats?.totalUsers ?? 0} User</h4>
              <p className="text-xs text-blue-600 mt-1">Lihat, tambah, edit, hapus pengguna →</p>
            </Link>
            <Link
              href="/admin/stores"
              className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all hover:-translate-y-1 block cursor-pointer"
            >
              <p className="text-indigo-800 text-sm font-medium mb-1">Produk & Toko</p>
              <h4 className="text-xl font-bold text-indigo-900">{stats?.totalStores ?? 0} Toko ({stats?.totalProducts ?? 0} Produk)</h4>
              <p className="text-xs text-indigo-600 mt-1">Pantau toko UMKM dan katalog produk →</p>
            </Link>
            <Link
              href="/admin/kritik-saran"
              className="bg-purple-50 p-5 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all hover:-translate-y-1 block cursor-pointer"
            >
              <p className="text-purple-800 text-sm font-medium mb-1">Kritik & Saran</p>
              <h4 className="text-xl font-bold text-purple-900">Feedback</h4>
              <p className="text-xs text-purple-600 mt-1">Lihat masukan pengguna →</p>
            </Link>
          </div>

          {/* Info Box */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-3 text-gray-900">Akun Demo untuk Pengujian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Admin</p>
                <p className="font-mono text-sm text-purple-900">admin@digitalcfo.id</p>
                <p className="font-mono text-sm text-purple-700">Password: admin123</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">User UMKM</p>
                <p className="font-mono text-sm text-blue-900">user@digitalcfo.id</p>
                <p className="font-mono text-sm text-blue-700">Password: user123</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
