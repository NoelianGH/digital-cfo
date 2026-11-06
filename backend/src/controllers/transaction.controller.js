// src/controllers/transaction.controller.js
const prisma = require('../config/database');

function normalizeType(type) {
  const t = String(type || '').toUpperCase();
  if (t === 'MASUK' || t === 'PEMASUKAN' || t === 'IN' || t === 'CR') return 'MASUK';
  if (t === 'MODAL') return 'MODAL';
  return 'KELUAR';
}

function normalizeCategory(cat, type) {
  const c = String(cat || '').toUpperCase();
  if (c.includes('JUAL') || c.includes('SALE') || c.includes('POS')) return 'PENJUALAN';
  if (c.includes('BAHAN') || c.includes('BELI') || c.includes('PEMBELIAN') || c.includes('KULAKAN')) return 'PEMBELIAN';
  if (c.includes('GAJI') || c.includes('SALARY') || c.includes('UPAH')) return 'GAJI';
  if (c.includes('OPERASIONAL') || c.includes('LISTRIK') || c.includes('AIR') || c.includes('SEWA') || c.includes('WIFI') || c.includes('BENSIN')) return 'OPERASIONAL';
  if (type === 'MASUK') return 'PENJUALAN';
  if (type === 'MODAL') return 'LAINNYA';
  return 'LAINNYA';
}

function normalizeSource(source) {
  const s = String(source || '').toUpperCase();
  if (s.includes('OCR') || s.includes('SCAN') || s.includes('CAMERA')) return 'OCR';
  if (s.includes('VOICE') || s.includes('SUARA') || s.includes('MIC') || s.includes('SPEECH')) return 'VOICE';
  if (s.includes('POS')) return 'POS';
  return 'MANUAL';
}

function normalizePaymentMethod(pm) {
  if (!pm) return 'TUNAI';
  const p = String(pm).toUpperCase();
  if (p.includes('QRIS')) return 'QRIS';
  if (p.includes('TRANSFER') || p.includes('TF') || p.includes('BANK')) return 'TRANSFER';
  if (p.includes('DEBIT') || p.includes('KARTU')) return 'KARTU_DEBIT';
  if (p.includes('TUNAI') || p.includes('CASH')) return 'TUNAI';
  return 'LAINNYA';
}

// 1. Ambil semua transaksi beserta detail item penjualan (jika dari kasir POS)
exports.getTransactions = async (req, res) => {
  try {
    const { storeId } = req.query;
    const whereClause = { userId: req.user.userId };

    if (storeId && storeId !== 'all' && storeId !== 'undefined' && storeId !== 'null') {
      whereClause.storeId = storeId;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        store: {
          select: { id: true, name: true, category: true }
        }
      }
    });

    const txIds = transactions.map((t) => t.id);
    const sales = await prisma.sale.findMany({
      where: { transactionId: { in: txIds } },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const saleMap = new Map();
    sales.forEach((s) => saleMap.set(s.transactionId, s));

    const enriched = transactions.map((t) => {
      const sale = saleMap.get(t.id);
      if (!sale) return { ...t, sale: null };

      const items = (sale.items || []).map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.product?.name || 'Produk',
        productCategory: it.product?.category || 'LAINNYA',
        qty: it.qty,
        priceAtSale: it.priceAtSale,
        subtotal: it.subtotal,
      }));

      // Pastikan total struk selalu sinkron presisi 100% dengan rincian item
      const calculatedTotal = items.reduce((sum, it) => sum + it.subtotal, 0);

      return {
        ...t,
        sale: {
          id: sale.id,
          receiptCode: sale.receiptCode,
          total: calculatedTotal > 0 ? calculatedTotal : sale.total,
          paymentMethod: sale.paymentMethod,
          createdAt: sale.createdAt,
          items,
        },
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Tambahkan transaksi baru
exports.addTransaction = async (req, res) => {
  try {
    const { date, description, amount, type, category, source, paymentMethod, storeId } = req.body;

    if (!description || amount === undefined || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, error: 'Keterangan dan nominal transaksi valid harus diisi' });
    }

    const finalType = normalizeType(type);
    const finalCategory = normalizeCategory(category, finalType);
    const finalSource = normalizeSource(source);
    const finalPayment = normalizePaymentMethod(paymentMethod);

    const newTransaction = await prisma.transaction.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description: String(description).trim(),
        amount: Math.abs(parseFloat(amount)),
        type: finalType,
        category: finalCategory,
        source: finalSource,
        paymentMethod: finalPayment,
        status: 'VERIFIED',
        userId: req.user.userId,
        storeId: storeId && storeId !== 'all' ? storeId : null,
      },
    });

    return res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

// 3. Batch import transaksi (dari PDF mutasi atau OCR multiple)
exports.batchAddTransactions = async (req, res) => {
  try {
    const { transactions, storeId } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar transaksi tidak boleh kosong' });
    }

    const createdRecords = [];
    for (const item of transactions) {
      if (!item.description || item.amount === undefined) continue;
      const finalType = normalizeType(item.type);
      const finalCategory = normalizeCategory(item.category, finalType);
      const finalSource = normalizeSource(item.source || 'MANUAL');
      const finalPayment = normalizePaymentMethod(item.paymentMethod);
      const targetStoreId = item.storeId || storeId || null;

      const record = await prisma.transaction.create({
        data: {
          date: item.date ? new Date(item.date) : new Date(),
          description: String(item.description).trim(),
          amount: Math.abs(parseFloat(item.amount)),
          type: finalType,
          category: finalCategory,
          source: finalSource,
          paymentMethod: finalPayment,
          status: 'VERIFIED',
          userId: req.user.userId,
          storeId: targetStoreId && targetStoreId !== 'all' ? targetStoreId : null,
        },
      });
      createdRecords.push(record);
    }

    return res.status(201).json({
      success: true,
      message: `${createdRecords.length} transaksi berhasil diimpor`,
      data: createdRecords,
    });
  } catch (error) {
    console.error('Error batch adding transactions:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 4. Update transaksi
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, type, category, paymentMethod } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    }

    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (description) updateData.description = description;
    if (amount !== undefined) updateData.amount = Math.abs(parseFloat(amount));
    if (type) updateData.type = normalizeType(type);
    if (category) updateData.category = normalizeCategory(category, updateData.type || existing.type);
    if (paymentMethod) updateData.paymentMethod = normalizePaymentMethod(paymentMethod);

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 5. Hapus transaksi
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    }

    await prisma.transaction.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 6. Ringkasan Kas
exports.getSummary = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'MASUK')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalModal = transactions
      .filter((t) => t.type === 'MODAL')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'KELUAR')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebet = totalIncome + totalModal;
    const netCashFlow = totalDebet - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalModal,
        totalExpense,
        netCashFlow,
        count: transactions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};