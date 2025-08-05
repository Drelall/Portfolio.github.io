// Gestionnaire d'authentification Local (pour tests)
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        // Données temporaires pour l'inscription en 2 étapes
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

        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => this.closeAuthModal());
        }

        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => this.closeAccountModal());
        }

        if (cancelAuthBtn) {
            cancelAuthBtn.addEventListener('click', () => this.closeAuthModal());
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
                    this.closeAuthModal();
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
            // Ne pas afficher de nom pour l'administrateur, afficher le prénom pour les autres
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
            // Vérifications de base
            if (!email || !password || !firstName) {
                throw new Error('Tous les champs sont requis');
            }

            if (password.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }

            if (!firstName.trim()) {
                throw new Error('Le prénom ne peut pas être vide');
            }

            // Vérifier si l'utilisateur existe déjà
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            if (users.find(user => user.email === email)) {
                throw new Error('Un compte avec cet email existe déjà');
            }

            // Stocker les données temporairement
            this.tempRegistrationData = {
                email: email.trim(),
                password: password,
                firstName: firstName.trim(),
                timestamp: Date.now()
            };

            console.log('✅ Étape 1 de l\'inscription validée pour:', email);
            return { success: true, data: this.tempRegistrationData };
        } catch (error) {
            return { success: false, error: error.message };
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
                console.log(`- Prénom: ${user.firstName}`);
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

        // Validation personnalisée pour l'email
        if (!isSignup) {
            // Pour la connexion, accepter soit un email valide, soit le nom d'utilisateur admin
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            const isAdminUsername = email === 'g.Drelall';
            
            if (!isValidEmail && !isAdminUsername) {
                this.showMessage('Veuillez saisir un email valide ou utilisez votre nom d\'utilisateur administrateur', 'error');
                return;
            }
        } else {
            // Pour l'inscription, exiger un email valide
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValidEmail) {
                this.showMessage('Veuillez saisir un email valide pour l\'inscription', 'error');
                return;
            }
        }

        try {
            if (isSignup) {
                await this.signUp(email, password, firstName);
            } else {
                await this.signIn(email, password);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            console.error(`❌ Erreur: ${error.message}`);
        }
    }

    async signUp(email, password, firstName) {
        try {
            // Mode local - simulation d'inscription
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            
            // Vérifier si l'utilisateur existe déjà
            if (users.find(user => user.email === email)) {
                throw new Error('Un compte avec cet email existe déjà');
            }
            
            // Validation du prénom pour l'inscription
            if (!firstName || firstName.trim() === '') {
                throw new Error('Le prénom est requis pour l\'inscription');
            }
            
            // Créer le nouvel utilisateur
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // En production, il faudrait hasher le mot de passe
                firstName: firstName.trim(),
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('saga_users', JSON.stringify(users));
            
            // Connecter l'utilisateur automatiquement après inscription
            this.user = { email: email, id: newUser.id, firstName: newUser.firstName };
            this.isAuthenticated = true;
            localStorage.setItem('saga_current_user', JSON.stringify(this.user));
            this.updateUI();
            
            console.log('✅ Inscription réussie (mode local):', newUser);
            return { data: { user: newUser }, error: null };
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            return { data: null, error };
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
        const switchText = document.getElementById('authSwitchText');
        const firstNameGroup = document.getElementById('firstNameGroup');
        const firstName = document.getElementById('firstName');

        if (!modal) return;

        if (mode === 'login') {
            if (title) title.textContent = 'Se connecter';
            if (submitBtn) {
                submitBtn.textContent = 'Se connecter';
                submitBtn.style.display = 'inline-block';
            }
            if (nextToCharacterBtn) nextToCharacterBtn.style.display = 'none';
            if (switchText) switchText.innerHTML = 'Pas encore de compte ? <a href="#" id="authSwitchLink">S\'inscrire</a>';
            // Masquer le champ prénom pour la connexion
            if (firstNameGroup) firstNameGroup.style.display = 'none';
            if (firstName) firstName.required = false;
        } else {
            if (title) title.textContent = 'S\'inscrire - Étape 1/2';
            if (submitBtn) {
                submitBtn.textContent = 'Valider et continuer';
                submitBtn.style.display = 'inline-block';
            }
            if (nextToCharacterBtn) nextToCharacterBtn.style.display = 'none';
            if (switchText) switchText.innerHTML = 'Déjà un compte ? <a href="#" id="authSwitchLink">Se connecter</a>';
            // Afficher le champ prénom pour l'inscription
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
            if (authForm) {
                authForm.reset();
            }
        }, 300);
        
        console.log('✅ Modal d\'authentification fermé');
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
                                    <span class="info-label">Prénom :</span>
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
                    <div class="user-col">Prénom</div>
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
            console.warn('⚠️ Utilisateur sans prénom, utilisation de l\'email comme nom');
            this.user.firstName = this.user.email.split('@')[0]; // Utiliser la partie avant @ comme prénom
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
                    <div class="user-col">Prénom</div>
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
