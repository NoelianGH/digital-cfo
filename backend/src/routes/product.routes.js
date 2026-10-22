const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API Manajemen Produk UMKM
 */

router.use(authenticateToken);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.addProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;