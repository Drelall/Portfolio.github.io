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

    // Nettoyer les données (utile pour les tests)
    clearAllCharacters() {
        localStorage.removeItem('saga_characters');
        this.characters = [];
        this.currentCharacter = null;
        console.log('🧹 Toutes les données de personnages supprimées');
    }

    // Exporter les personnages (pour sauvegarde)
    exportCharacters() {
        return {
            characters: this.characters,
            exportDate: new Date().toISOString(),
            userEmail: window.authManager.user?.email || 'unknown'
        };
    }

    // Importer des personnages
    importCharacters(exportData) {
        if (exportData && exportData.characters) {
            // Ajouter les personnages importés à ceux existants
            const existingCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            const newCharacters = exportData.characters.map(char => ({
                ...char,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Nouvel ID unique
                user_id: window.authManager.user.id,
                imported_at: new Date().toISOString()
            }));
            
            const allCharacters = [...existingCharacters, ...newCharacters];
            localStorage.setItem('saga_characters', JSON.stringify(allCharacters));
            
            console.log(`📥 ${newCharacters.length} personnage(s) importé(s)`);
            window.authManager.showMessage(`📥 ${newCharacters.length} personnage(s) importé(s)`, 'success');
            
            // Recharger
            return this.loadUserCharacters();
        }
    }
}

// Initialiser le gestionnaire de personnages
window.characterManager = new CharacterManager();
