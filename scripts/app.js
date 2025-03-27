// Main application script for FitTrainer

// Initialize Telegram Mini App
const tg = window.Telegram.WebApp;

// Tell Telegram we're ready
tg.ready();
tg.expand();

// Get Telegram user info
const user = tg.initDataUnsafe.user || {};

// App state
let appState = {
    currentScreen: 'loading',
    userRole: null,
    isAuthenticated: false,
    userData: {},
    currentWorkout: null,
    currentExerciseIndex: 0
};

// DOM Elements
const screens = {
    loading: document.getElementById('loading-screen'),
    auth: document.getElementById('auth-screen'),
    trainerDashboard: document.getElementById('trainer-dashboard'),
    clientDashboard: document.getElementById('client-dashboard'),
    activeWorkout: document.getElementById('active-workout'),
    createProgram: document.getElementById('create-program'),
    addExercise: document.getElementById('add-exercise')
};

// Show/hide screens
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });

    // Show the requested screen
    screens[screenName].classList.remove('hidden');

    // Update app state
    appState.currentScreen = screenName;

    // Update Telegram Web App settings based on current screen
    updateTelegramSettings(screenName);
}

// Update Telegram settings based on current screen
function updateTelegramSettings(screenName) {
    // Set main button text and visibility based on current screen
    switch(screenName) {
        case 'auth':
            tg.MainButton.hide();
            break;
        case 'activeWorkout':
            tg.MainButton.setText('Complete Workout');
            tg.MainButton.show();
            break;
        default:
            tg.MainButton.hide();
    }

    // Set back button visibility
    if (screenName === 'activeWorkout' || screenName === 'createProgram' || screenName === 'addExercise') {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }
}

// Handle tab switching
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabContainer = button.closest('.tab-bar').parentElement;
            const tabName = button.getAttribute('data-tab');

            // Update active tab button
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            // Show selected tab panel
            tabContainer.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.add('hidden');
            });
            tabContainer.querySelector(`#${tabName}-tab`).classList.remove('hidden');
        });
    });
}

// Initialize app
function initApp() {
    // Setup event listeners
    setupEventListeners();

    // Setup tab navigation
    setupTabNavigation();

    // Check if user is already authenticated
    checkAuthentication();
}

// Setup event listeners
function setupEventListeners() {
    // Role selection buttons
    document.getElementById('trainer-role').addEventListener('click', () => {
        setUserRole('trainer');
    });

    document.getElementById('client-role').addEventListener('click', () => {
        setUserRole('client');
    });

    // Telegram back button handler
    tg.BackButton.onClick(() => {
        handleBackButton();
    });

    // Workout screen back button
    document.getElementById('back-btn').addEventListener('click', () => {
        handleBackButton();
    });

    // Workout navigation buttons
    document.getElementById('next-exercise').addEventListener('click', () => {
        nextExercise();
    });

    document.getElementById('prev-exercise').addEventListener('click', () => {
        prevExercise();
    });

    document.getElementById('complete-workout').addEventListener('click', () => {
        completeWorkout();
    });

    // Action buttons
    document.getElementById('add-client-btn').addEventListener('click', () => {
        tg.showPopup({
            title: 'Add New Client',
            message: 'This feature is coming soon.',
            buttons: [{ type: 'ok' }]
        });
    });

    document.getElementById('create-program-btn').addEventListener('click', () => {
        showScreen('createProgram');
    });

    document.getElementById('add-exercise-btn').addEventListener('click', () => {
        showScreen('addExercise');
    });
}

// Check if user is authenticated
function checkAuthentication() {
    // For demo purposes, we'll simulate an API call
    setTimeout(() => {
        // Simulate no authentication
        appState.isAuthenticated = false;
        showScreen('auth');
    }, 1500);
}

// Set user role and proceed to dashboard
function setUserRole(role) {
    appState.userRole = role;
    appState.isAuthenticated = true;

    // Store user role (in a real app, this would be done via API)
    appState.userData = {
        id: user.id || 'demo-user',
        username: user.username || 'demo-user',
        firstName: user.first_name || 'Demo',
        lastName: user.last_name || 'User',
        role: role
    };

    // Update UI with user info
    updateUserInfo();

    // Navigate to appropriate dashboard
    if (role === 'trainer') {
        loadTrainerData();
        showScreen('trainerDashboard');
    } else {
        loadClientData();
        showScreen('clientDashboard');
    }
}

// Update UI with user info
function updateUserInfo() {
    const userInfoElements = document.querySelectorAll('.user-info');
    const userData = appState.userData;

    userInfoElements.forEach(element => {
        element.innerHTML = `
            <div>
                <strong>${userData.firstName} ${userData.lastName}</strong>
                ${userData.username ? `(@${userData.username})` : ''}
            </div>
        `;
    });
}

// Handle back button
function handleBackButton() {
    switch(appState.currentScreen) {
        case 'activeWorkout':
            // Confirm if user wants to exit workout
            tg.showPopup({
                title: 'Exit Workout?',
                message: 'Your progress will not be saved.',
                buttons: [
                    { id: 'cancel', type: 'cancel', text: 'Cancel' },
                    { id: 'exit', type: 'destructive', text: 'Exit Workout' }
                ]
            }, (buttonId) => {
                if (buttonId === 'exit') {
                    showScreen(appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard');
                }
            });
            break;
        case 'createProgram':
        case 'addExercise':
            showScreen('trainerDashboard');
            break;
        default:
            // Nothing to do
            break;
    }
}

// Load demo data for trainer
function loadTrainerData() {
    // For demo purposes, we'll load static data
    const clientsList = document.getElementById('clients-list');
    clientsList.innerHTML = `
        <div class="list-item">
            <h3>John Smith</h3>
            <p>Program: Strength Building - Week 2</p>
            <p>Last workout: Yesterday</p>
        </div>
        <div class="list-item">
            <h3>Sarah Johnson</h3>
            <p>Program: Weight Loss - Week 4</p>
            <p>Last workout: 3 days ago</p>
        </div>
        <div class="list-item">
            <h3>Mike Peterson</h3>
            <p>Program: Muscle Gain - Week 1</p>
            <p>Last workout: Today</p>
        </div>
    `;

    const programsList = document.getElementById('programs-list');
    programsList.innerHTML = `
        <div class="list-item">
            <h3>Strength Building</h3>
            <p>8 week program, 4 workouts/week</p>
            <p>Active clients: 3</p>
        </div>
        <div class="list-item">
            <h3>Weight Loss</h3>
            <p>12 week program, 5 workouts/week</p>
            <p>Active clients: 2</p>
        </div>
        <div class="list-item">
            <h3>Muscle Gain</h3>
            <p>10 week program, 5 workouts/week</p>
            <p>Active clients: 1</p>
        </div>
    `;

    const exercisesList = document.getElementById('exercises-list');
    exercisesList.innerHTML = `
        <div class="list-item">
            <h3>Barbell Squat</h3>
            <p>Muscle group: Legs</p>
        </div>
        <div class="list-item">
            <h3>Bench Press</h3>
            <p>Muscle group: Chest</p>
        </div>
        <div class="list-item">
            <h3>Deadlift</h3>
            <p>Muscle group: Back</p>
        </div>
        <div class="list-item">
            <h3>Pull-ups</h3>
            <p>Muscle group: Back</p>
        </div>
    `;
}

// Load demo data for client
function loadClientData() {
    // For demo purposes, we'll load static data
    const upcomingWorkouts = document.getElementById('upcoming-workouts');
    upcomingWorkouts.innerHTML = `
        <h3>Upcoming Workouts</h3>
        <div class="list-item">
            <h3>Upper Body Strength</h3>
            <p>Today at 6:00 PM</p>
            <button class="action-btn" onclick="startWorkout('upper-body')">Start Workout</button>
        </div>
        <div class="list-item">
            <h3>Leg Day</h3>
            <p>Tomorrow at 5:30 PM</p>
        </div>
        <div class="list-item">
            <h3>Core Workout</h3>
            <p>Friday at 7:00 PM</p>
        </div>
    `;

    // Setup workouts list
    const workoutsList = document.getElementById('workouts-list');
    workoutsList.innerHTML = `
        <div class="list-item">
            <h3>Upper Body Strength</h3>
            <p>Duration: 45 minutes</p>
            <p>Assigned for: Today</p>
        </div>
        <div class="list-item">
            <h3>Leg Day</h3>
            <p>Duration: 60 minutes</p>
            <p>Assigned for: Tomorrow</p>
        </div>
        <div class="list-item">
            <h3>Core Workout</h3>
            <p>Duration: 30 minutes</p>
            <p>Assigned for: Friday</p>
        </div>
    `;
}

// Start workout
function startWorkout(workoutId) {
    // For demo, we'll use a hardcoded workout
    appState.currentWorkout = {
        id: workoutId,
        title: 'Upper Body Strength',
        description: 'Focus on chest, shoulders, and triceps.',
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
        ],
        duration: 45
    };

    // Reset exercise index
    appState.currentExerciseIndex = 0;

    // Show workout screen
    showScreen('activeWorkout');

    // Load first exercise
    loadCurrentExercise();
}

// Load current exercise in workout
function loadCurrentExercise() {
    const workout = appState.currentWorkout;
    const exerciseIndex = appState.currentExerciseIndex;
    const exercise = workout.exercises[exerciseIndex];

    // Update workout title and info
    document.getElementById('workout-title').textContent = workout.title;
    document.getElementById('workout-description').textContent = workout.description;

    // Update exercise container
    const exerciseContainer = document.getElementById('exercise-container');

    // Build exercise HTML
    let exerciseHtml = `
        <div class="exercise-header">
            <h3>${exercise.name}</h3>
            <div class="exercise-timer">Rest: <span id="rest-timer">90</span>s</div>
        </div>
        <p>${exercise.instructions}</p>
        <div class="exercise-progress">
            <p>Exercise ${exerciseIndex + 1} of ${workout.exercises.length}</p>
        </div>
        <div class="sets-container">
    `;

    // Add sets
    for (let i = 0; i < exercise.sets; i++) {
        exerciseHtml += `
            <div class="set-row">
                <div class="set-number">Set ${i + 1}</div>
                <div class="rep-weight-inputs">
                    <input type="number" class="reps-input" placeholder="Reps" value="${exercise.reps}">
                    <input type="number" class="weight-input" placeholder="Weight" value="${exercise.weight}">
                </div>
                <button class="set-complete-btn" data-set="${i + 1}">✓</button>
            </div>
        `;
    }

    exerciseHtml += `
        </div>
    `;

    exerciseContainer.innerHTML = exerciseHtml;

    // Update navigation buttons
    const prevButton = document.getElementById('prev-exercise');
    const nextButton = document.getElementById('next-exercise');
    const completeButton = document.getElementById('complete-workout');

    // Hide/show prev button based on index
    if (exerciseIndex === 0) {
        prevButton.classList.add('hidden');
    } else {
        prevButton.classList.remove('hidden');
    }

    // Update next/complete buttons
    if (exerciseIndex === workout.exercises.length - 1) {
        nextButton.classList.add('hidden');
        completeButton.classList.remove('hidden');
    } else {
        nextButton.classList.remove('hidden');
        completeButton.classList.add('hidden');
    }

    // Setup set completion listeners
    const setButtons = document.querySelectorAll('.set-complete-btn');
    setButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const setRow = e.target.closest('.set-row');
            setRow.style.opacity = '0.6';
            e.target.textContent = '✓';
            e.target.style.backgroundColor = 'var(--success-color)';
            e.target.style.color = 'white';
        });
    });
}

// Move to next exercise
function nextExercise() {
    // Increment exercise index
    appState.currentExerciseIndex++;

    // Check if we've reached the end
    if (appState.currentExerciseIndex >= appState.currentWorkout.exercises.length) {
        // Complete workout
        completeWorkout();
        return;
    }

    // Load the next exercise
    loadCurrentExercise();
}

// Move to previous exercise
function prevExercise() {
    // Decrement exercise index
    appState.currentExerciseIndex--;

    // Ensure we don't go below 0
    if (appState.currentExerciseIndex < 0) {
        appState.currentExerciseIndex = 0;
    }

    // Load the previous exercise
    loadCurrentExercise();
}

// Complete workout
function completeWorkout() {
    // Show completion popup
    tg.showPopup({
        title: 'Workout Complete!',
        message: 'Great job! You\'ve completed today\'s workout.',
        buttons: [
            { id: 'ok', type: 'ok', text: 'Done' }
        ]
    }, () => {
        // Return to dashboard
        showScreen(appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard');

        // Show alert with congratulations
        setTimeout(() => {
            tg.showAlert('🎉 Congratulations! You\'ve earned 50 fitness points!');
        }, 500);
    });
}

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);