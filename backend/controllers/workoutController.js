// Workout controller
const Workout = require('../models/Workout');
const User = require('../models/User');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const Program = require('../models/Program');
const Exercise = require('../models/Exercise');

// Start a workout
const startWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;

        // Find the workout
        const workout = await Workout.findById(workoutId)
            .populate('exercises.exercise');

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found'
            });
        }

        // Check if the user is authorized to access this workout
        if (req.user.role === 'client') {
            // Clients can only access their own workouts
            const client = await Client.findOne({ userId: req.user._id });

            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: 'Client profile not found'
                });
            }

            if (workout.clientId.toString() !== client._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to access this workout'
                });
            }
        } else if (req.user.role === 'trainer') {
            // Trainers can access workouts they created
            const trainer = await Trainer.findOne({ userId: req.user._id });

            if (!trainer) {
                return res.status(404).json({
                    success: false,
                    error: 'Trainer profile not found'
                });
            }

            if (workout.trainerId.toString() !== trainer._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to access this workout'
                });
            }
        }

        // Mark workout as started if not already
        if (!workout.startedAt) {
            workout.startedAt = Date.now();
            await workout.save();
        }

        // Return workout details
        res.json({
            success: true,
            workout: {
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                exercises: workout.exercises.map(ex => ({
                    name: ex.exercise.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    weight: ex.weight,
                    instructions: ex.exercise.instructions,
                    restTime: ex.restTime,
                    muscleGroup: ex.exercise.muscleGroup,
                    mediaUrl: ex.exercise.mediaUrl,
                    duration: ex.duration
                }))
            }
        });
    } catch (error) {
        console.error('Start workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start workout. Please try again.'
        });
    }
};

// Complete a workout
const completeWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { duration, exerciseData } = req.body;

        // Find the workout
        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found'
            });
        }

        // Check if the user is authorized
        if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });

            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: 'Client profile not found'
                });
            }

            if (workout.clientId.toString() !== client._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to complete this workout'
                });
            }
        }

        // Update workout completion details
        workout.completedAt = Date.now();
        workout.duration = duration || Math.floor((Date.now() - workout.startedAt) / 1000);
        workout.exerciseData = exerciseData || [];
        workout.status = 'completed';

        await workout.save();

        // Calculate achievement points (simple implementation)
        const points = Math.floor(workout.duration / 60) * 10;

        // Check for achievements (simple implementation)
        // In a real app, you'd have more complex achievement logic
        const achievements = [];

        // Get client's completed workout count
        if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });
            const completedWorkouts = await Workout.countDocuments({
                clientId: client._id,
                status: 'completed'
            });

            // Add achievements based on workout count
            if (completedWorkouts === 1) {
                achievements.push({
                    id: 'first_workout',
                    name: 'First Workout',
                    description: 'Completed your first workout.'
                });
            } else if (completedWorkouts === 5) {
                achievements.push({
                    id: 'workout_warrior',
                    name: 'Workout Warrior',
                    description: 'Completed 5 workouts.'
                });
            } else if (completedWorkouts === 10) {
                achievements.push({
                    id: 'fitness_enthusiast',
                    name: 'Fitness Enthusiast',
                    description: 'Completed 10 workouts.'
                });
            }
        }

        res.json({
            success: true,
            message: 'Workout completed successfully!',
            points,
            achievements
        });
    } catch (error) {
        console.error('Complete workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete workout. Please try again.'
        });
    }
};

// Get all workouts for a user
const getWorkouts = async (req, res) => {
    try {
        let workouts = [];

        if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });

            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: 'Client profile not found'
                });
            }

            workouts = await Workout.find({ clientId: client._id })
                .populate('exercises.exercise')
                .sort({ scheduledAt: 1 });
        } else if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ userId: req.user._id });

            if (!trainer) {
                return res.status(404).json({
                    success: false,
                    error: 'Trainer profile not found'
                });
            }

            workouts = await Workout.find({ trainerId: trainer._id })
                .populate('exercises.exercise')
                .populate('clientId', 'userId')
                .populate({
                    path: 'clientId',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName'
                    }
                })
                .sort({ scheduledAt: 1 });
        }

        res.json({
            success: true,
            workouts: workouts.map(workout => ({
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                status: workout.status,
                duration: workout.duration,
                startedAt: workout.startedAt,
                completedAt: workout.completedAt,
                clientName: workout.clientId?.userId ?
                    `${workout.clientId.userId.firstName} ${workout.clientId.userId.lastName}` :
                    null,
                exercisesCount: workout.exercises.length
            }))
        });
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workouts. Please try again.'
        });
    }
};

// Create a workout
const createWorkout = async (req, res) => {
    try {
        const { title, description, clientId, scheduledAt, exercises } = req.body;

        // Verify trainer
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Verify client exists and belongs to this trainer
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        if (client.trainerId && client.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to create workouts for this client'
            });
        }

        // Create the workout
        const workout = await Workout.create({
            title,
            description,
            trainerId: trainer._id,
            clientId,
            scheduledAt,
            exercises: exercises.map(ex => ({
                exercise: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                duration: ex.duration
            })),
            status: 'scheduled'
        });

        res.status(201).json({
            success: true,
            workout: {
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                status: workout.status
            }
        });
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create workout. Please try again.'
        });
    }
};

// Get a specific workout
const getWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;

        const workout = await Workout.findById(workoutId)
            .populate('exercises.exercise')
            .populate('clientId', 'userId')
            .populate({
                path: 'clientId',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName'
                }
            })
            .populate('trainerId', 'userId')
            .populate({
                path: 'trainerId',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName'
                }
            });

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found'
            });
        }

        // Check if the user is authorized
        if (req.user.role === 'client') {
            const client = await Client.findOne({ userId: req.user._id });

            if (workout.clientId._id.toString() !== client._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this workout'
                });
            }
        } else if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ userId: req.user._id });

            if (workout.trainerId._id.toString() !== trainer._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this workout'
                });
            }
        }

        res.json({
            success: true,
            workout: {
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                status: workout.status,
                duration: workout.duration,
                startedAt: workout.startedAt,
                completedAt: workout.completedAt,
                client: workout.clientId?.userId ? {
                    id: workout.clientId._id,
                    name: `${workout.clientId.userId.firstName} ${workout.clientId.userId.lastName}`
                } : null,
                trainer: workout.trainerId?.userId ? {
                    id: workout.trainerId._id,
                    name: `${workout.trainerId.userId.firstName} ${workout.trainerId.userId.lastName}`
                } : null,
                exercises: workout.exercises.map(ex => ({
                    id: ex._id,
                    name: ex.exercise.name,
                    description: ex.exercise.description,
                    sets: ex.sets,
                    reps: ex.reps,
                    weight: ex.weight,
                    instructions: ex.exercise.instructions,
                    restTime: ex.restTime,
                    muscleGroup: ex.exercise.muscleGroup,
                    mediaUrl: ex.exercise.mediaUrl,
                    duration: ex.duration
                })),
                exerciseData: workout.exerciseData
            }
        });
    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workout. Please try again.'
        });
    }
};

// Update a workout (trainer only)
const updateWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { title, description, scheduledAt, exercises } = req.body;

        // Get trainer
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find the workout
        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found'
            });
        }

        // Check if the trainer created this workout
        if (workout.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this workout'
            });
        }

        // Check if workout is already started/completed
        if (workout.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update a workout that has already started or been completed'
            });
        }

        // Update workout
        if (title) workout.title = title;
        if (description) workout.description = description;
        if (scheduledAt) workout.scheduledAt = scheduledAt;

        if (exercises && exercises.length > 0) {
            workout.exercises = exercises.map(ex => ({
                exercise: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                duration: ex.duration
            }));
        }

        await workout.save();

        res.json({
            success: true,
            message: 'Workout updated successfully',
            workout: {
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                status: workout.status
            }
        });
    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update workout. Please try again.'
        });
    }
};

// Delete a workout (trainer only)
const deleteWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;

        // Get trainer
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find the workout
        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: 'Workout not found'
            });
        }

        // Check if the trainer created this workout
        if (workout.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this workout'
            });
        }

        // Delete the workout
        await Workout.deleteOne({ _id: workoutId });

        res.json({
            success: true,
            message: 'Workout deleted successfully'
        });
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete workout. Please try again.'
        });
    }
};

module.exports = {
    startWorkout,
    completeWorkout,
    getWorkouts,
    createWorkout,
    getWorkout,
    updateWorkout,
    deleteWorkout
};