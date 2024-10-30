import express from 'express';
import authRoutes from './auth.js';
import transactionRoutes from './transaction.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);

export default router;
