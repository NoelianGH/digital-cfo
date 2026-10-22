const prisma = require('../config/database');
const { calculateSAW } = require('../services/saw.service');

// Fungsi pembantu: Mengisi saran statis dengan angka & nama produk riil milik toko
async function enrichActionDetail(action, userId, latestHealthScore) {
  let tailoredTitle = action.title;
  let tailoredDesc = action.description;
  let contextData = {};

  try {
    // 1. Jika Aksi Pinjaman / Tambahan Modal Kas
    if (action.action_type === 'LOAN_INJECTION') {
      const transactions = await prisma.transaction.findMany({ where: { userId } });
      let saldo = 0;
      let totalKeluarBulanIni = 0;
      const startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      for (const t of transactions) {
        if (t.type === 'MASUK' || t.type === 'MODAL') saldo += t.amount;
        else if (t.type === 'KELUAR') saldo -= t.amount;

        if (new Date(t.date) >= startMonth && t.type === 'KELUAR') {
          totalKeluarBulanIni += t.amount;
        }
      }

      const targetKasAman = (totalKeluarBulanIni || 3000000) * 3;
      const defisit = Math.max(0, targetKasAman - saldo);

      tailoredTitle = `Suntikan Kas / Pinjaman Modal Rp ${defisit.toLocaleString('id-ID')}`;
      tailoredDesc = `Saldo kas kamu saat ini Rp ${saldo.toLocaleString('id-ID')} dengan pengeluaran Rp ${totalKeluarBulanIni.toLocaleString('id-ID')}/bulan. Kamu membutuhkan suntikan modal kerja minimal Rp ${defisit.toLocaleString('id-ID')} agar cadangan kas aman mencapai 3 bulan ke depan.`;
      contextData = { currentCash: saldo, monthlyExpense: totalKeluarBulanIni, neededCash: defisit };
    }

    // 2. Jika Aksi Obral Cuci Gudang (Dead Stock)
    else if (action.action_type === 'DEAD_STOCK_CLEARANCE') {
      const deadStockProduct = await prisma.product.findFirst({
        where: { userId, isActive: true, stock: { gt: 10 } },
        orderBy: { stock: 'desc' },
      });

      if (deadStockProduct) {
        const diskonPersen = 20;
        const hargaDiskon = deadStockProduct.price * (1 - diskonPersen / 100);
        const potensiCair = deadStockProduct.stock * hargaDiskon;

        tailoredTitle = `Flash Sale Cuci Gudang "${deadStockProduct.name}"`;
        tailoredDesc = `Produk "${deadStockProduct.name}" memiliki stok menumpuk sebanyak ${deadStockProduct.stock} pcs. Lakukan Flash Sale Diskon ${diskonPersen}% (dari Rp ${deadStockProduct.price.toLocaleString('id-ID')} jadi Rp ${hargaDiskon.toLocaleString('id-ID')}) untuk mencairkan kas beku senilai Rp ${potensiCair.toLocaleString('id-ID')}!`;
        contextData = { productId: deadStockProduct.id, stock: deadStockProduct.stock, discountPercent: diskonPersen };
      }
    }

    // 3. Jika Aksi Bundling Produk (F&B / Kuliner)
    else if (action.action_type === 'PRODUCT_BUNDLING') {
      const topProduct = await prisma.product.findFirst({
        where: { userId, isActive: true },
        orderBy: { price: 'desc' },
      });

      if (topProduct) {
        tailoredTitle = `Paket Bundling Menu Unggulan "${topProduct.name}"`;
        tailoredDesc = `Pasangkan produk unggulanmu "${topProduct.name}" dengan menu minuman/pelengkap favorit menjadi satu paket hemat untuk menaikkan nilai rata-rata belanja kasir.`;
        contextData = { heroProductId: topProduct.id };
      }
    }

    // 4. Jika Aksi Promo Hari Sepi (Idle Days Booster)
    else if (action.action_type === 'IDLE_DAYS_PROMO') {
      tailoredTitle = `Promo Hari Kerja Spesial (Selasa & Rabu Hemat)`;
      tailoredDesc = `Data transaksi menunjukkan penjualan cenderung sepi di pertengahan minggu. Terapkan promo bertema khusus 'Selasa & Rabu Seru' dengan diskon 10-15% untuk menarik traffic pelanggan di hari kerja.`;
      contextData = { targetDays: ['Selasa', 'Rabu'] };
    }

    // 5. Jika Aksi Pangkas Biaya Operasional
    else if (action.action_type === 'CUT_EXPENSES') {
      const expenses = await prisma.transaction.findMany({
        where: { userId, type: 'KELUAR' },
        take: 5,
        orderBy: { amount: 'desc' },
      });

      if (expenses.length > 0) {
        const topExpense = expenses[0];
        tailoredTitle = `Audit Pengeluaran: ${topExpense.description || topExpense.category}`;
        tailoredDesc = `Pengeluaran terbesar tercatat pada "${topExpense.description || topExpense.category}" sebesar Rp ${topExpense.amount.toLocaleString('id-ID')}. Evaluasi pos pengeluaran ini untuk menghemat kas operasional.`;
        contextData = { highestExpense: topExpense.amount, category: topExpense.category };
      }
    }
  } catch (err) {
    console.warn('Gagal enrich detail, fallback ke deskripsi umum:', err.message);
  }

  return { tailoredTitle, tailoredDesc, contextData };
}

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Ambil health score terbaru milik user
    const latestHealthScore = await prisma.health_scores.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { indicators: true },
    });

    if (!latestHealthScore) {
      return res.status(400).json({
        success: false,
        error: 'Belum ada data health score. Silakan jalankan analisis kesehatan kas terlebih dahulu di menu Health Score.',
      });
    }

    // 2. Cek apakah health score ini sudah pernah dibuatkan rekomendasinya
    const existingRecommendations = await prisma.recommended_actions.findMany({
      where: { healthScoreId: latestHealthScore.id },
      include: { action: true },
      orderBy: { rank: 'asc' },
    });

    if (existingRecommendations.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Rekomendasi berhasil diambil dari riwayat analisis',
        data: {
          category: latestHealthScore.category,
          score: latestHealthScore.score,
          recommendations: existingRecommendations,
        },
      });
    }

    // 3. Ambil daftar aksi dari database yang sesuai dengan kondisi (KRITIS / WASPADA / SEHAT)
    let candidateActions = await prisma.actions.findMany({
      where: {
        trigger_condition: latestHealthScore.category,
      },
    });

    if (candidateActions.length === 0) {
      candidateActions = await prisma.actions.findMany();
    }

    if (candidateActions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Belum ada data opsi aksi di database.',
      });
    }

    // 4. Jalankan Algoritma SAW untuk meranking aksi
    const rankedActions = calculateSAW(candidateActions);
    const top3 = rankedActions.slice(0, 3);

    // 5. Analisis Konteks Riil dan Simpan ke Database
    const savedRecommendations = await Promise.all(
      top3.map(async (item) => {
        const enriched = await enrichActionDetail(item, userId, latestHealthScore);

        return prisma.recommended_actions.create({
          data: {
            preference_value: item.preferenceValue,
            rank: item.rank,
            tailored_title: enriched.tailoredTitle,
            tailored_description: enriched.tailoredDesc,
            context_data: enriched.contextData,
            healthScoreId: latestHealthScore.id,
            actionId: item.id,
          },
          include: {
            action: true,
          },
        });
      })
    );

    // 6. Kembalikan data lengkap ke frontend
    return res.status(200).json({
      success: true,
      message: 'Rekomendasi DSS berhasil dihitung menggunakan metode SAW dengan analisis konteks riil',
      data: {
        category: latestHealthScore.category,
        score: latestHealthScore.score,
        recommendations: savedRecommendations,
      },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};