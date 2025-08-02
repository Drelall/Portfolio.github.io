// Service d'envoi d'emails avec EmailJS
class EmailService {
    constructor() {
        // Configuration EmailJS - À PERSONNALISER
        this.serviceId = 'service_b0xzmoe'; // Votre Service ID Outlook
        this.templateId = 'template_g8revx9'; // Votre Template ID
        this.publicKey = 'kAy9PcwqSScdLeik4'; // Votre Public Key
        
        // Initialiser EmailJS si disponible
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.publicKey);
            console.log('📧 EmailJS initialisé avec votre clé API');
        } else {
            console.warn('⚠️ EmailJS non disponible, utilisation de la simulation');
        }
    }

    async sendConfirmationEmail(user) {
        try {
            console.log('📧 Début de sendConfirmationEmail avec utilisateur:', user);
            
            // Vérifier si EmailJS est disponible et configuré
            if (typeof emailjs === 'undefined' || this.publicKey === 'YOUR_PUBLIC_KEY') {
                console.warn('⚠️ EmailJS non configuré, affichage de l\'email de confirmation');
                this.showEmailConfirmationModal(user);
                return { success: true, message: 'Email de confirmation affiché (simulation)' };
            }

            console.log('✅ EmailJS disponible, préparation des paramètres...');

            // Préparer les données pour l'email
            const templateParams = {
                to_email: user.email,
                user_name: user.firstName || 'Utilisateur',
                user_email: user.email,
                character_full_name: user.character ? 
                    `${user.character.firstName} ${user.character.lastName}` : 
                    'Aucun personnage créé',
                character_class: user.character ? 
                    this.getClassDisplayName(user.character.class) : 
                    'Non définie',
                character_type: user.character ? 
                    user.character.type : 
                    'Non défini',
                created_date: user.createdAt ? 
                    new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 
                    new Date().toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
            };

            console.log('📧 Paramètres du template préparés:', templateParams);
            console.log('📧 Configuration EmailJS:', {
                serviceId: this.serviceId,
                templateId: this.templateId,
                publicKey: this.publicKey
            });

            console.log('📧 Envoi de l\'email de confirmation à:', user.email);
            
            // Envoyer l'email via EmailJS
            const result = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );

            console.log('✅ Email envoyé avec succès:', result);
            return { 
                success: true, 
                message: 'Email de confirmation envoyé avec succès !',
                result: result 
            };

        } catch (error) {
            console.error('❌ Erreur détaillée lors de l\'envoi de l\'email:', error);
            console.error('❌ Type d\'erreur:', typeof error);
            console.error('❌ Message d\'erreur:', error.message);
            console.error('❌ Stack trace:', error.stack);
            
            // En cas d'erreur, afficher quand même la confirmation
            this.showEmailConfirmationModal(user);
            
            return { 
                success: false, 
                message: `Erreur lors de l'envoi de l'email: ${error.message}`,
                error: error 
            };
        }
    }

    showEmailConfirmationModal(user) {
        // Créer un modal pour afficher le contenu de l'email de confirmation
        const modal = document.createElement('div');
        modal.className = 'email-confirmation-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.className = 'email-confirmation-content';
        content.style.cssText = `
            background: #1a1a1a;
            color: #f3e8d3;
            padding: 30px;
            border-radius: 12px;
            border: 2px solid #226d54;
            max-width: 500px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
            position: relative;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: #f3e8d3;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
        `;

        closeBtn.addEventListener('click', () => modal.remove());

        content.innerHTML = `
            <h2 style="color: #226d54; margin-bottom: 20px;">📧 Email de confirmation</h2>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; border-left: 4px solid #226d54;">
                <p><strong>Bonjour ${user.firstName || 'Utilisateur'},</strong></p>
                <br>
                <p>Bienvenue dans l'univers de <strong>Saga</strong> !</p>
                <br>
                <p>Votre compte a été créé avec succès :</p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li><strong>Email :</strong> ${user.email}</li>
                    <li><strong>Prénom :</strong> ${user.firstName || 'Non défini'}</li>
                    ${user.character ? `
                        <li><strong>Personnage :</strong> ${user.character.firstName} ${user.character.lastName}</li>
                        <li><strong>Classe :</strong> ${this.getClassDisplayName(user.character.class)}</li>
                        <li><strong>Type :</strong> ${user.character.type}</li>
                    ` : `
                        <li><strong>Personnage :</strong> <em style="color: #888;">Aucun personnage créé - <a href="jeux/jeux.html" style="color: #226d54;">Créer un personnage</a></em></li>
                    `}
                </ul>
                <br>
                <p>Vous pouvez maintenant accéder à votre compte et consulter vos informations dans la section "Mon Compte".</p>
                <br>
                <p style="color: #7ec3ff;"><em>Que l'aventure commence !</em></p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button id="confirmEmailBtn" style="
                    background: linear-gradient(135deg, #226d54 0%, #2a8066 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">J'ai compris</button>
            </div>
        `;

        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Événement pour fermer avec le bouton de confirmation
        content.querySelector('#confirmEmailBtn').addEventListener('click', () => modal.remove());

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        console.log('📧 Email de confirmation affiché dans un modal');
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
}

// Initialiser le service d'email
window.emailService = new EmailService();
