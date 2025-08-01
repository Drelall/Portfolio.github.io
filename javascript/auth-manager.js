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
        const userEmail = document.getElementById('userEmail');

        if (this.isAuthenticated && this.user) {
            userEmail.textContent = this.user.email;
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
        } else {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    async signUp(email, password) {
        try {
            // Mode local - simulation d'inscription
            const users = JSON.parse(localStorage.getItem('saga_users') || '[]');
            
            // Vérifier si l'utilisateur existe déjà
            if (users.find(user => user.email === email)) {
                throw new Error('Un compte avec cet email existe déjà');
            }
            
            // Créer le nouvel utilisateur
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // En production, il faudrait hasher le mot de passe
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('saga_users', JSON.stringify(users));
            
            // Connecter l'utilisateur automatiquement après inscription
            this.user = { email: email, id: newUser.id };
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
            
            // Connecter l'utilisateur
            this.user = { email: user.email, id: user.id };
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

    openAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchText = document.getElementById('authSwitchText');
        const switchLink = document.getElementById('authSwitchLink');

        if (mode === 'login') {
            title.textContent = 'Se connecter';
            submitBtn.textContent = 'Se connecter';
            switchText.innerHTML = 'Pas encore de compte ? <a href="#" id="authSwitchLink">S\'inscrire</a>';
        } else {
            title.textContent = 'S\'inscrire';
            submitBtn.textContent = 'S\'inscrire';
            switchText.innerHTML = 'Déjà un compte ? <a href="#" id="authSwitchLink">Se connecter</a>';
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);

        // Réattacher l'événement de switch
        document.getElementById('authSwitchLink').onclick = (e) => {
            e.preventDefault();
            this.openAuthModal(mode === 'login' ? 'signup' : 'login');
        };
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('authForm').reset();
        }, 300);
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            this.showMessage('🔒 Veuillez vous connecter pour créer un personnage', 'info');
            this.openAuthModal();
            return false;
        }
        return true;
    }
}

// Initialiser le gestionnaire d'authentification
window.authManager = new AuthManager();
