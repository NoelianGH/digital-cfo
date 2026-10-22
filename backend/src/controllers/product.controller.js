const prisma = require('../config/database');

function normalizeCategory(cat) {
  if (!cat) return 'LAINNYA';
  const c = String(cat).toUpperCase();
  if (c.includes('MINUM')) return 'MINUMAN';
  if (c.includes('MAKAN')) return 'MAKANAN';
  if (c.includes('JASA')) return 'JASA';
  return 'LAINNYA';
}

// 1. Get all products for user
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 2. Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error getting product by id:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 3. Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nama dan harga produk wajib diisi' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: String(name).trim(),
        category: normalizeCategory(category),
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        userId: req.user.userId,
        isActive: true,
      },
    });

    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

// 4. Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, isActive } = req.body;

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    const updateData = {};
    if (name) updateData.name = String(name).trim();
    if (category) updateData.category = normalizeCategory(category);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// 5. Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    // Soft delete or hard delete
    await prisma.product.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};