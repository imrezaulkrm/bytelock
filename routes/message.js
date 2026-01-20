const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public routes (no auth needed)
router.post('/encode', optionalAuth, messageController.encodeMessage);
router.post('/decode', messageController.decodeMessage);
router.get('/universal', messageController.getUniversalMessages);

// Semi-protected (optional auth)
router.delete('/:id', optionalAuth, messageController.deleteMessage);

// Protected routes (require auth)
router.post('/save', authenticate, messageController.saveMessage);
router.get('/', authenticate, messageController.getMessages);

module.exports = router;