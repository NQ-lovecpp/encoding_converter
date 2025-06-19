// 游戏状态管理
class GameState {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.timer = 0;
        this.gameTimer = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.gameData = this.loadGameData();
    }

    loadGameData() {
        return JSON.parse(localStorage.getItem('encoding-game-data')) || {
            challengeScore: 0,
            challengeTime: '--',
            memoryScore: 0,
            memoryTime: '--',
            quizAccuracy: 0,
            quizCompleted: 0,
            speedScore: 0,
            speedWpm: 0
        };
    }

    saveGameData() {
        localStorage.setItem('encoding-game-data', JSON.stringify(this.gameData));
        this.updateDisplayStats();
    }

    updateDisplayStats() {
        document.getElementById('challenge-score').textContent = this.gameData.challengeScore;
        document.getElementById('challenge-time').textContent = this.gameData.challengeTime;
        document.getElementById('memory-score').textContent = this.gameData.memoryScore;
        document.getElementById('memory-time').textContent = this.gameData.memoryTime;
        document.getElementById('quiz-accuracy').textContent = this.gameData.quizAccuracy + '%';
        document.getElementById('quiz-completed').textContent = this.gameData.quizCompleted;
        document.getElementById('speed-score').textContent = this.gameData.speedScore;
        document.getElementById('speed-wpm').textContent = this.gameData.speedWpm + ' WPM';
    }

    startTimer() {
        this.timer = 0;
        this.gameTimer = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('gameTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('currentScore').textContent = this.score;
    }

    updateProgress() {
        const progress = (this.currentQuestionIndex / this.totalQuestions) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }
}

// 游戏数据
const GAME_DATA = {
    encodingChallenge: [
        { char: 'A', encodings: { ascii: '65', utf8: '0x41', unicode: 'U+0041' } },
        { char: '中', encodings: { utf8: '0xE4B8AD', unicode: 'U+4E2D', gbk: '0xD6D0' } },
        { char: '€', encodings: { utf8: '0xE282AC', unicode: 'U+20AC', iso: '0x80' } },
        { char: '🎮', encodings: { utf8: '0xF09F8EAE', unicode: 'U+1F3AE' } },
        { char: 'α', encodings: { utf8: '0xCEB1', unicode: 'U+03B1' } }
    ],
    
    quizQuestions: [
        {
            question: "UTF-8 编码中，一个中文字符通常占用多少个字节？",
            options: ["1 个字节", "2 个字节", "3 个字节", "4 个字节"],
            correct: 2,
            explanation: "UTF-8 中，常用的中文字符通常占用 3 个字节。"
        },
        {
            question: "ASCII 编码可以表示多少个不同的字符？",
            options: ["64", "128", "256", "512"],
            correct: 1,
            explanation: "ASCII 使用 7 位编码，可以表示 2^7 = 128 个字符。"
        },
        {
            question: "Unicode 标准的目标是什么？",
            options: ["提高传输速度", "统一全世界的字符编码", "减少存储空间", "加强数据安全"],
            correct: 1,
            explanation: "Unicode 的主要目标是为世界上所有的字符提供统一的编码标准。"
        },
        {
            question: "UTF-16 编码中，BOM（字节顺序标记）的作用是什么？",
            options: ["表示文件开始", "指示字节序", "标记编码类型", "验证数据完整性"],
            correct: 1,
            explanation: "BOM 用于指示 UTF-16 编码的字节顺序（大端或小端）。"
        },
        {
            question: "下列哪种编码是变长编码？",
            options: ["ASCII", "UTF-8", "UTF-32", "Latin-1"],
            correct: 1,
            explanation: "UTF-8 是变长编码，字符可以用 1-4 个字节表示。"
        }
    ]
};

// 全局游戏状态
let gameState = new GameState();

// 游戏启动函数
function startGame(gameType) {
    gameState.currentGame = gameType;
    gameState.score = 0;
    gameState.currentQuestionIndex = 0;
    
    document.getElementById('gameModal').classList.add('active');
    document.getElementById('currentScore').textContent = '0';
    
    switch(gameType) {
        case 'encoding-challenge':
            startEncodingChallenge();
            break;
        case 'memory-match':
            startMemoryMatch();
            break;
        case 'encoding-quiz':
            startEncodingQuiz();
            break;
        case 'speed-typing':
            startSpeedTyping();
            break;
    }
    
    gameState.startTimer();
}

// 编码挑战游戏
function startEncodingChallenge() {
    document.getElementById('gameTitle').textContent = '🧩 编码挑战';
    gameState.totalQuestions = GAME_DATA.encodingChallenge.length;
    showEncodingQuestion();
}

function showEncodingQuestion() {
    if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
        endEncodingChallenge();
        return;
    }
    
    const question = GAME_DATA.encodingChallenge[gameState.currentQuestionIndex];
    const encodings = Object.keys(question.encodings);
    const targetEncoding = encodings[Math.floor(Math.random() * encodings.length)];
    const correctAnswer = question.encodings[targetEncoding];
    
    // 生成错误选项
    const wrongAnswers = generateWrongAnswers(correctAnswer, 3);
    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="question-container">
            <div class="question-text">
                字符 "${question.char}" 的 ${targetEncoding.toUpperCase()} 编码是？
            </div>
            <div class="options-grid">
                ${allOptions.map(option => 
                    `<button class="option-btn" onclick="checkAnswer('${option}', '${correctAnswer}')">${option}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    gameState.updateProgress();
}

function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        } else if (btn.textContent === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        gameState.updateScore(10);
        showNotification('正确！+10 分', 'success');
    } else {
        showNotification('错误！正确答案是 ' + correct, 'error');
    }
    
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        showEncodingQuestion();
    }, 1500);
}

// 记忆匹配游戏
function startMemoryMatch() {
    document.getElementById('gameTitle').textContent = '🧠 编码记忆';
    gameState.totalQuestions = 8;
    
    const cards = generateMemoryCards();
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            ${cards.map((card, index) => 
                `<div class="memory-card" data-id="${card.id}" onclick="flipCard(this, ${index})">
                    <div class="card-front">?</div>
                    <div class="card-back">${card.content}</div>
                </div>`
            ).join('')}
        </div>
    `;
    
    // 添加记忆卡片样式
    const style = document.createElement('style');
    style.textContent = `
        .memory-card {
            aspect-ratio: 1;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .memory-card:hover { transform: scale(1.05); }
        .memory-card.flipped { background: var(--success-gradient); }
        .memory-card.matched { background: var(--warning-gradient); opacity: 0.6; }
        .card-back { display: none; }
        .memory-card.flipped .card-back { display: block; }
        .memory-card.flipped .card-front { display: none; }
    `;
    document.head.appendChild(style);
}

// 知识问答游戏
function startEncodingQuiz() {
    document.getElementById('gameTitle').textContent = '❓ 编码知识问答';
    gameState.totalQuestions = GAME_DATA.quizQuestions.length;
    showQuizQuestion();
}

function showQuizQuestion() {
    if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
        endQuiz();
        return;
    }
    
    const question = GAME_DATA.quizQuestions[gameState.currentQuestionIndex];
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="question-container">
            <div class="question-text">${question.question}</div>
            <div class="options-grid">
                ${question.options.map((option, index) => 
                    `<button class="option-btn" onclick="checkQuizAnswer(${index}, ${question.correct}, '${question.explanation}')">${option}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    gameState.updateProgress();
}

function checkQuizAnswer(selected, correct, explanation) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === correct) {
            btn.classList.add('correct');
        } else if (index === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        gameState.updateScore(20);
        showNotification('正确！+20 分', 'success');
    } else {
        showNotification(explanation, 'info');
    }
    
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        showQuizQuestion();
    }, 2000);
}

// 速度打字游戏
function startSpeedTyping() {
    document.getElementById('gameTitle').textContent = '⚡ 编码速打';
    gameState.totalQuestions = 20;
    gameState.currentQuestionIndex = 0;
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="speed-typing-container">
            <div class="target-display" id="targetDisplay">
                <div class="target-char">准备开始...</div>
                <div class="target-encoding">--</div>
            </div>
            <input type="text" class="speed-input" id="speedInput" placeholder="输入编码值..." disabled>
            <div class="speed-stats">
                <span>正确: <span id="correctCount">0</span></span>
                <span>错误: <span id="wrongCount">0</span></span>
                <span>WPM: <span id="wpmDisplay">0</span></span>
            </div>
        </div>
    `;
    
    // 添加速打样式
    const style = document.createElement('style');
    style.textContent = `
        .speed-typing-container { text-align: center; }
        .target-display { 
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
        }
        .target-char { font-size: 4rem; margin-bottom: 15px; }
        .target-encoding { font-size: 1.2rem; color: rgba(255, 255, 255, 0.7); }
        .speed-input {
            width: 100%;
            padding: 15px;
            font-size: 1.2rem;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            color: white;
            text-align: center;
            margin-bottom: 20px;
        }
        .speed-stats {
            display: flex;
            justify-content: space-around;
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        showSpeedTypingTarget();
        document.getElementById('speedInput').disabled = false;
        document.getElementById('speedInput').focus();
    }, 1000);
}

// 辅助函数
function generateWrongAnswers(correct, count) {
    const answers = [];
    for (let i = 0; i < count; i++) {
        let wrong;
        if (correct.startsWith('0x')) {
            wrong = '0x' + Math.random().toString(16).substr(2, correct.length - 2).toUpperCase();
        } else if (correct.startsWith('U+')) {
            wrong = 'U+' + Math.random().toString(16).substr(2, 4).toUpperCase();
        } else {
            wrong = (parseInt(correct) + Math.floor(Math.random() * 50) + 1).toString();
        }
        answers.push(wrong);
    }
    return answers;
}

function generateMemoryCards() {
    const pairs = GAME_DATA.encodingChallenge.slice(0, 4);
    const cards = [];
    
    pairs.forEach((pair, index) => {
        cards.push({ id: index, content: pair.char });
        cards.push({ id: index, content: pair.encodings.utf8 });
    });
    
    return cards.sort(() => Math.random() - 0.5);
}

function showSpeedTypingTarget() {
    if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
        endSpeedTyping();
        return;
    }
    
    const question = GAME_DATA.encodingChallenge[
        gameState.currentQuestionIndex % GAME_DATA.encodingChallenge.length
    ];
    const encoding = 'utf8';
    
    document.getElementById('targetDisplay').innerHTML = `
        <div class="target-char">${question.char}</div>
        <div class="target-encoding">UTF-8 编码</div>
    `;
    
    const input = document.getElementById('speedInput');
    input.value = '';
    input.focus();
    
    input.onkeyup = function(e) {
        if (e.key === 'Enter') {
            const userInput = input.value.trim();
            const correct = question.encodings[encoding];
            
            if (userInput.toLowerCase() === correct.toLowerCase()) {
                gameState.updateScore(5);
                document.getElementById('correctCount').textContent = 
                    parseInt(document.getElementById('correctCount').textContent) + 1;
            } else {
                document.getElementById('wrongCount').textContent = 
                    parseInt(document.getElementById('wrongCount').textContent) + 1;
            }
            
            gameState.currentQuestionIndex++;
            gameState.updateProgress();
            showSpeedTypingTarget();
        }
    };
}

// 游戏结束函数
function endEncodingChallenge() {
    gameState.stopTimer();
    const timeStr = document.getElementById('gameTimer').textContent;
    
    if (gameState.score > gameState.gameData.challengeScore) {
        gameState.gameData.challengeScore = gameState.score;
        gameState.gameData.challengeTime = timeStr;
        gameState.saveGameData();
    }
    
    showGameEnd('编码挑战完成！', `最终得分: ${gameState.score} 分<br>用时: ${timeStr}`);
}

function endQuiz() {
    gameState.stopTimer();
    const accuracy = Math.round((gameState.score / (gameState.totalQuestions * 20)) * 100);
    
    gameState.gameData.quizCompleted++;
    gameState.gameData.quizAccuracy = Math.max(gameState.gameData.quizAccuracy, accuracy);
    gameState.saveGameData();
    
    showGameEnd('知识问答完成！', `正确率: ${accuracy}%<br>得分: ${gameState.score} 分`);
}

function endSpeedTyping() {
    gameState.stopTimer();
    const correct = parseInt(document.getElementById('correctCount').textContent);
    const wpm = Math.round((correct * 60) / gameState.timer);
    
    document.getElementById('wpmDisplay').textContent = wpm;
    
    if (gameState.score > gameState.gameData.speedScore) {
        gameState.gameData.speedScore = gameState.score;
        gameState.gameData.speedWpm = wpm;
        gameState.saveGameData();
    }
    
    showGameEnd('速打挑战完成！', `WPM: ${wpm}<br>得分: ${gameState.score} 分`);
}

function showGameEnd(title, message) {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="game-end">
            <h3 style="font-size: 2rem; margin-bottom: 20px;">${title}</h3>
            <p style="font-size: 1.3rem; margin-bottom: 30px;">${message}</p>
            <button class="play-button" onclick="closeGame()" style="max-width: 200px; margin: 0 auto;">
                <i class="fas fa-check"></i> 完成
            </button>
        </div>
    `;
}

// 记忆游戏相关函数
let flippedCards = [];
let matchedPairs = 0;

function flipCard(cardElement, index) {
    if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
        return;
    }
    
    cardElement.classList.add('flipped');
    flippedCards.push({ element: cardElement, id: cardElement.dataset.id });
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.id === card2.id) {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matchedPairs++;
        gameState.updateScore(15);
        
        if (matchedPairs === 4) {
            setTimeout(() => {
                gameState.stopTimer();
                const timeStr = document.getElementById('gameTimer').textContent;
                
                if (gameState.score > gameState.gameData.memoryScore) {
                    gameState.gameData.memoryScore = gameState.score;
                    gameState.gameData.memoryTime = timeStr;
                    gameState.saveGameData();
                }
                
                showGameEnd('记忆匹配完成！', `最终得分: ${gameState.score} 分<br>用时: ${timeStr}`);
            }, 500);
        }
    } else {
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }
    
    flippedCards = [];
}

// 通知系统
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: var(--glass-backdrop);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 15px 20px;
        color: white;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        success: 'var(--success-gradient)',
        error: 'var(--accent-gradient)',
        info: 'var(--primary-gradient)'
    };
    
    if (colors[type]) {
        notification.style.background = colors[type];
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 关闭游戏
function closeGame() {
    gameState.stopTimer();
    gameState.currentGame = null;
    flippedCards = [];
    matchedPairs = 0;
    document.getElementById('gameModal').classList.remove('active');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    gameState.updateDisplayStats();
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}); 