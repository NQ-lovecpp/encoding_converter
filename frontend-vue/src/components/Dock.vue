<template>
  <div class="dock-outer">
    <div
      ref="dockPanel"
      class="dock-panel"
      :class="className"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      role="toolbar"
      aria-label="Application dock"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        ref="dockItems"
        class="dock-item"
        :class="item.className"
        @click="item.onClick"
        @mouseenter="() => hoveredIndex = index"
        @mouseleave="() => hoveredIndex = -1"
        tabindex="0"
        role="button"
        aria-haspopup="true"
      >
        <div class="dock-icon">
          <component :is="item.icon" v-if="typeof item.icon === 'object'" />
          <span v-else class="icon-text">{{ item.icon }}</span>
        </div>
        <Transition name="dock-label">
          <div 
            v-if="hoveredIndex === index"
            class="dock-label"
          >
            {{ item.label }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface DockItem {
  icon: any
  label: string
  onClick: () => void
  className?: string
}

interface Props {
  items: DockItem[]
  className?: string
  magnification?: number
  distance?: number
  panelHeight?: number
  dockHeight?: number
  baseItemSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  magnification: 70,
  distance: 120,
  panelHeight: 80,
  dockHeight: 140,
  baseItemSize: 60
})

const dockPanel = ref<HTMLElement>()
const dockItems = ref<HTMLElement[]>([])
const mouseX = ref(Infinity)
const hoveredIndex = ref(-1)
const isHovered = ref(false)

const currentPanelHeight = computed(() => {
  const maxHeight = Math.max(props.dockHeight, props.magnification + props.magnification / 2 + 4)
  return isHovered.value ? maxHeight : props.panelHeight
})

const itemSizes = computed(() => {
  return props.items.map((_, index) => {
    if (!isHovered.value || mouseX.value === Infinity) {
      return props.baseItemSize
    }

    const item = dockItems.value[index]
    if (!item) return props.baseItemSize

    const rect = item.getBoundingClientRect()
    const itemCenter = rect.x + rect.width / 2
    const distance = Math.abs(mouseX.value - itemCenter)

    if (distance > props.distance) {
      return props.baseItemSize
    }

    // 使用更平滑的放大曲线
    const factor = Math.cos((distance / props.distance) * (Math.PI / 2))
    const maxIncrease = props.magnification - props.baseItemSize
    const size = props.baseItemSize + (maxIncrease * factor)
    return Math.min(props.magnification, Math.max(props.baseItemSize, size))
  })
})

const handleMouseMove = (event: MouseEvent) => {
  mouseX.value = event.pageX
  isHovered.value = true
}

const handleMouseLeave = () => {
  mouseX.value = Infinity
  isHovered.value = false
  hoveredIndex.value = -1
}

onMounted(() => {
  // 确保响应式更新
})

onUnmounted(() => {
  // 清理
})
</script>

<style scoped>
.dock-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
}

.dock-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  gap: 0.75rem;
  border-radius: 1.5rem;
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.dock-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  background: rgba(40, 40, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  outline: none;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dock-item:hover {
  background: rgba(60, 60, 80, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

.dock-item:focus {
  outline: 2px solid rgba(99, 102, 241, 0.5);
  outline-offset: 2px;
}

.dock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
}

.icon-text {
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dock-label {
  position: absolute;
  top: -3rem;
  left: 50%;
  width: fit-content;
  white-space: nowrap;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(15px);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  transform: translateX(-50%);
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 标签动画 */
.dock-label-enter-active,
.dock-label-leave-active {
  transition: all 0.2s ease;
}

.dock-label-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.dock-label-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.dock-label-enter-to,
.dock-label-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 暗色主题适配 */
.dark-theme .dock-panel {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(51, 65, 85, 0.5);
}

.dark-theme .dock-item {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(51, 65, 85, 0.7);
}

.dark-theme .dock-item:hover {
  background: rgba(15, 23, 42, 1);
  border-color: rgba(51, 65, 85, 1);
}

.dark-theme .dock-label {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(51, 65, 85, 0.7);
}
</style> 