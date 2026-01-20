const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { isDBConnected } = require('../config/db');

// Google Login Handler - UPDATED
exports.googleLogin = async (req, res) => {
    // Check if database is connected
    if (!isDBConnected()) {
        return res.redirect('/?error=database_offline');
    }

    const { googleId, name, email, avatar } = req.user;

    try {
        let user = await User.findOne({ googleId });
        
        if (!user) {
            user = new User({ 
                googleId, 
                name, 
                email,
                avatar: avatar || undefined
            });
            await user.save();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        const userData = encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }));

        // Redirect to callback page with token
        res.redirect(`/callback.html?token=${token}&user=${userData}`);
    } catch (err) {
        console.error('Login error:', err);
        res.redirect('/?error=login_failed');
    }
};

// Register User (if needed) - NO CHANGE
exports.register = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected - registration unavailable" 
        });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            });
        }

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error creating user" 
        });
    }
};

// Login User (if needed) - NO CHANGE
exports.login = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected - login unavailable" 
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // Add password comparison here if you have password hashing

        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error logging in" 
        });
    }
};