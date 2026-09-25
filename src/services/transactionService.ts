/**
 * Service Transaksi (Transaction Service)
 * 
 * File ini nantinya akan menjadi pusat logika yang menghubungkan seluruh tab secara otomatis.
 * Ketika tombol "Pembayaran Selesai" ditekan, service ini akan:
 * 
 * 1. Menambahkan 1 baris baru ke Riwayat Transaksi (Pembukuan Kas)
 * 2. Mengurangi stok barang yang terjual (Product)
 * 3. Meng-update statistik harian di halaman Statistik
 * 4. Meng-update Health Score (via healthScoreService)
 * 5. Men-trigger AI recommendation engine (via decisionEngineService)
 * 
 * Untuk sekarang, semua fungsi masih berupa skeleton kosong.
 */

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  customerName?: string;
}

// TODO: Nanti ganti dengan state management (Zustand/Context) atau database
let transactions: Transaction[] = [];

/**
 * Dipanggil saat tombol "Pembayaran Selesai" ditekan.
 * Akan memicu semua side-effect otomatis.
 */
export async function completeSale(transaction: Transaction) {
  // TODO: 1. Simpan transaksi ke database
  // transactions.push(transaction);

  // TODO: 2. Kurangi stok produk
  // await updateProductStock(transaction.items);

  // TODO: 3. Tambahkan ke riwayat pembukuan kas
  // await addToBookkeeping(transaction);

  // TODO: 4. Recalculate Health Score
  // await recalculateHealthScore();

  // TODO: 5. Trigger AI Recommendations
  // await refreshAIRecommendations();

  return { success: false, message: "Belum diimplementasikan" };
}

/**
 * Mengurangi stok produk berdasarkan item yang terjual
 */
async function updateProductStock(items: TransactionItem[]) {
  // TODO: Implementasi pengurangan stok
}

/**
 * Menambahkan entri otomatis ke pembukuan kas
 */
async function addToBookkeeping(transaction: Transaction) {
  // TODO: Implementasi pencatatan otomatis
}

/**
 * Menghitung ulang health score setelah transaksi baru
 */
async function recalculateHealthScore() {
  // TODO: Panggil healthScoreService.calculateHealthScore()
}

/**
 * Meminta AI untuk memperbarui rekomendasi berdasarkan data terbaru
 */
async function refreshAIRecommendations() {
  // TODO: Panggil decisionEngineService.generateStrategicDecisions()
}

/**
 * Generate ID unik untuk transaksi (format: TRX-YYYYMMDD-XXXX)
 */
export function generateTransactionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `TRX-${dateStr}-${rand}`;
}
