// src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: API Manajemen Transaksi Pembukuan Kas UMKM
 */

router.get('/transactions', authenticateToken, transactionController.getTransactions);
router.post('/transactions', authenticateToken, transactionController.addTransaction);
router.post('/transactions/batch', authenticateToken, transactionController.batchAddTransactions);
router.put('/transactions/:id', authenticateToken, transactionController.updateTransaction);
router.delete('/transactions/:id', authenticateToken, transactionController.deleteTransaction);
router.get('/transactions/summary', authenticateToken, transactionController.getSummary);

module.exports = router;