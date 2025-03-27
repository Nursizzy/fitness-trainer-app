// Trainer module for FitTrainer

// API URL - local backend
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('fitTrainerAuthToken');

// Get trainer's clients
async function getClients() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/clients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch clients');
        }

        return data;
    } catch (error) {
        console.error('Get clients error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch clients. Please try again.'
        };
    }
}

// Get a specific client
async function getClient(clientId) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/clients/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch client');
        }

        return data;
    } catch (error) {
        console.error('Get client error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch client. Please try again.'
        };
    }
}

// Get trainer's programs
async function getPrograms() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/programs`, {
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

// Get a specific program
async function getProgram(programId) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/programs/${programId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch program');
        }

        return data;
    } catch (error) {
        console.error('Get program error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch program. Please try again.'
        };
    }
}

// Get trainer's exercises
async function getExercises() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/exercises`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch exercises');
        }

        return data;
    } catch (error) {
        console.error('Get exercises error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch exercises. Please try again.'
        };
    }
}

// Create a new program
async function createProgram(programData) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/programs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(programData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to create program');
        }

        return data;
    } catch (error) {
        console.error('Create program error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create program. Please try again.'
        };
    }
}

// Add a new exercise
async function addExercise(exerciseData) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/exercises`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to add exercise');
        }

        return data;
    } catch (error) {
        console.error('Add exercise error:', error);
        return {
            success: false,
            error: error.message || 'Failed to add exercise. Please try again.'
        };
    }
}

// Add new client
async function addClient(clientData) {
    try {
        const token = getAuthToken();

        // This is a bit tricky since we need to:
        // 1. Create a user account first
        // 2. Then assign the client to this trainer

        // For now, we'll handle this with a placeholder
        console.log('Adding client:', clientData);

        return {
            success: false,
            error: 'This feature is not fully implemented yet'
        };
    } catch (error) {
        console.error('Add client error:', error);
        return {
            success: false,
            error: error.message || 'Failed to add client. Please try again.'
        };
    }
}

// Assign client to trainer
async function assignClient(clientId) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/clients/${clientId}/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to assign client');
        }

        return data;
    } catch (error) {
        console.error('Assign client error:', error);
        return {
            success: false,
            error: error.message || 'Failed to assign client. Please try again.'
        };
    }
}

// Assign program to client
async function assignProgram(clientId, programId) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/clients/${clientId}/programs/${programId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to assign program');
        }

        return data;
    } catch (error) {
        console.error('Assign program error:', error);
        return {
            success: false,
            error: error.message || 'Failed to assign program. Please try again.'
        };
    }
}

// Create a workout for a client
async function createWorkout(workoutData) {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/workout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workoutData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to create workout');
        }

        return data;
    } catch (error) {
        console.error('Create workout error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create workout. Please try again.'
        };
    }
}

// Get analytics data
async function getAnalytics() {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/trainer/analytics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch analytics');
        }

        return data;
    } catch (error) {
        console.error('Get analytics error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch analytics. Please try again.'
        };
    }
}

// Export trainer functions
window.trainer = {
    getClients,
    getClient,
    assignClient,
    getPrograms,
    getProgram,
    createProgram,
    getExercises,
    addExercise,
    addClient,
    assignProgram,
    createWorkout,
    getAnalytics
};