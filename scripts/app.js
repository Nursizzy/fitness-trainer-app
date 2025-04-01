// Main application script for FitTrainer

// Use the globally available Telegram WebApp instance instead of redefining it
// const tg = window.Telegram.WebApp; // Remove this line
const tg = window.tg; // Use the globally available instance

// Tell Telegram we're ready
tg.ready();
tg.expand();

// Get Telegram user info
const user = tg.initDataUnsafe.user || {};

// App state
let appState = {
    currentScreen: 'loading',
    userRole: localStorage.getItem('userRole'),
    isAuthenticated: !!localStorage.getItem('fitTrainerAuthToken'),
    userData: {},
    currentWorkout: null,
    currentExerciseIndex: 0
};

// Make appState available to other modules
window.appState = appState;

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

// Make showScreen available globally
window.showScreen = showScreen;

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


// Setup event listeners
function setupEventListeners() {
    // Role selection buttons
    document.getElementById('trainer-role').addEventListener('click', () => {
        selectRole('trainer');
    });

    document.getElementById('client-role').addEventListener('click', () => {
        selectRole('client');
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
        window.workout.nextExercise();
    });

    document.getElementById('prev-exercise').addEventListener('click', () => {
        window.workout.prevExercise();
    });

    document.getElementById('complete-workout').addEventListener('click', () => {
        window.workout.completeWorkoutSession();
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
async function checkAuthentication() {
    if (appState.isAuthenticated && appState.userRole) {
        try {
            // Get user data
            const userData = await window.auth.getCurrentUser();

            if (userData) {
                appState.userData = userData;

                // Update UI with user info
                updateUserInfo();

                // Load appropriate dashboard based on role
                if (appState.userRole === 'trainer') {
                    await loadTrainerData();
                    showScreen('trainerDashboard');
                } else {
                    await loadClientData();
                    showScreen('clientDashboard');
                }

                return;
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            // If there's an error, we'll proceed to the auth screen
        }
    }

    // If we get here, user is not authenticated
    showScreen('auth');
}

// Handle role selection and proceed to authentication
async function selectRole(role) {
    // Store selected role temporarily
    appState.userRole = role;

    try {
        // Show loading indicator
        showScreen('loading');

        // Attempt Telegram authentication
        const result = await window.auth.authenticateWithTelegram(role);

        if (result.success) {
            appState.isAuthenticated = true;
            appState.userData = result.user;

            // Update UI with user info
            updateUserInfo();

            // Navigate to appropriate dashboard
            if (role === 'trainer') {
                await loadTrainerData();
                showScreen('trainerDashboard');
            } else {
                await loadClientData();
                showScreen('clientDashboard');
            }
        } else {
            // Authentication failed
            tg.showAlert(result.error || 'Authentication failed. Please try again.');
            showScreen('auth');
        }
    } catch (error) {
        console.error('Role selection error:', error);
        tg.showAlert('Authentication error. Please try again.');
        showScreen('auth');
    }
}

// Update UI with user info
function updateUserInfo() {
    const userInfoElements = document.querySelectorAll('.user-info');
    const userData = appState.userData;

    userInfoElements.forEach(element => {
        if (userData) {
            let displayName = userData.name ||
                ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim();

            element.innerHTML = `
                <div>
                    <strong>${displayName}</strong>
                    ${userData.username ? `(@${userData.username})` : ''}
                </div>
            `;
        } else {
            element.innerHTML = `<div>User</div>`;
        }
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

// Load data for trainer dashboard
async function loadTrainerData() {
    try {
        // Show loading indicators or placeholders
        document.getElementById('clients-list').innerHTML = '<div class="loader"></div>';
        document.getElementById('programs-list').innerHTML = '<div class="loader"></div>';
        document.getElementById('exercises-list').innerHTML = '<div class="loader"></div>';

        // Fetch clients
        const clientsResponse = await window.trainer.getClients();
        if (clientsResponse.success) {
            renderClientsList(clientsResponse.clients);
        } else {
            document.getElementById('clients-list').innerHTML = `<p>Error loading clients: ${clientsResponse.error}</p>`;
        }

        // Fetch programs
        const programsResponse = await window.trainer.getPrograms();
        if (programsResponse.success) {
            renderProgramsList(programsResponse.programs);
        } else {
            document.getElementById('programs-list').innerHTML = `<p>Error loading programs: ${programsResponse.error}</p>`;
        }

        // Fetch exercises
        const exercisesResponse = await window.trainer.getExercises();
        if (exercisesResponse.success) {
            renderExercisesList(exercisesResponse.exercises);
        } else {
            document.getElementById('exercises-list').innerHTML = `<p>Error loading exercises: ${exercisesResponse.error}</p>`;
        }

        // Fetch analytics
        await loadAnalytics();
    } catch (error) {
        console.error('Load trainer data error:', error);
        tg.showAlert('Error loading data. Please try refreshing the app.');
    }
}

// Render trainer's clients list
function renderClientsList(clients) {
    const clientsList = document.getElementById('clients-list');

    if (!clients || clients.length === 0) {
        clientsList.innerHTML = '<p>You have no clients yet.</p>';
        return;
    }

    let html = '';

    clients.forEach(client => {
        html += `
            <div class="list-item" data-client-id="${client.id}">
                <h3>${client.name}</h3>
                <p>Fitness Level: ${client.fitnessLevel || 'Not specified'}</p>
                <p>Goals: ${client.goals || 'Not specified'}</p>
            </div>
        `;
    });

    clientsList.innerHTML = html;

    // Add click event listeners
    const clientItems = clientsList.querySelectorAll('.list-item');
    clientItems.forEach(item => {
        item.addEventListener('click', () => {
            const clientId = item.getAttribute('data-client-id');
            viewClientDetails(clientId);
        });
    });
}

// View client details (placeholder)
function viewClientDetails(clientId) {
    tg.showPopup({
        title: 'Client Details',
        message: 'Detailed client view is coming soon.',
        buttons: [{ type: 'ok' }]
    });
}

// Render trainer's programs list
function renderProgramsList(programs) {
    const programsList = document.getElementById('programs-list');

    if (!programs || programs.length === 0) {
        programsList.innerHTML = '<p>You have no programs yet.</p>';
        return;
    }

    let html = '';

    programs.forEach(program => {
        html += `
            <div class="list-item" data-program-id="${program.id}">
                <h3>${program.name}</h3>
                <p>${program.description || ''}</p>
                <p>${program.durationWeeks} week program, Difficulty: ${program.difficulty}</p>
                <p>Active clients: ${program.activeClients || 0}</p>
            </div>
        `;
    });

    programsList.innerHTML = html;

    // Add click event listeners
    const programItems = programsList.querySelectorAll('.list-item');
    programItems.forEach(item => {
        item.addEventListener('click', () => {
            const programId = item.getAttribute('data-program-id');
            viewProgramDetails(programId);
        });
    });
}

// View program details (placeholder)
function viewProgramDetails(programId) {
    tg.showPopup({
        title: 'Program Details',
        message: 'Detailed program view is coming soon.',
        buttons: [{ type: 'ok' }]
    });
}

// Render trainer's exercises list
function renderExercisesList(exercises) {
    const exercisesList = document.getElementById('exercises-list');

    if (!exercises || exercises.length === 0) {
        exercisesList.innerHTML = '<p>You have no exercises yet.</p>';
        return;
    }

    let html = '';

    exercises.forEach(exercise => {
        html += `
            <div class="list-item" data-exercise-id="${exercise.id}">
                <h3>${exercise.name}</h3>
                <p>Muscle group: ${exercise.muscleGroup || 'Not specified'}</p>
                <p>Difficulty: ${exercise.difficulty || 'Not specified'}</p>
            </div>
        `;
    });

    exercisesList.innerHTML = html;

    // Add click event listeners
    const exerciseItems = exercisesList.querySelectorAll('.list-item');
    exerciseItems.forEach(item => {
        item.addEventListener('click', () => {
            const exerciseId = item.getAttribute('data-exercise-id');
            viewExerciseDetails(exerciseId);
        });
    });
}

// View exercise details (placeholder)
function viewExerciseDetails(exerciseId) {
    tg.showPopup({
        title: 'Exercise Details',
        message: 'Detailed exercise view is coming soon.',
        buttons: [{ type: 'ok' }]
    });
}

// Load analytics data
async function loadAnalytics() {
    try {
        const analyticsTab = document.getElementById('analytics-tab');
        analyticsTab.innerHTML = '<div class="loader"></div>';

        const response = await window.trainer.getAnalytics();

        if (response.success) {
            const analytics = response.analytics;

            analyticsTab.innerHTML = `
                <div class="stats-container">
                    <div class="stat-card">
                        <h3>Total Clients</h3>
                        <p class="stat-value">${analytics.totalClients}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Active Clients</h3>
                        <p class="stat-value">${analytics.activeClients}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Workouts Completed</h3>
                        <p class="stat-value">${analytics.workoutsCompleted}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Avg. Completion Rate</h3>
                        <p class="stat-value">${analytics.averageCompletionRate}%</p>
                    </div>
                    <div class="stat-card">
                        <h3>Top Program</h3>
                        <p class="stat-value">${analytics.topProgram || 'None'}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Client Growth</h3>
                        <p class="stat-value">${analytics.clientGrowth}%</p>
                    </div>
                </div>
            `;
        } else {
            analyticsTab.innerHTML = `<p>Error loading analytics: ${response.error}</p>`;
        }
    } catch (error) {
        console.error('Load analytics error:', error);
        document.getElementById('analytics-tab').innerHTML = `<p>Error loading analytics. Please try again.</p>`;
    }
}

// Load data for client dashboard
async function loadClientData() {
    try {
        // Show loading indicators or placeholders
        document.getElementById('upcoming-workouts').innerHTML = '<div class="loader"></div>';
        document.getElementById('workouts-list').innerHTML = '<div class="loader"></div>';
        document.getElementById('progress-tab').innerHTML = '<div class="loader"></div>';
        document.getElementById('achievements-list').innerHTML = '<div class="loader"></div>';

        // Fetch schedule (upcoming workouts)
        const scheduleResponse = await window.client.getSchedule();
        if (scheduleResponse.success) {
            renderClientSchedule(scheduleResponse.schedule);
        } else {
            document.getElementById('upcoming-workouts').innerHTML = `<p>Error loading schedule: ${scheduleResponse.error}</p>`;
        }

        // Fetch workouts
        const workoutsResponse = await window.client.getWorkouts();
        if (workoutsResponse.success) {
            renderClientWorkouts(workoutsResponse.workouts);
        } else {
            document.getElementById('workouts-list').innerHTML = `<p>Error loading workouts: ${workoutsResponse.error}</p>`;
        }

        // Fetch progress
        const progressResponse = await window.client.getProgress();
        if (progressResponse.success) {
            renderClientProgress(progressResponse.progress);
        } else {
            document.getElementById('progress-tab').innerHTML = `<p>Error loading progress: ${progressResponse.error}</p>`;
        }

        // Fetch achievements
        const achievementsResponse = await window.client.getAchievements();
        if (achievementsResponse.success) {
            renderClientAchievements(achievementsResponse.achievements);
        } else {
            document.getElementById('achievements-list').innerHTML = `<p>Error loading achievements: ${achievementsResponse.error}</p>`;
        }
    } catch (error) {
        console.error('Load client data error:', error);
        tg.showAlert('Error loading data. Please try refreshing the app.');
    }
}

// Render client's schedule
function renderClientSchedule(schedule) {
    const upcomingWorkouts = document.getElementById('upcoming-workouts');

    if (!schedule || (!schedule.upcoming || schedule.upcoming.length === 0)) {
        upcomingWorkouts.innerHTML = '<h3>Upcoming Workouts</h3><p>You have no upcoming workouts.</p>';
        return;
    }

    let html = '<h3>Upcoming Workouts</h3>';

    schedule.upcoming.forEach(workout => {
        const scheduledDate = new Date(workout.scheduled);
        const formattedDate = scheduledDate.toLocaleDateString();
        const formattedTime = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        html += `
            <div class="list-item" data-workout-id="${workout.id}">
                <h3>${workout.title}</h3>
                <p>${workout.description || ''}</p>
                <p>${formattedDate} at ${formattedTime}</p>
                <button class="action-btn" onclick="startWorkout('${workout.id}')">Start Workout</button>
            </div>
        `;
    });

    upcomingWorkouts.innerHTML = html;
}

// Render client's workouts
function renderClientWorkouts(workouts) {
    const workoutsList = document.getElementById('workouts-list');

    if (!workouts || workouts.length === 0) {
        workoutsList.innerHTML = '<p>You have no workouts yet.</p>';
        return;
    }

    let html = '';

    workouts.forEach(workout => {
        const scheduledDate = new Date(workout.scheduled);
        const formattedDate = scheduledDate.toLocaleDateString();

        html += `
            <div class="list-item" data-workout-id="${workout.id}">
                <h3>${workout.title}</h3>
                <p>${workout.description || ''}</p>
                <p>Status: ${workout.status || 'Scheduled'}</p>
                <p>Date: ${formattedDate}</p>
                <p>Exercises: ${workout.exercises ? workout.exercises.length : 0}</p>
                ${workout.status !== 'completed' ?
            `<button class="action-btn" onclick="startWorkout('${workout.id}')">Start Workout</button>` :
            '<span class="status-badge completed">Completed</span>'}
            </div>
        `;
    });

    workoutsList.innerHTML = html;
}

// Render client's progress
function renderClientProgress(progress) {
    const progressTab = document.getElementById('progress-tab');

    if (!progress) {
        progressTab.innerHTML = '<p>No progress data available yet.</p>';
        return;
    }

    let html = `
        <div class="stats-container">
            <div class="stat-card">
                <h3>Completion Rate</h3>
                <p class="stat-value">${progress.completionRate || 0}%</p>
            </div>
            <div class="stat-card">
                <h3>Workouts Completed</h3>
                <p class="stat-value">${progress.workoutsCompleted || 0}</p>
            </div>
            <div class="stat-card">
                <h3>Current Streak</h3>
                <p class="stat-value">${progress.streakDays || 0} days</p>
            </div>
        </div>
    `;

    // Add personal bests section if available
    if (progress.personalBests && progress.personalBests.length > 0) {
        html += `
            <div class="section-heading">
                <h3>Personal Bests</h3>
            </div>
            <div class="personal-bests">
        `;

        progress.personalBests.forEach(pb => {
            const date = new Date(pb.date);
            const formattedDate = date.toLocaleDateString();

            html += `
                <div class="personal-best-item">
                    <p class="exercise-name">${pb.exercise}</p>
                    <p class="personal-best-value">${pb.value}</p>
                    <p class="personal-best-date">${formattedDate}</p>
                </div>
            `;
        });

        html += '</div>';
    }

    // Add weight progress section if available
    if (progress.weightData && progress.weightData.length > 0) {
        html += `
            <div class="section-heading">
                <h3>Weight Progress</h3>
            </div>
            <div class="weight-progress">
        `;

        // Sort by date
        const sortedWeightData = [...progress.weightData].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedWeightData.forEach(entry => {
            const date = new Date(entry.date);
            const formattedDate = date.toLocaleDateString();

            html += `
                <div class="weight-entry">
                    <span class="weight-date">${formattedDate}</span>
                    <span class="weight-value">${entry.value} lbs</span>
                </div>
            `;
        });

        html += '</div>';
    }

    progressTab.innerHTML = html;
}

// Render client's achievements
function renderClientAchievements(achievements) {
    const achievementsList = document.getElementById('achievements-list');

    if (!achievements || achievements.length === 0) {
        achievementsList.innerHTML = '<p>You have no achievements yet. Keep working out to earn some!</p>';
        return;
    }

    let html = '';

    achievements.forEach(achievement => {
        const date = achievement.date ? new Date(achievement.date) : null;
        const formattedDate = date ? date.toLocaleDateString() : 'N/A';

        html += `
            <div class="achievement-item">
                <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                <div class="achievement-info">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <p class="achievement-date">Earned on: ${formattedDate}</p>
                </div>
            </div>
        `;
    });

    achievementsList.innerHTML = html;
}

// Start a workout
async function startWorkout(workoutId) {
    try {
        // Show loading screen
        showScreen('loading');

        // Call the workout module to start the workout session
        const result = await window.workout.startWorkoutSession(workoutId);

        if (result && result.success) {
            showScreen('activeWorkout');
        } else {
            tg.showAlert(result.error || 'Failed to start workout. Please try again.');
            showScreen(appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard');
        }
    } catch (error) {
        console.error('Start workout error:', error);
        tg.showAlert('Error starting workout. Please try again.');
        showScreen(appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard');
    }
}

// Start the app when DOM is fully loaded
// Initialize app
function initApp() {
    // Setup event listeners
    setupEventListeners();

    // Setup tab navigation
    setupTabNavigation();

    // Check if user is already authenticated
    checkAuthentication();
}

// Ensure we wait for both DOM and Telegram WebApp to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required modules are loaded
    if (window.tg && window.auth && window.client &&
        window.trainer && window.workout) {
        // Wait for Telegram WebApp to be fully ready
        window.tg.ready(() => {
            console.log("Telegram WebApp and all modules are ready, initializing app...");
            initApp();
        });
    } else {
        console.error("Required modules not loaded:", {
            tg: !!window.tg,
            auth: !!window.auth,
            client: !!window.client,
            trainer: !!window.trainer,
            workout: !!window.workout
        });
    }
});