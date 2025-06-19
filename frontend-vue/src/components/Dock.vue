<template>
  <div class="dock-outer" :style="{ height: `${height}px` }">
    <div
      ref="dockRef"
      class="dock-panel"
      :class="className"
      :style="{ height: `${panelHeight}px` }"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      role="toolbar"
      aria-label="Application dock"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        ref="itemRefs"
        class="dock-item"
        :class="item.className"
        :style="{ 
          width: `${itemSizes[index] || baseItemSize}px`, 
          height: `${itemSizes[index] || baseItemSize}px` 
        }"
        @click="item.onClick"
        @mouseenter="() => setHovered(index, true)"
        @mouseleave="() => setHovered(index, false)"
        @focus="() => setHovered(index, true)"
        @blur="() => setHovered(index, false)"
        tabindex="0"
        role="button"
        aria-haspopup="true"
      >
        <div class="dock-icon">
          <component :is="item.icon" />
        </div>
        <div
          v-if="hoveredIndex === index"
          class="dock-label"
          :style="{ transform: 'translateX(-50%)', left: '50%' }"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'

interface DockItem {
  icon: any
  label: string
  onClick: () => void
  className?: string
}

interface DockProps {
  items: DockItem[]
  className?: string
  magnification?: number
  distance?: number
  panelHeight?: number
  dockHeight?: number
  baseItemSize?: number
}

const props = withDefaults(defineProps<DockProps>(), {
  className: '',
  magnification: 70,
  distance: 200,
  panelHeight: 68,
  dockHeight: 256,
  baseItemSize: 50
})

const dockRef = ref<HTMLDivElement>()
const itemRefs = ref<HTMLDivElement[]>([])
const hoveredIndex = ref(-1)
const mouseX = ref(Infinity)
const isHovered = ref(false)
const itemSizes = ref<number[]>([])

const height = computed(() => {
  return Math.max(props.dockHeight, props.magnification + props.magnification / 2 + 4)
})

const setHovered = (index: number, hovered: boolean) => {
  if (hovered) {
    hoveredIndex.value = index
  } else {
    hoveredIndex.value = -1
  }
}

const handleMouseMove = (event: MouseEvent) => {
  isHovered.value = true
  mouseX.value = event.pageX
  updateItemSizes()
}

const handleMouseLeave = () => {
  isHovered.value = false
  mouseX.value = Infinity
  hoveredIndex.value = -1
  updateItemSizes()
}

const updateItemSizes = () => {
  if (!dockRef.value || !itemRefs.value.length) return

  const newSizes: number[] = []
  
  itemRefs.value.forEach((item, index) => {
    if (!item) {
      newSizes[index] = props.baseItemSize
      return
    }

    const rect = item.getBoundingClientRect()
    const itemCenter = rect.x + props.baseItemSize / 2
    const mouseDistance = mouseX.value - itemCenter

    // 计算放大效果
    const absDistance = Math.abs(mouseDistance)
    let scale = 1
    
    if (absDistance < props.distance && isHovered.value) {
      const factor = 1 - (absDistance / props.distance)
      scale = 1 + (factor * (props.magnification / props.baseItemSize - 1))
    }
    
    newSizes[index] = props.baseItemSize * scale
  })
  
  itemSizes.value = newSizes
}

// 使用requestAnimationFrame来平滑动画
let animationId: number
const animate = () => {
  updateItemSizes()
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.dock-outer {
  margin: 0 0.5rem;
  display: flex;
  max-width: 100%;
  align-items: center;
  transition: height 0.3s ease;
}

.dock-panel {
  position: fixed;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  width: fit-content;
  gap: 1rem;
  border-radius: 1rem;
  background-color: #060010;
  border: 1px solid #222;
  padding: 0 0.5rem 0.5rem;
  z-index: 1000;
}

.dock-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #060010;
  border: 1px solid #222;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.dock-label {
  position: absolute;
  top: -2.5rem;
  white-space: nowrap;
  border-radius: 0.375rem;
  border: 1px solid #222;
  background-color: #060010;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: #fff;
  pointer-events: none;
  z-index: 10;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style> 