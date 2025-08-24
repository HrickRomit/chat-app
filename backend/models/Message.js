const pool = require('../config/db');

// Send a new message to a chat
async function createMessage(chatId, senderId, content, messageType = 'text') {
    const { rows } = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, senderId, content, messageType]
    );
    
    // Get the message with sender info for immediate return
    const messageWithSender = await getMessageById(rows[0].id);
    return messageWithSender;
}

// Get a single message by ID with sender info
async function getMessageById(messageId) {
    const { rows } = await pool.query(`
        SELECT 
            m.*,
            u.username as sender_username,
            u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = $1
    `, [messageId]);
    
    return rows[0] || null;
}

// Get messages for a chat with pagination
async function getChatMessages(chatId, limit = 50, offset = 0) {
    const { rows } = await pool.query(`
        SELECT 
            m.*,
            u.username as sender_username,
            u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = $1
        ORDER BY m.sent_at DESC
        LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);
    
    // Reverse to show oldest first (DESC was for pagination)
    return rows.reverse();
}

// Get message count for a chat (useful for pagination)
async function getChatMessageCount(chatId) {
    const { rows } = await pool.query(
        'SELECT COUNT(*) as count FROM messages WHERE chat_id = $1',
        [chatId]
    );
    return parseInt(rows[0].count);
}

// Delete old messages (for retention policy later)
async function deleteOldMessages(daysOld = 30) {
    const { rows } = await pool.query(
        'DELETE FROM messages WHERE sent_at < NOW() - INTERVAL \'%s days\' RETURNING id',
        [daysOld]
    );
    return rows.length; // Return count of deleted messages
}

module.exports = {
    createMessage,
    getMessageById,
    getChatMessages,
    getChatMessageCount,
    deleteOldMessages,
};
