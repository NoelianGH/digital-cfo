"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar, Eye, CheckCircle2, ChevronRight } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "Pemasukan" | "Pengeluaran";
  desc: string;
  amount: number;
  source: "POS" | "Manual";
  paymentMethod?: string;
  cashier?: string;
}

const initialTransactions: Transaction[] = [
  { id: "TRX-20260925-0001", date: "25 Sep 2026, 10:15", type: "Pemasukan", desc: "Penjualan 2x Kopi Susu Gula Aren, 1x Roti Bakar Coklat", amount: 51000, source: "POS", paymentMethod: "QRIS", cashier: "Budi" },
  { id: "TRX-20260925-0002", date: "25 Sep 2026, 11:30", type: "Pemasukan", desc: "Penjualan 1x Matcha Latte", amount: 22000, source: "POS", paymentMethod: "Tunai", cashier: "Budi" },
  { id: "TRX-20260925-0003", date: "25 Sep 2026, 13:00", type: "Pengeluaran", desc: "Beli bahan baku susu murni 5L", amount: -75000, source: "Manual", paymentMethod: "Transfer Bank", cashier: "Owner" },
  { id: "TRX-20260924-0004", date: "24 Sep 2026, 09:00", type: "Pemasukan", desc: "Penjualan 5x Croissant Almond", amount: 125000, source: "POS", paymentMethod: "QRIS", cashier: "Siti" },
  { id: "TRX-20260924-0005", date: "24 Sep 2026, 16:45", type: "Pengeluaran", desc: "Bayar listrik toko bulanan September", amount: -350000, source: "Manual", paymentMethod: "Transfer Bank", cashier: "Owner" },
  { id: "TRX-20260924-0006", date: "24 Sep 2026, 18:20", type: "Pemasukan", desc: "Penjualan 3x Kopi Susu Gula Aren", amount: 54000, source: "POS", paymentMethod: "Tunai", cashier: "Siti" },
  { id: "TRX-20260923-0007", date: "23 Sep 2026, 14:10", type: "Pengeluaran", desc: "Beli cup take-away & sedotan 200pcs", amount: -120000, source: "Manual", paymentMethod: "Tunai", cashier: "Owner" },
];

export default function RiwayatTransaksiPage() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Semua" | "Pemasukan" | "Pengeluaran">("Semua");
  const [filterSource, setFilterSource] = useState<"Semua" | "POS" | "Manual">("Semua");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "Semua" ? true : t.type === filterType;
    const matchSource = filterSource === "Semua" ? true : t.source === filterSource;
    return matchSearch && matchType && matchSource;
  });

  const totalPemasukan = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-sm">
            Arsip lengkap seluruh transaksi keluar & masuk dari sistem POS kasir dan pencatatan manual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("Mengunduh laporan riwayat transaksi...")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Ekspor Data</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pemasukan</p>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-green-600">Rp {totalPemasukan.toLocaleString("id-ID")}</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Dari {transactions.filter(t => t.amount > 0).length} transaksi penjualan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pengeluaran</p>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-red-600">Rp {totalPengeluaran.toLocaleString("id-ID")}</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Dari {transactions.filter(t => t.amount < 0).length} pos belanja</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Catatan</p>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{transactions.length} Transaksi</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Data tersinkronisasi otomatis</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ID transaksi atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType("Semua")}
              className={`px-3 py-1.5 rounded-md transition-all ${filterType === "Semua" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType("Pemasukan")}
              className={`px-3 py-1.5 rounded-md transition-all ${filterType === "Pemasukan" ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:text-green-700"}`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setFilterType("Pengeluaran")}
              className={`px-3 py-1.5 rounded-md transition-all ${filterType === "Pengeluaran" ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:text-red-700"}`}
            >
              Pengeluaran
            </button>
          </div>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Sumber</option>
            <option value="POS">Sumber: POS Kasir</option>
            <option value="Manual">Sumber: Manual</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200/80">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Tidak ada riwayat transaksi yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono font-medium text-gray-600">
                      {t.id}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {t.desc}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-medium ${
                        t.source === "POS" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {t.source === "POS" ? "POS Kasir" : "Manual"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {t.paymentMethod || "Tunai"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${
                      t.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {t.amount >= 0 ? "+" : "-"}Rp {Math.abs(t.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTx(t)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Detail Transaksi</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedTx.id}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                selectedTx.amount >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {selectedTx.type}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Nominal</span>
                <p className={`text-2xl font-bold mt-1 ${selectedTx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {selectedTx.amount >= 0 ? "+" : "-"}Rp {Math.abs(selectedTx.amount).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Waktu Transaksi</span>
                  <span className="font-medium text-gray-800">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Keterangan</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px]">{selectedTx.desc}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Sumber Catatan</span>
                  <span className="font-medium text-gray-800">{selectedTx.source === "POS" ? "Sistem Kasir (POS)" : "Input Manual"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Metode Pembayaran</span>
                  <span className="font-medium text-gray-800">{selectedTx.paymentMethod || "Tunai"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Petugas / Operator</span>
                  <span className="font-medium text-gray-800">{selectedTx.cashier || "Admin"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
