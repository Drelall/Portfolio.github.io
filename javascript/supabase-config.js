// Configuration Supabase
// IMPORTANT: Remplacez ces valeurs par vos vraies clés Supabase !

// Pour obtenir ces valeurs :
// 1. Allez sur https://supabase.com
// 2. Créez un nouveau projet
// 3. Allez dans Settings > API
// 4. Copiez l'URL du projet et la clé publique anon

const SUPABASE_URL = 'https://ckxanyavgtpcrhenxshq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNreGFueWF2Z3RwY3Joc25rc2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzAzNTEsImV4cCI6MjA2OTY0NjM1MX0.by-GjRumrP4DWMPkcxOttJWJfs3ssMmvJhQH1JSIJPU';

// Configuration des tables
const TABLES = {
    CHARACTERS: 'characters',
    PROFILES: 'profiles'
};

// Validation de la configuration
function validateSupabaseConfig() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.warn('⚠️ Configuration Supabase non configurée !');
        console.log('📝 Pour configurer Supabase :');
        console.log('1. Créez un compte sur https://supabase.com');
        console.log('2. Créez un nouveau projet');
        console.log('3. Remplacez les valeurs dans supabase-config.js');
        return false;
    }
    return true;
}

// Initialisation du client Supabase (seulement si configuré)
let supabaseClient = null;
if (validateSupabaseConfig()) {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error);
    }
}

// Export des fonctions utilitaires
window.SupabaseConfig = {
    client: supabaseClient,
    tables: TABLES,
    isConfigured: validateSupabaseConfig
};
