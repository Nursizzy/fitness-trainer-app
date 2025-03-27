// Auth routes
const express = require('express');
const router = express.Router();
const { register, login, getTelegramUser } = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

// Verify Telegram user data
router.post('/telegram', getTelegramUser);

module.exports = router;