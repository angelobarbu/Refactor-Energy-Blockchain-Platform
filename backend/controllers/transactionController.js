import { Transaction, User } from '../models/index.js';

export const createTransaction = async (req, res) => {
  const { price, quantity, resource, deadline, autoAcceptBestOffer, isBuyTransaction } = req.body;

  try {
    const transaction = await Transaction.create({
      buyerId: isBuyTransaction ? req.user.id : null,
      sellerId: isBuyTransaction ? null : req.user.id,
      price,
      quantity,
      resource,
      state: 'Listed',
      deadline,
      autoAcceptBestOffer,
      tracePoints: []
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Other transaction-related controllers...
