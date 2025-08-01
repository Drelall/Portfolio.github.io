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
                ctx.drawImage(cadre, x, y, cadreWidth, cadreHeight);
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
