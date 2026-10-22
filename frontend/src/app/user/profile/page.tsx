"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Save, 
  Trash2, 
  KeyRound,
  FileSpreadsheet,
  Package,
  Sparkles,
  Pencil,
  X,
  Store,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { authService, UserProfile } from "@/services/authService";

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete Account Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Global alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    const res = await authService.getProfile();
    if (res.success && res.data) {
      setProfile(res.data);
      setEditName(res.data.name || "");
      setEditEmail(res.data.email || "");
    } else {
      const stored = authService.getStoredUser();
      if (stored) {
        setProfile(stored);
        setEditName(stored.name || "");
        setEditEmail(stored.email || "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditProfile = () => {
    setEditName(profile?.name || "");
    setEditEmail(profile?.email || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setErrorMsg("Nama lengkap dan email tidak boleh kosong.");
      return;
    }

    setSavingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await authService.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMsg("Profil pengguna berhasil diperbarui!");
        setShowEditModal(false);
      } else {
        setErrorMsg(res.error || "Gagal memperbarui profil.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTriggerPasswordConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    // Tampilkan pop-up konfirmasi sebelum mengirim ke database
    setShowPasswordConfirmModal(true);
  };

  const handleConfirmUpdatePassword = async () => {
    setSavingPassword(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await authService.updateProfile({
        newPassword,
      });

      if (res.success) {
        setSuccessMsg("Kata sandi berhasil diperbarui!");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordConfirmModal(false);
        setShowPasswordModal(false);
      } else {
        setErrorMsg(res.error || "Gagal mengubah kata sandi.");
        setShowPasswordConfirmModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat mengubah kata sandi.");
      setShowPasswordConfirmModal(false);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setErrorMsg("");

    try {
      const res = await authService.deleteProfile(deleteConfirmPassword);
      if (res.success) {
        alert("Akun berhasil dihapus.");
        authService.logout();
      } else {
        setErrorMsg(res.error || "Gagal menghapus akun.");
        setDeletingAccount(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat menghapus akun.");
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Memuat data profil akun...</p>
      </div>
    );
  }

  const initials = (profile?.name || "User")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profil &amp; Akun Pengguna</h1>
        <p className="text-gray-500 text-sm">
          Kelola informasi identitas pribadi, keamanan kata sandi, dan status akun Anda.
        </p>
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

      {/* Profile Overview Card (Read-Only) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-900/50 border border-white/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{profile?.name || "Pengguna UMKM"}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {profile?.role || "USER"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                {profile?.email}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Link
                  href="/user/stores"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors border border-white/10"
                >
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kelola Toko &amp; Unit Bisnis</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-white/10 text-xs text-slate-300 gap-1">
            <span className="text-slate-400">Bergabung Sejak:</span>
            <span className="font-semibold text-white">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Oktober 2026"}
            </span>
            <div className="flex items-center gap-1 text-emerald-400 mt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Akun Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Quick Profile Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400">Total Transaksi</p>
            <p className="text-lg font-bold text-white mt-0.5">{profile?._count?.transactions ?? 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400">Katalog Produk</p>
            <p className="text-lg font-bold text-white mt-0.5">{profile?._count?.products ?? 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400">Promo Aktif</p>
            <p className="text-lg font-bold text-white mt-0.5">{profile?._count?.promos ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Read-Only Profile Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Informasi Data Diri</h3>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Read-Only
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nama Lengkap Pemilik
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900">
                  {profile?.name || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Alamat Email Terdaftar
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 flex items-center justify-between">
                  <span>{profile?.email || "-"}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Terverifikasi
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Role Akses Akun
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {profile?.role || "USER"}
                  </span>
                  <span className="text-xs text-gray-500">• Pengguna Panel Operasional UMKM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={openEditProfile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              <span>Ubah Profil</span>
            </button>
          </div>
        </div>

        {/* Card 2: Security & Change Password (Simplified) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-base">Keamanan &amp; Kata Sandi</h3>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Terenkripsi
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Status Kata Sandi</h4>
                    <p className="text-xs text-gray-500">Dilindungi dengan enkripsi satu arah bcrypt</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Untuk menjaga keamanan akun bisnis Anda, ubah kata sandi secara berkala dengan kombinasi huruf, angka, dan simbol.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-800 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Fitur Pembaruan Cepat
                </p>
                <p className="text-blue-700/90 leading-relaxed">
                  Tidak memerlukan kata sandi lama. Cukup masukkan kata sandi baru dan konfirmasi lewat jendela pop-up.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setErrorMsg("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPasswordModal(true);
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ubah Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-rose-900 text-base flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              Hapus Akun Pengguna (CRUD Delete)
            </h4>
            <p className="text-rose-700/80 text-xs mt-1">
              Tindakan ini akan menghapus akun Anda beserta seluruh riwayat pembukuan kas, produk, dan analisis AI secara permanen.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
          >
            Hapus Akun Ini
          </button>
        </div>
      </div>

      {/* Modal 1: Ubah Data Diri (Profil) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Ubah Data Diri</h3>
                  <p className="text-xs text-gray-500">Perbarui nama dan email akun Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Pemilik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="alamat@email.com"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingProfile}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !editName.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Form Input Kata Sandi Baru */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Ubah Kata Sandi</h3>
                  <p className="text-xs text-gray-500">Masukkan kata sandi baru untuk akun Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTriggerPasswordConfirmation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Simpan Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Konfirmasi Pop-up Sebelum Update Kata Sandi ke Database */}
      {showPasswordConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Konfirmasi Perubahan</h3>
            <p className="text-gray-500 text-xs mb-6">
              Apakah Anda yakin ingin memperbarui kata sandi akun Anda sekarang? Pastikan Anda mengingat kata sandi baru tersebut.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordConfirmModal(false)}
                disabled={savingPassword}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdatePassword}
                disabled={savingPassword}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Ya, Perbarui</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Konfirmasi Hapus Akun */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Konfirmasi Hapus Akun</h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Apakah Anda yakin ingin menghapus akun <strong>{profile?.email}</strong>? Seluruh data tidak dapat dipulihkan kembali.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Masukkan Kata Sandi untuk Konfirmasi:
              </label>
              <input
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Kata sandi akun Anda"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
