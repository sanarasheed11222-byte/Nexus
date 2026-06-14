const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// DEPOSIT
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    const transaction = new Transaction({
      sender: req.user.id,
      receiver: req.user.id,
      amount,
      type: 'deposit',
      status: 'completed',
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// WITHDRAW
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    const transaction = new Transaction({
      sender: req.user.id,
      receiver: req.user.id,
      amount,
      type: 'withdrawal',
      status: 'completed',
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// TRANSFER
router.post('/transfer', auth, async (req, res) => {
  try {
    const { receiverId, amount, description } = req.body;

    const transaction = new Transaction({
      sender: req.user.id,
      receiver: receiverId,
      amount,
      type: 'transfer',
      status: 'completed',
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET transaction history
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET balance
router.get('/balance', auth, async (req, res) => {
  try {
    const deposits = await Transaction.aggregate([
      { $match: { receiver: req.user.id, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawals = await Transaction.aggregate([
      { $match: { sender: req.user.id, type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const depositsTotal = deposits[0]?.total || 0;
    const withdrawalsTotal = withdrawals[0]?.total || 0;
    const balance = depositsTotal - withdrawalsTotal;

    res.json({ balance, depositsTotal, withdrawalsTotal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;