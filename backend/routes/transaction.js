import express from 'express';
import {
  createTransaction,
  getTransactionById,
  addOffer,
  acceptOffer,
  updateTransactionState,
  addTracePoint,
  expireTransaction,
  unlistTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.post('/:id/offers', addOffer);
router.post('/:id/accept', acceptOffer);
router.put('/:id/state', updateTransactionState);
router.post('/:id/trace', addTracePoint);
router.put('/:id/expire', expireTransaction);
router.put('/:id/unlist', unlistTransaction);

export default router;
