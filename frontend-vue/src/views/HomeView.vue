<template>
  <div class="home-page">
    <!-- 宇宙背景和粒子效果 -->
    <div class="cosmic-bg"></div>
    <div class="particles" ref="particlesContainer"></div>
    
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          下一代<br>字符编码转换器
        </h1>
        <p class="hero-subtitle">专业级编码工具 · 可视化分析 · 互动学习</p>
        <p class="hero-description">
          集成先进的编码转换技术，提供实时可视化分析、互动式编码游戏，
          以及完整的历史记录管理。支持 UTF-8、UTF-16、GBK、ASCII 等多种编码格式。
        </p>
        <div class="hero-cta">
          <router-link to="/converter" class="cta-button">
            <i class="fas fa-sync-alt"></i> 开始转换
          </router-link>
          <router-link to="/playground" class="cta-button secondary">
            <i class="fas fa-gamepad"></i> 学习游戏
          </router-link>
        </div>
      </div>
    </section>

    <!-- 特性展示区域 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">强大功能</h2>
        <p class="section-subtitle">专业工具，让编码转换变得简单高效</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" @click="$router.push('/converter')">
          <div class="feature-icon converter">
            <i class="fas fa-sync-alt"></i>
          </div>
          <h3 class="feature-title">智能转换器</h3>
          <p class="feature-description">
            支持多种编码格式互转，实时检测文本编码，
            提供详细的转换统计和字节分析。
          </p>
          <div class="feature-link">
            <span>立即使用</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="feature-card" @click="$router.push('/playground')">
          <div class="feature-icon playground">
            <i class="fas fa-gamepad"></i>
          </div>
          <h3 class="feature-title">编码游乐场</h3>
          <p class="feature-description">
            通过有趣的互动游戏学习编码知识，
            包括编码挑战、记忆配对、知识问答等。
          </p>
          <div class="feature-link">
            <span>开始游戏</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="feature-card" @click="$router.push('/visualizer')">
          <div class="feature-icon visualizer">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3 class="feature-title">可视化分析</h3>
          <p class="feature-description">
            深入分析字符编码效率，生成直观的图表，
            帮助理解不同编码的特点和应用场景。
          </p>
          <div class="feature-link">
            <span>查看分析</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="feature-card" @click="$router.push('/history')">
          <div class="feature-icon history">
            <i class="fas fa-history"></i>
          </div>
          <h3 class="feature-title">历史记录</h3>
          <p class="feature-description">
            完整记录所有转换历史，支持搜索筛选，
            让您的工作更加高效有序。
          </p>
          <div class="feature-link">
            <span>查看记录</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计数据展示 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number" ref="statNumber1">{{ stats.conversions }}</div>
          <div class="stat-label">转换次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" ref="statNumber2">{{ stats.encodings }}</div>
          <div class="stat-label">支持编码</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" ref="statNumber3">{{ stats.characters }}</div>
          <div class="stat-label">处理字符</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" ref="statNumber4">{{ stats.users }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 统计数据
const stats = ref({
  conversions: 0,
  encodings: 0,
  characters: 0,
  users: 0
})

// 目标数值
const targetStats = {
  conversions: 125000,
  encodings: 15,
  characters: 50000000,
  users: 8500
}

// 粒子容器引用
const particlesContainer = ref<HTMLElement>()
const statNumber1 = ref<HTMLElement>()
const statNumber2 = ref<HTMLElement>()
const statNumber3 = ref<HTMLElement>()
const statNumber4 = ref<HTMLElement>()

// 粒子动画
function createParticles() {
  if (!particlesContainer.value) return
  
  // 清除现有粒子
  particlesContainer.value.innerHTML = ''
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div')
    const particleClass = `particle-${Math.floor(Math.random() * 3) + 1}`
    particle.className = `particle ${particleClass}`
    
    // 随机位置和动画延迟
    particle.style.left = Math.random() * 100 + '%'
    particle.style.animationDelay = Math.random() * 15 + 's'
    particle.style.animationDuration = (8 + Math.random() * 10) + 's'
    
    particlesContainer.value.appendChild(particle)
  }
}

// 数字动画
function animateNumbers() {
  const duration = 2000 // 2秒
  const frameDuration = 1000 / 60 // 60fps
  const totalFrames = Math.round(duration / frameDuration)
  
  Object.keys(targetStats).forEach((key, index) => {
    const target = targetStats[key as keyof typeof targetStats]
    let frame = 0
    
    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentValue = Math.round(target * progress)
      
      stats.value[key as keyof typeof stats.value] = currentValue
      
      if (frame === totalFrames) {
        clearInterval(counter)
        stats.value[key as keyof typeof stats.value] = target
      }
    }, frameDuration)
  })
}

// 页面滚动视差效果
function handleScroll() {
  const scrolled = window.pageYOffset
  const parallax = document.querySelector('.cosmic-bg') as HTMLElement
  
  if (parallax) {
    const speed = scrolled * 0.5
    parallax.style.transform = `translateY(${speed}px)`
  }
}

onMounted(() => {
  createParticles()
  
  // 延迟启动数字动画，增强视觉效果
  setTimeout(() => {
    animateNumbers()
  }, 500)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
  
  // 定期重新生成粒子
  const particleInterval = setInterval(createParticles, 30000)
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearInterval(particleInterval)
  })
})
</script>

<style scoped>
.home-page {
  position: relative;
  overflow-x: hidden;
}

/* 宇宙背景动画 */
.cosmic-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -2;
  background: radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(120, 119, 255, 0.3) 0%, transparent 50%);
  animation: cosmicDrift 20s ease-in-out infinite;
}

@keyframes cosmicDrift {
  0%, 100% { transform: translateX(0px) translateY(0px); }
  33% { transform: translateX(-50px) translateY(-30px); }
  66% { transform: translateX(50px) translateY(-20px); }
}

/* 浮动粒子系统 */
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float linear infinite;
}

.particle-1 {
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  animation-duration: 8s;
}

.particle-2 {
  width: 2px;
  height: 2px;
  background: rgba(102, 126, 234, 0.6);
  animation-duration: 12s;
}

.particle-3 {
  width: 1px;
  height: 1px;
  background: rgba(240, 147, 251, 0.8);
  animation-duration: 15s;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) rotate(360deg);
    opacity: 0;
  }
}

/* 英雄区域 */
.hero {
  padding: 150px 20px 100px;
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 50%, rgba(102, 126, 234, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  font-weight: 500;
  line-height: 1.4;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 680px;
  margin: 0 auto 50px;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

.cta-button.secondary {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  box-shadow: none;
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 特性展示区域 */
.features-section {
  padding: 100px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: white;
  position: relative;
}

.feature-icon.converter { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.feature-icon.playground { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.feature-icon.visualizer { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.feature-icon.history { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
  color: white;
}

.feature-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  text-align: center;
  margin-bottom: 24px;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin: 0 auto;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  transition: all 0.3s ease;
  justify-content: center;
}

.feature-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 统计数据展示 */
.stats-section {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  padding: 60px 40px;
  margin: 0 20px 100px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  counter-reset: stat-counter;
}

.stat-label {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    padding: 0 10px;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .hero {
    padding: 120px 20px 80px;
  }
}

@media (max-width: 480px) {
  .cta-button {
    padding: 14px 24px;
    font-size: 0.9rem;
  }
  
  .stats-section {
    padding: 40px 20px;
    margin: 0 10px 60px;
  }
}
</style> 