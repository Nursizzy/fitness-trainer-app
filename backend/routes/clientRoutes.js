// Client routes
const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getWorkouts,
    getSchedule,
    getPrograms,
    getProgress,
    getAchievements,
    sendMessageToTrainer
} = require('../controllers/clientController');
const { protect, clientOnly } = require('../middleware/auth');

// All routes in this file are protected and client-only
router.use(protect);
router.use(clientOnly);

// Client profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Get all workouts for a client
router.get('/workouts', getWorkouts);

// Get schedule for a client
router.get('/schedule', getSchedule);

// Get programs for a client
router.get('/programs', getPrograms);

// Get progress for a client
router.get('/progress', getProgress);

// Get achievements for a client
router.get('/achievements', getAchievements);

// Send message to trainer
router.post('/message', sendMessageToTrainer);

module.exports = router;