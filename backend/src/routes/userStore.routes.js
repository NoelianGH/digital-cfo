const express = require('express');
const router = express.Router();
const userStoreController = require('../controllers/userStore.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/user/stores', userStoreController.getMyStores);
router.post('/user/stores', userStoreController.createStore);
router.put('/user/stores/:id', userStoreController.updateStore);
router.delete('/user/stores/:id', userStoreController.deleteStore);

module.exports = router;
