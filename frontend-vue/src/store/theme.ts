import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const isDark = ref(false)

  // 计算属性
  const currentTheme = computed(() => isDark.value ? 'dark' : 'light')

  // 方法
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', currentTheme.value)
    updateThemeClass()
  }

  function setTheme(theme: 'dark' | 'light') {
    isDark.value = theme === 'dark'
    localStorage.setItem('theme', theme)
    updateThemeClass()
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统主题偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateThemeClass()
  }

  function updateThemeClass() {
    if (isDark.value) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    initTheme
  }
}) 