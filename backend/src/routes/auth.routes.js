const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Autentikasi Pengguna (Register & Login)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Mendaftarkan akun pengguna baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Budi Santoso
 *               email:
 *                 type: string
 *                 example: budi@gmail.com
 *               password:
 *                 type: string
 *                 example: rahasia123
 *               businessName:
 *                 type: string
 *                 example: Kedai Kopi Kenangan
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil
 *       400:
 *         description: Data tidak lengkap atau email sudah digunakan
 *       500:
 *         description: Kesalahan server internal
 */
router.post("/auth/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Masuk dan mendapatkan JWT Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: budi@gmail.com
 *               password:
 *                 type: string
 *                 example: rahasia123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT
 *       401:
 *         description: Email atau password salah
 *       500:
 *         description: Kesalahan server internal
 */
router.post("/auth/login", authController.login);

module.exports = router;