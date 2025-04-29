const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.googleLogin = async (req, res) => {
    const { googleId, name, email } = req.user;

    try {
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, name, email });
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error logging in" });
    }
};
