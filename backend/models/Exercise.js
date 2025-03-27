const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    instructions: {
        type: String
    },
    muscleGroup: {
        type: String
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExerciseCategory'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    equipment: {
        type: String
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    mediaUrl: {
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

module.exports = mongoose.model('Exercise', exerciseSchema);