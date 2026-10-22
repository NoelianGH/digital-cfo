const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// 1. Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
            products: true,
            promos: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error in admin getAllUsers:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Admin create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, businessName, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nama, email, dan password wajib diisi' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        businessName: businessName || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ success: true, data: newUser, message: 'User berhasil dibuat oleh Admin' });
  } catch (error) {
    console.error('Error in admin createUser:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 3. Admin update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, businessName, role, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, error: 'Email sudah digunakan pengguna lain' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (role) updateData.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        role: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ success: true, data: updated, message: 'User berhasil diperbarui' });
  } catch (error) {
    console.error('Error in admin updateUser:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 4. Admin delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    // Clean user's transactions and relations
    await prisma.transaction.deleteMany({ where: { userId: id } });
    await prisma.saleItem.deleteMany({
      where: { product: { userId: id } },
    });
    await prisma.product.deleteMany({ where: { userId: id } });
    await prisma.promo.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'User dan seluruh data terkait berhasil dihapus' });
  } catch (error) {
    console.error('Error in admin deleteUser:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 5. Admin platform overview stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransactions, totalProducts, totalSales] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.product.count(),
      prisma.sale.count(),
    ]);

    const transactions = await prisma.transaction.findMany({
      select: { amount: true, type: true },
    });

    const totalVolume = transactions
      .filter((t) => t.type === 'MASUK')
      .reduce((sum, t) => sum + t.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalProducts,
        totalSales,
        totalVolume,
        totalStores: await prisma.store.count(),
      },
    });
  } catch (error) {
    console.error('Error in admin getStats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 6. Admin get all feedbacks (kritik & saran)
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Error in admin getFeedbacks:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 7. Admin get all stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    console.error('Error in admin getAllStores:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 8. Admin create store
exports.createStore = async (req, res) => {
  try {
    const { name, ownerName, category, status, address, description, productCount, userId } = req.body;

    if (!name || !ownerName) {
      return res.status(400).json({ success: false, error: 'Nama toko dan nama pemilik wajib diisi' });
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        ownerName,
        category: category || 'lainnya',
        status: status || 'requested',
        address: address || '',
        description: description || '',
        productCount: Number(productCount) || 0,
        userId: userId || null,
      },
    });

    return res.status(201).json({ success: true, data: newStore, message: 'Toko berhasil ditambahkan' });
  } catch (error) {
    console.error('Error in admin createStore:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 9. Admin update store
exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ownerName, category, status, address, description, productCount } = req.body;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (productCount !== undefined) updateData.productCount = Number(productCount);

    const updated = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, data: updated, message: 'Data toko berhasil diperbarui' });
  } catch (error) {
    console.error('Error in admin updateStore:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 10. Admin update store status
exports.updateStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status wajib diisi' });
    }

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    const updated = await prisma.store.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ success: true, data: updated, message: `Status toko berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error('Error in admin updateStoreStatus:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 11. Admin delete store
exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    await prisma.store.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Toko berhasil dihapus' });
  } catch (error) {
    console.error('Error in admin deleteStore:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
