// createProgram.js - Handles the Create Program functionality

// Update the Create Program screen with the form and event handlers
function updateCreateProgramScreen() {
    const createProgramScreen = document.getElementById('create-program');
    if (!createProgramScreen) return;

    createProgramScreen.innerHTML = `
        <div class="header">
            <button id="program-back-btn" class="back-btn">←</button>
            <h1>Create Program</h1>
        </div>
        <div class="container">
            <form id="program-form">
                <div class="form-group">
                    <label for="program-name">Program Name *</label>
                    <input type="text" id="program-name" required placeholder="e.g., 12-Week Strength Builder">
                </div>
                
                <div class="form-group">
                    <label for="program-description">Description *</label>
                    <textarea id="program-description" required placeholder="Describe the program goals, structure, and target audience"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="duration-weeks">Duration (Weeks) *</label>
                    <input type="number" id="duration-weeks" required min="1" max="52" placeholder="e.g., 8">
                </div>
                
                <div class="form-group">
                    <label for="program-difficulty">Difficulty Level *</label>
                    <select id="program-difficulty" required>
                        <option value="">Select difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="program-is-public">
                    <label for="program-is-public">Make this program available to other trainers</label>
                </div>
                
                <div class="form-group" id="exercise-selection-container">
                    <h3>Suggested Exercises</h3>
                    <p class="hint-text">You can add specific workouts to clients using this program later.</p>
                    <div id="exercise-selection-list" class="exercise-selection">
                        <p>Loading exercises...</p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" id="cancel-program" class="control-btn">Cancel</button>
                    <button type="submit" id="save-program" class="control-btn primary">Create Program</button>
                </div>
            </form>
        </div>
    `;

    setupCreateProgramEventListeners();

    // Load exercises for selection
    loadExercisesForSelection();
}

// Set up the event listeners for the Create Program screen
function setupCreateProgramEventListeners() {
    const backBtn = document.getElementById('program-back-btn');
    const form = document.getElementById('program-form');
    const cancelBtn = document.getElementById('cancel-program');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.showScreen('trainerDashboard');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.showScreen('trainerDashboard');
        });
    }

    if (form) {
        form.addEventListener('submit', handleProgramSubmit);
    }
}

// Handle the form submission for creating a program
async function handleProgramSubmit(e) {
    e.preventDefault();

    // Get form values
    const programData = {
        name: document.getElementById('program-name').value,
        description: document.getElementById('program-description').value,
        durationWeeks: parseInt(document.getElementById('duration-weeks').value),
        difficulty: document.getElementById('program-difficulty').value,
        isPublic: document.getElementById('program-is-public').checked
        // Exercises will be added when creating specific workouts
    };

    // Show loading screen
    window.showScreen('loading');

    try {
        // Call API if trainer module is available
        if (window.trainer && window.trainer.createProgram) {
            const result = await window.trainer.createProgram(programData);

            if (result.success) {
                // Show success message
                window.showAlert('Success', 'Program created successfully!');

                // Refresh programs list and go back to dashboard
                if (window.trainer.getPrograms) {
                    const programsResponse = await window.trainer.getPrograms();
                    if (programsResponse.success && window.renderProgramsList) {
                        window.renderProgramsList(programsResponse.programs);
                    }
                }
                window.showScreen('trainerDashboard');
            } else {
                throw new Error(result.error || 'Failed to create program');
            }
        } else {
            throw new Error('Trainer module not available');
        }
    } catch (error) {
        console.error('Create program error:', error);
        window.showAlert('Error', error.message || 'Failed to create program. Please try again.');
        window.showScreen('create-program');
    }
}

// Load exercises for selection in the program creation form
async function loadExercisesForSelection() {
    const exerciseSelectionList = document.getElementById('exercise-selection-list');
    if (!exerciseSelectionList) return;

    try {
        let exercises = [];

        // Try to get exercises from API
        if (window.trainer && window.trainer.getExercises) {
            const response = await window.trainer.getExercises();
            if (response.success) {
                exercises = response.exercises;
            }
        }

        // Use fallback data if needed
        if (!exercises || exercises.length === 0) {
            if (window.appState && window.appState.standaloneMode) {
                exercises = [
                    { id: 1, name: 'Barbell Squat', muscleGroup: 'Legs', difficulty: 'Intermediate' },
                    { id: 2, name: 'Push-up', muscleGroup: 'Chest', difficulty: 'Beginner' },
                    { id: 3, name: 'Pull-up', muscleGroup: 'Back', difficulty: 'Intermediate' },
                    { id: 4, name: 'Plank', muscleGroup: 'Core', difficulty: 'Beginner' }
                ];
            } else {
                exerciseSelectionList.innerHTML = '<p>No exercises available. Add exercises first.</p>';
                return;
            }
        }

        // Group exercises by muscle group
        const exercisesByGroup = {};
        exercises.forEach(exercise => {
            const group = exercise.muscleGroup || 'Other';
            if (!exercisesByGroup[group]) {
                exercisesByGroup[group] = [];
            }
            exercisesByGroup[group].push(exercise);
        });

        // Build HTML
        let html = '';
        for (const group in exercisesByGroup) {
            html += `
                <div class="exercise-group">
                    <h4>${group.charAt(0).toUpperCase() + group.slice(1)}</h4>
                    <div class="exercise-list">
            `;

            exercisesByGroup[group].forEach(exercise => {
                html += `
                    <div class="exercise-item">
                        <input type="checkbox" id="exercise-${exercise.id}" data-exercise-id="${exercise.id}">
                        <label for="exercise-${exercise.id}">${exercise.name}</label>
                        <span class="difficulty-badge ${exercise.difficulty}">${exercise.difficulty}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        exerciseSelectionList.innerHTML = html;
    } catch (error) {
        console.error('Load exercises error:', error);
        exerciseSelectionList.innerHTML = '<p>Error loading exercises. Please try again.</p>';
    }
}

// Make sure the functions are available globally
window.updateCreateProgramScreen = updateCreateProgramScreen;