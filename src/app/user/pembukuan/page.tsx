"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

// Dummy transaction history (nanti dari database, otomatis terisi saat "Pembayaran Selesai" ditekan)
const dummyTransactions = [
  { id: "TRX-20260925-0001", date: "25 Sep 2026, 10:15", type: "Pemasukan", desc: "Penjualan 2x Kopi Susu Gula Aren, 1x Roti Bakar Coklat", amount: 51000, source: "POS" },
  { id: "TRX-20260925-0002", date: "25 Sep 2026, 11:30", type: "Pemasukan", desc: "Penjualan 1x Matcha Latte", amount: 22000, source: "POS" },
  { id: "TRX-20260925-0003", date: "25 Sep 2026, 13:00", type: "Pengeluaran", desc: "Beli bahan baku susu 5L", amount: -75000, source: "Manual" },
  { id: "TRX-20260924-0004", date: "24 Sep 2026, 09:00", type: "Pemasukan", desc: "Penjualan 5x Croissant Almond", amount: 125000, source: "POS" },
  { id: "TRX-20260924-0005", date: "24 Sep 2026, 16:45", type: "Pengeluaran", desc: "Bayar listrik bulanan", amount: -350000, source: "Manual" },
];

export default function PembukuanPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pembukuan Kas</h1>
          <p className="text-gray-500">Seluruh riwayat arus kas bisnis Anda. Transaksi dari penjualan otomatis tercatat di sini.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Manual</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-sm text-blue-800">
        💡 <strong>Tip:</strong> Transaksi dari menu <em>Penjualan Baru</em> di tab Product akan otomatis muncul di sini setelah pembayaran selesai. Anda juga bisa menambahkan transaksi manual (misal: bayar listrik, sewa, dll).
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID Transaksi</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sumber</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dummyTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{t.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.desc}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.source === 'POS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.source}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-bold text-right ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.amount >= 0 ? '+' : ''}Rp {Math.abs(t.amount).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Tambah Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tambah Transaksi Manual</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Pemasukan</option>
                      <option>Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input type="number" placeholder="Contoh: 150000" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Catatan</label>
                  <textarea placeholder="Contoh: Bayar tagihan listrik bulan September" rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm">Simpan Transaksi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
