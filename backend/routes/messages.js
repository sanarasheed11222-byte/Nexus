const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// SEND message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET conversation between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all conversations
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 });

    // Get unique conversations
    const conversations = {};
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === req.user.id 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
      
      if (!conversations[otherId]) {
        conversations[otherId] = msg;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MARK messages as read
router.put('/:userId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;