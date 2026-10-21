// src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: API Manajemen Transaksi Pembukuan Kas UMKM
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Ambil semua riwayat transaksi
 *     tags: [Transactions]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar transaksi berhasil diambil
 *       500:
 *         description: Kesalahan server internal
 *   post:
 *     summary: Tambahkan transaksi baru ke buku kas
 *     tags: [Transactions]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - description
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-25T00:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: "Penjualan Kopi Susu 20 Cup"
 *               amount:
 *                 type: number
 *                 example: 360000
 *               type:
 *                 type: string
 *                 enum: [MASUK, KELUAR, MODAL]
 *                 example: MASUK
 *               category:
 *                 type: string
 *                 enum: [MODAL, PENJUALAN, BAHAN_BAKU, OPERASIONAL, LAINNYA]
 *                 example: PENJUALAN
 *     responses:
 *       201:
 *         description: Transaksi berhasil ditambahkan
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */

const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/transactions', authenticateToken, transactionController.getTransactions);
router.post('/transactions', authenticateToken, transactionController.addTransaction);
router.get('/transactions/summary', authenticateToken, transactionController.getSummary);
module.exports = router;