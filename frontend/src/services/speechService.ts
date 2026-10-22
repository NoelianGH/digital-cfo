// frontend/src/services/speechService.ts

export interface ParsedSpeechFinancial {
  rawTranscript: string;
  type: 'MASUK' | 'KELUAR' | 'MODAL';
  category: 'Bahan Baku' | 'Operasional' | 'Gaji' | 'Penjualan' | 'Lainnya';
  amount: number;
  description: string;
}

// Helper to convert Indonesian number words to numeric values
export function indonesianWordsToNumber(text: string): number {
  const clean = text.toLowerCase().replace(/[,\.]/g, ' ');

  // Direct numeric digits in text (e.g. "50000", "50k", "50rb", "1.5jt")
  const regexPatterns = [
    /(\d+[\.,]?\d*)\s*(?:jt|juta)\b/i,
    /(\d+[\.,]?\d*)\s*(?:rb|ribu|k)\b/i,
    /(\d+[\.,]?\d*)\s*(?:ratus)\b/i,
    /\brp\.?\s*(\d+[\.,\d]*)/i,
    /\b(\d{3,})\b/,
  ];

  for (const pat of regexPatterns) {
    const m = clean.match(pat);
    if (m) {
      let val = parseFloat(m[1].replace(',', '.'));
      if (pat.source.includes('jt') || pat.source.includes('juta')) val *= 1000000;
      else if (pat.source.includes('rb') || pat.source.includes('ribu') || pat.source.includes('k')) val *= 1000;
      else if (pat.source.includes('ratus')) val *= 100;
      if (val > 0) return Math.round(val);
    }
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

export function parseFinancialSpeech(transcript: string): ParsedSpeechFinancial {
  const t = transcript.toLowerCase();

  // 1. Determine Type
  let type: 'MASUK' | 'KELUAR' | 'MODAL' = 'KELUAR';
  if (t.includes('modal') || t.includes('investasi') || t.includes('setor modal')) {
    type = 'MODAL';
  } else if (t.includes('jual') || t.includes('laku') || t.includes('omzet') || t.includes('terima') || t.includes('masuk') || t.includes('pelanggan bayar')) {
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
    t.includes('beras') || t.includes('telur') || t.includes('minyak') || t.includes('bumbu')
  ) {
    category = 'Bahan Baku';
  } else if (
    t.includes('listrik') || t.includes('pln') || t.includes('pdam') || t.includes('air') ||
    t.includes('wifi') || t.includes('internet') || t.includes('sewa') || t.includes('bensin') ||
    t.includes('ongkir') || t.includes('pulsa')
  ) {
    category = 'Operasional';
  }

  // 3. Extract Amount
  const amount = indonesianWordsToNumber(transcript);

  // 4. Clean Description
  let description = transcript
    .replace(/\b(catat|masukkan|tulis|transaksi|pengeluaran|pemasukan|total|sebesar|rupiah|rp)\b/gi, '')
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
  };
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'id-ID'; // Bahasa Indonesia
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Browser Anda belum mendukung Web Speech API. Silakan gunakan Google Chrome atau Edge.');
      return false;
    }

    try {
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = (finalTranscript || interimTranscript).trim();
        onResult(text, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onError(`Mikrofon error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      onError(e.message || 'Gagal memulai perekaman suara');
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();
