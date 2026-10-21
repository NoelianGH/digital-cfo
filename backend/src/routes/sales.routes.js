const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Sales (POS)
 *   description: API Kasir Point of Sale (POS) & Pembuatan Struk Belanja
 */

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Checkout transaksi kasir, potong stok, bikin struk, dan otomatis masuk buku kas
 *     tags: [Sales (POS)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [TUNAI, QRIS, TRANSFER, KARTU_DEBIT, LAINNYA]
 *                 example: "TUNAI"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - qty
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "masukkan-uuid-produk-kamu"
 *                     qty:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Transaksi berhasil, struk tercetak & kas bertambah
 *       400:
 *         description: Stok tidak mencukupi atau keranjang kosong
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */

router.use(authenticateToken);

router.post('/sales', salesController.addSales);

module.exports = router;