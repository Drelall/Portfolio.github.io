/* ========================================
   PORTFOLIO JAVASCRIPT - VERSION PROPRE
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // ANIMATION DU LOGO
    // ========================================
    const logoImg = document.querySelector('.logo img');
    const logoLink = document.querySelector('.logo a');

    if (logoImg) {
        logoImg.addEventListener('click', function(event) {
            // Empêcher la redirection si le logo est dans un lien
            if (logoLink) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.classList.remove('wiggle');
            void this.offsetWidth; // force le reflow
            this.classList.add('wiggle');

            // Retirer la classe après l'animation
            setTimeout(() => {
                this.classList.remove('wiggle');
                // Si c'était dans un lien, rediriger après l'animation
                if (logoLink) {
                    window.location.href = logoLink.href;
                }
            }, 600);
        });
    }

    // ========================================
    // MODE SOMBRE
    // ========================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Vérifier si le mode sombre est déjà activé
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            // Sauvegarder la préférence
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // ========================================
    // CAROUSEL
    // ========================================
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
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Event listeners pour les indicateurs
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });

        // Support tactile pour mobile
        const carouselContainer = document.querySelector('.carousel-container');
        let startX = 0;
        let endX = 0;

        if (carouselContainer) {
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

        // Initialiser le carousel
        goToSlide(0);
    }

    // ========================================
    // GESTION DES SOUS-MENUS (Desktop + Mobile/Tablette)
    // ========================================
    const submenuToggles = document.querySelectorAll('.dropdown-submenu-toggle');
    let submenuTimeout;
    
    // Fonction pour détecter si on est sur mobile/tablette
    function isMobileDevice() {
        return window.innerWidth <= 768 || ('ontouchstart' in window);
    }
    
    // Gestion pour desktop avec délais
    submenuToggles.forEach(toggle => {
        const submenu = toggle.closest('.dropdown-submenu');
        const submenuContent = submenu.querySelector('.dropdown-submenu-content');
        
        // Gestion du survol (desktop)
        submenu.addEventListener('mouseenter', function() {
            clearTimeout(submenuTimeout);
            if (!isMobileDevice()) {
                submenuContent.style.opacity = '1';
                submenuContent.style.visibility = 'visible';
                submenuContent.style.transform = 'translateX(0)';
                submenuContent.style.pointerEvents = 'auto';
            }
        });
        
        submenu.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                // Délai avant fermeture pour laisser le temps de naviguer
                submenuTimeout = setTimeout(() => {
                    submenuContent.style.opacity = '0';
                    submenuContent.style.visibility = 'hidden';
                    submenuContent.style.transform = 'translateX(-10px)';
                    submenuContent.style.pointerEvents = 'none';
                }, 300); // 300ms de délai
            }
        });
        
        // Empêcher la fermeture quand on survole le sous-menu lui-même
        submenuContent.addEventListener('mouseenter', function() {
            clearTimeout(submenuTimeout);
        });
        
        submenuContent.addEventListener('mouseleave', function() {
            if (!isMobileDevice()) {
                submenuTimeout = setTimeout(() => {
                    submenuContent.style.opacity = '0';
                    submenuContent.style.visibility = 'hidden';
                    submenuContent.style.transform = 'translateX(-10px)';
                    submenuContent.style.pointerEvents = 'none';
                }, 200); // Délai plus court quand on quitte le sous-menu
            }
        });
        
        // Gestion du clic (mobile/tablette)
        toggle.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                
                // Basculer l'affichage du sous-menu
                if (submenuContent.style.display === 'block') {
                    submenuContent.style.display = 'none';
                } else {
                    submenuContent.style.display = 'block';
                    // S'assurer que le sous-menu est visible sur mobile
                    submenuContent.style.opacity = '1';
                    submenuContent.style.visibility = 'visible';
                    submenuContent.style.transform = 'none';
                    submenuContent.style.pointerEvents = 'auto';
                }
            }
        });
        
        // Gestion des redimensionnements de fenêtre
        window.addEventListener('resize', function() {
            // Réinitialiser les styles lors du changement de taille d'écran
            if (isMobileDevice()) {
                submenuContent.style.opacity = '';
                submenuContent.style.visibility = '';
                submenuContent.style.transform = '';
                submenuContent.style.pointerEvents = '';
            } else {
                submenuContent.style.display = '';
            }
        });
    });

    // ========================================
    // PROTECTION ANTI-COPIE (Optionnel)
    // ========================================
    const articles = document.querySelectorAll('.simple-article, .story-body');
    
    articles.forEach(article => {
        // Désactiver le clic droit
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
});
