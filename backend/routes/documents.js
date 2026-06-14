const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Setup file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// UPLOAD document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const document = new Document({
      title,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET my documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { uploadedBy: req.user.id },
        { sharedWith: req.user.id }
      ]
    })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// SIGN document
router.put('/:id/sign', auth, async (req, res) => {
  try {
    const { signature } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.signature = signature;
    document.status = 'signed';
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// SHARE document
router.put('/:id/share', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (!document.sharedWith.includes(userId)) {
      document.sharedWith.push(userId);
      await document.save();
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE document
router.delete('/:id', auth, async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;