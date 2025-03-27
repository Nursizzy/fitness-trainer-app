// Health check routes
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'FitTrainer API is running',
        timestamp: new Date()
    });
});

// Database health check endpoint
router.get('/health/db', async (req, res) => {
    try {
        // Check MongoDB connection state
        const state = mongoose.connection.readyState;
        let stateMessage;

        switch (state) {
            case 0:
                stateMessage = 'Disconnected';
                break;
            case 1:
                stateMessage = 'Connected';
                break;
            case 2:
                stateMessage = 'Connecting';
                break;
            case 3:
                stateMessage = 'Disconnecting';
                break;
            default:
                stateMessage = 'Unknown';
        }

        // If connected, perform a simple query
        let dbPingResult = null;
        if (state === 1) {
            dbPingResult = await mongoose.connection.db.admin().ping();
        }

        res.json({
            status: state === 1 ? 'ok' : 'error',
            dbState: stateMessage,
            dbPing: dbPingResult ? 'success' : null,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Database health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database health check failed',
            error: error.message,
            timestamp: new Date()
        });
    }
});

module.exports = router;