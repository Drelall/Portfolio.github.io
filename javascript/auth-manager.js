class AuthManager {
    constructor() {
        this.user = null;
        this.tempRegistrationData = null;
        this.init();
    }

    async init() {
        // Vérifier s'il y a un utilisateur connecté en local
        const currentUser = localStorage.getItem('saga_current_user');
        if (currentUser) {
            try {
                this.user = JSON.parse(currentUser);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Erreur lors de la récupération de la session:', error);
                localStorage.removeItem('saga_current_user');
            }
        }

        // Attacher les gestionnaires d'événements
        this.attachEvents();
    }

    attachEvents() {
        // Boutons de connexion/inscription
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const accountBtn = document.getElementById('accountBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openAuthModal('login'));
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.openAuthModal('signup'));
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }

        if (accountBtn) {
            accountBtn.addEventListener('click', () => this.openAccountModal());
        }

        // Formulaire d'authentification
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }

        // Fermeture des modals
        const closeAuthBtn = document.getElementById('closeAuthBtn');
        const closeAccountBtn = document.getElementById('closeAccountBtn');
        const cancelAuthBtn = document.getElementById('cancelAuthBtn');
        const prevAuthBtn = document.getElementById('prevAuthBtn');

        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => this.cancelRegistrationProcess());
        }

        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => this.closeAccountModal());
        }

        if (cancelAuthBtn) {
            cancelAuthBtn.addEventListener('click', () => this.cancelRegistrationProcess());
        }

        if (prevAuthBtn) {
            prevAuthBtn.addEventListener('click', () => this.handlePrevAuthStep());
        }

        // Bouton de renvoi d'email de confirmation
        const resendEmailBtn = document.getElementById('resendEmailBtn');
        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', () => this.resendConfirmationEmail());
        }

        // Fermeture en cliquant en dehors du modal
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.cancelRegistrationProcess();
                }
            });
        }

        const accountModal = document.getElementById('accountModal');
        if (accountModal) {
            accountModal.addEventListener('click', (e) => {
                if (e.target === accountModal) {
                    this.closeAccountModal();
                }
            });
        }
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userDisplayName = document.getElementById('userDisplayName');

        if (this.isAuthenticated && this.user) {
            // Ne pas afficher de nom pour l'administrateur, afficher le pseudo pour les autres
            let displayName = '';
            if (!this.user.isAdmin) {
                displayName = this.user.firstName || '';
            }
            
            if (userDisplayName) userDisplayName.textContent = displayName;
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';

            // Si c'est un administrateur, ajouter les boutons d'administration
            if (this.user.isAdmin) {
                this.addAdminButtons();
            } else {
                this.removeAdminButtons();
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            this.removeAdminButtons();
        }
    }

    addAdminButtons() {
        // Pour l'administrateur, on n'ajoute plus de bouton séparé
        // L'interface d'administration sera accessible via "Mon Compte"
        console.log('✅ Interface d\'administration intégrée au bouton "Mon Compte"');
    }

    removeAdminButtons() {
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.remove();
        }
    }

    // Première étape de l'inscription - validation des données personnelles
    async validateRegistrationStep1(email, password, firstName) {
        try {
            // MODE TEST : Pas de validation, toujours réussir
            console.log('🔧 MODE TEST : Validation étape 1 forcée à succès');

            // Stocker les données temporairement (avec des valeurs par défaut si vides)
            this.tempRegistrationData = {
                email: email.trim() || 'test@example.com',
                password: password || 'password123',
                firstName: firstName.trim() || 'TestUser',
                timestamp: Date.now()
            };

            console.log('✅ Étape 1 de l\'inscription validée pour:', this.tempRegistrationData.email);
            return { success: true, data: this.tempRegistrationData };
        } catch (error) {
            // En mode test, toujours retourner succès
            console.log('🔧 MODE TEST : Erreur ignorée, succès forcé');
            this.tempRegistrationData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'TestUser',
                timestamp: Date.now()
            };
            return { success: true, data: this.tempRegistrationData };
        }
    }

    // Finalisation de l'inscription avec les données du personnage
    async finalizeRegistration(characterData) {
        try {
            if (!this.tempRegistrationData) {
                throw new Error('Données d\'inscription manquantes. Veuillez recommencer le processus.');
            }

            // Vérifier que les données temporaires ne sont pas trop anciennes (30 minutes)
            const timeLimit = 30 * 60 * 1000; // 30 minutes
            if (Date.now() - this.tempRegistrationData.timestamp > timeLimit) {
                this.tempRegistrationData = null;
                throw new Error('Session d\'inscription expirée. Veuillez recommencer.');
            }

            // Valider les données du personnage
            if (!characterData.characterFirstName || !characterData.characterLastName || 
                !characterData.characterClass || !characterData.characterType) {
                throw new Error('Toutes les informations du personnage sont requises');
            }

            // Créer le compte complet
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            
            const newUser = {
                id: Date.now().toString(),
                email: this.tempRegistrationData.email,
                password: this.tempRegistrationData.password,
                firstName: this.tempRegistrationData.firstName,
                character: {
                    firstName: characterData.characterFirstName.trim(),
                    lastName: characterData.characterLastName.trim(),
                    class: characterData.characterClass,
                    type: characterData.characterType
                },
                createdAt: new Date().toISOString(),
                needsEmailConfirmation: true // Pour l'email de confirmation
            };

            users.push(newUser);
            localStorage.setItem('saga_users', JSON.stringify(users));

            // Simuler l'envoi d'email de confirmation
            const emailResult = await this.sendConfirmationEmail(newUser);

            // Connecter l'utilisateur automatiquement
            this.user = { 
                email: newUser.email, 
                id: newUser.id, 
                firstName: newUser.firstName,
                character: newUser.character 
            };
            this.isAuthenticated = true;
            localStorage.setItem('saga_current_user', JSON.stringify(this.user));

            // Nettoyer les données temporaires
            this.tempRegistrationData = null;

            this.updateUI();
            
            this.closeAuthModal();
            this.closeCharacterModal();

            console.log('✅ Inscription complète réussie:', newUser);
            return { success: true, data: newUser };
        } catch (error) {
            console.error('Erreur finalisation inscription:', error);
            return { success: false, error: error.message };
        }
    }

    // Simulation d'envoi d'email de confirmation
    async sendConfirmationEmail(user) {
        try {
            // Utiliser le service d'email si disponible
            if (window.emailService) {
                const result = await window.emailService.sendConfirmationEmail(user);
                console.log('📧 Résultat envoi email:', result);
                return result;
            } else {
                // Fallback vers la simulation console
                console.log('📧 Email de confirmation envoyé à:', user.email);
                console.log('📧 Contenu de l\'email:');
                console.log('---');
                console.log(`Bonjour ${user.firstName},`);
                console.log('');
                console.log('Bienvenue dans l\'univers de Saga !');
                console.log('');
                console.log('Votre compte a été créé avec succès :');
                console.log(`- Email: ${user.email}`);
                console.log(`- Pseudo: ${user.firstName}`);
                console.log(`- Personnage: ${user.character.firstName} ${user.character.lastName}`);
                console.log(`- Classe: ${user.character.class}`);
                console.log(`- Type: ${user.character.type}`);
                console.log('');
                console.log('Vous pouvez maintenant accéder à votre compte et consulter vos informations.');
                console.log('---');
                
                // Simuler un délai d'envoi
                setTimeout(() => {
                    console.log('✅ Email de confirmation envoyé avec succès !');
                }, 1000);
                
                return { success: true, message: 'Email simulé dans la console' };
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
            return { success: false, error: error.message };
        }
    }

    async handleAuthSubmit(e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const submitBtn = document.getElementById('authSubmitBtn');
        const isSignup = submitBtn.textContent.includes('inscrire');

        // MODE TEST : Pas de validation, navigation libre
        console.log('🔧 MODE TEST : Navigation sans validation activée');

        try {
            if (isSignup) {
                await this.signUp(email, password, firstName);
            } else {
                await this.signIn(email, password);
            }
        } catch (error) {
            // En mode test, on ignore les erreurs et on continue
            console.log('🔧 MODE TEST : Erreur ignorée, navigation forcée');
            if (isSignup) {
                await this.signUp(email, password, firstName);
            }
        }
    }



    async signUp(email, password, firstName) {
        try {
            // MODE TEST : Forcer la validation à réussir
            console.log('🔧 MODE TEST : Inscription forcée sans validation');
            const step1Result = await this.validateRegistrationStep1(email, password, firstName);

            // En mode test, on force toujours le succès
            console.log('🔧 MODE TEST : Validation forcée à succès');

            // Fermer le modal d'authentification
            this.closeAuthModal();

            // Afficher un message de transition
            this.showMessage('Étape 1 validée ! Création de votre personnage...', 'success');

            // Attendre un petit moment pour que l'utilisateur voie le message
            setTimeout(() => {
                // Ouvrir directement le modal de création de personnage pour l'étape 2
                this.openCharacterFormModal();
            }, 1000);
            
            console.log('✅ Étape 1 de l\'inscription terminée, passage à l\'étape 2');
            return { data: { step: 1, completed: true }, error: null };
        } catch (error) {
            // MODE TEST : Ignorer les erreurs et continuer
            console.log('🔧 MODE TEST : Erreur ignorée, navigation forcée vers étape 2');

            // Fermer le modal d'authentification
            this.closeAuthModal();

            // Afficher un message de transition
            this.showMessage('Navigation forcée vers l\'étape 2...', 'success');

            // Ouvrir directement le modal de création de personnage
            setTimeout(() => {
                this.openCharacterFormModal();
            }, 1000);

            return { data: { step: 1, completed: true }, error: null };
        }
    }

    openCharacterFormModal() {
        // Chercher le modal dans l'index.html d'abord, sinon dans jeux.html
        let modal = document.getElementById('characterFormModal');

        if (!modal) {
            // Créer le modal de création de personnage dynamiquement
            this.createCharacterFormModal();
            modal = document.getElementById('characterFormModal');
        }

        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.opacity = '1', 10);
            console.log('✅ Modal de création de personnage ouvert');
        } else {
            console.error('❌ Impossible d\'ouvrir le modal de création de personnage');
            this.showMessage('Erreur : impossible d\'ouvrir le formulaire de personnage', 'error');
        }
    }

    createCharacterFormModal() {
        // Créer le modal de création de personnage s'il n'existe pas
        const modalHTML = `
            <div id="characterFormModal" class="character-modal" style="display: none; opacity: 0;">
                <div class="character-form-container">
                    <div class="character-form-header">
                        <h2 id="characterFormTitle">Étape 2 - Classe du personnage</h2>
                        <button id="closeCharacterFormBtn" class="close-btn">&times;</button>
                    </div>
                    <form id="characterForm" class="character-form">
                        <!-- Étape 1: Informations de base -->
                        <div id="characterStep1" class="form-step active">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="characterFirstName">Prénom du personnage :</label>
                                    <input type="text" id="characterFirstName" name="characterFirstName" maxlength="20" placeholder="Prénom de votre personnage">
                                </div>

                                <div class="form-group">
                                    <label for="characterLastName">Nom du personnage :</label>
                                    <input type="text" id="characterLastName" name="characterLastName" maxlength="20" placeholder="Nom de votre personnage">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="characterClass">Classe de personnage :</label>
                                <select id="characterClass" name="characterClass">
                                    <option value="">-- Choisissez une classe --</option>
                                    <option value="agent">Agent du Gouvernement</option>
                                    <option value="initie">Initié</option>
                                    <option value="sorcier">Sorcier</option>
                                    <option value="citoyen">Citoyen</option>
                                </select>
                            </div>

                            <div class="class-description" id="classDescription">
                                <p>Sélectionnez une classe pour voir sa description.</p>
                            </div>

                            <div class="form-actions">
                                <button type="button" id="prevToAuthBtn" class="btn-secondary">Précédent</button>
                                <button type="button" id="cancelCharacterBtn" class="btn-secondary">Annuler</button>
                                <button type="button" id="nextCharacterStepBtn" class="btn-primary">Suivant</button>
                            </div>
                        </div>

                        <!-- Étape 2: Type de personnage -->
                        <div id="characterStep2" class="form-step" style="display: none;">
                            <div class="form-group">
                                <label for="characterType">Type de personnage :</label>
                                <select id="characterType" name="characterType">
                                    <option value="">-- Choisissez un type --</option>
                                </select>
                            </div>

                            <div class="type-description" id="typeDescription">
                                <p>Sélectionnez un type pour voir sa description.</p>
                            </div>

                            <div class="form-actions">
                                <button type="button" id="prevCharacterStepBtn" class="btn-secondary">Précédent</button>
                                <button type="button" id="nextCharacterStepBtn2" class="btn-primary">Suivant</button>
                            </div>
                        </div>

                        <!-- Étape 3: Divinité -->
                        <div id="characterStep3" class="form-step" style="display: none;">
                            <div class="form-group">
                                <label for="characterDeity">Divinité :</label>
                                <select id="characterDeity" name="characterDeity">
                                    <option value="">-- Choisissez une divinité --</option>
                                </select>
                            </div>

                            <div class="deity-description" id="deityDescription">
                                <p>Sélectionnez une divinité pour voir sa description.</p>
                            </div>

                            <div class="form-actions">
                                <button type="button" id="prevCharacterStepBtn2" class="btn-secondary">Précédent</button>
                                <button type="submit" id="finalizeRegistrationBtn" class="btn-primary">Finaliser l'inscription</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attacher les événements pour le nouveau modal
        this.attachCharacterFormEvents();
    }

    attachCharacterFormEvents() {
        const modal = document.getElementById('characterFormModal');
        const closeBtn = document.getElementById('closeCharacterFormBtn');
        const cancelBtn = document.getElementById('cancelCharacterBtn');
        const prevToAuthBtn = document.getElementById('prevToAuthBtn');
        const nextStepBtn = document.getElementById('nextCharacterStepBtn');
        const prevStepBtn = document.getElementById('prevCharacterStepBtn');
        const characterForm = document.getElementById('characterForm');

        // Fermeture du modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCharacterModal();
                // Nettoyer les données temporaires
                this.tempRegistrationData = null;
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCharacterModal();
                // Nettoyer les données temporaires
                this.tempRegistrationData = null;
            });
        }

        // Bouton précédent vers l'authentification
        if (prevToAuthBtn) {
            prevToAuthBtn.addEventListener('click', () => this.handlePrevAuthStep());
        }

        // Navigation entre les étapes du personnage
        if (nextStepBtn) {
            console.log('✅ Bouton Suivant trouvé, ajout événement');
            nextStepBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Clic sur Suivant détecté');
                this.nextCharacterStep();
            });
        } else {
            console.error('❌ Bouton nextCharacterStepBtn non trouvé');
        }

        if (prevStepBtn) {
            console.log('✅ Bouton Précédent trouvé, ajout événement');
            prevStepBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Clic sur Précédent détecté');
                this.prevCharacterStep();
            });
        } else {
            console.error('❌ Bouton prevCharacterStepBtn non trouvé');
        }

        // Soumission du formulaire de personnage
        if (characterForm) {
            characterForm.addEventListener('submit', (e) => this.handleCharacterFormSubmit(e));
        }

        // Fermeture en cliquant en dehors
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCharacterModal();
                    this.tempRegistrationData = null;
                }
            });
        }
    }

    nextCharacterStep() {
        console.log('🔄 Fonction nextCharacterStep appelée');
        const step1 = document.getElementById('characterStep1');
        const step2 = document.getElementById('characterStep2');

        console.log('📋 Éléments trouvés:', { step1, step2 });

        if (step1 && step2) {
            console.log('✅ Navigation vers étape 2');
            // Navigation libre sans validation
            step1.style.display = 'none';
            step2.style.display = 'block';
        } else {
            console.error('❌ Éléments manquants pour la navigation');
        }
    }

    prevCharacterStep() {
        const step1 = document.getElementById('characterStep1');
        const step2 = document.getElementById('characterStep2');

        if (step1 && step2) {
            step2.style.display = 'none';
            step1.style.display = 'block';
        }
    }

    async handleCharacterFormSubmit(e) {
        e.preventDefault();

        // Récupérer les données du formulaire
        const characterData = {
            characterFirstName: document.getElementById('characterFirstName').value.trim(),
            characterLastName: document.getElementById('characterLastName').value.trim(),
            characterClass: document.getElementById('characterClass').value,
            characterType: document.getElementById('characterType').value
        };

        try {
            const result = await this.finalizeRegistration(characterData);
            if (result.success) {
                this.showMessage('🎉 Inscription terminée avec succès !', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            console.error('❌ Erreur finalisation inscription:', error);
        }
    }

    async signIn(email, password) {
        try {
            // Vérifier d'abord si c'est le compte administrateur
            if (email === 'g.Drelall' && password === '#Gran1963font') {
                // Connecter l'administrateur
                this.user = { 
                    email: 'g.Drelall', 
                    id: 'admin', 
                    firstName: 'Administrateur',
                    isAdmin: true
                };
                this.isAuthenticated = true;
                localStorage.setItem('saga_current_user', JSON.stringify(this.user));
                this.updateUI();
                this.closeAuthModal();
                this.showMessage('Connexion administrateur réussie !', 'success');
                console.log('✅ Connexion administrateur réussie');
                return { data: { user: this.user }, error: null };
            }

            // Mode local - vérification des identifiants utilisateurs normaux
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }
            
            // Connecter l'utilisateur normal
            this.user = { 
                email: user.email, 
                id: user.id, 
                firstName: user.firstName,
                character: user.character, // Inclure les données du personnage
                isAdmin: false
            };
            this.isAuthenticated = true;
            localStorage.setItem('saga_current_user', JSON.stringify(this.user));
            this.updateUI();
            
            this.closeAuthModal();
            this.showMessage(`Bienvenue ${user.firstName} !`, 'success');
            
            console.log('✅ Connexion utilisateur réussie:', this.user);
            return { data: { user: this.user }, error: null };
        } catch (error) {
            console.error('Erreur connexion:', error);
            throw error; // Relancer l'erreur pour qu'elle soit gérée par handleAuthSubmit
        }
    }

    async signOut() {
        try {
            // Mode local - suppression de la session
            localStorage.removeItem('saga_current_user');
            this.user = null;
            this.isAuthenticated = false;
            this.updateUI();
            
            console.log('👋 Utilisateur déconnecté (mode local)');
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    }

    showMessage(message, type = 'info') {
        // Créer un élément de notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        // Couleurs selon le type
        const colors = {
            success: { bg: '#226d54', text: '#f3e8d3' },
            error: { bg: '#dc3545', text: 'white' },
            info: { bg: '#7ec3ff', text: 'white' }
        };

        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.text;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => notification.style.transform = 'translateX(-50%) translateY(10px)', 100);

        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    openAuthModal(mode = 'signup') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const nextToCharacterBtn = document.getElementById('nextToCharacterBtn');
        const prevAuthBtn = document.getElementById('prevAuthBtn');
        const switchText = document.getElementById('authSwitchText');
        const firstNameGroup = document.getElementById('firstNameGroup');
        const firstName = document.getElementById('firstName');

        if (!modal) return;

        if (mode === 'login') {
            if (title) title.textContent = 'Connexion';
            if (submitBtn) {
                submitBtn.textContent = 'Connexion';
                submitBtn.style.display = 'inline-block';
            }
            if (nextToCharacterBtn) nextToCharacterBtn.style.display = 'none';
            if (prevAuthBtn) prevAuthBtn.style.display = 'none';
            if (switchText) switchText.innerHTML = 'Pas encore de compte ? <a href="#" id="authSwitchLink">S\'inscrire</a>';
            // Masquer le champ pseudo pour la connexion
            if (firstNameGroup) firstNameGroup.style.display = 'none';
            if (firstName) firstName.required = false;
        } else {
            if (title) title.textContent = 'Étape 1 - Inscription';
            if (submitBtn) {
                submitBtn.textContent = 'Suivant';
                submitBtn.style.display = 'inline-block';
            }
            if (nextToCharacterBtn) nextToCharacterBtn.style.display = 'none';

            // Afficher le bouton "Précédent" seulement si nous avons des données temporaires
            // (cela signifie que nous revenons de l'étape 2)
            if (prevAuthBtn) {
                prevAuthBtn.style.display = this.tempRegistrationData ? 'inline-block' : 'none';
            }

            if (switchText) switchText.innerHTML = 'Déjà un compte ? <a href="#" id="authSwitchLink">Connexion</a>';
            // Afficher le champ pseudo pour l'inscription
            if (firstNameGroup) firstNameGroup.style.display = 'block';
            if (firstName) firstName.required = true;
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);

        // Réattacher l'événement de switch
        const switchLink = document.getElementById('authSwitchLink');
        if (switchLink) {
            switchLink.onclick = (e) => {
                e.preventDefault();
                this.openAuthModal(mode === 'login' ? 'signup' : 'login');
            };
        }
        
        console.log('✅ Modal d\'authentification ouvert en mode:', mode);
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        const authForm = document.getElementById('authForm');
        
        if (!modal) return;
        
        modal.classList.remove('show');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            // Ne réinitialiser le formulaire que si nous n'avons pas de données temporaires à conserver
            if (authForm && !this.tempRegistrationData) {
                authForm.reset();
            }
        }, 300);
        
        console.log('✅ Modal d\'authentification fermé');
    }

    cancelRegistrationProcess() {
        // Nettoyer les données temporaires
        this.tempRegistrationData = null;
        
        // Fermer le modal d'authentification
        const modal = document.getElementById('authModal');
        const authForm = document.getElementById('authForm');
        
        if (!modal) return;
        
        modal.classList.remove('show');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            if (authForm) {
                authForm.reset(); // Réinitialiser puisque nous annulons tout
            }
        }, 300);
        
        console.log('❌ Processus d\'inscription annulé - Données temporaires supprimées');
    }

    closeCharacterModal() {
        const modal = document.getElementById('characterFormModal');
        const characterForm = document.getElementById('characterForm');
        
        if (!modal) return;
        
        modal.style.display = 'none';
        if (characterForm) {
            characterForm.reset();
        }
    }

    handlePrevAuthStep() {
        // Si nous avons des données temporaires d'inscription, cela signifie 
        // que nous sommes à l'étape de création de personnage et voulons revenir à l'étape 1
        if (this.tempRegistrationData) {
            // Fermer le modal de création de personnage
            this.closeCharacterModal();
            
            // Rouvrir le modal d'authentification avec les données pré-remplies
            this.openAuthModal('signup');
            
            // Attendre que le modal soit complètement ouvert avant de pré-remplir
            setTimeout(() => {
                // Pré-remplir les champs avec les données temporaires
                const emailInput = document.getElementById('email');
                const firstNameInput = document.getElementById('firstName');
                const passwordInput = document.getElementById('password');
                
                if (emailInput && this.tempRegistrationData.email) {
                    emailInput.value = this.tempRegistrationData.email;
                }
                if (firstNameInput && this.tempRegistrationData.firstName) {
                    firstNameInput.value = this.tempRegistrationData.firstName;
                }
                if (passwordInput && this.tempRegistrationData.password) {
                    passwordInput.value = this.tempRegistrationData.password;
                }
                
                // Afficher le bouton "Précédent" puisque nous venons de l'étape 2
                const prevAuthBtn = document.getElementById('prevAuthBtn');
                if (prevAuthBtn) {
                    prevAuthBtn.style.display = 'inline-block';
                }
                
                console.log('🔙 Retour à l\'étape 1 - Données restaurées:', {
                    email: this.tempRegistrationData.email,
                    firstName: this.tempRegistrationData.firstName,
                    hasPassword: !!this.tempRegistrationData.password
                });
            }, 100); // Délai pour laisser le temps au modal de s'ouvrir
            
            console.log('🔙 Retour à l\'étape 1 de l\'inscription');
        }
    }

    openAccountModal() {
        // Si c'est un administrateur, ouvrir l'interface d'administration complète
        if (this.user && this.user.isAdmin) {
            this.openAdminAccountModal();
            return;
        }

        // Pour les utilisateurs normaux, continuer avec le modal compte standard
        const modal = document.getElementById('accountModal');
        if (!modal) {
            console.error('❌ Modal de compte introuvable');
            return;
        }

        // Récupérer les données utilisateur complètes pour les utilisateurs normaux
        const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
        const fullUserData = users.find(user => user.id === this.user.id);

        if (!fullUserData) {
            console.error('❌ Erreur : données utilisateur introuvables');
            this.showMessage('Erreur : impossible de charger les données du compte', 'error');
            return;
        }

        // Remplir les informations personnelles
        const firstNameEl = document.getElementById('accountFirstName');
        const emailEl = document.getElementById('accountEmail');
        const createdAtEl = document.getElementById('accountCreatedAt');
        
        if (firstNameEl) firstNameEl.textContent = fullUserData.firstName || '-';
        if (emailEl) emailEl.textContent = fullUserData.email || '-';
            
        // Formater la date de création
        const createdDate = fullUserData.createdAt ? 
            new Date(fullUserData.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '-';
        if (createdAtEl) createdAtEl.textContent = createdDate;

        // Remplir les informations du personnage
        const characterInfo = document.getElementById('characterInfo');
        const noCharacterInfo = document.getElementById('noCharacterInfo');

        if (fullUserData.character) {
            // Afficher les informations du personnage
            const fullNameEl = document.getElementById('characterFullName');
            const classEl = document.getElementById('characterClass');
            const typeEl = document.getElementById('characterType');
            
            if (fullNameEl) fullNameEl.textContent = 
                `${fullUserData.character.firstName} ${fullUserData.character.lastName}`;
            if (classEl) classEl.textContent = 
                this.getClassDisplayName(fullUserData.character.class);
            if (typeEl) typeEl.textContent = 
                this.getTypeDisplayName(fullUserData.character.type);
            
            if (characterInfo) characterInfo.style.display = 'block';
            if (noCharacterInfo) noCharacterInfo.style.display = 'none';
        } else {
            // Aucun personnage créé
            if (characterInfo) characterInfo.style.display = 'none';
            if (noCharacterInfo) noCharacterInfo.style.display = 'block';
        }

        // Afficher le modal avec une animation
        modal.classList.add('show');
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
        
        console.log('✅ Modal de compte ouvert pour:', this.user.email);
    }

    closeAccountModal() {
        const modal = document.getElementById('accountModal');
        if (!modal) return;

        modal.classList.remove('show');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        console.log('✅ Modal de compte fermé');
    }

    getClassDisplayName(classKey) {
        const classNames = {
            'agent': 'Agent du Gouvernement',
            'initie': 'Initié',
            'sorcier': 'Sorcier',
            'citoyen': 'Citoyen'
        };
        return classNames[classKey] || classKey;
    }

    getTypeDisplayName(typeKey) {
        // Cette méthode devra être enrichie selon les types disponibles
        // Pour l'instant, on retourne la clé telle quelle
        return typeKey || '-';
    }

    openAdminAccountModal() {
        // Créer le modal d'administration unifié s'il n'existe pas
        let adminAccountModal = document.getElementById('adminAccountModal');
        if (!adminAccountModal) {
            this.createAdminAccountModal();
            adminAccountModal = document.getElementById('adminAccountModal');
        }

        // Remplir les informations administrateur
        const firstNameEl = document.getElementById('adminAccountFirstName');
        const emailEl = document.getElementById('adminAccountEmail');
        const createdAtEl = document.getElementById('adminAccountCreatedAt');
        
        if (firstNameEl) firstNameEl.textContent = this.user.firstName || 'Administrateur';
        if (emailEl) emailEl.textContent = this.user.email || 'g.Drelall';
        if (createdAtEl) createdAtEl.textContent = 'Compte administrateur';

        // Charger la liste des utilisateurs
        this.loadUsersListInAccountModal();

        // Afficher le modal
        adminAccountModal.style.display = 'flex';
        setTimeout(() => adminAccountModal.style.opacity = '1', 10);
        
        console.log('✅ Interface d\'administration complète ouverte');
    }

    createAdminAccountModal() {
        const modalHTML = `
            <div id="adminAccountModal" class="character-modal" style="display: none; opacity: 0;">
                <div class="character-form-container" style="max-width: 900px;">
                    <div class="character-form-header">
                        <h2 style="color: #ddc9a3;">Compte administrateur</h2>
                        <button id="closeAdminAccountBtn" class="close-btn">&times;</button>
                    </div>
                    <div class="account-content">
                        <!-- Informations de l'administrateur -->
                        <div class="account-section">
                            <h3 style="color: #ddc9a3;">Informations Administrateur</h3>
                            <div class="account-info">
                                <div class="info-row">
                                    <span class="info-label">Pseudo :</span>
                                    <span id="adminAccountFirstName" class="info-value">-</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Email :</span>
                                    <span id="adminAccountEmail" class="info-value">-</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Statut :</span>
                                    <span id="adminAccountCreatedAt" class="info-value">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- Gestion des utilisateurs -->
                        <div class="account-section">
                            <h3 style="color: #ddc9a3;">Gestion des Utilisateurs</h3>
                            <div id="adminUsersList" class="users-list">
                                <!-- La liste sera chargée dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attacher les événements
        document.getElementById('closeAdminAccountBtn').addEventListener('click', () => this.closeAdminAccountModal());
        document.getElementById('adminAccountModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminAccountModal') {
                this.closeAdminAccountModal();
            }
        });
    }

    closeAdminAccountModal() {
        const modal = document.getElementById('adminAccountModal');
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    loadUsersListInAccountModal() {
        const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
        const usersList = document.getElementById('adminUsersList');
        
        if (!usersList) return;

        if (users.length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: #ddc9a3; font-style: italic;">Aucun utilisateur enregistré</p>';
            return;
        }

        let usersHTML = `
            <div class="users-table">
                <div class="users-header">
                    <div class="user-col">Pseudo</div>
                    <div class="user-col">Email</div>
                    <div class="user-col">Date création</div>
                    <div class="user-col">Actions</div>
                </div>
        `;

        users.forEach(user => {
            const createdDate = user.createdAt ? 
                new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Inconnue';
            
            usersHTML += `
                <div class="user-row" data-user-id="${user.id}">
                    <div class="user-col">${user.firstName || 'N/A'}</div>
                    <div class="user-col">${user.email}</div>
                    <div class="user-col">${createdDate}</div>
                    <div class="user-col">
                        <button class="btn-secondary delete-user-btn" onclick="window.authManager.deleteUser('${user.id}', '${user.email}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        });

        usersHTML += '</div>';
        usersList.innerHTML = usersHTML;
    }

    async resendConfirmationEmail() {
        console.log('🔄 Tentative de renvoi d\'email...');
        
        if (!this.user) {
            console.error('❌ Aucun utilisateur connecté pour renvoyer l\'email');
            return;
        }

        console.log('👤 Utilisateur connecté:', this.user);

        // Vérifier que l'utilisateur a au minimum un email
        if (!this.user.email) {
            console.error('❌ Utilisateur sans email défini');
            return;
        }

        // S'assurer que l'utilisateur a un firstName défini
        if (!this.user.firstName) {
            console.warn('⚠️ Utilisateur sans pseudo, utilisation de l\'email comme nom');
            this.user.firstName = this.user.email.split('@')[0]; // Utiliser la partie avant @ comme pseudo
        }

        const resendBtn = document.getElementById('resendEmailBtn');
        if (resendBtn) {
            // Désactiver le bouton pendant l'envoi
            resendBtn.disabled = true;
            resendBtn.textContent = '📧 Envoi en cours...';
        }

        try {
            console.log('📧 Renvoi de l\'email de confirmation pour:', this.user.email);
            
            // Vérifier si le service d'email est disponible
            if (!window.emailService) {
                console.error('❌ Service d\'email non disponible');
                return;
            }
            
            console.log('✅ Service d\'email trouvé, envoi en cours...');
            
            // Utiliser le service d'email pour renvoyer la confirmation
            const result = await window.emailService.sendConfirmationEmail(this.user);
            
            console.log('📧 Résultat de l\'envoi:', result);
            
            if (result.success) {
                console.log('✅ Email envoyé avec succès !');
            } else {
                console.warn('⚠️ Erreur lors du renvoi:', result.message);
            }
        } catch (error) {
            console.error('❌ Erreur lors du renvoi de l\'email:', error);
            console.error('❌ Type d\'erreur:', typeof error);
            console.error('❌ Message d\'erreur:', error.message);
            console.error('❌ Stack trace:', error.stack);
        } finally {
            // Réactiver le bouton
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.textContent = '📧 Renvoyer l\'email de confirmation';
            }
        }
    }

    openAdminModal() {
        // Créer le modal d'administration s'il n'existe pas
        let adminModal = document.getElementById('adminModal');
        if (!adminModal) {
            this.createAdminModal();
            adminModal = document.getElementById('adminModal');
        }

        // Charger la liste des utilisateurs
        this.loadUsersList();

        // Afficher le modal
        adminModal.style.display = 'flex';
        setTimeout(() => adminModal.style.opacity = '1', 10);
    }

    createAdminModal() {
        const modalHTML = `
            <div id="adminModal" class="character-modal" style="display: none; opacity: 0;">
                <div class="character-form-container" style="max-width: 800px;">
                    <div class="character-form-header">
                        <h2>🛡️ Administration</h2>
                        <button id="closeAdminBtn" class="close-btn">&times;</button>
                    </div>
                    <div class="account-content">
                        <div class="account-section">
                            <h3 style="color: #ddc9a3;">Gestion des Utilisateurs</h3>
                            <div id="usersList" class="users-list">
                                <!-- La liste sera chargée dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attacher les événements
        document.getElementById('closeAdminBtn').addEventListener('click', () => this.closeAdminModal());
        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminModal') {
                this.closeAdminModal();
            }
        });
    }

    closeAdminModal() {
        const modal = document.getElementById('adminModal');
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    loadUsersList() {
        const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
        const usersList = document.getElementById('usersList');
        
        if (!usersList) return;

        if (users.length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: #ddc9a3; font-style: italic;">Aucun utilisateur enregistré</p>';
            return;
        }

        let usersHTML = `
            <div class="users-table">
                <div class="users-header">
                    <div class="user-col">Pseudo</div>
                    <div class="user-col">Email</div>
                    <div class="user-col">Date création</div>
                    <div class="user-col">Actions</div>
                </div>
        `;

        users.forEach(user => {
            const createdDate = user.createdAt ? 
                new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Inconnue';
            
            usersHTML += `
                <div class="user-row" data-user-id="${user.id}">
                    <div class="user-col">${user.firstName || 'N/A'}</div>
                    <div class="user-col">${user.email}</div>
                    <div class="user-col">${createdDate}</div>
                    <div class="user-col">
                        <button class="btn-secondary delete-user-btn" onclick="window.authManager.deleteUser('${user.id}', '${user.email}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        });

        usersHTML += '</div>';
        usersList.innerHTML = usersHTML;
    }

    deleteUser(userId, userEmail) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userEmail}" ?`)) {
            return;
        }

        try {
            // Récupérer la liste des utilisateurs
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            
            // Filtrer pour supprimer l'utilisateur
            const updatedUsers = users.filter(user => user.id !== userId);
            
            // Sauvegarder la liste mise à jour
            localStorage.setItem('saga_users', JSON.stringify(updatedUsers));
            
            // Rafraîchir la liste
            this.loadUsersList();
            
            console.log(`✅ Utilisateur ${userEmail} supprimé avec succès`);
            
            // Si l'utilisateur supprimé était connecté, le déconnecter
            const currentUser = JSON.parse(localStorage.getItem('saga_current_user') || 'null');
            if (currentUser && currentUser.id === userId) {
                localStorage.removeItem('saga_current_user');
                window.location.reload(); // Recharger la page pour mettre à jour l'interface
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        }
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            this.openAuthModal('signup'); // Ouvrir en mode inscription par défaut
            return false;
        }
        return true;
    }
}

// Initialiser le gestionnaire d'authentification
window.authManager = new AuthManager();
