document.addEventListener('DOMContentLoaded', function() {
    const logoImg = document.querySelector('.logo img');
    const logoLink = document.querySelector('.logo a');

    if (logoImg) {
        logoImg.addEventListener('click', function(event) {
            console.log('Logo cliqué !'); // Pour débugger

            // Empêcher la redirection si le logo est dans un lien
            if (logoLink) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.classList.remove('wiggle');
            void this.offsetWidth; // force le reflow
            this.classList.add('wiggle');

            // Optionnel : retirer la classe après l'animation pour pouvoir la relancer
            setTimeout(() => {
                this.classList.remove('wiggle');

                // Si c'était dans un lien, rediriger après l'animation
                if (logoLink) {
                    window.location.href = logoLink.href;
                }
            }, 600);
        });
    } else {
        console.log('Logo non trouvé !');
    }
});
