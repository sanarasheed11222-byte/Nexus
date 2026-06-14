const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Create video room
router.post('/room', auth, async (req, res) => {
  try {
    const roomId = uuidv4();
    res.json({ roomId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room info
router.get('/room/:roomId', auth, async (req, res) => {
  try {
    res.json({ roomId: req.params.roomId, status: 'active' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;