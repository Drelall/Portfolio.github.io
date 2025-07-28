// Affichage du décor du jeu dans le canevas
window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Fond pierre gris
    ctx.fillStyle = '#a8a8a8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pierres rectangulaires façon mur massif
    const stoneWidth = 90;
    const stoneHeight = 55;
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += stoneHeight) {
        for (let x = (y/stoneHeight)%2 ? stoneWidth/2 : 0; x < canvas.width; x += stoneWidth) {
            // Couleur de pierre aléatoire
            let r = 160 + Math.floor(Math.random()*30);
            let g = 160 + Math.floor(Math.random()*30);
            let b = 160 + Math.floor(Math.random()*30);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x+2, y+2, stoneWidth-4, stoneHeight-4);
            ctx.strokeStyle = '#888';
            ctx.strokeRect(x+2, y+2, stoneWidth-4, stoneHeight-4);
            // Fissures
            if (Math.random() < 0.15) {
                ctx.beginPath();
                let fx = x + 10 + Math.random() * (stoneWidth-20);
                let fy = y + 10 + Math.random() * (stoneHeight-20);
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.random()*20-10, fy + Math.random()*20-10);
                ctx.strokeStyle = 'rgba(60,60,60,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // Texture pierre (petits points irréguliers)
    for (let i = 0; i < 350; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2 + 0.5,
            0, 2 * Math.PI
        );
        ctx.fillStyle = `rgba(120,120,120,${Math.random() * 0.3 + 0.1})`;
        ctx.fill();
    }

    // Effet de lumière central (halo)
    let grad = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 100,
        canvas.width/2, canvas.height/2, 350
    );
    grad.addColorStop(0, 'rgba(255,255,220,0.13)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ombre haut/bas
    grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(0,0,0,0.22)');
    grad.addColorStop(0.1, 'rgba(0,0,0,0)');
    grad.addColorStop(0.9, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tableaux accrochés (cadres dorés et rouges)
    function drawFrame(x, y, w, h, color) {
        ctx.save();
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
        // "Toile" sombre
        ctx.fillStyle = '#2a1c13';
        ctx.fillRect(x+10, y+10, w-20, h-20);
    }
    // Quelques cadres
    drawFrame(120, 60, 110, 140, '#c9a13b'); // doré
    drawFrame(260, 40, 90, 110, '#b22222'); // rouge
    drawFrame(400, 80, 130, 160, '#c9a13b');
    drawFrame(570, 50, 80, 100, '#b22222');
    drawFrame(650, 180, 100, 130, '#c9a13b');
    drawFrame(200, 250, 140, 100, '#c9a13b');
    drawFrame(500, 300, 120, 90, '#b22222');

    // Lampes murales stylisées
    function drawLamp(x, y) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, 2*Math.PI);
        ctx.fillStyle = 'rgba(255, 230, 120, 0.85)';
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y+30);
        ctx.strokeStyle = '#a89c6a';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    drawLamp(170, 220);
    drawLamp(600, 200);
    drawLamp(400, 400);
};
