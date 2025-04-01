// Main application script for FitTrainer
console.log("App.js loaded, initializing...");

// Initialize Telegram Web App if available
let tgAvailable = false;
try {
    // Check if Telegram object exists
    if (window.Telegram && window.Telegram.WebApp) {
        window.tg = window.Telegram.WebApp;
        tgAvailable = true;
        console.log("Telegram WebApp found, preparing to initialize");

        // Tell Telegram we're ready
        window.tg.ready();
        window.tg.expand();
    } else {
        console.log("Telegram WebApp not found, running in standalone mode");
    }
} catch (error) {
    console.error("Error initializing Telegram WebApp:", error);
}

// App state
let appState = {
    currentScreen: 'loading',
    userRole: localStorage.getItem('userRole'),
    isAuthenticated: !!localStorage.getItem('fitTrainerAuthToken'),
    userData: {},
    currentWorkout: null,
    currentExerciseIndex: 0,
    standaloneMode: !tgAvailable
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
    console.log(`Showing screen: ${screenName}`);
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });

    // Show the requested screen
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
    } else {
        console.error(`Screen ${screenName} not found`);
    }

    // Update app state
    appState.currentScreen = screenName;

    // Update Telegram Web App settings based on current screen
    if (tgAvailable) {
        updateTelegramSettings(screenName);
    }
}

// Update Telegram settings based on current screen
function updateTelegramSettings(screenName) {
    if (!window.tg) return;

    // Set main button text and visibility based on current screen
    switch(screenName) {
        case 'auth':
            window.tg.MainButton.hide();
            break;
        case 'activeWorkout':
            window.tg.MainButton.setText('Complete Workout');
            window.tg.MainButton.show();
            break;
        default:
            window.tg.MainButton.hide();
    }

    // Set back button visibility
    if (screenName === 'activeWorkout' || screenName === 'createProgram' || screenName === 'addExercise') {
        window.tg.BackButton.show();
    } else {
        window.tg.BackButton.hide();
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

            const targetTab = tabContainer.querySelector(`#${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.remove('hidden');
            } else {
                console.error(`Tab panel #${tabName}-tab not found`);
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Role selection buttons
    const trainerRoleBtn = document.getElementById('trainer-role');
    const clientRoleBtn = document.getElementById('client-role');

    if (trainerRoleBtn) {
        trainerRoleBtn.addEventListener('click', () => {
            selectRole('trainer');
        });
    }

    if (clientRoleBtn) {
        clientRoleBtn.addEventListener('click', () => {
            selectRole('client');
        });
    }

    // Telegram back button handler if available
    if (tgAvailable && window.tg.BackButton) {
        window.tg.BackButton.onClick(() => {
            handleBackButton();
        });
    }

    // Workout screen back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            handleBackButton();
        });
    }

    // Workout navigation buttons
    const nextExerciseBtn = document.getElementById('next-exercise');
    const prevExerciseBtn = document.getElementById('prev-exercise');
    const completeWorkoutBtn = document.getElementById('complete-workout');

    if (nextExerciseBtn && window.workout) {
        nextExerciseBtn.addEventListener('click', () => {
            window.workout.nextExercise();
        });
    }

    if (prevExerciseBtn && window.workout) {
        prevExerciseBtn.addEventListener('click', () => {
            window.workout.prevExercise();
        });
    }

    if (completeWorkoutBtn && window.workout) {
        completeWorkoutBtn.addEventListener('click', () => {
            window.workout.completeWorkoutSession();
        });
    }

    // Action buttons
    const addClientBtn = document.getElementById('add-client-btn');
    const createProgramBtn = document.getElementById('create-program-btn');
    const addExerciseBtn = document.getElementById('add-exercise-btn');

    if (addClientBtn) {
        addClientBtn.addEventListener('click', () => {
            showAlert('Add New Client', 'This feature is coming soon.');
        });
    }

    if (createProgramBtn) {
        createProgramBtn.addEventListener('click', () => {
            // Use the function from createProgram.js
            if (window.updateCreateProgramScreen) {
                window.updateCreateProgramScreen();
            }
            showScreen('create-program');
        });
    }

    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
            // Use the function from addExercise.js
            if (window.updateAddExerciseScreen) {
                window.updateAddExerciseScreen();
            }
            showScreen('add-exercise');
        });
    }
}

// Show alert - works both in Telegram and standalone mode
function showAlert(title, message) {
    if (tgAvailable) {
        window.tg.showPopup({
            title: title,
            message: message,
            buttons: [{ type: 'ok' }]
        });
    } else {
        alert(`${title}\n\n${message}`);
    }
}

// Check if user is authenticated
async function checkAuthentication() {
    console.log("Checking authentication...");
    console.log("Auth state:", {
        isAuthenticated: appState.isAuthenticated,
        userRole: appState.userRole,
        standaloneMode: appState.standaloneMode
    });

    if (appState.isAuthenticated && appState.userRole) {
        try {
            // Get user data if auth module is available
            if (window.auth && window.auth.getCurrentUser) {
                const userData = await window.auth.getCurrentUser();

                if (userData) {
                    appState.userData = userData;

                    // Update UI with user info
                    updateUserInfo();

                    // Load appropriate dashboard based on role
                    if (appState.userRole === 'trainer') {
                        if (window.trainer) {
                            await loadTrainerData();
                        }
                        showScreen('trainerDashboard');
                    } else {
                        if (window.client) {
                            await loadClientData();
                        }
                        showScreen('clientDashboard');
                    }

                    return;
                }
            } else {
                console.warn("Auth module not available");
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            // If there's an error, we'll proceed to the auth screen
        }
    }

    // For testing/development in standalone mode
    if (appState.standaloneMode) {
        console.log("Running in standalone mode - showing auth screen");
        // In standalone mode, allow direct selection without Telegram auth
        showScreen('auth');
        return;
    }

    // If we get here, user is not authenticated
    showScreen('auth');
}

// Handle role selection and proceed to authentication
async function selectRole(role) {
    console.log(`Role selected: ${role}`);
    // Store selected role temporarily
    appState.userRole = role;
    localStorage.setItem('userRole', role);

    try {
        // Show loading indicator
        showScreen('loading');

        // For standalone mode, skip Telegram authentication
        if (appState.standaloneMode) {
            console.log("Standalone mode: bypassing Telegram authentication");
            appState.isAuthenticated = true;
            appState.userData = {
                name: 'Test User',
                role: role
            };
            localStorage.setItem('fitTrainerAuthToken', 'test-token');

            // Update UI with user info
            updateUserInfo();

            // Navigate to appropriate dashboard
            if (role === 'trainer') {
                if (window.trainer) {
                    await loadTrainerData();
                }
                showScreen('trainerDashboard');
            } else {
                if (window.client) {
                    await loadClientData();
                }
                showScreen('clientDashboard');
            }
            return;
        }

        // Attempt Telegram authentication if auth module is available
        if (window.auth && window.auth.authenticateWithTelegram) {
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
                showAlert('Authentication Failed', result.error || 'Authentication failed. Please try again.');
                showScreen('auth');
            }
        } else {
            console.error("Auth module not available");
            showAlert('Error', 'Authentication module not available');
            showScreen('auth');
        }
    } catch (error) {
        console.error('Role selection error:', error);
        showAlert('Authentication Error', 'Please try again.');
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

            if (!displayName) displayName = 'User';

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
            if (tgAvailable && window.tg.showPopup) {
                window.tg.showPopup({
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
            } else {
                if (confirm('Exit workout? Your progress will not be saved.')) {
                    showScreen(appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard');
                }
            }
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
        // Check if trainer module is available
        if (!window.trainer) {
            console.error("Trainer module not available");
            return;
        }

        // Show loading indicators or placeholders
        const clientsList = document.getElementById('clients-list');
        const programsList = document.getElementById('programs-list');
        const exercisesList = document.getElementById('exercises-list');

        if (clientsList) clientsList.innerHTML = '<div class="loader"></div>';
        if (programsList) programsList.innerHTML = '<div class="loader"></div>';
        if (exercisesList) exercisesList.innerHTML = '<div class="loader"></div>';

        // Fetch clients
        if (window.trainer.getClients) {
            const clientsResponse = await window.trainer.getClients();
            if (clientsResponse.success && clientsList) {
                renderClientsList(clientsResponse.clients);
            } else if (clientsList) {
                clientsList.innerHTML = `<p>Error loading clients: ${clientsResponse.error || 'Unknown error'}</p>`;
            }
        }

        // Fetch programs
        if (window.trainer.getPrograms) {
            const programsResponse = await window.trainer.getPrograms();
            if (programsResponse.success && programsList) {
                renderProgramsList(programsResponse.programs);
            } else if (programsList) {
                programsList.innerHTML = `<p>Error loading programs: ${programsResponse.error || 'Unknown error'}</p>`;
            }
        }

        // Fetch exercises
        if (window.trainer.getExercises) {
            const exercisesResponse = await window.trainer.getExercises();
            if (exercisesResponse.success && exercisesList) {
                renderExercisesList(exercisesResponse.exercises);
            } else if (exercisesList) {
                exercisesList.innerHTML = `<p>Error loading exercises: ${exercisesResponse.error || 'Unknown error'}</p>`;
            }
        }

        // Fetch analytics
        await loadAnalytics();
    } catch (error) {
        console.error('Load trainer data error:', error);
        showAlert('Error', 'Error loading data. Please try refreshing the app.');
    }
}

// Fallback data for development/testing
const fallbackData = {
    clients: [
        { id: 1, name: 'John Doe', fitnessLevel: 'Intermediate', goals: 'Strength & Muscle Gain' },
        { id: 2, name: 'Jane Smith', fitnessLevel: 'Beginner', goals: 'Weight Loss' }
    ],
    programs: [
        { id: 1, name: 'Beginner Strength', description: 'Foundation strength training', durationWeeks: 8, difficulty: 'Beginner', activeClients: 5 },
        { id: 2, name: 'Fat Loss Challenge', description: 'High intensity program', durationWeeks: 12, difficulty: 'Intermediate', activeClients: 8 }
    ],
    exercises: [
        { id: 1, name: 'Barbell Squat', muscleGroup: 'Legs', difficulty: 'Intermediate' },
        { id: 2, name: 'Push-up', muscleGroup: 'Chest', difficulty: 'Beginner' }
    ],
    analytics: {
        totalClients: 15,
        activeClients: 12,
        workoutsCompleted: 87,
        averageCompletionRate: 78,
        topProgram: 'Fat Loss Challenge',
        clientGrowth: 25
    }
};

// Render trainer's clients list
function renderClientsList(clients) {
    const clientsList = document.getElementById('clients-list');
    if (!clientsList) return;

    // Use fallback data for development/testing if needed
    if (!clients || clients.length === 0) {
        if (appState.standaloneMode) {
            clients = fallbackData.clients;
        } else {
            clientsList.innerHTML = '<p>You have no clients yet.</p>';
            return;
        }
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
    showAlert('Client Details', 'Detailed client view is coming soon.');
}

// Render trainer's programs list
function renderProgramsList(programs) {
    const programsList = document.getElementById('programs-list');
    if (!programsList) return;

    // Use fallback data for development/testing if needed
    if (!programs || programs.length === 0) {
        if (appState.standaloneMode) {
            programs = fallbackData.programs;
        } else {
            programsList.innerHTML = '<p>You have no programs yet.</p>';
            return;
        }
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
    showAlert('Program Details', 'Detailed program view is coming soon.');
}

// Render trainer's exercises list
function renderExercisesList(exercises) {
    const exercisesList = document.getElementById('exercises-list');
    if (!exercisesList) return;

    // Use fallback data for development/testing if needed
    if (!exercises || exercises.length === 0) {
        if (appState.standaloneMode) {
            exercises = fallbackData.exercises;
        } else {
            exercisesList.innerHTML = '<p>You have no exercises yet.</p>';
            return;
        }
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
    showAlert('Exercise Details', 'Detailed exercise view is coming soon.');
}

// Load analytics data
async function loadAnalytics() {
    try {
        const analyticsTab = document.getElementById('analytics-tab');
        if (!analyticsTab) return;

        analyticsTab.innerHTML = '<div class="loader"></div>';

        let analytics;

        if (window.trainer && window.trainer.getAnalytics) {
            const response = await window.trainer.getAnalytics();
            if (response.success) {
                analytics = response.analytics;
            }
        }

        // Use fallback data if needed
        if (!analytics && appState.standaloneMode) {
            analytics = fallbackData.analytics;
        }

        if (analytics) {
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
            analyticsTab.innerHTML = `<p>Analytics data not available</p>`;
        }
    } catch (error) {
        console.error('Load analytics error:', error);
        const analyticsTab = document.getElementById('analytics-tab');
        if (analyticsTab) {
            analyticsTab.innerHTML = `<p>Error loading analytics. Please try again.</p>`;
        }
    }
}

// Load data for client dashboard
async function loadClientData() {
    // Client functionality can be implemented similarly to trainer dashboard
    // with proper error handling and fallback data
    console.log("Client dashboard loading is not fully implemented");

    // For now, show placeholders
    const elements = [
        'upcoming-workouts',
        'workouts-list',
        'progress-tab',
        'achievements-list'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<p>Data loading is not implemented in standalone mode</p>';
        }
    });
}

// Initialize app
function initApp() {
    console.log("Initializing app...");

    // Setup event listeners
    setupEventListeners();

    // Setup tab navigation
    setupTabNavigation();

    // Check if user is already authenticated
    checkAuthentication();
}

// Make these functions available globally
window.renderExercisesList = renderExercisesList;
window.renderProgramsList = renderProgramsList;

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, starting app initialization");

    // Check if Telegram object exists but don't wait for ready event
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("Telegram WebApp found, initializing immediately");
        window.tg = window.Telegram.WebApp;
        tgAvailable = true;

        try {
            // Tell Telegram we're ready
            window.tg.ready();
            window.tg.expand();
        } catch (e) {
            console.error("Error calling Telegram ready methods:", e);
        }

        // Initialize without waiting for the ready callback
        initApp();
    } else {
        console.log("Telegram WebApp not available, falling back to standalone mode");
        appState.standaloneMode = true;
        initApp();
    }
});