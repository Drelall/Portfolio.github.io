class CharacterSheetManager {
    constructor() {
        this.character = {
            name: '',
            type: '',
            class: '',
            deity: '',
            level: 1,
            stats: {
                force: 10,
                dexterite: 10,
                constitution: 10,
                intelligence: 10,
                sagesse: 10,
                charisme: 10
            },
            skills: [],
            equipment: [],
            background: '',
            description: ''
        };

        this.universe = {
            agent: {
                name: 'Agent du Gouvernement',
                classes: [
                    { value: 'soldat', name: 'Soldat' },
                    { value: 'archeologue', name: 'Archéologue' },
                    { value: 'medecin', name: 'Médecin' },
                    { value: 'ingenieur', name: 'Ingénieur' }
                ],
                deities: [
                    { value: 'apophis', name: 'Apophis' },
                    { value: 'thor', name: 'Thor' }
                ]
            },
            initie: {
                name: 'Initié',
                classes: [
                    { value: 'exorciste', name: 'Exorciste' },
                    { value: 'tueur_monstre', name: 'Tueur de Monstre' },
                    { value: 'chasseur_fantome', name: 'Chasseur de Fantôme' }
                ],
                deities: [
                    { value: 'magicien_oz', name: 'Magicien d\'Oz' }
                ]
            },
            sorcier: {
                name: 'Sorcier',
                classes: [
                    { value: 'necromancien', name: 'Nécromancien' },
                    { value: 'druide', name: 'Druide' },
                    { value: 'chaman', name: 'Chaman' },
                    { value: 'alchimiste', name: 'Alchimiste' },
                    { value: 'enchanteur', name: 'Enchanteur' },
                    { value: 'occultiste', name: 'Occultiste' },
                    { value: 'elementaliste', name: 'Élémentaliste' },
                    { value: 'thaumaturge', name: 'Thaumaturge' },
                    { value: 'demonologue', name: 'Démonologue' }
                ],
                deities: [
                    { value: 'phenix', name: 'Le Phénix' },
                    { value: 'dragons', name: 'Les Dragons' },
                    { value: 'elementaires', name: 'Les Élémentaires' },
                    { value: 'obscurium', name: 'L\'Obscurium' }
                ]
            },
            citoyen: {
                name: 'Citoyen',
                classes: [
                    { value: 'hacker', name: 'Hacker' },
                    { value: 'lowtech', name: 'Lowtech' }
                ],
                deities: [
                    { value: 'lapin_blanc', name: 'Le Lapin Blanc' },
                    { value: 'grand_architecte', name: 'Le Grand Architecte' }
                ]
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const modal = document.getElementById('characterModal');
        const closeBtn = document.getElementById('closeModal');
        const frameHoverArea = document.getElementById('frameHoverArea');
        const fileInput = document.getElementById('fileInput');
        const typeSelect = document.getElementById('char-type');
        const classSelect = document.getElementById('char-class');
        const deitySelect = document.getElementById('char-deity');

        frameHoverArea.addEventListener('click', () => {
            this.openModal();
        });

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });

        document.getElementById('saveCharacter').addEventListener('click', () => this.saveCharacterToFile());
        document.getElementById('loadCharacter').addEventListener('click', () => this.loadCharacterFromFile());
        document.getElementById('newCharacter').addEventListener('click', () => this.newCharacter());
        document.getElementById('rollStats').addEventListener('click', () => this.rollStats());

        fileInput.addEventListener('change', (e) => this.handleFileLoad(e));

        typeSelect.addEventListener('change', () => this.updateClassOptions());
        classSelect.addEventListener('change', () => this.updateDeityOptions());

        document.getElementById('add-skill').addEventListener('click', () => this.addSkill());
        document.getElementById('skill-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });

        document.getElementById('add-equipment').addEventListener('click', () => this.addEquipment());
        document.getElementById('equipment-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addEquipment();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    rollStats() {
        const statInputs = ['force', 'dexterite', 'constitution', 'intelligence', 'sagesse', 'charisme'];
        statInputs.forEach(stat => {
            const rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
            rolls.sort((a, b) => b - a);
            const result = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
            const input = document.getElementById(`stat-${stat}`);
            if (input) {
                input.value = result;
            }
        });
    }

    addSkill() {
        const input = document.getElementById('skill-input');
        const skillName = input.value.trim();
        if (skillName && !this.character.skills.includes(skillName)) {
            this.character.skills.push(skillName);
            this.updateSkillsList();
            input.value = '';
        }
    }

    updateSkillsList() {
        const container = document.getElementById('skills-list');
        container.innerHTML = this.character.skills.map((skill, index) => `
            <div class="skill-item">
                <span>${skill}</span>
                <button type="button" class="remove-btn" onclick="characterSheetManager.removeSkill(${index})">×</button>
            </div>
        `).join('');
    }

    removeSkill(index) {
        this.character.skills.splice(index, 1);
        this.updateSkillsList();
    }

    addEquipment() {
        const input = document.getElementById('equipment-input');
        const equipmentName = input.value.trim();
        if (equipmentName && !this.character.equipment.includes(equipmentName)) {
            this.character.equipment.push(equipmentName);
            this.updateEquipmentList();
            input.value = '';
        }
    }

    updateEquipmentList() {
        const container = document.getElementById('equipment-list');
        container.innerHTML = this.character.equipment.map((item, index) => `
            <div class="equipment-item">
                <span>${item}</span>
                <button type="button" class="remove-btn" onclick="characterSheetManager.removeEquipment(${index})">×</button>
            </div>
        `).join('');
    }

    removeEquipment(index) {
        this.character.equipment.splice(index, 1);
        this.updateEquipmentList();
    }

    updateClassOptions() {
        const typeSelect = document.getElementById('char-type');
        const classSelect = document.getElementById('char-class');
        const deitySelect = document.getElementById('char-deity');
        const selectedType = typeSelect.value;
        classSelect.innerHTML = '<option value="">Choisir une classe</option>';
        deitySelect.innerHTML = '<option value="">Choisir une divinité</option>';
        if (selectedType && this.universe[selectedType]) {
            classSelect.disabled = false;
            this.universe[selectedType].classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.value;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
            deitySelect.disabled = false;
            this.universe[selectedType].deities.forEach(deity => {
                const option = document.createElement('option');
                option.value = deity.value;
                option.textContent = deity.name;
                deitySelect.appendChild(option);
            });
        } else {
            classSelect.disabled = true;
            deitySelect.disabled = true;
        }
    }

    updateDeityOptions() {
        // Les divinités sont déjà filtrées par type
    }

    saveCharacterToFile() {
        this.updateCharacterFromForm();
        const characterName = this.character.name || 'personnage_sans_nom';
        const safeFileName = characterName.replace(/[^a-z0-9\s]/gi, '_').toLowerCase();
        const fileName = `${safeFileName}_fiche_rpg.json`;
        const characterData = {
            ...this.character,
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                application: 'Saga RPG Character Sheet'
            }
        };
        const dataStr = JSON.stringify(characterData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
    }

    loadCharacterFromFile() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }

    async processCharacterFile(file) {
        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('Veuillez sélectionner un fichier JSON valide.');
            return;
        }
        try {
            const text = await file.text();
            const characterData = JSON.parse(text);
            if (this.validateCharacterData(characterData)) {
                this.character = {
                    ...this.character,
                    ...characterData,
                    stats: { ...this.character.stats, ...characterData.stats },
                    skills: characterData.skills || [],
                    equipment: characterData.equipment || []
                };
                this.populateForm();
            } else {
                alert('Le fichier ne contient pas de données de personnage valides.');
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            alert('Erreur lors de la lecture du fichier.');
        }
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.processCharacterFile(file);
        event.target.value = '';
    }

    validateCharacterData(data) {
        if (!data || typeof data !== 'object') return false;
        const requiredProps = ['name', 'type', 'class', 'level', 'stats'];
        const hasRequiredProps = requiredProps.some(prop => data.hasOwnProperty(prop));
        if (data.stats) {
            const requiredStats = ['force', 'dexterite', 'constitution', 'intelligence', 'sagesse', 'charisme'];
            const hasValidStats = requiredStats.some(stat => data.stats.hasOwnProperty(stat));
            return hasRequiredProps && hasValidStats;
        }
        return hasRequiredProps;
    }

    newCharacter() {
        if (confirm('Créer un nouveau personnage ? Les données actuelles seront perdues.')) {
            this.character = {
                name: '',
                type: '',
                class: '',
                deity: '',
                level: 1,
                stats: { force: 10, dexterite: 10, constitution: 10, intelligence: 10, sagesse: 10, charisme: 10 },
                skills: [],
                equipment: [],
                background: '',
                description: ''
            };
            this.populateForm();
        }
    }

    updateCharacterFromForm() {
        const form = document.getElementById('characterForm');
        const formData = new FormData(form);
        this.character.name = formData.get('name') || '';
        this.character.type = formData.get('type') || '';
        this.character.class = formData.get('class') || '';
        this.character.deity = formData.get('deity') || '';
        this.character.level = parseInt(formData.get('level')) || 1;
        this.character.background = formData.get('background') || '';
        this.character.description = formData.get('description') || '';
        Object.keys(this.character.stats).forEach(stat => {
            this.character.stats[stat] = parseInt(formData.get(stat)) || 10;
        });
    }

    populateForm() {
        document.getElementById('char-name').value = this.character.name;
        document.getElementById('char-level').value = this.character.level;
        document.getElementById('char-type').value = this.character.type;
        document.getElementById('char-background').value = this.character.background;
        document.getElementById('char-description').value = this.character.description;
        this.updateClassOptions();
        setTimeout(() => {
            document.getElementById('char-class').value = this.character.class;
            document.getElementById('char-deity').value = this.character.deity;
        }, 50);
        Object.keys(this.character.stats).forEach(stat => {
            const input = document.getElementById(`stat-${stat}`);
            if (input) {
                input.value = this.character.stats[stat];
            }
        });
        this.updateSkillsList();
        this.updateEquipmentList();
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});
        document.getElementById('char-name').value = this.character.name;
        document.getElementById('char-level').value = this.character.level;
        document.getElementById('char-type').value = this.character.type;
        document.getElementById('char-background').value = this.character.background;
        document.getElementById('char-description').value = this.character.description;
        this.updateClassOptions();
        setTimeout(() => {
            document.getElementById('char-class').value = this.character.class;
            document.getElementById('char-deity').value = this.character.deity;
        }, 50);
        Object.keys(this.character.stats).forEach(stat => {
            const input = document.getElementById(`stat-${stat}`);
            if (input) {
                input.value = this.character.stats[stat];
                this.updateStatModifier(input);
            }
        });
        this.updateSkillsList();
        this.updateEquipmentList();
    

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});
