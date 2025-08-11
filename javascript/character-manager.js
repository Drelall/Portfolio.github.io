/**
 * Gestionnaire de personnages avec stockage local
 * Gère la création, modification, suppression et sauvegarde des personnages
 */
class CharacterManager {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.STORAGE_KEY = 'saga_characters';
        this.MAX_CHARACTERS_PER_USER = 10;
        
        // Initialiser l'écouteur du bouton "finaliser l'inscription"
        this._finalizeHandlerBound = this.finalizeRegistration.bind(this);
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
            this.showStep(1);
        });
    }

    attachEventListeners() {
        // Navigation entre étapes
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="next-step"]')) {
                e.preventDefault();
                this.nextStep();
            }
            if (e.target.matches('[data-action="prev-step"]')) {
                e.preventDefault();
                this.prevStep();
            }
            if (e.target.matches('[data-action="finalize-registration"]')) {
                e.preventDefault();
                this.finalizeRegistration(e);
            }
        });

        // Validation en temps réel
        document.addEventListener('input', (e) => {
            if (e.target.closest('.form-step')) {
                this.validateField(e.target);
            }
        });
    }

    // Navigation entre étapes
    showStep(stepNumber) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        this.updateProgressIndicator(stepNumber);
        this.updateNavigationButtons(stepNumber);
        this.currentStep = stepNumber;
    }

    updateProgressIndicator(stepNumber) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = (stepNumber / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum < stepNumber) {
                indicator.classList.add('completed');
            } else if (stepNum === stepNumber) {
                indicator.classList.add('active');
            }
        });
    }

    updateNavigationButtons(stepNumber) {
        const prevBtn = document.querySelector('[data-action="prev-step"]');
        const nextBtn = document.querySelector('[data-action="next-step"]');
        const finalizeBtn = document.querySelector('[data-action="finalize-registration"]');

        if (prevBtn) prevBtn.style.display = stepNumber > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = stepNumber < this.totalSteps ? 'block' : 'none';
        if (finalizeBtn) finalizeBtn.style.display = stepNumber === this.totalSteps ? 'block' : 'none';
    }

    async nextStep() {
        const isValid = await this.validateCurrentStep();
        
        if (isValid) {
            this.saveStepData(this.currentStep);
            
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    async validateCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return false;

        const requiredFields = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        // Validation générale des champs requis
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Ce champ est requis');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validation spécifique par étape
        if (this.currentStep === 1) {
            const emailField = currentStepEl.querySelector('input[type="email"]');
            if (emailField && !this.validateEmail(emailField.value)) {
                this.showFieldError(emailField, 'Adresse email invalide');
                isValid = false;
            }
        }

        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateField(field) {
        this.clearFieldError(field);
        
        if (field.required && !field.value.trim()) {
            this.showFieldError(field, 'Ce champ est requis');
            return false;
        }
        
        if (field.type === 'email' && field.value && !this.validateEmail(field.value)) {
            this.showFieldError(field, 'Adresse email invalide');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    saveStepData(stepNumber) {
        const stepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (!stepEl) return;

        const stepData = this._serializeFields(stepEl);
        this.currentCharacter = { ...this.currentCharacter, ...stepData };
    }

    showMessage(message, type = 'info') {
        // Utiliser le système de message existant ou créer un simple
        if (window.authManager?.showMessage) {
            window.authManager.showMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message); // Fallback simple
        }
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean}
     */
    _isAuthenticated() {
        return !!(window.authManager?.isAuthenticated && window.authManager?.user?.id);
    }

    /**
     * Obtient l'ID utilisateur (authentifié ou guest)
     * @returns {string}
     */
    _getUserId() {
        return this._isAuthenticated() ? window.authManager.user.id : 'guest';
    }

    /**
     * Valide les données d'un personnage
     * @param {Object} characterData 
     * @returns {boolean}
     */
    _validateCharacterData(characterData) {
        if (!characterData || typeof characterData !== 'object') {
            throw new Error('Données du personnage invalides');
        }

        // Validation des champs requis
        const requiredFields = ['firstName', 'lastName'];
        for (const field of requiredFields) {
            if (!characterData[field] || typeof characterData[field] !== 'string' || characterData[field].trim().length === 0) {
                throw new Error(`Le champ ${field} est requis`);
            }
        }

        // Validation de la longueur des champs
        if (characterData.firstName.length > 50 || characterData.lastName.length > 50) {
            throw new Error('Les noms ne peuvent pas dépasser 50 caractères');
        }

        return true;
    }

    /**
     * Vérifie la limite de personnages par utilisateur
     * @param {string} userId 
     * @returns {boolean}
     */
    _checkCharacterLimit(userId) {
        const allCharacters = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        const userCharacterCount = allCharacters.filter(char => char.user_id === userId).length;
        
        if (userCharacterCount >= this.MAX_CHARACTERS_PER_USER) {
            throw new Error(`Limite de ${this.MAX_CHARACTERS_PER_USER} personnages atteinte`);
        }
        
        return true;
    }

    // Sauvegarder un personnage en local
    async saveCharacter(characterData) {
        try {
            // Validation des données
            this._validateCharacterData(characterData);
            
            const userId = this._getUserId();
            
            // Vérifier la limite de personnages
            this._checkCharacterLimit(userId);

            // Ajouter l'ID utilisateur et la date de création
            const characterToSave = {
                ...characterData,
                id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Récupérer les personnages existants
            const existingCharacters = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            existingCharacters.push(characterToSave);
            
            // Sauvegarder dans localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingCharacters));

            console.log('✅ Personnage sauvegardé (mode local):', characterToSave);
            window.authManager?.showMessage?.('✅ Personnage créé avec succès !', 'success');
            
            return characterToSave;
        } catch (error) {
            console.error('❌ Erreur sauvegarde personnage:', error);
            window.authManager?.showMessage?.(`❌ Erreur sauvegarde: ${error.message}`, 'error');
            throw error;
        }
    }

    // Charger les personnages de l'utilisateur connecté
    async loadUserCharacters() {
        try {
            const allCharacters = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            
            // Charger pour utilisateur connecté OU guest
            const userId = this._getUserId();
            const userCharacters = allCharacters.filter(char => char.user_id === userId);

            console.log('📚 Personnages chargés (mode local):', userCharacters);
            this.characters = userCharacters;
            return userCharacters;
        } catch (error) {
            console.error('❌ Erreur chargement personnages:', error);
            window.authManager?.showMessage?.('❌ Erreur de chargement des personnages', 'error');
            return [];
        }
    }

    // Supprimer un personnage
    async deleteCharacter(characterId) {
        if (!characterId) {
            throw new Error('ID du personnage requis');
        }

        try {
            const userId = this._getUserId();
            const allCharacters = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            
            // Vérifier que le personnage appartient à l'utilisateur
            const characterToDelete = allCharacters.find(char => 
                char.id === characterId && char.user_id === userId
            );
            
            if (!characterToDelete) {
                throw new Error('Personnage non trouvé ou non autorisé');
            }
            
            // Filtrer pour supprimer le personnage
            const filteredCharacters = allCharacters.filter(char => 
                !(char.id === characterId && char.user_id === userId)
            );
            
            // Sauvegarder la liste mise à jour
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCharacters));

            // Retirer de la liste locale
            this.characters = this.characters.filter(char => char.id !== characterId);
            
            console.log('🗑️ Personnage supprimé (mode local):', characterId);
            window.authManager.showMessage('🗑️ Personnage supprimé', 'success');
            
        } catch (error) {
            console.error('❌ Erreur suppression personnage:', error);
            window.authManager?.showMessage?.(`❌ Erreur suppression: ${error.message}`, 'error');
            throw error;
        }
    }

    // Mettre à jour un personnage
    async updateCharacter(characterId, updates) {
        if (!characterId || !updates) {
            throw new Error('ID du personnage et données de mise à jour requis');
        }

        try {
            // Validation des données de mise à jour
            this._validateCharacterData({ ...updates, firstName: updates.firstName || 'temp', lastName: updates.lastName || 'temp' });
            
            const userId = this._getUserId();
            const allCharacters = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            
            // Trouver et mettre à jour le personnage
            const characterIndex = allCharacters.findIndex(char => 
                char.id === characterId && char.user_id === userId
            );
            
            if (characterIndex === -1) {
                throw new Error('Personnage non trouvé');
            }

            const updateData = {
                ...allCharacters[characterIndex],
                ...updates,
                updated_at: new Date().toISOString()
            };

            allCharacters[characterIndex] = updateData;
            
            // Sauvegarder
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allCharacters));

            // Mettre à jour la liste locale
            const localIndex = this.characters.findIndex(char => char.id === characterId);
            if (localIndex !== -1) {
                this.characters[localIndex] = updateData;
            }

            console.log('✏️ Personnage mis à jour (mode local):', updateData);
            window.authManager.showMessage('✏️ Personnage mis à jour', 'success');
            
            return updateData;
        } catch (error) {
            console.error('❌ Erreur mise à jour personnage:', error);
            window.authManager.showMessage(`❌ Erreur mise à jour: ${error.message}`, 'error');
            throw error;
        }
    }

    // Récupérer un personnage spécifique
    getCharacterById(characterId) {
        return this.characters.find(char => char.id === characterId);
    }

    // Définir le personnage actuel
    setCurrentCharacter(character) {
        this.currentCharacter = character;
    }

    // Obtenir le personnage actuel
    getCurrentCharacter() {
        return this.currentCharacter;
    }

    // Méthode principale pour sauvegarder
    async saveCharacterSafely(characterData) {
        return await this.saveCharacter(characterData);
    }

    // Méthode principale pour charger
    async loadCharactersSafely() {
        return await this.loadUserCharacters();
    }

    // Attache l'écouteur sur le bouton de finalisation si présent
    attachFinalizeHandler() {
        const btn = document.querySelector('[data-action="finalize-registration"], #finalizeRegistrationBtn');
        if (!btn) {
            console.debug('Bouton de finalisation non trouvé. Ajoutez id="finalizeRegistrationBtn" ou data-action="finalize-registration".');
            return;
        }
        btn.removeEventListener('click', this._finalizeHandlerBound);
        btn.addEventListener('click', this._finalizeHandlerBound);
    }

    // Action principale: finaliser l'inscription
    async finalizeRegistration(e) {
        e?.preventDefault?.();

        const btn = e?.currentTarget;
        const restoreBtn = this._setButtonLoading(btn, true, 'Finalisation...');

        try {
            // Valider la dernière étape
            const isValid = await this.validateCurrentStep();
            if (!isValid) {
                throw new Error('Veuillez corriger les erreurs du formulaire');
            }

            // Sauvegarder les données de la dernière étape
            this.saveStepData(this.currentStep);

            // Récupérer toutes les données
            const { formEl, formData } = this.collectRegistrationData();
            
            if (!formData?.character?.email) {
                throw new Error('Adresse email requise');
            }
            
            const user = this._isAuthenticated() ? (window.authManager?.user || {}) : { id: 'guest' };

            // Sauvegarder le personnage localement
            const savedCharacter = await this.saveCharacterSafely(formData.character);

            // Envoyer l'email via Web3Forms
            await this.trySendEmail({
                user,
                character: savedCharacter,
                formData,
                formEl
            });

            // Fermer le formulaire et mettre à jour l'UI
            this.closeFinalStepUI();
            updateUIAfterRegistration({ ...user, character: savedCharacter });

            // Événement global
            document.dispatchEvent(new CustomEvent('registration:finalized', {
                detail: { user, character: savedCharacter }
            }));

            this.showMessage('🎉 Inscription finalisée avec succès ! Vérifiez votre email.', 'success');

        } catch (error) {
            console.error('❌ Finalisation échouée:', error);
            this.showMessage(`❌ Erreur: ${error.message}`, 'error');
        } finally {
            restoreBtn?.();
        }
    }

    // Collecte robuste des données depuis tout le formulaire
    collectRegistrationData() {
        const formEl = document.getElementById('registrationForm') || 
                      document.querySelector('form[name="registration"]') ||
                      document.querySelector('form');

        if (!formEl) {
            throw new Error('Formulaire non trouvé');
        }

        // Collecter toutes les données du formulaire
        const allData = this._serializeFields(formEl);
        
        // Fusionner avec les données du personnage actuel
        const character = { ...this.currentCharacter, ...allData };

        return {
            formEl,
            formData: { 
                raw: allData, 
                character,
                // Données spécifiques pour Web3Forms
                email: allData.email || character.email,
                name: `${character.firstName || ''} ${character.lastName || ''}`.trim(),
                subject: 'Nouvelle inscription au jeu',
                message: this.formatRegistrationMessage(character)
            }
        };
    }

    formatRegistrationMessage(character) {
        return `
Nouvelle inscription au jeu:

Nom: ${character.firstName} ${character.lastName}
Email: ${character.email}
Pseudo: ${character.pseudo || 'Non défini'}
Classe: ${character.class || 'Non définie'}
Race: ${character.race || 'Non définie'}

Date d'inscription: ${new Date().toLocaleString('fr-FR')}

Personnage créé avec succès!
        `.trim();
    }

    // Envoi d'email via Web3Forms
    async trySendEmail(payload) {
        if (!payload || !payload.formData) {
            throw new Error('Données manquantes pour l\'envoi d\'email');
        }

        try {
            // Chercher la clé Web3Forms
            const formEl = payload.formEl;
            const web3formsKey = formEl?.dataset?.web3formsKey || 
                               formEl?.querySelector('input[name="access_key"]')?.value ||
                               window.WEB3FORMS_ACCESS_KEY;

            if (!web3formsKey) {
                throw new Error('Clé Web3Forms non trouvée. Ajoutez data-web3forms-key au formulaire ou définissez window.WEB3FORMS_ACCESS_KEY');
            }

            // Préparer les données pour Web3Forms
            const formData = new FormData();
            formData.append('access_key', web3formsKey);
            formData.append('email', payload.formData.email);
            formData.append('name', payload.formData.name);
            formData.append('subject', payload.formData.subject);
            formData.append('message', payload.formData.message);

            // Ajouter tous les autres champs du personnage
            Object.entries(payload.formData.character).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            // Envoi via Web3Forms
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Erreur lors de l\'envoi de l\'email');
            }

            console.log('✅ Email envoyé avec succès via Web3Forms');
            return result;

        } catch (error) {
            console.error('❌ Erreur envoi email Web3Forms:', error);
            throw error;
        }
    }

    // Ferme l'UI de la dernière étape (step 5) et/ou la modal si utilisée
    closeFinalStepUI() {
        // Masquer la step 5 active si structure en steps
        const activeStep5 = document.querySelector('[data-step="5"].active, #step-5.active') ||
                            document.querySelector('[data-step="5"], #step-5');
        if (activeStep5) {
            activeStep5.classList.remove('active');
            activeStep5.classList.add('completed');
        }

        // Fermer la modale de création de personnage
        const characterFormModal = document.getElementById('characterFormModal');
        if (characterFormModal) characterFormModal.style.display = 'none';

        // Masquer toutes les étapes du formulaire de personnage
        const steps = document.querySelectorAll('#characterForm .form-step');
        steps.forEach(step => {
            step.classList.remove('active');
        });

        // Réinitialiser le formulaire de création de personnage
        const characterForm = document.getElementById('characterForm');
        if (characterForm) {
            characterForm.reset();
        }
    }

    // Gère l'état "chargement" du bouton
    _setButtonLoading(btn, isLoading, loadingText = 'Envoi...') {
        if (!btn) return () => {};
        if (isLoading) {
            if (!btn.dataset.origText) btn.dataset.origText = btn.textContent || '';
            btn.disabled = true;
            btn.textContent = loadingText;
            btn.classList.add('is-loading');
            return () => {
                btn.disabled = false;
                btn.textContent = btn.dataset.origText || '';
                btn.classList.remove('is-loading');
            };
        }
        return () => {};
    }
}

// Initialiser le gestionnaire de personnages
window.characterManager = new CharacterManager();



/**
 * Fonction pour mettre à jour l'UI après inscription
 * @param {Object} userData - Données utilisateur
 */
function updateUIAfterRegistration(userData) {
    if (!userData) {
        console.warn('Données utilisateur manquantes pour mise à jour UI');
        return;
    }

    try {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        if (userInfo) {
            userInfo.style.display = 'flex';
            
            const userDisplayName = document.getElementById('userDisplayName');
            if (userDisplayName) {
                const displayName = userData.character?.firstName ? 
                    `${userData.character.firstName} ${userData.character.lastName}`.trim() : 
                    userData.firstName || userData.pseudo || 'Utilisateur';
                userDisplayName.textContent = displayName;
            }
        }
    } catch (error) {
        console.error('❌ Erreur mise à jour UI:', error);
    }
}