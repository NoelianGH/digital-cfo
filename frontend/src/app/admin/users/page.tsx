"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Search, User, Mail, Phone, Shield, ChevronDown } from "lucide-react";

type UserRole = "user" | "admin";
type UserStatus = "active" | "inactive" | "suspended";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  storeName?: string;
}

const initialUsers: UserData[] = [
  { id: 1, name: "Budi Santoso", email: "budi@email.com", phone: "081234567890", role: "user", status: "active", joinDate: "2025-01-10", storeName: "Toko Budi" },
  { id: 2, name: "Siti Rahayu", email: "siti@email.com", phone: "089876543210", role: "user", status: "active", joinDate: "2025-02-15", storeName: "Warung Siti" },
  { id: 3, name: "Ahmad Fauzi", email: "ahmad@email.com", phone: "085555444333", role: "user", status: "inactive", joinDate: "2025-03-01" },
  { id: 4, name: "Rina Kusuma", email: "rina@email.com", phone: "087712345678", role: "admin", status: "active", joinDate: "2024-12-01" },
  { id: 5, name: "Doni Wahyu", email: "doni@email.com", phone: "082298765432", role: "user", status: "suspended", joinDate: "2025-04-20", storeName: "Doni Store" },
];

const STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  suspended: "Ditangguhkan",
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

const emptyUser: Omit<UserData, "id"> = {
  name: "",
  email: "",
  phone: "",
  role: "user",
  status: "active",
  joinDate: new Date().toISOString().split("T")[0],
  storeName: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<Omit<UserData, "id">>(emptyUser);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyUser);
    setShowModal(true);
  };

  const openEdit = (u: UserData) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status, joinDate: u.joinDate, storeName: u.storeName ?? "" });
    setShowModal(true);
  };

  const openDelete = (u: UserData) => {
    setDeletingUser(u);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u)));
    } else {
      const newId = Math.max(...users.map((u) => u.id), 0) + 1;
      setUsers((prev) => [...prev, { id: newId, ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setShowDeleteModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">List User</h1>
          <p className="text-gray-500 mt-1">Manajemen pengguna LaporKas!</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 my-6">
        {[
          { label: "Total User", value: users.length, color: "text-blue-600" },
          { label: "Aktif", value: users.filter((u) => u.status === "active").length, color: "text-green-600" },
          { label: "Ditangguhkan", value: users.filter((u) => u.status === "suspended").length, color: "text-red-600" },
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
              placeholder="Cari nama / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} pengguna</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Pengguna</th>
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 font-medium">Toko</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada data pengguna.</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{u.email}</div>
                      <div className="text-gray-400 text-xs">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.storeName || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[u.status]}`}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.joinDate}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg">{editingUser ? "Edit User" : "Tambah User Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={form.storeName ?? ""}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama toko (opsional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="suspended">Ditangguhkan</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
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
                disabled={!form.name || !form.email}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors"
              >
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
              Akun <span className="font-semibold text-gray-700">{deletingUser.name}</span> akan dihapus secara permanen.
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
