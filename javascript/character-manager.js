class CharacterSheetManager {
    constructor() {
        this.character = {
            name: '',
            type: '',
            class: '',
            deity: ''
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
            console.log('Zone tableau cliquée, ouverture fiche personnage');
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

        // Mise à jour des classes et divinités selon le type choisi
        typeSelect.addEventListener('change', () => this.updateClassOptions());
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
        fileInput.onchange = (event) => this.handleFileLoad(event);
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
                    name: characterData.name || '',
                    type: characterData.type || '',
                    class: characterData.class || '',
                    deity: characterData.deity || ''
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
        const requiredProps = ['name', 'type', 'class'];
        return requiredProps.every(prop => data.hasOwnProperty(prop));
    }

    newCharacter() {
        if (confirm('Créer un nouveau personnage ? Les données actuelles seront perdues.')) {
            this.character = {
                name: '',
                type: '',
                class: '',
                deity: ''
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
    }

    populateForm() {
        document.getElementById('char-name').value = this.character.name;
        document.getElementById('char-type').value = this.character.type;
        this.updateClassOptions();
        setTimeout(() => {
            document.getElementById('char-class').value = this.character.class;
            document.getElementById('char-deity').value = this.character.deity;
        }, 50);
    }

    updateClassOptions() {
        const typeSelect = document.getElementById('char-type');
        const classSelect = document.getElementById('char-class');
        const deitySelect = document.getElementById('char-deity');
        const selectedType = typeSelect.value;

        classSelect.innerHTML = '';
        deitySelect.innerHTML = '';

        if (selectedType && this.universe[selectedType]) {
            classSelect.disabled = false;
            deitySelect.disabled = false;
            this.universe[selectedType].classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.value;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
            this.universe[selectedType].deities.forEach(deity => {
                const option = document.createElement('option');
                option.value = deity.value;
                option.textContent = deity.name;
                deitySelect.appendChild(option);
            });
        } else {
            classSelect.disabled = true;
            deitySelect.disabled = true;
            classSelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
            deitySelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});
