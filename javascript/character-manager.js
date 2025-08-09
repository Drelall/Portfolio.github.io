// Gestionnaire de personnages avec stockage local
class CharacterManager {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
    }

    // Sauvegarder un personnage en local
    async saveCharacter(characterData) {
        if (!window.authManager.isAuthenticated) {
            throw new Error('Utilisateur non connecté');
        }

        try {
            // Ajouter l'ID utilisateur et la date de création
            const characterToSave = {
                ...characterData,
                id: Date.now().toString(),
                user_id: window.authManager.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Récupérer les personnages existants
            const existingCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            existingCharacters.push(characterToSave);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('saga_characters', JSON.stringify(existingCharacters));

            console.log('✅ Personnage sauvegardé (mode local):', characterToSave);
            window.authManager.showMessage('✅ Personnage créé avec succès !', 'success');
            
            return characterToSave;
        } catch (error) {
            console.error('❌ Erreur sauvegarde personnage:', error);
            window.authManager.showMessage(`❌ Erreur sauvegarde: ${error.message}`, 'error');
            throw error;
        }
    }

    // Charger les personnages de l'utilisateur connecté
    async loadUserCharacters() {
        if (!window.authManager.isAuthenticated) {
            return [];
        }

        try {
            const allCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            const userCharacters = allCharacters.filter(char => char.user_id === window.authManager.user.id);

            console.log('📚 Personnages chargés (mode local):', userCharacters);
            this.characters = userCharacters;
            return userCharacters;
        } catch (error) {
            console.error('❌ Erreur chargement personnages:', error);
            return [];
        }
    }

    // Supprimer un personnage
    async deleteCharacter(characterId) {
        if (!window.authManager.isAuthenticated) {
            throw new Error('Utilisateur non connecté');
        }

        try {
            // Récupérer tous les personnages
            const allCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            
            // Filtrer pour supprimer le personnage (avec vérification de propriété)
            const filteredCharacters = allCharacters.filter(char => 
                !(char.id === characterId && char.user_id === window.authManager.user.id)
            );
            
            // Sauvegarder la liste mise à jour
            localStorage.setItem('saga_characters', JSON.stringify(filteredCharacters));

            // Retirer de la liste locale
            this.characters = this.characters.filter(char => char.id !== characterId);
            
            console.log('🗑️ Personnage supprimé (mode local):', characterId);
            window.authManager.showMessage('🗑️ Personnage supprimé', 'success');
            
        } catch (error) {
            console.error('❌ Erreur suppression personnage:', error);
            window.authManager.showMessage(`❌ Erreur suppression: ${error.message}`, 'error');
            throw error;
        }
    }

    // Mettre à jour un personnage
    async updateCharacter(characterId, updates) {
        if (!window.authManager.isAuthenticated) {
            throw new Error('Utilisateur non connecté');
        }

        try {
            // Récupérer tous les personnages
            const allCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            
            // Trouver et mettre à jour le personnage
            const characterIndex = allCharacters.findIndex(char => 
                char.id === characterId && char.user_id === window.authManager.user.id
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
            localStorage.setItem('saga_characters', JSON.stringify(allCharacters));

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
}

// Initialiser le gestionnaire de personnages
window.characterManager = new CharacterManager();

// Gestionnaire pour le bouton "Finaliser l'inscription"
document.addEventListener('DOMContentLoaded', function() {
    const finalizeRegistrationBtn = document.getElementById('finalizeRegistrationBtn');
    
    if (finalizeRegistrationBtn) {
        finalizeRegistrationBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // 1. Récupérer toutes les données du formulaire
                const characterData = {
                    firstName: document.getElementById('characterFirstName').value,
                    lastName: document.getElementById('characterLastName').value,
                    characterClass: document.getElementById('characterClass').value,
                    characterType: document.getElementById('characterType').value,
                    characterDeity: document.getElementById('characterDeity').value
                };

                // 2. Récupérer les données d'authentification
                const userData = JSON.parse(localStorage.getItem('tempUserData') || '{}');
                
                if (!userData.email) {
                    alert('Erreur : données utilisateur manquantes');
                    return;
                }

                // 3. Sauvegarder les données complètes
                const completeUserData = {
                    ...userData,
                    character: characterData,
                    registrationComplete: true,
                    createdAt: new Date().toISOString()
                };

                localStorage.setItem('userData', JSON.stringify(completeUserData));
                localStorage.removeItem('tempUserData');

                // 4. Envoyer l'email de confirmation
                if (typeof sendWelcomeEmail === 'function') {
                    await sendWelcomeEmail(userData.email, userData.firstName || userData.pseudo, characterData);
                }

                // 5. Fermer le modal
                const characterFormModal = document.getElementById('characterFormModal');
                if (characterFormModal) {
                    characterFormModal.style.display = 'none';
                }

                // 6. Mettre à jour l'interface utilisateur
                updateUIAfterRegistration(completeUserData);

                // 7. Message de succès
                alert('Inscription finalisée avec succès ! Un email de confirmation vous a été envoyé.');

            } catch (error) {
                console.error('Erreur lors de la finalisation:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }
});

// Fonction pour mettre à jour l'UI après inscription
function updateUIAfterRegistration(userData) {
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
                `${userData.character.firstName} ${userData.character.lastName}` : 
                userData.firstName || userData.pseudo || 'Utilisateur';
            userDisplayName.textContent = displayName;
        }
    }
}