document.addEventListener('DOMContentLoaded', function() {
    // Animation du logo
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

    // Mode nuit
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Vérifier si le mode sombre est déjà activé (sauvegardé dans localStorage)
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');

            // Sauvegarder la préférence dans localStorage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // Protection contre le copier-coller
    // Désactiver le clic droit sur les articles
    const articles = document.querySelectorAll('.simple-article');
    articles.forEach(article => {
        article.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });

    // Désactiver les raccourcis clavier de copie
    document.addEventListener('keydown', function(e) {
        // Désactiver Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 83 || e.keyCode === 80)) {
            e.preventDefault();
            return false;
        }
        // Désactiver F12 (outils de développement)
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Désactiver Ctrl+Shift+I (outils de développement)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Désactiver Ctrl+U (voir le code source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // Fonctionnalité du carousel
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.indicator');

    if (carouselTrack && carouselSlides.length > 0) {
        let currentSlide = 0;
        const totalSlides = carouselSlides.length;

        // Fonction pour aller à une slide spécifique
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            const translateX = -slideIndex * 100;
            carouselTrack.style.transform = `translateX(${translateX}%)`;

            // Mettre à jour les indicateurs
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === slideIndex);
            });
        }

        // Fonction pour aller à la slide suivante
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        }

        // Fonction pour aller à la slide précédente
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            goToSlide(currentSlide);
        }

        // Event listeners pour les boutons
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }

        // Event listeners pour les indicateurs
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        // Récupérer le conteneur pour le support tactile
        const carouselContainer = document.querySelector('.carousel-container');

        // Support tactile pour mobile
        let startX = 0;
        let endX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) { // Seuil minimum pour déclencher le swipe
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        });
    }
});
