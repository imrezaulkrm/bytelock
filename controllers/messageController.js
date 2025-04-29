const crypto = require('crypto');
const Message = require('../models/message');
const UniversalMessage = require('../models/universalMessage');

const algorithm = 'aes-256-cbc'; // AES Algorithm
const iv = crypto.randomBytes(16); // Initialization Vector

// Custom Encoding Function
const customEncode = (message, key) => {
    const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
    let encrypted = cipher.update(message, 'utf8', 'base64'); // Use 'base64' instead of 'hex'
    encrypted += cipher.final('base64'); // Use 'base64' instead of 'hex'
    return `${iv.toString('base64')}:${encrypted}`; // Store IV with the encrypted text
};

// Custom Decoding Function
const customDecode = (encodedMessage, key) => {
    const [ivBase64, encryptedData] = encodedMessage.split(':'); // Split IV and encrypted data
    const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), Buffer.from(ivBase64, 'base64')); // Use 'base64'
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8'); // Use 'base64'
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Encode Message
const encodeMessage = async (req, res) => {
    const { message, key, userId } = req.body;
    if (!message || !key) {
        return res.status(400).json({ message: "Message and key are required" });
    }
    try {
        const encodedMessage = customEncode(message, key);
        if (!userId) {
            const newMessage = new UniversalMessage({ message: encodedMessage, key });
            await newMessage.save();
        }
        res.status(200).json({ encodedMessage });
    } catch (err) {
        res.status(500).json({ message: "Error encoding message", error: err });
    }
};

// Save Message
const saveMessage = async (req, res) => {
    const { message, key, userId } = req.body;
    if (!userId) {
        return res.status(403).json({ message: "You must be logged in to save messages" });
    }
    try {
        const newMessage = new Message({ message, key, user: userId });
        await newMessage.save();
        res.status(200).json({ message: "Message saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error saving message", error: err });
    }
};

// Get Messages
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages", error: err });
    }
};

// Get Universal Messages
const getUniversalMessages = async (req, res) => {
    try {
        const messages = await UniversalMessage.find();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching universal messages", error: err });
    }
};

// Delete Message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting message", error: err });
    }
};

// Decode Message
const decodeMessage = (req, res) => {
    const { encodedMessage, key } = req.body;
    if (!encodedMessage || !key) {
        return res.status(400).json({ message: "Encoded message and key are required" });
    }
    try {
        const decodedMessage = customDecode(encodedMessage, key);
        res.status(200).json({ decodedMessage });
    } catch (err) {
        res.status(500).json({ message: "Error decoding message", error: err });
    }
};

// Export functions
module.exports = {
    encodeMessage,
    saveMessage,
    getMessages,
    getUniversalMessages,
    deleteMessage,
    decodeMessage
};
