// frontend/src/services/speechService.ts

export interface ParsedSpeechFinancial {
  rawTranscript: string;
  type: 'MASUK' | 'KELUAR' | 'MODAL';
  category: 'Bahan Baku' | 'Operasional' | 'Gaji' | 'Penjualan' | 'Lainnya';
  amount: number;
  description: string;
  date?: string; // Format: YYYY-MM-DD
}

const MONTHS_MAP: Record<string, string> = {
  januari: '01', jan: '01',
  februari: '02', feb: '02',
  maret: '03', mar: '03',
  april: '04', apr: '04',
  mei: '05',
  juni: '06', jun: '06',
  juli: '07', jul: '07',
  agustus: '08', agu: '08', agt: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10',
  november: '11', nov: '11',
  desember: '12', des: '12',
};

// Helper to extract Indonesian date and remove date expression from text so numbers aren't treated as amounts
export function extractDateAndClean(text: string): { extractedDate: string | null; cleanedText: string } {
  const dateRegex = /\b(?:pada\s+)?(?:tanggal|tgl)?\s*(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|agt|sep|okt|nov|des)(?:\s+(\d{4}))?\b/i;
  const match = dateRegex.exec(text);

  if (!match) {
    return { extractedDate: null, cleanedText: text };
  }

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const month = MONTHS_MAP[monthName] || '10';
  let year = new Date().getFullYear(); // e.g. 2026

  if (match[3]) {
    const parsedYear = parseInt(match[3], 10);
    // Speech Recognition frequently hears "dua ribu dua enam" (2026) as 2006
    if (parsedYear === 2006) {
      year = 2026;
    } else {
      year = parsedYear;
    }
  }

  const dayFormatted = String(day).padStart(2, '0');
  const extractedDate = `${year}-${month}-${dayFormatted}`;

  // Remove the date substring from the segment
  const cleanedText = (text.slice(0, match.index) + ' ' + text.slice(match.index + match[0].length))
    .replace(/\s+/g, ' ')
    .trim();

  return { extractedDate, cleanedText };
}

// Helper to convert Indonesian number words to numeric values
export function indonesianWordsToNumber(text: string): number {
  const raw = text.toLowerCase();

  // ── STEP 0: Indonesian dot-thousand format BEFORE stripping dots ──
  // e.g. "26.000" -> 26000 | "1.500.000" -> 1500000 | "850.000" -> 850000
  const idThousandMatch = raw.match(/\b(\d{1,3}(?:\.\d{3})+)\b/);
  if (idThousandMatch) {
    const num = parseInt(idThousandMatch[1].replace(/\./g, ''), 10);
    if (num > 0) return num;
  }

  // ── STEP 1: Handle shorthand suffixes on original text BEFORE stripping ──
  // e.g. "26.5jt" -> 26500000 | "850rb" -> 850000 | "2.5jt" -> 2500000
  const shortMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i);
  if (shortMatch) {
    return Math.round(parseFloat(shortMatch[1].replace(',', '.')) * 1000000);
  }
  const rbMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)\b/i);
  if (rbMatch) {
    return Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
  }
  const rpMatch = raw.match(/\brp\.?\s*([\d.,]+)/i);
  if (rpMatch) {
    const cleaned = rpMatch[1].replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    if (val > 0) return Math.round(val);
  }

  const clean = raw.replace(/[,.]/g, ' ');

  // Plain digits (4+ digits) after dot-stripping
  const plainMatch = clean.match(/\b(\d{4,})\b/);
  if (plainMatch) {
    const val = parseInt(plainMatch[1], 10);
    if (val > 0) return val;
  }

  // Word-based number parsing in Indonesian
  const words = clean.split(/\s+/);
  const numMap: Record<string, number> = {
    satu: 1, se: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
    sebelas: 11, duabelas: 12, tigabelas: 13, empatbelas: 14, limabelas: 15,
    enambelas: 16, tujuhbelas: 17, delapanbelas: 18, sembilanbelas: 19,
    puluh: 10,
    seratus: 100, ratus: 100,
    seribu: 1000, ribu: 1000,
    sejuta: 1000000, juta: 1000000,
  };

  let total = 0;
  let current = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (numMap[w] !== undefined) {
      const val = numMap[w];
      if (w === 'juta' || w === 'sejuta') {
        current = (current === 0 ? 1 : current) * 1000000;
        total += current;
        current = 0;
      } else if (w === 'ribu' || w === 'seribu') {
        current = (current === 0 ? 1 : current) * 1000;
        total += current;
        current = 0;
      } else if (w === 'ratus' || w === 'seratus') {
        current = (current === 0 ? 1 : current) * 100;
      } else if (w === 'puluh') {
        current = (current === 0 ? 1 : current) * 10;
      } else if (w === 'belas') {
        current += 10;
      } else {
        current += val;
      }
    }
  }
  total += current;

  return total > 0 ? total : 0;
}

// Single phrase parser
export function parseFinancialSpeech(transcript: string): ParsedSpeechFinancial {
  // First: extract date and strip date text so year/day numbers don't collide with monetary amounts!
  const { extractedDate, cleanedText } = extractDateAndClean(transcript);
  const t = cleanedText.toLowerCase();

  // 1. Determine Type
  let type: 'MASUK' | 'KELUAR' | 'MODAL' = 'KELUAR';
  if (t.includes('modal') || t.includes('investasi') || t.includes('setor modal')) {
    type = 'MODAL';
  } else if (
    t.includes('jual') || t.includes('laku') || t.includes('omzet') || 
    t.includes('terima') || t.includes('masuk') || t.includes('pemasukan') || 
    t.includes('pendapatan') || t.includes('pas masuk') || t.includes('kas masuk') ||
    t.includes('pelanggan bayar')
  ) {
    type = 'MASUK';
  } else {
    type = 'KELUAR';
  }

  // 2. Determine Category
  let category: ParsedSpeechFinancial['category'] = 'Operasional';
  if (type === 'MODAL') {
    category = 'Lainnya';
  } else if (type === 'MASUK') {
    category = 'Penjualan';
  } else if (t.includes('gaji') || t.includes('upah') || t.includes('karyawan') || t.includes('pegawai')) {
    category = 'Gaji';
  } else if (
    t.includes('bahan') || t.includes('kopi') || t.includes('susu') || t.includes('cup') ||
    t.includes('sedotan') || t.includes('kemasan') || t.includes('plastik') || t.includes('tepung') ||
    t.includes('beras') || t.includes('telur') || t.includes('minyak') || t.includes('bumbu') ||
    t.includes('ayam') || t.includes('daging') || t.includes('sayur') || t.includes('roti')
  ) {
    category = 'Bahan Baku';
  } else if (
    t.includes('listrik') || t.includes('pln') || t.includes('pdam') || t.includes('air') ||
    t.includes('wifi') || t.includes('internet') || t.includes('sewa') || t.includes('bensin') ||
    t.includes('ongkir') || t.includes('pulsa') || t.includes('parkir') || t.includes('jalan') ||
    t.includes('galon') || t.includes('gas') || t.includes('kebersihan') || t.includes('keamanan') ||
    t.includes('utilitas') || t.includes('perlengkapan')
  ) {
    category = 'Operasional';
  }

  // 3. Extract Amount from cleanedText (without date numbers!)
  const amount = indonesianWordsToNumber(cleanedText);

  // 4. Clean Description (strip numbers, currencies, and boilerplate keywords)
  let description = cleanedText
    .replace(/\brp\.?\s*[\d.,]+/gi, '')
    .replace(/\b\d{1,3}(?:\.\d{3})+\b/g, '')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)\b/gi, '')
    .replace(/\b\d{4,}\b/g, '')
    .replace(/\b(catat|masukkan|tulis|transaksi|pengeluaran|pemasukan|total|sebesar|rupiah|rp|keterangan|kategori|pas masuk|kas masuk|kas keluar)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description) {
    description = type === 'MASUK' ? 'Penjualan Usaha Harian' : `Pengeluaran ${category}`;
  } else {
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return {
    rawTranscript: transcript,
    type,
    category,
    amount: amount || 0,
    description,
    date: extractedDate || undefined,
  };
}

// Helper to find amount positions in a text
function findAmountSpans(text: string): Array<{ start: number; end: number; val: string }> {
  const raw = text.toLowerCase();
  const spans: Array<{ start: number; end: number; val: string }> = [];
  const patterns = [
    /\brp\.?\s*[\d.,]+/gi,
    /\b\d{1,3}(?:\.\d{3})+\b/g,
    /\b\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)\b/gi,
    /\b\d{4,}\b/g,
  ];

  for (const pat of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(raw)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, val: m[0] });
    }
  }

  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const nonOverlapping: Array<{ start: number; end: number; val: string }> = [];
  let lastEnd = -1;
  for (const s of spans) {
    if (s.start >= lastEnd) {
      nonOverlapping.push(s);
      lastEnd = s.end;
    }
  }
  return nonOverlapping;
}

// Multiple transactions parser for speech recognition
export function parseMultipleFinancialSpeech(transcript: string): ParsedSpeechFinancial[] {
  const t = transcript.trim();
  if (!t) return [];

  // Check if multiple dates exist (e.g. "tanggal 28 Oktober ... tanggal 28 Oktober ... tanggal 29 Oktober ...")
  const dateStarts: number[] = [];
  const dateRegexGlobal = /\b(?:pada\s+)?(?:tanggal|tgl)\s+\d{1,2}\s+[a-z]+/gi;
  let dMatch: RegExpExecArray | null;
  while ((dMatch = dateRegexGlobal.exec(t)) !== null) {
    dateStarts.push(dMatch.index);
  }

  const rawSegments: string[] = [];

  if (dateStarts.length > 1) {
    // Split explicitly at date boundaries!
    for (let i = 0; i < dateStarts.length; i++) {
      const startI = dateStarts[i];
      const endI = i + 1 < dateStarts.length ? dateStarts[i + 1] : t.length;
      const seg = t.slice(startI, endI).trim();
      if (seg) rawSegments.push(seg);
    }
  } else {
    // 1. Split by line breaks or semicolons
    const lines = t.split(/[\r\n;]+/).map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Split by comma, dot followed by space, or Indonesian conjunctions
      const parts = line.split(/(?:[,\.]\s+|\s+(?:terus|lalu|kemudian|sama(?:\s+juga)?|dan\s+juga|berikutnya|setelah\s+itu)\s+)/i);
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed) rawSegments.push(trimmed);
      }
    }
  }

  // 2. Check each segment if it still contains multiple amounts
  // (e.g. "jalan 54.000 buat operasional Rp75.000 parkir but operasional")
  const finalSegments: string[] = [];
  const keywords = new Set([
    'beli', 'bayar', 'jual', 'parkir', 'bensin', 'ongkir', 'makan', 'minum', 'gaji', 
    'belanja', 'pemasukan', 'pengeluaran', 'terima', 'modal', 'jalan', 'pulsa', 'listrik', 
    'sewa', 'air', 'wifi', 'galon', 'gas'
  ]);

  for (const seg of rawSegments) {
    // First remove any date before checking amount spans, so date numbers don't trigger multi-amount splits
    const { cleanedText: segNoDate } = extractDateAndClean(seg);
    const spans = findAmountSpans(segNoDate);
    if (spans.length <= 1) {
      finalSegments.push(seg);
    } else {
      let lastIdx = 0;
      for (let i = 0; i < spans.length - 1; i++) {
        const curEnd = spans[i].end;
        const nextStart = spans[i + 1].start;
        const between = segNoDate.slice(curEnd, nextStart);
        let splitAt = nextStart;

        const wordMatches = Array.from(between.matchAll(/\b\w+\b/g));
        for (const wm of wordMatches) {
          if (keywords.has(wm[0].toLowerCase())) {
            splitAt = curEnd + (wm.index ?? 0);
            break;
          }
        }

        const part = segNoDate.slice(lastIdx, splitAt).trim();
        if (part) finalSegments.push(part);
        lastIdx = splitAt;
      }
      const lastPart = segNoDate.slice(lastIdx).trim();
      if (lastPart) finalSegments.push(lastPart);
    }
  }

  // Parse each segment
  const results: ParsedSpeechFinancial[] = [];
  for (const s of finalSegments) {
    const item = parseFinancialSpeech(s);
    if (item.amount > 0) {
      results.push(item);
    }
  }

  // Fallback if no items with amount > 0 were parsed
  if (results.length === 0) {
    const single = parseFinancialSpeech(t);
    if (single.amount > 0) {
      results.push(single);
    }
  }

  return results;
}

class SpeechService {
  private recognition: any = null;
  private isIntentionallyListening = false;
  private baseTranscript = '';
  private currentFinalTranscript = '';
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private restartTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'id-ID'; // Bahasa Indonesia
        this.setupListeners();
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  private setupListeners(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          sessionFinal += res[0].transcript + ' ';
        } else {
          sessionInterim += res[0].transcript;
        }
      }

      this.currentFinalTranscript = sessionFinal.trim();

      // Combine base transcript + current session final + current interim
      const combined = [
        this.baseTranscript,
        this.currentFinalTranscript,
        sessionInterim.trim(),
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (this.onResultCallback) {
        this.onResultCallback(combined, !!sessionFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      // In Chromium, 'no-speech' is thrown on a 3-second pause.
      // We ignore it so keep-alive can seamlessly restart!
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      console.warn('Speech recognition warning/error:', event.error);
      if (event.error === 'not-allowed') {
        this.isIntentionallyListening = false;
        if (this.onErrorCallback) {
          this.onErrorCallback('Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser Anda.');
        }
      }
    };

    this.recognition.onend = () => {
      // Merge currentFinalTranscript into baseTranscript before any restart
      if (this.currentFinalTranscript) {
        this.baseTranscript = [this.baseTranscript, this.currentFinalTranscript]
          .filter(Boolean)
          .join(' ')
          .trim();
        this.currentFinalTranscript = '';
      }

      // If user hasn't explicitly stopped, KEEP ALIVE automatically!
      if (this.isIntentionallyListening) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => {
          if (this.isIntentionallyListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (_) {
              // Ignore if already started
            }
          }
        }, 150);
      } else {
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    };
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    initialBaseText: string = ''
  ): boolean {
    if (!this.recognition) {
      onError('Browser Anda belum mendukung Web Speech API. Silakan gunakan Google Chrome atau Edge.');
      return false;
    }

    try {
      clearTimeout(this.restartTimeout);
      this.isIntentionallyListening = true;
      this.baseTranscript = (initialBaseText || '').trim();
      this.currentFinalTranscript = '';
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.onEndCallback = onEnd;

      try {
        this.recognition.start();
      } catch (e: any) {
        // If already in a listening state, restart cleanly
        this.recognition.stop();
        setTimeout(() => {
          if (this.isIntentionallyListening) {
            try {
              this.recognition.start();
            } catch (_) {}
          }
        }, 150);
      }

      return true;
    } catch (e: any) {
      this.isIntentionallyListening = false;
      console.error('Failed to start speech recognition:', e);
      onError(e.message || 'Gagal memulai perekaman suara');
      return false;
    }
  }

  stop(): void {
    this.isIntentionallyListening = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }

  getBaseTranscript(): string {
    return [this.baseTranscript, this.currentFinalTranscript].filter(Boolean).join(' ').trim();
  }

  reset(): void {
    this.stop();
    this.baseTranscript = '';
    this.currentFinalTranscript = '';
  }
}

export const speechService = new SpeechService();
