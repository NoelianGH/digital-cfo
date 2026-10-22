"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2, Sparkles, Building2, User, Mail, Lock } from "lucide-react";
import { authService } from "@/services/authService";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");

    // If already logged in, redirect
    const user = authService.getStoredUser();
    const token = authService.getStoredToken();
    if (user && token) {
      if (user.role === "ADMIN") router.push("/admin");
      else router.push("/user");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await authService.login(email, password);
        if (res.success && res.user) {
          setSuccessMsg("Login berhasil! Mengalihkan ke dashboard...");
          setTimeout(() => {
            if (res.user?.role === "ADMIN") router.push("/admin");
            else router.push("/user");
          }, 800);
        } else {
          setError(res.error || "Email atau password salah.");
        }
      } else {
        if (!name || !businessName || !email || !password) {
          setError("Semua kolom registrasi wajib diisi.");
          setLoading(false);
          return;
        }

        const res = await authService.register(name, email, password, businessName);
        if (res.success && res.user) {
          setSuccessMsg("Registrasi berhasil! Mengalihkan ke dashboard...");
          setTimeout(() => {
            if (res.user?.role === "ADMIN") router.push("/admin");
            else router.push("/user");
          }, 800);
        } else {
          setError(res.error || "Registrasi gagal. Silakan coba lagi.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat menghubungi backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: "user" | "admin") => {
    if (type === "user") {
      setEmail("user@digitalcfo.id");
      setPassword("user123");
    } else {
      setEmail("admin@digitalcfo.id");
      setPassword("admin123");
    }
    setActiveTab("login");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-4 text-center font-bold text-base transition-colors ${
              activeTab === "login"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-4 text-center font-bold text-base transition-colors ${
              activeTab === "register"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Digital CFO UMKM
            </div>
            <h2 className="text-2xl font-bold text-blue-950">
              {activeTab === "login" ? "Selamat Datang Kembali!" : "Mulai Pembukuan Modern"}
            </h2>
            <p className="text-gray-500 mt-1.5 text-xs">
              {activeTab === "login"
                ? "Masuk untuk mengelola keuangan, pembukuan kas, dan analisis AI."
                : "Daftar gratis untuk mencatat transaksi dan memantau kesehatan bisnis."}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Usaha / Toko
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="Kedai Kopi Kenangan"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="budi@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : activeTab === "login" ? (
                "Masuk Sekarang"
              ) : (
                "Buat Akun Baru"
              )}
            </button>
          </form>

          {/* Quick Demo Fill & Navigation */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2 font-medium">Uji Coba Cepat (Akun Demo):</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleFillDemo("user")}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
              >
                Isi Demo User
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium transition-colors"
              >
                Isi Demo Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setName("Kopi Mantap UMKM");
                  setBusinessName("Kopi Mantap");
                  setEmail(`user${Math.floor(Math.random() * 9000 + 1000)}@digitalcfo.id`);
                  setPassword("password123");
                  setActiveTab("register");
                }}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
              >
                Generate Akun Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm">Memuat Autentikasi...</span>
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}

