const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin check
router.use(authenticate);
router.use(isAdmin);

// Admin routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.delete('/users/:userId', adminController.deleteUser);
router.delete('/users/:userId/messages/:messageId', adminController.deleteUserMessage);
router.get('/stats', adminController.getStats);

module.exports = router;