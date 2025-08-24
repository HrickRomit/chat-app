const pool = require('../config/db');

async function create({ name, email, password }) {
    const res = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    return res.rows[0];
}

async function findByEmail(email) {
    const res = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    return res.rows[0];
}

async function findById(id) {
    const res = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    );
    return res.rows[0];
}

async function updatePassword(id, password) {
    const res = await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
        [password, id]
    );
    return res.rows[0];
}

async function getByIdPublic(id) {
    const { rows } = await pool.query(
        `SELECT id, email, username, avatar_url AS "avatarUrl",
                status_message AS "statusMessage", last_seen AS "lastSeen",
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
         WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
}

async function touchLastSeen(id) {
    await pool.query(`UPDATE users SET last_seen = NOW() WHERE id = $1`, [id]);
}

async function updateProfile(id, { username, avatarUrl, statusMessage }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (typeof username === 'string') {
        fields.push(`username = $${paramIndex++}`);
        values.push(username.trim());
    }
    if (typeof avatarUrl === 'string') {
        fields.push(`avatar_url = $${paramIndex++}`);
        values.push(avatarUrl.trim());
    }
    if (typeof statusMessage === 'string') {
        fields.push(`status_message = $${paramIndex++}`);
        values.push(statusMessage.trim());
    }
    if (fields.length === 0) {
        return getByIdPublic(id);
    }
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
                 WHERE id = $${paramIndex}
                 RETURNING id, email, username, avatar_url AS "avatarUrl",
                           status_message AS "statusMessage", last_seen AS "lastSeen",
                           created_at AS "createdAt", updated_at AS "updatedAt"`;
    const { rows } = await pool.query(sql, values);
    return rows[0] || null;
}

async function getAllPublic() {
    const { rows } = await pool.query(
        `SELECT id, email, username, avatar_url AS "avatarUrl",
                status_message AS "statusMessage", last_seen AS "lastSeen"
         FROM users
         ORDER BY username, email`
    );
    return rows;
}

module.exports = {
    create,
    findByEmail,
    findById,
    updatePassword,
    getByIdPublic,
    touchLastSeen,
    updateProfile,
    getAllPublic,
};
