"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Store,
  MapPin,
  Tag,
  ChevronDown,
  Package,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
} from "lucide-react";
import { userStoreService, CreateUserStorePayload } from "@/services/userStoreService";
import { StoreItem, StoreCategory } from "@/services/adminService";

const CATEGORY_CONFIG: Record<StoreCategory, { label: string; color: string; bg: string }> = {
  kuliner: { label: "Kuliner", color: "text-orange-700", bg: "bg-orange-100" },
  fashion: { label: "Fashion", color: "text-pink-700", bg: "bg-pink-100" },
  elektronik: { label: "Elektronik", color: "text-blue-700", bg: "bg-blue-100" },
  kecantikan: { label: "Kecantikan", color: "text-purple-700", bg: "bg-purple-100" },
  pertanian: { label: "Pertanian", color: "text-green-700", bg: "bg-green-100" },
  jasa: { label: "Jasa", color: "text-cyan-700", bg: "bg-cyan-100" },
  lainnya: { label: "Lainnya", color: "text-gray-700", bg: "bg-gray-100" },
};

interface StoreFormState {
  name: string;
  category: StoreCategory;
  address: string;
  description: string;
}

const emptyForm: StoreFormState = {
  name: "",
  category: "kuliner",
  address: "",
  description: "",
};

export default function UserStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<StoreCategory | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreItem | null>(null);
  const [form, setForm] = useState<StoreFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStores = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await userStoreService.getMyStores();
      if (res.success && res.data) {
        setStores(res.data);
      } else {
        setErrorMsg(res.error || "Gagal memuat daftar toko Anda");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi saat memuat toko");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filtered = stores.filter((s) => {
    const sName = s.name || "";
    const sDesc = s.description || "";
    const matchSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sDesc.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || s.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: StoreItem) => {
    setEditingStore(s);
    setForm({
      name: s.name,
      category: s.category || "kuliner",
      address: s.address || "",
      description: s.description || "",
    });
    setShowModal(true);
  };

  const openDelete = (s: StoreItem) => {
    setDeletingStore(s);
    setShowDeleteModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (editingStore) {
        const res = await userStoreService.updateStore(editingStore.id, {
          name: form.name,
          category: form.category,
          address: form.address,
          description: form.description,
        });

        if (res.success && res.data) {
          setStores((prev) =>
            prev.map((s) => (s.id === editingStore.id ? (res.data as StoreItem) : s))
          );
          setSuccessMsg(res.message || "Data toko berhasil diperbarui!");
          setShowModal(false);
        } else {
          setErrorMsg(res.error || "Gagal memperbarui data toko");
        }
      } else {
        const res = await userStoreService.createStore({
          name: form.name,
          category: form.category,
          address: form.address,
          description: form.description,
        });

        if (res.success && res.data) {
          setStores((prev) => [res.data as StoreItem, ...prev]);
          setSuccessMsg(res.message || "Toko baru berhasil ditambahkan!");
          setShowModal(false);
        } else {
          setErrorMsg(res.error || "Gagal menambahkan toko baru");
        }
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStore) return;
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await userStoreService.deleteStore(deletingStore.id);
      if (res.success) {
        setStores((prev) => prev.filter((s) => s.id !== deletingStore.id));
        setSuccessMsg(res.message || "Toko berhasil dihapus!");
        setShowDeleteModal(false);
      } else {
        setErrorMsg(res.error || "Gagal menghapus toko");
      }
    } catch {
      setErrorMsg("Terjadi gangguan saat menghapus toko");
    } finally {
      setDeleting(false);
    }
  };

  const totalProducts = stores.reduce((sum, s) => sum + (s.productCount || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Toko &amp; Bisnis</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola seluruh unit bisnis, cabang usaha, dan toko UMKM Anda dalam satu akun.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStores}
            disabled={loading}
            className="p-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
            title="Segarkan data toko"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Toko Baru</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-xs text-emerald-700 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-xs text-rose-700 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Toko Terdaftar</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stores.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Toko Status Aktif</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {stores.filter((s) => s.status === "active").length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Produk di Toko</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{totalProducts}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama toko atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as StoreCategory | "all")}
            className="pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white font-medium text-gray-700"
          >
            <option value="all">Semua Kategori</option>
            {(Object.keys(CATEGORY_CONFIG) as StoreCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_CONFIG[c].label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-xs text-gray-500 ml-auto">
          {loading ? "Memuat..." : `${filtered.length} Toko ditemukan`}
        </span>
      </div>

      {/* Store Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Memuat daftar toko Anda...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {search || filterCategory !== "all" ? "Tidak ada toko yang cocok" : "Belum Ada Toko Terdaftar"}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {search || filterCategory !== "all"
              ? "Coba ubah kata kunci pencarian atau reset filter kategori bisnis Anda."
              : "Tambahkan toko atau unit usaha pertama Anda untuk mulai mengelola produk dan transaksi secara terstruktur."}
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Toko Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const cat = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG.lainnya;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                          {s.name}
                        </h3>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${cat.bg} ${cat.color} mt-0.5`}>
                          {cat.label}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status === "active" ? "Aktif" : s.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                    {s.description || "Tidak ada deskripsi tambahan."}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{s.address || "Alamat belum diatur"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>
                        Dibuat:{" "}
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.productCount || 0} Produk</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                      title="Edit Toko"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDelete(s)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors text-xs font-medium flex items-center gap-1"
                      title="Hapus Toko"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900">
                {editingStore ? "Edit Toko / Cabang" : "Tambah Toko Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Toko / Unit Usaha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    placeholder="Contoh: Kopi Kenangan Cabang Sudirman"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Kategori Usaha
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as StoreCategory })}
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none focus:bg-white text-gray-800"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as StoreCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_CONFIG[c].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Alamat Lengkap Toko
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    placeholder="Jalan, nomor, kelurahan, kota"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Deskripsi Singkat Usaha
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  placeholder="Ceritakan produk unggulan atau informasi toko..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingStore ? "Simpan Perubahan" : "Tambahkan Toko"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Hapus Toko?</h3>
            <p className="text-gray-500 text-xs mb-6">
              Toko <strong className="text-gray-800">{deletingStore.name}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Hapus Toko</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
