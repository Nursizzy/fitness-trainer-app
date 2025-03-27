const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    duration: {
        type: Number // in seconds
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'missed'],
        default: 'scheduled'
    },
    exercises: [{
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true
        },
        sets: {
            type: Number,
            required: true
        },
        reps: {
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            default: 0
        },
        restTime: {
            type: Number, // rest time in seconds
            default: 60
        },
        duration: {
            type: Number // for timed exercises (planks, etc.), in seconds
        }
    }],
    exerciseData: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        },
        sets: [{
            setNumber: Number,
            plannedReps: Number,
            actualReps: Number,
            plannedWeight: Number,
            actualWeight: Number,
            completed: Boolean,
            notes: String
        }]
    }],
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
workoutSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Workout', workoutSchema);