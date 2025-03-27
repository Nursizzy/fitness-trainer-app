// Auth controller
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Client = require('../models/Client');
const validateTelegramWebAppData = require('../utils/telegramAuth');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register a new user
const register = async (req, res) => {
    try {
        const { username, firstName, lastName, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            username,
            firstName,
            lastName,
            email,
            passwordHash: password,
            role
        });

        // Create role-specific record
        if (role === 'trainer') {
            await Trainer.create({ userId: user._id });
        } else if (role === 'client') {
            await Client.create({ userId: user._id });
        }

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
};

// Login a user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
};

// Get or create user from Telegram data
const getTelegramUser = async (req, res) => {
    try {
        const { initData, role } = req.body;

        // Validate Telegram Web App data
        const telegramUser = validateTelegramWebAppData(initData);

        if (!telegramUser) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Telegram data'
            });
        }

        // Check if user exists
        let user = await User.findOne({ telegramId: telegramUser.id });

        if (!user) {
            // Create new user
            user = await User.create({
                username: telegramUser.username || `tg_${telegramUser.id}`,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name || '',
                telegramId: telegramUser.id,
                role: role || 'client'
            });

            // Create role-specific record
            if (user.role === 'trainer') {
                await Trainer.create({ userId: user._id });
            } else if (user.role === 'client') {
                await Client.create({ userId: user._id });
            }
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Telegram auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed. Please try again.'
        });
    }
};

module.exports = { register, login, getTelegramUser };