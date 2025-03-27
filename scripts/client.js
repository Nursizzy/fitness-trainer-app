// Client module for FitTrainer

// API URL (replace with your actual API endpoint in production)
const API_BASE_URL = 'https://api.example.com';

// Demo data for client
const demoWorkouts = [
    {
        id: 'workout1',
        title: 'Upper Body Strength',
        description: 'Focus on chest, shoulders, and triceps.',
        duration: 45,
        scheduled: '2025-03-27T18:00:00',
        exercises: [
            {
                name: 'Bench Press',
                sets: 3,
                reps: 10,
                weight: 135,
                instructions: 'Lie on the bench with feet on the floor. Grip the bar with hands slightly wider than shoulder-width. Lower the bar to your chest, then press back up.',
                restTime: 90
            },
            {
                name: 'Overhead Press',
                sets: 3,
                reps: 12,
                weight: 65,
                instructions: 'Hold the bar at shoulder level with palms facing forward. Press the bar overhead until arms are extended, then lower back to shoulders.',
                restTime: 90
            },
            {
                name: 'Tricep Pushdowns',
                sets: 3,
                reps: 15,
                weight: 50,
                instructions: 'Stand facing a cable machine with a rope attachment. Push the rope down until arms are fully extended, then slowly return to starting position.',
                restTime: 60
            },
            {
                name: 'Lat Pulldowns',
                sets: 3,
                reps: 12,
                weight: 120,
                instructions: 'Sit at a pulldown machine with a wide grip on the bar. Pull the bar down to your chest, then slowly release back up with control.',
                restTime: 90
            }
        ]
    },
    {
        id: 'workout2',
        title: 'Leg Day',
        description: 'Focus on quadriceps, hamstrings, and calves.',
        duration: 60,
        scheduled: '2025-03-28T17:30:00',
        exercises: [
            {
                name: 'Barbell Squat',
                sets: 4,
                reps: 8,
                weight: 185,
                instructions: 'Stand with feet shoulder-width apart, barbell across upper back. Bend knees and lower until thighs are parallel to floor, then return to standing.',
                restTime: 120
            },
            {
                name: 'Romanian Deadlift',
                sets: 3,
                reps: 12,
                weight: 135,
                instructions: 'Hold barbell at hip level. Keeping back straight and knees slightly bent, hinge at hips and lower bar along legs until you feel hamstring stretch, then return to starting position.',
                restTime: 90
            },
            {
                name: 'Leg Press',
                sets: 3,
                reps: 15,
                weight: 300,
                instructions: 'Sit in leg press machine with feet shoulder-width apart on platform. Release safety and lower platform until knees form 90-degree angle, then press back up.',
                restTime: 90
            },
            {
                name: 'Calf Raises',
                sets: 4,
                reps: 20,
                weight: 0,
                instructions: 'Stand on edge of platform with heels hanging off. Rise up onto toes, then lower heels below platform level. Can be done with bodyweight or holding dumbbells.',
                restTime: 60
            }
        ]
    },
    {
        id: 'workout3',
        title: 'Core Workout',
        description: 'Strengthen abs, obliques, and lower back.',
        duration: 30,
        scheduled: '2025-03-29T19:00:00',
        exercises: [
            {
                name: 'Plank',
                sets: 3,
                reps: 1,
                weight: 0,
                instructions: 'Get in push-up position but with forearms on ground. Keep body straight from head to heels. Hold position.',
                restTime: 60,
                duration: 60 // seconds
            },
            {
                name: 'Russian Twists',
                sets: 3,
                reps: 20,
                weight: 10,
                instructions: 'Sit on floor with knees bent and feet elevated. Hold weight with both hands and twist torso to touch weight to floor on each side.',
                restTime: 45
            },
            {
                name: 'Leg Raises',
                sets: 3,
                reps: 15,
                weight: 0,
                instructions: 'Lie on back with hands under lower back for support. Keeping legs straight, raise them to 90 degrees, then lower slowly without touching floor.',
                restTime: 45
            },
            {
                name: 'Superman',
                sets: 3,
                reps: 12,
                weight: 0,
                instructions: 'Lie face down with arms extended overhead. Simultaneously lift arms, chest, and legs off floor. Hold briefly, then return to starting position.',
                restTime: 45
            }
        ]
    }
];

const demoProgram = {
    id: 'program1',
    name: 'Strength Building',
    description: 'Focus on building overall strength with compound movements.',
    startDate: '2025-03-20',
    endDate: '2025-05-15',
    currentWeek: 2,
    totalWeeks: 8,
    progress: 18 // percentage
};

const demoAchievements = [
    {
        id: 'achievement1',
        name: 'First Workout',
        description: 'Completed your first workout.',
        date: '2025-03-20',
        icon: '🏆'
    },
    {
        id: 'achievement2',
        name: 'Perfect Week',
        description: 'Completed all scheduled workouts in a week.',
        date: '2025-03-24',
        icon: '⭐'
    },
    {
        id: 'achievement3',
        name: 'Early Bird',
        description: 'Completed a workout before 8am.',
        date: '2025-03-22',
        icon: '🌅'
    }
];

// Get client's workouts
async function getWorkouts() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            workouts: demoWorkouts
        };
    } catch (error) {
        console.error('Get workouts error:', error);
        return {
            success: false,
            error: 'Failed to fetch workouts. Please try again.'
        };
    }
}

// Get client's scheduled workouts
async function getSchedule() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Sort workouts by scheduled date
        const sortedWorkouts = [...demoWorkouts].sort((a, b) => {
            return new Date(a.scheduled) - new Date(b.scheduled);
        });

        return {
            success: true,
            schedule: sortedWorkouts
        };
    } catch (error) {
        console.error('Get schedule error:', error);
        return {
            success: false,
            error: 'Failed to fetch schedule. Please try again.'
        };
    }
}

// Get client's program
async function getProgram() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            program: demoProgram
        };
    } catch (error) {
        console.error('Get program error:', error);
        return {
            success: false,
            error: 'Failed to fetch program. Please try again.'
        };
    }
}

// Get client's achievements
async function getAchievements() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            achievements: demoAchievements
        };
    } catch (error) {
        console.error('Get achievements error:', error);
        return {
            success: false,
            error: 'Failed to fetch achievements. Please try again.'
        };
    }
}

// Get client's progress
async function getProgress() {
    try {
        // In a real app, this would be an API call
        // For demo, we'll return dummy data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            progress: {
                programProgress: demoProgram.progress,
                workoutsCompleted: 4,
                totalWorkouts: 8,
                streakDays: 3,
                personalBests: [
                    { exercise: 'Bench Press', value: '145 lbs', date: '2025-03-25' },
                    { exercise: 'Squat', value: '205 lbs', date: '2025-03-21' }
                ],
                weightData: [
                    { date: '2025-03-15', value: 180 },
                    { date: '2025-03-22', value: 178 },
                    { date: '2025-03-29', value: 176 }
                ]
            }
        };
    } catch (error) {
        console.error('Get progress error:', error);
        return {
            success: false,
            error: 'Failed to fetch progress. Please try again.'
        };
    }
}

// Start a workout
async function startWorkout(workoutId) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll just return the workout data

        // Find the workout
        const workout = demoWorkouts.find(w => w.id === workoutId);

        if (!workout) {
            throw new Error('Workout not found');
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            workout: workout
        };
    } catch (error) {
        console.error('Start workout error:', error);
        return {
            success: false,
            error: 'Failed to start workout. Please try again.'
        };
    }
}

// Complete a workout
async function completeWorkout(workoutId, exerciseData) {
    try {
        // In a real app, this would be an API call to save the workout results
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // In a real app, you would save the exercise data
        console.log('Completed workout:', workoutId);
        console.log('Exercise data:', exerciseData);

        return {
            success: true,
            message: 'Workout completed successfully!',
            points: 50,
            achievements: [
                {
                    id: 'achievement4',
                    name: 'Workout Warrior',
                    description: 'Complete 5 workouts.',
                    icon: '💪'
                }
            ]
        };
    } catch (error) {
        console.error('Complete workout error:', error);
        return {
            success: false,
            error: 'Failed to save workout. Please try again.'
        };
    }
}

// Update user profile
async function updateProfile(profileData) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            message: 'Profile updated successfully!'
        };
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: 'Failed to update profile. Please try again.'
        };
    }
}

// Send message to trainer
async function sendMessageToTrainer(message) {
    try {
        // In a real app, this would be an API call
        // For demo, we'll simulate success

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            message: 'Message sent to trainer!'
        };
    } catch (error) {
        console.error('Send message error:', error);
        return {
            success: false,
            error: 'Failed to send message. Please try again.'
        };
    }
}

// Export client functions
window.client = {
    getWorkouts,
    getSchedule,
    getProgram,
    getAchievements,
    getProgress,
    startWorkout,
    completeWorkout,
    updateProfile,
    sendMessageToTrainer
};