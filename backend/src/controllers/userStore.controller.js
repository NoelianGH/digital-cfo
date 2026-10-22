const prisma = require('../config/database');

// 1. Get all stores owned by the authenticated user
exports.getMyStores = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stores = await prisma.store.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    console.error('Error getting user stores:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Create a new store for the authenticated user
exports.createStore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, category, address, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Nama toko wajib diisi' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, businessName: true },
    });

    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        ownerName: user?.name || 'Pemilik Toko',
        category: category || 'lainnya',
        status: 'active',
        address: address || '',
        description: description || '',
        productCount: 0,
        userId,
      },
    });

    // Update user's primary businessName if not yet set
    if (!user?.businessName) {
      await prisma.user.update({
        where: { id: userId },
        data: { businessName: newStore.name },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil ditambahkan',
      data: newStore,
    });
  } catch (error) {
    console.error('Error creating user store:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 3. Update an existing store owned by user
exports.updateStore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, category, address, description, status } = req.body;

    const existing = await prisma.store.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan atau bukan milik Anda' });
    }

    const updateData = {};
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Data toko berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating user store:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 4. Delete a store owned by user
exports.deleteStore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.store.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan atau bukan milik Anda' });
    }

    await prisma.store.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Toko berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user store:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
