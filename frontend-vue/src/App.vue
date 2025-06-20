<template>
  <div id="app" :class="{ 'dark-theme': isDark, 'glass-cursor-enabled': glassCursorEnabled }">
    <NavBar @toggle-glass-cursor="toggleGlassCursor" />
    <LiquidGlassCursor :is-enabled="glassCursorEnabled" />
    <router-view />
    <FloatingActionButton @action="handleFabAction" />
    <Dock :items="dockItems" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { useThemeStore } from '@/store/theme'
import NavBar from '@/components/NavBar.vue'
import LiquidGlassCursor from '@/components/LiquidGlassCursor.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'
import Dock from '@/components/Dock.vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()

// 定义Dock项目
const dockItems = ref([
  {
    icon: '🏠',
    label: '首页',
    onClick: () => router.push('/'),
    className: 'dock-home'
  },
  {
    icon: '🔄',
    label: '编码转换',
    onClick: () => router.push('/encode'),
    className: 'dock-encode'
  },
  {
    icon: '📊',
    label: '统计',
    onClick: () => alert('统计功能'),
    className: 'dock-stats'
  },
  {
    icon: '⚙️',
    label: '设置',
    onClick: () => alert('设置功能'),
    className: 'dock-settings'
  },
  {
    icon: '❓',
    label: '关于',
    onClick: () => router.push('/about'),
    className: 'dock-about'
  },
  {
    icon: '🎯',
    label: '液体光标',
    onClick: toggleGlassCursor,
    className: 'dock-cursor'
  }
])
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

.main-view {
  flex: 1;
  padding: 2rem;
  padding-bottom: 110px; /* 为现代化Dock留出适当空间 */
  overflow-y: auto;
}

/* Dock项目自定义样式 */
:deep(.dock-home) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-color: rgba(102, 126, 234, 0.5) !important;
}

:deep(.dock-encode) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border-color: rgba(240, 147, 251, 0.5) !important;
}

:deep(.dock-stats) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border-color: rgba(79, 172, 254, 0.5) !important;
}

:deep(.dock-settings) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
  border-color: rgba(67, 233, 123, 0.5) !important;
}

:deep(.dock-about) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
  border-color: rgba(250, 112, 154, 0.5) !important;
}

:deep(.dock-cursor) {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
  border-color: rgba(168, 237, 234, 0.5) !important;
}
</style> 

