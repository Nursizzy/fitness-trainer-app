// Workout routes
const express = require('express');
const router = express.Router();
const {
    startWorkout,
    completeWorkout,
    getWorkouts,
    createWorkout,
    getWorkout,
    updateWorkout,
    deleteWorkout
} = require('../controllers/workoutController');
const { protect, trainerOnly } = require('../middleware/auth');

// All routes in this file are protected
router.use(protect);

// Get all workouts
router.get('/', getWorkouts);

// Get a specific workout
router.get('/:workoutId', getWorkout);

// Start a workout
router.post('/:workoutId/start', startWorkout);

// Complete a workout
router.post('/:workoutId/complete', completeWorkout);

// Create a new workout (trainer only)
router.post('/', trainerOnly, createWorkout);

// Update a workout (trainer only)
router.put('/:workoutId', trainerOnly, updateWorkout);

// Delete a workout (trainer only)
router.delete('/:workoutId', trainerOnly, deleteWorkout);

module.exports = router;