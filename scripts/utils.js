export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function generateResultCanvas(profile, percentage, lang, translations) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#0f172a'); // slate-900
    gradient.addColorStop(1, '#020617'); // slate-950
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow = ctx.createRadialGradient(540, 650, 50, 540, 650, 400);
    glow.addColorStop(0, profile.textHex + '44'); // Color del arquetipo con transparencia
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1200);

    ctx.font = '300px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(profile.emoji, 540, 650);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Nunito, sans-serif';
    ctx.fillText(profile.title[lang].toUpperCase(), 540, 950);

    ctx.fillStyle = profile.textHex;
    ctx.font = 'bold 140px Nunito, sans-serif';
    ctx.fillText(`${percentage}%`, 540, 1100);

    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = 'italic 45px Nunito, sans-serif';
    // Función simple para envolver texto (word wrap)
    wrapText(ctx, profile.tagline[lang], 540, 1250, 800, 60);

    ctx.fillStyle = '#ffffff33';
    ctx.font = 'bold 40px Nunito, sans-serif';
    ctx.fillText("femboy-web.pages.dev", 540, 1750);
    
    ctx.fillStyle = '#fb7185'; // brand-400
    ctx.fillText("♥ Discover Your Femboy", 540, 1810);

    return canvas.toDataURL('image/png');
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}