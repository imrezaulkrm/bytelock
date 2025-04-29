const mongoose = require('mongoose');

const UniversalMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    key: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UniversalMessage', UniversalMessageSchema);

