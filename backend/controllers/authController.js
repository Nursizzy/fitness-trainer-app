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

// Get or create user from Telegram data
const getTelegramUser = async (req, res) => {
    try {
        const { initData, role, userAgent, platform } = req.body;

        // Log incoming request details
        console.log('Telegram Auth Request:', {
            initData: initData ? 'Present' : 'Missing',
            role,
            userAgent,
            platform,
            timestamp: new Date().toISOString()
        });

        // Validate Telegram Web App data
        const telegramUser = validateTelegramWebAppData(initData);

        console.log('Validated Telegram User:', telegramUser);

        if (!telegramUser) {
            console.error('Invalid Telegram data validation');
            return res.status(400).json({
                success: false,
                error: 'Invalid Telegram data',
                details: {
                    initDataPresent: !!initData,
                    roleProvided: !!role
                }
            });
        }

        // Check if user exists
        let user = await User.findOne({ telegramId: telegramUser.id });

        console.log('Existing User:', user ? user._id : 'Not found');

        if (!user) {
            // Create new user
            try {
                user = await User.create({
                    username: telegramUser.username || `tg_${telegramUser.id}`,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name || '',
                    telegramId: telegramUser.id,
                    role: role || 'client'
                });

                console.log('Created New User:', user._id);

                // Create role-specific record
                if (user.role === 'trainer') {
                    await Trainer.create({ userId: user._id });
                } else if (user.role === 'client') {
                    await Client.create({ userId: user._id });
                }
            } catch (createError) {
                console.error('User creation error:', createError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create user',
                    details: createError.message
                });
            }
        }

        // Generate token
        const token = generateToken(user._id);

        console.log('Token Generated:', token ? 'Yes' : 'No');

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed. Please try again.',
            details: error.message
        });
    }
};

module.exports = { getTelegramUser };