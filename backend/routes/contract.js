const express = require('express');
const { createBuyTransaction, createSellTransaction, getTransaction, addOffer, acceptOffer, updateState } = require('../controllers/contract');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.post('/buy', authenticate, createBuyTransaction);
router.post('/sell', authenticate, createSellTransaction);
router.get('/:id', authenticate, getTransaction);
router.post('/offer/:id', authenticate, addOffer);
router.post('/accept/:id', authenticate, acceptOffer);
router.post('/state/:id', authenticate, updateState);

module.exports = router;
