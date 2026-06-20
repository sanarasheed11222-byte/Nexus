const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(),limits: { fileSize: 100 * 1024 }
 });
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/investors', auth, async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' }).select('-password');
    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/entrepreneurs', auth, async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' }).select('-password');
    res.json(entrepreneurs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const base64Image = 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: base64Image },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
