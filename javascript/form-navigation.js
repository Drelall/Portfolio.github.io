/**
 * CSS pour le formulaire multi-étapes - À ajouter dans votre fichier CSS principal
 */
const formStyles = `
.form-step {
    display: none;
}

.form-step.active {
    display: block;
}

.progress-container {
    margin-bottom: 2rem;
}

.progress-bar {
    height: 4px;
    background-color: #007bff;
    transition: width 0.3s ease;
    border-radius: 2px;
}

.step-indicators {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.step-indicator {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.3s ease;
}

.step-indicator.active {
    background-color: #007bff;
    color: white;
}

.step-indicator.completed {
    background-color: #28a745;
    color: white;
}

.field-error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.form-field.error input,
.form-field.error select,
.form-field.error textarea {
    border-color: #dc3545;
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}

.btn-navigation {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn:hover {
    opacity: 0.8;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.is-loading {
    position: relative;
}

.is-loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    margin: auto;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Injecter les styles si pas déjà présents
if (!document.getElementById('form-navigation-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'form-navigation-styles';
    styleSheet.textContent = formStyles;
    document.head.appendChild(styleSheet);
}

// Initialiser le gestionnaire au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Le character-manager gère déjà la navigation
    console.log('Navigation de formulaire initialisée');
});
