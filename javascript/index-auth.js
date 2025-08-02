// Gestionnaire d'authentification pour la page d'accueil
class IndexAuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Vérifier s'il y a un utilisateur connecté en local
        const currentUser = localStorage.getItem('saga_current_user');
        if (currentUser) {
            try {
                this.user = JSON.parse(currentUser);
                this.isAuthenticated = true;
                this.updateUI();
                console.log('✅ Utilisateur connecté (session locale):', this.user.email);
            } catch (error) {
                console.error('Erreur lors de la récupération de la session:', error);
                localStorage.removeItem('saga_current_user');
            }
        }

        // Attacher les événements
        this.attachEvents();
        this.setupLogoHover();
    }

    setupLogoHover() {
        const logo = document.querySelector('.logo');
        const authBar = document.querySelector('.auth-bar');
        
        if (logo && authBar) {
            let hoverTimeout;
            
            // Survol du logo
            logo.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                authBar.classList.add('visible');
            });
            
            // Quitter le logo
            logo.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    // Vérifier si la souris n'est pas sur la barre d'auth
                    if (!authBar.matches(':hover')) {
                        authBar.classList.remove('visible');
                    }
                }, 300);
            });
            
            // Survol de la barre d'auth
            authBar.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                authBar.classList.add('visible');
            });
            
            // Quitter la barre d'auth
            authBar.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    authBar.classList.remove('visible');
                }, 300);
            });
        }
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
        const cancelAuthBtn = document.getElementById('cancelAuthBtn');
        const closeAccountBtn = document.getElementById('closeAccountBtn');

        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => this.closeAuthModal());
        }

        if (cancelAuthBtn) {
            cancelAuthBtn.addEventListener('click', () => this.closeAuthModal());
        }

        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => this.closeAccountModal());
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
            // Si le prénom existe, l'afficher, sinon afficher "Utilisateur connecté"
            const displayName = this.user.firstName || 'Utilisateur connecté';
            if (userDisplayName) userDisplayName.textContent = displayName;
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
        }
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const submitBtn = document.getElementById('authSubmitBtn');
        const isSignup = submitBtn.textContent.includes('inscrire');

        try {
            if (isSignup) {
                await this.signUp(email, password, firstName);
            } else {
                await this.signIn(email, password);
            }
        } catch (error) {
            this.showMessage(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async signUp(email, password, firstName) {
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
            password: password,
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
        
        this.showMessage('✅ Inscription réussie ! Vous êtes maintenant connecté.', 'success');
        this.closeAuthModal();
        
        console.log('✅ Inscription réussie (mode local):', newUser);
    }

    async signIn(email, password) {
        // Mode local - vérification des identifiants
        const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        // Connecter l'utilisateur (inclure le prénom s'il existe)
        this.user = { 
            email: user.email, 
            id: user.id, 
            firstName: user.firstName 
        };
        this.isAuthenticated = true;
        localStorage.setItem('saga_current_user', JSON.stringify(this.user));
        this.updateUI();
        
        this.showMessage('✅ Connexion réussie !', 'success');
        this.closeAuthModal();
        
        console.log('✅ Connexion réussie (mode local):', this.user);
    }

    async signOut() {
        // Mode local - suppression de la session
        localStorage.removeItem('saga_current_user');
        this.user = null;
        this.isAuthenticated = false;
        this.updateUI();
        
        this.showMessage('👋 Déconnexion réussie !', 'success');
        console.log('👋 Utilisateur déconnecté (mode local)');
    }

    openAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchText = document.getElementById('authSwitchText');
        const firstNameGroup = document.getElementById('firstNameGroup');
        const firstName = document.getElementById('firstName');

        if (!modal) return;

        if (mode === 'login') {
            if (title) title.textContent = 'Se connecter';
            if (submitBtn) submitBtn.textContent = 'Se connecter';
            if (switchText) switchText.innerHTML = 'Pas encore de compte ? <a href="#" id="authSwitchLink">S\'inscrire</a>';
            // Masquer le champ prénom pour la connexion
            if (firstNameGroup) firstNameGroup.style.display = 'none';
            if (firstName) firstName.required = false;
        } else {
            if (title) title.textContent = 'S\'inscrire';
            if (submitBtn) submitBtn.textContent = 'S\'inscrire';
            if (switchText) switchText.innerHTML = 'Déjà un compte ? <a href="#" id="authSwitchLink">Se connecter</a>';
            // Afficher le champ prénom pour l'inscription
            if (firstNameGroup) firstNameGroup.style.display = 'block';
            if (firstName) firstName.required = true;
        }

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
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            const authForm = document.getElementById('authForm');
            if (authForm) authForm.reset();
        }, 300);
    }

    openAccountModal() {
        const modal = document.getElementById('accountModal');
        if (!modal) return;

        // Récupérer les données utilisateur complètes
        const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
        const fullUserData = users.find(user => user.id === this.user.id);

        if (!fullUserData) {
            this.showMessage('❌ Erreur : données utilisateur introuvables', 'error');
            return;
        }

        // Remplir les informations personnelles
        document.getElementById('accountFirstName').textContent = fullUserData.firstName || '-';
        document.getElementById('accountEmail').textContent = fullUserData.email || '-';
        
        // Formater la date de création
        const createdDate = fullUserData.createdAt ? 
            new Date(fullUserData.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '-';
        document.getElementById('accountCreatedAt').textContent = createdDate;

        // Remplir les informations du personnage
        const characterInfo = document.getElementById('characterInfo');
        const noCharacterInfo = document.getElementById('noCharacterInfo');

        if (fullUserData.character) {
            // Afficher les informations du personnage
            document.getElementById('characterFullName').textContent = 
                `${fullUserData.character.firstName} ${fullUserData.character.lastName}`;
            document.getElementById('characterClass').textContent = 
                this.getClassDisplayName(fullUserData.character.class);
            document.getElementById('characterType').textContent = 
                this.getTypeDisplayName(fullUserData.character.type);
            
            characterInfo.style.display = 'block';
            noCharacterInfo.style.display = 'none';
        } else {
            // Aucun personnage créé
            characterInfo.style.display = 'none';
            noCharacterInfo.style.display = 'block';
        }

        // Afficher le modal
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
    }

    closeAccountModal() {
        const modal = document.getElementById('accountModal');
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
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
}

// Initialiser le gestionnaire d'authentification pour l'index
document.addEventListener('DOMContentLoaded', () => {
    window.indexAuthManager = new IndexAuthManager();
});
