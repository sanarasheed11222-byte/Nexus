const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MARK all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MARK one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE notification (internal use)
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, type, content } = req.body;
    const notification = new Notification({
      recipient: recipientId,
      sender: req.user.id,
      type,
      content
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;