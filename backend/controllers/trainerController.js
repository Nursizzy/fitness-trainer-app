const Trainer = require('../models/Trainer');
const Client = require('../models/Client');
const Program = require('../models/Program');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const Workout = require('../models/Workout');

// Get all clients for a trainer
const getClients = async (req, res) => {
    try {
        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find all clients assigned to this trainer
        const clients = await Client.find({ trainerId: trainer._id })
            .populate('userId', 'firstName lastName email');

        res.json({
            success: true,
            clients: clients.map(client => ({
                id: client._id,
                userId: client.userId._id,
                name: `${client.userId.firstName} ${client.userId.lastName}`,
                email: client.userId.email,
                fitnessLevel: client.fitnessLevel,
                goals: client.goals,
                height: client.height,
                weight: client.weight,
                age: client.age,
                healthNotes: client.healthNotes
            }))
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch clients. Please try again.'
        });
    }
};

// Get a specific client
const getClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find client
        const client = await Client.findById(clientId)
            .populate('userId', 'firstName lastName email username');

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        // Check if client is assigned to this trainer
        if (client.trainerId && client.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this client'
            });
        }

        // Get client's workouts
        const workouts = await Workout.find({
            clientId: client._id,
            trainerId: trainer._id
        }).sort({ scheduledAt: -1 }).limit(5);

        // Get client's assigned programs
        const programs = await Program.find({
            clientId: client._id,
            trainerId: trainer._id
        });

        res.json({
            success: true,
            client: {
                id: client._id,
                userId: client.userId._id,
                name: `${client.userId.firstName} ${client.userId.lastName}`,
                email: client.userId.email,
                username: client.userId.username,
                fitnessLevel: client.fitnessLevel,
                goals: client.goals,
                height: client.height,
                weight: client.weight,
                age: client.age,
                healthNotes: client.healthNotes
            },
            recentWorkouts: workouts.map(workout => ({
                id: workout._id,
                title: workout.title,
                scheduledAt: workout.scheduledAt,
                status: workout.status
            })),
            programs: programs.map(program => ({
                id: program._id,
                name: program.name,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty
            }))
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch client. Please try again.'
        });
    }
};

// Assign a client to a trainer
const assignClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find client
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        // Check if client is already assigned to a trainer
        if (client.trainerId) {
            return res.status(400).json({
                success: false,
                error: 'Client is already assigned to a trainer'
            });
        }

        // Assign client to trainer
        client.trainerId = trainer._id;
        await client.save();

        res.json({
            success: true,
            message: 'Client assigned successfully'
        });
    } catch (error) {
        console.error('Assign client error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign client. Please try again.'
        });
    }
};

// Update client information
const updateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { fitnessLevel, goals, healthNotes } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find client
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        // Check if client is assigned to this trainer
        if (!client.trainerId || client.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this client'
            });
        }

        // Update client
        if (fitnessLevel) client.fitnessLevel = fitnessLevel;
        if (goals) client.goals = goals;
        if (healthNotes) client.healthNotes = healthNotes;

        await client.save();

        res.json({
            success: true,
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update client. Please try again.'
        });
    }
};

// Get all programs created by a trainer
const getPrograms = async (req, res) => {
    try {
        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find all programs created by this trainer
        const programs = await Program.find({ trainerId: trainer._id });

        // Count assigned clients for each program
        const programsWithClientCount = await Promise.all(programs.map(async program => {
            const clientCount = await Client.countDocuments({
                trainerId: trainer._id,
                programIds: program._id
            });

            return {
                id: program._id,
                name: program.name,
                description: program.description,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty,
                isPublic: program.isPublic,
                createdAt: program.createdAt,
                updatedAt: program.updatedAt,
                activeClients: clientCount
            };
        }));

        res.json({
            success: true,
            programs: programsWithClientCount
        });
    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch programs. Please try again.'
        });
    }
};

// Get a specific program
const getProgram = async (req, res) => {
    try {
        const { programId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find program
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({
                success: false,
                error: 'Program not found'
            });
        }

        // Check if program belongs to this trainer
        if (program.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this program'
            });
        }

        // Find clients assigned to this program
        const clients = await Client.find({
            trainerId: trainer._id,
            programIds: program._id
        }).populate('userId', 'firstName lastName');

        res.json({
            success: true,
            program: {
                id: program._id,
                name: program.name,
                description: program.description,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty,
                isPublic: program.isPublic,
                createdAt: program.createdAt,
                updatedAt: program.updatedAt
            },
            clients: clients.map(client => ({
                id: client._id,
                name: `${client.userId.firstName} ${client.userId.lastName}`
            }))
        });
    } catch (error) {
        console.error('Get program error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch program. Please try again.'
        });
    }
};

// Create a program
const createProgram = async (req, res) => {
    try {
        const { name, description, durationWeeks, difficulty, isPublic } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Create program
        const program = await Program.create({
            trainerId: trainer._id,
            name,
            description,
            durationWeeks,
            difficulty,
            isPublic: isPublic || false
        });

        res.status(201).json({
            success: true,
            program: {
                id: program._id,
                name: program.name,
                description: program.description,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty,
                isPublic: program.isPublic
            }
        });
    } catch (error) {
        console.error('Create program error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create program. Please try again.'
        });
    }
};

// Update a program
const updateProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const { name, description, durationWeeks, difficulty, isPublic } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find program
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({
                success: false,
                error: 'Program not found'
            });
        }

        // Check if program belongs to this trainer
        if (program.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this program'
            });
        }

        // Update program
        if (name) program.name = name;
        if (description) program.description = description;
        if (durationWeeks) program.durationWeeks = durationWeeks;
        if (difficulty) program.difficulty = difficulty;
        if (isPublic !== undefined) program.isPublic = isPublic;

        await program.save();

        res.json({
            success: true,
            message: 'Program updated successfully',
            program: {
                id: program._id,
                name: program.name,
                description: program.description,
                durationWeeks: program.durationWeeks,
                difficulty: program.difficulty,
                isPublic: program.isPublic
            }
        });
    } catch (error) {
        console.error('Update program error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update program. Please try again.'
        });
    }
};

// Delete a program
const deleteProgram = async (req, res) => {
    try {
        const { programId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find program
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({
                success: false,
                error: 'Program not found'
            });
        }

        // Check if program belongs to this trainer
        if (program.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this program'
            });
        }

        // Remove program from all clients
        await Client.updateMany(
            { programIds: program._id },
            { $pull: { programIds: program._id } }
        );

        // Delete program
        await Program.deleteOne({ _id: programId });

        res.json({
            success: true,
            message: 'Program deleted successfully'
        });
    } catch (error) {
        console.error('Delete program error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete program. Please try again.'
        });
    }
};

// Assign program to client
const assignProgram = async (req, res) => {
    try {
        const { clientId, programId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find client
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        // Check if client is assigned to this trainer
        if (!client.trainerId || client.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to assign programs to this client'
            });
        }

        // Find program
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({
                success: false,
                error: 'Program not found'
            });
        }

        // Check if program belongs to this trainer
        if (program.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to assign this program'
            });
        }

        // Add program to client if not already assigned
        if (!client.programIds) {
            client.programIds = [];
        }

        if (!client.programIds.includes(program._id)) {
            client.programIds.push(program._id);
            await client.save();
        }

        res.json({
            success: true,
            message: 'Program assigned to client successfully'
        });
    } catch (error) {
        console.error('Assign program error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign program. Please try again.'
        });
    }
};

// Get all exercises created by a trainer
const getExercises = async (req, res) => {
    try {
        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find all exercises created by this trainer
        const exercises = await Exercise.find({
            $or: [
                { trainerId: trainer._id },
                { isPublic: true }
            ]
        });

        res.json({
            success: true,
            exercises: exercises.map(exercise => ({
                id: exercise._id,
                name: exercise.name,
                description: exercise.description,
                instructions: exercise.instructions,
                muscleGroup: exercise.muscleGroup,
                difficulty: exercise.difficulty,
                equipment: exercise.equipment,
                isPublic: exercise.isPublic,
                mediaUrl: exercise.mediaUrl,
                isOwner: exercise.trainerId && exercise.trainerId.toString() === trainer._id.toString()
            }))
        });
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercises. Please try again.'
        });
    }
};

// Create an exercise
const createExercise = async (req, res) => {
    try {
        const {
            name,
            description,
            instructions,
            muscleGroup,
            difficulty,
            equipment,
            isPublic,
            mediaUrl
        } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Create exercise
        const exercise = await Exercise.create({
            trainerId: trainer._id,
            name,
            description,
            instructions,
            muscleGroup,
            difficulty,
            equipment,
            isPublic: isPublic || false,
            mediaUrl
        });

        res.status(201).json({
            success: true,
            exercise: {
                id: exercise._id,
                name: exercise.name,
                description: exercise.description,
                instructions: exercise.instructions,
                muscleGroup: exercise.muscleGroup,
                difficulty: exercise.difficulty,
                equipment: exercise.equipment,
                isPublic: exercise.isPublic,
                mediaUrl: exercise.mediaUrl
            }
        });
    } catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create exercise. Please try again.'
        });
    }
};

// Get a specific exercise
const getExercise = async (req, res) => {
    try {
        const { exerciseId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find exercise
        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }

        // Check if trainer can access this exercise
        if (!exercise.isPublic &&
            (!exercise.trainerId || exercise.trainerId.toString() !== trainer._id.toString())) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this exercise'
            });
        }

        res.json({
            success: true,
            exercise: {
                id: exercise._id,
                name: exercise.name,
                description: exercise.description,
                instructions: exercise.instructions,
                muscleGroup: exercise.muscleGroup,
                difficulty: exercise.difficulty,
                equipment: exercise.equipment,
                isPublic: exercise.isPublic,
                mediaUrl: exercise.mediaUrl,
                isOwner: exercise.trainerId && exercise.trainerId.toString() === trainer._id.toString()
            }
        });
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercise. Please try again.'
        });
    }
};

// Update an exercise
const updateExercise = async (req, res) => {
    try {
        const { exerciseId } = req.params;
        const {
            name,
            description,
            instructions,
            muscleGroup,
            difficulty,
            equipment,
            isPublic,
            mediaUrl
        } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find exercise
        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }

        // Check if trainer owns this exercise
        if (!exercise.trainerId || exercise.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this exercise'
            });
        }

        // Update exercise
        if (name) exercise.name = name;
        if (description) exercise.description = description;
        if (instructions) exercise.instructions = instructions;
        if (muscleGroup) exercise.muscleGroup = muscleGroup;
        if (difficulty) exercise.difficulty = difficulty;
        if (equipment) exercise.equipment = equipment;
        if (isPublic !== undefined) exercise.isPublic = isPublic;
        if (mediaUrl) exercise.mediaUrl = mediaUrl;

        await exercise.save();

        res.json({
            success: true,
            message: 'Exercise updated successfully',
            exercise: {
                id: exercise._id,
                name: exercise.name,
                description: exercise.description,
                instructions: exercise.instructions,
                muscleGroup: exercise.muscleGroup,
                difficulty: exercise.difficulty,
                equipment: exercise.equipment,
                isPublic: exercise.isPublic,
                mediaUrl: exercise.mediaUrl
            }
        });
    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update exercise. Please try again.'
        });
    }
};

// Delete an exercise
const deleteExercise = async (req, res) => {
    try {
        const { exerciseId } = req.params;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Find exercise
        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }

        // Check if trainer owns this exercise
        if (!exercise.trainerId || exercise.trainerId.toString() !== trainer._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this exercise'
            });
        }

        // Delete exercise
        await Exercise.deleteOne({ _id: exerciseId });

        res.json({
            success: true,
            message: 'Exercise deleted successfully'
        });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete exercise. Please try again.'
        });
    }
};

// Get trainer profile
const getProfile = async (req, res) => {
    try {
        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id })
            .populate('userId', 'firstName lastName email username');

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Get client count
        const clientCount = await Client.countDocuments({ trainerId: trainer._id });

        // Get program count
        const programCount = await Program.countDocuments({ trainerId: trainer._id });

        // Get exercise count
        const exerciseCount = await Exercise.countDocuments({ trainerId: trainer._id });

        res.json({
            success: true,
            trainer: {
                id: trainer._id,
                name: `${trainer.userId.firstName} ${trainer.userId.lastName}`,
                email: trainer.userId.email,
                username: trainer.userId.username,
                bio: trainer.bio,
                specializations: trainer.specializations,
                yearsExperience: trainer.yearsExperience,
                certifications: trainer.certifications,
                availability: trainer.availability,
                stats: {
                    clients: clientCount,
                    programs: programCount,
                    exercises: exerciseCount
                }
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

// Update trainer profile
const updateProfile = async (req, res) => {
    try {
        const { bio, specializations, yearsExperience, certifications, availability } = req.body;

        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Update trainer
        if (bio) trainer.bio = bio;
        if (specializations) trainer.specializations = specializations;
        if (yearsExperience) trainer.yearsExperience = yearsExperience;
        if (certifications) trainer.certifications = certifications;
        if (availability) trainer.availability = availability;

        await trainer.save();

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

// Get analytics
const getAnalytics = async (req, res) => {
    try {
        // Find trainer profile
        const trainer = await Trainer.findOne({ userId: req.user._id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                error: 'Trainer profile not found'
            });
        }

        // Get client count
        const clientCount = await Client.countDocuments({ trainerId: trainer._id });

        // Get workouts completed in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const workoutsCompleted = await Workout.countDocuments({
            trainerId: trainer._id,
            completedAt: { $gte: thirtyDaysAgo },
            status: 'completed'
        });

        // Get average completion rate
        const totalWorkouts = await Workout.countDocuments({
            trainerId: trainer._id,
            scheduledAt: { $lte: new Date() }
        });

        const completedWorkouts = await Workout.countDocuments({
            trainerId: trainer._id,
            status: 'completed'
        });

        const averageCompletionRate = totalWorkouts > 0
            ? Math.round((completedWorkouts / totalWorkouts) * 100)
            : 0;

        // Get most popular program
        const programs = await Program.find({ trainerId: trainer._id });

        let topProgram = null;
        let maxClients = 0;

        for (const program of programs) {
            const clientCount = await Client.countDocuments({
                trainerId: trainer._id,
                programIds: program._id
            });

            if (clientCount > maxClients) {
                maxClients = clientCount;
                topProgram = program.name;
            }
        }

        // Calculate client growth
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 61);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const clientsPrevMonth = await Client.countDocuments({
            trainerId: trainer._id,
            createdAt: { $lte: thirtyDaysAgo, $gte: sixtyDaysAgo }
        });

        const clientsThisMonth = await Client.countDocuments({
            trainerId: trainer._id,
            createdAt: { $lte: new Date(), $gte: thirtyDaysAgo }
        });

        const clientGrowth = clientsPrevMonth > 0
            ? Math.round(((clientsThisMonth - clientsPrevMonth) / clientsPrevMonth) * 100)
            : clientsThisMonth > 0 ? 100 : 0;

        res.json({
            success: true,
            analytics: {
                totalClients: clientCount,
                activeClients: clientCount, // Can be refined based on activity
                averageCompletionRate,
                workoutsCompleted,
                topProgram,
                clientGrowth
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics. Please try again.'
        });
    }
};

module.exports = {
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
};