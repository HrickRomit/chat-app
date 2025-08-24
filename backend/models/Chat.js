const pool = require('../config/db');

// Create a new direct chat between two users
async function createDirectChat(user1Id, user2Id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Create the chat
        const chatResult = await client.query(
            'INSERT INTO chats (type) VALUES ($1) RETURNING *',
            ['direct']
        );
        const chat = chatResult.rows[0];
        
        // Add both users as participants
        await client.query(
            'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
            [chat.id, user1Id, user2Id]
        );
        
        await client.query('COMMIT');
        return chat;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Find existing direct chat between two users
async function findDirectChat(user1Id, user2Id) {
    const { rows } = await pool.query(`
        SELECT c.* FROM chats c
        JOIN chat_participants cp1 ON c.id = cp1.chat_id
        JOIN chat_participants cp2 ON c.id = cp2.chat_id
        WHERE c.type = 'direct'
        AND cp1.user_id = $1 
        AND cp2.user_id = $2
    `, [user1Id, user2Id]);
    
    return rows[0] || null;
}

// Get all chats for a user with last message info
async function getUserChats(userId) {
    const { rows } = await pool.query(`
        SELECT 
            c.*,
            m.content as last_message_content,
            m.sent_at as last_message_sent_at,
            sender.username as last_message_sender,
            -- For direct chats, get the other participant's info
            CASE 
                WHEN c.type = 'direct' THEN other_user.username
                ELSE c.name
            END as display_name,
            other_user.avatar_url as other_user_avatar
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id
        LEFT JOIN messages m ON c.id = m.chat_id 
            AND m.sent_at = c.last_message_at
        LEFT JOIN users sender ON m.sender_id = sender.id
        -- Get other participant for direct chats
        LEFT JOIN chat_participants other_cp ON c.id = other_cp.chat_id 
            AND other_cp.user_id != $1 AND c.type = 'direct'
        LEFT JOIN users other_user ON other_cp.user_id = other_user.id
        WHERE cp.user_id = $1
        ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `, [userId]);
    
    return rows;
}

// Get or create direct chat (commonly used pattern)
async function getOrCreateDirectChat(user1Id, user2Id) {
    // Check if chat already exists
    let chat = await findDirectChat(user1Id, user2Id);
    
    if (!chat) {
        // Create new chat if it doesn't exist
        chat = await createDirectChat(user1Id, user2Id);
    }
    
    return chat;
}

module.exports = {
    createDirectChat,
    findDirectChat,
    getUserChats,
    getOrCreateDirectChat,
};
