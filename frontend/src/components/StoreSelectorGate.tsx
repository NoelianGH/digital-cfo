"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Store, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Building2, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  LucideIcon
} from "lucide-react";
import { userStoreService } from "@/services/userStoreService";
import { StoreItem, StoreCategory } from "@/services/adminService";
import { authService } from "@/services/authService";

export interface SelectedStoreInfo {
  id: string;
  name: string;
  category?: string;
  address?: string;
  isAll?: boolean;
}

interface StoreSelectorGateProps {
  pageTitle: string;
  pageSubtitle: string;
  pageIcon: LucideIcon;
  pageKey: "riwayat" | "product" | "promo" | "rekomendasi";
  children: (selectedStore: SelectedStoreInfo, onResetStore: () => void) => React.ReactNode;
}

const CATEGORY_COLORS: Record<string, { label: string; badge: string }> = {
  kuliner: { label: "Kuliner", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  fashion: { label: "Fashion", badge: "bg-pink-50 text-pink-700 border-pink-200" },
  elektronik: { label: "Elektronik", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  kecantikan: { label: "Kecantikan", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  pertanian: { label: "Pertanian", badge: "bg-green-50 text-green-700 border-green-200" },
  jasa: { label: "Jasa", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  lainnya: { label: "Lainnya", badge: "bg-gray-50 text-gray-700 border-gray-200" },
};

export default function StoreSelectorGate({
  pageTitle,
  pageSubtitle,
  pageIcon: PageIcon,
  pageKey,
  children,
}: StoreSelectorGateProps) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<SelectedStoreInfo | null>(null);

  const storageKey = `cfo_selected_store_${pageKey}`;

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await userStoreService.getMyStores();
      let storeList = res.success && res.data ? res.data : [];

      // Jika user belum punya toko terdaftar, buat fallback dari nama bisnis user
      if (storeList.length === 0) {
        const u = authService.getStoredUser();
        const fallbackName = u?.businessName || "Toko Utama";
        storeList = [
          {
            id: "default-store-1",
            name: fallbackName,
            ownerName: u?.name || "Pemilik Toko",
            category: "kuliner",
            status: "active",
            address: "Alamat Toko Pusat",
            description: "Outlet operasional utama",
            productCount: 0,
            userId: u?.id || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }

      setStores(storeList);

      // Cek apakah ada toko tersimpan di sessionStorage untuk halaman ini
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Pastikan toko yang disimpan masih valid
          if (parsed.isAll || storeList.some((s) => s.id === parsed.id)) {
            setSelectedStore(parsed);
          }
        }
      } catch {
        // Abaikan parse error
      }
    } catch (e) {
      console.warn("Gagal memuat daftar toko:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (store: SelectedStoreInfo) => {
    setSelectedStore(store);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(store));
    } catch {
      // Abaikan
    }
  };

  const handleResetStore = () => {
    setSelectedStore(null);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Abaikan
    }
  };

  // 1. Tampilkan state loading
  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center p-8 text-gray-500">
        <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat data toko & cabang...</p>
      </div>
    );
  }

  // 2. Jika belum ada toko yang dipilih: Tampilkan PAGE FULL BUTTON TOKO
  if (!selectedStore) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-7 sm:p-9 rounded-3xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
              <PageIcon className="w-3.5 h-3.5" />
              Pilih Toko / Cabang untuk {pageTitle}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pilih Toko Yang Ingin Dilihat
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-2 leading-relaxed">
              {pageSubtitle}. Pilih salah satu cabang usaha di bawah untuk menyortir dan menampilkan data khusus toko tersebut.
            </p>
          </div>
        </div>

        {/* Store Selection Grid (FULL BUTTONS) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              Daftar Toko & Cabang Usaha Anda ({stores.length} Toko)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Opsi Konsolidasi: Semua Toko Sekaligus */}
            <button
              type="button"
              onClick={() =>
                handleSelectStore({
                  id: "all",
                  name: "Semua Toko (Konsolidasi Global)",
                  category: "Semua Cabang",
                  address: "Gabungan seluruh cabang usaha",
                  isAll: true,
                })
              }
              className="text-left bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 hover:border-blue-400 hover:shadow-xl transition-all duration-200 group cursor-pointer hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                    Konsolidasi
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                  Semua Toko (Konsolidasi)
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  Tampilkan data gabungan seluruh cabang usaha dan outlet UMKM Anda sekaligus.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                <span>Buka {pageTitle} Gabungan</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Kartu Tombol Per Toko */}
            {stores.map((st) => {
              const catConf = CATEGORY_COLORS[st.category?.toLowerCase()] || CATEGORY_COLORS.lainnya;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    handleSelectStore({
                      id: st.id,
                      name: st.name,
                      category: catConf.label,
                      address: st.address || undefined,
                      isAll: false,
                    })
                  }
                  className="text-left bg-white p-6 rounded-2xl border border-gray-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-200 group cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Store className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catConf.badge}`}>
                        {catConf.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                      {st.name}
                    </h3>

                    {st.address && (
                      <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{st.address}</span>
                      </p>
                    )}

                    {st.description && (
                      <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 italic">
                        "{st.description}"
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Pilih Toko Ini
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-blue-600 group-hover:translate-x-1 transition-transform">
                      Buka {pageTitle} →
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Tombol Tambah Toko Baru */}
            <Link
              href="/user/stores"
              className="text-left bg-slate-50/80 p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-200 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:border-blue-300 shadow-2xs mb-3 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                Daftarkan Toko Baru
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Tambahkan cabang toko atau outlet baru untuk mengelola keuangan terpisah.
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Jika toko SUDAH DIPILIH: Tampilkan Banner Toko Aktif di atas, lalu render children (halaman sebenarnya)
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      {/* Active Store Sticky/Top Bar */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 font-bold shrink-0">
            {selectedStore.isAll ? <Building2 className="w-5 h-5" /> : <Store className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Toko Aktif:
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                {selectedStore.name}
              </h2>
              {selectedStore.isAll ? (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Konsolidasi
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span>Menampilkan data khusus cabang ini</span>
              {selectedStore.address && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400 truncate max-w-xs">{selectedStore.address}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetStore}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>
      </div>

      {/* Render the actual page */}
      {children(selectedStore, handleResetStore)}
    </div>
  );
}

