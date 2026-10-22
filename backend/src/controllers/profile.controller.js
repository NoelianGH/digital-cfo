const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// 1. Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, businessName, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    // Jika ingin ganti email, pastikan email baru belum dipakai orang lain
    if (email && email !== user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, error: 'Email sudah digunakan pengguna lain' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (email) updateData.email = email;

    // Jika ingin ganti password
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'Password baru minimal 6 karakter' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 3. Delete Profile (Account)
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { confirmationPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    if (confirmationPassword) {
      const isMatch = await bcrypt.compare(confirmationPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Password konfirmasi salah' });
      }
    }

    // Hapus data transaksi dan produk user terlebih dahulu jika perlu
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      success: true,
      message: 'Akun dan seluruh data berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
