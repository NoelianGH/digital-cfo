"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Square,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { transactionService, TransactionItem } from "@/services/transactionService";
import { speechService, parseFinancialSpeech, parseMultipleFinancialSpeech, ParsedSpeechFinancial } from "@/services/speechService";
import { ocrService, OcrResult, OcrCashbookItem, parseCashbookLines, getDefaultSampleCashbookItems } from "@/services/ocrService";
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

export interface DraftTransactionItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Masuk" | "Keluar" | "Modal";
  category: CashEntry["category"];
  paymentMethod?: string;
}

export interface VoicePreviewItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Masuk" | "Keluar" | "Modal";
  category: CashEntry["category"];
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

  // Navigasi & Filter Bulan Pembukuan Kas (Default: Bulan Aktif saat ini)
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Form states for Add Manual & Draft Preview Sementara
  const [manualPhase, setManualPhase] = useState<"input" | "review">("input");
  const [manualItems, setManualItems] = useState<DraftTransactionItem[]>([]);
  const [formType, setFormType] = useState<"Masuk" | "Keluar" | "Modal">("Masuk");
  const [formCategory, setFormCategory] = useState<CashEntry["category"]>("Penjualan");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPayment, setFormPayment] = useState("TUNAI");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voicePhase, setVoicePhase] = useState<"record" | "review">("record");
  const [voiceItems, setVoiceItems] = useState<VoicePreviewItem[]>([]);

  // OCR state
  const [ocrPhase, setOcrPhase] = useState<"upload" | "review">("upload");
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");
  const [ocrItems, setOcrItems] = useState<OcrCashbookItem[]>([]);
  const [ocrConfidence, setOcrConfidence] = useState(88);
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

  // PDF to Data state (Multi-transaksi Preview Sementara)
  const [pdfPhase, setPdfPhase] = useState<"upload" | "review">("upload");
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfItems, setPdfItems] = useState<DraftTransactionItem[]>([]);
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

  // Calculations & Monthly BKU Logic
  // Format nama bulan Indonesia
  const formatMonthLabel = (ymStr: string) => {
    if (ymStr === "ALL") return "Semua Periode (Keseluruhan BKU)";
    const [year, month] = ymStr.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || month} ${year}`;
  };

  // 1. Daftar Bulan yang Tersedia (Dihasilkan dinamis dari transaksi + bulan berjalan)
  const availableMonths = useMemo(() => {
    const setM = new Set<string>();
    setM.add(currentMonthStr);
    entries.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        setM.add(e.date.slice(0, 7));
      }
    });
    return Array.from(setM).sort().reverse();
  }, [entries, currentMonthStr]);

  const isAllMonths = selectedMonth === "ALL";

  // 2. Saldo Awal Bulan Otomatis: Dihitung kumulatif dari semua transaksi sebelum bulan ini dimulai
  const startingBalance = useMemo(() => {
    if (isAllMonths) return 0;
    const prior = entries.filter((e) => e.date < `${selectedMonth}-01`);
    return prior.reduce((acc, curr) => acc + (curr.inAmount - curr.outAmount), 0);
  }, [entries, selectedMonth, isAllMonths]);

  // Nama bulan sebelumnya untuk teks keterangan Saldo Awal
  const previousMonthLabel = useMemo(() => {
    if (isAllMonths) return "";
    const [y, m] = selectedMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, "0");
    return formatMonthLabel(`${prevY}-${prevM}`);
  }, [selectedMonth, isAllMonths]);

  // 3. Transaksi Bulan Terpilih (Diurutkan kronologis ascending untuk akuntansi BKU)
  const monthFilteredEntries = useMemo(() => {
    const list = isAllMonths
      ? [...entries]
      : entries.filter((e) => e.date.startsWith(selectedMonth));
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, selectedMonth, isAllMonths]);

  // 4. Perhitungan Saldo Berjalan (Running Balance) yang Meneruskan Saldo Awal Bulan
  const displayRowsWithBalance = useMemo(() => {
    let running = isAllMonths ? 0 : startingBalance;
    return monthFilteredEntries.map((entry) => {
      running += entry.inAmount - entry.outAmount;
      return {
        ...entry,
        balance: running,
      };
    });
  }, [monthFilteredEntries, startingBalance, isAllMonths]);

  // 5. Statistik Finansial Periode Aktif
  const activeMonthModal = useMemo(() => {
    return monthFilteredEntries
      .filter((e) => e.category === "Modal")
      .reduce((acc, curr) => acc + curr.inAmount, 0);
  }, [monthFilteredEntries]);

  const activeMonthKasMasuk = useMemo(() => {
    return monthFilteredEntries
      .filter((e) => e.category !== "Modal")
      .reduce((acc, curr) => acc + curr.inAmount, 0);
  }, [monthFilteredEntries]);

  const activeMonthPengeluaran = useMemo(() => {
    return monthFilteredEntries.reduce((acc, curr) => acc + curr.outAmount, 0);
  }, [monthFilteredEntries]);

  // Saldo Kas Akhir Periode Aktif (Saldo Awal + Masuk - Keluar)
  const activePeriodEndingBalance = useMemo(() => {
    if (isAllMonths) {
      return entries.reduce((acc, curr) => acc + (curr.inAmount - curr.outAmount), 0);
    }
    return startingBalance + activeMonthModal + activeMonthKasMasuk - activeMonthPengeluaran;
  }, [isAllMonths, entries, startingBalance, activeMonthModal, activeMonthKasMasuk, activeMonthPengeluaran]);

  // Saldo Kas Keseluruhan Total Usaha
  const totalOverallSaldo = useMemo(() => {
    return entries.reduce((acc, curr) => acc + (curr.inAmount - curr.outAmount), 0);
  }, [entries]);

  // Debet vs Kredit & Akumulasi Saldo Awal
  const totalModal = isAllMonths ? entries.filter((e) => e.category === "Modal").reduce((acc, curr) => acc + curr.inAmount, 0) : activeMonthModal;
  const totalKasMasuk = isAllMonths ? entries.filter((e) => e.category !== "Modal").reduce((acc, curr) => acc + curr.inAmount, 0) : activeMonthKasMasuk;
  const totalPengeluaran = isAllMonths ? entries.reduce((acc, curr) => acc + curr.outAmount, 0) : activeMonthPengeluaran;
  const saldoKas = activePeriodEndingBalance;

  // Total Debet Akumulasi di Kolom Kas Masuk (Saldo Awal jika positif + Modal + Kas Masuk)
  const totalDebetWithStarting = useMemo(() => {
    const debetAwal = (!isAllMonths && startingBalance > 0) ? startingBalance : 0;
    return debetAwal + totalModal + totalKasMasuk;
  }, [isAllMonths, startingBalance, totalModal, totalKasMasuk]);

  // Total Kredit Akumulasi di Kolom Kas Keluar (Saldo Awal jika defisit/negatif + Pengeluaran)
  const totalKreditWithStarting = useMemo(() => {
    const kreditAwal = (!isAllMonths && startingBalance < 0) ? Math.abs(startingBalance) : 0;
    return kreditAwal + totalPengeluaran;
  }, [isAllMonths, startingBalance, totalPengeluaran]);

  const sisiDebet = totalDebetWithStarting;
  const sisiKreditDanKas = totalKreditWithStarting + saldoKas;
  const isBalanced = sisiDebet === (totalPengeluaran + saldoKas);

  // Navigasi Bulan Handlers
  const handlePrevMonth = () => {
    if (availableMonths.length <= 1) return;
    const currentIdx = availableMonths.indexOf(selectedMonth);
    if (currentIdx !== -1 && currentIdx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIdx + 1]);
    }
  };

  const handleNextMonth = () => {
    if (availableMonths.length <= 1) return;
    const currentIdx = availableMonths.indexOf(selectedMonth);
    if (currentIdx > 0) {
      setSelectedMonth(availableMonths[currentIdx - 1]);
    }
  };

  // 1. TAMBAH MANUAL & DRAFT PREVIEW HANDLERS
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setManualPhase("input");
    setManualItems([]);
    setFormDesc("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
  };

  const handleAddManualDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(formAmount) || 0;
    if (!formDesc || amount <= 0) {
      alert("Mohon lengkapi keterangan dan nominal yang valid.");
      return;
    }

    const newItem: DraftTransactionItem = {
      id: "manual-" + Math.random().toString(36).substr(2, 9),
      date: formDate,
      description: formDesc,
      amount,
      type: formType,
      category: formType === "Modal" ? "Modal" : formCategory,
      paymentMethod: formPayment,
    };

    setManualItems((prev) => [...prev, newItem]);
    setManualPhase("review");
    setFormDesc("");
    setFormAmount("");
  };

  const handleUpdateManualItem = (id: string, field: keyof DraftTransactionItem, value: any) => {
    setManualItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleDeleteManualItem = (id: string) => {
    setManualItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddNewManualRow = () => {
    const newItem: DraftTransactionItem = {
      id: "manual-" + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      type: "Keluar",
      category: "Operasional",
      paymentMethod: "TUNAI",
    };
    setManualItems((prev) => [...prev, newItem]);
  };

  const handleConfirmManualBatch = async () => {
    if (manualItems.length === 0) return;
    setSubmitting(true);
    try {
      const payload = manualItems.map((it) => {
        let cat = "LAINNYA";
        if (it.category === "Penjualan") cat = "PENJUALAN";
        else if (it.category === "Bahan Baku") cat = "PEMBELIAN";
        else if (it.category === "Operasional") cat = "OPERASIONAL";
        else if (it.category === "Gaji") cat = "GAJI";
        else if (it.type === "Modal") cat = "OPERASIONAL";

        let tType: "MASUK" | "KELUAR" | "MODAL" = "KELUAR";
        if (it.type === "Masuk") tType = "MASUK";
        else if (it.type === "Modal") tType = "MODAL";

        return {
          date: it.date,
          description: it.description || "Transaksi Manual",
          amount: Number(it.amount) || 0,
          type: tType,
          category: cat,
          source: "MANUAL",
          paymentMethod: it.paymentMethod || "TUNAI",
        };
      });

      const res = await transactionService.batchAddTransactions(payload);
      if (res.success) {
        setSuccessBanner(`Tersimpan ${manualItems.length} transaksi manual ke pembukuan!`);
        loadTransactions();
      } else {
        const newEntries: CashEntry[] = manualItems.map((it, idx) => ({
          id: `MANUAL-${Date.now()}-${idx}`,
          date: it.date,
          desc: it.description || "Transaksi Manual",
          category: it.category,
          inAmount: it.type === "Masuk" || it.type === "Modal" ? Number(it.amount) : 0,
          outAmount: it.type === "Keluar" ? Number(it.amount) : 0,
          source: "MANUAL",
          paymentMethod: it.paymentMethod,
        }));
        setEntries((prev) => [...newEntries, ...prev]);
        setSuccessBanner(`Tersimpan ${manualItems.length} transaksi manual ke pembukuan!`);
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Gagal menyimpan transaksi manual");
    } finally {
      setSubmitting(false);
      setIsAddModalOpen(false);
      setManualPhase("input");
      setManualItems([]);
    }
  };

  // 1. SPEECH TO TEXT HANDLERS
  const syncVoiceTranscriptToItems = (text: string) => {
    const parsed = parseMultipleFinancialSpeech(text);
    const today = new Date().toISOString().split("T")[0];
    if (parsed.length > 0) {
      setVoiceItems(
        parsed.map((p, idx) => ({
          id: `voice-${Date.now()}-${idx}`,
          date: p.date || today,
          description: p.description,
          amount: p.amount,
          type: (p.type === "MASUK" ? "Masuk" : p.type === "MODAL" ? "Modal" : "Keluar") as "Masuk" | "Keluar" | "Modal",
          category: p.category,
        }))
      );
    } else if (text.trim()) {
      setVoiceItems([
        {
          id: `voice-${Date.now()}-0`,
          date: today,
          description: text.trim(),
          amount: 0,
          type: "Keluar",
          category: "Operasional",
        },
      ]);
    } else {
      setVoiceItems([]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
      if (voiceTranscript.trim()) {
        syncVoiceTranscriptToItems(voiceTranscript);
      }
    } else {
      setIsRecording(true);
      const ok = speechService.start(
        (transcript) => {
          setVoiceTranscript(transcript);
          syncVoiceTranscriptToItems(transcript);
        },
        (error) => {
          alert(error);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        },
        voiceTranscript // Pertahankan teks lama & sambung (append), tidak hilang!
      );
      if (!ok) setIsRecording(false);
    }
  };

  const handleFinishRecordingAndReview = () => {
    speechService.stop();
    setIsRecording(false);
    if (voiceTranscript.trim()) {
      syncVoiceTranscriptToItems(voiceTranscript);
    }
    setVoicePhase("review");
  };

  const handleSimulateVoicePreset = (preset: string) => {
    setVoiceTranscript(preset);
    syncVoiceTranscriptToItems(preset);
    setVoicePhase("review");
  };

  const handleUpdateVoiceItem = (id: string, field: keyof VoicePreviewItem, value: any) => {
    setVoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteVoiceItem = (id: string) => {
    setVoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddVoiceItem = () => {
    setVoiceItems((prev) => [
      ...prev,
      {
        id: `voice-add-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: 0,
        type: "Keluar",
        category: "Operasional",
      },
    ]);
  };

  const handleConfirmVoice = async () => {
    if (voiceItems.length === 0) {
      alert("Tabel transaksi sementara masih kosong. Silakan tambah baris atau rekam ulang.");
      return;
    }

    const invalid = voiceItems.find((it) => !it.amount || it.amount <= 0);
    if (invalid) {
      alert("Setiap transaksi harus memiliki nominal lebih dari 0. Silakan periksa kembali nominal pada tabel preview.");
      return;
    }

    setSubmitting(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      const payload = voiceItems.map((item) => ({
        date: item.date || today,
        description: item.description.trim() || `Transaksi ${item.category}`,
        amount: Number(item.amount),
        type: (item.type === "Masuk" ? "MASUK" : item.type === "Modal" ? "MODAL" : "KELUAR") as "MASUK" | "KELUAR" | "MODAL",
        category: item.category,
        source: "VOICE" as const,
        paymentMethod: "TUNAI" as const,
      }));

      const res = await transactionService.batchAddTransactions(payload);
      if (res.success) {
        setSuccessBanner(`Berhasil menyimpan ${voiceItems.length} transaksi dari suara ke database!`);
        loadTransactions();
      } else {
        // Fallback sequential
        for (const p of payload) {
          await transactionService.addTransaction(p).catch(() => null);
        }
        setSuccessBanner(`Berhasil menyimpan ${voiceItems.length} transaksi ke database!`);
        loadTransactions();
      }
    } catch (e: any) {
      const newEntries: CashEntry[] = voiceItems.map((it, idx) => ({
        id: `VOICE-${Date.now()}-${idx}`,
        date: it.date || today,
        desc: it.description.trim() || `Transaksi ${it.category}`,
        category: it.category,
        inAmount: it.type === "Masuk" || it.type === "Modal" ? Number(it.amount) : 0,
        outAmount: it.type === "Keluar" ? Number(it.amount) : 0,
        source: "VOICE",
      }));
      setEntries((prev) => [...newEntries, ...prev]);
      setSuccessBanner(`Tersimpan ${voiceItems.length} transaksi suara ke pembukuan!`);
    } finally {
      setSubmitting(false);
      setIsVoiceModalOpen(false);
      setVoicePhase("record");
      setVoiceTranscript("");
      setVoiceItems([]);
      if (isRecording) speechService.stop();
    }
  };

  // 2. OCR SCAN BUKU KAS FISIK HANDLERS
  const handleOcrFileUpload = async (file: File) => {
    setOcrProcessing(true);
    setOcrStatusText("Membaca lembar foto buku kas via OCR Engine...");
    try {
      const result = await ocrService.scanCashbook(file, (pct, status) => {
        setOcrStatusText(`${status} (${pct}%)`);
      });

      if (result.success && result.data) {
        setOcrRawText(result.data.rawText);
        setOcrItems(result.data.items);
        setOcrConfidence(result.data.confidence);
        setOcrPhase("review");
      }
    } catch (err: any) {
      alert("Gagal membaca buku kas via OCR: " + err.message);
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
        setOcrStatusText("Memindai lembar foto buku kas...");
        const result = await ocrService.scanCashbook(blob, (pct, status) => {
          setOcrStatusText(`${status} (${pct}%)`);
        });
        if (result.success && result.data) {
          setOcrRawText(result.data.rawText);
          setOcrItems(result.data.items);
          setOcrConfidence(result.data.confidence);
          setOcrPhase("review");
        }
        setOcrProcessing(false);
      }
    }, "image/jpeg");
  };

  const handleUseSampleCashbook = () => {
    const samples = getDefaultSampleCashbookItems();
    const sampleText = samples
      .map((it) => `${it.date} ${it.description} Rp${it.amount.toLocaleString("id-ID")}`)
      .join("\n");
    setOcrRawText(sampleText);
    setOcrItems(samples);
    setOcrConfidence(95);
    setOcrPhase("review");
  };

  const handleReparseOcrText = () => {
    if (!ocrRawText.trim()) return;
    const parsed = parseCashbookLines(ocrRawText);
    setOcrItems(parsed);
  };

  const handleUpdateOcrItem = (id: string, field: keyof OcrCashbookItem, value: any) => {
    setOcrItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDeleteOcrItem = (id: string) => {
    setOcrItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddOcrItem = () => {
    const newItem: OcrCashbookItem = {
      id: "ocr-" + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      type: "Keluar",
      category: "Operasional",
    };
    setOcrItems((prev) => [...prev, newItem]);
  };

  const handleConfirmOcrBatch = async () => {
    if (ocrItems.length === 0) return;
    setSubmitting(true);
    try {
      const payload = ocrItems.map((it) => {
        let cat = "LAINNYA";
        if (it.category === "Penjualan") cat = "PENJUALAN";
        else if (it.category === "Bahan Baku") cat = "PEMBELIAN";
        else if (it.category === "Operasional") cat = "OPERASIONAL";
        else if (it.category === "Gaji") cat = "GAJI";
        else if (it.type === "Modal") cat = "OPERASIONAL";

        let tType: "MASUK" | "KELUAR" | "MODAL" = "KELUAR";
        if (it.type === "Masuk") tType = "MASUK";
        else if (it.type === "Modal") tType = "MODAL";

        return {
          date: it.date,
          description: it.description || "Transaksi Buku Kas",
          amount: Number(it.amount) || 0,
          type: tType,
          category: cat,
          source: "OCR",
          paymentMethod: "TUNAI",
        };
      });

      const res = await transactionService.batchAddTransactions(payload);
      if (res.success) {
        setSuccessBanner(`Tersimpan ${ocrItems.length} transaksi dari buku kas ke pembukuan!`);
        loadTransactions();
      } else {
        const newEntries: CashEntry[] = ocrItems.map((it, idx) => ({
          id: `OCR-${Date.now()}-${idx}`,
          date: it.date,
          desc: it.description || "Transaksi Buku Kas",
          category: it.category,
          inAmount: it.type === "Masuk" || it.type === "Modal" ? Number(it.amount) : 0,
          outAmount: it.type === "Keluar" ? Number(it.amount) : 0,
          source: "OCR",
        }));
        setEntries((prev) => [...newEntries, ...prev]);
        setSuccessBanner(`Tersimpan ${ocrItems.length} transaksi buku kas ke pembukuan!`);
      }
    } catch (e: any) {
      setErrorBanner(e.message || "Gagal menyimpan transaksi OCR");
    } finally {
      setSubmitting(false);
      setIsOcrModalOpen(false);
      setOcrPhase("upload");
      setOcrRawText("");
      setOcrItems([]);
      stopCamera();
    }
  };

  // 3. PDF TO DATA HANDLERS (MULTI-TRANSAKSI PREVIEW SEMENTARA)
  const handleOpenPdfModal = () => {
    setIsPdfModalOpen(true);
    setPdfPhase("upload");
    setPdfFileName("");
    setPdfItems([]);
  };

  const handlePdfUpload = async (file: File) => {
    setPdfProcessing(true);
    setPdfFileName(file.name);
    try {
      const res = await pdfService.extractPdf(file);
      if (res.success && res.data) {
        const mapped: DraftTransactionItem[] = res.data.transactions.map((t) => {
          let cat: CashEntry["category"] = "Lainnya";
          if (t.category === "PENJUALAN") cat = "Penjualan";
          else if (t.category === "PEMBELIAN") cat = "Bahan Baku";
          else if (t.category === "OPERASIONAL") cat = "Operasional";
          else if (t.category === "GAJI") cat = "Gaji";

          let tType: "Masuk" | "Keluar" | "Modal" = "Keluar";
          if (t.type === "MASUK") tType = "Masuk";
          else if (t.type === "MODAL") tType = "Modal";

          return {
            id: "pdf-" + Math.random().toString(36).substr(2, 9),
            date: t.date || new Date().toISOString().split("T")[0],
            description: t.description || "Transaksi Mutasi PDF",
            amount: t.amount || 0,
            type: tType,
            category: cat,
            paymentMethod: t.paymentMethod || "TRANSFER",
          };
        });

        setPdfItems(mapped);
        setPdfPhase("review");
      }
    } catch (err: any) {
      alert("Gagal mengekstrak PDF: " + err.message);
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleUseSamplePdf = () => {
    const today = new Date().toISOString().split("T")[0];
    const sampleItems: DraftTransactionItem[] = [
      {
        id: "pdf-s1",
        date: today,
        description: "TRSF E-BANKING CR DARI PT MITRA KONSUMEN",
        amount: 1450000,
        type: "Masuk",
        category: "Penjualan",
        paymentMethod: "TRANSFER",
      },
      {
        id: "pdf-s2",
        date: today,
        description: "PEMBELIAN BAHAN BAKU KOPI & SUSU SUPPLIER",
        amount: 620000,
        type: "Keluar",
        category: "Bahan Baku",
        paymentMethod: "TRANSFER",
      },
      {
        id: "pdf-s3",
        date: today,
        description: "BIAYA TAGIHAN LISTRIK PLN BULANAN",
        amount: 285000,
        type: "Keluar",
        category: "Operasional",
        paymentMethod: "TRANSFER",
      },
      {
        id: "pdf-s4",
        date: today,
        description: "TRSF QRIS SETTLEMENT MERCHANT HARIAN",
        amount: 980000,
        type: "Masuk",
        category: "Penjualan",
        paymentMethod: "QRIS",
      },
      {
        id: "pdf-s5",
        date: today,
        description: "GAJI TENAGA KERJA MINGGUAN KASIR",
        amount: 350000,
        type: "Keluar",
        category: "Gaji",
        paymentMethod: "TRANSFER",
      },
    ];
    setPdfFileName("Rekening_Koran_Mutasi_BCA_Demo.pdf");
    setPdfItems(sampleItems);
    setPdfPhase("review");
  };

  const handleUpdatePdfItem = (id: string, field: keyof DraftTransactionItem, value: any) => {
    setPdfItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleDeletePdfItem = (id: string) => {
    setPdfItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddNewPdfRow = () => {
    const newItem: DraftTransactionItem = {
      id: "pdf-" + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      type: "Keluar",
      category: "Operasional",
      paymentMethod: "TRANSFER",
    };
    setPdfItems((prev) => [...prev, newItem]);
  };

  const handleConfirmPdfBatch = async () => {
    if (pdfItems.length === 0) return;
    setSubmitting(true);
    try {
      const payload = pdfItems.map((it) => {
        let cat = "LAINNYA";
        if (it.category === "Penjualan") cat = "PENJUALAN";
        else if (it.category === "Bahan Baku") cat = "PEMBELIAN";
        else if (it.category === "Operasional") cat = "OPERASIONAL";
        else if (it.category === "Gaji") cat = "GAJI";
        else if (it.type === "Modal") cat = "OPERASIONAL";

        let tType: "MASUK" | "KELUAR" | "MODAL" = "KELUAR";
        if (it.type === "Masuk") tType = "MASUK";
        else if (it.type === "Modal") tType = "MODAL";

        return {
          date: it.date,
          description: it.description || "Transaksi Rekening Koran PDF",
          amount: Number(it.amount) || 0,
          type: tType,
          category: cat,
          source: "PDF",
          paymentMethod: it.paymentMethod || "TRANSFER",
        };
      });

      const res = await transactionService.batchAddTransactions(payload);
      if (res.success) {
        setSuccessBanner(`Tersimpan ${pdfItems.length} transaksi dari dokumen PDF ke pembukuan!`);
        loadTransactions();
      } else {
        const newEntries: CashEntry[] = pdfItems.map((it, idx) => ({
          id: `PDF-${Date.now()}-${idx}`,
          date: it.date,
          desc: it.description || "Transaksi Rekening Koran PDF",
          category: it.category,
          inAmount: it.type === "Masuk" || it.type === "Modal" ? Number(it.amount) : 0,
          outAmount: it.type === "Keluar" ? Number(it.amount) : 0,
          source: "PDF",
          paymentMethod: it.paymentMethod,
        }));
        setEntries((prev) => [...newEntries, ...prev]);
        setSuccessBanner(`Tersimpan ${pdfItems.length} transaksi PDF ke pembukuan!`);
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Gagal menyimpan transaksi PDF");
    } finally {
      setSubmitting(false);
      setIsPdfModalOpen(false);
      setPdfPhase("upload");
      setPdfItems([]);
      setPdfFileName("");
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
              setVoicePhase("record");
              setVoiceTranscript("");
              setVoiceItems([]);
              setIsRecording(true);
              speechService.start(
                (text) => {
                  setVoiceTranscript(text);
                  syncVoiceTranscriptToItems(text);
                },
                (err) => console.log(err),
                () => {
                  setIsRecording(false);
                  setVoicePhase("review");
                }
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Catat kas cepat dengan suara (Speech to Text)"
          >
            <Mic className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Suara (Mic)</span>
          </button>

          {/* Tombol OCR Scan Buku Kas Fisik */}
          <button
            onClick={() => {
              setIsOcrModalOpen(true);
              setOcrPhase("upload");
              setOcrRawText("");
              setOcrItems([]);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Scan lembar buku kas fisik otomatis via foto atau kamera (OCR Scan)"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">OCR Buku Kas</span>
          </button>

          {/* Tombol PDF to Data */}
          <button
            onClick={handleOpenPdfModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
            title="Ekstrak mutasi rekening / invoice PDF ke data kas otomatis"
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">PDF to Data</span>
          </button>

          {/* Tombol Tambah Manual */}
          <button
            onClick={handleOpenAddModal}
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

      {/* Persamaan Dasar Buku Kas & Ringkasan Keuangan Periode Aktif */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-wide">Persamaan Buku Kas Umum</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 font-medium">
                  {formatMonthLabel(selectedMonth)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAllMonths
                  ? "Prinsip Keseimbangan Kumulatif: (Total Modal + Kas Masuk) = (Pengeluaran + Saldo Kas)"
                  : `Periode ${formatMonthLabel(selectedMonth)} | Saldo Awal Bawaan: Rp ${startingBalance.toLocaleString("id-ID")}`}
              </p>
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
              <span>{isAllMonths ? "(1) Modal Usaha" : "(1) Saldo Awal Bulan"}</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400">
              Rp {(isAllMonths ? totalModal : startingBalance).toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isAllMonths ? "Total modal disetor" : `Bawaan ${previousMonthLabel || "bulan sebelumnya"}`}
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(2) Kas Masuk</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">+Rp {totalKasMasuk.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isAllMonths ? "Total penjualan & penerimaan" : "Penerimaan kas bulan ini"}
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(3) Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold text-rose-400">-Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isAllMonths ? "Total belanja & operasional" : "Pengeluaran kas bulan ini"}
            </p>
          </div>

          <div className="bg-blue-950/70 p-4 rounded-xl border border-blue-700/60 ring-1 ring-blue-500/30">
            <div className="flex items-center justify-between text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>(4) Saldo Kas Akhir</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                {isAllMonths ? "Kas Riil Total" : "Saldo Akhir Bulan"}
              </span>
            </div>
            <p className="text-xl font-bold text-white">Rp {saldoKas.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-blue-200/80 mt-1">
              {isAllMonths
                ? "Kumulatif seluruh riwayat kas"
                : `Total Debet (Rp ${totalDebetWithStarting.toLocaleString("id-ID")}) - Keluar`}
            </p>
          </div>
        </div>

        {/* Formula calculation visualization bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            {!isAllMonths ? (
              <>
                <span className="text-indigo-300 font-bold">Saldo Awal ({startingBalance.toLocaleString("id-ID")})</span>
                <span>+</span>
                <span className="text-emerald-400 font-bold">Kas Masuk ({totalKasMasuk.toLocaleString("id-ID")})</span>
                <span>=</span>
                <span className="text-amber-300 font-bold">Total Debet ({totalDebetWithStarting.toLocaleString("id-ID")})</span>
                <span>-</span>
                <span className="text-rose-400 font-bold">Pengeluaran ({totalPengeluaran.toLocaleString("id-ID")})</span>
                <span>=</span>
                <span className="text-blue-300 font-bold">Saldo Kas Akhir ({saldoKas.toLocaleString("id-ID")})</span>
              </>
            ) : (
              <>
                <span className="text-amber-400 font-bold">Modal ({totalModal.toLocaleString("id-ID")})</span>
                <span>+</span>
                <span className="text-emerald-400 font-bold">Kas Masuk ({totalKasMasuk.toLocaleString("id-ID")})</span>
                <span>=</span>
                <span className="text-rose-400 font-bold">Pengeluaran ({totalPengeluaran.toLocaleString("id-ID")})</span>
                <span>+</span>
                <span className="text-blue-300 font-bold">Saldo Kas ({saldoKas.toLocaleString("id-ID")})</span>
              </>
            )}
          </div>
          <div className="text-slate-400 text-[11px]">
            Saldo Kas Total Keseluruhan Usaha: <strong className="text-white">Rp {totalOverallSaldo.toLocaleString("id-ID")}</strong>
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

      {/* ========================================================= */}
      {/* KONTROL NAVIGASI BULAN PEMBUKUAN KAS (MONTHLY SELECTOR)   */}
      {/* ========================================================= */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigasi Kiri: Tombol Prev, Dropdown Bulan, Tombol Next */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isAllMonths || availableMonths.indexOf(selectedMonth) >= availableMonths.length - 1}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-gray-800">
              <Calendar className="w-4 h-4 text-blue-600" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-gray-900 text-xs py-1 pr-1 outline-none cursor-pointer"
              >
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthLabel(ym)} {ym === currentMonthStr ? "★ (Bulan Ini)" : ""}
                  </option>
                ))}
                <option value="ALL">Semua Periode (Keseluruhan BKU)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isAllMonths || availableMonths.indexOf(selectedMonth) <= 0}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter: Bulan Ini vs Semua */}
          {!isAllMonths ? (
            <button
              type="button"
              onClick={() => setSelectedMonth("ALL")}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Tampilkan Semua Bulan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedMonth(currentMonthStr)}
              className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold transition-colors"
            >
              ← Kembali ke Bulan Ini ({formatMonthLabel(currentMonthStr)})
            </button>
          )}
        </div>

        {/* Info Kanan: Status Bulan Aktif & Sisa Saldo Bawaan */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {!isAllMonths ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Saldo Awal Bulan:</span>
              <span className="font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md">
                Rp {startingBalance.toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 font-medium">Menampilkan seluruh arsip transaksi kas tanpa batas bulan</span>
          )}
        </div>
      </div>

      {/* Buku Kas Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Lembar Buku Kas Umum (BKU)</h3>
            <span className="text-xs text-gray-500 font-normal">
              ({displayRowsWithBalance.length} transaksi {!isAllMonths ? `di bulan ${formatMonthLabel(selectedMonth)}` : "keseluruhan"})
            </span>
          </div>
          <button
            onClick={loadTransactions}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[520px] rounded-b-xl border-t border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200/80 sticky top-0 z-10 shadow-xs">
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
              {/* BARIS SALDO AWAL BULAN OTOMATIS (Ditampilkan jika spesifik bulan aktif/terpilih) */}
              {!isAllMonths && (
                <tr className="bg-slate-50/90 font-medium border-b-2 border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-bold text-indigo-700">📌</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {selectedMonth}-01
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>Saldo Awal Bulan</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                        Bawaan {previousMonthLabel || "Bulan Sebelumnya"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-slate-200 text-slate-800 border border-slate-300">
                      Saldo Awal
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-right text-emerald-700 whitespace-nowrap font-mono">
                    {startingBalance >= 0 ? `+Rp ${startingBalance.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-right text-rose-700 whitespace-nowrap font-mono">
                    {startingBalance < 0 ? `-Rp ${Math.abs(startingBalance).toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-extrabold text-right text-blue-900 whitespace-nowrap font-mono bg-blue-50/30">
                    Rp {startingBalance.toLocaleString("id-ID")}
                  </td>
                  {isEditMode && (
                    <td className="px-5 py-3.5 text-center text-xs text-gray-400 italic">
                      Sistem
                    </td>
                  )}
                </tr>
              )}

              {/* BARIS DAFTAR TRANSAKSI BULAN TERPILIH */}
              {displayRowsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? 8 : 7} className="px-5 py-8 text-center text-gray-400 text-sm">
                    {!isAllMonths
                      ? `Belum ada catatan kas untuk bulan ${formatMonthLabel(selectedMonth)}. Anda dapat mencatat lewat Tambah Manual, Suara, Scan Buku Kas, atau PDF to Data.`
                      : "Belum ada transaksi kas tersimpan."}
                  </td>
                </tr>
              ) : (
                displayRowsWithBalance.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {item.source === "MANUAL" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                            Manual
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
                    <td className="px-5 py-4 text-sm font-bold text-right text-gray-900 whitespace-nowrap bg-gray-50/50">
                      Rp {item.balance.toLocaleString("id-ID")}
                    </td>
                    {isEditMode && (
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingEntry(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit baris"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(item.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50/95 border-t-2 border-gray-300 font-semibold text-xs text-gray-700 sticky bottom-0 z-10 shadow-md">
              {!isAllMonths ? (
                <>
                  {/* Baris 1: Transaksi Berjalan Bulan Ini */}
                  <tr className="border-b border-gray-200 text-gray-500 text-[11px]">
                    <td colSpan={4} className="px-5 py-2 text-right uppercase tracking-wider font-semibold">
                      Total Transaksi Berjalan Bulan Ini ({displayRowsWithBalance.length} Transaksi):
                    </td>
                    <td className="px-5 py-2 text-right text-emerald-600 font-mono font-semibold">
                      +Rp {(totalModal + totalKasMasuk).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-2 text-right text-rose-600 font-mono font-semibold">
                      -Rp {totalPengeluaran.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-2 text-right text-slate-600 font-mono">
                      {((totalModal + totalKasMasuk) - totalPengeluaran >= 0 ? "+" : "")}Rp {((totalModal + totalKasMasuk) - totalPengeluaran).toLocaleString("id-ID")}
                    </td>
                    {isEditMode && <td className="px-5 py-2"></td>}
                  </tr>

                  {/* Baris 2: TOTAL AKUMULASI DEBET & KREDIT (TERMASUK SALDO AWAL BULAN) */}
                  <tr className="bg-indigo-50/70 text-gray-900 font-bold border-t border-indigo-200">
                    <td colSpan={4} className="px-5 py-3.5 text-right uppercase tracking-wider text-xs font-extrabold text-indigo-950">
                      Total Akumulasi Debet &amp; Kredit (Termasuk Saldo Awal):
                    </td>
                    <td className="px-5 py-3.5 text-right text-emerald-700 font-mono font-extrabold text-sm whitespace-nowrap bg-emerald-50/40">
                      +Rp {totalDebetWithStarting.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5 text-right text-rose-700 font-mono font-extrabold text-sm whitespace-nowrap bg-rose-50/40">
                      {totalKreditWithStarting > 0 ? `-Rp ${totalKreditWithStarting.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-blue-900 font-mono font-black text-base whitespace-nowrap bg-blue-100/60">
                      Rp {saldoKas.toLocaleString("id-ID")}
                    </td>
                    {isEditMode && <td className="px-5 py-3.5"></td>}
                  </tr>
                </>
              ) : (
                <tr className="bg-blue-50/60 font-bold">
                  <td colSpan={4} className="px-5 py-3.5 text-right uppercase tracking-wider font-bold">
                    Total Kas Keseluruhan Usaha:
                  </td>
                  <td className="px-5 py-3.5 text-right text-emerald-600 font-mono font-bold text-sm">
                    +Rp {(totalModal + totalKasMasuk).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-right text-rose-600 font-mono font-bold text-sm">
                    -Rp {totalPengeluaran.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-right text-blue-900 font-mono font-extrabold text-sm bg-blue-50/50">
                    Rp {saldoKas.toLocaleString("id-ID")}
                  </td>
                  {isEditMode && <td className="px-5 py-3.5"></td>}
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL: SPEECH TO TEXT (SUARA AI)                      */}
      {/* ========================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col transition-all ${
            voicePhase === "record" ? "max-w-md" : "max-w-3xl max-h-[90vh]"
          }`}>

            {/* ── HEADER ── */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {voicePhase === "record" ? "Pencatatan Suara" : "Tabel Preview"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {voicePhase === "record"
                      ? "Silahkan bacakan aktivitas transaksi pada hari ini"
                      : `${voiceItems.length} transaksi terdeteksi. Periksa, edit tabel, atau hapus sebelum disimpan.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  voicePhase === "record" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {voicePhase === "record" ? "● REKAM" : `✓ REVIEW (${voiceItems.length})`}
                </span>
                <button
                  onClick={() => {
                    setIsVoiceModalOpen(false);
                    setVoicePhase("record");
                    setVoiceTranscript("");
                    setVoiceItems([]);
                    if (isRecording) speechService.stop();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/* PHASE 1 — RECORD: Mic button + live transcript */}
            {/* ══════════════════════════════════════════════ */}
            {voicePhase === "record" && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative flex items-center justify-center">
                    {isRecording && (
                      <div className="absolute w-24 h-24 rounded-full bg-rose-200 animate-ping opacity-40" />
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                        isRecording
                          ? "bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-300/50 scale-110"
                          : "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/30 hover:scale-105"
                      }`}
                      title={isRecording ? "Klik untuk jeda rekaman" : "Klik untuk mulai / lanjut bicara"}
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 h-7">
                    {[40, 70, 100, 60, 90, 45, 80, 55, 95, 30, 75, 60].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: isRecording ? `${h}%` : "20%" }}
                        className={`w-1 rounded-full transition-all duration-300 ${isRecording ? "bg-rose-500 animate-pulse" : "bg-gray-300"}`}
                      />
                    ))}
                  </div>

                  <div className="text-center px-4">
                    {isRecording ? (
                      <div>
                        <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5">
                          <Volume2 className="w-4 h-4 animate-pulse" />
                          <span>Sedang Merekam Suara...</span>
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Bicara santai. Berhenti/jeda tidak akan memutus rekaman.
                        </p>
                      </div>
                    ) : voiceTranscript ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          Rekaman dijeda. Tekan mic untuk lanjut bicara menyambung teks, atau buka tabel:
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          Tekan mikrofon untuk mulai bicara
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Teks akan otomatis tersambung tanpa hilang saat jeda
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transkrip langsung */}
                {(voiceTranscript || isRecording) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Transkrip Suara (Tersambung Otomatis):
                      </label>
                      {voiceTranscript && (
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceTranscript("");
                            setVoiceItems([]);
                            speechService.reset();
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 underline font-medium"
                        >
                          Hapus &amp; Reset Transkrip
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={voiceTranscript}
                      onChange={(e) => {
                        setVoiceTranscript(e.target.value);
                        syncVoiceTranscriptToItems(e.target.value);
                      }}
                      placeholder="Hasil rekaman suara akan tersambung di sini..."
                      className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none overflow-y-auto max-h-28"
                    />
                  </div>
                )}

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceModalOpen(false);
                      setVoicePhase("record");
                      setVoiceTranscript("");
                      setVoiceItems([]);
                      speechService.stop();
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Batal
                  </button>

                  {/* Tombol Selesai Bicara & Lihat Tabel */}
                  {voiceTranscript.trim() && (
                    <button
                      type="button"
                      onClick={handleFinishRecordingAndReview}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-300 transition-all"
                    >
                      <span>{isRecording ? "⏹️ Selesai & Buka Tabel" : "Lihat Tabel Preview"} ({voiceItems.length || 1})</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* PHASE 2 — REVIEW: Tabel Preview Sementara + Edit & Confirm */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {voicePhase === "review" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                  
                  {/* Banner & Transcript Header */}
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Transkrip Suara (Bisa diedit & di-parse ulang):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => syncVoiceTranscriptToItems(voiceTranscript)}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg font-semibold transition-colors flex items-center gap-1"
                          title="Deteksi ulang tabel dari perubahan teks transkrip"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Parse Ulang Teks</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoicePhase("record")}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold transition-colors"
                        >
                          ← Rekam Ulang
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                  </div>

                  {/* Tabel Preview Sementara */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Tabel Preview Transaksi Sementara ({voiceItems.length} Baris)
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Klik kolom untuk mengedit langsung
                      </span>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-gray-100/90 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10 shadow-xs">
                          <tr>
                            <th className="px-3 py-2.5 w-10 text-center">No</th>
                            <th className="px-3 py-2.5 w-32">Tanggal</th>
                            <th className="px-3 py-2.5 min-w-[180px]">Keterangan Transaksi</th>
                            <th className="px-3 py-2.5 w-32">Jenis Kas</th>
                            <th className="px-3 py-2.5 w-32">Kategori</th>
                            <th className="px-3 py-2.5 w-36 text-right">Nominal (Rp)</th>
                            <th className="px-3 py-2.5 w-12 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {voiceItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">
                                Tidak ada baris transaksi. Klik tombol <strong className="text-purple-600">+ Tambah Baris</strong> atau rekam ulang suara.
                              </td>
                            </tr>
                          ) : (
                            voiceItems.map((item, index) => (
                              <tr key={item.id} className="hover:bg-purple-50/20 transition-colors">
                                <td className="px-3 py-2.5 text-center font-mono text-gray-400">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="date"
                                    value={item.date}
                                    onChange={(e) => handleUpdateVoiceItem(item.id, "date", e.target.value)}
                                    className="w-full px-2 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-purple-400"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleUpdateVoiceItem(item.id, "description", e.target.value)}
                                    placeholder="Keterangan transaksi..."
                                    className="w-full px-2.5 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-900 font-medium focus:ring-2 focus:ring-purple-400 transition-colors"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    value={item.type}
                                    onChange={(e) => handleUpdateVoiceItem(item.id, "type", e.target.value as any)}
                                    className={`w-full px-2 py-1.5 border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-400 ${
                                      item.type === "Masuk"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : item.type === "Modal"
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-rose-50 text-rose-800 border-rose-200"
                                    }`}
                                  >
                                    <option value="Keluar">🔴 Pengeluaran</option>
                                    <option value="Masuk">🟢 Kas Masuk</option>
                                    <option value="Modal">🟡 Modal</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    value={item.category}
                                    onChange={(e) => handleUpdateVoiceItem(item.id, "category", e.target.value as any)}
                                    className="w-full px-2 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-purple-400"
                                  >
                                    <option value="Operasional">Operasional</option>
                                    <option value="Bahan Baku">Bahan Baku</option>
                                    <option value="Penjualan">Penjualan</option>
                                    <option value="Gaji">Gaji</option>
                                    <option value="Lainnya">Lainnya</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="relative flex items-center">
                                    <span className="absolute left-2.5 text-[11px] text-gray-400 font-semibold pointer-events-none">
                                      Rp
                                    </span>
                                    <input
                                      type="number"
                                      value={item.amount || ""}
                                      onChange={(e) => handleUpdateVoiceItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                                      placeholder="0"
                                      className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 text-right focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVoiceItem(item.id)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Hapus baris ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Bottom Action & Summary */}
                    <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleAddVoiceItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris Transaksi</span>
                      </button>

                      {voiceItems.length > 0 && (
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <span className="text-emerald-700 font-semibold">
                            Total Masuk: Rp {voiceItems
                              .filter((it) => it.type === "Masuk" || it.type === "Modal")
                              .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
                              .toLocaleString("id-ID")}
                          </span>
                          <span className="text-rose-700 font-semibold">
                            Total Keluar: Rp {voiceItems
                              .filter((it) => it.type === "Keluar")
                              .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
                              .toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVoiceModalOpen(false);
                        setVoicePhase("record");
                        setVoiceTranscript("");
                        setVoiceItems([]);
                        if (isRecording) speechService.stop();
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoicePhase("record")}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                      ← Rekam Ulang
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmVoice}
                    disabled={submitting || voiceItems.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Konfirmasi &amp; Simpan Semua ({voiceItems.length} Transaksi)</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}      {/* ========================================================= */}
      {/* 2. MODAL: OCR SCAN BUKU KAS FISIK (MULTI-TRANSAKSI PREVIEW) */}
      {/* ========================================================= */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-all ${
              ocrPhase === "upload" ? "max-w-xl" : "max-w-4xl max-h-[90vh] flex flex-col"
            }`}
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {ocrPhase === "upload" ? "OCR Scanner Buku Kas Fisik" : "Tabel Preview Buku Kas (OCR)"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {ocrPhase === "upload"
                      ? "Foto lembar catatan buku kas fisik Anda untuk diekstrak otomatis jadi tabel digital"
                      : `${ocrItems.length} transaksi terdeteksi. Periksa, edit tabel, atau tambah baris sebelum disimpan.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ocrPhase === "review" && (
                  <span className="text-[11px] px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    ✓ REVIEW ({ocrItems.length})
                  </span>
                )}
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
            </div>

            {/* FASE 1: UPLOAD / KAMERA */}
            {ocrPhase === "upload" && (
              <div>
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
                      <span>Upload Lembar Buku Kas</span>
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

                <div className="p-6 space-y-4">
                  {ocrProcessing && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">{ocrStatusText || "Sedang memindai buku kas via OCR..."}</span>
                    </div>
                  )}

                  {ocrTab === "upload" ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-2xl p-6 text-center transition-colors">
                        <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm">Pilih / Foto Lembar Buku Catatan Kas</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          Mendukung foto lembar buku kas catatan tangan atau cetak tabel BKU (JPG, PNG, WEBP).
                        </p>
                        <label className="mt-4 inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-200 transition-all">
                          Pilih File Foto Buku Kas
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

                      {/* Tombol Contoh Cepat untuk Kemudahan Pengguna */}
                      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Mau coba tanpa foto fisik?</p>
                          <p className="text-[11px] text-gray-500">Gunakan format contoh catatan buku kas UMKM</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUseSampleCashbook}
                          className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 text-xs font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          Coba Contoh Buku Kas
                        </button>
                      </div>
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
                        <Sparkles className="w-3.5 h-3.5" /> Ambil Foto Lembar Buku Kas
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
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
                </div>
              </div>
            )}

            {/* FASE 2: TABEL PREVIEW SEMENTARA BUKU KAS (MULTI-TRANSAKSI REVIEW) */}
            {ocrPhase === "review" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Card Transkrip OCR Mentah */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Teks Hasil Scan Lembar Buku Kas (Bisa Diedit &amp; Di-parse Ulang):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleReparseOcrText}
                          className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg shadow-sm"
                          title="Parse ulang teks menjadi baris tabel"
                        >
                          <RefreshCw className="w-3 h-3" /> Parse Ulang Teks
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrPhase("upload")}
                          className="text-xs text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          ← Foto Ulang
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={ocrRawText}
                      onChange={(e) => setOcrRawText(e.target.value)}
                      placeholder="Teks baris buku kas..."
                      className="w-full h-24 p-2.5 bg-white border border-indigo-200 rounded-lg text-xs font-mono text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>

                  {/* Header Tabel Preview */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        TABEL PREVIEW TRANSAKSI SEMENTARA ({ocrItems.length} BARIS)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">Klik kolom untuk mengedit langsung</span>
                  </div>

                  {/* Tabel Preview Baris */}
                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-72 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No</th>
                          <th className="p-2.5 w-36">Tanggal</th>
                          <th className="p-2.5 min-w-[200px]">Keterangan Transaksi</th>
                          <th className="p-2.5 w-36">Jenis Kas</th>
                          <th className="p-2.5 w-32">Kategori</th>
                          <th className="p-2.5 w-36 text-right">Nominal (Rp)</th>
                          <th className="p-2.5 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ocrItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                            <td className="p-2 text-center text-gray-500 font-medium">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => handleUpdateOcrItem(item.id, "date", e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateOcrItem(item.id, "description", e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-indigo-500"
                                placeholder="Keterangan transaksi..."
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={item.type}
                                onChange={(e) => handleUpdateOcrItem(item.id, "type", e.target.value as any)}
                                className={`w-full px-2 py-1 rounded-lg text-xs font-bold border ${
                                  item.type === "Masuk"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : item.type === "Modal"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                <option value="Masuk">🟢 Kas Masuk</option>
                                <option value="Keluar">🔴 Pengeluaran</option>
                                <option value="Modal">🔵 Modal Usaha</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdateOcrItem(item.id, "category", e.target.value as any)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                              >
                                <option value="Penjualan">Penjualan</option>
                                <option value="Bahan Baku">Bahan Baku</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Gaji">Gaji</option>
                                <option value="Modal">Modal</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-400 text-xs">Rp</span>
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) =>
                                    handleUpdateOcrItem(item.id, "amount", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 text-right focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteOcrItem(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tombol Tambah Baris */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleAddOcrItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-semibold transition-colors border border-indigo-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Transaksi</span>
                    </button>

                    {/* Ringkasan Nominal */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        Total Masuk:{" "}
                        <strong className="text-emerald-600">
                          Rp{" "}
                          {ocrItems
                            .filter((it) => it.type === "Masuk" || it.type === "Modal")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                      <span className="text-gray-600">
                        Total Keluar:{" "}
                        <strong className="text-rose-600">
                          Rp{" "}
                          {ocrItems
                            .filter((it) => it.type === "Keluar")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Modal Review */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOcrModalOpen(false);
                        setOcrPhase("upload");
                        setOcrRawText("");
                        setOcrItems([]);
                        stopCamera();
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => setOcrPhase("upload")}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                      ← Foto / Scan Ulang
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmOcrBatch}
                    disabled={submitting || ocrItems.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Konfirmasi &amp; Simpan Semua ({ocrItems.length} Transaksi)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 3. MODAL: PDF TO DATA (MULTI-TRANSAKSI PREVIEW SEMENTARA) */}
      {/* ========================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-all ${
              pdfPhase === "upload" ? "max-w-xl" : "max-w-4xl max-h-[90vh] flex flex-col"
            }`}
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {pdfPhase === "upload" ? "PDF to Data (Mutasi & Invoice)" : "Tabel Preview Mutasi PDF"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {pdfPhase === "upload"
                      ? "Ekstraksi berkas PDF rekening koran bank atau faktur ke data kas digital"
                      : `${pdfItems.length} transaksi terdeteksi dari dokumen PDF. Periksa, edit tabel, atau tambah baris sebelum disimpan.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pdfPhase === "review" && (
                  <span className="text-[11px] px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    ✓ REVIEW ({pdfItems.length})
                  </span>
                )}
                <button onClick={() => setIsPdfModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* FASE 1: UPLOAD DOKUMEN PDF */}
            {pdfPhase === "upload" && (
              <div className="p-6 space-y-4">
                {/* Dropzone */}
                <div className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/20 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Upload Dokumen PDF Rekening Koran / Invoice</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Mendukung Rekening Koran BCA, Mandiri, BRI, BNI, Bank Jago, atau Faktur Pembelian PDF.
                  </p>
                  <label className="mt-4 inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-rose-200 transition-all">
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

                {/* Tombol Contoh Demo Cepat */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Tidak punya dokumen PDF saat ini?</p>
                    <p className="text-[11px] text-gray-500">Coba ekstraksi contoh rekening koran bank demo</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseSamplePdf}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-rose-50 hover:text-rose-700 text-gray-700 text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Coba Contoh Mutasi Bank
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* FASE 2: TABEL PREVIEW SEMENTARA TRANSAKSI PDF */}
            {pdfPhase === "review" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Info File & Tombol Upload Ulang */}
                  <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-semibold text-rose-900">
                        Dokumen: {pdfFileName || "Mutasi_Rekening_Bank.pdf"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfPhase("upload")}
                      className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      ← Upload Dokumen Lain
                    </button>
                  </div>

                  {/* Header Tabel Preview */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        TABEL PREVIEW TRANSAKSI PDF ({pdfItems.length} BARIS)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">Klik kolom untuk mengedit langsung</span>
                  </div>

                  {/* Tabel Preview Baris */}
                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-72 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No</th>
                          <th className="p-2.5 w-36">Tanggal</th>
                          <th className="p-2.5 min-w-[200px]">Keterangan Transaksi</th>
                          <th className="p-2.5 w-36">Jenis Kas</th>
                          <th className="p-2.5 w-32">Kategori</th>
                          <th className="p-2.5 w-36 text-right">Nominal (Rp)</th>
                          <th className="p-2.5 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pdfItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                            <td className="p-2 text-center text-gray-500 font-medium">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => handleUpdatePdfItem(item.id, "date", e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:ring-1 focus:ring-rose-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdatePdfItem(item.id, "description", e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-rose-500"
                                placeholder="Keterangan transaksi..."
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={item.type}
                                onChange={(e) => handleUpdatePdfItem(item.id, "type", e.target.value as any)}
                                className={`w-full px-2 py-1 rounded-lg text-xs font-bold border ${
                                  item.type === "Masuk"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : item.type === "Modal"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                <option value="Masuk">🟢 Kas Masuk (CR)</option>
                                <option value="Keluar">🔴 Pengeluaran (DB)</option>
                                <option value="Modal">🔵 Modal Usaha</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdatePdfItem(item.id, "category", e.target.value as any)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                              >
                                <option value="Penjualan">Penjualan</option>
                                <option value="Bahan Baku">Bahan Baku</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Gaji">Gaji</option>
                                <option value="Modal">Modal</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-400 text-xs">Rp</span>
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) =>
                                    handleUpdatePdfItem(item.id, "amount", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 text-right focus:ring-1 focus:ring-rose-500"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeletePdfItem(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tombol Tambah Baris & Ringkasan */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleAddNewPdfRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold transition-colors border border-rose-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Transaksi</span>
                    </button>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        Total Masuk (CR):{" "}
                        <strong className="text-emerald-600">
                          Rp{" "}
                          {pdfItems
                            .filter((it) => it.type === "Masuk" || it.type === "Modal")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                      <span className="text-gray-600">
                        Total Keluar (DB):{" "}
                        <strong className="text-rose-600">
                          Rp{" "}
                          {pdfItems
                            .filter((it) => it.type === "Keluar")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Modal Review PDF */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPdfModalOpen(false);
                        setPdfPhase("upload");
                        setPdfItems([]);
                        setPdfFileName("");
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfPhase("upload")}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                      ← Upload Ulang
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPdfBatch}
                    disabled={submitting || pdfItems.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Konfirmasi &amp; Simpan Semua ({pdfItems.length} Transaksi)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: TAMBAH MANUAL (DRAFT & TABEL PREVIEW SEMENTARA)  */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-all ${
              manualPhase === "input" ? "max-w-lg" : "max-w-4xl max-h-[90vh] flex flex-col"
            }`}
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {manualPhase === "input" ? "Tambah Catatan Kas Manual" : "Tabel Preview Transaksi Manual"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {manualPhase === "input"
                      ? "Isi form catatan kas atau langsung masukkan ke tabel preview sementara"
                      : `${manualItems.length} draft transaksi disiapkan. Periksa, edit tabel, atau tambah baris sebelum disimpan.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {manualPhase === "review" && (
                  <span className="text-[11px] px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                    DRAFT ({manualItems.length})
                  </span>
                )}
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* FASE 1: INPUT FORM CATATAN MANUAL */}
            {manualPhase === "input" && (
              <form onSubmit={handleAddManualDraft} className="p-6 space-y-4">
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

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setManualPhase("review");
                      if (manualItems.length === 0) {
                        handleAddNewManualRow();
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Buka Tabel Draft Langsung
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-200 flex items-center gap-1.5"
                    >
                      <span>+ Masukkan ke Tabel Preview</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FASE 2: TABEL PREVIEW SEMENTARA TRANSAKSI MANUAL */}
            {manualPhase === "review" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Header Sub & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        TABEL PREVIEW TRANSAKSI MANUAL ({manualItems.length} BARIS DRAFT)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">Klik kolom untuk mengedit langsung</span>
                  </div>

                  {/* Tabel Preview Baris */}
                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-72 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No</th>
                          <th className="p-2.5 w-36">Tanggal</th>
                          <th className="p-2.5 min-w-[200px]">Keterangan Transaksi</th>
                          <th className="p-2.5 w-36">Jenis Kas</th>
                          <th className="p-2.5 w-32">Kategori</th>
                          <th className="p-2.5 w-36 text-right">Nominal (Rp)</th>
                          <th className="p-2.5 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {manualItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-2 text-center text-gray-500 font-medium">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => handleUpdateManualItem(item.id, "date", e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateManualItem(item.id, "description", e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-blue-500"
                                placeholder="Keterangan transaksi..."
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={item.type}
                                onChange={(e) => handleUpdateManualItem(item.id, "type", e.target.value as any)}
                                className={`w-full px-2 py-1 rounded-lg text-xs font-bold border ${
                                  item.type === "Masuk"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : item.type === "Modal"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                <option value="Masuk">🟢 Kas Masuk</option>
                                <option value="Keluar">🔴 Pengeluaran</option>
                                <option value="Modal">🔵 Modal Usaha</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdateManualItem(item.id, "category", e.target.value as any)}
                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                              >
                                <option value="Penjualan">Penjualan</option>
                                <option value="Bahan Baku">Bahan Baku</option>
                                <option value="Operasional">Operasional</option>
                                <option value="Gaji">Gaji</option>
                                <option value="Modal">Modal</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-400 text-xs">Rp</span>
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) =>
                                    handleUpdateManualItem(item.id, "amount", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 text-right focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteManualItem(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tombol Tambah Baris & Ringkasan */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleAddNewManualRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold transition-colors border border-blue-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Transaksi Manual</span>
                    </button>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        Total Masuk:{" "}
                        <strong className="text-emerald-600">
                          Rp{" "}
                          {manualItems
                            .filter((it) => it.type === "Masuk" || it.type === "Modal")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                      <span className="text-gray-600">
                        Total Keluar:{" "}
                        <strong className="text-rose-600">
                          Rp{" "}
                          {manualItems
                            .filter((it) => it.type === "Keluar")
                            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                            .toLocaleString("id-ID")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Modal Review Manual */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setManualPhase("input");
                        setManualItems([]);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualPhase("input")}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                      ← Tambah Input Lagi
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmManualBatch}
                    disabled={submitting || manualItems.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Konfirmasi &amp; Simpan Semua ({manualItems.length} Transaksi)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
