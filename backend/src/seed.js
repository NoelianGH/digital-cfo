// backend/src/seed.js
const prisma = require('./config/database');
const { calculateContextualScores } = require('./services/saw.service');

const BASELINE_INDICATORS = {
  KRITIS: { cashRunwayBulan: 0.8, profitMargin: 0.05 },
  WASPADA: { cashRunwayBulan: 2.5, profitMargin: 0.12 },
  SEHAT: { cashRunwayBulan: 5.5, profitMargin: 0.28 },
};

const initialActionDefinitions = [
  // ==========================================
  // KONDISI 1: KRITIS (Fokus Penyelamatan Likuiditas & Kas Cepat)
  // ==========================================
  {
    action_type: 'LOAN_INJECTION',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Suntikan Kas Darurat / Pinjaman Modal Kerja',
    description: 'Mengajukan pinjaman modal kerja atau suntikan kas pribadi untuk menambal defisit operasional dan mencapai runway aman 3 bulan.',
  },
  {
    action_type: 'NEGOTIATE_SUPPLIER',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Negosiasi Penundaan Pembayaran Supplier',
    description: 'Minta perpanjangan tempo pembayaran bahan baku 14-30 hari kepada supplier utama untuk menjaga saldo kas kasir tetap aman.',
  },
  {
    action_type: 'DEAD_STOCK_CLEARANCE',
    applicable_category: 'BARANG',
    trigger_condition: 'KRITIS',
    title: 'Obral Cuci Gudang Stok Menumpuk (Dead Stock)',
    description: 'Cairkan barang yang lambat berputar di gudang menjadi uang kas tunai lewat diskon likuidasi cepat.',
  },
  {
    action_type: 'ZERO_WASTE_DISCOUNT',
    applicable_category: 'KULINER',
    trigger_condition: 'KRITIS',
    title: 'Diskon Menu Akhir Hari / Sore (Mencegah Basi)',
    description: 'Terapkan diskon khusus untuk makanan siap santap di sore/malam hari agar bahan baku tidak terbuang sia-sia.',
  },
  {
    action_type: 'CUT_EXPENSES',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Pangkas Biaya Operasional Non-Esensial',
    description: 'Audit pengeluaran terbesar bulan ini dan hentikan belanja perlengkapan yang tidak berdampak langsung ke penjualan.',
  },

  // ==========================================
  // KONDISI 2: WASPADA (Fokus Optimalisasi Margin & Hari Sepi)
  // ==========================================
  {
    action_type: 'IDLE_DAYS_PROMO',
    applicable_category: 'ALL',
    trigger_condition: 'WASPADA',
    title: 'Promo Khusus Hari Sepi (Idle Days Booster)',
    description: 'Buat promo bertema khusus pada hari-hari dengan transaksi kasir terendah untuk menarik pelanggan di hari kerja.',
  },
  {
    action_type: 'PRODUCT_BUNDLING',
    applicable_category: 'KULINER',
    trigger_condition: 'WASPADA',
    title: 'Paket Kombo Menu Favorit (Food & Drink)',
    description: 'Gabungkan menu makanan paling laris dengan minuman margin tinggi untuk mendongkrak rata-rata belanja kasir.',
  },
  {
    action_type: 'VOLUME_DISCOUNT',
    applicable_category: 'BARANG',
    trigger_condition: 'WASPADA',
    title: 'Diskon Bertingkat (Beli Lebih Banyak Lebih Hemat)',
    description: 'Tawarkan promo beli 2 diskon 10% atau beli 3 diskon 20% untuk meningkatkan volume perputaran barang.',
  },
  {
    action_type: 'SERVICE_SUBSCRIPTION',
    applicable_category: 'JASA',
    trigger_condition: 'WASPADA',
    title: 'Paket Berlangganan / Voucher Servis Multi-Visit',
    description: 'Tawarkan paket 5x kunjungan dengan harga hemat untuk mengamankan uang kas di muka dan menjaga loyalitas pelanggan.',
  },
  {
    action_type: 'PRICE_OPTIMIZATION',
    applicable_category: 'ALL',
    trigger_condition: 'WASPADA',
    title: 'Penyesuaian Harga Produk Unggulan (Menu Engineering)',
    description: 'Naikkan harga sedikit pada produk dengan permintaan tinggi untuk memperbaiki margin laba kotor.',
  },

  // ==========================================
  // KONDISI 3: SEHAT (Fokus Ekspansi, Repeat Order & Scale Up)
  // ==========================================
  {
    action_type: 'LOYALTY_PROGRAM',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Program Kartu Member / Stempel Loyalitas',
    description: 'Apresiasi pelanggan setia dengan program reward untuk mengunci retensi pelanggan jangka panjang.',
  },
  {
    action_type: 'NEW_PREMIUM_VARIANT',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Luncurkan Varian Produk Baru / Premium',
    description: 'Rilis produk kelas atas untuk menjangkau segmen konsumen yang rela membayar harga lebih tinggi.',
  },
  {
    action_type: 'EQUIPMENT_UPGRADE',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Investasi Upgrade Alat Produksi / Mesin Otomatis',
    description: 'Gunakan cadangan kas berlebih untuk membeli peralatan kerja yang lebih cepat dan efisien.',
  },
  {
    action_type: 'EXPANSION_BRANCH',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Ekspansi Buka Cabang Baru / Titik Booth Tambahan',
    description: 'Memperluas jangkauan pasar dengan membuka gerai baru menggunakan kestabilan kas yang sudah terbukti.',
  },
];

// Kalkulasi dinamis seluruh skor kriteria awal berdasarkan formula matematis saw.service
const initialActions = initialActionDefinitions.map((item) => {
  const benchmarkInd = BASELINE_INDICATORS[item.trigger_condition] || BASELINE_INDICATORS.WASPADA;
  const scored = calculateContextualScores(item, benchmarkInd);
  return {
    action_type: scored.action_type,
    applicable_category: scored.applicable_category,
    trigger_condition: scored.trigger_condition,
    title: scored.title,
    description: scored.description,
    impact_score: scored.impact_score,
    urgency_score: scored.urgency_score,
    ease_score: scored.ease_score,
    cost_score: scored.cost_score,
  };
});

async function main() {
  console.log('Seeding initial actions dengan skor terhitung...');
  initialActions.forEach(a => {
    console.log(`[${a.trigger_condition}] ${a.title} -> Urgency:${a.urgency_score}, Impact:${a.impact_score}, Ease:${a.ease_score}, Cost:${a.cost_score}`);
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@digitalcfo.id' },
    update: {},
    create: {
      name: 'Budi Santoso (Kopi Kenangan UMKM)',
      email: 'demo@digitalcfo.id',
      password: 'password123',
      businessName: 'Kopi Kenangan UMKM',
    },
  });

  await prisma.actions.deleteMany({});
  await prisma.actions.createMany({
    data: initialActions,
  });

  console.log('✅ Master data aksi berhasil di-seed dengan skor terhitung!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
