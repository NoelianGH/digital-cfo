"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  RefreshCw,
  Wallet,
  X
} from "lucide-react";
import { transactionService, TransactionItem } from "@/services/transactionService";

interface TransactionDisplay {
  id: string;
  date: string;
  type: "Pemasukan" | "Pengeluaran";
  desc: string;
  amount: number;
  source: "POS" | "Manual" | "OCR" | "Voice" | "PDF";
  paymentMethod?: string;
  category?: string;
}

const initialTransactions: TransactionDisplay[] = [];

export default function RiwayatTransaksiPage() {
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Semua" | "Pemasukan" | "Pengeluaran">("Semua");
  const [filterSource, setFilterSource] = useState<"Semua" | "POS" | "Manual" | "OCR" | "Voice" | "PDF">("Semua");
  const [selectedTx, setSelectedTx] = useState<TransactionDisplay | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions();
      if (res.success && res.data && res.data.length > 0) {
        const mapped: TransactionDisplay[] = res.data.map((t) => {
          const isIncome = t.type === "MASUK" || t.type === "MODAL";
          const rawDate = t.date ? new Date(t.date) : new Date();
          const dateStr = rawDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          let src: TransactionDisplay["source"] = "Manual";
          const rawSource = String(t.source || "").toUpperCase();
          if (rawSource === "POS") src = "POS";
          else if (rawSource === "OCR") src = "OCR";
          else if (rawSource === "VOICE") src = "Voice";
          else if (rawSource === "PDF") src = "PDF";


          return {
            id: t.id,
            date: dateStr,
            type: isIncome ? "Pemasukan" : "Pengeluaran",
            desc: t.description,
            amount: isIncome ? t.amount : -t.amount,
            source: src,
            paymentMethod: t.paymentMethod || "TUNAI",
            category: t.category,
          };
        });
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions(initialTransactions);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor");
      return;
    }

    const headers = ["ID Transaksi", "Tanggal", "Keterangan", "Kategori", "Jenis", "Nominal (Rp)", "Sumber", "Metode Pembayaran"];
    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.desc.replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.source}"`,
      `"${t.paymentMethod || ''}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Transaksi_DigitalCFO_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-sm">
            Arsip lengkap seluruh transaksi keluar & masuk dari sistem POS kasir, input manual, OCR, dan berkas PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-colors"
            title="Segarkan data dari database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
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
          <p className="text-xs text-gray-400 mt-2">Dari {transactions.filter((t) => t.amount > 0).length} transaksi masuk</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pengeluaran</p>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-red-600">Rp {totalPengeluaran.toLocaleString("id-ID")}</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Dari {transactions.filter((t) => t.amount < 0).length} pos belanja</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Catatan</p>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{transactions.length} Transaksi</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tersinkronisasi otomatis</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            {(["Semua", "Pemasukan", "Pengeluaran"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === type ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Sumber</option>
            <option value="POS">Kasir POS</option>
            <option value="Manual">Manual</option>
            <option value="OCR">OCR Scan</option>
            <option value="Voice">Suara (Mic)</option>
            <option value="PDF">PDF Import</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Memuat riwayat transaksi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Kode</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                      Tidak ada transaksi yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono font-medium text-blue-600 whitespace-nowrap">
                        {tx.id.length > 20 ? tx.id.slice(0, 14) + "..." : tx.id}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{tx.date}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {tx.desc}
                        {tx.category && (
                          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">{tx.category}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            tx.source === "POS"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : tx.source === "OCR"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : tx.source === "Voice"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tx.source === "PDF"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tx.source}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-bold text-right whitespace-nowrap ${
                          tx.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.amount > 0
                          ? `+Rp ${tx.amount.toLocaleString("id-ID")}`
                          : `-Rp ${Math.abs(tx.amount).toLocaleString("id-ID")}`}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
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
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Detail Transaksi</h3>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">ID / Kode:</span>
                <span className="font-mono font-bold text-gray-900 text-xs">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Tanggal:</span>
                <span className="text-gray-900 text-xs">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Jenis Transaksi:</span>
                <span className={`text-xs font-bold ${selectedTx.type === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
                  {selectedTx.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Sumber Input:</span>
                <span className="text-gray-900 text-xs font-medium">{selectedTx.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Metode Pembayaran:</span>
                <span className="text-gray-900 text-xs font-medium">{selectedTx.paymentMethod || "TUNAI"}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-xs block mb-1">Keterangan:</span>
                <p className="text-xs bg-gray-50 p-2.5 rounded-lg text-gray-800">{selectedTx.desc}</p>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 items-center">
                <span className="font-bold text-gray-800 text-xs">Nominal:</span>
                <span
                  className={`text-lg font-black ${
                    selectedTx.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {selectedTx.amount > 0
                    ? `+Rp ${selectedTx.amount.toLocaleString("id-ID")}`
                    : `-Rp ${Math.abs(selectedTx.amount).toLocaleString("id-ID")}`}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
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
