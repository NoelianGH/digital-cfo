// src/controllers/transaction.controller.js
const prisma = require('../config/database');
// 1. Ambil semua transaksi
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId }, // Ambil transaksi hanya untuk user yang sedang login
      orderBy: { date: 'desc' },
    });
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Tambahkan transaksi baru
exports.addTransaction = async (req, res) => {
  try {
    const { date, description, amount, type, category, source, paymentMethod } = req.body;

    // Cari user pertama, atau otomatis buatkan akun demo jika database masih kosong
    let user = await prisma.user.findFirst();

    // Simpan transaksi dan kaitkan ke user.id
    const newTransaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        amount: parseFloat(amount),
        type,       // 'MASUK' | 'KELUAR' | 'MODAL'
        category,   // 'MODAL' | 'PENJUALAN' | 'BAHAN_BAKU' | 'OPERASIONAL' | 'LAINNYA'
        source: source || 'MANUAL', // Default source jika tidak diberikan
        paymentMethod: paymentMethod || null, // Default payment method jika tidak diberikan
        status: 'VERIFIED',
        userId: req.user.userId, // ✅ ID user yang valid dari database
      },
    });

    return res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'MASUK' || t.type === 'MODAL')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'KELUAR')
      .reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netCashFlow,
      },
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}; 