// Fonction pour dessiner un vortex cosmique unique (mélange Stargate + Porte des Ténèbres)
function drawBlackLiquidSurface(ctx, x, y, width, height, time) {
    // Centre de l'effet
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxRadius = Math.max(width, height) / 2;
    
    // Base cosmique très sombre
    ctx.fillStyle = '#000005';
    ctx.fillRect(x, y, width, height);
    
    ctx.save();
    
    // Gradient de base cosmique (du noir profond aux bords rougeâtres)
    ctx.globalAlpha = 0.8;
    let cosmicGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    cosmicGradient.addColorStop(0, 'rgba(5, 0, 15, 1)');      // Centre très sombre
    cosmicGradient.addColorStop(0.4, 'rgba(20, 5, 25, 0.9)'); // Violet sombre
    cosmicGradient.addColorStop(0.7, 'rgba(60, 20, 10, 0.7)'); // Rouge sombre
    cosmicGradient.addColorStop(0.9, 'rgba(100, 40, 15, 0.5)'); // Orange/rouge des bords
    cosmicGradient.addColorStop(1, 'rgba(120, 60, 30, 0.3)');   // Bord orangé
    
    ctx.fillStyle = cosmicGradient;
    ctx.fillRect(x, y, width, height);
    
    // Particules d'étoiles scintillantes (style WoW)
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 25; i++) {
        let starAngle = (time * 0.0003 + i * 0.8) % (Math.PI * 2);
        let starRadius = (Math.sin(time * 0.002 + i) * 0.3 + 0.7) * maxRadius * 0.8;
        let px = centerX + Math.cos(starAngle) * starRadius;
        let py = centerY + Math.sin(starAngle) * starRadius;
        
        if (px >= x && px <= x + width && py >= y && py <= y + height) {
            let brightness = Math.sin(time * 0.004 + i) * 0.5 + 0.5;
            let starSize = 1 + brightness * 2;
            
            // Étoile brillante
            ctx.fillStyle = `rgba(255, 220, 180, ${brightness * 0.8})`;
            ctx.beginPath();
            ctx.arc(px, py, starSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Halo autour de l'étoile
            ctx.globalAlpha = brightness * 0.3;
            ctx.fillStyle = `rgba(200, 150, 100, ${brightness * 0.4})`;
            ctx.beginPath();
            ctx.arc(px, py, starSize * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.9;
        }
    }
    
    // Vortex spiralé liquide (style Stargate mais adapté)
    for (let layer = 0; layer < 4; layer++) {
        ctx.globalAlpha = 0.15 - layer * 0.02;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.12) {
            for (let radius = 20; radius < maxRadius * 0.9; radius += 18) {
                let rotationSpeed = (time * 0.0003) + (layer * 0.2);
                let waveOffset = Math.sin(radius * 0.015 + time * 0.001 + layer) * 8;
                let spiralAngle = angle + rotationSpeed + (radius * 0.003);
                
                let px = centerX + Math.cos(spiralAngle) * (radius + waveOffset);
                let py = centerY + Math.sin(spiralAngle) * (radius + waveOffset);
                
                if (px >= x && px <= x + width && py >= y && py <= y + height) {
                    // Couleurs qui évoluent du centre vers l'extérieur
                    let distanceFromCenter = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2) / maxRadius;
                    
                    if (distanceFromCenter < 0.3) {
                        // Centre : tons violets/bleus mystiques
                        ctx.fillStyle = `rgba(60, 30, 120, ${0.4 - layer * 0.08})`;
                    } else if (distanceFromCenter < 0.6) {
                        // Milieu : transition violet-rouge
                        ctx.fillStyle = `rgba(80, 40, 60, ${0.3 - layer * 0.06})`;
                    } else {
                        // Extérieur : tons rouges/orangés
                        ctx.fillStyle = `rgba(120, 60, 30, ${0.25 - layer * 0.05})`;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 3 - layer * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Effet de profondeur central (trou noir cosmique)
    ctx.globalAlpha = 0.6;
    let voidGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.3);
    voidGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    voidGradient.addColorStop(0.7, 'rgba(10, 5, 20, 0.8)');
    voidGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = voidGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Affichage du décor du jeu dans le canevas
window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const frameHoverArea = document.getElementById('frameHoverArea');

    // Variables pour le contrôle du vortex
    let isHovering = false;

    // Gestion des événements de survol sur la zone HTML
    if (frameHoverArea) {
        frameHoverArea.addEventListener('mouseenter', function() {
            isHovering = true;
        });

        frameHoverArea.addEventListener('mouseleave', function() {
            isHovering = false;
        });
    }

    // Utiliser lemur.png comme fond du jeu
    const background = new Image();
    background.src = '../images/illustration/lemur.png';
    background.onload = function() {
        // Préparer l'image du cadre
        const cadre = new Image();
        cadre.src = '../images/illustration/cadre.png';

        // Position du cadre (calculée une seule fois)
        const cadreWidth = 220;
        const cadreHeight = 320;
        const cadreX = (canvas.width - cadreWidth) / 2;
        const cadreY = (canvas.height - cadreHeight) / 2 - 80;

        function drawScene(time) {
            // Dessin du fond
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(background, offsetX, offsetY, drawWidth, drawHeight);

            // Nuit : filtre bleu foncé
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = '#0a1330';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Lueur diffuse sur les bords (torches hors champ)
            let gradLeft = ctx.createLinearGradient(0, 0, 200, 0);
            gradLeft.addColorStop(0, 'rgba(255,220,120,0.18)'); // jaune clair atténué
            gradLeft.addColorStop(0.4, 'rgba(255,180,60,0.10)'); // reflet orangé atténué
            gradLeft.addColorStop(0.7, 'rgba(255,140,40,0.05)'); // reflet orangé plus foncé atténué
            gradLeft.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.7 + Math.sin(time/400)*0.08;
            ctx.fillStyle = gradLeft;
            ctx.fillRect(0, 0, 200, canvas.height);
            ctx.restore();

            let gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width-200, 0);
            gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width-200, 0);
            gradRight.addColorStop(0, 'rgba(255,220,120,0.18)'); // jaune clair atténué
            gradRight.addColorStop(0.4, 'rgba(255,180,60,0.10)'); // reflet orangé atténué
            gradRight.addColorStop(0.7, 'rgba(255,140,40,0.05)'); // reflet orangé plus foncé atténué
            gradRight.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.7 + Math.cos(time/400)*0.08;
            ctx.fillStyle = gradRight;
            ctx.fillRect(canvas.width-200, 0, 200, canvas.height);
            ctx.restore();

            let gradTop = ctx.createLinearGradient(0, 0, 0, 160);
            gradTop.addColorStop(0, 'rgba(255,220,120,0.13)');
            gradTop.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(time/600)*0.05;
            ctx.fillStyle = gradTop;
            ctx.fillRect(0, 0, canvas.width, 160);
            ctx.restore();

            let gradBottom = ctx.createLinearGradient(0, canvas.height, 0, canvas.height-160);
            gradBottom.addColorStop(0, 'rgba(255,220,120,0.13)');
            gradBottom.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.cos(time/600)*0.05;
            ctx.fillStyle = gradBottom;
            ctx.fillRect(0, canvas.height-160, canvas.width, 160);
            ctx.restore();

            // Afficher le cadre au centre du mur
            if (cadre.complete && cadre.naturalWidth > 0) {
                // Dessiner d'abord le cadre
                ctx.drawImage(cadre, cadreX, cadreY, cadreWidth, cadreHeight);
                
                // Afficher un fond noir à l'intérieur du cadre par défaut
                const marginX = 20;
                const marginY = 30;
                const innerX = cadreX + marginX;
                const innerY = cadreY + marginY;
                const innerWidth = cadreWidth - (marginX * 2);
                const innerHeight = cadreHeight - (marginY * 2);
                
                if (!isHovering) {
                    // Fond noir simple quand on ne survole pas
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
                } else {
                    // L'effet Stargate à l'intérieur du cadre seulement si on survole
                    drawBlackLiquidSurface(ctx, innerX, innerY, innerWidth, innerHeight, time);
                }
                
                // TEST TEMPORAIRE : Afficher le vortex en permanence pour tester
                // Décommentez la ligne suivante pour tester si le vortex fonctionne
                // drawBlackLiquidSurface(ctx, innerX, innerY, innerWidth, innerHeight, time);
            }
        }

        // Calcul du ratio de l'image
        const imgRatio = background.width / background.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        let scale = Math.max(canvas.width / background.width, canvas.height / background.height);
        drawWidth = background.width * scale;
        drawHeight = background.height * scale;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;

        // Animation
        function animate(time) {
            drawScene(time);
            requestAnimationFrame(animate);
        }
        animate(0);
    };
};

// ========================================
// GESTION DU FORMULAIRE DE CRÉATION DE PERSONNAGE
// ========================================

// Descriptions des classes
const classDescriptions = {
    agent: "Agent du Gouvernement : Enquêteur expérimenté travaillant pour les autorités. Spécialisé dans l'investigation, l'infiltration et les techniques de combat moderne. Possède des contacts dans l'administration et un accès privilégié aux informations officielles.",
    initie: "Initié : Personne ayant découvert les mystères cachés du monde. Possède des connaissances occultes et ésotériques, capable de déchiffrer des symboles anciens et de comprendre les phénomènes paranormaux. Sa curiosité l'a mené aux frontières de la réalité.",
    sorcier: "Sorcier : Maître des arts magiques et des forces surnaturelles. Capable de lancer des sorts, de créer des potions et d'invoquer des entités mystiques. Son pouvoir provient d'années d'étude des grimoires anciens et de pratique des rituels interdits.",
    citoyen: "Citoyen : Personne ordinaire prise dans des événements extraordinaires. Compensée sa normalité par sa débrouillardise, son courage et sa capacité d'adaptation. Souvent sous-estimé, mais capable de surprendre par son ingéniosité et sa détermination."
};

// Types de personnage par classe
const characterTypes = {
    agent: {
        soldat: "Soldat : Combattant professionnel formé aux techniques militaires modernes. Expert en armement, tactiques de combat et opérations spéciales.",
        archeologue: "Archéologue : Spécialiste de l'étude des civilisations anciennes. Capable de déchiffrer des inscriptions antiques et de naviguer dans des sites historiques dangereux.",
        medecin: "Médecin : Professionnel de la santé formé aux techniques médicales avancées. Indispensable pour soigner les blessures et analyser les phénomènes biologiques étranges.",
        ingenieur: "Ingénieur : Expert technique capable de concevoir, réparer et améliorer des équipements complexes. Spécialisé dans la résolution de problèmes technologiques."
    },
    initie: {
        exorciste: "Exorciste : Spécialiste de la lutte contre les entités démoniaques et les possessions. Maîtrise les rituels de purification et de bannissement.",
        tueur_monstre: "Tueur de Monstre : Chasseur expérimenté spécialisé dans l'élimination des créatures surnaturelles. Expert en combat rapproché et pièges.",
        chasseur_fantome: "Chasseur de Fantôme : Investigateur du paranormal spécialisé dans la communication avec les esprits et leur apaisement ou bannissement."
    },
    sorcier: {
        necromancien: "Nécromancien : Maître des arts de la mort et de la non-vie. Capable de communiquer avec les morts et de manipuler l'énergie nécrotique.",
        druide: "Druide : Gardien de la nature et maître des éléments naturels. Capable de contrôler les plantes, les animaux et les phénomènes météorologiques.",
        chaman: "Chaman : Intermédiaire entre le monde physique et spirituel. Maîtrise la communication avec les esprits et les rituels ancestraux.",
        alchimiste: "Alchimiste : Savant mystique spécialisé dans la transformation de la matière. Expert en potions, transmutations et sciences occultes.",
        enchanteur: "Enchanteur : Maître de la magie d'enchantement et d'illusion. Capable de charmer les esprits et de créer des objets magiques.",
        occultiste: "Occultiste : Érudit des sciences cachées et des mystères interdits. Possède une vaste connaissance des rituels et des entités extraplanaires.",
        elementaliste: "Élémentaliste : Sorcier spécialisé dans la manipulation des éléments fondamentaux : feu, eau, air et terre.",
        thaumaturge: "Thaumaturge : Praticien de la magie divine et des miracles. Capable de canaliser des énergies sacrées pour guérir ou détruire.",
        demonologue: "Démonologue : Expert en invocation et contrôle des démons. Maîtrise les pactes infernaux et les rituels de summoning."
    },
    citoyen: {
        hacker: "Hacker : Expert en informatique et piratage. Capable d'infiltrer des systèmes sécurisés et de manipuler les technologies modernes.",
        dissident: "Dissident : Rebelle et activiste luttant contre l'autorité établie. Expert en infiltration sociale et résistance organisée.",
        ouvrier: "Ouvrier : Travailleur manuel expérimenté. Possède une connaissance pratique des outils et des techniques industrielles.",
        fonctionnaire: "Fonctionnaire : Employé de l'administration publique. Possède une connaissance approfondie des rouages bureaucratiques et légaux.",
        bourgeois: "Bourgeois : Membre de la classe moyenne aisée. Dispose de ressources financières et de contacts dans les milieux d'affaires.",
        lobby: "Lobbyiste : Influenceur professionnel et négociateur. Expert en manipulation politique et relations publiques."
    }
};

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du jeu
    const frameHoverArea = document.getElementById('frameHoverArea');
    const characterModal = document.getElementById('characterFormModal');
    const characterForm = document.getElementById('characterForm');
    const characterClass = document.getElementById('characterClass');
    const characterType = document.getElementById('characterType');
    const classDescription = document.getElementById('classDescription');
    const typeDescription = document.getElementById('typeDescription');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    // Éléments d'authentification
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const cancelAuthBtn = document.getElementById('cancelAuthBtn');
    
    let currentStep = 1;
    
    // Ouvrir le formulaire quand on clique sur le tableau
    frameHoverArea.addEventListener('click', function() {
        // Vérifier si l'utilisateur est connecté
        if (!window.authManager.requireAuth()) {
            return; // L'utilisateur sera redirigé vers la connexion
        }
        showCharacterForm();
    });
    
    // === ÉVÉNEMENTS D'AUTHENTIFICATION ===
    
    // Boutons de connexion/inscription
    if (loginBtn) loginBtn.addEventListener('click', () => window.authManager.openAuthModal('login'));
    if (signupBtn) signupBtn.addEventListener('click', () => window.authManager.openAuthModal('signup'));
    if (logoutBtn) logoutBtn.addEventListener('click', () => window.authManager.signOut());
    
    // Fermer le modal d'auth
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            window.authManager.closeAuthModal();
        });
    }
    
    if (cancelAuthBtn) {
        cancelAuthBtn.addEventListener('click', () => {
            window.authManager.closeAuthModal();
        });
    }
    
    // Fermer le modal en cliquant en dehors
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                window.authManager.closeAuthModal();
            }
        });
    }
    
    // Formulaire d'authentification
    authForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const authTitle = document.getElementById('authTitle').textContent;
        
        if (authTitle.includes('S\'inscrire')) {
            // Première étape de l'inscription
            const result = await window.authManager.validateRegistrationStep1(email, password, firstName);
            if (result.success) {
                // Passer au formulaire de création de personnage
                window.authManager.closeAuthModal();
                showCharacterForm();
                window.authManager.showMessage('✅ Étape 1 validée ! Créez maintenant votre personnage.', 'success');
            } else {
                window.authManager.showMessage(`❌ ${result.error}`, 'error');
            }
        } else {
            // Connexion normale
            await window.authManager.signIn(email, password);
        }
    });
    
    // === ÉVÉNEMENTS DE CRÉATION DE PERSONNAGE ===
    
    // Fermer le formulaire
    closeFormBtn.addEventListener('click', hideCharacterForm);
    cancelBtn.addEventListener('click', hideCharacterForm);
    
    // Navigation entre les étapes
    nextStepBtn.addEventListener('click', function() {
        if (validateStep1()) {
            goToStep(2);
        }
    });
    
    prevStepBtn.addEventListener('click', function() {
        goToStep(1);
    });
    
    // Fermer en cliquant en dehors du formulaire
    characterModal.addEventListener('click', function(e) {
        if (e.target === characterModal) {
            hideCharacterForm();
        }
    });
    
    // Mettre à jour la description quand on change de classe
    characterClass.addEventListener('change', function() {
        updateClassDescription();
        updateCharacterTypes();
    });
    
    // Mettre à jour la description quand on change de type
    characterType.addEventListener('change', function() {
        updateTypeDescription();
    });
    
    // Gérer la soumission du formulaire
    characterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleCharacterCreation();
    });
    
    // Fonction pour afficher le formulaire
    function showCharacterForm() {
        characterModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll
        goToStep(1); // Toujours commencer à l'étape 1
    }
    
    // Fonction pour masquer le formulaire
    function hideCharacterForm() {
        characterModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Rétablir le scroll
        resetForm();
        goToStep(1); // Revenir à l'étape 1
    }
    
    // Navigation entre les étapes
    function goToStep(stepNumber) {
        currentStep = stepNumber;
        
        // Masquer toutes les étapes
        step1.classList.remove('active');
        step2.classList.remove('active');
        
        // Afficher l'étape courante
        if (stepNumber === 1) {
            step1.classList.add('active');
        } else if (stepNumber === 2) {
            step2.classList.add('active');
        }
    }
    
    // Validation de l'étape 1
    function validateStep1() {
        const firstName = document.getElementById('characterFirstName').value.trim();
        const lastName = document.getElementById('characterLastName').value.trim();
        const selectedClass = characterClass.value;
        
        if (!firstName || !lastName || !selectedClass) {
            alert('Veuillez remplir tous les champs de cette étape.');
            return false;
        }
        return true;
    }
    
    // Mettre à jour la liste des types selon la classe choisie
    function updateCharacterTypes() {
        const selectedClass = characterClass.value;
        const typeSelect = characterType;
        
        // Vider la liste des types
        typeSelect.innerHTML = '<option value="">-- Choisissez un type --</option>';
        
        if (selectedClass && characterTypes[selectedClass]) {
            const types = characterTypes[selectedClass];
            for (const [key, description] of Object.entries(types)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = getTypeDisplayName(key);
                typeSelect.appendChild(option);
            }
        }
        
        // Réinitialiser la description de type
        updateTypeDescription();
    }
    
    // Mettre à jour la description de classe
    function updateClassDescription() {
        const selectedClass = characterClass.value;
        const descriptionElement = classDescription.querySelector('p');
        
        if (selectedClass && classDescriptions[selectedClass]) {
            descriptionElement.textContent = classDescriptions[selectedClass];
            classDescription.style.background = 'rgba(34, 109, 84, 0.1)';
        } else {
            descriptionElement.textContent = 'Sélectionnez une classe pour voir sa description.';
            classDescription.style.background = 'rgba(34, 109, 84, 0.05)';
        }
    }
    
    // Mettre à jour la description de type
    function updateTypeDescription() {
        const selectedClass = characterClass.value;
        const selectedType = characterType.value;
        const descriptionElement = typeDescription.querySelector('p');
        
        if (selectedClass && selectedType && characterTypes[selectedClass] && characterTypes[selectedClass][selectedType]) {
            descriptionElement.textContent = characterTypes[selectedClass][selectedType];
            typeDescription.style.background = 'rgba(34, 109, 84, 0.1)';
        } else {
            descriptionElement.textContent = 'Sélectionnez un type pour voir sa description.';
            typeDescription.style.background = 'rgba(34, 109, 84, 0.05)';
        }
    }
    
    // Gérer la création du personnage
    async function handleCharacterCreation() {
        try {
            const characterFirstName = document.getElementById('characterFirstName').value.trim();
            const characterLastName = document.getElementById('characterLastName').value.trim();
            const selectedClass = characterClass.value;
            const selectedType = characterType.value;
            
            if (!characterFirstName || !characterLastName || !selectedClass || !selectedType) {
                alert('Veuillez remplir tous les champs.');
                return;
            }
            
            // Créer l'objet personnage
            const characterData = {
                characterFirstName: characterFirstName,
                characterLastName: characterLastName,
                characterClass: selectedClass,
                characterType: selectedType
            };
            
            // Si nous sommes dans un processus d'inscription, finaliser l'inscription
            if (window.authManager.tempRegistrationData) {
                const result = await window.authManager.finalizeRegistration(characterData);
                
                if (result.success) {
                    // Le modal sera fermé par finalizeRegistration
                } else {
                    window.authManager.showMessage(`❌ Erreur lors de la finalisation: ${result.error}`, 'error');
                }
                return;
            }
            
            // Sinon, créer un personnage normalement (utilisateur déjà connecté)
            if (!window.authManager.requireAuth()) {
                return;
            }
            
            const character = {
                first_name: characterFirstName,
                last_name: characterLastName,
                full_name: `${characterFirstName} ${characterLastName}`,
                character_class: selectedClass,
                character_type: selectedType,
                class_display_name: getClassDisplayName(selectedClass),
                type_display_name: getTypeDisplayName(selectedType)
            };
            
            // Sauvegarder avec Supabase ou localStorage
            const savedCharacter = await window.characterManager.saveCharacterSafely(character);
            
            // Afficher un message de confirmation
            alert(`✨ ${character.full_name} rejoint l'aventure !\n${character.class_display_name} - ${character.type_display_name}`);
            
            // Fermer le formulaire
            hideCharacterForm();
            
        } catch (error) {
            console.error('Erreur création personnage:', error);
            alert('❌ Erreur lors de la création du personnage');
        }
    }
    
    // Obtenir le nom d'affichage de la classe
    function getClassDisplayName(classKey) {
        const classNames = {
            agent: 'Agent du Gouvernement',
            initie: 'Initié',
            sorcier: 'Sorcier',
            citoyen: 'Citoyen'
        };
        return classNames[classKey] || classKey;
    }
    
    // Obtenir le nom d'affichage du type
    function getTypeDisplayName(typeKey) {
        const typeNames = {
            // Agents
            soldat: 'Soldat',
            archeologue: 'Archéologue',
            medecin: 'Médecin',
            ingenieur: 'Ingénieur',
            // Initiés
            exorciste: 'Exorciste',
            tueur_monstre: 'Tueur de Monstre',
            chasseur_fantome: 'Chasseur de Fantôme',
            // Sorciers
            necromancien: 'Nécromancien',
            druide: 'Druide',
            chaman: 'Chaman',
            alchimiste: 'Alchimiste',
            enchanteur: 'Enchanteur',
            occultiste: 'Occultiste',
            elementaliste: 'Élémentaliste',
            thaumaturge: 'Thaumaturge',
            demonologue: 'Démonologue',
            // Citoyens
            hacker: 'Hacker',
            dissident: 'Dissident',
            ouvrier: 'Ouvrier',
            fonctionnaire: 'Fonctionnaire',
            bourgeois: 'Bourgeois',
            lobby: 'Lobbyiste'
        };
        return typeNames[typeKey] || typeKey;
    }
    
    // Réinitialiser le formulaire
    function resetForm() {
        characterForm.reset();
        updateClassDescription();
        updateTypeDescription();
        currentStep = 1;
    }
    
    // Gestion des touches du clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && characterModal.classList.contains('show')) {
            hideCharacterForm();
        }
    });
});
