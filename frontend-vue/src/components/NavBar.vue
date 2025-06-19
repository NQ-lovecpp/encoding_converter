<template>
  <nav class="navbar" :class="{ 'navbar-hidden': isNavHidden, 'navbar-visible': !isNavHidden }">
    <div class="nav-content">
      <div class="logo">
        <i :class="`fas ${currentIcon} logo-icon`"></i>
        <span class="animated-gradient-text">字符编码转换器 Pro</span>
      </div>
      
      <ul class="nav-links" :class="{ 'show': showMobileMenu }">
        <li v-for="link in navLinks" :key="link.name">
          <router-link 
            :to="link.path" 
            class="nav-link"
            :class="{ 'active': $route.name === link.name }"
            @click="closeMobileMenu"
          >
            <i :class="link.icon"></i> {{ link.label }}
          </router-link>
        </li>
      </ul>
      
      <div class="nav-actions">
        <button class="glass-cursor-toggle" @click="toggleGlassCursor" :title="glassCursorEnabled ? '关闭液体玻璃光标' : '开启液体玻璃光标'">
          <i class="fas fa-mouse-pointer"></i>
        </button>
        <button class="theme-toggle" @click="toggleTheme" title="切换主题">
          <i class="fas fa-palette"></i>
        </button>
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'

const route = useRoute()
const themeStore = useThemeStore()
const showMobileMenu = ref(false)
const isNavHidden = ref(false)

// 从父组件注入光标状态
const glassCursorEnabled = inject('glassCursorEnabled', ref(false))
const toggleGlassCursor = inject('toggleGlassCursor', () => {})

let lastScrollY = 0

// 导航链接配置
const navLinks = [
  { name: 'Home', path: '/', label: '主页', icon: 'fas fa-home' },
  { name: 'Converter', path: '/converter', label: '转换器', icon: 'fas fa-sync-alt' },
  { name: 'Playground', path: '/playground', label: '游乐场', icon: 'fas fa-gamepad' },
  { name: 'Visualizer', path: '/visualizer', label: '可视化', icon: 'fas fa-chart-line' },
  { name: 'History', path: '/history', label: '历史', icon: 'fas fa-history' }
]

// 当前页面对应的图标
const currentIcon = computed(() => {
  const current = navLinks.find(link => link.name === route.name)
  return current ? current.icon.replace('fas fa-', '') : 'code'
})

// 滚动处理
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  if (currentScrollY > 100) { // 滚动超过100px才开始隐藏/显示
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      // 向下滚动且超过200px，隐藏导航栏
      isNavHidden.value = true
    } else if (currentScrollY < lastScrollY) {
      // 向上滚动，显示导航栏
      isNavHidden.value = false
    }
  } else {
    // 在顶部附近，总是显示
    isNavHidden.value = false
  }
  
  lastScrollY = currentScrollY
}

// 方法
function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
  padding: 0.75rem 0;
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-hidden {
  transform: translateY(-100%);
}

.navbar-visible {
  transform: translateY(0);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  position: relative;
}

/* 渐变动画文字效果 */
.animated-gradient-text {
  position: relative;
  display: inline-block;
  background: linear-gradient(
    90deg,
    #ffffff,
    #40ffaa,
    #4079ff,
    #ffffff,
    #40ffaa,
    #4079ff,
    #ffffff
  );
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 4s ease-in-out infinite;
  will-change: background-position;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 50%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 50%; }
  100% { background-position: 0% 50%; }
}

.logo-icon {
  color: #40ffaa;
  filter: drop-shadow(0 0 8px rgba(64, 255, 170, 0.3));
  animation: iconGlow 3s ease-in-out infinite alternate;
  will-change: color, filter;
}

@keyframes iconGlow {
  0% {
    color: #40ffaa;
    filter: drop-shadow(0 0 8px rgba(64, 255, 170, 0.3));
  }
  50% {
    color: #4079ff;
    filter: drop-shadow(0 0 12px rgba(64, 121, 255, 0.5));
  }
  100% {
    color: #ffffff;
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
  }
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.nav-link:hover {
  color: #40ffaa;
  background: rgba(64, 255, 170, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  color: #40ffaa;
  background: rgba(64, 255, 170, 0.15);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle,
.mobile-menu-toggle,
.glass-cursor-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.theme-toggle:hover,
.mobile-menu-toggle:hover,
.glass-cursor-toggle:hover {
  color: #40ffaa;
  background: rgba(64, 255, 170, 0.1);
}

.glass-cursor-toggle {
  position: relative;
}

.glass-cursor-toggle.active {
  color: #40ffaa;
  background: rgba(64, 255, 170, 0.15);
}

.mobile-menu-toggle {
  display: none;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .nav-links.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .animated-gradient-text {
    font-size: 0.9rem;
  }
}

/* 针对低性能设备的优化 */
@media (prefers-reduced-motion: reduce) {
  .animated-gradient-text {
    animation: none;
    background: linear-gradient(90deg, #ffffff, #40ffaa);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .logo-icon {
    animation: none;
    color: #40ffaa;
    filter: drop-shadow(0 0 8px rgba(64, 255, 170, 0.3));
  }
  
  .navbar {
    transition: none;
  }
}

/* 暗色主题 */
.dark-theme .navbar {
  background: rgba(15, 23, 42, 0.9);
}

.dark-theme .nav-link {
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .theme-toggle,
.dark-theme .mobile-menu-toggle,
.dark-theme .glass-cursor-toggle {
  color: rgba(255, 255, 255, 0.9);
}
</style> 