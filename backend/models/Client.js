const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer'
    },
    programIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }],
    height: Number,
    weight: Number,
    age: Number,
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    goals: String,
    healthNotes: String,
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
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Client', clientSchema);