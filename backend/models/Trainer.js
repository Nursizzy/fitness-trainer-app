const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bio: String,
    specializations: String,
    yearsExperience: Number,
    certifications: String,
    availability: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trainer', trainerSchema);