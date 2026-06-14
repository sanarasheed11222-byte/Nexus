const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const meetingRoutes = require('./routes/meetings');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Nexus Backend is running!' });
});

// Socket.IO for real-time chat
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('User joined:', userId);
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content } = data;

    // Save to database
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });
    await message.save();

    // Send to receiver if online
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receiveMessage', {
        senderId,
        content,
        createdAt: message.createdAt
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    Object.keys(onlineUsers).forEach(userId => {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ Connection error:', err);
  });