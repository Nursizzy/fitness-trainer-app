// Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-passwordHash');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

// Middleware to check if user is a trainer
const trainerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'trainer') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Not authorized, trainer only' });
    }
};

// Middleware to check if user is a client
const clientOnly = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Not authorized, client only' });
    }
};

module.exports = { protect, trainerOnly, clientOnly };