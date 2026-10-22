const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API Manajemen Profil Pengguna
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Ambil profil pengguna yang sedang login
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Perbarui profil atau kata sandi pengguna
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *   delete:
 *     summary: Hapus akun pengguna
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 */
router.get('/user/profile', authenticateToken, profileController.getProfile);
router.put('/user/profile', authenticateToken, profileController.updateProfile);
router.delete('/user/profile', authenticateToken, profileController.deleteProfile);

module.exports = router;
