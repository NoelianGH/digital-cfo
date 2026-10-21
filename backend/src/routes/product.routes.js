const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();
const productController = require('../controllers/product.controller')
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API Manajemen Produk UMKM
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Ambil semua produk milik user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil
 *       500:
 *         description: Kesalahan server internal
 *   post:
 *     summary: Tambahkan produk baru
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Kopi Susu Gula Aren"
 *               category:
 *                 type: string
 *                 example: "MINUMAN"
 *               price:
 *                 type: number
 *                 example: 18000
 *               stock:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       400:
 *         description: Data tidak lengkap
 *       500:
 *         description: Kesalahan server internal
 */
router.use(authenticateToken);
router.get('/products', productController.getProducts);
router.post('/products', productController.addProduct);
router.put('/products/:id', productController.updateProduct);
// router.delete('/products/:id', productController.deleteProduct);
// router.get('/products/:id', productController.getProductById);
// router.get('/products/search', productController.searchProducts);

module.exports = router;