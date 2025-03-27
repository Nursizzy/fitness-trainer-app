// Trainer module for FitTrainer

// API URL (replace with your actual API endpoint in production)
const API_BASE_URL = 'https://api.example.com';

// Demo data for trainer
const demoClients = [
    {
        id: 'client1',
        name: 'John Smith',
        email: 'john@example.com',
        program: 'Strength Building',
        progress: {
            programWeek: 2,
            lastWorkout: '2025-03-26',
            completionRate: 85
        }
    },
    {
        id: 'client2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        program: 'Weight Loss',
        progress: {
            programWeek: 4,
            lastWorkout: '2025-03-24',
            completionRate: 70
        }
    },
    {
        id: 'client3',
        name: 'Mike Peterson',
        email: 'mike@example.com',
        program: 'Muscle Gain',
        progress: {
            programWeek: 1,
            lastWorkout: '2025-03-27',
            completionRate: 95
        }
    }
];

const demoPrograms = [
    {
        id: 'program1',
        name: 'Strength Building',
        description: 'Focus on building overall strength with compound movements.',
        weeks: 8,
        workoutsPerWeek: 4,
        activeClients: 3
    },
    {
        id: 'program2',
        name: 'Weight Loss',
        description: 'High intensity workouts with cardio focus for maximum calorie burn.',
        weeks: 12,
        workoutsPerWeek: 5,
        activeClients: 2
    },
    {
        id: 'program3',
        name: 'Muscle Gain',
        description: 'Hypertrophy-focused program with progressive overload.',
        weeks: 10,
        workoutsPerWeek: 5,
        activeClients: 1
    }
];

const demoExercises = [
    {
        id: 'exercise1',
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        description: 'Compound movement targeting quads, hamstrings, and glutes.',
        difficulty: 'Intermediate'
    },
    {
        id: 'exercise2',
        name: 'Bench Press',
        muscleGroup: 'Chest',
        description: 'Compound pushing movement for chest, shoulders, and triceps.',
        difficulty: 'Intermediate'
    },
    {
        id: 'exercise3',
        name: 'Deadlift',
        muscleGroup: 'Back',
        description: 'Compound pull movement targeting the posterior chain.',
        difficulty: 'Advanced'
    },
    {
        id: 'exercise4',
        name: 'Pull-ups',
        muscleGroup: 'Back',
        description: 'Upper body pull movement for back and biceps.',
        difficulty: 'Intermediate'
    }
];

// Get trainer's clients
async function getClients() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            clients: demoClients
        };
    } catch (error) {
        console.error('Get clients error:', error);
        return {
            success: false,
            error: 'Failed to fetch clients. Please try again.'
        };
    }
}

// Get trainer's programs
async function getPrograms() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            programs: demoPrograms
        };
    } catch (error) {
        console.error('Get programs error:', error);
        return {
            success: false,
            error: 'Failed to fetch programs. Please try again.'
        };
    }
}

// Get trainer's exercises
async function getExercises() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            exercises: demoExercises
        };
    } catch (error) {
        console.error('Get exercises error:', error);
        return {
            success: false,
            error: 'Failed to fetch exercises. Please try again.'
        };
    }
}

// Create a new program
async function createProgram(programData) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Create new program object
        const newProgram = {
            id: 'program' + (demoPrograms.length + 1),
            name: programData.name,
            description: programData.description,
            weeks: programData.weeks,
            workoutsPerWeek: programData.workoutsPerWeek,
            activeClients: 0
        };

        // Add to demo programs (in real app, this would be stored in DB)
        demoPrograms.push(newProgram);

        return {
            success: true,
            program: newProgram
        };
    } catch (error) {
        console.error('Create program error:', error);
        return {
            success: false,
            error: 'Failed to create program. Please try again.'
        };
    }
}

// Add a new exercise
async function addExercise(exerciseData) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Create new exercise object
        const newExercise = {
            id: 'exercise' + (demoExercises.length + 1),
            name: exerciseData.name,
            muscleGroup: exerciseData.muscleGroup,
            description: exerciseData.description,
            difficulty: exerciseData.difficulty
        };

        // Add to demo exercises (in real app, this would be stored in DB)
        demoExercises.push(newExercise);

        return {
            success: true,
            exercise: newExercise
        };
    } catch (error) {
        console.error('Add exercise error:', error);
        return {
            success: false,
            error: 'Failed to add exercise. Please try again.'
        };
    }
}

// Add new client
async function addClient(clientData) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Create new client object
        const newClient = {
            id: 'client' + (demoClients.length + 1),
            name: clientData.name,
            email: clientData.email,
            program: clientData.program || 'None assigned',
            progress: {
                programWeek: 0,
                lastWorkout: 'N/A',
                completionRate: 0
            }
        };

        // Add to demo clients (in real app, this would be stored in DB)
        demoClients.push(newClient);

        return {
            success: true,
            client: newClient
        };
    } catch (error) {
        console.error('Add client error:', error);
        return {
            success: false,
            error: 'Failed to add client. Please try again.'
        };
    }
}

// Assign program to client
async function assignProgram(clientId, programId) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find client and program
        const client = demoClients.find(c => c.id === clientId);
        const program = demoPrograms.find(p => p.id === programId);

        if (!client || !program) {
            throw new Error('Client or program not found');
        }

        // Update client's program
        client.program = program.name;
        client.progress.programWeek = 1;

        // Increment program's active clients
        program.activeClients++;

        return {
            success: true
        };
    } catch (error) {
        console.error('Assign program error:', error);
        return {
            success: false,
            error: 'Failed to assign program. Please try again.'
        };
    }
}

// Get analytics data
async function getAnalytics() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy analytics data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            analytics: {
                totalClients: demoClients.length,
                activeClients: demoClients.length,
                averageCompletionRate: 83,
                workoutsCompleted: 45,
                topProgram: 'Strength Building',
                clientGrowth: 25 // percentage growth last month
            }
        };
    } catch (error) {
        console.error('Get analytics error:', error);
        return {
            success: false,
            error: 'Failed to fetch analytics. Please try again.'
        };
    }
}

// Export trainer functions
window.trainer = {
    getClients,
    getPrograms,
    getExercises,
    createProgram,
    addExercise,
    addClient,
    assignProgram,
    getAnalytics
};