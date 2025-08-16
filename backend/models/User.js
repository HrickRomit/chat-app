const pool = require('../config/db');

const User = {
    create: async ({ name, email, password }) => {
        const res = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );
        return res.rows[0];
    },
    findByEmail: async (email) => {
        const res = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        return res.rows[0];
    },
    findById: async (id) => {
        const res = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );
        return res.rows[0];
    },
    updatePassword: async (id, password) => {
        const res = await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
            [password, id]
        );
        return res.rows[0];
    }
};

module.exports = User;
