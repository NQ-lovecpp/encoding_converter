<template>
  <div
    ref="container"
    class="card-swap-container"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div
      v-for="(card, index) in cards"
      :key="index"
      ref="cardRefs"
      class="card"
      :style="{ 
        width: `${width}px`, 
        height: `${height}px`
      }"
      @click="() => handleCardClick(index)"
    >
      <div class="card-content">
        <h3>{{ card.title || `Card ${index + 1}` }}</h3>
        <p>{{ card.content || 'Default content' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

interface Card {
  title?: string
  content?: string
  [key: string]: any
}

interface CardSwapProps {
  cards?: Card[]
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  onCardClick?: (index: number) => void
  skewAmount?: number
  easing?: 'elastic' | 'smooth'
}

const props = withDefaults(defineProps<CardSwapProps>(), {
  cards: () => [
    { title: 'Card 1', content: 'Content 1' },
    { title: 'Card 2', content: 'Content 2' },
    { title: 'Card 3', content: 'Content 3' }
  ],
  width: 500,
  height: 400,
  cardDistance: 60,
  verticalDistance: 70,
  delay: 5000,
  pauseOnHover: false,
  skewAmount: 6,
  easing: 'elastic'
})

const container = ref<HTMLDivElement>()
const cardRefs = ref<HTMLDivElement[]>([])

// 配置对象
const config = props.easing === 'elastic' ? {
  ease: "elastic.out(0.6,0.9)",
  durDrop: 2,
  durMove: 2,
  durReturn: 2,
  promoteOverlap: 0.9,
  returnDelay: 0.05,
} : {
  ease: "power1.inOut",
  durDrop: 0.8,
  durMove: 0.8,
  durReturn: 0.8,
  promoteOverlap: 0.45,
  returnDelay: 0.2,
}

let order = ref<number[]>([])
let timeline: gsap.core.Timeline | null = null
let intervalId: number | null = null

// 创建插槽位置
const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

// 立即放置卡片
const placeNow = (el: HTMLDivElement, slot: any, skew: number) => {
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  })
}

// 交换动画
const swap = () => {
  if (order.value.length < 2) return

  const [front, ...rest] = order.value
  const elFront = cardRefs.value[front]
  
  if (!elFront) return

  const tl = gsap.timeline()
  timeline = tl

  // 前面的卡片下降
  tl.to(elFront, {
    y: "+=500",
    duration: config.durDrop,
    ease: config.ease,
  })

  // 提升其他卡片
  tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`)
  
  rest.forEach((idx, i) => {
    const el = cardRefs.value[idx]
    if (!el) return
    
    const slot = makeSlot(i, props.cardDistance, props.verticalDistance, cardRefs.value.length)
    tl.set(el, { zIndex: slot.zIndex }, "promote")
    tl.to(
      el,
      {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: config.durMove,
        ease: config.ease,
      },
      `promote+=${i * 0.15}`
    )
  })

  // 前面的卡片回到后面
  const backSlot = makeSlot(
    cardRefs.value.length - 1,
    props.cardDistance,
    props.verticalDistance,
    cardRefs.value.length
  )
  
  tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`)
  tl.call(() => {
    gsap.set(elFront, { zIndex: backSlot.zIndex })
  }, undefined, "return")
  
  tl.set(elFront, { x: backSlot.x, z: backSlot.z }, "return")
  tl.to(
    elFront,
    {
      y: backSlot.y,
      duration: config.durReturn,
      ease: config.ease,
    },
    "return"
  )

  tl.call(() => {
    order.value = [...rest, front]
  })
}

const handleCardClick = (index: number) => {
  if (props.onCardClick) {
    props.onCardClick(index)
  }
}

const handleMouseEnter = () => {
  if (props.pauseOnHover && timeline) {
    timeline.pause()
    if (intervalId) {
      clearInterval(intervalId)
    }
  }
}

const handleMouseLeave = () => {
  if (props.pauseOnHover && timeline) {
    timeline.play()
    intervalId = window.setInterval(swap, props.delay)
  }
}

onMounted(() => {
  if (!cardRefs.value.length) return

  // 初始化顺序
  order.value = Array.from({ length: props.cards.length }, (_, i) => i)

  // 初始化卡片位置
  cardRefs.value.forEach((el, i) => {
    if (el) {
      const slot = makeSlot(i, props.cardDistance, props.verticalDistance, cardRefs.value.length)
      placeNow(el, slot, props.skewAmount)
    }
  })

  // 开始动画
  swap()
  intervalId = window.setInterval(swap, props.delay)

  // 如果启用悬停暂停
  if (props.pauseOnHover && container.value) {
    container.value.addEventListener('mouseenter', handleMouseEnter)
    container.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  if (timeline) {
    timeline.kill()
  }
  if (container.value) {
    container.value.removeEventListener('mouseenter', handleMouseEnter)
    container.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
.card-swap-container {
  position: relative;
  perspective: 1000px;
}

.card {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.02) !important;
}

.card-content {
  padding: 2rem;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.card-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.card-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}
</style> 