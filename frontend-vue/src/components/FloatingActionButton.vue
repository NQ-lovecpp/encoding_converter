<template>
  <div class="fab-container" :class="{ 'expanded': isExpanded }">
    <!-- 主按钮 -->
    <button 
      class="fab main-fab"
      @click="toggleExpand"
      :aria-label="isExpanded ? '关闭菜单' : '打开菜单'"
    >
      <i class="fas fa-plus" :class="{ 'rotated': isExpanded }"></i>
    </button>
    
    <!-- 子按钮组 -->
    <transition-group 
      name="fab-item" 
      tag="div" 
      class="fab-items"
      v-show="isExpanded"
    >
      <button
        v-for="(action, index) in actions"
        :key="action.id"
        class="fab fab-item"
        :style="{ '--index': index }"
        @click="handleAction(action)"
        :aria-label="action.label"
      >
        <i :class="action.icon"></i>
      </button>
    </transition-group>
    
    <!-- 背景遮罩 -->
    <div 
      class="fab-backdrop"
      v-show="isExpanded"
      @click="toggleExpand"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

interface FabAction {
  id: string
  icon: string
  label: string
  action: string
}

const props = defineProps<{
  actions?: FabAction[]
}>()

const emit = defineEmits<{
  action: [actionId: string]
}>()

const isExpanded = ref(false)

const defaultActions: FabAction[] = [
  {
    id: 'scroll-top',
    icon: 'fas fa-arrow-up',
    label: '回到顶部',
    action: 'scrollTop'
  },
  {
    id: 'theme',
    icon: 'fas fa-palette',
    label: '切换主题',
    action: 'toggleTheme'
  },
  {
    id: 'fullscreen',
    icon: 'fas fa-expand',
    label: '全屏模式',
    action: 'toggleFullscreen'
  },
  {
    id: 'help',
    icon: 'fas fa-question-circle',
    label: '帮助',
    action: 'showHelp'
  }
]

const actions = props.actions || defaultActions

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleAction = (action: FabAction) => {
  emit('action', action.action)
  isExpanded.value = false
  
  // 内置动作处理
  switch (action.action) {
    case 'scrollTop':
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'toggleFullscreen':
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      break
  }
}

// 点击外部关闭
import { onMounted, onUnmounted } from 'vue'

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.fab-container')) {
    isExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
}

.fab {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #40ffaa, #4079ff);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(64, 255, 170, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(64, 255, 170, 0.5);
}

.fab:active {
  transform: scale(0.95);
}

.main-fab {
  bottom: 0;
  right: 0;
  z-index: 1002;
}

.main-fab .fa-plus {
  transition: transform 0.3s ease;
}

.main-fab .fa-plus.rotated {
  transform: rotate(45deg);
}

.fab-items {
  position: relative;
}

.fab-item {
  bottom: 0;
  right: 0;
  transform-origin: center;
  z-index: 1001;
}

.expanded .fab-item {
  animation: fabItemExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.expanded .fab-item:nth-child(1) {
  animation-delay: 0.05s;
}

.expanded .fab-item:nth-child(2) {
  animation-delay: 0.1s;
}

.expanded .fab-item:nth-child(3) {
  animation-delay: 0.15s;
}

.expanded .fab-item:nth-child(4) {
  animation-delay: 0.2s;
}

@keyframes fabItemExpand {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  100% {
    transform: translateY(calc(var(--index) * -70px)) scale(1);
    opacity: 1;
  }
}

/* 进入/离开动画 */
.fab-item-enter-active,
.fab-item-leave-active {
  transition: all 0.3s ease;
}

.fab-item-enter-from {
  transform: translateY(0) scale(0);
  opacity: 0;
}

.fab-item-leave-to {
  transform: translateY(0) scale(0);
  opacity: 0;
}

.fab-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .fab-container {
    bottom: 1rem;
    right: 1rem;
  }
  
  .fab {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  @keyframes fabItemExpand {
    100% {
      transform: translateY(calc(var(--index) * -60px)) scale(1);
    }
  }
}

/* 暗色主题适配 */
.dark-theme .fab {
  background: linear-gradient(135deg, #1e293b, #334155);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(64, 255, 170, 0.2);
}

.dark-theme .fab:hover {
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(64, 255, 170, 0.4);
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .fab,
  .fab-item-enter-active,
  .fab-item-leave-active,
  .main-fab .fa-plus {
    transition: none;
    animation: none;
  }
  
  @keyframes fabItemExpand {
    to {
      transform: translateY(calc(var(--index) * -70px)) scale(1);
    }
  }
}
</style> 