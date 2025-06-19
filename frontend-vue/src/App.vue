<template>
  <div id="app" :class="{ 'dark-theme': isDark, 'glass-cursor-enabled': glassCursorEnabled }">
    <NavBar @toggle-glass-cursor="toggleGlassCursor" />
    <LiquidGlassCursor :is-enabled="glassCursorEnabled" />
    <router-view />
    <FloatingActionButton @action="handleFabAction" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { useThemeStore } from '@/store/theme'
import NavBar from '@/components/NavBar.vue'
import LiquidGlassCursor from '@/components/LiquidGlassCursor.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// 全局液体玻璃光标状态
const glassCursorEnabled = ref(false)

const toggleGlassCursor = () => {
  glassCursorEnabled.value = !glassCursorEnabled.value
}

// 处理悬浮按钮操作
const handleFabAction = (actionId: string) => {
  switch (actionId) {
    case 'toggleTheme':
      themeStore.toggleTheme()
      break
    case 'showHelp':
      // 可以打开帮助对话框
      console.log('显示帮助')
      break
    // 其他操作已在FloatingActionButton组件内部处理
  }
}

// 提供给子组件使用
provide('glassCursorEnabled', glassCursorEnabled)
provide('toggleGlassCursor', toggleGlassCursor)
</script>

<style>
/* 全局样式 */
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 当启用液体玻璃光标时的全局样式 */
.glass-cursor-enabled {
  cursor: none !important;
}

.glass-cursor-enabled * {
  cursor: none !important;
}

/* 为可交互元素添加特殊样式 */
.glass-cursor-enabled a,
.glass-cursor-enabled button,
.glass-cursor-enabled .clickable {
  cursor: none !important;
}

/* 暗色主题适配 */
.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
}
</style> 