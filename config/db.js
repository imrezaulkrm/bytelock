const mongoose = require('mongoose');

const connectDB = async () => {
    // Check if MONGO_URI exists and is not empty
    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
        console.log('⚠️  MONGO_URI not configured');
        console.log('⚠️  Running without database - some features will be limited');
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB connected successfully');
        console.log(`✓ Database: ${mongoose.connection.name}`);
        return true;
    } catch (err) {
        console.error('⚠️  MongoDB connection failed:', err.message);
        console.log('⚠️  Continuing without database - some features will be limited');
        return false;
    }
};

// Check if database is connected
const isDBConnected = () => {
    return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
