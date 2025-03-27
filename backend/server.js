// Main server file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const clientRoutes = require('./routes/clientRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/workout', workoutRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('FitTrainer API is running');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});