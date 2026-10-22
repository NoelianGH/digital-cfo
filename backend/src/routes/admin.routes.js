const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Helper to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Akses khusus Administrator' });
};

router.use('/admin', authenticateToken, requireAdmin);

router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/feedbacks', adminController.getFeedbacks);

// Store routes
router.get('/admin/stores', adminController.getAllStores);
router.post('/admin/stores', adminController.createStore);
router.put('/admin/stores/:id', adminController.updateStore);
router.patch('/admin/stores/:id/status', adminController.updateStoreStatus);
router.delete('/admin/stores/:id', adminController.deleteStore);

module.exports = router;
