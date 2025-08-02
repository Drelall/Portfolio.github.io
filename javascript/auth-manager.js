// Gestionnaire d'authentification Local (pour tests)
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
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
                console.log('✅ Utilisateur connecté (session locale):', this.user.email);
            } catch (error) {
                console.error('Erreur lors de la récupération de la session:', error);
                localStorage.removeItem('saga_current_user');
            }
        }
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userDisplayName = document.getElementById('userDisplayName');

        if (this.isAuthenticated && this.user) {
            // Afficher le prénom s'il existe, sinon l'email
            const displayName = this.user.firstName || this.user.email;
            if (userDisplayName) userDisplayName.textContent = displayName;
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
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
            
            this.showMessage('✅ Inscription réussie ! Vous êtes maintenant connecté.', 'success');
            this.closeAuthModal();
            
            console.log('✅ Inscription réussie (mode local):', newUser);
            return { data: { user: newUser }, error: null };
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            this.showMessage(`❌ Erreur d'inscription: ${error.message}`, 'error');
            return { data: null, error };
        }
    }

    async signIn(email, password) {
        try {
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
            return { data: { user: this.user }, error: null };
        } catch (error) {
            console.error('Erreur connexion:', error);
            this.showMessage(`❌ Erreur de connexion: ${error.message}`, 'error');
            return { data: null, error };
        }
    }

    async signOut() {
        try {
            // Mode local - suppression de la session
            localStorage.removeItem('saga_current_user');
            this.user = null;
            this.isAuthenticated = false;
            this.updateUI();
            
            this.showMessage('👋 Déconnexion réussie !', 'success');
            console.log('👋 Utilisateur déconnecté (mode local)');
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            this.showMessage(`❌ Erreur de déconnexion: ${error.message}`, 'error');
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
        console.log('🔧 Tentative de fermeture du modal d\'authentification...');
        const modal = document.getElementById('authModal');
        const authForm = document.getElementById('authForm');
        
        if (!modal) {
            console.error('❌ Modal authModal non trouvé !');
            return;
        }
        
        console.log('✅ Modal trouvé, fermeture en cours...');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            if (authForm) {
                authForm.reset();
                console.log('✅ Formulaire réinitialisé');
            }
            console.log('✅ Modal fermé');
        }, 300);
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            this.showMessage('🔒 Veuillez vous inscrire pour créer un personnage', 'info');
            this.openAuthModal('signup'); // Ouvrir en mode inscription par défaut
            return false;
        }
        return true;
    }
}

// Initialiser le gestionnaire d'authentification
window.authManager = new AuthManager();
