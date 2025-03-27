// Workout module for FitTrainer

// Current workout session data
let currentWorkout = null;
let currentExerciseIndex = 0;
let workoutStartTime = null;
let exerciseStartTime = null;
let restTimerInterval = null;
let workoutTimerInterval = null;
let exerciseLog = [];

// Start a workout session
function startWorkoutSession(workout) {
    // Set current workout
    currentWorkout = workout;
    currentExerciseIndex = 0;

    // Reset logs
    exerciseLog = [];

    // Start workout timer
    workoutStartTime = new Date();
    startWorkoutTimer();

    // Initialize exercise log
    currentWorkout.exercises.forEach(exercise => {
        exerciseLog.push({
            name: exercise.name,
            sets: Array(exercise.sets).fill().map(() => ({
                planned: {
                    reps: exercise.reps,
                    weight: exercise.weight
                },
                actual: {
                    reps: exercise.reps,
                    weight: exercise.weight
                },
                completed: false
            }))
        });
    });

    // Load first exercise
    loadExercise(currentExerciseIndex);
}

// Load exercise at specified index
function loadExercise(index) {
    // Update current index
    currentExerciseIndex = index;

    // Get exercise
    const exercise = currentWorkout.exercises[index];

    // Update UI elements
    document.getElementById('workout-title').textContent = currentWorkout.title;
    document.getElementById('workout-description').textContent = currentWorkout.description;

    // Build exercise HTML
    let exerciseHtml = `
        <div class="exercise-header">
            <h3>${exercise.name}</h3>
            <div class="exercise-timer">Rest: <span id="rest-timer">0</span>s</div>
        </div>
        <p>${exercise.instructions}</p>
        <div class="exercise-progress">
            <p>Exercise ${index + 1} of ${currentWorkout.exercises.length}</p>
        </div>
        <div class="sets-container">
    `;

    // Add sets
    for (let i = 0; i < exercise.sets; i++) {
        const setLog = exerciseLog[index].sets[i];
        const completed = setLog.completed ? 'completed' : '';

        exerciseHtml += `
            <div class="set-row ${completed}" data-set="${i + 1}">
                <div class="set-number">Set ${i + 1}</div>
                <div class="rep-weight-inputs">
                    <input type="number" class="reps-input" placeholder="Reps" value="${setLog.actual.reps}" data-set="${i + 1}">
                    <input type="number" class="weight-input" placeholder="Weight" value="${setLog.actual.weight}" data-set="${i + 1}">
                </div>
                <button class="set-complete-btn" data-set="${i + 1}">${setLog.completed ? '✓' : 'Complete'}</button>
            </div>
        `;
    }

    exerciseHtml += `
        </div>
    `;

    // Update container
    document.getElementById('exercise-container').innerHTML = exerciseHtml;

    // Setup set completion listeners
    const setButtons = document.querySelectorAll('.set-complete-btn');
    setButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            completeSet(parseInt(e.target.getAttribute('data-set')) - 1);
        });
    });

    // Setup input listeners
    const repInputs = document.querySelectorAll('.reps-input');
    const weightInputs = document.querySelectorAll('.weight-input');

    repInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const setIndex = parseInt(e.target.getAttribute('data-set')) - 1;
            updateSetData(setIndex, 'reps', parseInt(e.target.value));
        });
    });

    weightInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const setIndex = parseInt(e.target.getAttribute('data-set')) - 1;
            updateSetData(setIndex, 'weight', parseInt(e.target.value));
        });
    });

    // Update navigation buttons
    updateNavigationButtons();

    // Start exercise timer
    exerciseStartTime = new Date();
}

// Complete a set
function completeSet(setIndex) {
    // Get the set row
    const setRow = document.querySelector(`.set-row[data-set="${setIndex + 1}"]`);

    // Update log
    exerciseLog[currentExerciseIndex].sets[setIndex].completed = true;

    // Update UI
    setRow.classList.add('completed');
    const button = setRow.querySelector('.set-complete-btn');
    button.textContent = '✓';
    button.style.backgroundColor = 'var(--success-color)';
    button.style.color = 'white';

    // If this is the last set and not the last exercise, show rest timer
    const exercise = currentWorkout.exercises[currentExerciseIndex];
    if (setIndex === exercise.sets - 1 && currentExerciseIndex < currentWorkout.exercises.length - 1) {
        startRestTimer(exercise.restTime);
    }

    // Check if all sets are complete
    checkAllSetsComplete();
}

// Update set data
function updateSetData(setIndex, property, value) {
    exerciseLog[currentExerciseIndex].sets[setIndex].actual[property] = value;
}

// Check if all sets in current exercise are complete
function checkAllSetsComplete() {
    const allSetsComplete = exerciseLog[currentExerciseIndex].sets.every(set => set.completed);

    if (allSetsComplete) {
        // Auto-advance to next exercise after short delay if not the last exercise
        if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
            setTimeout(() => {
                // If user hasn't manually advanced already
                if (currentExerciseIndex === currentExerciseIndex) {
                    nextExercise();
                }
            }, 1500);
        }
    }
}

// Start rest timer
function startRestTimer(duration) {
    // Clear any existing timer
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    // Get timer element
    const timerElement = document.getElementById('rest-timer');

    // Set initial value
    let timeLeft = duration;
    timerElement.textContent = timeLeft;

    // Start countdown
    restTimerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(restTimerInterval);

            // Alert user that rest is over
            const tg = window.Telegram.WebApp;
            tg.HapticFeedback.notificationOccurred('success');
        }
    }, 1000);
}

// Start workout timer
function startWorkoutTimer() {
    // Clear any existing timer
    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
    }

    // Get timer element
    const timerElement = document.querySelector('.workout-timer');

    // Start timer
    workoutTimerInterval = setInterval(() => {
        const elapsedTime = Math.floor((new Date() - workoutStartTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Move to next exercise
function nextExercise() {
    // Clear rest timer
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    // Check if we've reached the end
    if (currentExerciseIndex >= currentWorkout.exercises.length - 1) {
        completeWorkoutSession();
        return;
    }

    // Move to next exercise
    loadExercise(currentExerciseIndex + 1);
}

// Move to previous exercise
function prevExercise() {
    // Clear rest timer
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    // Make sure we don't go below 0
    if (currentExerciseIndex <= 0) {
        return;
    }

    // Move to previous exercise
    loadExercise(currentExerciseIndex - 1);
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-exercise');
    const nextButton = document.getElementById('next-exercise');
    const completeButton = document.getElementById('complete-workout');

    // Hide/show prev button based on index
    if (currentExerciseIndex === 0) {
        prevButton.classList.add('hidden');
    } else {
        prevButton.classList.remove('hidden');
    }

    // Update next/complete buttons
    if (currentExerciseIndex === currentWorkout.exercises.length - 1) {
        nextButton.classList.add('hidden');
        completeButton.classList.remove('hidden');
    } else {
        nextButton.classList.remove('hidden');
        completeButton.classList.add('hidden');
    }
}

// Complete workout session
function completeWorkoutSession() {
    // Stop timers
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
    }

    // Calculate workout duration
    const workoutDuration = Math.floor((new Date() - workoutStartTime) / 1000);

    // Prepare workout summary
    const workoutSummary = {
        id: currentWorkout.id,
        title: currentWorkout.title,
        duration: workoutDuration,
        completedAt: new Date().toISOString(),
        exercises: exerciseLog
    };

    // In a real app, you would send this data to your API
    console.log('Workout summary:', workoutSummary);

    // Call completeWorkout function from client module
    if (window.client && window.client.completeWorkout) {
        window.client.completeWorkout(currentWorkout.id, workoutSummary)
            .then(result => {
                if (result.success) {
                    // Show completion popup
                    const tg = window.Telegram.WebApp;
                    tg.showPopup({
                        title: 'Workout Complete!',
                        message: `Great job! You've earned ${result.points} fitness points!`,
                        buttons: [
                            { id: 'ok', type: 'ok', text: 'Done' }
                        ]
                    }, () => {
                        // Return to dashboard
                        const appState = window.appState || {};
                        const screenName = appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard';

                        if (window.showScreen) {
                            window.showScreen(screenName);
                        }
                    });
                } else {
                    // Show error
                    const tg = window.Telegram.WebApp;
                    tg.showAlert('Error saving workout: ' + (result.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error completing workout:', error);

                // Show error
                const tg = window.Telegram.WebApp;
                tg.showAlert('Error saving workout. Please try again.');
            });
    } else {
        // Fallback if client module not available
        const tg = window.Telegram.WebApp;
        tg.showPopup({
            title: 'Workout Complete!',
            message: 'Great job completing your workout!',
            buttons: [
                { id: 'ok', type: 'ok', text: 'Done' }
            ]
        }, () => {
            // Return to dashboard
            const appState = window.appState || {};
            const screenName = appState.userRole === 'trainer' ? 'trainerDashboard' : 'clientDashboard';

            if (window.showScreen) {
                window.showScreen(screenName);
            }
        });
    }
}

// Export workout functions
window.workout = {
    startWorkoutSession,
    loadExercise,
    nextExercise,
    prevExercise,
    completeWorkoutSession
};