// src/routes/extract.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const extractController = require('../controllers/extract.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Setup multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

/**
 * @swagger
 * tags:
 *   name: Smart Extraction
 *   description: OCR Scan & PDF to Data Extraction
 */

router.post('/extract/ocr', authenticateToken, extractController.extractOcr);
router.post('/extract/pdf', authenticateToken, upload.single('file'), extractController.extractPdf);

module.exports = router;
