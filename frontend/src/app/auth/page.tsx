"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CONTOH BACKEND LOGIC (DI COMMENT)
    /*
    try {
      if (activeTab === 'login') {
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(data.success) {
          if(data.role === 'admin') router.push('/admin');
          else router.push('/user');
        } else {
          setError(data.message || "Mohon register terlebih dahulu jika Anda tidak memiliki akun.");
        }
      } else {
        const res = await fetch('/api/register', { ... });
        // handle register
      }
    } catch (err) {
       setError("Terjadi kesalahan sistem.");
    }
    */

    // MOCK LOGIN UNTUK SEKARANG:
    // Anggap berhasil, langsung arahkan ke dashboard user
    if (activeTab === "login") {
      router.push("/user");
    } else {
      setActiveTab("login");
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

      {/* Floating Menu Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => {setActiveTab("login"); setError("");}}
            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === 'login' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
          >
            Login
          </button>
          <button 
            onClick={() => {setActiveTab("register"); setError("");}}
            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === 'register' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900">
              {activeTab === 'login' ? 'Selamat Datang Kembali!' : 'Mulai Perjalanan Anda'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {activeTab === 'login' ? 'Silakan masuk ke akun Anda.' : 'Buat akun untuk mencatat keuangan bisnis.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {activeTab === 'login' && (
             // Warning default jika mau dicoba testing error
             <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium text-center border border-blue-100">
                Catatan: Jika Anda tidak memiliki akun, mohon register terlebih dahulu.
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Budi Santoso"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="budi@contoh.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
            >
              {activeTab === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}
            </button>
          </form>

          {/* Dummy links for easy access to /admin and /user */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-3">Dev Shortcuts:</p>
            <div className="flex justify-center gap-4">
              <a href="/admin" className="text-sm text-blue-600 hover:underline">/admin</a>
              <a href="/user" className="text-sm text-blue-600 hover:underline">/user</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
