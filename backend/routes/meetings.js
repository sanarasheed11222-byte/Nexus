const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// CREATE meeting
router.post('/', auth, async (req, res) => {
  try {
    const { title, participant, date, duration, notes } = req.body;

    // Check for conflicts
    const conflict = await Meeting.findOne({
      participant,
      date,
      status: { $in: ['pending', 'accepted'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot already booked!' });
    }

    const meeting = new Meeting({
      title,
      organizer: req.user.id,
      participant,
      date,
      duration,
      notes
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET my meetings
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.id },
        { participant: req.user.id }
      ]
    })
    .populate('organizer', 'name email avatar')
    .populate('participant', 'name email avatar')
    .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ACCEPT meeting
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'accepted';
    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// REJECT meeting
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'rejected';
    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CANCEL meeting
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'cancelled';
    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;