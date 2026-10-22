const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Promos
 *   description: API Manajemen Promosi & Diskon UMKM
 */

router.use(authenticateToken);

router.get('/promos', promoController.getPromos);
router.get('/promos/:id', promoController.getPromoById);
router.post('/promos', promoController.addPromo);
router.put('/promos/:id', promoController.updatePromo);
router.delete('/promos/:id', promoController.deletePromo);

module.exports = router;
