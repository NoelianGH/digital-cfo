"use client";

import { useState, useEffect } from "react";
import { Plus, X, Tag, Edit3, Trash2, CheckCircle, AlertCircle, Loader2, Calendar, Percent, Gift } from "lucide-react";
import { promoService, PromoItem } from "@/services/promoService";

export default function PromoPage() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);

  // Add Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"DISKON" | "CASHBACK" | "BUY_ONE_GET_ONE">("DISKON");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [endDate, setEndDate] = useState("2026-11-30");

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await promoService.getPromos();
      if (res.success && res.data) {
        setPromos(res.data);
      } else {
        setPromos([]);
      }
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !value) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await promoService.addPromo({
        title,
        description,
        type,
        value: parseFloat(value) || 0,
        minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
        startDate: new Date().toISOString().split("T")[0],
        endDate,
        status: "AKTIF",
      });

      if (res.success && res.data) {
        setPromos([res.data, ...promos]);
        setIsAddModalOpen(false);
        setTitle("");
        setDescription("");
        setValue("");
        setMinPurchase("");
        setSuccessMsg("Promo berhasil dibuat!");
      } else {
        setErrorMsg(res.error || "Gagal membuat promo baru");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan promo ke database");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await promoService.updatePromo(editingPromo.id, {
        title: editingPromo.title,
        description: editingPromo.description || undefined,
        type: editingPromo.type,
        value: editingPromo.value,
        minPurchase: editingPromo.minPurchase || undefined,
        endDate: editingPromo.endDate,
        status: editingPromo.status,
      });

      if (res.success && res.data) {
        setPromos(promos.map((p) => (p.id === editingPromo.id ? res.data! : p)));
        setIsEditModalOpen(false);
        setEditingPromo(null);
        setSuccessMsg("Promo berhasil diperbarui!");
      } else {
        setErrorMsg(res.error || "Gagal memperbarui promo");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui promo di database");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (id: string, promoTitle: string) => {
    if (!confirm(`Hapus promo "${promoTitle}" secara permanen?`)) return;
    try {
      const res = await promoService.deletePromo(id);
      if (res.success) {
        setPromos(promos.filter((p) => p.id !== id));
        setSuccessMsg("Promo berhasil dihapus!");
      } else {
        setPromos(promos.filter((p) => p.id !== id));
      }
    } catch {
      setPromos(promos.filter((p) => p.id !== id));
    }
  };

  const handleToggleStatus = async (promo: PromoItem) => {
    const nextStatus = promo.status === "AKTIF" ? "NON_AKTIF" : "AKTIF";
    try {
      await promoService.updatePromo(promo.id, { status: nextStatus });
      setPromos(promos.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p)));
      setSuccessMsg(`Status promo diubah menjadi ${nextStatus}`);
    } catch {
      setPromos(promos.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Promo & Diskon</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola diskon, cashback, dan program loyalitas pelanggan.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Promo Baru</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-700 underline">Tutup</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-700 underline">Tutup</button>
        </div>
      )}

      {/* Promos Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Memuat daftar promo...</p>
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
          <Tag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-semibold text-gray-700">Belum ada promo aktif</p>
          <p className="text-xs text-gray-400 mt-1">Buat diskon menarik untuk meningkatkan omzet penjualan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
                p.status === "AKTIF" ? "border-blue-200 hover:border-blue-300" : "border-gray-200 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.type === "DISKON"
                        ? "bg-blue-100 text-blue-800"
                        : p.type === "CASHBACK"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.type}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(p)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                      p.status === "AKTIF"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Klik untuk mengubah status aktif/non-aktif"
                  >
                    ● {p.status}
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{p.description || "Promo diskon spesial pelanggan."}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nilai Diskon:</span>
                    <span className="font-bold text-blue-700">
                      {p.type === "DISKON" ? `${p.value}%` : `Rp ${p.value.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  {p.minPurchase && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min. Belanja:</span>
                      <span className="font-semibold text-gray-800">Rp {p.minPurchase.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Berlaku Sampai:</span>
                    <span className="text-gray-800">{p.endDate ? p.endDate.split("T")[0] : "-"}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Diklaim: {p.claimedCount || 0}x</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingPromo(p);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Promo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePromo(p.id, p.title)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Promo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Buat Promo Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Buat Promo Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPromo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama / Judul Promo</label>
                <input
                  type="text"
                  placeholder="Contoh: Diskon Weekend Kopi 20%"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipe Promo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DISKON">Diskon Persen (%)</option>
                    <option value="CASHBACK">Cashback (Rp)</option>
                    <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {type === "DISKON" ? "Besar Diskon (%)" : "Nominal Potongan (Rp)"}
                  </label>
                  <input
                    type="number"
                    placeholder={type === "DISKON" ? "20" : "10000"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min. Belanja (Rp - Opsional)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan / Ketentuan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Khusus pembelian dine-in atau take-away sebelum jam 12:00"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl text-xs font-bold shadow-sm"
                >
                  {submitting ? "Menyimpan..." : "Simpan Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Promo */}
      {isEditModalOpen && editingPromo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Promo</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePromo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama / Judul Promo</label>
                <input
                  type="text"
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nilai Potongan</label>
                  <input
                    type="number"
                    value={editingPromo.value}
                    onChange={(e) => setEditingPromo({ ...editingPromo, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingPromo.status}
                    onChange={(e) => setEditingPromo({ ...editingPromo, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NON_AKTIF">NON_AKTIF</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={editingPromo.description || ""}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl text-xs font-bold shadow-sm"
                >
                  {submitting ? "Memperbarui..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
