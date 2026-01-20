const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null  // null for orphan messages
    },
    message: { type: String, required: true },
    key: { type: String, required: true },
    title: { type: String, default: 'Untitled' },
    isOrphan: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Auto-delete orphan messages after 30 days
MessageSchema.index(
    { createdAt: 1 }, 
    { 
        expireAfterSeconds: 30 * 24 * 60 * 60,
        partialFilterExpression: { isOrphan: true }
    }
);

module.exports = mongoose.model('Message', MessageSchema);