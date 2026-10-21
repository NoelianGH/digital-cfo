"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Globe, Phone, Mail, MapPin } from "lucide-react";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            LaporKas!
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-blue-300 font-medium transition-colors">Beranda</Link>
            
            {/* Resources Dropdown */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-blue-300 font-medium transition-colors py-2">
                Resources <ChevronDown className="w-4 h-4" />
              </div>
              {isResourcesOpen && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-xl py-2 text-gray-800 border border-gray-100">
                  <Link href="/resources/templates" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">Template Kas</Link>
                  <Link href="/resources/guides" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">Panduan Aplikasi</Link>
                </div>
              )}
            </div>

            <Link href="/about" className="hover:text-blue-300 font-medium transition-colors">Tentang Kami</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-blue-300 transition-colors text-sm font-medium">
              <Globe className="w-4 h-4" /> ID
            </button>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <Link href="/auth" className="hover:text-blue-300 font-medium transition-colors">Login</Link>
            <Link href="/auth?tab=register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors">Register</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Rich Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">LaporKas!</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Platform modern pencatatan kas dan keuangan khusus untuk memajukan UMKM Indonesia menjadi lebih profesional dan transparan.
            </p>
            <div className="flex gap-4 text-sm font-medium">
              <a href="#" className="hover:text-blue-400 transition-colors">Facebook</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
              <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Beranda Utama</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">Tentang LaporKas</Link></li>
              <li><Link href="/resources/guides" className="hover:text-blue-400 transition-colors">Pusat Bantuan & Panduan</Link></li>
              <li><Link href="/auth" className="hover:text-blue-400 transition-colors">Login Aplikasi</Link></li>
              <li><Link href="/auth?tab=register" className="hover:text-blue-400 transition-colors">Daftar Akun Baru</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Layanan & Hukum</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Syarat dan Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Kebijakan Privasi (Privacy Policy)</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Keamanan Data (Data Security)</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Lisensi Open Source</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Gedung Teknologi Nusantara Lt. 12<br/>Jl. Jend. Sudirman No. 45, Jakarta Selatan 12190</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>+62 811-1234-5678 (CS WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>(021) 555-0198 (Office)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:halo@laporkas.id" className="hover:text-blue-400 transition-colors">halo@laporkas.id</a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PT Solusi Kas Nusantara (LaporKas!). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
