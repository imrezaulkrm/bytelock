const jwt = require('jsonwebtoken');

// Required authentication
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Please login first" 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (err) {
        res.status(401).json({ 
            success: false,
            message: "Invalid token" 
        });
    }
};

// Optional authentication
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } else {
            req.user = null;
        }
        
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

// Admin check
exports.isAdmin = async (req, res, next) => {
    const User = require('../models/user');
    
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user || user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ 
                success: false,
                message: "Admin access required" 
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error checking admin status" 
        });
    }
};