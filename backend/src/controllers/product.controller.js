const prisma = require('../config/database');

exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { userId: req.user.userId, isActive: true }, // Ambil produk hanya untuk user yang sedang login
            orderBy: { createdAt: 'asc' },
        });
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, category, stock} = req.body;

        // Validasi input
        if (!name || !price || !category || !stock) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Simpan produk dan kaitkan ke user.id
        const newProduct = await prisma.product.create({
            data: {
                name,
                category: category || 'LAINNYA', // Default category jika tidak diberikan
                price: parseFloat(price),
                stock: parseInt(stock) || 0, // Default stock jika tidak diberikan
                userId: req.user.userId, // ✅ ID user yang valid dari database
            },
        });

        return res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock } = req.body;

        // Validasi input
        if (!name || !category || !price) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Update produk
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                category,
                price: price ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined, // Default stock jika tidak diberikan
            },
        });

        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};