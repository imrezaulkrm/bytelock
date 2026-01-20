const User = require('../models/user');
const Message = require('../models/message');
const { isDBConnected } = require('../config/db');

// Get All Users
exports.getAllUsers = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const messageCount = await Message.countDocuments({ userId: user._id });
            
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                messageCount
            };
        }));

        res.json({ 
            success: true,
            count: users.length,
            users: usersWithStats
        });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error fetching users" 
        });
    }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const messages = await Message.find({ userId: user._id })
            .sort({ createdAt: -1 });

        res.json({ 
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            messages: {
                count: messages.length,
                list: messages
            }
        });
    } catch (err) {
        console.error('Get user details error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error fetching user details" 
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Delete all user's messages
        await Message.deleteMany({ userId: req.params.userId });

        res.json({ 
            success: true,
            message: "User and their messages deleted successfully"
        });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error deleting user" 
        });
    }
};

// Delete User's Message
exports.deleteUserMessage = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const message = await Message.findOneAndDelete({
            _id: req.params.messageId,
            userId: req.params.userId
        });

        if (!message) {
            return res.status(404).json({ 
                success: false,
                message: "Message not found" 
            });
        }

        res.json({ 
            success: true,
            message: "Message deleted successfully" 
        });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error deleting message" 
        });
    }
};

// Get Statistics
exports.getStats = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const totalUsers = await User.countDocuments();
        const totalMessages = await Message.countDocuments({ isOrphan: false });
        const orphanMessages = await Message.countDocuments({ isOrphan: true });

        res.json({ 
            success: true,
            stats: {
                totalUsers,
                totalMessages,
                orphanMessages,
                totalStoredMessages: totalMessages + orphanMessages
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching stats" 
        });
    }
};