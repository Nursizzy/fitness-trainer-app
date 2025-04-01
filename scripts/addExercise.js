// addExercise.js - Handles the Add Exercise functionality

// Update the Add Exercise screen with the form and event handlers
function updateAddExerciseScreen() {
    const addExerciseScreen = document.getElementById('add-exercise');
    if (!addExerciseScreen) return;

    addExerciseScreen.innerHTML = `
        <div class="header">
            <button id="exercise-back-btn" class="back-btn">←</button>
            <h1>Add Exercise</h1>
        </div>
        <div class="container">
            <form id="exercise-form">
                <div class="form-group">
                    <label for="exercise-name">Exercise Name *</label>
                    <input type="text" id="exercise-name" required placeholder="e.g., Barbell Squat">
                </div>
                
                <div class="form-group">
                    <label for="exercise-description">Brief Description</label>
                    <textarea id="exercise-description" placeholder="Short description of the exercise"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="exercise-instructions">Instructions *</label>
                    <textarea id="exercise-instructions" required placeholder="Step-by-step instructions for proper form"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="muscle-group">Primary Muscle Group *</label>
                    <select id="muscle-group" required>
                        <option value="">Select muscle group</option>
                        <option value="legs">Legs</option>
                        <option value="chest">Chest</option>
                        <option value="back">Back</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="arms">Arms</option>
                        <option value="core">Core</option>
                        <option value="full_body">Full Body</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="difficulty">Difficulty Level *</label>
                    <select id="difficulty" required>
                        <option value="">Select difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="equipment">Equipment Needed</label>
                    <input type="text" id="equipment" placeholder="e.g., Barbell, Dumbbells, None">
                </div>
                
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="is-public">
                    <label for="is-public">Make this exercise available to other trainers</label>
                </div>
                
                <div class="form-group">
                    <label for="media-url">Media URL (Optional)</label>
                    <input type="url" id="media-url" placeholder="Link to demonstration image or video">
                </div>
                
                <div class="form-actions">
                    <button type="button" id="cancel-exercise" class="control-btn">Cancel</button>
                    <button type="submit" id="save-exercise" class="control-btn primary">Save Exercise</button>
                </div>
            </form>
        </div>
    `;

    setupAddExerciseEventListeners();
}

// Set up the event listeners for the Add Exercise screen
function setupAddExerciseEventListeners() {
    const backBtn = document.getElementById('exercise-back-btn');
    const form = document.getElementById('exercise-form');
    const cancelBtn = document.getElementById('cancel-exercise');

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
        form.addEventListener('submit', handleExerciseSubmit);
    }
}

// Handle the form submission for adding an exercise
async function handleExerciseSubmit(e) {
    e.preventDefault();

    // Get form values
    const exerciseData = {
        name: document.getElementById('exercise-name').value,
        description: document.getElementById('exercise-description').value,
        instructions: document.getElementById('exercise-instructions').value,
        muscleGroup: document.getElementById('muscle-group').value,
        difficulty: document.getElementById('difficulty').value,
        equipment: document.getElementById('equipment').value,
        isPublic: document.getElementById('is-public').checked,
        mediaUrl: document.getElementById('media-url').value
    };

    // Show loading screen
    window.showScreen('loading');

    try {
        // Call API if trainer module is available
        if (window.trainer && window.trainer.addExercise) {
            const result = await window.trainer.addExercise(exerciseData);

            if (result.success) {
                // Show success message
                window.showAlert('Success', 'Exercise added successfully!');

                // Refresh exercises list and go back to dashboard
                if (window.trainer.getExercises) {
                    const exercisesResponse = await window.trainer.getExercises();
                    if (exercisesResponse.success && window.renderExercisesList) {
                        window.renderExercisesList(exercisesResponse.exercises);
                    }
                }
                window.showScreen('trainerDashboard');
            } else {
                throw new Error(result.error || 'Failed to add exercise');
            }
        } else {
            throw new Error('Trainer module not available');
        }
    } catch (error) {
        console.error('Add exercise error:', error);
        window.showAlert('Error', error.message || 'Failed to add exercise. Please try again.');
        window.showScreen('add-exercise');
    }
}

// Make sure the functions are available globally
window.updateAddExerciseScreen = updateAddExerciseScreen;