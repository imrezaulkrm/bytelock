const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error('Deserialize error:', err.message);
        done(err, null);
    }
});

// Only setup Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value
                });
                await user.save();
                console.log('✓ New user created via Google OAuth');
            }
            
            return done(null, user);
        } catch (err) {
            console.error('Google OAuth error:', err.message);
            done(err, null);
        }
    }));
    
    console.log('✓ Google OAuth strategy configured');
} else {
    console.log('⚠️  Google OAuth not configured (credentials missing)');
}

module.exports = passport;