// backend/src/seed.js
const prisma = require('./config/database');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Menyiapkan Akun, Master Tindakan SAW, dan Data Dummy Transaksi...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  // 1. Akun Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@digitalcfo.id' },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN',
      name: 'Administrator CFO',
      businessName: 'Digital CFO Headquarter',
    },
    create: {
      name: 'Administrator CFO',
      email: 'admin@digitalcfo.id',
      password: hashedAdminPassword,
      businessName: 'Digital CFO Headquarter',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Akun Admin siap: ${admin.email} (Password: admin123)`);

  // 2. Akun User (user@digitalcfo.id)
  const user = await prisma.user.upsert({
    where: { email: 'user@digitalcfo.id' },
    update: {
      password: hashedUserPassword,
      role: 'USER',
      name: 'Budi Santoso',
      businessName: 'Kopi Kita Bersama UMKM',
    },
    create: {
      name: 'Budi Santoso',
      email: 'user@digitalcfo.id',
      password: hashedUserPassword,
      businessName: 'Kopi Kita Bersama UMKM',
      role: 'USER',
    },
  });
  console.log(`✅ Akun User siap: ${user.email} (Password: user123) - ${user.businessName}`);

  // 3. Master Tindakan Strategis untuk Decision Engine (SAW)
  const masterActions = [
    {
      title: 'Fokus Penjualan Produk Margin Tertinggi (Paket Bundling Kopi & Pastry)',
      description: 'Tingkatkan rata-rata nilai transaksi dengan mengombinasikan minuman signature dan camilan dengan margin laba > 45%.',
      trigger_condition: 'MARGIN_OPTIMIZATION',
      action_type: 'REVENUE_BOOST',
      applicable_category: 'ALL',
      impact_score: 0.92,
      urgency_score: 0.85,
      ease_score: 0.88,
      cost_score: 0.20,
    },
    {
      title: 'Optimalisasi Negosiasi Pembelian Bahan Baku dengan Supplier Lokal',
      description: 'Lakukan pembelian biji kopi dan susu dalam kuantiti mingguan tetap untuk mendapatkan potongan harga grosir 10-15%.',
      trigger_condition: 'COGS_REDUCTION',
      action_type: 'COST_SAVING',
      applicable_category: 'ALL',
      impact_score: 0.88,
      urgency_score: 0.78,
      ease_score: 0.72,
      cost_score: 0.25,
    },
    {
      title: 'Aktivasi Program Loyalitas Pelanggan & Flash Sale Jam Sepi (14:00 - 17:00)',
      description: 'Dongkrak omzet pada jam tenang dengan diskon khusus QRIS dan kartu stempel reward.',
      trigger_condition: 'SALES_VELOCITY',
      action_type: 'MARKETING',
      applicable_category: 'ALL',
      impact_score: 0.85,
      urgency_score: 0.80,
      ease_score: 0.90,
      cost_score: 0.30,
    },
    {
      title: 'Pertahankan Cadangan Kas Operasional Minimum 3-6 Bulan',
      description: 'Alokasikan 20% laba bersih bulanan ke rekening dana darurat sebelum melakukan belanja modal ekspansi.',
      trigger_condition: 'RUNWAY_PRESERVATION',
      action_type: 'LIQUIDITY',
      applicable_category: 'ALL',
      impact_score: 0.95,
      urgency_score: 0.90,
      ease_score: 0.82,
      cost_score: 0.15,
    },
    {
      title: 'Efisiensi Beban Utilitas & Pangkas Biaya Operasional Non-Esensial',
      description: 'Audit penggunaan daya listrik chiller, kurangi kemasan sekali pakai berlebih, dan hilangkan pos biaya tidak produktif.',
      trigger_condition: 'EXPENSE_CONTROL',
      action_type: 'OPEX_EFFICIENCY',
      applicable_category: 'WASPADA',
      impact_score: 0.82,
      urgency_score: 0.85,
      ease_score: 0.85,
      cost_score: 0.10,
    },
    {
      title: 'Percepat Penagihan Piutang Dagang & Terapkan Pembayaran Full di Depan',
      description: 'Hindari sistem konsinyasi berisiko dan wajibkan pembayaran instan melalui QRIS atau transfer.',
      trigger_condition: 'CASH_DEFICIT',
      action_type: 'CASH_COLLECTION',
      applicable_category: 'KRITIS',
      impact_score: 0.96,
      urgency_score: 0.98,
      ease_score: 0.65,
      cost_score: 0.10,
    },
  ];

  for (const act of masterActions) {
    const existing = await prisma.actions.findFirst({ where: { title: act.title } });
    if (!existing) {
      await prisma.actions.create({ data: act });
    }
  }
  console.log('✅ Master Tindakan SAW Decision Engine siap.');

  // 4. Bersihkan data lama milik user@digitalcfo.id agar terstruktur rapi
  const userHealthScores = await prisma.health_scores.findMany({ where: { userId: user.id }, select: { id: true } });
  const hsIds = userHealthScores.map((h) => h.id);
  if (hsIds.length > 0) {
    await prisma.recommended_actions.deleteMany({ where: { healthScoreId: { in: hsIds } } });
    await prisma.health_scores.deleteMany({ where: { id: { in: hsIds } } });
  }
  await prisma.financial_indicators.deleteMany({ where: { userId: user.id } });
  await prisma.saleItem.deleteMany({ where: { product: { userId: user.id } } });
  await prisma.product.deleteMany({ where: { userId: user.id } });
  await prisma.promo.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  // 5. Tambahkan Produk UMKM
  const productsData = [
    { name: 'Kopi Susu Gula Aren 250ml', category: 'MINUMAN', price: 18000, stock: 120 },
    { name: 'Espresso Double Shot', category: 'MINUMAN', price: 15000, stock: 90 },
    { name: 'Caramel Macchiato', category: 'MINUMAN', price: 26000, stock: 80 },
    { name: 'Matcha Green Tea Latte', category: 'MINUMAN', price: 24000, stock: 75 },
    { name: 'Croissant Butter Vanilla', category: 'MAKANAN', price: 22000, stock: 45 },
    { name: 'Roti Bakar Cokelat Keju', category: 'MAKANAN', price: 18000, stock: 60 },
    { name: 'Biji Kopi Arabika House Blend 250g', category: 'BARANG', price: 68000, stock: 35 },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const created = await prisma.product.create({
      data: {
        ...p,
        userId: user.id,
      },
    });
    createdProducts.push(created);
  }
  console.log(`✅ ${createdProducts.length} Produk UMKM berhasil dibuat.`);

  // 6. Tambahkan Promo UMKM
  const now = new Date();
  const promosData = [
    {
      title: 'Diskon Mahasiswa & Pelajar 15%',
      description: 'Potongan harga langsung 15% untuk semua menu kopi dengan menunjukkan kartu pelajar.',
      type: 'DISKON',
      value: 15,
      minPurchase: 20000,
      startDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 60 * 24 * 3600 * 1000),
      status: 'AKTIF',
      claimedCount: 28,
    },
    {
      title: 'Beli 2 Kopi Susu Gratis 1 Roti Bakar',
      description: 'Promo bundling camilan hemat setiap hari kerja pk 14.00-17.00.',
      type: 'BUY_ONE_GET_ONE',
      value: 100,
      startDate: new Date(now.getTime() - 15 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 45 * 24 * 3600 * 1000),
      status: 'AKTIF',
      claimedCount: 42,
    },
    {
      title: 'Cashback Weekend QRIS Rp 5.000',
      description: 'Cashback belanja akhir pekan minimum pembelian Rp 35.000 menggunakan QRIS.',
      type: 'CASHBACK',
      value: 5000,
      minPurchase: 35000,
      startDate: new Date(now.getTime() - 10 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 3600 * 1000),
      status: 'AKTIF',
      claimedCount: 19,
    },
  ];

  for (const pr of promosData) {
    await prisma.promo.create({
      data: {
        ...pr,
        userId: user.id,
      },
    });
  }
  console.log(`✅ Promo aktif berhasil ditambahkan.`);

  // 7. Generate Data Dummy Transaksi (Memenuhi akses 1 Bulan, 3 Bulan, 6 Bulan, dan 1 Tahun)
  // Target:
  // - 1 Bulan terakhir (0-30 hari lalu) : 25 transaksi (kebutuhan min: 7)  -> LOLOS
  // - 1-3 Bulan lalu (31-90 hari lalu)   : 25 transaksi (total 3 bln: 50, min: 20) -> LOLOS
  // - 3-6 Bulan lalu (91-180 hari lalu)  : 35 transaksi (total 6 bln: 85, min: 40) -> LOLOS
  // - 6-12 Bulan lalu (181-360 hari lalu): 45 transaksi (total 1 thn: 130, min: 80) -> LOLOS
  // Ditambah 1 transaksi modal awal pada hari ke-360.

  const transactionsToCreate = [];

  // Transaksi Modal Awal Usaha (Hari ke-360)
  const initialModalDate = new Date(now.getTime() - 360 * 24 * 3600 * 1000);
  transactionsToCreate.push({
    date: initialModalDate,
    description: 'Setoran Modal Awal Usaha Kedai Kopi',
    amount: 35000000,
    type: 'MODAL',
    category: 'LAINNYA',
    source: 'MANUAL',
    paymentMethod: 'TRANSFER',
    status: 'VERIFIED',
    userId: user.id,
  });

  const saleDescriptions = [
    'Penjualan Kasir POS Shift Pagi',
    'Penjualan Kasir POS Shift Siang',
    'Penjualan Kasir POS Shift Sore & Malam',
    'Pesanan Takeaway Kopi Susu & Pastry',
    'Pesanan Katering Kopi Meeting Kantor',
    'Penjualan Online Delivery GrabFood/GoFood',
    'Penjualan Bundling Paket Sarapan',
    'Penjualan Biji Kopi House Blend & Manual Brew',
    'Penjualan Kasir QRIS Pengunjung Akhir Pekan',
  ];

  const expenseTemplates = [
    { desc: 'Pembelian Biji Kopi Arabika 10kg dari Petani', cat: 'PEMBELIAN', min: 1200000, max: 2200000, source: 'OCR' },
    { desc: 'Restok Fresh Milk Pasteurisasi 30 Liter', cat: 'PEMBELIAN', min: 450000, max: 750000, source: 'MANUAL' },
    { desc: 'Pembelian Sirup Perisa, Karamel, & Matcha Powder', cat: 'PEMBELIAN', min: 350000, max: 650000, source: 'MANUAL' },
    { desc: 'Pembelian Cup Plastik, Sedotan Ramah Lingkungan & Paper Bag', cat: 'PEMBELIAN', min: 300000, max: 550000, source: 'MANUAL' },
    { desc: 'Gaji Bulanan Barista & Staf Kasir', cat: 'GAJI', min: 2800000, max: 3500000, source: 'MANUAL' },
    { desc: 'Tagihan Listrik PLN & Air PDAM Kedai', cat: 'OPERASIONAL', min: 450000, max: 750000, source: 'OCR' },
    { desc: 'Langganan Internet WiFi High-Speed Kedai', cat: 'OPERASIONAL', min: 350000, max: 450000, source: 'MANUAL' },
    { desc: 'Perawatan Rutin & Pembersihan Mesin Espresso', cat: 'LAINNYA', min: 150000, max: 300000, source: 'MANUAL' },
  ];

  const paymentMethods = ['QRIS', 'TUNAI', 'TRANSFER', 'KARTU_DEBIT'];

  // Helper untuk random int
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper membuat transaksi terdistribusi pada rentang hari tertentu
  function generateSlot(count, minDaysAgo, maxDaysAgo, avgIncome, avgExpense) {
    for (let i = 0; i < count; i++) {
      // 70% pemasukan penjualan, 30% pengeluaran
      const isIncome = Math.random() < 0.70;
      const daysAgo = randomBetween(minDaysAgo, maxDaysAgo);
      const hours = randomBetween(8, 21);
      const minutes = randomBetween(0, 59);
      const txDate = new Date(now.getTime() - (daysAgo * 24 * 3600 + (24 - hours) * 3600 + minutes * 60) * 1000);

      if (isIncome) {
        const amount = randomBetween(avgIncome * 0.7, avgIncome * 1.4);
        // Bulatkan ke ratusan terdekat
        const roundedAmount = Math.round(amount / 5000) * 5000;
        transactionsToCreate.push({
          date: txDate,
          description: randomItem(saleDescriptions),
          amount: roundedAmount,
          type: 'MASUK',
          category: 'PENJUALAN',
          source: randomItem(['POS', 'POS', 'MANUAL', 'OCR']),
          paymentMethod: randomItem(paymentMethods),
          status: 'VERIFIED',
          userId: user.id,
        });
      } else {
        const template = randomItem(expenseTemplates);
        const amount = randomBetween(template.min, template.max);
        const roundedAmount = Math.round(amount / 5000) * 5000;
        transactionsToCreate.push({
          date: txDate,
          description: template.desc,
          amount: roundedAmount,
          type: 'KELUAR',
          category: template.cat,
          source: template.source,
          paymentMethod: randomItem(['TRANSFER', 'TUNAI', 'QRIS']),
          status: 'VERIFIED',
          userId: user.id,
        });
      }
    }
  }

  // 1. Rentang 6-12 Bulan Lalu (181 s.d 350 hari lalu): 45 transaksi
  generateSlot(45, 181, 350, 420000, 600000);

  // 2. Rentang 3-6 Bulan Lalu (91 s.d 180 hari lalu): 35 transaksi
  generateSlot(35, 91, 180, 520000, 700000);

  // 3. Rentang 1-3 Bulan Lalu (31 s.d 90 hari lalu): 25 transaksi
  generateSlot(25, 31, 90, 650000, 750000);

  // 4. Rentang 1 Bulan Terakhir (0 s.d 30 hari lalu): 25 transaksi
  generateSlot(25, 0, 30, 780000, 800000);

  // Urutkan transaksi berdasarkan tanggal terlama ke terbaru
  transactionsToCreate.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Simpan ke database
  console.log(`⏳ Memasukkan ${transactionsToCreate.length} transaksi dummy ke database...`);
  for (const t of transactionsToCreate) {
    await prisma.transaction.create({ data: t });
  }

  // Buat beberapa record penjualan kasir (Sale & SaleItem) untuk menghubungkan produk
  const recentPosTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      source: 'POS',
      type: 'MASUK',
    },
    take: 10,
    orderBy: { date: 'desc' },
  });

  for (let i = 0; i < recentPosTransactions.length; i++) {
    const tx = recentPosTransactions[i];
    const receiptCode = `TRX-${tx.date.getFullYear()}${String(tx.date.getMonth() + 1).padStart(2, '0')}${String(tx.date.getDate()).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`;
    
    // Pilih 2 produk acak
    const p1 = createdProducts[i % createdProducts.length];
    const p2 = createdProducts[(i + 1) % createdProducts.length];
    
    await prisma.sale.create({
      data: {
        total: tx.amount,
        paymentMethod: tx.paymentMethod || 'TUNAI',
        receiptCode: receiptCode,
        createdAt: tx.date,
        transactionId: tx.id,
        items: {
          create: [
            {
              qty: 2,
              priceAtSale: p1.price,
              subtotal: p1.price * 2,
              productId: p1.id,
            },
            {
              qty: 1,
              priceAtSale: p2.price,
              subtotal: p2.price,
              productId: p2.id,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Relasi Transaksi POS & Produk (Sales & SaleItems) berhasil dibuat.');

  // Rekapitulasi Verifikasi Jumlah Transaksi per Periode
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 3600 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 3600 * 1000);

  const count1m = await prisma.transaction.count({
    where: { userId: user.id, date: { gte: oneMonthAgo } },
  });
  const count3m = await prisma.transaction.count({
    where: { userId: user.id, date: { gte: threeMonthsAgo } },
  });
  const count6m = await prisma.transaction.count({
    where: { userId: user.id, date: { gte: sixMonthsAgo } },
  });
  const count1y = await prisma.transaction.count({
    where: { userId: user.id, date: { gte: oneYearAgo } },
  });

  console.log('\n📊 === VERIFIKASI AKSES PERIODE REKOMENDASI AI ===');
  console.log(`- 1 Bulan (1m) : ${count1m} transaksi (Minimal: 7)  -> ${count1m >= 7 ? '✅ BISA DIAKSES' : '❌ BELUM'}`);
  console.log(`- 3 Bulan (3m) : ${count3m} transaksi (Minimal: 20) -> ${count3m >= 20 ? '✅ BISA DIAKSES' : '❌ BELUM'}`);
  console.log(`- 6 Bulan (6m) : ${count6m} transaksi (Minimal: 40) -> ${count6m >= 40 ? '✅ BISA DIAKSES' : '❌ BELUM'}`);
  console.log(`- 1 Tahun (1y) : ${count1y} transaksi (Minimal: 80) -> ${count1y >= 80 ? '✅ BISA DIAKSES' : '❌ BELUM'}`);
  console.log('================================================\n');
  console.log('🎉 Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });