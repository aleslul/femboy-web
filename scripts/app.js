import { questions, archetypes } from './data.js';
import { uiTranslations } from './i18n.js';
import { elements, updateLanguageStaticDOM, renderQuestionDOM, renderResultsDOM } from './dom.js';
import { shuffleArray, generateResultCanvas } from './utils.js';

let currentLang = detectBrowserLanguage();
let currentQuestion = 0;
let scores = {};
let answerHistory = [];
let shuffledQuestions = [];

function detectBrowserLanguage() {
    try {
        const browserLang = (navigator.language || navigator.userLanguage || 'es').slice(0, 2).toLowerCase();
        const supportedLanguages = ['es', 'en'];
        return supportedLanguages.includes(browserLang) ? browserLang : 'es';
    } catch (e) {
        return 'es'; 
    }
}
function shawarmaFun() {
    //FALTA
}

function init() {
    elements.startBtn.addEventListener('click', startQuiz);
    elements.restartBtn.addEventListener('click', restartQuiz);
    elements.shareBtn.addEventListener('click', handleCopyResults);
    elements.langBtn.addEventListener('click', toggleLanguage);
    elements.langBtn.textContent = currentLang == 'es' ? '🌐 English' : '🌐 Español';
    elements.backBtn.addEventListener('click', handleBackStep);
    elements.whatsappBtn?.addEventListener('click', () => shareTo('whatsapp'));
    elements.telegramBtn?.addEventListener('click', () => shareTo('telegram'));
    elements.instagramBtn?.addEventListener('click', () => shareTo('instagram'));
    elements.messengerBtn?.addEventListener('click', () => shareTo('messenger'));

    resetScores();
    updateLanguageStaticDOM(currentLang);
}

function getShareContent() {
    const t = uiTranslations[currentLang];
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    
    let dominantType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const profile = archetypes[dominantType];
    
    const url = "https://femboy-web.pages.dev/"; 

    // Usamos la plantilla del idioma actual y reemplazamos los datos
    const text = t.shareMessage
        .replace('{result}', profile.title[currentLang])
        .replace('{emoji}', profile.emoji);
    
    return { 
        text, 
        url, 
        fullMessage: `${text} ${url}` 
    };
}

async function shareTo(platform) {
    const { text, url, fullMessage } = getShareContent();
    const encodedText = encodeURIComponent(fullMessage);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = "";

    switch (platform) {
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
            break;
        case 'messenger':
            // Facebook/Messenger requiere que la URL sea válida y pública
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'instagram':
            const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
            let dominantType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            const profile = archetypes[dominantType];
            const pct = Math.round((scores[dominantType] / totalScore) * 100);

            elements.instagramBtn.style.opacity = "0.5";

            const imageData = await generateResultCanvas(profile, pct, currentLang, uiTranslations[currentLang]);

            console.log("Paso 01: ok!");

            const link = document.createElement('a');
            link.download = `femboy-test-${dominantType}.png`;
            link.href = imageData;
            link.click();

            console.log("Paso 02: ok!");
            setTimeout(() => {
                alert(currentLang === 'es' ? 
                    "¡Imagen descargada! Súbela ahora a tus Stories." : 
                    "Image downloaded! Now upload it to your Stories.");
                window.open('https://www.instagram.com/', '_blank');
                elements.instagramBtn.style.opacity = "1";
            }, 500);
            console.log("Paso 03: ok!");
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}

function resetScores() {
    scores = {};
    Object.keys(archetypes).forEach (key => {
        scores[key] = 0;
    });
}

function startQuiz() {
    elements.welcomeScreen.classList.add('hidden'); //TODO: revisar despues para shawarma
    elements.quizScreen.classList.remove('hidden');

    currentQuestion = 0;
    answerHistory = [];
    resetScores();
    
    shuffledQuestions = shuffleArray(questions).map(q => ({
        ...q,
        options: shuffleArray(q.options)
    }));

    processQuizStep();
}

function processQuizStep() {
    if (currentQuestion >= shuffledQuestions.length) {
        elements.quizScreen.classList.add('hidden');
        elements.resultScreen.classList.remove('hidden');
        renderResultsDOM(scores, currentLang);
        return;
    }

    elements.backBtn.classList.toggle('hidden', currentQuestion === 0);

    const questionData = shuffledQuestions[currentQuestion];

    renderQuestionDOM(questionData, currentQuestion, shuffledQuestions.length, currentLang, (selectedType) => {
        scores[selectedType]++;
        answerHistory.push(selectedType);
        currentQuestion++;
        processQuizStep();
    });
}

function handleBackStep() {
    if (currentQuestion > 0) {
        currentQuestion--;
        const lastType = answerHistory.pop();
        scores[lastType]--;
        processQuizStep();
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    elements.langBtn.textContent = currentLang === 'es' ? '🌐 English' : '🌐 Español';
    
    updateLanguageStaticDOM(currentLang);
    
    if (!elements.quizScreen.classList.contains('hidden')) {
        processQuizStep();
    } else if (!elements.resultScreen.classList.contains('hidden')) {
        renderResultsDOM(scores, currentLang);
    }
}

function restartQuiz() {
    elements.resultScreen.classList.add('hidden');
    elements.welcomeScreen.classList.remove('hidden');
    currentQuestion = 0;
}

function handleCopyResults() {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 10;
    let dominantType = 'classic';
    let maxScore = -1;
    
    for (const [key, value] of Object.entries(scores)) {
        if (value > maxScore) {
            maxScore = value;
            dominantType = key;
        }
    }
    
    const profile = archetypes[dominantType];
    const pct = Math.round((scores[dominantType] / totalScore) * 100);
    const t = uiTranslations[currentLang];
    
    let breakdownText = "";
    Object.entries(scores).sort((a,b) => b[1] - a[1]).forEach(([type, val]) => {
        const typePct = Math.round((val / totalScore) * 100);
        breakdownText += `\n- ${archetypes[type].emoji} ${archetypes[type].title[currentLang]}: ${typePct}%`;
    });
    
    const copyString = t.shareTemplate
        .replace('{title}', profile.title[currentLang])
        .replace('{pct}', pct)
        .replace('{tagline}', profile.tagline[currentLang])
        .replace('{breakdown}', breakdownText);
        
    const textarea = document.createElement('textarea');
    textarea.value = copyString;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        elements.toastMessage.classList.remove('hidden');
        elements.toastMessage.classList.add('animate-bounce');
        elements.shareBtnText.textContent = t.shareBtnActive;
        
        setTimeout(() => {
            elements.toastMessage.classList.add('hidden');
            elements.toastMessage.classList.remove('animate-bounce');
            elements.shareBtnText.textContent = t.shareBtn;
        }, 3000);
    } catch (err) {
        console.error('Execution fallback failed: ', err);
    } finally {
        document.body.removeChild(textarea);
    }
}

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', init);