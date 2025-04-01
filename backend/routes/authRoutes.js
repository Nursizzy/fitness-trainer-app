// Auth routes
const express = require('express');
const router = express.Router();
const { getTelegramUser } = require('../controllers/authController');

// Verify Telegram user data
router.post('/telegram', getTelegramUser);

module.exports = router;