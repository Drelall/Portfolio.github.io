# 🔥 Configuration Supabase pour votre RPG Tracker

## 🚀 Étapes de configuration

### 1. Créer un compte Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub (recommandé) ou créez un compte

### 2. Créer un nouveau projet
1. Cliquez sur "New Project"
2. Sélectionnez votre organisation
3. Donnez un nom à votre projet (ex: "rpg-tracker")
4. Créez un mot de passe sécurisé pour la base de données
5. Choisissez une région proche de vos utilisateurs
6. Cliquez sur "Create new project"

### 3. Récupérer les clés d'API
1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez ces deux valeurs :
   - **Project URL** (commence par `https://xxxxx.supabase.co`)
   - **anon/public key** (clé publique, commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

### 4. Configurer votre projet
1. Ouvrez le fichier `javascript/supabase-config.js`
2. Remplacez :
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
   
   Par vos vraies valeurs :
   ```javascript
   const SUPABASE_URL = 'https://votre-projet.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

### 5. Créer les tables dans Supabase
1. Dans votre projet Supabase, allez dans **Table Editor**
2. Cliquez sur "Create a new table"

#### Table `characters` :
```sql
CREATE TABLE characters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text NOT NULL,
  character_class text NOT NULL,
  character_type text NOT NULL,
  class_display_name text NOT NULL,
  type_display_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Table `profiles` (optionnelle) :
```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6. Configurer les politiques de sécurité (RLS)
1. Dans **Table Editor**, sélectionnez la table `characters`
2. Activez "Row Level Security" (RLS)
3. Créez ces politiques :

#### Politique SELECT (lecture) :
```sql
CREATE POLICY "Users can view own characters" ON characters
FOR SELECT USING (auth.uid() = user_id);
```

#### Politique INSERT (création) :
```sql
CREATE POLICY "Users can insert own characters" ON characters
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Politique UPDATE (modification) :
```sql
CREATE POLICY "Users can update own characters" ON characters
FOR UPDATE USING (auth.uid() = user_id);
```

#### Politique DELETE (suppression) :
```sql
CREATE POLICY "Users can delete own characters" ON characters
FOR DELETE USING (auth.uid() = user_id);
```

### 7. Configurer l'authentification
1. Allez dans **Authentication** → **Settings**
2. Dans "Site URL", ajoutez votre URL GitHub Pages : `https://votre-username.github.io`
3. Dans "Redirect URLs", ajoutez : `https://votre-username.github.io/**`

## 🎮 Fonctionnalités disponibles

Une fois configuré, votre RPG Tracker aura :
- ✅ **Authentification sécurisée** (email/mot de passe)
- ✅ **Sauvegarde cloud** des personnages
- ✅ **Synchronisation** entre appareils
- ✅ **Sécurité** : chaque utilisateur ne voit que ses personnages
- ✅ **Fallback localStorage** si Supabase n'est pas configuré

## 🔧 Dépannage

### Erreur "Invalid API key"
- Vérifiez que vous avez bien copié la clé `anon/public` (pas la clé `service_role`)

### Erreur "Failed to fetch"
- Vérifiez l'URL du projet (sans slash à la fin)
- Vérifiez que le projet Supabase est bien actif

### Les personnages ne se sauvegardent pas
- Vérifiez que les tables sont créées
- Vérifiez que RLS est activé avec les bonnes politiques
- Vérifiez la console du navigateur pour les erreurs

## 💰 Limites gratuites de Supabase

Le plan gratuit inclut :
- 50 000 utilisateurs actifs mensuels
- 500 MB de stockage base de données
- 1 GB de stockage fichiers
- 2 GB de bande passante

C'est largement suffisant pour un projet personnel !

## 🚀 Déploiement

Votre projet fonctionne directement sur GitHub Pages une fois Supabase configuré.
Aucune modification de configuration n'est nécessaire pour le déploiement.
