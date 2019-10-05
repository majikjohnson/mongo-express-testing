const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @ROUTE   POST /api/users
// @DESC    Register a user
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({msg: 'User already exists in database'});
        
        const user = new User({
            name,
            email,
            password
        });

        await user.save();
        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.errmsg}); 
    }
});

module.exports = router;