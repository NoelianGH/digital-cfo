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
} from "lucide-react";
import {
  adminService,
  StoreItem,
  StoreStatus,
  StoreCategory,
} from "@/services/adminService";

const STATUS_CONFIG: Record<StoreStatus, { label: string; color: string }> = {
  requested: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Diterima", color: "bg-green-100 text-green-700" },
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  suspended: { label: "Ditangguhkan", color: "bg-gray-100 text-gray-600" },
};

const CATEGORY_CONFIG: Record<StoreCategory, { label: string; color: string }> = {
  kuliner: { label: "Kuliner", color: "bg-orange-100 text-orange-700" },
  fashion: { label: "Fashion", color: "bg-pink-100 text-pink-700" },
  elektronik: { label: "Elektronik", color: "bg-blue-100 text-blue-700" },
  kecantikan: { label: "Kecantikan", color: "bg-purple-100 text-purple-700" },
  pertanian: { label: "Pertanian", color: "bg-green-100 text-green-700" },
  jasa: { label: "Jasa", color: "bg-cyan-100 text-cyan-700" },
  lainnya: { label: "Lainnya", color: "bg-gray-100 text-gray-600" },
};

interface StoreFormState {
  name: string;
  ownerName: string;
  category: StoreCategory;
  status: StoreStatus;
  address: string;
  productCount: number;
  description: string;
}

const emptyStoreForm: StoreFormState = {
  name: "",
  ownerName: "",
  category: "lainnya",
  status: "requested",
  address: "",
  productCount: 0,
  description: "",
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StoreStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreItem | null>(null);
  const [form, setForm] = useState<StoreFormState>(emptyStoreForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const statuses: StoreStatus[] = ["requested", "accepted", "active", "rejected", "suspended"];

  const fetchStores = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await adminService.getAllStores();
      if (res.success && res.data) {
        setStores(res.data);
      } else {
        setErrorMsg(res.error || "Gagal memuat data toko dari database");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat memuat data toko");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filtered = stores.filter((s) => {
    const sName = s.name || "";
    const sOwner = s.ownerName || "";
    const matchSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sOwner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingStore(null);
    setForm(emptyStoreForm);
    setShowModal(true);
  };

  const openEdit = (s: StoreItem) => {
    setEditingStore(s);
    setForm({
      name: s.name,
      ownerName: s.ownerName,
      category: s.category || "lainnya",
      status: s.status || "requested",
      address: s.address || "",
      productCount: s.productCount || 0,
      description: s.description ?? "",
    });
    setShowModal(true);
  };

  const openDelete = (s: StoreItem) => {
    setDeletingStore(s);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.ownerName) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (editingStore) {
        const res = await adminService.updateStore(editingStore.id, {
          name: form.name,
          ownerName: form.ownerName,
          category: form.category,
          status: form.status,
          address: form.address,
          description: form.description,
          productCount: form.productCount,
        });

        if (res.success && res.data) {
          setStores((prev) =>
            prev.map((s) => (s.id === editingStore.id ? (res.data as StoreItem) : s))
          );
          setSuccessMsg(res.message || "Data toko berhasil diperbarui di database");
          setShowModal(false);
        } else {
          setErrorMsg(res.error || "Gagal memperbarui data toko");
        }
      } else {
        const res = await adminService.createStore({
          name: form.name,
          ownerName: form.ownerName,
          category: form.category,
          status: form.status,
          address: form.address,
          description: form.description,
          productCount: form.productCount,
        });

        if (res.success && res.data) {
          setStores((prev) => [res.data as StoreItem, ...prev]);
          setSuccessMsg(res.message || "Toko baru berhasil disimpan ke database");
          setShowModal(false);
        } else {
          setErrorMsg(res.error || "Gagal menambahkan toko baru");
        }
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi saat menyimpan toko");
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
      const res = await adminService.deleteStore(deletingStore.id);
      if (res.success) {
        setStores((prev) => prev.filter((s) => s.id !== deletingStore.id));
        setSuccessMsg(res.message || "Toko berhasil dihapus dari database");
        setShowDeleteModal(false);
      } else {
        setErrorMsg(res.error || "Gagal menghapus toko");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat menghapus toko");
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatus = async (id: string, newStatus: StoreStatus) => {
    setUpdatingStatusId(id);
    const oldStores = [...stores];

    // Optimistic UI update
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await adminService.updateStoreStatus(id, newStatus);
      if (res.success) {
        setSuccessMsg(res.message || `Status toko berhasil diubah menjadi ${newStatus}`);
      } else {
        setStores(oldStores);
        setErrorMsg(res.error || "Gagal mengubah status toko di database");
      }
    } catch {
      setStores(oldStores);
      setErrorMsg("Koneksi gagal saat mengubah status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Toko &amp; Produk</h1>
          <p className="text-gray-500 mt-1">Daftar toko dan produk UMKM yang tersimpan di database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStores}
            disabled={loading}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            title="Segarkan data dari database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Toko
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
        {statuses.map((st) => {
          const count = stores.filter((s) => s.status === st).length;
          const isSelected = filterStatus === st;
          return (
            <div
              key={st}
              onClick={() => setFilterStatus(filterStatus === st ? "all" : st)}
              className={`bg-white rounded-xl border shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-blue-500 border-blue-200" : "border-gray-100"
              }`}
            >
              <p className="text-xs text-gray-500">{STATUS_CONFIG[st].label}</p>
              <p className="text-2xl font-bold mt-1 text-gray-800">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama toko / pemilik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StoreStatus | "all")}
              className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Semua Status</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-500">
            {loading ? "Memuat..." : `${filtered.length} toko`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-3" />
              <p className="text-sm">Menghubungkan &amp; memuat data toko dari database...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Toko</th>
                  <th className="px-4 py-3 font-medium">Pemilik</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Produk</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ubah Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Tidak ada data toko yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const catConfig = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG.lainnya;
                    const statConfig = STATUS_CONFIG[s.status] || STATUS_CONFIG.requested;
                    const isUpdatingThis = updatingStatusId === s.id;

                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <Store className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{s.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {s.address ? s.address.split(",")[0] : "Belum ada alamat"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{s.ownerName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${catConfig.color}`}>
                            {catConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            {s.productCount ?? 0}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statConfig.color}`}>
                            {statConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <select
                              value={s.status}
                              disabled={isUpdatingThis}
                              onChange={(e) => handleQuickStatus(s.id, e.target.value as StoreStatus)}
                              className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white disabled:opacity-50"
                            >
                              {statuses.map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_CONFIG[st].label}
                                </option>
                              ))}
                            </select>
                            {isUpdatingThis ? (
                              <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500 animate-spin" />
                            ) : (
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                              title="Edit Toko"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(s)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                              title="Hapus Toko"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900">
                {editingStore ? "Edit Toko" : "Tambah Toko Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Toko <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Toko Berkah Sejahtera"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemilik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama pemilik toko"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={2}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Alamat lengkap lokasi toko"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Keterangan singkat usaha / produk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as StoreCategory })}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {(Object.keys(CATEGORY_CONFIG) as StoreCategory[]).map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_CONFIG[c].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as StoreStatus })}
                      className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_CONFIG[st].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Produk</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    value={form.productCount}
                    onChange={(e) => setForm({ ...form, productCount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name || !form.ownerName || saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingStore ? "Simpan Perubahan" : "Tambah Toko"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-center mb-2 text-gray-900">Hapus Toko?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Toko <span className="font-semibold text-gray-700">{deletingStore.name}</span> milik{" "}
              <span className="font-semibold text-gray-700">{deletingStore.ownerName}</span> akan dihapus secara permanen dari database.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
