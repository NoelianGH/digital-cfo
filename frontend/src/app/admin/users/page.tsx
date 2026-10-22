"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, X, Search, User, Mail, Shield,
  ChevronDown, Loader2, CheckCircle, AlertCircle, RefreshCw, Building2
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { UserProfile } from "@/services/authService";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: "USER" | "ADMIN";
}

const emptyForm: CreateUserForm = {
  name: "",
  email: "",
  password: "",
  businessName: "",
  role: "USER",
};

const ROLE_COLORS: Record<string, string> = {
  USER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<CreateUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminService.getAllUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setErrorMsg(res.error || "Gagal memuat daftar pengguna");
    }
    setLoading(false);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.businessName || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
    setErrorMsg("");
  };

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      businessName: u.businessName || "",
      role: u.role,
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const openDelete = (u: UserProfile) => {
    setDeletingUser(u);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setErrorMsg("Nama dan email wajib diisi");
      return;
    }
    if (!editingUser && !form.password) {
      setErrorMsg("Password wajib diisi untuk pengguna baru");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      if (editingUser) {
        const payload: Record<string, string> = {
          name: form.name,
          email: form.email,
          businessName: form.businessName,
          role: form.role,
        };
        if (form.password) payload.password = form.password;

        const res = await adminService.updateUser(editingUser.id, payload);
        if (res.success) {
          setSuccessMsg("Data pengguna berhasil diperbarui");
          setShowModal(false);
          fetchUsers();
        } else {
          setErrorMsg(res.error || "Gagal memperbarui pengguna");
        }
      } else {
        const res = await adminService.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          businessName: form.businessName || undefined,
          role: form.role,
        });
        if (res.success) {
          setSuccessMsg("Pengguna baru berhasil dibuat");
          setShowModal(false);
          fetchUsers();
        } else {
          setErrorMsg(res.error || "Gagal membuat pengguna baru");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    const res = await adminService.deleteUser(deletingUser.id);
    if (res.success) {
      setSuccessMsg(`Akun "${deletingUser.name}" berhasil dihapus`);
      setShowDeleteModal(false);
      fetchUsers();
    } else {
      setErrorMsg(res.error || "Gagal menghapus pengguna");
      setShowDeleteModal(false);
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1 text-sm">CRUD Akun Pengguna — Terhubung ke Database</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-xs text-emerald-700 underline">Tutup</button>
        </div>
      )}
      {errorMsg && !showModal && !showDeleteModal && (
        <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-xs text-rose-700 underline">Tutup</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 my-6">
        {[
          { label: "Total Pengguna", value: users.length, color: "text-blue-600" },
          { label: "Admin", value: users.filter((u) => u.role === "ADMIN").length, color: "text-purple-600" },
          { label: "User", value: users.filter((u) => u.role === "USER").length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama / email / toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} pengguna</span>
          <button
            onClick={fetchUsers}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span className="text-gray-500 text-sm">Memuat data pengguna...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Nama Usaha</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Bergabung</th>
                  <th className="px-4 py-3 font-medium">Transaksi</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Tidak ada data pengguna.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const initials = (u.name || "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {u.businessName ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              {u.businessName}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 font-mono text-sm">
                          {(u as any)._count?.transactions ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(u)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                              title="Hapus"
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
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg">{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? "(kosongkan jika tidak diubah)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingUser ? "Kosongkan jika tidak berubah" : "Min. 6 karakter"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis / Toko</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama toko (opsional)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as "USER" | "ADMIN" })}
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingUser ? "Simpan Perubahan" : "Tambah User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-center mb-2">Hapus Pengguna?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Akun <span className="font-semibold text-gray-700">{deletingUser.name}</span> ({deletingUser.email}) beserta seluruh
              data transaksi, produk, dan promo terkait akan dihapus secara permanen.
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
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Hapus Selamanya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
