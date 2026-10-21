"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Store, MapPin, Tag, ChevronDown, Package } from "lucide-react";

type StoreStatus = "requested" | "accepted" | "rejected" | "suspended" | "active";
type StoreCategory = "kuliner" | "fashion" | "elektronik" | "kecantikan" | "pertanian" | "jasa" | "lainnya";

interface StoreData {
  id: number;
  name: string;
  ownerName: string;
  category: StoreCategory;
  status: StoreStatus;
  address: string;
  joinDate: string;
  productCount: number;
  description?: string;
}

const initialStores: StoreData[] = [
  { id: 1, name: "Toko Budi Makmur", ownerName: "Budi Santoso", category: "kuliner", status: "active", address: "Jl. Merdeka No. 12, Jakarta", joinDate: "2025-01-10", productCount: 24, description: "Aneka makanan dan minuman segar." },
  { id: 2, name: "Warung Siti", ownerName: "Siti Rahayu", category: "kuliner", status: "active", address: "Jl. Pahlawan No. 5, Bandung", joinDate: "2025-02-15", productCount: 10 },
  { id: 3, name: "Doni Store", ownerName: "Doni Wahyu", category: "fashion", status: "requested", address: "Jl. Sudirman No. 88, Surabaya", joinDate: "2025-04-20", productCount: 0 },
  { id: 4, name: "Kecantikan Ayu", ownerName: "Ayu Pratiwi", category: "kecantikan", status: "requested", address: "Jl. Bunga No. 3, Yogyakarta", joinDate: "2025-05-01", productCount: 0 },
  { id: 5, name: "Elektro Jaya", ownerName: "Jaya Kusuma", category: "elektronik", status: "rejected", address: "Jl. Industri No. 22, Semarang", joinDate: "2025-03-10", productCount: 5 },
  { id: 6, name: "Tani Sejahtera", ownerName: "Rudi Petani", category: "pertanian", status: "suspended", address: "Desa Makmur, Malang", joinDate: "2025-01-25", productCount: 8 },
];

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

const emptyStore: Omit<StoreData, "id"> = {
  name: "",
  ownerName: "",
  category: "lainnya",
  status: "requested",
  address: "",
  joinDate: new Date().toISOString().split("T")[0],
  productCount: 0,
  description: "",
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreData[]>(initialStores);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StoreStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreData | null>(null);
  const [form, setForm] = useState<Omit<StoreData, "id">>(emptyStore);

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingStore(null);
    setForm(emptyStore);
    setShowModal(true);
  };

  const openEdit = (s: StoreData) => {
    setEditingStore(s);
    setForm({ name: s.name, ownerName: s.ownerName, category: s.category, status: s.status, address: s.address, joinDate: s.joinDate, productCount: s.productCount, description: s.description ?? "" });
    setShowModal(true);
  };

  const openDelete = (s: StoreData) => {
    setDeletingStore(s);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.ownerName) return;
    if (editingStore) {
      setStores((prev) => prev.map((s) => (s.id === editingStore.id ? { ...s, ...form } : s)));
    } else {
      const newId = Math.max(...stores.map((s) => s.id), 0) + 1;
      setStores((prev) => [...prev, { id: newId, ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!deletingStore) return;
    setStores((prev) => prev.filter((s) => s.id !== deletingStore.id));
    setShowDeleteModal(false);
  };

  const handleQuickStatus = (id: number, status: StoreStatus) => {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const statuses: StoreStatus[] = ["requested", "accepted", "active", "rejected", "suspended"];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Toko &amp; Produk</h1>
          <p className="text-gray-500 mt-1">Daftar toko dan produk yang dijual oleh user.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Toko
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 my-6">
        {statuses.map((st) => (
          <div
            key={st}
            onClick={() => setFilterStatus(filterStatus === st ? "all" : st)}
            className={`bg-white rounded-xl border shadow-sm p-3 cursor-pointer transition-all hover:shadow-md ${filterStatus === st ? "ring-2 ring-blue-500 border-blue-200" : "border-gray-100"}`}
          >
            <p className="text-xs text-gray-500">{STATUS_CONFIG[st].label}</p>
            <p className="text-2xl font-bold mt-1">{stores.filter((s) => s.status === st).length}</p>
          </div>
        ))}
      </div>

      {/* Table */}
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
                <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} toko</span>
        </div>

        <div className="overflow-x-auto">
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
                  <td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada data toko.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                          <Store className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{s.address.split(",")[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.ownerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${CATEGORY_CONFIG[s.category].color}`}>
                        {CATEGORY_CONFIG[s.category].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package className="w-3.5 h-3.5" />
                        {s.productCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[s.status].color}`}>
                        {STATUS_CONFIG[s.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={s.status}
                          onChange={(e) => handleQuickStatus(s.id, e.target.value as StoreStatus)}
                          className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(s)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-lg">{editingStore ? "Edit Toko" : "Tambah Toko Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko *</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama toko"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik *</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama pemilik"
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
                    placeholder="Alamat lengkap toko"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi singkat toko"
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
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {(Object.keys(CATEGORY_CONFIG) as StoreCategory[]).map((c) => (
                        <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
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
                    onChange={(e) => setForm({ ...form, productCount: Number(e.target.value) })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.ownerName}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors"
              >
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
            <h3 className="font-bold text-lg text-center mb-2">Hapus Toko?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Toko <span className="font-semibold text-gray-700">{deletingStore.name}</span> akan dihapus secara permanen beserta semua datanya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
