// Main server file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: [
        'https://web.telegram.org',
        'https://web.telegram.org/z/',
        'https://web.telegram.org/k/',
        'https://t.me',
        '*' // Be cautious with this in production
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const clientRoutes = require('./routes/clientRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/health', healthRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('FitTrainer API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;