const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Nexus Backend is running!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ Connection error:', err);
  });