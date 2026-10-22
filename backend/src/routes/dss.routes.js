const express = require('express');
const router = express.Router();
const dssController = require('../controllers/dss.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Recommendations (DSS)
 *   description: Sistem Pendukung Keputusan Rekomendasi Bisnis menggunakan Metode SAW
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Dapatkan Top 3 Rekomendasi Solusi Bisnis Terbaik (SAW Ranking)
 *     tags: [Recommendations (DSS)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rekomendasi berhasil dihitung dan diranking
 *       400:
 *         description: Belum ada data health score
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/recommendations', authenticateToken, dssController.getRecommendations);

module.exports = router;