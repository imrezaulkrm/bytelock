const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    key: { type: String, required: true },
});

module.exports = mongoose.model('Message', MessageSchema);
