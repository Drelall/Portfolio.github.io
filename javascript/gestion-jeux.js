// Fonction pour ajouter le bouton "Jouer" en bas de la fiche
function ajouterBoutonJouer(ficheElement, callbackJouer) {
    // Créer le bouton
    const boutonJouer = document.createElement('button');
    boutonJouer.textContent = 'Jouer';
    boutonJouer.className = 'btn-jouer'; // Pour le style CSS

    // Ajouter un gestionnaire d'événement si besoin
    if (typeof callbackJouer === 'function') {
        boutonJouer.addEventListener('click', callbackJouer);
    }

    // Cherche le bouton "Sauvegarder" dans la fiche
    const boutonSauvegarder = ficheElement.querySelector('.btn-sauvegarder');
    if (boutonSauvegarder) {
        // Insère le bouton "Jouer" juste après "Sauvegarder"
        boutonSauvegarder.parentNode.insertBefore(boutonJouer, boutonSauvegarder.nextSibling);
    } else {
        // Si pas de bouton "Sauvegarder", ajoute à la fin
        ficheElement.appendChild(boutonJouer);
    }
}

// Exemple d'utilisation :
// Supposons que vous avez une fonction qui affiche la fiche d'un jeu
function afficherFicheJeu(jeu) {
    // ...code pour créer la fiche...
    const ficheElement = document.createElement('div');
    ficheElement.className = 'fiche-jeu';
    // ...ajout du contenu de la fiche...

    // Ajout du bouton jouer en bas
    ajouterBoutonJouer(ficheElement, function() {
        // Action à effectuer quand on clique sur "Jouer"
        alert('Vous avez cliqué sur Jouer pour ' + jeu.nom);
    });

    // ...ajout de la fiche au DOM...
}