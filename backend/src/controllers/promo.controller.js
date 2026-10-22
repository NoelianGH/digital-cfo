const prisma = require('../config/database');

function normalizePromoType(t) {
  const s = String(t || '').toUpperCase();
  if (s.includes('CASHBACK')) return 'CASHBACK';
  if (s.includes('BOGO') || s.includes('BUY_ONE')) return 'BUY_ONE_GET_ONE';
  if (s.includes('DISKON') || s.includes('DISCOUNT')) return 'DISKON';
  return 'LAINNYA';
}

function normalizePromoStatus(st) {
  const s = String(st || '').toUpperCase();
  if (s === 'NON_AKTIF' || s === 'INACTIVE') return 'NON_AKTIF';
  if (s === 'EXPIRED') return 'EXPIRED';
  return 'AKTIF';
}

// 1. Get all promos for current user
exports.getPromos = async (req, res) => {
  try {
    const promos = await prisma.promo.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: promos });
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Get promo by ID
exports.getPromoById = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await prisma.promo.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!promo) {
      return res.status(404).json({ success: false, error: 'Promo tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: promo });
  } catch (error) {
    console.error('Error fetching promo by id:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 3. Add new promo
exports.addPromo = async (req, res) => {
  try {
    const { title, description, type, value, minPurchase, startDate, endDate, status } = req.body;

    if (!title || value === undefined) {
      return res.status(400).json({ success: false, error: 'Judul promo dan nilai diskon wajib diisi' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newPromo = await prisma.promo.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        type: normalizePromoType(type),
        value: parseFloat(value) || 0,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        startDate: start,
        endDate: end,
        status: normalizePromoStatus(status),
        userId: req.user.userId,
      },
    });

    return res.status(201).json({ success: true, data: newPromo });
  } catch (error) {
    console.error('Error adding promo:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

// 4. Update promo
exports.updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, value, minPurchase, startDate, endDate, status } = req.body;

    const existing = await prisma.promo.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Promo tidak ditemukan' });
    }

    const updateData = {};
    if (title) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = normalizePromoType(type);
    if (value !== undefined) updateData.value = parseFloat(value);
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase ? parseFloat(minPurchase) : null;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (status) updateData.status = normalizePromoStatus(status);

    const updated = await prisma.promo.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating promo:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 5. Delete promo
exports.deletePromo = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.promo.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Promo tidak ditemukan' });
    }

    await prisma.promo.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Promo berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
