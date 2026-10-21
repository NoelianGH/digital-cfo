// src/routes/healthRoutes.js
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Cek status server backend
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server berjalan normal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: 2026-10-15T20:50:00.000Z
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;