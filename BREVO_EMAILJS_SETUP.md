# Configuration EmailJS avec Brevo

## Étape 1: Connexion à EmailJS
1. Allez sur https://dashboard.emailjs.com
2. Connectez-vous avec votre compte

## Étape 2: Ajouter le service Brevo
1. Dans le dashboard, cliquez sur "Email Services"
2. Cliquez sur "Add New Service"
3. Sélectionnez "Brevo" (ancien Sendinblue)
4. Configurez avec ces paramètres :

### Configuration Brevo
- **Service ID** : `service_brevo`
- **SMTP Server** : `smtp-relay.brevo.com`
- **Port** : `587`
- **Username** : `936647001@smtp-brevo.com`
- **Password** : `FMI5H0K40RVA71`
- **From Name** : Votre nom ou nom du site
- **From Email** : L'email vérifié dans votre compte Brevo

## Étape 3: Vérifier le template
1. Dans "Email Templates", vérifiez que `template_g8revx9` existe
2. Si besoin, ajustez les variables du template :
   - `{{to_name}}` : Nom du destinataire
   - `{{to_email}}` : Email du destinataire
   - `{{user_name}}` : Nom d'utilisateur
   - `{{character_full_name}}` : Nom complet du personnage
   - `{{character_class}}` : Classe du personnage
   - `{{character_type}}` : Type du personnage
   - `{{created_date}}` : Date de création

## Étape 4: Test
Une fois configuré, testez l'envoi d'emails depuis votre application !

## Dépannage
Si vous rencontrez des problèmes :
1. Vérifiez que l'email "From" est vérifié dans Brevo
2. Vérifiez que le Service ID est exactement `service_brevo`
3. Consultez les logs de la console pour plus de détails
