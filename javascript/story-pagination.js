// Pagination pour les pages d'histoire
document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.story-page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    let currentPage = 1;
    const totalPages = pages.length;
    
    // Initialiser l'affichage
    function init() {
        totalPagesSpan.textContent = totalPages;
        showPage(1);
        updateButtons();
    }
    
    // Afficher une page spécifique
    function showPage(pageNumber) {
        // Masquer toutes les pages
        pages.forEach(page => {
            page.classList.remove('active', 'fade-in');
        });
        
        // Afficher la page demandée
        const targetPage = pages[pageNumber - 1];
        if (targetPage) {
            targetPage.classList.add('active', 'fade-in');
            currentPage = pageNumber;
            currentPageSpan.textContent = currentPage;
            
            // Défiler vers le haut de la page
            targetPage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        updateButtons();
    }
    
    // Mettre à jour l'état des boutons
    function updateButtons() {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }
    
    // Navigation avec les boutons
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', function(e) {
        // Vérifier que l'utilisateur n'est pas en train de taper dans un input
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                if (currentPage > 1) {
                    showPage(currentPage - 1);
                }
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                if (currentPage < totalPages) {
                    showPage(currentPage + 1);
                }
                break;
            case 'Home':
                e.preventDefault();
                showPage(1);
                break;
            case 'End':
                e.preventDefault();
                showPage(totalPages);
                break;
        }
    });
    
    // Support pour les gestes tactiles (mobile)
    let startX = 0;
    let endX = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const diffX = startX - endX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0 && currentPage < totalPages) {
                // Swipe vers la gauche -> page suivante
                showPage(currentPage + 1);
            } else if (diffX < 0 && currentPage > 1) {
                // Swipe vers la droite -> page précédente
                showPage(currentPage - 1);
            }
        }
    }
    
    // Initialiser
    init();
});
