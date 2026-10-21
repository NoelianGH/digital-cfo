const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthscore.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Health Score
 *   description: Analisis Kesehatan Keuangan UMKM menggunakan Fuzzy Tsukamoto
 */

/**
 * @swagger
 * /api/health-score:
 *   get:
 *     summary: Hitung dan ambil skor kesehatan keuangan UMKM terbaru
 *     tags: [Health Score]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health score berhasil dihitung
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/health-score', authenticateToken, healthController.getHealthScore);

module.exports = router;