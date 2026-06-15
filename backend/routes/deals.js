const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');

// GET all deals for investor
router.get('/', auth, async (req, res) => {
  try {
    const deals = await Deal.find({ investor: req.user.id })
      .populate('entrepreneur', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE deal
router.post('/', auth, async (req, res) => {
  try {
    const { entrepreneurId, startupName, industry, amount, equity, status, stage, notes } = req.body;
    const deal = new Deal({
      investor: req.user.id,
      entrepreneur: entrepreneurId,
      startupName,
      industry,
      amount,
      equity,
      status,
      stage,
      notes
    });
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE deal status
router.put('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE deal
router.delete('/:id', auth, async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;