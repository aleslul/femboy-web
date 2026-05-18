import { questions, archetypes } from './data.js';
import { uiTranslations } from './i18n.js';
import { elements, updateLanguageStaticDOM, renderQuestionDOM, renderResultsDOM } from './dom.js';

let currentLang = 'en';
let currentQuestion = 0;
let scores = { classic: 0, goth: 0, casual: 0, elegant: 0, gamer: 0 };

function init() {
    elements.startBtn.addEventListener('click', startQuiz);
    elements.restartBtn.addEventListener('click', restartQuiz);
    elements.shareBtn.addEventListener('click', handleCopyResults);
    elements.langBtn.addEventListener('click', toggleLanguage);
    
    // Carga inicial del idioma por defecto
    updateLanguageStaticDOM(currentLang);
}

function startQuiz() {
    elements.welcomeScreen.classList.add('hidden');
    elements.quizScreen.classList.remove('hidden');
    currentQuestion = 0;
    scores = { classic: 0, goth: 0, casual: 0, elegant: 0, gamer: 0 };
    processQuizStep();
}

function processQuizStep() {
    if (currentQuestion >= questions.length) {
        elements.quizScreen.classList.add('hidden');
        elements.resultScreen.classList.remove('hidden');
        renderResultsDOM(scores, currentLang);
        return;
    }
    renderQuestionDOM(currentQuestion, currentLang, (selectedType) => {
        scores[selectedType]++;
        currentQuestion++;
        processQuizStep();
    });
}

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    elements.langBtn.textContent = currentLang === 'es' ? '🌐 EN' : '🌐 ES';
    
    updateLanguageStaticDOM(currentLang);
    
    if (!elements.quizScreen.classList.contains('hidden')) {
        renderQuestionDOM(currentQuestion, currentLang, (selectedType) => {
            scores[selectedType]++;
            currentQuestion++;
            processQuizStep();
        });
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