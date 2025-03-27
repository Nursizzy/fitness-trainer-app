// Authentication module for FitTrainer

// API URL - local backend
const API_BASE_URL = 'https://fitness-trainer-app.onrender.com/api';

// Telegram instance
const tg = window.Telegram.WebApp;

// Store auth token
let authToken = localStorage.getItem('fitTrainerAuthToken') || null;

// Check if user is authenticated
function isAuthenticated() {
    return !!authToken;
}

// Login user
async function login(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Store auth data
        authToken = data.token;
        localStorage.setItem('fitTrainerAuthToken', authToken);
        localStorage.setItem('userRole', data.user.role);

        return data;
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message || 'Authentication failed. Please try again.'
        };
    }
}

// Register new user
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store auth data
        authToken = data.token;
        localStorage.setItem('fitTrainerAuthToken', authToken);
        localStorage.setItem('userRole', data.user.role);

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error.message || 'Registration failed. Please try again.'
        };
    }
}

// Authenticate with Telegram
async function authenticateWithTelegram(role) {
    try {
        // Get Telegram Web App init data
        const initData = tg.initData;

        if (!initData) {
            throw new Error('Telegram data not available');
        }

        // Send to backend for verification
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData, role })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Store auth data
        authToken = data.token;
        localStorage.setItem('fitTrainerAuthToken', authToken);
        localStorage.setItem('userRole', data.user.role);

        return data;
    } catch (error) {
        console.error('Telegram authentication error:', error);
        return {
            success: false,
            error: error.message || 'Authentication failed. Please try again.'
        };
    }
}

// Logout user
function logout() {
    authToken = null;
    localStorage.removeItem('fitTrainerAuthToken');
    localStorage.removeItem('userRole');

    // Return to auth screen
    window.location.reload();
}

// Get current user data
async function getCurrentUser() {
    if (!authToken) {
        return null;
    }

    try {
        let endpoint = '';
        const role = localStorage.getItem('userRole');

        if (role === 'trainer') {
            endpoint = `${API_BASE_URL}/trainer/profile`;
        } else if (role === 'client') {
            endpoint = `${API_BASE_URL}/client/profile`;
        } else {
            throw new Error('Unknown user role');
        }

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to get user data');
        }

        return role === 'trainer' ? data.trainer : data.client;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Export functions
window.auth = {
    isAuthenticated,
    login,
    register,
    authenticateWithTelegram,
    logout,
    getCurrentUser
};