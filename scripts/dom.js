import { uiTranslations } from './i18n.js';
import { questions, archetypes } from './data.js';

export const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultScreen: document.getElementById('result-screen'),
    shawarmaNya: document.getElementById('shawarma-nya'), 
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    shareBtn: document.getElementById('share-btn'),
    shareBtnText: document.getElementById('share-btn-text'),
    langBtn: document.getElementById('lang-btn'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    currentQuestionNum: document.getElementById('current-question-num'),
    progressPercent: document.getElementById('quiz-progress-percent'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    resultTitle: document.getElementById('result-title'), 
    resultTagline: document.getElementById('result-tagline'),
    resultEmoji: document.getElementById('result-emoji'),
    resultPercentage: document.getElementById('result-percentage'),
    resultDescription: document.getElementById('result-description'),
    resultTraits: document.getElementById('result-traits'),
    resultWardrobe: document.getElementById('result-wardrobe'),
    resultBox: document.getElementById('result-box'),
    breakdownBars: document.getElementById('breakdown-bars'),
    toastMessage: document.getElementById('toast-message')
};

/**
 * Función interna para barajar las opciones sin mutar el array original.
 * Implementa el algoritmo Fisher-Yates.
*/

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
} 

export function updateLanguageStaticDOM(lang) {
    const t = uiTranslations[lang];
    
    // Welcome Screen
    elements.welcomeScreen.querySelector('span.uppercase').textContent = t.welcomeBadge;
    elements.welcomeScreen.querySelector('h1').textContent = t.welcomeTitle;
    elements.welcomeScreen.querySelector('p').textContent = t.welcomeDesc;
    elements.startBtn.childNodes[0].textContent = t.startBtn + " ";
    
    const welcomeBadges = elements.welcomeScreen.querySelectorAll('.text-xs.text-slate-500');
    if (welcomeBadges.length >= 3) {
        welcomeBadges[0].textContent = t.qBadge;
        welcomeBadges[1].textContent = t.rBadge;
        welcomeBadges[2].textContent = t.tBadge;
    }
    
    // Quiz Screen
    elements.quizScreen.querySelector('.text-xs.text-slate-500').childNodes[0].textContent = t.navDetail;
    elements.quizScreen.querySelector('span.flex').innerHTML = `
        <svg class="w-3.5 h-3.5 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
        </svg> ${t.anonQuiz}`;
        
    // Results Screen
    elements.resultScreen.querySelector('span.uppercase').textContent = t.complBadge;
    elements.resultScreen.querySelector('h2').textContent = t.resultHeading;
    elements.resultBox.querySelector('h4').textContent = t.aboutSection;
    
    const traitsHeading = elements.resultBox.querySelectorAll('h5')[0];
    const wardrobeHeading = elements.resultBox.querySelectorAll('h5')[1];
    if (traitsHeading) traitsHeading.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-violetbrand-500"></span> ${t.traitsSection}`;
    if (wardrobeHeading) wardrobeHeading.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> ${t.wardrobeSection}`;
    
    elements.resultScreen.querySelector('h3').textContent = t.breakdownTitle;
    elements.restartBtn.lastChild.textContent = t.restartBtn;
    
    if (elements.shareBtnText.textContent !== uiTranslations.es.shareBtnActive && elements.shareBtnText.textContent !== uiTranslations.en.shareBtnActive) {
        elements.shareBtnText.textContent = t.shareBtn;
    }
    elements.toastMessage.lastChild.textContent = t.toast;
}

// QUESTIONS: Ahora con shuffle y lógica dinámica
export function renderQuestionDOM(index, lang, onSelectCallback) {
    const q = questions[index];
    const t = uiTranslations[lang];
    const progressVal = Math.round((index / questions.length) * 100);
    
    // Actualizar el contador de preguntas dinámicamente
    const counterWrapper = elements.currentQuestionNum.parentNode;
    counterWrapper.innerHTML = `${t.questionNum} <span id="current-question-num" class="text-brand-400 font-bold">${index + 1}</span> ${t.questionOf} ${questions.length}`;
    elements.currentQuestionNum = document.getElementById('current-question-num');
    
    elements.progressPercent.textContent = `${progressVal}% ${t.progressText}`;
    elements.progressBarFill.style.width = `${progressVal || 5}%`;
    elements.questionText.textContent = q.text[lang];
    elements.optionsContainer.innerHTML = '';

    // Barajamos las opciones para esta renderización específica
    const randomizedOptions = shuffleArray(q.options);

    randomizedOptions.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700/80 p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 group active:scale-[0.99]";
        
        const badge = document.createElement('span');
        badge.className = "flex-shrink-0 w-8 h-8 rounded-xl bg-slate-950 text-xs font-bold text-slate-400 group-hover:text-brand-400 border border-slate-800 flex items-center justify-center transition-colors";
        // Las letras A, B, C... se asignan según el nuevo orden aleatorio
        badge.textContent = String.fromCharCode(65 + idx); 
        
        const txt = document.createElement('span');
        txt.className = "text-slate-300 group-hover:text-white text-sm md:text-base font-semibold transition-colors";
        txt.textContent = opt.text[lang];
        
        btn.appendChild(badge);
        btn.appendChild(txt);
        
        btn.onclick = () => {
            elements.quizScreen.style.opacity = 0.3;
            setTimeout(() => {
                onSelectCallback(opt.type);
                elements.quizScreen.style.opacity = 1;
            }, 150);
        };
        elements.optionsContainer.appendChild(btn);
    });
}

// RESULTS: Ya es dinámico, iterando sobre los scores que reciba
export function renderResultsDOM(scores, lang) {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 10;
    let dominantType = Object.keys(scores)[0] || 'classic';
    let maxScore = -1;
    
    for (const [key, value] of Object.entries(scores)) {
        if (value > maxScore) {
            maxScore = value;
            dominantType = key;
        }
    }
    
    const profile = archetypes[dominantType];
    const dominantPercentage = Math.round((scores[dominantType] / totalScore) * 100);
    
    elements.resultTitle.textContent = profile.title[lang];
    elements.resultTagline.textContent = profile.tagline[lang];
    elements.resultEmoji.textContent = profile.emoji;
    elements.resultPercentage.textContent = `${dominantPercentage}%`;
    elements.resultDescription.textContent = profile.description[lang];
    
    // Traits dinámicos
    elements.resultTraits.innerHTML = '';
    profile.traits[lang].forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        elements.resultTraits.appendChild(li);
    });
    
    // Wardrobe dinámico
    elements.resultWardrobe.innerHTML = '';
    profile.wardrobe[lang].forEach(w => {
        const li = document.createElement('li');
        li.textContent = w;
        elements.resultWardrobe.appendChild(li);
    });
    
    elements.resultBox.style.borderColor = profile.textHex;
    elements.breakdownBars.innerHTML = '';
    
    // El desglose se adapta automáticamente a cualquier cantidad de arquetipos en scores
    const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    sortedTypes.forEach(([type, val]) => {
        const pct = Math.round((val / totalScore) * 100);
        const info = archetypes[type];
        
        const row = document.createElement('div');
        row.className = "space-y-1.5";
        
        const labelRow = document.createElement('div');
        labelRow.className = "flex justify-between items-center text-xs md:text-sm font-bold text-slate-400";
        labelRow.innerHTML = `
            <span class="flex items-center gap-1.5 text-slate-300">
                <span class="text-base">${info.emoji}</span> ${info.title[lang]}
            </span>
            <span style="color: ${info.textHex}">${pct}%</span>`;
            
        const barBg = document.createElement('div');
        barBg.className = "w-full bg-slate-900 rounded-full h-2.5 p-0.5 border border-slate-800/80";
        
        const barFill = document.createElement('div');
        barFill.className = `bg-gradient-to-r ${info.color} h-1.5 rounded-full transition-all duration-1000`;
        barFill.style.width = '0%';
        
        barBg.appendChild(barFill);
        row.appendChild(labelRow);
        row.appendChild(barBg);
        elements.breakdownBars.appendChild(row);
        
        setTimeout(() => { barFill.style.width = `${pct}%`; }, 100);
    });
}