<template>
  <div class="playground-page">
    <header class="page-header">
      <div class="header-content">
        <h1>🎮 编码游乐场</h1>
        <p>通过有趣的互动游戏学习字符编码知识</p>
      </div>
      
      <div class="stats-panel">
        <div class="stat-card">
          <div class="stat-value">{{ gameStats.totalScore }}</div>
          <div class="stat-label">总得分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ gameStats.gamesPlayed }}</div>
          <div class="stat-label">游戏次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ gameStats.bestScore }}</div>
          <div class="stat-label">最高分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ gameStats.winRate }}%</div>
          <div class="stat-label">胜率</div>
        </div>
      </div>
    </header>

    <main class="games-grid">
      <div 
        v-for="game in games" 
        :key="game.type"
        class="game-card"
        @click="startGame(game.type)"
      >
        <div class="game-icon" :class="game.type">
          <i :class="game.icon"></i>
        </div>
        <h3 class="game-title">{{ game.title }}</h3>
        <p class="game-description">{{ game.description }}</p>
        <div class="game-stats">
          <div class="game-stat">
            <span class="stat-label">最高分</span>
            <span class="stat-value">{{ getGameBestScore(game.type) }}</span>
          </div>
          <div class="game-stat">
            <span class="stat-label">完成次数</span>
            <span class="stat-value">{{ getGameCompletions(game.type) }}</span>
          </div>
        </div>
        <button class="play-button">
          <i class="fas fa-play"></i>
          开始游戏
        </button>
      </div>
    </main>

    <div v-if="currentGame" class="game-modal" @click.self="closeGame">
      <div class="game-container">
        <div class="game-header">
          <h2>{{ getCurrentGameTitle() }}</h2>
          <div class="game-controls">
            <div class="game-timer">
              <i class="fas fa-clock"></i>
              {{ formatTime(gameTimer) }}
            </div>
            <div class="game-score">
              <i class="fas fa-star"></i>
              {{ currentScore }}
            </div>
            <button @click="closeGame" class="close-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="game-content">
          <!-- 编码挑战游戏 -->
          <div v-if="currentGame === 'challenge' && gameActive" class="challenge-game">
            <div class="question-container">
              <div class="question-char">{{ currentQuestion.char }}</div>
              <div class="question-text">选择字符 "{{ currentQuestion.char }}" 的 {{ currentQuestion.encoding.toUpperCase() }} 编码：</div>
            </div>
            <div class="answer-options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                @click="selectAnswer(index)"
                :class="['option-btn', { 
                  correct: showAnswer && index === currentQuestion.correctIndex,
                  wrong: showAnswer && index === selectedAnswer && index !== currentQuestion.correctIndex
                }]"
                :disabled="showAnswer"
              >
                {{ option }}
              </button>
            </div>
            <div class="question-progress">
              <span>问题 {{ questionIndex + 1 }} / {{ totalQuestions }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <!-- 记忆匹配游戏 -->
          <div v-if="currentGame === 'memory' && gameActive" class="memory-game">
            <div class="memory-grid">
              <div 
                v-for="(card, index) in memoryCards" 
                :key="index"
                @click="flipCard(index)"
                :class="['memory-card', { 
                  flipped: card.flipped, 
                  matched: card.matched,
                  wrong: card.wrong
                }]"
              >
                <div class="card-front">?</div>
                <div class="card-back">{{ card.content }}</div>
              </div>
            </div>
            <div class="memory-stats">
              <div class="stat">配对: {{ matchedPairs }}/{{ totalPairs }}</div>
              <div class="stat">尝试: {{ memoryAttempts }}</div>
            </div>
          </div>

          <!-- 知识问答游戏 -->
          <div v-if="currentGame === 'quiz' && gameActive" class="quiz-game">
            <div class="quiz-question">
              <h3>{{ currentQuizQuestion.question }}</h3>
            </div>
            <div class="quiz-options">
              <button 
                v-for="(option, index) in currentQuizQuestion.options" 
                :key="index"
                @click="selectQuizAnswer(index)"
                :class="['quiz-option', {
                  correct: showQuizAnswer && index === currentQuizQuestion.correctIndex,
                  wrong: showQuizAnswer && index === selectedQuizAnswer && index !== currentQuizQuestion.correctIndex
                }]"
                :disabled="showQuizAnswer"
              >
                {{ option }}
              </button>
            </div>
            <div class="quiz-progress">
              <span>问题 {{ quizIndex + 1 }} / {{ totalQuizQuestions }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${((quizIndex + 1) / totalQuizQuestions) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <!-- 速度输入游戏 -->
          <div v-if="currentGame === 'speed' && gameActive" class="speed-game">
            <div class="speed-target">
              <div class="target-char">{{ speedTarget.char }}</div>
              <div class="target-info">输入字符 "{{ speedTarget.char }}" 的 {{ speedTarget.encoding.toUpperCase() }} 编码：</div>
            </div>
            <div class="speed-input">
              <input 
                v-model="speedInput" 
                @keyup.enter="submitSpeedAnswer"
                @input="checkSpeedInput"
                placeholder="输入编码值..."
                class="speed-input-field"
                ref="speedInputRef"
              />
              <button @click="submitSpeedAnswer" class="submit-btn">提交</button>
            </div>
            <div class="speed-stats">
              <div class="stat">正确: {{ speedCorrect }}</div>
              <div class="stat">错误: {{ speedWrong }}</div>
              <div class="stat">连击: {{ speedCombo }}</div>
            </div>
          </div>

          <!-- 通用进度条 -->
          <div v-if="!gameEnded && gameActive" class="game-progress">
            <div class="progress-text">剩余时间</div>
            <div class="time-bar">
              <div class="time-fill" :style="{ width: `${timeProgress}%` }"></div>
            </div>
          </div>
        </div>

        <div v-if="gameEnded" class="game-end">
          <div class="end-content">
            <h3>{{ gameEndTitle }}</h3>
            <div class="end-stats" v-html="gameEndMessage"></div>
            <div class="end-actions">
              <button @click="restartGame" class="restart-button">
                <i class="fas fa-redo"></i>
                再玩一次
              </button>
              <button @click="closeGame" class="close-button-end">
                <i class="fas fa-home"></i>
                返回主页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, onMounted } from 'vue'

interface GameData {
  challengeScore: number
  challengeCompleted: number
  memoryScore: number
  memoryCompleted: number
  quizScore: number
  quizCompleted: number
  speedScore: number
  speedCompleted: number
}

// 游戏状态
const currentGame = ref<string>('')
const gameActive = ref(false)
const gameEnded = ref(false)
const gameTimer = ref<number | null>(null)
const gameStartTime = ref<number>(0)
const gameDuration = ref<number>(60) // 游戏时长（秒）
const currentScore = ref(0)
const gameEndTitle = ref('')
const gameEndMessage = ref('')

// 分数数据
const gameData = ref({
  totalScore: 1247,
  gamesPlayed: 23,
  bestScore: 892,
  wins: 18,
  challenge: { score: 450, completed: 8 },
  memory: { score: 320, completed: 6 },
  quiz: { score: 267, completed: 5 },
  speed: { score: 210, completed: 4 }
})

// 编码挑战游戏数据
const currentQuestion = ref<any>({})
const questionIndex = ref(0)
const totalQuestions = ref(10)
const selectedAnswer = ref<number>(-1)
const showAnswer = ref(false)
const challengeScore = ref(0)

// 记忆匹配游戏数据
const memoryCards = ref<any[]>([])
const matchedPairs = ref(0)
const totalPairs = ref(8)
const memoryAttempts = ref(0)
const flippedCards = ref<number[]>([])

// 知识问答游戏数据
const currentQuizQuestion = ref<any>({})
const quizIndex = ref(0)
const totalQuizQuestions = ref(10)
const selectedQuizAnswer = ref<number>(-1)
const showQuizAnswer = ref(false)
const quizScore = ref(0)

// 速度输入游戏数据
const speedTarget = ref<any>({})
const speedInput = ref('')
const speedCorrect = ref(0)
const speedWrong = ref(0)
const speedCombo = ref(0)
const speedInputRef = ref<HTMLInputElement>()

// 编码数据
const encodings = ['utf-8', 'ascii', 'utf-16', 'iso-8859-1', 'gb2312', 'big5']
const characters = ['A', 'a', '中', '文', '1', '@', '€', 'α', '🎮', '🔥']

const games = [
  {
    type: 'challenge',
    title: '编码挑战',
    description: '测试你对字符编码的理解，选择正确的编码值',
    icon: 'fas fa-puzzle-piece'
  },
  {
    type: 'memory',
    title: '编码记忆',
    description: '记住字符和编码的对应关系，找出匹配的卡片',
    icon: 'fas fa-brain'
  },
  {
    type: 'quiz',
    title: '编码知识问答',
    description: '回答关于字符编码的理论知识问题',
    icon: 'fas fa-question-circle'
  },
  {
    type: 'speed',
    title: '编码速打',
    description: '快速输入字符的编码值，考验你的反应速度',
    icon: 'fas fa-keyboard'
  }
]

const gameStats = computed(() => ({
  totalScore: gameData.value.totalScore,
  gamesPlayed: gameData.value.gamesPlayed,
  bestScore: gameData.value.bestScore,
  winRate: Math.round((gameData.value.wins / gameData.value.gamesPlayed) * 100) || 0
}))

const timeProgress = computed(() => {
  if (!gameStartTime.value) return 100
  const elapsed = Date.now() - gameStartTime.value
  const remaining = Math.max(0, gameDuration.value * 1000 - elapsed)
  return (remaining / (gameDuration.value * 1000)) * 100
})

let timerInterval: number | null = null

function startTimer() {
  gameTimer.value = 0
  timerInterval = setInterval(() => {
    if (gameTimer.value !== null) {
      gameTimer.value++
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getCurrentGameTitle(): string {
  const game = games.find(g => g.type === currentGame.value)
  return game?.title || ''
}

function getGameBestScore(gameType: string): number {
  switch (gameType) {
    case 'challenge': return gameData.value.challenge.score
    case 'memory': return gameData.value.memory.score
    case 'quiz': return gameData.value.quiz.score
    case 'speed': return gameData.value.speed.score
    default: return 0
  }
}

function getGameCompletions(gameType: string): number {
  switch (gameType) {
    case 'challenge': return gameData.value.challenge.completed
    case 'memory': return gameData.value.memory.completed
    case 'quiz': return gameData.value.quiz.completed
    case 'speed': return gameData.value.speed.completed
    default: return 0
  }
}

function startGame(gameType: string) {
  currentGame.value = gameType
  gameActive.value = true
  gameEnded.value = false
  currentScore.value = 0
  gameStartTime.value = Date.now()
  
  // 初始化不同游戏的状态
  if (gameType === 'challenge') {
    questionIndex.value = 0
    challengeScore.value = 0
    generateQuestion()
  } else if (gameType === 'memory') {
    matchedPairs.value = 0
    memoryAttempts.value = 0
    flippedCards.value = []
    initMemoryGame()
  } else if (gameType === 'quiz') {
    quizIndex.value = 0
    quizScore.value = 0
    generateQuizQuestion()
  } else if (gameType === 'speed') {
    speedCorrect.value = 0
    speedWrong.value = 0
    speedCombo.value = 0
    speedInput.value = ''
    generateSpeedTarget()
    setTimeout(() => {
      if (speedInputRef.value) {
        speedInputRef.value.focus()
      }
    }, 100)
  }
  
  startTimer()
}

function closeGame() {
  gameActive.value = false
  currentGame.value = ''
  stopTimer()
}

function restartGame() {
  if (currentGame.value) {
    startGame(currentGame.value)
  }
}

function endGame() {
  gameActive.value = false
  gameEnded.value = true
  
  // 计算最终分数
  switch (currentGame.value) {
    case 'challenge':
      currentScore.value = challengeScore.value
      gameEndTitle.value = '编码挑战完成！'
      gameEndMessage.value = `正确答案: ${challengeScore.value / 10}/${totalQuestions.value}`
      break
    case 'memory':
      currentScore.value = matchedPairs.value * 10 - memoryAttempts.value
      gameEndTitle.value = '记忆匹配完成！'
      gameEndMessage.value = `配对成功: ${matchedPairs.value}/${totalPairs.value}`
      break
    case 'quiz':
      currentScore.value = quizScore.value
      gameEndTitle.value = '知识问答完成！'
      gameEndMessage.value = `正确答案: ${quizScore.value / 10}/${totalQuizQuestions.value}`
      break
    case 'speed':
      currentScore.value = speedCorrect.value * 5 - speedWrong.value
      gameEndTitle.value = '速度挑战完成！'
      gameEndMessage.value = `正确: ${speedCorrect.value}, 错误: ${speedWrong.value}`
      break
  }
  
  // 更新游戏数据
  updateGameData(currentGame.value, currentScore.value)
  stopTimer()
}

onUnmounted(() => {
  stopTimer()
})

// 游戏方法
function selectAnswer(index: number) {
  if (showAnswer.value) return
  selectedAnswer.value = index
  showAnswer.value = true
  
  if (index === currentQuestion.value.correctIndex) {
    challengeScore.value += 10
  }
  
  setTimeout(() => {
    nextQuestion()
  }, 1500)
}

function nextQuestion() {
  if (questionIndex.value < totalQuestions.value - 1) {
    questionIndex.value++
    generateQuestion()
    showAnswer.value = false
    selectedAnswer.value = -1
  } else {
    endGame()
  }
}

function generateQuestion() {
  const char = characters[Math.floor(Math.random() * characters.length)]
  const encoding = encodings[Math.floor(Math.random() * encodings.length)]
  const correctAnswer = getCharacterEncoding(char, encoding)
  
  const options = [correctAnswer]
  while (options.length < 4) {
    const wrongAnswer = generateWrongAnswer(encoding)
    if (!options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }
  
  const shuffledOptions = options.sort(() => Math.random() - 0.5)
  const correctIndex = shuffledOptions.indexOf(correctAnswer)
  
  currentQuestion.value = {
    char,
    encoding,
    options: shuffledOptions,
    correctIndex
  }
}

function getCharacterEncoding(char: string, encoding: string): string {
  const buffer = new TextEncoder().encode(char)
  switch (encoding) {
    case 'utf-8':
      return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join(' ')
    case 'ascii':
      return buffer[0] <= 127 ? buffer[0].toString() : '?'
    case 'utf-16':
      return char.charCodeAt(0).toString(16).padStart(4, '0')
    default:
      return char.charCodeAt(0).toString()
  }
}

function generateWrongAnswer(encoding: string): string {
  const random = Math.floor(Math.random() * 255)
  switch (encoding) {
    case 'utf-8':
      return random.toString(16).padStart(2, '0')
    case 'ascii':
      return random.toString()
    case 'utf-16':
      return random.toString(16).padStart(4, '0')
    default:
      return random.toString()
  }
}

function flipCard(index: number) {
  if (memoryCards.value[index].flipped || memoryCards.value[index].matched) return
  
  memoryCards.value[index].flipped = true
  flippedCards.value.push(index)
  
  if (flippedCards.value.length === 2) {
    memoryAttempts.value++
    checkMemoryMatch()
  }
}

function checkMemoryMatch() {
  const [first, second] = flippedCards.value
  const firstCard = memoryCards.value[first]
  const secondCard = memoryCards.value[second]
  
  if (firstCard.pair === secondCard.pair) {
    firstCard.matched = true
    secondCard.matched = true
    matchedPairs.value++
    flippedCards.value = []
    
    if (matchedPairs.value === totalPairs.value) {
      setTimeout(() => endGame(), 1000)
    }
  } else {
    firstCard.wrong = true
    secondCard.wrong = true
    
    setTimeout(() => {
      firstCard.flipped = false
      secondCard.flipped = false
      firstCard.wrong = false
      secondCard.wrong = false
      flippedCards.value = []
    }, 1000)
  }
}

function initMemoryGame() {
  const pairs = []
  for (let i = 0; i < totalPairs.value; i++) {
    const char = characters[i % characters.length]
    const encoding = encodings[i % encodings.length]
    pairs.push({ char, encoding: getCharacterEncoding(char, encoding), pair: i })
    pairs.push({ char, encoding: getCharacterEncoding(char, encoding), pair: i })
  }
  
  memoryCards.value = pairs.sort(() => Math.random() - 0.5).map((item, index) => ({
    id: index,
    content: item.char,
    pair: item.pair,
    flipped: false,
    matched: false,
    wrong: false
  }))
}

function selectQuizAnswer(index: number) {
  if (showQuizAnswer.value) return
  selectedQuizAnswer.value = index
  showQuizAnswer.value = true
  
  if (index === currentQuizQuestion.value.correctIndex) {
    quizScore.value += 10
  }
  
  setTimeout(() => {
    nextQuizQuestion()
  }, 1500)
}

function nextQuizQuestion() {
  if (quizIndex.value < totalQuizQuestions.value - 1) {
    quizIndex.value++
    generateQuizQuestion()
    showQuizAnswer.value = false
    selectedQuizAnswer.value = -1
  } else {
    endGame()
  }
}

function generateQuizQuestion() {
  const questions = [
    {
      question: "UTF-8最多可以用几个字节表示一个字符？",
      options: ["1字节", "2字节", "3字节", "4字节"],
      correctIndex: 3
    },
    {
      question: "ASCII编码可以表示多少个字符？",
      options: ["64", "128", "256", "512"],
      correctIndex: 1
    },
    {
      question: "Unicode的目标是什么？",
      options: ["压缩文本", "统一字符编码", "加密文本", "优化存储"],
      correctIndex: 1
    }
  ]
  
  currentQuizQuestion.value = questions[Math.floor(Math.random() * questions.length)]
}

function submitSpeedAnswer() {
  const correct = speedTarget.value.correct
  if (speedInput.value.trim() === correct) {
    speedCorrect.value++
    speedCombo.value++
    generateSpeedTarget()
  } else {
    speedWrong.value++
    speedCombo.value = 0
  }
  speedInput.value = ''
  if (speedInputRef.value) {
    speedInputRef.value.focus()
  }
}

function checkSpeedInput() {
  // 实时检查输入，可以添加提示逻辑
}

function generateSpeedTarget() {
  const char = characters[Math.floor(Math.random() * characters.length)]
  const encoding = encodings[Math.floor(Math.random() * encodings.length)]
  speedTarget.value = {
    char,
    encoding,
    correct: getCharacterEncoding(char, encoding)
  }
}

// 新增方法用于更新游戏数据
function updateGameData(gameType: string, score: number) {
  gameData.value.totalScore += score
  gameData.value.gamesPlayed += 1
  
  if (score > 0) {
    gameData.value.wins += 1
  }
  
  // 更新游戏特定数据
  switch (gameType) {
    case 'challenge':
      if (score > gameData.value.challenge.score) {
        gameData.value.challenge.score = score
      }
      gameData.value.challenge.completed += 1
      break
    case 'memory':
      if (score > gameData.value.memory.score) {
        gameData.value.memory.score = score
      }
      gameData.value.memory.completed += 1
      break
    case 'quiz':
      if (score > gameData.value.quiz.score) {
        gameData.value.quiz.score = score
      }
      gameData.value.quiz.completed += 1
      break
    case 'speed':
      if (score > gameData.value.speed.score) {
        gameData.value.speed.score = score
      }
      gameData.value.speed.completed += 1
      break
  }
  
  // 更新最高分
  if (score > gameData.value.bestScore) {
    gameData.value.bestScore = score
  }
  
  // 保存到本地存储
  localStorage.setItem('playground-data', JSON.stringify(gameData.value))
}

// 初始化时加载本地数据
function loadGameData() {
  const savedData = localStorage.getItem('playground-data')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      gameData.value = { ...gameData.value, ...data }
    } catch (error) {
      console.error('加载游戏数据失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  loadGameData()
})
</script>

<style scoped>
.playground-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1a1a3a, #0a0a0a);
  color: white;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2, #ff7b7b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
}

.header-content p {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
}

.game-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.game-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 2rem;
  transition: all 0.3s ease;
}

.game-icon.challenge {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.game-icon.memory {
  background: linear-gradient(135deg, #ff9a56, #ff7b7b);
}

.game-icon.quiz {
  background: linear-gradient(135deg, #40ffaa, #4079ff);
}

.game-icon.speed {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.game-card:hover .game-icon {
  transform: scale(1.1) rotate(5deg);
}

.game-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: white;
}

.game-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.6;
}

.game-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.game-stat {
  text-align: center;
}

.game-stat .stat-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.game-stat .stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
}

.play-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  width: 100%;
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.game-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.game-container {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.game-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.game-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.game-timer, .game-score {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 15px;
  border-radius: 25px;
  font-weight: 600;
}

.close-button, .close-button-end {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover, .close-button-end:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.game-content {
  padding: 30px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-text {
  font-size: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.game-end {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.end-content {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.end-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.end-stats {
  margin-bottom: 30px;
}

.end-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.restart-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 25px;
  padding: 15px 25px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.restart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .playground-page {
    padding: 15px;
  }
  
  .header-content h1 {
    font-size: 2.5rem;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* 编码挑战游戏样式 */
.challenge-game {
  text-align: center;
  padding: 2rem;
  width: 100%;
}

.question-container {
  margin-bottom: 2rem;
}

.question-char {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.question-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.option-btn {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.option-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.option-btn.correct {
  background: linear-gradient(135deg, #40ffaa, #4079ff);
  border-color: #40ffaa;
  color: white;
  box-shadow: 0 4px 15px rgba(64, 255, 170, 0.3);
}

.option-btn.wrong {
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-color: #ff6b6b;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.question-progress, .quiz-progress {
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* 记忆匹配游戏样式 */
.memory-game {
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.memory-card {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  perspective: 1000px;
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
}

.memory-card:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.memory-card.matched {
  border-color: #40ffaa;
  opacity: 0.7;
  background: rgba(64, 255, 170, 0.2);
}

.memory-card.wrong {
  border-color: #ff6b6b;
  animation: shake 0.5s ease-in-out;
  background: rgba(255, 107, 107, 0.2);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 6px;
  backface-visibility: hidden;
  transition: transform 0.6s ease;
}

.card-front {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.card-back {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  transform: rotateY(180deg);
}

.memory-card.flipped .card-front {
  transform: rotateY(180deg);
}

.memory-card.flipped .card-back {
  transform: rotateY(0);
}

.memory-stats, .speed-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.memory-stats .stat, .speed-stats .stat {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 知识问答游戏样式 */
.quiz-game {
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.quiz-question h3 {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.quiz-option {
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.quiz-option:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(10px);
}

.quiz-option.correct {
  background: linear-gradient(135deg, #40ffaa, #4079ff);
  border-color: #40ffaa;
  color: white;
}

.quiz-option.wrong {
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-color: #ff6b6b;
  color: white;
}

/* 速度输入游戏样式 */
.speed-game {
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.speed-target {
  margin-bottom: 2rem;
}

.target-char {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.target-info {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.speed-input {
  display: flex;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.speed-input-field {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  outline: none;
  transition: border-color 0.3s ease;
}

.speed-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.speed-input-field:focus {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.submit-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 通用进度条样式 */
.game-progress {
  margin-top: 2rem;
  text-align: center;
}

.progress-text {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.time-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
}

.time-fill {
  height: 100%;
  background: linear-gradient(90deg, #40ffaa, #ffc107, #ff6b6b);
  transition: width 0.1s linear;
  border-radius: 4px;
}

/* 动画效果 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .memory-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 300px;
  }
  
  .speed-input {
    flex-direction: column;
  }
  
  .memory-stats,
  .speed-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}
</style> 