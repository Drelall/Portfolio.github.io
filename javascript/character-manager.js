// Gestionnaire de personnages avec stockage local
class CharacterManager {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
        // Initialiser l'écouteur du bouton "finaliser l'inscription"
        this._finalizeHandlerBound = this.finalizeRegistration.bind(this);
        // Attache immédiate (au cas où le script est chargé après le DOM)
        this.attachFinalizeHandler();
        document.addEventListener('DOMContentLoaded', () => {
            this.attachFinalizeHandler();
        });
    }

    // Sauvegarder un personnage en local
    async saveCharacter(characterData) {
        // Autoriser le mode invité (ne plus bloquer ici)
        const isAuth = !!window.authManager?.isAuthenticated;

        try {
            // Ajouter l'ID utilisateur et la date de création
            const characterToSave = {
                ...characterData,
                id: Date.now().toString(),
                user_id: (isAuth && window.authManager?.user?.id) ? window.authManager.user.id : 'guest',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Récupérer les personnages existants
            const existingCharacters = JSON.parse(localStorage.getItem('saga_characters') || '[]');
            existingCharacters.push(characterToSave);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('saga_characters', JSON.stringify(existingCharacters));

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

    // Action principale: finaliser l'inscription (fermer la step et envoyer le mail)
    async finalizeRegistration(e) {
        e?.preventDefault?.();

        // Ne pas bloquer la finalisation si non connecté (mode invité)
        const isAuth = !!window.authManager?.isAuthenticated;

        const btn = e?.currentTarget;
        const restoreBtn = this._setButtonLoading(btn, true, 'Envoi...');

        try {
            // Récupérer les données du step 5 / formulaire
            const { formEl, formData } = this.collectRegistrationData();
            const user = (isAuth ? (window.authManager?.user || {}) : { id: 'guest' });

            // Sauvegarder le personnage localement (taggé 'guest' si non connecté)
            const savedCharacter = await this.saveCharacterSafely({
                ...(this.currentCharacter || {}),
                ...(formData?.character || {})
            });

            // Tentative d'envoi d'email via la configuration existante
            await this.trySendEmail({
                user,
                character: savedCharacter,
                formData,
                formEl
            });

            // Fermer la dernière étape / la modal
            this.closeFinalStepUI();

            // Mettre à jour l'UI (header utilisateur, etc.)
            try {
                updateUIAfterRegistration({ ...user, character: savedCharacter });
            } catch (_) { /* non bloquant */ }

            // Evénement global pour d'autres scripts éventuels
            document.dispatchEvent(new CustomEvent('registration:finalized', {
                detail: { user, character: savedCharacter }
            }));

            window.authManager?.showMessage?.('🎉 Inscription finalisée. Un email a été envoyé.', 'success');
        } catch (error) {
            console.error('❌ Finalisation échouée:', error);
            window.authManager?.showMessage?.(`❌ Erreur finalisation: ${error.message}`, 'error');
        } finally {
            restoreBtn?.();
        }
    }

    // Collecte robuste des données depuis l'étape 5 / formulaire
    collectRegistrationData() {
        const doc = document;
        const step5 =
            doc.querySelector('[data-step="5"]') ||
            doc.getElementById('step-5');
        const formEl =
            step5?.closest('form') ||
            doc.getElementById('registrationForm') ||
            doc.querySelector('form[name="registration"]');

        const root = step5 || formEl || doc;
        const raw = this._serializeFields(root);

        // On considère que les champs pertinents peuvent être fusionnés avec le personnage
        const character = {
            ...(this.currentCharacter || {}),
            ...raw
        };

        return {
            formEl,
            formData: { raw, character }
        };
    }

    // Sérialise les champs d'un conteneur
    _serializeFields(root) {
        const out = {};
        if (!root || !root.querySelectorAll) return out;

        const fields = root.querySelectorAll('input, textarea, select');
        fields.forEach(el => {
            if (!el.name) return;

            let value;
            if (el.type === 'checkbox') {
                value = !!el.checked;
            } else if (el.type === 'radio') {
                if (!el.checked) return;
                value = el.value;
            } else {
                value = el.value;
            }
            out[el.name] = value;
        });

        return out;
    }

    // Envoi d'email: utilise la config existante si disponible (plusieurs fallbacks)
    async trySendEmail(payload) {
        // 1) Fonction globale personnalisée si présente
        if (typeof window.sendRegistrationEmail === 'function') {
            await window.sendRegistrationEmail(payload);
            return;
        }
        // 2) Méthodes connues si intégrées ailleurs dans le projet
        if (window.authManager?.sendRegistrationEmail) {
            await window.authManager.sendRegistrationEmail(payload);
            return;
        }
        if (window.mailer?.sendRegistrationEmail) {
            await window.mailer.sendRegistrationEmail(payload);
            return;
        }
        // 3) EmailJS via data-attributes sur le formulaire (si déjà configuré)
        if (window.emailjs) {
            const formEl = payload.formEl;
            const serviceId = formEl?.dataset?.emailjsService;
            const templateId = formEl?.dataset?.emailjsTemplate;
            const publicKey = formEl?.dataset?.emailjsPublicKey || window.EMAILJS_PUBLIC_KEY;

            if (serviceId && templateId && publicKey) {
                try {
                    window.emailjs.init(publicKey);
                } catch (_) { /* déjà init ou non bloquant */ }
                await window.emailjs.send(serviceId, templateId, payload.formData.raw);
                return;
            }
        }
        console.warn('Aucun service mail détecté ou configuré. L\'inscription est finalisée localement, mais le mail n\'a pas été envoyé.');
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

        // Fermer une modal Bootstrap si affichée
        const modal = document.querySelector('#registrationModal.show, .modal.show');
        if (modal) {
            const closeBtn = modal.querySelector('[data-bs-dismiss="modal"], .btn-close');
            if (closeBtn) {
                closeBtn.click();
            } else {
                // fallback minimal si pas de bouton de fermeture
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop.show');
                backdrop?.parentNode?.removeChild?.(backdrop);
            }
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