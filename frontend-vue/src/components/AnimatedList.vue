<template>
  <div class="scroll-list-container" :class="className">
    <div
      ref="listRef"
      class="scroll-list"
      :class="{ 'no-scrollbar': !displayScrollbar }"
      @scroll="handleScroll"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        class="animated-item"
        @mouseenter="setSelectedIndex(index)"
        @click="handleItemClick(item, index)"
      >
        <div
          class="item"
          :class="[{ selected: selectedIndex === index }, itemClassName]"
        >
          <p class="item-text">{{ item }}</p>
        </div>
      </div>
    </div>
    
    <div
      v-if="showGradients"
      class="top-gradient"
      :style="{ opacity: topGradientOpacity }"
    ></div>
    <div
      v-if="showGradients"
      class="bottom-gradient"
      :style="{ opacity: bottomGradientOpacity }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface AnimatedListProps {
  items?: string[]
  onItemSelect?: (item: string, index: number) => void
  showGradients?: boolean
  enableArrowNavigation?: boolean
  className?: string
  itemClassName?: string
  displayScrollbar?: boolean
  initialSelectedIndex?: number
}

const props = withDefaults(defineProps<AnimatedListProps>(), {
  items: () => [
    'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
    'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10',
    'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 15'
  ],
  showGradients: true,
  enableArrowNavigation: true,
  className: '',
  itemClassName: '',
  displayScrollbar: true,
  initialSelectedIndex: -1
})

const listRef = ref<HTMLDivElement>()
const selectedIndex = ref(props.initialSelectedIndex)
const keyboardNav = ref(false)
const topGradientOpacity = ref(0)
const bottomGradientOpacity = ref(1)

const setSelectedIndex = (index: number) => {
  selectedIndex.value = index
}

const handleItemClick = (item: string, index: number) => {
  setSelectedIndex(index)
  if (props.onItemSelect) {
    props.onItemSelect(item, index)
  }
}

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  topGradientOpacity.value = Math.min(scrollTop / 50, 1)
  const bottomDistance = scrollHeight - (scrollTop + clientHeight)
  bottomGradientOpacity.value = 
    scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.enableArrowNavigation) return
  
  if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
    e.preventDefault()
    keyboardNav.value = true
    setSelectedIndex(Math.min(selectedIndex.value + 1, props.items.length - 1))
  } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
    e.preventDefault()
    keyboardNav.value = true
    setSelectedIndex(Math.max(selectedIndex.value - 1, 0))
  } else if (e.key === 'Enter') {
    if (selectedIndex.value >= 0 && selectedIndex.value < props.items.length) {
      e.preventDefault()
      if (props.onItemSelect) {
        props.onItemSelect(props.items[selectedIndex.value], selectedIndex.value)
      }
    }
  }
}

const scrollToSelectedItem = async () => {
  if (!keyboardNav.value || selectedIndex.value < 0 || !listRef.value) return
  
  await nextTick()
  
  const container = listRef.value
  const selectedItem = container.querySelector(`[data-index="${selectedIndex.value}"]`) as HTMLElement
  
  if (selectedItem) {
    const extraMargin = 50
    const containerScrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const itemTop = selectedItem.offsetTop
    const itemBottom = itemTop + selectedItem.offsetHeight
    
    if (itemTop < containerScrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' })
    } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
      container.scrollTo({
        top: itemBottom - containerHeight + extraMargin,
        behavior: 'smooth',
      })
    }
  }
  
  keyboardNav.value = false
}

// 监听选中项变化
watch(() => selectedIndex.value, scrollToSelectedItem)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.scroll-list-container {
  position: relative;
  width: 500px;
}

.scroll-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.scroll-list::-webkit-scrollbar {
  width: 8px;
}

.scroll-list::-webkit-scrollbar-track {
  background: #060010;
}

.scroll-list::-webkit-scrollbar-thumb {
  background: #271E37;
  border-radius: 4px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animated-item {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.animated-item:hover {
  transform: scale(1.02);
}

.item {
  padding: 16px;
  background-color: #170D27;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.item.selected {
  background-color: #271E37;
}

.item-text {
  color: white;
  margin: 0;
}

.top-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to bottom, #060010, transparent);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.bottom-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, #060010, transparent);
  pointer-events: none;
  transition: opacity 0.3s ease;
}
</style> 