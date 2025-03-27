// Trainer routes
const express = require('express');
const router = express.Router();
const {
    getClients,
    getClient,
    assignClient,
    updateClient,
    getPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    assignProgram,
    getExercises,
    createExercise,
    getExercise,
    updateExercise,
    deleteExercise,
    getProfile,
    updateProfile,
    getAnalytics
} = require('../controllers/trainerController');
const { protect, trainerOnly } = require('../middleware/auth');

// All routes in this file are protected and trainer-only
router.use(protect);
router.use(trainerOnly);

// Trainer profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Analytics routes
router.get('/analytics', getAnalytics);

// Client routes
router.get('/clients', getClients);
router.get('/clients/:clientId', getClient);
router.post('/clients/:clientId/assign', assignClient);
router.put('/clients/:clientId', updateClient);

// Program routes
router.get('/programs', getPrograms);
router.post('/programs', createProgram);
router.get('/programs/:programId', getProgram);
router.put('/programs/:programId', updateProgram);
router.delete('/programs/:programId', deleteProgram);
router.post('/clients/:clientId/programs/:programId', assignProgram);

// Exercise routes
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);
router.get('/exercises/:exerciseId', getExercise);
router.put('/exercises/:exerciseId', updateExercise);
router.delete('/exercises/:exerciseId', deleteExercise);

module.exports = router;