"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  BookOpen, 
  Package, 
  Tag, 
  Lightbulb, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { transactionService, TransactionSummary } from "@/services/transactionService";
import { healthScoreService, HealthScoreData } from "@/services/healthScoreService";
import { authService, UserProfile } from "@/services/authService";

export default function UserHomePage() {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalModal: 0,
    totalExpense: 0,
    netCashFlow: 0,
    count: 0,
  });
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const u = authService.getStoredUser();
      if (u) setUser(u);

      const [sumRes, healthRes] = await Promise.all([
        transactionService.getSummary(),
        healthScoreService.getHealthScore(),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
      if (healthRes.success && healthRes.data) {
        setHealthScore(healthRes.data);
      }
    } catch (e) {
      console.warn("Dashboard loaded fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  const scoreVal = healthScore?.score ?? 78;
  const scoreCategory = healthScore?.category ?? "SEHAT";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-slate-700">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Digital CFO UMKM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Halo, {user?.name || "Pemilik UMKM"}! 👋
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">
            Bisnis: <strong>{user?.businessName || "Kedai Kopi Kenangan"}</strong>. Pantau arus kas harian dan skor kesehatan keuangan Anda.
          </p>
        </div>

        {/* Health Score Mini Widget */}
        <Link
          href="/user/rekomendasi"
          className="bg-white/10 hover:bg-white/15 p-4 rounded-xl border border-white/15 flex items-center gap-4 transition-all hover:scale-105 cursor-pointer self-start md:self-auto"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex flex-col items-center justify-center font-black shadow-md">
            <span className="text-lg leading-none">{Math.round(scoreVal)}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Skor</span>
          </div>
          <div>
            <span className="text-xs text-blue-200 block">Kesehatan Bisnis:</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Status {scoreCategory}
            </span>
          </div>
        </Link>
      </div>

      {/* Monthly Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Pemasukan Kas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">
            Rp {(summary.totalIncome || 0).toLocaleString("id-ID")}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Termasuk omzet POS & transfer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Pengeluaran Kas</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-600">
            Rp {(summary.totalExpense || 0).toLocaleString("id-ID")}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Bahan baku, operasional & gaji</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Saldo Kas Riil</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-blue-700">
            Rp {(summary.netCashFlow || 0).toLocaleString("id-ID")}
          </h3>
          <p className="text-xs text-gray-400 mt-2">Modal + Masuk - Pengeluaran</p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Fitur Cepat & Manajemen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/user/pembukuan"
            className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all hover:-translate-y-1 block cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-blue-600 text-white w-fit mb-3 shadow-md shadow-blue-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-blue-900 text-sm font-bold">Pembukuan Kas</p>
            <p className="text-xs text-blue-700/80 mt-1">Catat via Suara, OCR Nota, & PDF Mutasi</p>
            <span className="text-xs font-semibold text-blue-600 mt-3 inline-block group-hover:underline">
              Buka Pembukuan →
            </span>
          </Link>

          <Link
            href="/user/product"
            className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all hover:-translate-y-1 block cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-indigo-600 text-white w-fit mb-3 shadow-md shadow-indigo-200">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-indigo-900 text-sm font-bold">Produk & POS Kasir</p>
            <p className="text-xs text-indigo-700/80 mt-1">Kelola stok barang & checkout struk kasir</p>
            <span className="text-xs font-semibold text-indigo-600 mt-3 inline-block group-hover:underline">
              Buka POS Kasir →
            </span>
          </Link>

          <Link
            href="/user/promo"
            className="bg-pink-50/70 p-5 rounded-2xl border border-pink-100 hover:bg-pink-100 hover:border-pink-200 transition-all hover:-translate-y-1 block cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-pink-600 text-white w-fit mb-3 shadow-md shadow-pink-200">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-pink-900 text-sm font-bold">Promo & Diskon</p>
            <p className="text-xs text-pink-700/80 mt-1">Atur potongan harga belanja pelanggan</p>
            <span className="text-xs font-semibold text-pink-600 mt-3 inline-block group-hover:underline">
              Kelola Promo →
            </span>
          </Link>

          <Link
            href="/user/rekomendasi"
            className="bg-amber-50/70 p-5 rounded-2xl border border-amber-100 hover:bg-amber-100 hover:border-amber-200 transition-all hover:-translate-y-1 block cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-amber-600 text-white w-fit mb-3 shadow-md shadow-amber-200">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className="text-amber-900 text-sm font-bold">Rekomendasi</p>
            <p className="text-xs text-amber-700/80 mt-1">Saran taktis Fuzzy Tsukamoto & SAW</p>
            <span className="text-xs font-semibold text-amber-600 mt-3 inline-block group-hover:underline">
              Lihat Rekomendasi →
            </span>
          </Link>
        </div>
      </div>

      {/* Visual Chart / Ledger Summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Aktivitas Arus Kas Terkini</h3>
            <p className="text-xs text-gray-400">Total {summary.count || 0} riwayat transaksi tercatat</p>
          </div>
          <Link href="/user/riwayat" className="text-xs font-semibold text-blue-600 hover:underline">
            Lihat Riwayat Lengkap →
          </Link>
        </div>

        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-10 h-10 text-blue-500 mb-2" />
          <h4 className="font-bold text-sm text-slate-800">Pembukuan Keuangan Tersinkronisasi</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            Data pembukuan terhubung ke database. Gunakan fitur OCR Scan, Suara, atau PDF to Data untuk mencatat arus kas secara real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
