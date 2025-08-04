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
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userDisplayName = document.getElementById('userDisplayName');

        if (this.isAuthenticated && this.user) {
            // Afficher le prénom s'il existe, sinon rien
            const displayName = this.user.firstName || '';
            if (userDisplayName) userDisplayName.textContent = displayName;
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
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
            
            this.closeAuthModal();
            
            console.log('✅ Connexion réussie (mode local):', this.user);
            return { data: { user: this.user }, error: null };
        } catch (error) {
            console.error('Erreur connexion:', error);
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
        const authForm = document.getElementById('authForm');
        
        if (!modal) return;
        
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            if (authForm) {
                authForm.reset();
            }
        }, 300);
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
