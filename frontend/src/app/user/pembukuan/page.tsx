"use client";

import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Volume2,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  CheckSquare,
  Square
} from "lucide-react";
import { transactionService, TransactionItem } from "@/services/transactionService";
import { speechService, parseFinancialSpeech } from "@/services/speechService";
import { ocrService, OcrResult } from "@/services/ocrService";
import { pdfService, ExtractedPdfTransaction } from "@/services/pdfService";

export interface CashEntry {
  id: string;
  date: string;
  desc: string;
  category: "Modal" | "Penjualan" | "Bahan Baku" | "Operasional" | "Gaji" | "Lainnya";
  inAmount: number;
  outAmount: number;
  source?: string;
  paymentMethod?: string;
}

export default function PembukuanPage() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [ocrTab, setOcrTab] = useState<"upload" | "camera">("upload");

  // Form states for Add Manual
  const [formType, setFormType] = useState<"Masuk" | "Keluar" | "Modal">("Masuk");
  const [formCategory, setFormCategory] = useState<CashEntry["category"]>("Penjualan");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPayment, setFormPayment] = useState("TUNAI");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("Beli cup kopi dan sedotan 2 pak total seratus sembilan puluh lima ribu rupiah");
  const [voiceParsedAmount, setVoiceParsedAmount] = useState("195000");
  const [voiceParsedCategory, setVoiceParsedCategory] = useState<CashEntry["category"]>("Bahan Baku");
  const [voiceParsedType, setVoiceParsedType] = useState<"Masuk" | "Keluar" | "Modal">("Keluar");

  // OCR state
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const [ocrDetectedData, setOcrDetectedData] = useState<OcrResult>({
    store: "TOKO PLASTIK JAYA ABADI",
    date: new Date().toISOString().split("T")[0],
    total: 215000,
    category: "Bahan Baku",
    desc: "Pembelian Cup Sealer & Kantong Plastik Takeaway",
    confidence: 96,
    rawText: "",
  });
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // PDF to Data state
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfTransactions, setPdfTransactions] = useState<ExtractedPdfTransaction[]>([]);
  const [pdfTotals, setPdfTotals] = useState({ debet: 0, kredit: 0 });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setErrorBanner("");
    try {
      const res = await transactionService.getTransactions();
      if (res.success && res.data) {
        // Map backend transactions to CashEntry
        const mapped: CashEntry[] = res.data.map((t) => {
          const dateStr = t.date ? t.date.split("T")[0] : new Date().toISOString().split("T")[0];
          let cat: CashEntry["category"] = "Lainnya";
          if (t.category === "PENJUALAN") cat = "Penjualan";
          else if (t.category === "PEMBELIAN") cat = "Bahan Baku";
          else if (t.category === "OPERASIONAL") cat = "Operasional";
          else if (t.category === "GAJI") cat = "Gaji";
          else if (t.type === "MODAL") cat = "Modal";

          return {
            id: t.id,
            date: dateStr,
            desc: t.description,
            category: cat,
            inAmount: t.type === "MASUK" || t.type === "MODAL" ? t.amount : 0,
            outAmount: t.type === "KELUAR" ? t.amount : 0,
            source: t.source,
            paymentMethod: t.paymentMethod,
          };
        });
        setEntries(mapped);
      } else {
        // Default seed demo if DB is fresh
        setEntries(getSampleFallbackEntries());
      }
    } catch (err: any) {
      console.warn("Using sample entries on network err:", err);
      setEntries(getSampleFallbackEntries());
    } finally {
      setLoading(false);
    }
  };

  function getSampleFallbackEntries(): CashEntry[] {
    return [
      { id: "BK-001", date: "2026-09-20", desc: "Setoran Modal Awal Usaha", category: "Modal", inAmount: 10000000, outAmount: 0 },
      { id: "BK-002", date: "2026-09-21", desc: "Pembelian Bahan Baku Kopi & Susu", category: "Bahan Baku", inAmount: 0, outAmount: 1200000 },
      { id: "BK-003", date: "2026-09-22", desc: "Penjualan Kasir POS Harian", category: "Penjualan", inAmount: 850000, outAmount: 0 },
      { id: "BK-004", date: "2026-09-23", desc: "Bayar Listrik & Internet Toko", category: "Operasional", inAmount: 0, outAmount: 350000 },
      { id: "BK-005", date: "2026-09-24", desc: "Penjualan Kasir POS Harian", category: "Penjualan", inAmount: 1120000, outAmount: 0 },
      { id: "BK-006", date: "2026-09-25", desc: "Beli Perlengkapan Cup & Sedotan", category: "Bahan Baku", inAmount: 0, outAmount: 195000 },
      { id: "BK-007", date: "2026-09-25", desc: "Penjualan Kasir POS Hari Ini", category: "Penjualan", inAmount: 640000, outAmount: 0 },
    ];
  }

  // Calculations
  const totalModal = entries
    .filter((e) => e.category === "Modal")
    .reduce((acc, curr) => acc + curr.inAmount, 0);

  const totalKasMasuk = entries
    .filter((e) => e.category !== "Modal")
    .reduce((acc, curr) => acc + curr.inAmount, 0);

  const totalPengeluaran = entries.reduce((acc, curr) => acc + curr.outAmount, 0);

  // Saldo Kas Akhir = (Total Modal + Total Kas Masuk) - Total Pengeluaran
  const saldoKas = totalModal + totalKasMasuk - totalPengeluaran;
  const sisiDebet = totalModal + totalKasMasuk;
  const sisiKreditDanKas = totalPengeluaran + saldoKas;
  const isBalanced = sisiDebet === sisiKreditDanKas;

  // Running balance calculation
  let currentRunningBalance = 0;
  const rowsWithBalance = entries.map((entry) => {
    currentRunningBalance += entry.inAmount - entry.outAmount;
    return {
      ...entry,
      balance: currentRunningBalance,
    };
  });

  // Handlers
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount) || 0;
    if (!formDesc || amount <= 0) {
      alert("Mohon lengkapi keterangan dan nominal yang valid.");
      return;
    }

    setSubmitting(true);
    const apiType = formType === "Masuk" ? "MASUK" : formType === "Modal" ? "MODAL" : "KELUAR";

    try {
      const res = await transactionService.addTransaction({
        date: formDate,
        description: formDesc,
        amount,
        type: apiType,
        category: formType === "Modal" ? "LAINNYA" : formCategory,
        source: "MANUAL",
        paymentMethod: formPayment,
      });

      if (res.success && res.data) {
        setSuccessBanner("Transaksi manual berhasil disimpan ke database!");
        loadTransactions();
      } else {
        // Fallback local state if offline
        const newEntry: CashEntry = {
          id: `BK-${String(entries.length + 1).padStart(3, "0")}`,
          date: formDate,
          desc: formDesc,
          category: formType === "Modal" ? "Modal" : formCategory,
          inAmount: formType === "Masuk" || formType === "Modal" ? amount : 0,
          outAmount: formType === "Keluar" ? amount : 0,
          paymentMethod: formPayment,
        };
        setEntries([newEntry, ...entries]);
        setSuccessBanner("Catatan berhasil ditambahkan!");
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
      setIsAddModalOpen(false);
      setFormDesc("");
      setFormAmount("");
    }
  };

  // 1. SPEECH TO TEXT HANDLERS
  const toggleRecording = () => {
    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const ok = speechService.start(
        (transcript) => {
          setVoiceTranscript(transcript);
          const parsed = parseFinancialSpeech(transcript);
          if (parsed.amount > 0) setVoiceParsedAmount(String(parsed.amount));
          setVoiceParsedCategory(parsed.category);
          setVoiceParsedType(parsed.type === "MASUK" ? "Masuk" : parsed.type === "MODAL" ? "Modal" : "Keluar");
        },
        (error) => {
          alert(error);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      if (!ok) setIsRecording(false);
    }
  };

  const handleSimulateVoicePreset = (preset: string) => {
    setVoiceTranscript(preset);
    const parsed = parseFinancialSpeech(preset);
    if (parsed.amount > 0) setVoiceParsedAmount(String(parsed.amount));
    setVoiceParsedCategory(parsed.category);
    setVoiceParsedType(parsed.type === "MASUK" ? "Masuk" : parsed.type === "MODAL" ? "Modal" : "Keluar");
  };

  const handleConfirmVoice = async () => {
    const amount = parseFloat(voiceParsedAmount) || 0;
    if (amount <= 0) {
      alert("Nominal transaksi harus lebih dari 0");
      return;
    }

    setSubmitting(true);
    const apiType = voiceParsedType === "Masuk" ? "MASUK" : voiceParsedType === "Modal" ? "MODAL" : "KELUAR";

    try {
      const res = await transactionService.addTransaction({
        date: new Date().toISOString().split("T")[0],
        description: voiceTranscript,
        amount,
        type: apiType,
        category: voiceParsedCategory,
        source: "VOICE",
        paymentMethod: "TUNAI",
      });

      if (res.success) {
        setSuccessBanner("Catatan suara berhasil disimpan ke database!");
        loadTransactions();
      } else {
        const newEntry: CashEntry = {
          id: `VOICE-${String(entries.length + 1).padStart(3, "0")}`,
          date: new Date().toISOString().split("T")[0],
          desc: voiceTranscript,
          category: voiceParsedCategory,
          inAmount: voiceParsedType === "Masuk" || voiceParsedType === "Modal" ? amount : 0,
          outAmount: voiceParsedType === "Keluar" ? amount : 0,
          source: "VOICE",
        };
        setEntries([newEntry, ...entries]);
      }
    } catch (e: any) {
      setErrorBanner(e.message || "Gagal menyimpan transaksi suara");
    } finally {
      setSubmitting(false);
      setIsVoiceModalOpen(false);
      if (isRecording) speechService.stop();
    }
  };

  // 2. OCR SCAN HANDLERS
  const handleOcrFileUpload = async (file: File) => {
    setOcrProcessing(true);
    setOcrStatusText("Membaca nota belanja via OCR Engine...");
    try {
      const result = await ocrService.scanReceipt(file, (pct, status) => {
        setOcrStatusText(`${status} (${pct}%)`);
      });

      if (result.success && result.data) {
        setOcrDetectedData(result.data);
      }
    } catch (err: any) {
      alert("Gagal membaca nota via OCR: " + err.message);
    } finally {
      setOcrProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      alert("Tidak dapat mengakses kamera: " + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureCameraPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        stopCamera();
        setOcrProcessing(true);
        setOcrStatusText("Memindai foto kamera...");
        const result = await ocrService.scanReceipt(blob);
        if (result.success && result.data) {
          setOcrDetectedData(result.data);
        }
        setOcrProcessing(false);
      }
    }, "image/jpeg");
  };

  const handleConfirmOcr = async () => {
    setSubmitting(true);
    try {
      const res = await transactionService.addTransaction({
        date: ocrDetectedData.date,
        description: `${ocrDetectedData.desc} (${ocrDetectedData.store})`,
        amount: ocrDetectedData.total,
        type: "KELUAR",
        category: ocrDetectedData.category,
        source: "OCR",
        paymentMethod: "TUNAI",
      });

      if (res.success) {
        setSuccessBanner("Catatan struk OCR berhasil disimpan ke database!");
        loadTransactions();
      } else {
        const newEntry: CashEntry = {
          id: `OCR-${String(entries.length + 1).padStart(3, "0")}`,
          date: ocrDetectedData.date,
          desc: `${ocrDetectedData.desc} (${ocrDetectedData.store})`,
          category: ocrDetectedData.category,
          inAmount: 0,
          outAmount: ocrDetectedData.total,
          source: "OCR",
        };
        setEntries([newEntry, ...entries]);
      }
    } catch (e: any) {
      setErrorBanner(e.message || "Gagal menyimpan struk OCR");
    } finally {
      setSubmitting(false);
      setIsOcrModalOpen(false);
      stopCamera();
    }
  };

  // 3. PDF TO DATA HANDLERS
  const handlePdfUpload = async (file: File) => {
    setPdfProcessing(true);
    setPdfFileName(file.name);
    try {
      const res = await pdfService.extractPdf(file);
      if (res.success && res.data) {
        setPdfTransactions(res.data.transactions);
        setPdfTotals({
          debet: res.data.totalDebet,
          kredit: res.data.totalKredit,
        });
      }
    } catch (err: any) {
      alert("Gagal mengekstrak PDF: " + err.message);
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleToggleSelectPdfRow = (id: string) => {
    setPdfTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleToggleSelectAllPdf = () => {
    const allSelected = pdfTransactions.every((t) => t.selected);
    setPdfTransactions((prev) =>
      prev.map((t) => ({ ...t, selected: !allSelected }))
    );
  };

  const handleImportPdfBatch = async () => {
    const selectedRows = pdfTransactions.filter((t) => t.selected);
    if (selectedRows.length === 0) {
      alert("Pilih minimal satu baris transaksi untuk diimpor");
      return;
    }

    setSubmitting(true);
    try {
      const payload = selectedRows.map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        source: "PDF",
        paymentMethod: t.paymentMethod,
      }));

      const res = await transactionService.batchAddTransactions(payload);
      if (res.success) {
        setSuccessBanner(`Berhasil mengimpor ${selectedRows.length} transaksi dari dokumen PDF!`);
        loadTransactions();
        setIsPdfModalOpen(false);
      } else {
        alert(res.error || "Gagal mengimpor batch transaksi PDF");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan sistem saat impor PDF");
    } finally {
      setSubmitting(false);
    }
  };

  // Row Edit / Delete Handlers
  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Hapus baris pembukuan ini dari database?")) return;
    try {
      await transactionService.deleteTransaction(id);
      setEntries(entries.filter((e) => e.id !== id));
      setSuccessBanner("Baris pembukuan berhasil dihapus");
    } catch {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const handleSaveEditRow = async (updated: CashEntry) => {
    try {
      await transactionService.updateTransaction(updated.id, {
        description: updated.desc,
        amount: updated.inAmount > 0 ? updated.inAmount : updated.outAmount,
        category: updated.category,
        date: updated.date,
      });
      setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
      setEditingEntry(null);
      setSuccessBanner("Perubahan berhasil diperbarui di database!");
    } catch {
      setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
      setEditingEntry(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Pembukuan Kas</h1>
            <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
              Live DB
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Buku Kas Umum (BKU) dengan persamaan modal, penerimaan, dan pengeluaran kas riil.
          </p>
        </div>

        {/* Action Buttons: [Edit Mode] [Suara] [Scan Nota OCR] [PDF to Data] [Tambah Manual] */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Edit Mode */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm border ${
              isEditMode
                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 ring-2 ring-amber-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            title="Aktifkan mode edit tabel pembukuan"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? "Mode Edit Aktif" : "Edit"}</span>
          </button>

          {isEditMode && (
            <button
              onClick={() => {
                setIsEditMode(false);
                setSuccessBanner("Perubahan pembukuan kas tersimpan!");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesai</span>
            </button>
          )}

          {/* Tombol Suara (Speech to text) */}
          <button
            onClick={() => {
              setIsVoiceModalOpen(true);
              setIsRecording(true);
              speechService.start(
                (text) => {
                  setVoiceTranscript(text);
                  const parsed = parseFinancialSpeech(text);
                  if (parsed.amount > 0) setVoiceParsedAmount(String(parsed.amount));
                  setVoiceParsedCategory(parsed.category);
                },
                (err) => console.log(err),
                () => setIsRecording(false)
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Catat kas cepat dengan suara (Speech to Text)"
          >
            <Mic className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Suara (Mic)</span>
          </button>

          {/* Tombol OCR Scan */}
          <button
            onClick={() => setIsOcrModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Scan struk/nota otomatis via foto atau kamera (OCR Scan)"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Scan Nota (OCR)</span>
          </button>

          {/* Tombol PDF to Data */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Ekstrak mutasi rekening / invoice PDF ke data kas otomatis"
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">PDF to Data</span>
          </button>

          {/* Tombol Tambah Manual */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner("")} className="text-emerald-700 underline">
            Tutup
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner("")} className="text-rose-700 underline">
            Tutup
          </button>
        </div>
      )}

      {/* Persamaan Dasar Buku Kas & Ringkasan Keuangan */}
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isBalanced
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isBalanced ? "Pembukuan Balance (Seimbang)" : "Belum Seimbang"}
            </span>
          </div>
        </div>

        {/* 4 Cards Formula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(1) Modal Usaha</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400">Rp {totalModal.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Modal awal & disetor</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(2) Kas Masuk</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">+Rp {totalKasMasuk.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Penjualan & pendapatan</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(3) Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold text-rose-400">-Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">Biaya & bahan baku</p>
          </div>

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
            Sisi Debet: Rp {sisiDebet.toLocaleString("id-ID")} | Sisi Kredit: Rp {sisiKreditDanKas.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Mode Edit Banner */}
      {isEditMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Mode Edit Aktif:</strong> Anda dapat mengedit keterangan/nominal langsung atau menghapus baris pembukuan.
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
          <button
            onClick={loadTransactions}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Kas Masuk (Debet)</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Kas Keluar (Kredit)</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Saldo Kas</th>
                {isEditMode && (
                  <th className="px-5 py-3.5 text-xs font-semibold text-amber-600 uppercase tracking-wider text-center bg-amber-50/60">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? 8 : 7} className="px-5 py-8 text-center text-gray-400 text-sm">
                    Belum ada transaksi. Gunakan tombol Tambah Manual, Suara, Scan Nota, atau PDF to Data di atas.
                  </td>
                </tr>
              ) : (
                rowsWithBalance.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{item.desc}</span>
                        {item.source === "VOICE" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                            Suara
                          </span>
                        )}
                        {item.source === "OCR" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                            OCR
                          </span>
                        )}
                        {item.source === "PDF" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                            PDF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full font-medium ${
                          item.category === "Modal"
                            ? "bg-amber-100 text-amber-800"
                            : item.category === "Penjualan"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.category === "Bahan Baku"
                            ? "bg-rose-100 text-rose-800"
                            : item.category === "Gaji"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
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
                ))
              )}
            </tbody>
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
      {/* 1. MODAL: SPEECH TO TEXT (SUARA AI)                      */}
      {/* ========================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
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
                onClick={() => {
                  setIsVoiceModalOpen(false);
                  if (isRecording) speechService.stop();
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-purple-50/40 to-slate-50 rounded-2xl border border-purple-100/80">
                <div className="relative flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center ${isRecording ? "animate-ping opacity-30" : ""}`} />
                  <button
                    onClick={toggleRecording}
                    className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                </div>

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
                  {isRecording ? "Sedang Merekam Suara... Silakan bicara" : "Tekan tombol mikrofon untuk mulai bicara"}
                </p>
                <span className="text-xs text-gray-400 mt-1">Bicara nominal & keperluan dalam Bahasa Indonesia</span>
              </div>

              {/* Quick simulation presets */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Atau klik contoh suara di bawah:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateVoicePreset("Beli cup kopi 2 pak seratus sembilan puluh lima ribu rupiah")}
                    className="text-[11px] px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg border border-purple-200"
                  >
                    Beli cup kopi 195rb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateVoicePreset("Penjualan harian kasir delapan ratus lima puluh ribu")}
                    className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                  >
                    Penjualan harian 850rb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateVoicePreset("Bayar tagihan listrik toko tiga ratus lima puluh ribu rupiah")}
                    className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200"
                  >
                    Bayar listrik 350rb
                  </button>
                </div>
              </div>

              {/* Transcript & Extracted details */}
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

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Jenis:</span>
                    <select
                      value={voiceParsedType}
                      onChange={(e) => setVoiceParsedType(e.target.value as any)}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Keluar">Pengeluaran</option>
                      <option value="Masuk">Kas Masuk</option>
                      <option value="Modal">Modal</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Nominal (Rp):</span>
                    <input
                      type="number"
                      value={voiceParsedAmount}
                      onChange={(e) => setVoiceParsedAmount(e.target.value)}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Kategori:</span>
                    <select
                      value={voiceParsedCategory}
                      onChange={(e) => setVoiceParsedCategory(e.target.value as any)}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Bahan Baku">Bahan Baku</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Penjualan">Penjualan</option>
                      <option value="Gaji">Gaji</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(false);
                  if (isRecording) speechService.stop();
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVoice}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-purple-300"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Simpan ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL: OCR SCAN (FILE & KAMERA DENGAN LIVE STREAM)      */}
      {/* ========================================================= */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">OCR Scanner Pembukuan Kas</h3>
                  <p className="text-xs text-gray-500">Ekstraksi otomatis nota belanja & bukti transaksi</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOcrModalOpen(false);
                  stopCamera();
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Tabs */}
            <div className="px-6 pt-4 border-b border-gray-100">
              <div className="flex items-center gap-4 text-sm font-medium">
                <button
                  onClick={() => {
                    setOcrTab("upload");
                    stopCamera();
                  }}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                    ocrTab === "upload"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Foto Struk</span>
                </button>
                <button
                  onClick={() => {
                    setOcrTab("camera");
                    startCamera();
                  }}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                    ocrTab === "camera"
                      ? "border-indigo-600 text-indigo-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Kamera Langsung</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {ocrProcessing && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">{ocrStatusText || "Memproses OCR..."}</span>
                </div>
              )}

              {ocrTab === "upload" ? (
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Pilih File Nota / Struk Belanja</h4>
                  <p className="text-xs text-gray-500 mt-1">Mendukung format JPG, PNG, WEBP (Otomatis dibaca Tesseract OCR)</p>
                  <label className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm">
                    Pilih File Gambar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOcrFileUpload(file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                /* Tab 2: Camera Viewfinder */
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center text-white border border-slate-700 shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400" />

                  <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="absolute bottom-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-900 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Ambil Foto & Pindai
                  </button>
                </div>
              )}

              {/* OCR Detection Preview & Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Hasil Ekstraksi OCR Otomatis:
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                    Akurasi {ocrDetectedData.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-gray-500 block mb-1">Toko / Supplier:</label>
                    <input
                      type="text"
                      value={ocrDetectedData.store}
                      onChange={(e) => setOcrDetectedData({ ...ocrDetectedData, store: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Tanggal Struk:</label>
                    <input
                      type="date"
                      value={ocrDetectedData.date}
                      onChange={(e) => setOcrDetectedData({ ...ocrDetectedData, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Keterangan:</label>
                    <input
                      type="text"
                      value={ocrDetectedData.desc}
                      onChange={(e) => setOcrDetectedData({ ...ocrDetectedData, desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Nominal Terdeteksi (Rp):</label>
                    <input
                      type="number"
                      value={ocrDetectedData.total}
                      onChange={(e) => setOcrDetectedData({ ...ocrDetectedData, total: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-bold text-indigo-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOcrModalOpen(false);
                  stopCamera();
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmOcr}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-300"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Simpan ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL: PDF TO DATA (EKSTRAKSI MUTASI & INVOICE PDF)     */}
      {/* ========================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">PDF to Data (Mutasi & Invoice)</h3>
                  <p className="text-xs text-gray-500">Ekstraksi berkas PDF rekening koran bank atau faktur ke data kas</p>
                </div>
              </div>
              <button onClick={() => setIsPdfModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Dropzone */}
              <div className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/20 rounded-2xl p-5 text-center transition-colors">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-rose-500 mb-2" />
                <h4 className="font-semibold text-gray-800 text-sm">Upload Dokumen PDF Rekening Koran / Invoice</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Mendukung Rekening Koran BCA, Mandiri, BRI, Bank Jago, atau Faktur Pembelian PDF
                </p>
                <label className="mt-3 inline-block px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm">
                  Pilih Berkas PDF
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                  />
                </label>
                {pdfFileName && <p className="text-xs text-rose-700 font-semibold mt-2">File: {pdfFileName}</p>}
              </div>

              {pdfProcessing && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                  <span className="text-xs font-semibold">Sedang mengekstrak seluruh baris transaksi dari PDF...</span>
                </div>
              )}

              {/* Extracted table preview */}
              {pdfTransactions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <span>Daftar Transaksi Terdeteksi ({pdfTransactions.length} baris)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleSelectAllPdf}
                      className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      {pdfTransactions.every((t) => t.selected) ? "Batal Pilih Semua" : "Pilih Semua"}
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0">
                        <tr>
                          <th className="p-2.5 w-8 text-center">Pilih</th>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5">Keterangan</th>
                          <th className="p-2.5">Jenis</th>
                          <th className="p-2.5 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pdfTransactions.map((item) => (
                          <tr key={item.id} className={item.selected ? "bg-rose-50/30" : "bg-white opacity-60"}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={!!item.selected}
                                onChange={() => handleToggleSelectPdfRow(item.id)}
                                className="w-4 h-4 text-rose-600 rounded"
                              />
                            </td>
                            <td className="p-2.5 whitespace-nowrap text-gray-600">{item.date}</td>
                            <td className="p-2.5 font-medium text-gray-900">{item.description}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                                  item.type === "MASUK"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {item.type}
                              </span>
                            </td>
                            <td
                              className={`p-2.5 font-bold text-right whitespace-nowrap ${
                                item.type === "MASUK" ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              Rp {item.amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar */}
                  <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-600">
                      Dipilih: <strong>{pdfTransactions.filter((t) => t.selected).length}</strong> dari {pdfTransactions.length} transaksi
                    </span>
                    <span className="font-semibold text-slate-800">
                      Total: Rp{" "}
                      {pdfTransactions
                        .filter((t) => t.selected)
                        .reduce((acc, t) => acc + (t.type === "MASUK" ? t.amount : -t.amount), 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImportPdfBatch}
                disabled={submitting || pdfTransactions.filter((t) => t.selected).length === 0}
                className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-rose-300"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Impor {pdfTransactions.filter((t) => t.selected).length} Data ke Buku Kas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: TAMBAH MANUAL                                   */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Tambah Catatan Buku Kas</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("Masuk");
                      setFormCategory("Penjualan");
                    }}
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
                    onClick={() => {
                      setFormType("Keluar");
                      setFormCategory("Bahan Baku");
                    }}
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
                    onClick={() => {
                      setFormType("Modal");
                      setFormCategory("Modal");
                    }}
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
                          <option value="Lainnya">Lainnya</option>
                        </>
                      ) : (
                        <>
                          <option value="Bahan Baku">Bahan Baku</option>
                          <option value="Operasional">Operasional</option>
                          <option value="Gaji">Gaji Pegawai</option>
                          <option value="Lainnya">Lainnya</option>
                        </>
                      )}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan / Transaksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelian Kopi Arabika 5kg"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 150000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={formPayment}
                    onChange={(e) => setFormPayment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TUNAI">Tunai (Cash)</option>
                    <option value="QRIS">QRIS</option>
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="KARTU_DEBIT">Kartu Debit</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: EDIT ROW INLINE                                 */}
      {/* ========================================================= */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-gray-900 mb-4">Edit Baris Pembukuan</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tanggal</label>
                <input
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editingEntry.desc}
                  onChange={(e) => setEditingEntry({ ...editingEntry, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  {editingEntry.inAmount > 0 ? "Nominal Kas Masuk (Rp)" : "Nominal Pengeluaran (Rp)"}
                </label>
                <input
                  type="number"
                  value={editingEntry.inAmount > 0 ? editingEntry.inAmount : editingEntry.outAmount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (editingEntry.inAmount > 0) {
                      setEditingEntry({ ...editingEntry, inAmount: val });
                    } else {
                      setEditingEntry({ ...editingEntry, outAmount: val });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
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
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
