const express = require('express');
const { authRequired } = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const router = express.Router();

// GET /api/chats - Get all chats for current user
router.get('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.getUserChats(userId); // ✅ Matches your model
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// POST /api/chats - Create or get direct chat with another user
router.post('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: 'otherUserId is required' });
    }

    if (otherUserId === userId) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    const chat = await Chat.getOrCreateDirectChat(userId, otherUserId); // ✅ Matches your model
    res.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
});

// GET /api/chats/:chatId/messages - Get messages for a specific chat
router.get('/:chatId/messages', authRequired, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.getChatMessages( // ✅ Matches your model
      parseInt(chatId), 
      parseInt(limit), 
      parseInt(offset)
    );
    
    const totalCount = await Message.getChatMessageCount(parseInt(chatId)); // ✅ Matches your model
    
    res.json({
      messages,
      totalCount,
      hasMore: (parseInt(offset) + messages.length) < totalCount
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST /api/chats/:chatId/messages - Send a message
router.post('/:chatId/messages', authRequired, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.createMessage( // ✅ Matches your model
      parseInt(chatId), 
      senderId, 
      content.trim()
    );

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;