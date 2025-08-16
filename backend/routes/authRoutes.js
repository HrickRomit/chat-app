const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { authRequired } = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // Store plaintext password (NOT SECURE; for temporary dev use only)
    const newUser = await User.create({ name, email, password });

        const accessToken = signAccessToken({ id: newUser.id });
        const refreshToken = signRefreshToken({ id: newUser.id });

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ token: accessToken, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(400).json({ msg: "User not found" });

        // If stored as bcrypt hash, compare with bcrypt; otherwise compare plaintext
        const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2');
        const isMatch = looksHashed
            ? await bcrypt.compare(password, user.password)
            : user.password === password;

        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const accessToken = signAccessToken({ id: user.id });
        const refreshToken = signRefreshToken({ id: user.id });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ token: accessToken, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;

// Get current user
router.get('/me', authRequired, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ msg: 'No refresh token' });
        const decoded = verifyRefreshToken(token);
        const accessToken = signAccessToken({ id: decoded.id });
        res.json({ token: accessToken });
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid refresh token' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ msg: 'Logged out' });
});
