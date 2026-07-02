let score = 0;
let highscore = localStorage.getItem('cat_lava_highscore') || 0;

let playerLevel = 0;
let lavaHeightPx = 0;

let currentQuestion = null;
let loopInterval = null;
let lavaActive = false;
let audioCtx = null;

let currentDifficulty = "easy";
let filteredWords = [];
let lavaSpeedMultiplier = 0.52; // Velocidade do Modo Fácil ajustada conforme você pediu
let mistakePunishment = 45;

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, duration, type = 'sine') {
    try {
        initAudio();
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.connect(gain); gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
}

function buildLadder() {
    const container = document.getElementById('steps-container');
    container.innerHTML = '';
    for (let i = 1; i <= 150; i++) {
        const row = document.createElement('div');
        row.className = 'step-row';
        const plat = document.createElement('div');
        plat.className = 'step-platform';
        const b = document.createElement('div');
        b.className = 'step-badge'; b.textContent = i;
        plat.appendChild(b); row.appendChild(plat);
        container.appendChild(row);
    }
}

function syncScreenPosition() {
    const track = document.getElementById('ladder-track');
    const lavaNode = document.getElementById('lava-liquid');
    const scrollOffset = playerLevel * 80;

    track.style.transform = `translateY(${scrollOffset}px)`;
    lavaNode.style.height = `${lavaHeightPx}px`;
    lavaNode.style.transform = `translateY(${scrollOffset}px)`;
}

function startLoop() {
    clearInterval(loopInterval);
    loopInterval = setInterval(() => {
        if (lavaActive) {
            lavaHeightPx += lavaSpeedMultiplier;
        }
        syncScreenPosition();
        checkCollision();
    }, 30);
}

function checkCollision() {
    const catFeetLevelInView = 85;
    if (lavaHeightPx >= (playerLevel * 80) + catFeetLevelInView) {
        gameOver();
    }
}

// ============================================================================
// FUNÇÃO INTELIGENTE: GERA A PERGUNTA DINAMICAMENTE A PARTIR DA PALAVRA PURA
// ============================================================================
function generateQuestionFromWord(word) {
    const upperWord = word.toUpperCase();
    const vowels = ["A", "E", "I", "O", "U"];

    // Encontra quais vogais padrão existem na palavra para tentar remover uma delas
    let availableVowels = [];
    for (let i = 0; i < upperWord.length; i++) {
        if (vowels.includes(upperWord[i])) {
            availableVowels.push({ char: upperWord[i], index: i });
        }
    }

    let target;
    if (availableVowels.length > 0) {
        // Escolhe uma vogal aleatória da palavra para sumir
        target = availableVowels[Math.floor(Math.random() * availableVowels.length)];
    } else {
        // Caso não ache uma vogal simples (por conta de acentos), remove uma letra qualquer
        const idx = Math.floor(Math.random() * upperWord.length);
        target = { char: upperWord[idx], index: idx };
    }

    // Cria a palavra com a lacuna (_)
    const wordArray = upperWord.split('');
    wordArray[target.index] = '_';
    const display = wordArray.join('');

    // Filtra as opções falsas para não repetir a letra correta
    let wrongOptions = vowels.filter(v => v !== target.char);
    wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);

    // Junta a opção correta com as erradas e embaralha a ordem dos botões
    const options = [target.char, ...wrongOptions].sort(() => 0.5 - Math.random());

    return {
        display: display,
        missing: target.char,
        options: options
    };
}

function loadQuestion() {
    if (filteredWords.length === 0) return;

    // Sorteia um índice aleatório da lista tratada
    const rand = Math.floor(Math.random() * filteredWords.length);
    currentQuestion = filteredWords[rand];

    document.getElementById('lbl-word').textContent = currentQuestion.display;
    const grid = document.getElementById('box-options');
    grid.innerHTML = '';

    currentQuestion.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => evaluateAnswer(opt, btn));
        grid.appendChild(btn);
    });
}

function evaluateAnswer(letter, btn) {
    if (!lavaActive) {
        lavaActive = true;
    }

    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    const catArt = document.getElementById('cat-art');

    if (letter === currentQuestion.missing) {
        btn.classList.add('correct');
        playSound(550, 0.15, 'sine');
        catArt.classList.add('cat-jumping');

        score++;
        playerLevel++;

        if (score % 3 === 0) {
            // Aceleração sutil progressiva configurada para o Modo Fácil (0.08) e Difícil (0.15)
            lavaSpeedMultiplier += (currentDifficulty === "easy") ? 0.08 : 0.15;
        }
    } else {
        btn.classList.add('wrong');
        playSound(220, 0.3, 'triangle');

        lavaHeightPx += mistakePunishment;

        allBtns.forEach(b => {
            if (b.textContent === currentQuestion.missing) b.classList.add('correct');
        });
    }

    document.getElementById('lbl-score').textContent = `Pontos: ${score}`;
    syncScreenPosition();

    setTimeout(() => {
        catArt.classList.remove('cat-jumping');
        checkCollision();
        loadQuestion();
    }, 800);
}

function gameOver() {
    clearInterval(loopInterval);
    lavaActive = false;
    playSound(140, 0.5, 'sawtooth');

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('cat_lava_highscore', highscore);
    }

    document.getElementById('lbl-final-score').textContent = `Você completou as letras e subiu ${score} degraus com o gatinho!`;
    changeScreen('screen-lose');
}

function changeScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen-active'));
    document.getElementById(id).classList.add('screen-active');
}

function startGame(difficulty) {
    currentDifficulty = difficulty;
    score = 0;
    playerLevel = 0;
    lavaHeightPx = 0;
    lavaActive = false;

    let selectedWordsList = [];

    // Mapeamento usando o novo wordBankRaw do words.js
    if (difficulty === "easy") {
        lavaSpeedMultiplier = 0.52; // Velocidade inicial levemente superior para o Modo Fácil
        mistakePunishment = 40;
        // Junta listas de 4, 5 e 6 letras
        selectedWordsList = [...wordBankRaw[4], ...wordBankRaw[5], ...wordBankRaw[6]];
    } else {
        lavaSpeedMultiplier = 1.1;  // Mantido original para o Difícil
        mistakePunishment = 65;
        // Junta listas de 6, 7, 8 e 9 letras
        selectedWordsList = [...wordBankRaw[6], ...wordBankRaw[7], ...wordBankRaw[8], ...wordBankRaw[9]];
    }

    // Transforma todas as palavras puras selecionadas em objetos com lacunas dinamicamente
    filteredWords = selectedWordsList.map(word => generateQuestionFromWord(word));

    document.getElementById('lbl-score').textContent = `Pontos: ${score}`;
    document.getElementById('lbl-highscore').textContent = `Recorde: ${highscore}`;
    document.getElementById('cat-art').classList.remove('cat-jumping');

    buildLadder();
    syncScreenPosition();
    loadQuestion();
    changeScreen('screen-game');
    startLoop();
}

document.getElementById('btn-easy').addEventListener('click', () => { initAudio(); startGame('easy'); });
document.getElementById('btn-hard').addEventListener('click', () => { initAudio(); startGame('hard'); });
document.getElementById('btn-restart').addEventListener('click', () => startGame(currentDifficulty));

document.getElementById('btn-go-menu').addEventListener('click', () => {
    clearInterval(loopInterval);
    lavaActive = false;
    changeScreen('screen-menu');
});

document.getElementById('btn-quit').addEventListener('click', () => {
    clearInterval(loopInterval);
    lavaActive = false;
    changeScreen('screen-menu');
});

window.onload = () => {
    document.getElementById('lbl-highscore').textContent = `Recorde: ${highscore}`;
};