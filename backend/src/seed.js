// src/seed.js
const prisma = require('./config/database');

const initialActions = [
  // ==========================================
  // KONDISI 1: KRITIS (Fokus Penyelamatan Likuiditas & Kas Cepat)
  // ==========================================
  {
    action_type: 'LOAN_INJECTION',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Suntikan Kas Darurat / Pinjaman Modal Kerja',
    description: 'Mengajukan pinjaman modal kerja atau suntikan kas pribadi untuk menambal defisit operasional dan mencapai runway aman 3 bulan.',
    impact_score: 5,
    urgency_score: 5,
    ease_score: 3,
    cost_score: 2, // Biaya bunga / administrasi
  },
  {
    action_type: 'NEGOTIATE_SUPPLIER',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Negosiasi Penundaan Pembayaran Supplier',
    description: 'Minta perpanjangan tempo pembayaran bahan baku 14-30 hari kepada supplier utama untuk menjaga saldo kas kasir tetap aman.',
    impact_score: 4,
    urgency_score: 5,
    ease_score: 4,
    cost_score: 1, // Gratis (hanya komunikasi)
  },
  {
    action_type: 'DEAD_STOCK_CLEARANCE',
    applicable_category: 'BARANG',
    trigger_condition: 'KRITIS',
    title: 'Obral Cuci Gudang Stok Menumpuk (Dead Stock)',
    description: 'Cairkan barang yang lambat berputar di gudang menjadi uang kas tunai lewat diskon likuidasi cepat.',
    impact_score: 5,
    urgency_score: 4,
    ease_score: 4,
    cost_score: 2,
  },
  {
    action_type: 'ZERO_WASTE_DISCOUNT',
    applicable_category: 'KULINER',
    trigger_condition: 'KRITIS',
    title: 'Diskon Menu Akhir Hari / Sore (Mencegah Basi)',
    description: 'Terapkan diskon khusus untuk makanan siap santap di sore/malam hari agar bahan baku tidak terbuang sia-sia.',
    impact_score: 4,
    urgency_score: 5,
    ease_score: 5,
    cost_score: 1,
  },
  {
    action_type: 'CUT_EXPENSES',
    applicable_category: 'ALL',
    trigger_condition: 'KRITIS',
    title: 'Pangkas Biaya Operasional Non-Esensial',
    description: 'Audit pengeluaran terbesar bulan ini dan hentikan belanja perlengkapan yang tidak berdampak langsung ke penjualan.',
    impact_score: 4,
    urgency_score: 4,
    ease_score: 4,
    cost_score: 1,
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
    impact_score: 4,
    urgency_score: 4,
    ease_score: 4,
    cost_score: 2,
  },
  {
    action_type: 'PRODUCT_BUNDLING',
    applicable_category: 'KULINER',
    trigger_condition: 'WASPADA',
    title: 'Paket Kombo Menu Favorit (Food & Drink)',
    description: 'Gabungkan menu makanan paling laris dengan minuman margin tinggi untuk mendongkrak rata-rata belanja kasir.',
    impact_score: 4,
    urgency_score: 3,
    ease_score: 5,
    cost_score: 1,
  },
  {
    action_type: 'VOLUME_DISCOUNT',
    applicable_category: 'BARANG',
    trigger_condition: 'WASPADA',
    title: 'Diskon Bertingkat (Beli Lebih Banyak Lebih Hemat)',
    description: 'Tawarkan promo beli 2 diskon 10% atau beli 3 diskon 20% untuk meningkatkan volume perputaran barang.',
    impact_score: 4,
    urgency_score: 3,
    ease_score: 4,
    cost_score: 2,
  },
  {
    action_type: 'SERVICE_SUBSCRIPTION',
    applicable_category: 'JASA',
    trigger_condition: 'WASPADA',
    title: 'Paket Berlangganan / Voucher Servis Multi-Visit',
    description: 'Tawarkan paket 5x kunjungan dengan harga hemat untuk mengamankan uang kas di muka dan menjaga loyalitas pelanggan.',
    impact_score: 4,
    urgency_score: 3,
    ease_score: 4,
    cost_score: 1,
  },
  {
    action_type: 'PRICE_OPTIMIZATION',
    applicable_category: 'ALL',
    trigger_condition: 'WASPADA',
    title: 'Penyesuaian Harga Produk Unggulan (Menu Engineering)',
    description: 'Naikkan harga sedikit pada produk dengan permintaan tinggi untuk memperbaiki margin laba kotor.',
    impact_score: 5,
    urgency_score: 3,
    ease_score: 5,
    cost_score: 1,
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
    impact_score: 4,
    urgency_score: 2,
    ease_score: 4,
    cost_score: 2,
  },
  {
    action_type: 'NEW_PREMIUM_VARIANT',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Luncurkan Varian Produk Baru / Premium',
    description: 'Rilis produk kelas atas untuk menjangkau segmen konsumen yang rela membayar harga lebih tinggi.',
    impact_score: 5,
    urgency_score: 2,
    ease_score: 3,
    cost_score: 3,
  },
  {
    action_type: 'EQUIPMENT_UPGRADE',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Investasi Upgrade Alat Produksi / Mesin Otomatis',
    description: 'Gunakan cadangan kas berlebih untuk membeli peralatan kerja yang lebih cepat dan efisien.',
    impact_score: 5,
    urgency_score: 2,
    ease_score: 3,
    cost_score: 4,
  },
  {
    action_type: 'EXPANSION_BRANCH',
    applicable_category: 'ALL',
    trigger_condition: 'SEHAT',
    title: 'Ekspansi Buka Cabang Baru / Titik Booth Tambahan',
    description: 'Memperluas jangkauan pasar dengan membuka gerai baru menggunakan kestabilan kas yang sudah terbukti.',
    impact_score: 5,
    urgency_score: 1,
    ease_score: 2,
    cost_score: 5,
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@digitalcfo.id' },
    update: {},
    create: {
      name: 'Budi Santoso (Kopi Kenangan UMKM)',
      email: 'demo@digitalcfo.id',
      password: 'password123', // Nanti kita amankan dengan bcrypt saat modul auth
      businessName: 'Kopi Kenangan UMKM',
    },
  });

  await prisma.actions.deleteMany({});
  await prisma.actions.createMany({
    data: initialActions,
  });
  
  console.log('✅ User demo siap! ID:', user.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());