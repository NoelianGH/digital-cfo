"use client";

import { useState } from "react";
import { 
  Plus, 
  X, 
  Mic, 
  FileText, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Camera, 
  Upload, 
  FileCheck, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Save, 
  Sparkles,
  HelpCircle,
  Volume2
} from "lucide-react";

export interface CashEntry {
  id: string;
  date: string;
  desc: string;
  category: "Modal" | "Penjualan" | "Bahan Baku" | "Operasional" | "Lainnya";
  inAmount: number;   // Kas Masuk (Debet)
  outAmount: number;  // Kas Keluar (Kredit)
}

const initialCashLedger: CashEntry[] = [
  { id: "BK-001", date: "2026-09-20", desc: "Setoran Modal Awal Usaha", category: "Modal", inAmount: 10000000, outAmount: 0 },
  { id: "BK-002", date: "2026-09-21", desc: "Pembelian Bahan Baku Kopi & Susu", category: "Bahan Baku", inAmount: 0, outAmount: 1200000 },
  { id: "BK-003", date: "2026-09-22", desc: "Penjualan Kasir POS Harian", category: "Penjualan", inAmount: 850000, outAmount: 0 },
  { id: "BK-004", date: "2026-09-23", desc: "Bayar Listrik & Internet Toko", category: "Operasional", inAmount: 0, outAmount: 350000 },
  { id: "BK-005", date: "2026-09-24", desc: "Penjualan Kasir POS Harian", category: "Penjualan", inAmount: 1120000, outAmount: 0 },
  { id: "BK-006", date: "2026-09-25", desc: "Beli Perlengkapan Cup & Sedotan", category: "Bahan Baku", inAmount: 0, outAmount: 195000 },
  { id: "BK-007", date: "2026-09-25", desc: "Penjualan Kasir POS Hari Ini", category: "Penjualan", inAmount: 640000, outAmount: 0 },
];

export default function PembukuanPage() {
  const [entries, setEntries] = useState<CashEntry[]>(initialCashLedger);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrTab, setOcrTab] = useState<"upload" | "camera">("upload");

  // Form states for Add Manual
  const [formType, setFormType] = useState<"Masuk" | "Keluar" | "Modal">("Masuk");
  const [formCategory, setFormCategory] = useState<CashEntry["category"]>("Penjualan");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("2026-09-25");

  // Voice recording mock state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("Beli cup kopi dan sedotan 2 pak total seratus sembilan puluh lima ribu rupiah");
  const [voiceParsedAmount, setVoiceParsedAmount] = useState("195000");
  const [voiceParsedCategory, setVoiceParsedCategory] = useState<CashEntry["category"]>("Bahan Baku");

  // OCR state
  const [ocrDetectedData, setOcrDetectedData] = useState<{
    store: string;
    date: string;
    total: number;
    category: CashEntry["category"];
    desc: string;
  }>({
    store: "TOKO PLASTIK JAYA ABADI",
    date: "2026-09-25",
    total: 215000,
    category: "Bahan Baku",
    desc: "Pembelian Cup Sealer & Kantong Plastik Takeaway",
  });

  // Calculations
  const totalModal = entries
    .filter(e => e.category === "Modal")
    .reduce((acc, curr) => acc + curr.inAmount, 0);

  const totalKasMasuk = entries
    .filter(e => e.category !== "Modal")
    .reduce((acc, curr) => acc + curr.inAmount, 0);

  const totalPengeluaran = entries
    .reduce((acc, curr) => acc + curr.outAmount, 0);

  // Saldo Kas Akhir = (Total Modal + Total Kas Masuk) - Total Pengeluaran
  const saldoKas = (totalModal + totalKasMasuk) - totalPengeluaran;

  // Persamaan buku kas: Modal + Kas Masuk = Pengeluaran + Saldo Kas
  const sisiDebet = totalModal + totalKasMasuk;
  const sisiKreditDanKas = totalPengeluaran + saldoKas;
  const isBalanced = sisiDebet === sisiKreditDanKas;

  // Compute running balance for each row
  let currentRunningBalance = 0;
  const rowsWithBalance = entries.map((entry) => {
    currentRunningBalance += (entry.inAmount - entry.outAmount);
    return {
      ...entry,
      balance: currentRunningBalance,
    };
  });

  // Handlers
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount) || 0;
    if (!formDesc || amount <= 0) {
      alert("Mohon lengkapi keterangan dan nominal yang valid.");
      return;
    }

    const newEntry: CashEntry = {
      id: `BK-${String(entries.length + 1).padStart(3, "0")}`,
      date: formDate,
      desc: formDesc,
      category: formType === "Modal" ? "Modal" : formCategory,
      inAmount: formType === "Masuk" || formType === "Modal" ? amount : 0,
      outAmount: formType === "Keluar" ? amount : 0,
    };

    setEntries([...entries, newEntry]);
    setIsAddModalOpen(false);
    setFormDesc("");
    setFormAmount("");
  };

  const handleConfirmVoice = () => {
    const amount = parseFloat(voiceParsedAmount) || 0;
    if (amount <= 0) return;

    const newEntry: CashEntry = {
      id: `BK-${String(entries.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      desc: voiceTranscript,
      category: voiceParsedCategory,
      inAmount: 0,
      outAmount: amount,
    };

    setEntries([...entries, newEntry]);
    setIsVoiceModalOpen(false);
  };

  const handleConfirmOcr = () => {
    const newEntry: CashEntry = {
      id: `BK-${String(entries.length + 1).padStart(3, "0")}`,
      date: ocrDetectedData.date,
      desc: `${ocrDetectedData.desc} (${ocrDetectedData.store})`,
      category: ocrDetectedData.category,
      inAmount: 0,
      outAmount: ocrDetectedData.total,
    };

    setEntries([...entries, newEntry]);
    setIsOcrModalOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Hapus baris pembukuan ini?")) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleSaveEditRow = (updated: CashEntry) => {
    setEntries(entries.map(e => e.id === updated.id ? updated : e));
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pembukuan Kas</h1>
          <p className="text-gray-500 text-sm">
            Buku Kas Umum (BKU) dengan persamaan modal, penerimaan, dan pengeluaran kas.
          </p>
        </div>

        {/* Buttons Group: [Edit Mode] [Konfirmasi if edit mode] [Mic] [File OCR] [Tambah Manual] */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Edit */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm border ${
              isEditMode 
                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 ring-2 ring-amber-300" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Aktifkan mode edit tabel pembukuan"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? "Mode Edit Aktif" : "Edit"}</span>
          </button>

          {/* Tombol Konfirmasi (Hanya muncul jika mode edit ditekan) */}
          {isEditMode && (
            <button
              onClick={() => {
                setIsEditMode(false);
                alert("Perubahan pembukuan kas berhasil disimpan!");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm animate-in fade-in"
              title="Konfirmasi & simpan seluruh perubahan"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Konfirmasi</span>
            </button>
          )}

          {/* Tombol Mikrofon (Speech to text) di samping tombol tambah */}
          <button
            onClick={() => {
              setIsVoiceModalOpen(true);
              setIsRecording(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Catat transaksi cepat dengan suara (Voice to Text)"
          >
            <Mic className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Suara</span>
          </button>

          {/* Tombol File (OCR Scan) di samping tombol tambah */}
          <button
            onClick={() => setIsOcrModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Scan struk/nota otomatis via file PDF atau kamera langsung"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Scan Nota</span>
          </button>

          {/* Tombol Tambah Manual */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Persamaan Dasar Buku Kas & Ringkasan Keuangan (Modal + Kas Masuk = Pengeluaran + Sisa Kas) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">Persamaan Buku Kas Umum</h2>
              <p className="text-xs text-slate-400">Prinsip Keseimbangan: (Modal Awal + Kas Masuk) = (Pengeluaran + Saldo Kas)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isBalanced ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {isBalanced ? "Pembukuan Balance (Seimbang)" : "Belum Seimbang"}
            </span>
          </div>
        </div>

        {/* 4 Cards Formula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Modal */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(1) Modal Usaha</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400">Rp {totalModal.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Modal awal & disetor</p>
          </div>

          {/* Card 2: Kas Masuk */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(2) Kas Masuk</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">+Rp {totalKasMasuk.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Penjualan & pendapatan</p>
          </div>

          {/* Card 3: Pengeluaran */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(3) Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold text-rose-400">-Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Biaya & bahan baku</p>
          </div>

          {/* Card 4: Saldo Kas */}
          <div className="bg-blue-950/70 p-4 rounded-xl border border-blue-700/60 ring-1 ring-blue-500/30">
            <div className="flex items-center justify-between text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(4) Saldo Kas Akhir</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Kas Riil</span>
            </div>
            <p className="text-xl font-bold text-white">Rp {saldoKas.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-blue-200/80 mt-1">(Modal + Masuk) - Pengeluaran</p>
          </div>
        </div>

        {/* Formula calculation visualization bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Modal ({totalModal.toLocaleString("id-ID")})</span>
            <span>+</span>
            <span className="text-emerald-400 font-bold">Kas Masuk ({totalKasMasuk.toLocaleString("id-ID")})</span>
            <span>=</span>
            <span className="text-rose-400 font-bold">Pengeluaran ({totalPengeluaran.toLocaleString("id-ID")})</span>
            <span>+</span>
            <span className="text-blue-300 font-bold">Saldo Kas ({saldoKas.toLocaleString("id-ID")})</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Sisi Debet: Rp {sisiDebet.toLocaleString("id-ID")} | Sisi Kredit & Kas: Rp {sisiKreditDanKas.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Edit Mode Alert banner if active */}
      {isEditMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Mode Edit Aktif:</strong> Anda dapat mengedit keterangan/nominal langsung atau menghapus baris pembukuan. Tekan tombol <strong>Konfirmasi</strong> di atas jika sudah selesai.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline ml-4"
          >
            Selesai Edit
          </button>
        </div>
      )}

      {/* Buku Kas Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Lembar Buku Kas Umum (BKU)</h3>
            <span className="text-xs text-gray-500 font-normal">({rowsWithBalance.length} catatan pembukuan)</span>
          </div>
          <span className="text-xs text-gray-400 italic">Format Standar Akuntansi Keuangan Kas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan / Transaksi</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Kas Masuk (Debet)</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Kas Keluar (Kredit)</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Saldo Kas</th>
                {/* Kolom Aksi HANYA muncul jika tombol edit ditekan */}
                {isEditMode && (
                  <th className="px-5 py-3.5 text-xs font-semibold text-amber-600 uppercase tracking-wider text-center bg-amber-50/60">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsWithBalance.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {item.desc}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      item.category === "Modal"
                        ? "bg-amber-100 text-amber-800"
                        : item.category === "Penjualan"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.category === "Bahan Baku"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-right text-emerald-600 whitespace-nowrap">
                    {item.inAmount > 0 ? `+Rp ${item.inAmount.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-right text-rose-600 whitespace-nowrap">
                    {item.outAmount > 0 ? `-Rp ${item.outAmount.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-right text-slate-800 whitespace-nowrap">
                    Rp {item.balance.toLocaleString("id-ID")}
                  </td>

                  {/* Tombol Aksi di setiap baris (hanya saat mode edit) */}
                  {isEditMode && (
                    <td className="px-5 py-4 text-center whitespace-nowrap bg-amber-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingEntry(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit baris ini"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(item.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Table Footer with Totals */}
            <tfoot className="bg-gray-50/80 font-semibold border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="px-5 py-3.5 text-xs text-gray-700 uppercase tracking-wider text-right">
                  Total Keseluruhan:
                </td>
                <td className="px-5 py-3.5 text-sm font-bold text-right text-emerald-700">
                  Rp {(totalModal + totalKasMasuk).toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3.5 text-sm font-bold text-right text-rose-700">
                  Rp {totalPengeluaran.toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3.5 text-sm font-bold text-right text-blue-700">
                  Rp {saldoKas.toLocaleString("id-ID")}
                </td>
                {isEditMode && <td className="bg-amber-50/40"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / FLOAT MENU: SPEECH TO TEXT (MIKROFON)             */}
      {/* ========================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Pencatatan Kas via Suara (AI Voice)</h3>
                  <p className="text-xs text-gray-500">Bicara untuk mencatat pengeluaran atau pemasukan otomatis</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Recorder graphic & waveform */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-purple-50/40 to-slate-50 rounded-2xl border border-purple-100/80">
                {/* Voice Animation Circle */}
                <div className="relative flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center ${isRecording ? "animate-ping opacity-30" : ""}`} />
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1.5 mt-6 h-8">
                  {[40, 70, 100, 60, 90, 45, 80, 55, 95, 30, 75, 60].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: isRecording ? `${h}%` : "20%" }}
                      className="w-1.5 bg-purple-500 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>

                <p className="text-sm font-semibold text-purple-900 mt-4 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                  {isRecording ? "Sedang Merekam Suara... Silakan bicara" : "Rekaman Berhenti. Silakan periksa hasil di bawah"}
                </p>
                <span className="text-xs text-gray-400 mt-1">Contoh: &quot;Beli cup kopi 2 pak seratus sembilan puluh lima ribu&quot;</span>
              </div>

              {/* Transcript & AI extracted fields */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hasil Transkrip Suara (Bisa Diedit):
                </label>
                <textarea
                  rows={2}
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Nominal Terdeteksi (Rp):</span>
                    <input
                      type="number"
                      value={voiceParsedAmount}
                      onChange={(e) => setVoiceParsedAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Kategori Akun:</span>
                    <select
                      value={voiceParsedCategory}
                      onChange={(e) => setVoiceParsedCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="Bahan Baku">Bahan Baku</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Penjualan">Penjualan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Confirm Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVoice}
                className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-purple-300"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Konfirmasi & Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / FLOAT MENU: OCR SCAN (FILE & KAMERA DENGAN 2 TAB) */}
      {/* ========================================================= */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">OCR Scanner Pembukuan Kas</h3>
                  <p className="text-xs text-gray-500">Ekstraksi otomatis nota belanja & bukti transfer</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOcrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Tabs: Upload PDF/Gambar vs Kamera Langsung */}
            <div className="px-6 pt-4 border-b border-gray-100">
              <div className="flex items-center gap-4 text-sm font-medium">
                <button
                  onClick={() => setOcrTab("upload")}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                    ocrTab === "upload"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File (PDF / Gambar)</span>
                </button>
                <button
                  onClick={() => setOcrTab("camera")}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                    ocrTab === "camera"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Kamera Langsung (Foto Struk)</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-5">
              {ocrTab === "upload" ? (
                /* Tab 1: Upload File */
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Tarik & Lepas File Nota di sini</h4>
                  <p className="text-xs text-gray-500 mt-1">Mendukung format PDF, JPG, PNG (Maks 10MB)</p>
                  <label className="mt-4 inline-block px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer shadow-sm">
                    Pilih Dokumen PDF / Foto
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={() => alert("File berhasil dipilih untuk dipindai OCR.")} />
                  </label>
                </div>
              ) : (
                /* Tab 2: Live Camera Viewfinder Simulation */
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center text-white border border-slate-700 shadow-inner">
                  {/* Camera overlay corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400" />
                  
                  {/* Laser scan animation line */}
                  <div className="absolute inset-x-8 top-1/3 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

                  <Camera className="w-10 h-10 text-indigo-400/80 mb-2" />
                  <p className="text-xs font-medium text-slate-300">Posisikan struk belanja di dalam kotak bidik</p>
                  <button
                    type="button"
                    onClick={() => alert("Foto struk berhasil diambil! AI sedang membaca data...")}
                    className="mt-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Ambil Foto Struk
                  </button>
                </div>
              )}

              {/* OCR Detection Preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Hasil Ekstraksi OCR Otomatis:
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">Akurasi 98%</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-gray-400 block">Toko / Merchant:</span>
                    <span className="font-semibold text-gray-800">{ocrDetectedData.store}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tanggal Struk:</span>
                    <span className="font-semibold text-gray-800">{ocrDetectedData.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Keterangan:</span>
                    <span className="font-semibold text-gray-800">{ocrDetectedData.desc}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Nominal Terdeteksi:</span>
                    <span className="font-bold text-indigo-700 text-sm">Rp {ocrDetectedData.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Confirm Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOcrModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmOcr}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-300"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Konfirmasi & Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH TRANSAKSI KAS MANUAL                        */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Tambah Catatan Buku Kas</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Jenis Transaksi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormType("Masuk"); setFormCategory("Penjualan"); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      formType === "Masuk"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Kas Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType("Keluar"); setFormCategory("Bahan Baku"); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      formType === "Keluar"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType("Modal"); setFormCategory("Modal"); }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      formType === "Modal"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Setor Modal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori Akun</label>
                  {formType === "Modal" ? (
                    <input
                      type="text"
                      disabled
                      value="Modal Usaha"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                  ) : (
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {formType === "Masuk" ? (
                        <>
                          <option value="Penjualan">Penjualan</option>
                          <option value="Lainnya">Pendapatan Lain</option>
                        </>
                      ) : (
                        <>
                          <option value="Bahan Baku">Bahan Baku</option>
                          <option value="Operasional">Operasional (Listrik/Sewa/Gaji)</option>
                          <option value="Lainnya">Pengeluaran Lainnya</option>
                        </>
                      )}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan / Uraian</label>
                <textarea
                  placeholder="Contoh: Beli susu murni & sirup karamel untuk toko"
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ROW ENTRY                                     */}
      {/* ========================================================= */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-base">Edit Baris Pembukuan ({editingEntry.id})</h3>
              <button onClick={() => setEditingEntry(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editingEntry.desc}
                  onChange={(e) => setEditingEntry({ ...editingEntry, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                <select
                  value={editingEntry.category}
                  onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                >
                  <option value="Modal">Modal</option>
                  <option value="Penjualan">Penjualan</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kas Masuk (Rp)</label>
                  <input
                    type="number"
                    value={editingEntry.inAmount}
                    onChange={(e) => setEditingEntry({ ...editingEntry, inAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-emerald-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kas Keluar (Rp)</label>
                  <input
                    type="number"
                    value={editingEntry.outAmount}
                    onChange={(e) => setEditingEntry({ ...editingEntry, outAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-rose-600 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveEditRow(editingEntry)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Simpan Baris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
