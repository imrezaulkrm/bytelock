const crypto = require('crypto');
const Message = require('../models/message');
const { isDBConnected } = require('../config/db');

const algorithm = 'aes-256-cbc';

// Custom Encoding Function
const customEncode = (message, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
};

// Custom Decoding Function
const customDecode = (encodedMessage, key) => {
    const [ivBase64, encryptedData] = encodedMessage.split(':');
    const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), Buffer.from(ivBase64, 'base64'));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Encode Message (Anonymous + Logged-in)
const encodeMessage = async (req, res) => {
    const { message, key, title } = req.body;
    
    if (!message || !key) {
        return res.status(400).json({ 
            success: false,
            message: "Message and key are required" 
        });
    }

    try {
        const encodedMessage = customEncode(message, key);
        
        // If DB not connected, just encode (don't save)
        if (!isDBConnected()) {
            return res.status(200).json({ 
                success: true,
                message: "Message encoded (offline mode)",
                mode: "offline",
                encodedMessage
            });
        }

        // Save to DB
        const newMessage = new Message({
            userId: req.user?.userId || null,  // null = orphan
            message: encodedMessage,
            key,
            title: title || 'Untitled',
            isOrphan: !req.user?.userId
        });
        
        await newMessage.save();

        res.status(200).json({ 
            success: true,
            message: req.user?.userId ? "Saved to your account" : "Saved as orphan (login to claim)",
            mode: req.user?.userId ? "authenticated" : "anonymous",
            encodedMessage,
            messageId: newMessage._id
        });
    } catch (err) {
        console.error('Encode error:', err);
        res.status(500).json({ 
            success: false,
            message: "Error encoding message", 
            error: err.message 
        });
    }
};

// Decode Message (No auth needed)
const decodeMessage = (req, res) => {
    const { encodedMessage, key } = req.body;
    
    if (!encodedMessage || !key) {
        return res.status(400).json({ 
            success: false,
            message: "Encoded message and key are required" 
        });
    }

    try {
        const decodedMessage = customDecode(encodedMessage, key);
        
        res.status(200).json({ 
            success: true,
            decodedMessage 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Wrong key or corrupted data" 
        });
    }
};

// Save Message (Logged-in users only)
const saveMessage = async (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({ 
            success: false,
            message: "Please login to save messages" 
        });
    }

    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    const { message, key, title } = req.body;

    try {
        const encodedMessage = customEncode(message, key);
        
        const newMessage = new Message({
            userId: req.user.userId,
            message: encodedMessage,
            key,
            title: title || 'Untitled',
            isOrphan: false
        });
        
        await newMessage.save();

        res.status(200).json({ 
            success: true,
            message: "Message saved successfully!",
            messageId: newMessage._id
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error saving message" 
        });
    }
};

// Get My Messages (Logged-in users only)
const getMessages = async (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({ 
            success: false,
            message: "Please login to view messages" 
        });
    }

    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const messages = await Message.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true,
            count: messages.length,
            messages
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching messages" 
        });
    }
};

// Get Orphan Messages (Public)
const getUniversalMessages = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const messages = await Message.find({ isOrphan: true })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ 
            success: true,
            count: messages.length,
            messages 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching messages" 
        });
    }
};

// Delete Message
const deleteMessage = async (req, res) => {
    if (!isDBConnected()) {
        return res.status(503).json({ 
            success: false,
            message: "Database not connected" 
        });
    }

    try {
        const query = req.user?.userId 
            ? { _id: req.params.id, userId: req.user.userId }
            : { _id: req.params.id, isOrphan: true };

        const message = await Message.findOneAndDelete(query);

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
        res.status(500).json({ 
            success: false,
            message: "Error deleting message" 
        });
    }
};

module.exports = {
    encodeMessage,
    saveMessage,
    getMessages,
    getUniversalMessages,
    deleteMessage,
    decodeMessage
};