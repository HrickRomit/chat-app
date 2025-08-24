const express = require('express');
const { authRequired } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.get('/me', authRequired, async (req,res,next)=> {
    try {
        const userId = req.user?.id || req.userId;
    if(!userId) return res.status(401).json({message: "Unauthorized"});
    await User.touchLastSeen(userId);
    const user = await User.getByIdPublic(userId);
    if(!user) return res.status(404).json({message: "User not found"});
        return res.json(user);
    }catch (err){
        next(err);
    }
});

router.put("/me", authRequired, async (req,res, next)=>{
   try {
        const userId = req.user?.id || req.userId;
    if(!userId) return res.status(401).json({message: "Unauthorized"});
    const {username, avatarUrl, statusMessage} = req.body || {};
    const user = await User.updateProfile(userId, { username, avatarUrl, statusMessage });
    if(!user) return res.status(404).json({message: "User not found"});
        return res.json(user);
    }catch (err){
        next(err);
    }
})

// Get all users (public info only)
router.get('/', authRequired, async (req, res, next) => {
    try {
        const users = await User.getAllPublic();
        return res.json(users);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
