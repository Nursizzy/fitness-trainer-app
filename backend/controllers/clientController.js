// Client controller
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const Program = require('../models/Program');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

// Get client profile
const getProfile = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id })
            .populate('userId', 'firstName lastName email username')
            .populate('trainerId', 'userId');

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get trainer info if assigned
        let trainerInfo = null;
        if (client.trainerId) {
            const trainerWithUser = await Trainer.findById(client.trainerId)
                .populate('userId', 'firstName lastName');

            if (trainerWithUser && trainerWithUser.userId) {
                trainerInfo = {
                    id: trainerWithUser._id,
                    name: `${trainerWithUser.userId.firstName} ${trainerWithUser.userId.lastName}`
                };
            }
        }

        res.json({
            success: true,
            client: {
                id: client._id,
                name: `${client.userId.firstName} ${client.userId.lastName}`,
                email: client.userId.email,
                username: client.userId.username,
                height: client.height,
                weight: client.weight,
                age: client.age,
                fitnessLevel: client.fitnessLevel,
                goals: client.goals,
                healthNotes: client.healthNotes,
                trainer: trainerInfo
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile. Please try again.'
        });
    }
};

// Update client profile
const updateProfile = async (req, res) => {
    try {
        const { height, weight, age, fitnessLevel, goals, healthNotes } = req.body;

        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Update client
        if (height) client.height = height;
        if (weight) client.weight = weight;
        if (age) client.age = age;
        if (fitnessLevel) client.fitnessLevel = fitnessLevel;
        if (goals) client.goals = goals;
        if (healthNotes) client.healthNotes = healthNotes;

        await client.save();

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile. Please try again.'
        });
    }
};

// Get workouts for a client
const getWorkouts = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get client's workouts
        const workouts = await Workout.find({ clientId: client._id })
            .sort({ scheduledAt: -1 })
            .populate('exercises.exercise');

        res.json({
            success: true,
            workouts: workouts.map(workout => ({
                id: workout._id,
                title: workout.title,
                description: workout.description,
                scheduled: workout.scheduledAt,
                status: workout.status,
                duration: workout.duration,
                exercises: workout.exercises.map(ex => ({
                    name: ex.exercise.name,
                    sets: ex.sets,
                    reps: ex.reps
                }))
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

// Get client's schedule
const getSchedule = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get upcoming workouts (including today)
        const upcomingWorkouts = await Workout.find({
            clientId: client._id,
            scheduledAt: { $gte: today },
            status: { $in: ['scheduled', 'in_progress'] }
        })
            .sort({ scheduledAt: 1 })
            .populate('exercises.exercise');

        // Get recently completed workouts
        const recentWorkouts = await Workout.find({
            clientId: client._id,
            status: 'completed'
        })
            .sort({ completedAt: -1 })
            .limit(5);

        res.json({
            success: true,
            schedule: {
                upcoming: upcomingWorkouts.map(workout => ({
                    id: workout._id,
                    title: workout.title,
                    description: workout.description,
                    scheduled: workout.scheduledAt,
                    exercisesCount: workout.exercises.length
                })),
                recent: recentWorkouts.map(workout => ({
                    id: workout._id,
                    title: workout.title,
                    completed: workout.completedAt,
                    duration: workout.duration
                }))
            }
        });
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schedule. Please try again.'
        });
    }
};

// Get client's programs
const getPrograms = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get assigned programs
        const programs = await Program.find({
            _id: { $in: client.programIds || [] }
        });

        res.json({
            success: true,
            programs: programs.map(program => ({
                id: program._id,
                name: program.name,
                description: program.description,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty
            }))
        });
    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch programs. Please try again.'
        });
    }
};

// Get client's progress
const getProgress = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get completed workouts count
        const completedWorkouts = await Workout.countDocuments({
            clientId: client._id,
            status: 'completed'
        });

        // Get total workouts count
        const totalWorkouts = await Workout.countDocuments({
            clientId: client._id
        });

        // Calculate completion rate
        const completionRate = totalWorkouts > 0
            ? Math.round((completedWorkouts / totalWorkouts) * 100)
            : 0;

        // Get streak (consecutive days with completed workouts)
        let streakDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) { // Check up to 30 days
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);

            const nextDay = new Date(checkDate);
            nextDay.setDate(checkDate.getDate() + 1);

            const hasWorkout = await Workout.exists({
                clientId: client._id,
                status: 'completed',
                completedAt: { $gte: checkDate, $lt: nextDay }
            });

            if (hasWorkout) {
                streakDays++;
            } else if (i > 0) { // Skip today if no workout
                break;
            }
        }

        // Get personal bests (simplified implementation)
        // In a real app, you would track personal bests for each exercise over time
        const personalBests = [];

        // Get all completed workouts with exercise data
        const workoutsWithData = await Workout.find({
            clientId: client._id,
            status: 'completed',
            exerciseData: { $exists: true, $ne: [] }
        }).populate('exerciseData.exerciseId');

        // Track max weight for each exercise
        const exerciseMaxes = {};

        workoutsWithData.forEach(workout => {
            workout.exerciseData.forEach(exerciseData => {
                if (!exerciseData.exerciseId) return;

                const exerciseId = exerciseData.exerciseId._id.toString();
                const exerciseName = exerciseData.exerciseId.name;

                exerciseData.sets.forEach(set => {
                    if (!set.actualWeight || !set.completed) return;

                    if (!exerciseMaxes[exerciseId] || set.actualWeight > exerciseMaxes[exerciseId].value) {
                        exerciseMaxes[exerciseId] = {
                            exercise: exerciseName,
                            value: set.actualWeight,
                            date: workout.completedAt
                        };
                    }
                });
            });
        });

        // Convert to array for response
        for (const exerciseId in exerciseMaxes) {
            personalBests.push({
                exercise: exerciseMaxes[exerciseId].exercise,
                value: `${exerciseMaxes[exerciseId].value} lbs`,
                date: exerciseMaxes[exerciseId].date
            });
        }

        // Get weight data (assuming client updates their weight over time)
        // For demo, we'll just use the current weight and some dummy history
        // In a real app, you would track weight history in a separate collection
        const weightData = [];

        if (client.weight) {
            // Current weight
            weightData.push({
                date: new Date(),
                value: client.weight
            });

            // Generate some dummy historical data
            const startWeight = client.weight + (Math.random() * 10);

            for (let i = 1; i <= 4; i++) {
                const historyDate = new Date();
                historyDate.setDate(historyDate.getDate() - (i * 7)); // Weekly entries

                weightData.push({
                    date: historyDate,
                    value: startWeight - (Math.random() * i)
                });
            }

            // Sort by date
            weightData.sort((a, b) => a.date - b.date);
        }

        res.json({
            success: true,
            progress: {
                completionRate,
                workoutsCompleted,
                totalWorkouts,
                streakDays,
                personalBests,
                weightData
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch progress. Please try again.'
        });
    }
};

// Get client's achievements
const getAchievements = async (req, res) => {
    try {
        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Get completed workouts count
        const completedWorkouts = await Workout.countDocuments({
            clientId: client._id,
            status: 'completed'
        });

        // In a real app, you would have an achievements collection
        // For demo, we'll create achievements based on workout count
        const achievements = [];

        // First workout achievement
        if (completedWorkouts >= 1) {
            achievements.push({
                id: 'first_workout',
                name: 'First Workout',
                description: 'Completed your first workout.',
                date: await getFirstCompletionDate(client._id),
                icon: '🏆'
            });
        }

        // 5 workouts achievement
        if (completedWorkouts >= 5) {
            achievements.push({
                id: 'workout_warrior',
                name: 'Workout Warrior',
                description: 'Completed 5 workouts.',
                date: await getNthCompletionDate(client._id, 5),
                icon: '💪'
            });
        }

        // 10 workouts achievement
        if (completedWorkouts >= 10) {
            achievements.push({
                id: 'fitness_enthusiast',
                name: 'Fitness Enthusiast',
                description: 'Completed 10 workouts.',
                date: await getNthCompletionDate(client._id, 10),
                icon: '⭐'
            });
        }

        // Perfect week achievement (all scheduled workouts in a 7-day period)
        const hasCompletedAllInWeek = await hasCompletedAllWorkoutsInWeek(client._id);
        if (hasCompletedAllInWeek.success) {
            achievements.push({
                id: 'perfect_week',
                name: 'Perfect Week',
                description: 'Completed all scheduled workouts in a week.',
                date: hasCompletedAllInWeek.date,
                icon: '🌟'
            });
        }

        // Early bird achievement (completed workout before 8am)
        const hasEarlyWorkout = await hasCompletedWorkoutBefore8am(client._id);
        if (hasEarlyWorkout.success) {
            achievements.push({
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Completed a workout before 8am.',
                date: hasEarlyWorkout.date,
                icon: '🌅'
            });
        }

        res.json({
            success: true,
            achievements
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch achievements. Please try again.'
        });
    }
};

// Send message to trainer
const sendMessageToTrainer = async (req, res) => {
    try {
        const { message } = req.body;

        // Find client profile
        const client = await Client.findOne({ userId: req.user._id });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client profile not found'
            });
        }

        // Check if client has a trainer
        if (!client.trainerId) {
            return res.status(400).json({
                success: false,
                error: 'You do not have a trainer assigned'
            });
        }

        // In a real app, you would save the message to a messages collection
        // and potentially send a notification to the trainer
        console.log(`Message from client ${client._id} to trainer ${client.trainerId}: ${message}`);

        res.json({
            success: true,
            message: 'Message sent to trainer!'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again.'
        });
    }
};

// Helper functions for achievements

// Get date of first completed workout
async function getFirstCompletionDate(clientId) {
    const firstWorkout = await Workout.findOne({
        clientId,
        status: 'completed'
    }).sort({ completedAt: 1 });

    return firstWorkout ? firstWorkout.completedAt : new Date();
}

// Get date of Nth completed workout
async function getNthCompletionDate(clientId, n) {
    const workouts = await Workout.find({
        clientId,
        status: 'completed'
    }).sort({ completedAt: 1 }).limit(n);

    return workouts.length >= n ? workouts[n-1].completedAt : new Date();
}

// Check if client has completed all workouts in any 7-day period
async function hasCompletedAllWorkoutsInWeek(clientId) {
    // This is a simplified implementation
    // In a real app, you would check each 7-day period for complete workout schedule compliance

    // Get all workouts for the client
    const workouts = await Workout.find({ clientId }).sort({ scheduledAt: 1 });

    // Look for a 7-day window where all scheduled workouts were completed
    for (let i = 0; i < workouts.length; i++) {
        const startDate = new Date(workouts[i].scheduledAt);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        // Get all workouts scheduled in this window
        const workoutsInWindow = workouts.filter(w =>
            w.scheduledAt >= startDate && w.scheduledAt < endDate
        );

        // If no workouts in window, skip
        if (workoutsInWindow.length === 0) continue;

        // Check if all workouts in window were completed
        const allCompleted = workoutsInWindow.every(w => w.status === 'completed');

        if (allCompleted) {
            return {
                success: true,
                date: workoutsInWindow[workoutsInWindow.length - 1].completedAt
            };
        }
    }

    return { success: false };
}

// Check if client has completed any workout before 8am
async function hasCompletedWorkoutBefore8am(clientId) {
    const earlyWorkout = await Workout.findOne({
        clientId,
        status: 'completed',
        completedAt: { $exists: true }
    });

    if (!earlyWorkout) return { success: false };

    // Check if any workout was completed before 8am
    const workouts = await Workout.find({
        clientId,
        status: 'completed'
    });

    for (const workout of workouts) {
        const completionHour = workout.completedAt.getHours();
        if (completionHour < 8) {
            return {
                success: true,
                date: workout.completedAt
            };
        }
    }

    return { success: false };
}

module.exports = {
    getProfile,
    updateProfile,
    getWorkouts,
    getSchedule,
    getPrograms,
    getProgress,
    getAchievements,
    sendMessageToTrainer
};