const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

const server = createServer(app);

// Add Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Routes
app.get('/', (req, res) => {
    res.send('Backend is running');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

// If you don’t already expose /api/auth/me from authRoutes, add a pass-through here:
const { authRequired } = require('./middleware/authMiddleware');
const User = require('./models/User');
app.get('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.getByIdPublic(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User left chat ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server (use server instead of app)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

