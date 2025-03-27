// Authentication module for FitTrainer

// API URL (replace with your actual API endpoint in production)
const API_BASE_URL = 'https://api.example.com';

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
        // In a real app, this would be an API call
        // For demo, we'll simulate a successful login

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store auth data
        authToken = 'demo-auth-token-' + Date.now();
        localStorage.setItem('fitTrainerAuthToken', authToken);

        // Return success
        return {
            success: true,
            user: {
                id: userData.id || 'demo-user',
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Authentication failed. Please try again.'
        };
    }
}

// Register new user
async function register(userData) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate a successful registration

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Store auth data
        authToken = 'demo-auth-token-' + Date.now();
        localStorage.setItem('fitTrainerAuthToken', authToken);

        // Return success
        return {
            success: true,
            user: {
                id: userData.id || 'demo-user',
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: 'Registration failed. Please try again.'
        };
    }
}

// Logout user
function logout() {
    authToken = null;
    localStorage.removeItem('fitTrainerAuthToken');

    // In a real app, you might want to notify the API
    // that the user has logged out

    // Return to auth screen
    window.location.reload();
}

// Get current user data
async function getCurrentUser() {
    if (!authToken) {
        return null;
    }

    try {
        // In a real app, this would be an API call to get user data
        // For demo, we'll return dummy data

        return {
            id: 'demo-user',
            firstName: tg.initDataUnsafe.user?.first_name || 'Demo',
            lastName: tg.initDataUnsafe.user?.last_name || 'User',
            username: tg.initDataUnsafe.user?.username || 'demouser',
            role: localStorage.getItem('userRole') || 'client'
        };
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
    logout,
    getCurrentUser
};