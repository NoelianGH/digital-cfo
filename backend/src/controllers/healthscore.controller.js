const prisma = require('../config/database');
const { healthScore } = require('../services/fuzzyTsukamoto.service');

exports.getHealthScore = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Ambil semua transaksi milik user ini
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
        });

        if (transactions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Belum ada transaksi untuk dianalisis',
                data: {
                score: 50,
                category: 'WASPADA',
                indicators: { cashRunwayBulan: 0, profitMargin: 0, trendGrowth: 0 },
            },
        });
    }
    
    // 2. Tentukan batas waktu (Bulan Ini dan Bulan Lalu)
    const now = new Date();
    const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // 3. Hitung Saldo Total
    let saldo = 0;
    let totalPenjualanCurrent = 0;
    let totalPengeluaranCurrent = 0;
    let totalPenjualanLast = 0;

    for (const t of transactions){
      const tDate = new Date(t.date);
      // Saldo akumulasi sepanjang waktu
      if (t.type === 'MASUK' || t.type === 'MODAL') {
        saldo += t.amount;
      } else if (t.type === 'KELUAR') {
        saldo -= t.amount;
      }
      // Transaksi Bulan Ini
      if (tDate >= startCurrentMonth) {
        if (t.type === 'MASUK' && t.category === 'PENJUALAN') {
          totalPenjualanCurrent += t.amount;
        } else if (t.type === 'KELUAR') {
          totalPengeluaranCurrent += t.amount;
        }
      }
      // Transaksi Bulan Lalu
      if (tDate >= startLastMonth && tDate <= endLastMonth) {
        if (t.type === 'MASUK' && t.category === 'PENJUALAN') {
          totalPenjualanLast += t.amount;
        }
      }
    }

    // 4. Panggil Otak Fuzzy Tsukamoto Kamu!
    const fuzzyResult = healthScore(
      saldo,
      totalPengeluaranCurrent, // rata-rata/pengeluaran bulan ini
      totalPenjualanCurrent,
      totalPengeluaranCurrent,
      totalPenjualanCurrent,
      totalPenjualanLast
    );

    // 5. Simpan Hasilnya ke Database (Sesuai schema.prisma kamu)
    const savedIndicator = await prisma.financial_indicators.create({
      data: {
        cash_runway: fuzzyResult.indicators.cashRunwayBulan,
        unit_economics: fuzzyResult.indicators.profitMargin,
        trend_analysis: fuzzyResult.indicators.trendGrowth || 0,
        period_start: startCurrentMonth,
        period_end: now,
        userId: userId,
      },
    });

    const savedScore = await prisma.health_scores.create({
      data: {
        score: fuzzyResult.score,
        category: fuzzyResult.category,
        userId: userId,
        indicatorsId: savedIndicator.id,
      },
      include: {
        indicators: true,
      },
    });
    
    // 6. Kembalikan hasil ke frontend
    return res.status(200).json({
      success: true,
      message: 'Health score berhasil dihitung',
      data: savedScore,
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};