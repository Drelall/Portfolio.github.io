# Configuration EmailJS pour les emails de confirmation

Pour activer l'envoi de vrais emails de confirmation, suivez ces étapes :

## 1. Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Confirmez votre email

## 2. Configurer un service email

1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email (Gmail, Outlook, etc.)
4. Suivez les instructions pour connecter votre email
5. Notez le **Service ID** (ex: `service_abc123`)

## 3. Créer un template d'email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template :

```
Subject: Bienvenue dans l'univers de Saga !

Bonjour {{user_name}},

Bienvenue dans l'univers de Saga !

Votre compte a été créé avec succès :
- Email : {{user_email}}
- Prénom : {{user_name}}
- Personnage : {{character_full_name}}
- Classe : {{character_class}}
- Type : {{character_type}}
- Date d'inscription : {{created_date}}

Vous pouvez maintenant accéder à votre compte et consulter vos informations dans la section "Mon Compte".

Que l'aventure commence !

L'équipe Saga
```

4. Sauvegardez et notez le **Template ID** (ex: `template_abc123`)

## 4. Obtenir la clé publique

1. Allez dans **"Account"** > **"General"**
2. Trouvez votre **Public Key** (ex: `abc123xyz`)

## 5. Configurer le projet

Éditez le fichier `javascript/email-service.js` et remplacez :

```javascript
this.serviceId = 'service_abc123'; // Remplacez par votre Service ID
this.templateId = 'template_abc123'; // Remplacez par votre Template ID  
this.publicKey = 'abc123xyz'; // Remplacez par votre Public Key
```

## 6. Tester

1. Effectuez une inscription complète sur votre site
2. Vérifiez votre boîte email pour l'email de confirmation
3. Si ça ne fonctionne pas, vérifiez la console du navigateur pour les erreurs

## Notes importantes

- Le plan gratuit EmailJS permet 200 emails/mois
- Les emails peuvent parfois arriver dans les spams
- En cas de problème, le système affichera quand même une confirmation visuelle
- Vous pouvez tester d'abord avec votre propre email

## Dépannage

Si les emails ne sont pas envoyés :
1. Vérifiez que les IDs sont corrects
2. Vérifiez que votre service email est bien connecté
3. Regardez la console du navigateur pour les erreurs
4. Testez d'abord avec l'outil de test EmailJS

Le système continuera de fonctionner même sans EmailJS configuré, en affichant simplement une popup de confirmation.
