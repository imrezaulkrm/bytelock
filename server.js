const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const session = require('express-session');
const { connectDB, isDBConnected } = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');

dotenv.config();

// Connect DB (non-blocking)
connectDB();

require('./config/passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'secret', 
    resave: false, 
    saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: isDBConnected() ? 'connected' : 'disconnected'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'ByteLock API',
        version: '1.0.0',
        database: isDBConnected() ? 'connected' : 'disconnected',
        features: ['Anonymous encryption', 'Google Auth', 'Admin Panel']
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Database: ${isDBConnected() ? 'connected' : 'disconnected'}`);
});