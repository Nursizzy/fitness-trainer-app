// Main server file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        'https://web.telegram.org',
        'https://web.telegram.org/z/',
        'https://web.telegram.org/k/',
        'https://t.me',
        // Add your development domains here
        process.env.NODE_ENV === 'development' ? '*' : null
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Import the DB connection module
const connectDB = require('./db');

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log('MongoDB connected');

        // Start server only after successful DB connection
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
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

module.exports = app;