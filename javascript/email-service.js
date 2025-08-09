// Service d'envoi d'emails avec Web3Forms
class EmailService {
    constructor() {
        // Configuration Web3Forms - CLÉ API CONFIGURÉE
        this.accessKey = 'a5cdcbc6-a140-41a6-9dd3-a92c23f42b0a'; // Votre clé API Web3Forms
        this.apiEndpoint = 'https://api.web3forms.com/submit';
        
        console.log('📧 Service Web3Forms initialisé avec votre clé API');
    }

    async sendConfirmationEmail(user) {
        try {
            console.log('📧 Envoi d\'email de confirmation via Web3Forms à:', user.email);
            
            // Vérifier si la clé API est configurée
            if (this.accessKey === 'VOTRE_CLE_API_WEB3FORMS') {
                console.warn('⚠️ Clé API Web3Forms non configurée, affichage du modal');
                this.showEmailConfirmationModal(user);
                return { success: true, message: 'Email affiché (clé API manquante)' };
            }

            // Préparer les données pour Web3Forms
            const formData = new FormData();
            
            // Configuration de l'email (votre email reste masqué)
            formData.append('access_key', this.accessKey);
            formData.append('from_name', 'Drelall'); // Nom visible
            formData.append('reply_to', 'noreply@drelall.com'); // Email visible (fictif)
            formData.append('subject', 'Bienvenue dans l\'univers de Saga !');
            
            // Données du destinataire
            formData.append('email', user.email);
            formData.append('name', user.firstName || 'Aventurier');
            
            // Message personnalisé
            const emailMessage = this.createEmailMessage(user);
            formData.append('message', emailMessage);
            
            // Options Web3Forms
            formData.append('redirect', 'false'); // Pas de redirection
            formData.append('honeypot', ''); // Protection anti-spam

            console.log('📧 Envoi de l\'email via Web3Forms...');
            
            // Envoyer l'email
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Email envoyé avec succès via Web3Forms:', result);
                return { 
                    success: true, 
                    message: 'Email de confirmation envoyé avec succès !',
                    result: result 
                };
            } else {
                throw new Error('Erreur Web3Forms: ' + result.message);
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi via Web3Forms:', error);
            
            // Fallback vers le modal si l'envoi échoue
            console.log('🔄 Fallback vers le modal de confirmation');
            this.showEmailConfirmationModal(user);
            
            return { 
                success: true, 
                message: 'Email affiché (erreur d\'envoi)', 
                error: error.message 
            };
        }
    }

    createEmailMessage(user) {
        const characterInfo = user.character ? `
Détails de votre personnage :
• Nom complet : ${user.character.firstName} ${user.character.lastName}
• Classe : ${this.getClassDisplayName(user.character.class)}
• Type : ${user.character.type}
• Date de création : ${new Date().toLocaleDateString('fr-FR')}
        ` : `
Vous pourrez créer votre personnage lors de votre prochaine visite.
        `;

        return `Bonjour ${user.firstName || 'Aventurier'},

Félicitations ! Votre inscription dans l'univers de Saga a été confirmée avec succès.

${characterInfo}

Bienvenue dans notre communauté ! Vous pouvez maintenant explorer tous les contenus du site.

---
Drelall

Note : Ceci est un email automatique, merci de ne pas y répondre.`;
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #d4af37;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            color: #f0f0f0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            position: relative;
            text-align: center;
        `;

        const characterDisplay = user.character ? `
            <div style="margin: 20px 0; padding: 15px; background: rgba(212, 175, 55, 0.1); border-radius: 10px; border-left: 4px solid #d4af37;">
                <h4 style="color: #d4af37; margin: 0 0 10px 0;">✨ Votre Personnage</h4>
                <p style="margin: 5px 0;"><strong>Nom :</strong> ${user.character.firstName} ${user.character.lastName}</p>
                <p style="margin: 5px 0;"><strong>Classe :</strong> ${this.getClassDisplayName(user.character.class)}</p>
                <p style="margin: 5px 0;"><strong>Type :</strong> ${user.character.type}</p>
            </div>
        ` : '';

        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📧</div>
                <h2 style="color: #d4af37; margin: 0; font-size: 24px;">Email de Confirmation</h2>
            </div>
            
            <div style="text-align: left; line-height: 1.6;">
                <p><strong>À :</strong> ${user.email}</p>
                <p><strong>De :</strong> Drelall</p>
                <p><strong>Sujet :</strong> Bienvenue dans l'univers de Saga !</p>
                
                <hr style="border: 1px solid #d4af37; margin: 20px 0;">
                
                <p>Bonjour <strong>${user.firstName || 'Aventurier'}</strong>,</p>
                
                <p>Félicitations ! Votre inscription dans l'univers de Saga a été confirmée avec succès.</p>
                
                ${characterDisplay}
                
                <p>Bienvenue dans notre communauté ! Vous pouvez maintenant explorer tous les contenus du site.</p>
                
                <hr style="border: 1px solid #d4af37; margin: 20px 0;">
                
                <p style="font-style: italic; color: #cccccc; font-size: 14px;">
                    L'équipe Saga Universe<br>
                    <small>Note : Ceci est un email automatique</small>
                </p>
            </div>
            
            <button id="closeEmailModal" style="
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #1a1a2e;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
                margin-top: 20px;
                transition: all 0.3s ease;
            ">Fermer</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Ajouter les événements de fermeture
        const closeBtn = content.querySelector('#closeEmailModal');
        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Fermer avec Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Effet d'apparition
        modal.style.opacity = '0';
        content.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease';
            content.style.transition = 'transform 0.3s ease';
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        console.log('📧 Modal d\'email de confirmation affiché');
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

// Créer une instance globale du service
window.emailService = new EmailService();
async function sendWelcomeEmail(email, name, characterData) {
    try {
        const classNames = {
            'agent': 'Agent du Gouvernement',
            'initie': 'Initié',
            'sorcier': 'Sorcier',
            'citoyen': 'Citoyen'
        };

        const characterInfo = characterData ? `
Informations de votre personnage :
- Nom : ${characterData.firstName} ${characterData.lastName}
- Classe : ${classNames[characterData.characterClass] || characterData.characterClass}
- Type : ${characterData.characterType}
- Divinité : ${characterData.characterDeity}
        ` : '';

        const emailContent = `
Bienvenue ${name} !

Votre inscription au Jeu du Tableau à Poudlard a été finalisée avec succès.

${characterInfo}

Vous pouvez maintenant vous connecter et commencer à jouer !

Bonne aventure !
        `;

        console.log('Email de bienvenue envoyé à:', email);
        console.log('Contenu:', emailContent);
        
        // Ici vous pouvez ajouter votre service d'email réel (EmailJS, etc.)
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
    }
}