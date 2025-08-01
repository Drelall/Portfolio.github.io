// Animation du logo plume au clic
document.addEventListener('DOMContentLoaded', function() {
    const logoImg = document.querySelector('.logo img');
    
    if (logoImg) {
        logoImg.addEventListener('click', function() {
            // Retirer la classe wiggle si elle existe déjà
            this.classList.remove('wiggle');
            
            // Forcer le reflow pour s'assurer que la classe est bien supprimée
            void this.offsetWidth;
            
            // Ajouter la classe wiggle pour déclencher l'animation
            this.classList.add('wiggle');
            
            // Optionnel : retirer la classe après l'animation pour pouvoir la relancer
            setTimeout(() => {
                this.classList.remove('wiggle');
            }, 600); // 600ms correspond à la durée de l'animation définie dans le CSS
        });
    }
});
