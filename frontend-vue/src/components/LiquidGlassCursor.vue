<template>
  <div 
    v-if="isEnabled"
    class="liquid-glass-wrapper"
  >
    <!-- 背景捕获画布 -->
    <canvas
      ref="backgroundCanvas"
      class="background-capture"
      :width="canvasSize.width"
      :height="canvasSize.height"
    />
    
    <!-- 液体玻璃透镜 -->
    <div 
      ref="glassLensRef"
      class="glass-lens"
      :style="lensStyle"
      :class="{ 'hovering': isHovering }"
    >
      <!-- 透镜表面 -->
      <div class="lens-surface">
        <!-- 折射层 -->
        <div 
          class="lens-refraction"
          :style="refractionStyle"
        ></div>
        
        <!-- 色散效果 -->
        <div 
          class="lens-chromatic"
          :style="chromaticStyle"
        ></div>
        
        <!-- 反射高光 -->
        <div class="lens-reflection"></div>
        
        <!-- 焦散效果 -->
        <div class="lens-caustics">
          <div 
            v-for="n in 3" 
            :key="n"
            class="caustic-ring"
            :style="{ animationDelay: `${(n-1) * 0.5}s` }"
          ></div>
        </div>
      </div>
      
      <!-- 边缘厚度效果 -->
      <div 
        class="lens-edge"
        :style="edgeStyle"
      ></div>
    </div>
    
    <!-- 中心指示点 -->
    <div 
      ref="centerDotRef"
      class="center-indicator"
      :style="dotStyle"
    >
      <div class="indicator-core"></div>
      <div class="indicator-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface GlassConfig {
  scale: number
  ior: number
  thickness: number
  chromaticAberration: number
  anisotropy: number
}

const props = defineProps<{
  isEnabled?: boolean
  config?: Partial<GlassConfig>
}>()

// 默认配置（参考图片）
const defaultConfig: GlassConfig = {
  scale: 0.25,
  ior: 1.15,
  thickness: 2,
  chromaticAberration: 0.05,
  anisotropy: 0.01
}

const glassConfig = computed(() => ({
  ...defaultConfig,
  ...props.config
}))

// 响应式数据
const glassLensRef = ref<HTMLElement>()
const centerDotRef = ref<HTMLElement>()
const backgroundCanvas = ref<HTMLCanvasElement>()
const mousePos = ref({ x: 0, y: 0 })
const lensPos = ref({ x: 0, y: 0 })
const dotPos = ref({ x: 0, y: 0 })
const isHovering = ref(false)
const velocity = ref({ x: 0, y: 0 })
const canvasSize = ref({ width: 0, height: 0 })

// 动画参数
const lensSpeed = 0.06
const dotSpeed = 0.3
const baseLensSize = 60

// 计算样式
const lensStyle = computed(() => {
  const size = baseLensSize * glassConfig.value.scale * 4
  return {
    transform: `translate3d(${lensPos.value.x - size/2}px, ${lensPos.value.y - size/2}px, 0)`,
    width: `${size}px`,
    height: `${size}px`,
  }
})

const dotStyle = computed(() => ({
  transform: `translate3d(${dotPos.value.x - 2}px, ${dotPos.value.y - 2}px, 0)`,
}))

// 折射效果样式
const refractionStyle = computed(() => {
  const ior = glassConfig.value.ior
  const refractScale = 1 + (ior - 1) * 0.3
  return {
    transform: `scale(${refractScale})`,
    filter: `blur(${Math.max(0, (ior - 1) * 10)}px)`,
  }
})

// 色散效果样式
const chromaticStyle = computed(() => {
  const ca = glassConfig.value.chromaticAberration
  return {
    background: `
      radial-gradient(circle at 30% 30%, 
        rgba(255, 0, 0, ${ca * 0.3}) 0%, 
        transparent 50%),
      radial-gradient(circle at 70% 30%, 
        rgba(0, 255, 0, ${ca * 0.25}) 0%, 
        transparent 50%),
      radial-gradient(circle at 50% 70%, 
        rgba(0, 0, 255, ${ca * 0.3}) 0%, 
        transparent 50%)
    `,
    mixBlendMode: 'screen' as const,
  }
})

// 边缘厚度效果
const edgeStyle = computed(() => {
  const thickness = glassConfig.value.thickness
  return {
    borderWidth: `${thickness}px`,
    background: `rgba(255, 255, 255, ${0.1 + thickness * 0.05})`,
  }
})

// 动画循环
let animationId: number

const animate = () => {
  // 计算速度
  velocity.value.x = mousePos.value.x - lensPos.value.x
  velocity.value.y = mousePos.value.y - lensPos.value.y
  const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
  
  // 透镜跟随（慢速，模拟液体粘性）
  lensPos.value.x += velocity.value.x * lensSpeed
  lensPos.value.y += velocity.value.y * lensSpeed
  
  // 中心点跟随（快速）
  dotPos.value.x += (mousePos.value.x - dotPos.value.x) * dotSpeed
  dotPos.value.y += (mousePos.value.y - dotPos.value.y) * dotSpeed
  
  // 更新背景捕获
  updateBackgroundCapture()
  
  animationId = requestAnimationFrame(animate)
}

// 背景捕获和处理
const updateBackgroundCapture = () => {
  if (!backgroundCanvas.value) return
  
  const canvas = backgroundCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 模拟透镜折射效果
  const centerX = lensPos.value.x
  const centerY = lensPos.value.y
  const radius = (baseLensSize * glassConfig.value.scale * 4) / 2
  
  // 创建径向渐变模拟折射
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  )
  
  const ior = glassConfig.value.ior
  const refractOpacity = Math.min(0.8, (ior - 1) * 2)
  
  gradient.addColorStop(0, `rgba(255, 255, 255, ${refractOpacity * 0.1})`)
  gradient.addColorStop(0.7, `rgba(64, 255, 170, ${refractOpacity * 0.3})`)
  gradient.addColorStop(1, 'transparent')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
}

// 鼠标事件处理
const handleMouseMove = (e: MouseEvent) => {
  if (!props.isEnabled) return
  
  mousePos.value = {
    x: e.clientX,
    y: e.clientY
  }
}

// 悬停检测
const handleMouseOver = (e: MouseEvent) => {
  if (!props.isEnabled) return
  
  const target = e.target as HTMLElement
  if (!target) return
  
  const isInteractive = 
    target.tagName === 'A' || 
    target.tagName === 'BUTTON' || 
    target.getAttribute('role') === 'button' ||
    target.classList.contains('clickable') ||
    getComputedStyle(target).cursor === 'pointer'
  
  // 检查父元素
  let parent = target.parentElement
  while (parent && parent !== document.body) {
    if (parent.tagName === 'A' || 
        parent.tagName === 'BUTTON' || 
        parent.getAttribute('role') === 'button' ||
        parent.classList.contains('clickable')) {
      isHovering.value = true
      return
    }
    parent = parent.parentElement
  }
  
  isHovering.value = isInteractive
}

const handleMouseOut = () => {
  if (!props.isEnabled) return
  
  setTimeout(() => {
    const target = document.elementFromPoint(mousePos.value.x, mousePos.value.y)
    if (!target) {
      isHovering.value = false
      return
    }
    
    const isStillInteractive = 
      target.tagName === 'A' || 
      target.tagName === 'BUTTON' || 
      target.getAttribute('role') === 'button' ||
      target.classList.contains('clickable') ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    
    if (!isStillInteractive) {
      isHovering.value = false
    }
  }, 50)
}

// 初始化画布大小
const initCanvas = () => {
  if (!backgroundCanvas.value) return
  
  canvasSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// 生命周期
onMounted(async () => {
  if (typeof window !== 'undefined' && props.isEnabled) {
    await nextTick()
    
    // 初始化
    initCanvas()
    
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2
    
    mousePos.value = { x: initialX, y: initialY }
    lensPos.value = { x: initialX, y: initialY }
    dotPos.value = { x: initialX, y: initialY }
    
    // 事件监听
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })
    window.addEventListener('resize', initCanvas, { passive: true })
    
    // 隐藏系统光标
    document.body.style.cursor = 'none'
    document.documentElement.style.cursor = 'none'
    
    // 开始动画
    animationId = requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseover', handleMouseOver)
    document.removeEventListener('mouseout', handleMouseOut)
    window.removeEventListener('resize', initCanvas)
    
    document.body.style.cursor = ''
    document.documentElement.style.cursor = ''
    
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
})

// 监听配置变化
watch(() => props.isEnabled, async (newVal) => {
  if (typeof window !== 'undefined') {
    if (newVal) {
      await nextTick()
      initCanvas()
      
      const initialX = window.innerWidth / 2
      const initialY = window.innerHeight / 2
      
      mousePos.value = { x: initialX, y: initialY }
      lensPos.value = { x: initialX, y: initialY }
      dotPos.value = { x: initialX, y: initialY }
      
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseover', handleMouseOver, { passive: true })
      document.addEventListener('mouseout', handleMouseOut, { passive: true })
      window.addEventListener('resize', initCanvas, { passive: true })
      
      document.body.style.cursor = 'none'
      document.documentElement.style.cursor = 'none'
      
      if (!animationId) {
        animationId = requestAnimationFrame(animate)
      }
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('resize', initCanvas)
      
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = 0
      }
      
      isHovering.value = false
    }
  }
})
</script>

<style scoped>
.liquid-glass-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.background-capture {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10000;
  mix-blend-mode: multiply;
}

.glass-lens {
  position: absolute;
  will-change: transform, width, height;
  transition: none;
  z-index: 10001;
  border-radius: 50%;
}

.lens-surface {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  /* 真实玻璃透镜效果 */
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.lens-refraction {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 30%,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 30%,
    transparent 60%
  );
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
}

.lens-chromatic {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
}

.lens-reflection {
  position: absolute;
  top: 15%;
  left: 20%;
  width: 25%;
  height: 25%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(1px);
  animation: reflectionShimmer 4s ease-in-out infinite;
}

.lens-caustics {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.caustic-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(64, 255, 170, 0.3);
  border-radius: 50%;
  animation: causticPulse 3s ease-in-out infinite;
}

.lens-edge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

/* 悬停状态 */
.glass-lens.hovering .lens-surface {
  background: rgba(64, 255, 170, 0.05);
  border-color: rgba(64, 255, 170, 0.3);
  box-shadow: 
    0 0 30px rgba(64, 255, 170, 0.4),
    inset 0 2px 4px rgba(64, 255, 170, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.glass-lens.hovering .lens-chromatic {
  opacity: 1;
}

.glass-lens.hovering .caustic-ring {
  border-color: rgba(64, 255, 170, 0.6);
  animation-duration: 1.5s;
}

/* 中心指示点 */
.center-indicator {
  position: absolute;
  width: 4px;
  height: 4px;
  z-index: 10002;
  will-change: transform;
}

.indicator-core {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(64, 255, 170, 0.8);
}

.indicator-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: rgba(64, 255, 170, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: indicatorPulse 2s ease-in-out infinite;
}

/* 动画 */
@keyframes reflectionShimmer {
  0%, 100% {
    opacity: 0.6;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(3px, -3px) scale(1.1);
  }
}

@keyframes causticPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes indicatorPulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

/* 移动设备隐藏 */
@media (hover: none) and (pointer: coarse) {
  .liquid-glass-wrapper {
    display: none;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .lens-surface,
  .glass-lens {
    transition: none;
  }
  
  .lens-reflection,
  .caustic-ring,
  .indicator-pulse {
    animation: none;
  }
}

/* 暗色模式适配 */
.dark-theme .lens-surface {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-theme .lens-edge {
  border-color: rgba(255, 255, 255, 0.3);
}

.dark-theme .glass-lens.hovering .lens-surface {
  background: rgba(64, 255, 170, 0.08);
  border-color: rgba(64, 255, 170, 0.4);
}
</style> 