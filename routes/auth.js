const express = require('express');
const passport = require('passport');
const router = express.Router();
const { googleLogin } = require('../controllers/authController');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), 
    googleLogin
);

module.exports = router;
