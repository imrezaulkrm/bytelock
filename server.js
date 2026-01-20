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
app.use(cors());
app.use(express.json());
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'secret', 
    resave: false, 
    saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'ByteLock API',
        database: isDBConnected() ? 'connected' : 'disconnected',
        features: ['Anonymous encryption', 'Google Auth', 'Admin Panel']
    });
});

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Database: ${isDBConnected() ? 'connected' : 'disconnected'}`);
});