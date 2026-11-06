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
  X,
  ShoppingBag,
  Receipt,
  Copy,
  Check,
  History,
  Store as StoreIcon
} from "lucide-react";
import { transactionService, TransactionItem, SaleDetail } from "@/services/transactionService";
import StoreSelectorGate from "@/components/StoreSelectorGate";

interface TransactionDisplay {
  id: string;
  date: string;
  type: "Pemasukan" | "Pengeluaran";
  desc: string;
  amount: number;
  source: "POS" | "Manual" | "OCR" | "Voice" | "PDF";
  paymentMethod?: string;
  category?: string;
  sale?: SaleDetail | null;
}

const initialTransactions: TransactionDisplay[] = [];

export default function RiwayatTransaksiPage() {
  return (
    <StoreSelectorGate
      pageTitle="Riwayat Transaksi"
      pageSubtitle="Pantau seluruh arus kas, mutasi rekening, dan struk belanja per cabang"
      pageIcon={History}
      pageKey="riwayat"
    >
      {(activeStore) => <RiwayatContent activeStore={activeStore} />}
    </StoreSelectorGate>
  );
}

function RiwayatContent({ activeStore }: { activeStore: any }) {
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Semua" | "Pemasukan" | "Pengeluaran">("Semua");
  const [filterSource, setFilterSource] = useState<"Semua" | "POS" | "Manual" | "OCR" | "Voice" | "PDF">("Semua");
  const [selectedTx, setSelectedTx] = useState<TransactionDisplay | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [activeStore.id, activeStore.isAll]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const storeParam = activeStore.isAll ? undefined : activeStore.id;
      const res = await transactionService.getTransactions(storeParam);
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
            sale: t.sale || null,
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
    const term = searchTerm.toLowerCase();
    const matchSearch =
      t.desc.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term) ||
      (t.sale?.receiptCode && t.sale.receiptCode.toLowerCase().includes(term)) ||
      (t.sale?.items && t.sale.items.some((it) => it.productName.toLowerCase().includes(term)));
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

  const handleCopyReceipt = (tx: TransactionDisplay) => {
    if (!tx.sale) return;
    const itemList = (tx.sale.items || [])
      .map((it) => `• ${it.qty}x ${it.productName} @ Rp ${it.priceAtSale.toLocaleString("id-ID")} = Rp ${it.subtotal.toLocaleString("id-ID")}`)
      .join("\n");
    const receiptText = `=== STRUK PENJUALAN ===\nNo. Struk : #${tx.sale.receiptCode}\nTanggal   : ${tx.date}\nMetode    : ${tx.paymentMethod || "TUNAI"}\n\nDAFTAR BARANG:\n${itemList}\n\nTOTAL     : Rp ${Math.abs(tx.amount).toLocaleString("id-ID")}\n========================`;
    navigator.clipboard.writeText(receiptText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor");
      return;
    }

    const headers = [
      "ID Transaksi",
      "Tanggal",
      "Keterangan",
      "Detail Barang / Struk",
      "Kategori",
      "Jenis",
      "Nominal (Rp)",
      "Sumber",
      "Metode Pembayaran",
    ];
    const rows = filteredTransactions.map((t) => {
      const itemsDetail = t.sale?.items
        ? t.sale.items.map((it) => `${it.qty}x ${it.productName} (Rp ${it.subtotal.toLocaleString("id-ID")})`).join("; ")
        : "-";
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.desc.replace(/"/g, '""')}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        `"${t.category || ""}"`,
        `"${t.type}"`,
        t.amount,
        `"${t.source}"`,
        `"${t.paymentMethod || ""}"`,
      ];
    });

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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Riwayat Transaksi {activeStore.isAll ? "(Semua Cabang)" : `— ${activeStore.name}`}
              </h1>
              <p className="text-gray-500 text-sm">
                Arsip transaksi keluar & masuk dari sistem POS kasir, input manual, OCR, dan berkas PDF untuk toko ini.
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
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] rounded-b-xl border-t border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200/80 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Kode</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail Barang</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
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
                      <td className="px-5 py-4 text-xs">
                        {tx.sale && tx.sale.items && tx.sale.items.length > 0 ? (
                          <div className="space-y-1.5 max-w-[280px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <ShoppingBag className="w-3 h-3 text-blue-600" />
                                {tx.sale.items.reduce((s, it) => s + it.qty, 0)} item ({tx.sale.items.length} produk)
                              </span>
                              {tx.sale.receiptCode && (
                                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                  #{tx.sale.receiptCode}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-600 space-y-0.5 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100">
                              {tx.sale.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="truncate text-gray-800">
                                    <span className="font-semibold text-blue-700 mr-1">{item.qty}x</span>
                                    {item.productName}
                                  </span>
                                  <span className="text-gray-400 text-[10px] whitespace-nowrap">
                                    Rp {item.subtotal.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ))}
                              {tx.sale.items.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTx(tx)}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 pt-0.5"
                                >
                                  +{tx.sale.items.length - 2} produk lainnya (lihat semua)
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                            Kas langsung
                          </span>
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
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Detail Transaksi</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 text-[11px] block">ID Transaksi:</span>
                  <span className="font-mono font-bold text-gray-900 text-xs break-all">{selectedTx.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Tanggal & Jam:</span>
                  <span className="text-gray-900 text-xs font-medium">{selectedTx.date}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Jenis Kas:</span>
                  <span className={`text-xs font-bold ${selectedTx.type === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
                    {selectedTx.type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Sumber Input:</span>
                  <span className="text-gray-900 text-xs font-medium">{selectedTx.source}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Kategori:</span>
                  <span className="text-gray-900 text-xs font-medium">{selectedTx.category || "Umum"}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Metode Pembayaran:</span>
                  <span className="text-gray-900 text-xs font-medium">{selectedTx.paymentMethod || "TUNAI"}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-xs block mb-1 font-medium">Keterangan:</span>
                <p className="text-xs bg-gray-50 p-2.5 rounded-lg text-gray-800 border border-gray-100">{selectedTx.desc}</p>
              </div>

              {/* Rincian Struk & Daftar Barang (Jika dari Kasir POS) */}
              {selectedTx.sale && selectedTx.sale.items && selectedTx.sale.items.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                        Daftar Barang Terjual ({selectedTx.sale.receiptCode ? `#${selectedTx.sale.receiptCode}` : "Struk"})
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {selectedTx.sale.items.reduce((s, it) => s + it.qty, 0)} Total Item
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px]">
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold">Nama Produk</th>
                          <th className="px-2.5 py-2.5 font-semibold text-center">Qty</th>
                          <th className="px-2.5 py-2.5 font-semibold text-right">Harga</th>
                          <th className="px-3.5 py-2.5 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedTx.sale.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-3.5 py-2.5 font-medium text-gray-800">
                              <div>{item.productName}</div>
                              {item.productCategory && (
                                <span className="inline-block text-[10px] text-gray-400 font-normal">
                                  {item.productCategory}
                                </span>
                              )}
                            </td>
                            <td className="px-2.5 py-2.5 text-center font-bold text-blue-700">
                              {item.qty}x
                            </td>
                            <td className="px-2.5 py-2.5 text-right text-gray-500 whitespace-nowrap">
                              Rp {item.priceAtSale.toLocaleString("id-ID")}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                              Rp {item.subtotal.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50/80 border-t border-gray-200 text-gray-700">
                        <tr>
                          <td colSpan={3} className="px-3.5 py-2.5 text-right font-medium text-xs">
                            Total Struk Belanja:
                          </td>
                          <td className="px-3.5 py-2.5 text-right text-blue-600 font-black text-xs whitespace-nowrap">
                            Rp {selectedTx.sale.items.reduce((s, it) => s + it.subtotal, 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyReceipt(selectedTx)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedReceipt ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700 font-semibold">Rincian Struk Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Salin Rincian Struk & Daftar Barang</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-gray-100 items-center">
                <span className="font-bold text-gray-800 text-xs">Total Nominal Kas:</span>
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

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
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
