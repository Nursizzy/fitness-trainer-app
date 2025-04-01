// Client module for FitTrainer

// Use the globally available tg instance


// Get auth token
window.getAuthToken = () => localStorage.getItem('fitTrainerAuthToken');

// Get client's workouts
async function getWorkouts() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/workouts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch workouts');
        }

        return data;
    } catch (error) {
        console.error('Get workouts error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch workouts. Please try again.'
        };
    }
}

// Get client's scheduled workouts
async function getSchedule() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/schedule`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch schedule');
        }

        return data;
    } catch (error) {
        console.error('Get schedule error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch schedule. Please try again.'
        };
    }
}

// Get client's program
async function getPrograms() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/programs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch programs');
        }

        return data;
    } catch (error) {
        console.error('Get programs error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch programs. Please try again.'
        };
    }
}

// Get client's achievements
async function getAchievements() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/achievements`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch achievements');
        }

        return data;
    } catch (error) {
        console.error('Get achievements error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch achievements. Please try again.'
        };
    }
}

// Get client's progress
async function getProgress() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/progress`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch progress');
        }

        return data;
    } catch (error) {
        console.error('Get progress error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch progress. Please try again.'
        };
    }
}

// Start a workout
async function startWorkout(workoutId) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/workout/${workoutId}/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to start workout');
        }

        return data;
    } catch (error) {
        console.error('Start workout error:', error);
        return {
            success: false,
            error: error.message || 'Failed to start workout. Please try again.'
        };
    }
}

// Complete a workout
async function completeWorkout(workoutId, exerciseData) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/workout/${workoutId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to complete workout');
        }

        return data;
    } catch (error) {
        console.error('Complete workout error:', error);
        return {
            success: false,
            error: error.message || 'Failed to save workout. Please try again.'
        };
    }
}

// Update user profile
async function updateProfile(profileData) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: error.message || 'Failed to update profile. Please try again.'
        };
    }
}

// Send message to trainer
async function sendMessageToTrainer(message) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${window.appConstants.API_BASE_URL}/client/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to send message');
        }

        return data;
    } catch (error) {
        console.error('Send message error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send message. Please try again.'
        };
    }
}

// Export client functions
window.client = {
    getWorkouts,
    getSchedule,
    getPrograms,
    getAchievements,
    getProgress,
    startWorkout,
    completeWorkout,
    updateProfile,
    sendMessageToTrainer
};