const prisma = require('../config/database');
const { healthScore } = require('../services/fuzzyTsukamoto.service');
const { calculateSAW } = require('../services/saw.service');

exports.getHealthScore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const period = String(req.query.period || '1m').toLowerCase();

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
          period,
          transactionCount: 0,
          indicators: { cashRunwayBulan: 0, profitMargin: 0, trendGrowth: 0 },
          recommended_actions: [],
        },
      });
    }

    // 2. Tentukan batas waktu berdasarkan parameter period
    const now = new Date();
    let currentPeriodStart = new Date(now);
    let lastPeriodStart = new Date(now);
    let lastPeriodEnd = new Date(now);
    let durationMonths = 1;

    if (period === '1m') {
      durationMonths = 1;
      currentPeriodStart.setMonth(now.getMonth() - 1);
      lastPeriodStart.setMonth(now.getMonth() - 2);
      lastPeriodEnd.setMonth(now.getMonth() - 1);
    } else if (period === '3m') {
      durationMonths = 3;
      currentPeriodStart.setMonth(now.getMonth() - 3);
      lastPeriodStart.setMonth(now.getMonth() - 6);
      lastPeriodEnd.setMonth(now.getMonth() - 3);
    } else if (period === '6m') {
      durationMonths = 6;
      currentPeriodStart.setMonth(now.getMonth() - 6);
      lastPeriodStart.setMonth(now.getMonth() - 12);
      lastPeriodEnd.setMonth(now.getMonth() - 6);
    } else if (period === '1y') {
      durationMonths = 12;
      currentPeriodStart.setFullYear(now.getFullYear() - 1);
      lastPeriodStart.setFullYear(now.getFullYear() - 2);
      lastPeriodEnd.setFullYear(now.getFullYear() - 1);
    } else {
      durationMonths = 1;
      currentPeriodStart.setMonth(now.getMonth() - 1);
      lastPeriodStart.setMonth(now.getMonth() - 2);
      lastPeriodEnd.setMonth(now.getMonth() - 1);
    }

    // 3. Hitung Saldo Total dan Akumulasi Berdasarkan Periode
    let saldo = 0;
    let totalPenjualanCurrent = 0;
    let totalPengeluaranCurrent = 0;
    let totalPenjualanLast = 0;
    let txInCurrentPeriod = 0;

    for (const t of transactions) {
      const tDate = new Date(t.date);
      // Saldo kas total berjalan (sepanjang riwayat s.d saat ini)
      if (t.type === 'MASUK' || t.type === 'MODAL') {
        saldo += t.amount;
      } else if (t.type === 'KELUAR') {
        saldo -= t.amount;
      }

      // Transaksi dalam periode yang dipilih
      if (tDate >= currentPeriodStart && tDate <= now) {
        txInCurrentPeriod++;
        if (t.type === 'MASUK' && t.category === 'PENJUALAN') {
          totalPenjualanCurrent += t.amount;
        } else if (t.type === 'KELUAR') {
          totalPengeluaranCurrent += t.amount;
        }
      }

      // Transaksi periode pembanding sebelumnya
      if (tDate >= lastPeriodStart && tDate < lastPeriodEnd) {
        if (t.type === 'MASUK' && t.category === 'PENJUALAN') {
          totalPenjualanLast += t.amount;
        }
      }
    }

    // Baseline estimasi tren wajar bila periode sebelumnya belum ada data
    if (totalPenjualanLast <= 0 && totalPenjualanCurrent > 0) {
      totalPenjualanLast = totalPenjualanCurrent * 0.85;
    }

    // Rata-rata pengeluaran bulanan selama periode
    const meanMonthlyExpense = durationMonths > 0 ? (totalPengeluaranCurrent / durationMonths) : totalPengeluaranCurrent;

    // 4. Kalkulasi Fuzzy Tsukamoto
    const fuzzyResult = healthScore(
      saldo,
      meanMonthlyExpense,
      totalPenjualanCurrent,
      totalPengeluaranCurrent,
      totalPenjualanCurrent,
      totalPenjualanLast
    );

    // 5. Simpan Hasil Indikator Finansial ke Database
    const savedIndicator = await prisma.financial_indicators.create({
      data: {
        cash_runway: fuzzyResult.indicators.cashRunwayBulan,
        unit_economics: fuzzyResult.indicators.profitMargin,
        trend_analysis: fuzzyResult.indicators.trendGrowth || 0,
        period_start: currentPeriodStart,
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

    // 6. Ambil Tindakan Rekomendasi & Ranking SAW
    let allActions = await prisma.actions.findMany({
      where: {
        OR: [
          { applicable_category: fuzzyResult.category },
          { applicable_category: 'ALL' },
          { applicable_category: null },
        ],
      },
      take: 6,
    });

    if (allActions.length === 0) {
      allActions = await prisma.actions.findMany({ take: 6 });
    }

    const recommendedActionsData = [];
    if (allActions.length > 0) {
      const ranked = calculateSAW(allActions);
      for (const r of ranked.slice(0, 3)) {
        const createdRec = await prisma.recommended_actions.create({
          data: {
            preference_value: r.preference_value,
            rank: r.rank,
            healthScoreId: savedScore.id,
            actionId: r.actionId,
          },
          include: {
            action: true,
          },
        });
        recommendedActionsData.push(createdRec);
      }
    }

    // 7. Kembalikan hasil lengkap ke frontend
    return res.status(200).json({
      success: true,
      message: 'Health score berhasil dihitung',
      data: {
        ...savedScore,
        period,
        transactionCount: txInCurrentPeriod,
        indicators: {
          ...savedScore.indicators,
          cashRunwayBulan: fuzzyResult.indicators.cashRunwayBulan,
          profitMargin: fuzzyResult.indicators.profitMargin,
          trendGrowth: fuzzyResult.indicators.trendGrowth,
        },
        recommended_actions: recommendedActionsData,
      },
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};