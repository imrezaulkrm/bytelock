const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController'); // Import controller

// Destructure functions from the controller
const { encodeMessage, saveMessage, getMessages, deleteMessage, getUniversalMessages, decodeMessage } = messageController;

// POST routes
router.post('/encode', encodeMessage);
router.post('/save', saveMessage);
router.post('/decode', decodeMessage); // Add this route for decoding

// GET routes
router.get('/', getMessages);
router.get('/universal', getUniversalMessages);

// DELETE routes
router.delete('/:id', deleteMessage);

module.exports = router;


