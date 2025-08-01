// Fonction pour dessiner une surface liquide type Stargate
function drawBlackLiquidSurface(ctx, x, y, width, height, time) {
    // Centre de l'effet
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxRadius = Math.max(width, height) / 2; // Utiliser le max pour couvrir tout le rectangle
    
    // Base liquide noire profonde qui couvre tout le rectangle
    ctx.fillStyle = '#000008';
    ctx.fillRect(x, y, width, height);
    
    // Effet de vortex avec ondulations radiales
    ctx.save();
    
    // Créer plusieurs couches d'ondulations sur toute la surface
    for (let layer = 0; layer < 6; layer++) {
        ctx.globalAlpha = 0.4 - layer * 0.05;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
            for (let radius = 5; radius < maxRadius * 1.2; radius += 12) { // Augmenter la portée
                // Calcul de la position avec rotation et ondulation (vitesse réduite)
                let rotationSpeed = (time * 0.0005) + (layer * 0.3); // Réduit de 0.001 à 0.0005
                let waveOffset = Math.sin(radius * 0.02 + time * 0.0015 + layer) * 10; // Réduit de 0.003 à 0.0015
                let spiralAngle = angle + rotationSpeed + (radius * 0.005); // Réduit de 0.008 à 0.005
                
                let px = centerX + Math.cos(spiralAngle) * (radius + waveOffset);
                let py = centerY + Math.sin(spiralAngle) * (radius + waveOffset);
                
                // Vérifier que les points restent dans le rectangle
                if (px >= x && px <= x + width && py >= y && py <= y + height) {
                    // Variation des couleurs selon la profondeur (vitesse réduite)
                    let intensity = Math.sin(time * 0.001 + radius * 0.01) * 0.5 + 0.5; // Réduit de 0.002 à 0.001
                    let blue = Math.floor(25 + intensity * 120);
                    let silver = Math.floor(intensity * 180);
                    
                    ctx.fillStyle = `rgba(${silver}, ${silver + 30}, ${blue + silver}, ${0.7 - layer * 0.1})`;
                    
                    // Dessiner les "rides" liquides
                    ctx.beginPath();
                    ctx.arc(px, py, 4 - layer * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Ondulations de surface principale couvrant tout le rectangle
    ctx.globalAlpha = 0.6;
    let surfaceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    surfaceGradient.addColorStop(0, 'rgba(180, 220, 255, 0.5)');
    surfaceGradient.addColorStop(0.3, 'rgba(80, 140, 220, 0.4)');
    surfaceGradient.addColorStop(0.6, 'rgba(40, 80, 150, 0.3)');
    surfaceGradient.addColorStop(1, 'rgba(10, 20, 50, 0.2)');
    
    ctx.fillStyle = surfaceGradient;
    ctx.fillRect(x, y, width, height); // Remplir tout le rectangle
    
    ctx.restore();
}

// Affichage du décor du jeu dans le canevas
window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Utiliser tableau.jpg comme fond du jeu
    const background = new Image();
    background.src = '../images/illustration/lemur.png';
    background.onload = function() {
        // Animation lumineuse façon torches
        // Préparer l'image du cadre
        const cadre = new Image();
        cadre.src = '../images/illustration/cadre.png';

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
                const cadreWidth = 220;
                const cadreHeight = 320;
                const x = (canvas.width - cadreWidth) / 2;
                const y = (canvas.height - cadreHeight) / 2 - 80; // déplacement vers le haut
                
                // Dessiner d'abord le cadre
                ctx.drawImage(cadre, x, y, cadreWidth, cadreHeight);
                
                // Puis l'effet Stargate à l'intérieur du cadre (avec marge pour rester visible)
                const marginX = 20; // Marge pour éviter que l'effet soit caché par le cadre
                const marginY = 30;
                drawBlackLiquidSurface(ctx, x + marginX, y + marginY, cadreWidth - (marginX * 2), cadreHeight - (marginY * 2), time);
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
