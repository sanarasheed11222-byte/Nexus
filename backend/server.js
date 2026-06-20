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
const videoRoutes = require('./routes/video');
const notificationRoutes = require('./routes/notifications');
const dealRoutes = require('./routes/deals');
const helpRoutes = require('./routes/help');




app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/help', helpRoutes);





// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Nexus Backend is running!' });
});

// Socket.IO
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('JOIN EVENT - userId:', userId, 'socketId:', socket.id);
    console.log('Current onlineUsers:', onlineUsers);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content } = data;
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });
    await message.save();

    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receiveMessage', {
        senderId,
        content,
        createdAt: message.createdAt
      });
    }
  });

socket.on('callUser', (data) => {
    const { userToCall, from, name, roomId } = data;
    console.log('CALL ATTEMPT - userToCall:', userToCall, 'found socket?', onlineUsers[userToCall]);
    const receiverSocket = onlineUsers[userToCall];
    if (receiverSocket) {
      io.to(receiverSocket).emit('incomingCall', {
        from,
        name,
        roomId
      });
    }
  });

  socket.on('answerCall', (data) => {
    const callerSocket = onlineUsers[data.to];
    if (callerSocket) {
      io.to(callerSocket).emit('callAccepted', data.signal);
    }
  });
const roomUsers = {};

socket.on('joinRoom', (roomId) => {
  socket.join(roomId);
  if (!roomUsers[roomId]) roomUsers[roomId] = [];
  
  const isFirstUser = roomUsers[roomId].length === 0;
  roomUsers[roomId].push(socket.id);
  
  socket.emit('roomJoined', { isInitiator: isFirstUser });
  
  if (!isFirstUser) {
    socket.to(roomId).emit('userJoinedRoom');
  }

  socket.on('disconnect', () => {
    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(id => id !== socket.id);
    }
  });
});

socket.on('sendSignal', ({ roomId, signal }) => {
  socket.to(roomId).emit('receiveSignal', { signal });
});

  socket.on('endCall', (data) => {
    const receiverSocket = onlineUsers[data.to];
    if (receiverSocket) {
      io.to(receiverSocket).emit('callEnded');
    }
  });
  socket.on('offer', ({ roomId, offer }) => {
  socket.to(roomId).emit('offer', { offer });
});

socket.on('answer', ({ roomId, answer }) => {
  socket.to(roomId).emit('answer', { answer });
});

socket.on('iceCandidate', ({ roomId, candidate }) => {
  socket.to(roomId).emit('iceCandidate', { candidate });
});

  socket.on('disconnect', () => {
    Object.keys(onlineUsers).forEach(userId => {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    });
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