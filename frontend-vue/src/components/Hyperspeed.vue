<template>
  <div ref="container" class="hyperspeed-container" :style="{ width: '100%', height: '100%' }">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

interface HyperspeedProps {
  effectOptions?: {
    onSpeedUp?: () => void
    onSlowDown?: () => void
    distortion?: string
    length?: number
    roadWidth?: number
    islandWidth?: number
    lanesPerRoad?: number
    fov?: number
    fovSpeedUp?: number
    speedUp?: number
    carLightsFade?: number
    totalSideLightSticks?: number
    lightPairsPerRoadWay?: number
    shoulderLinesWidthPercentage?: number
    brokenLinesWidthPercentage?: number
    brokenLinesLengthPercentage?: number
    lightStickWidth?: [number, number]
    lightStickHeight?: [number, number]
    movingAwaySpeed?: [number, number]
    movingCloserSpeed?: [number, number]
    carLightsLength?: [number, number]
    carLightsRadius?: [number, number]
    carWidthPercentage?: [number, number]
    carShiftX?: [number, number]
    carFloorSeparation?: [number, number]
    colors?: {
      roadColor?: number
      islandColor?: number
      background?: number
      shoulderLines?: number
      brokenLines?: number
      leftCars?: number[]
      rightCars?: number[]
      sticks?: number
    }
  }
}

const props = withDefaults(defineProps<HyperspeedProps>(), {
  effectOptions: () => ({
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xFFFFFF,
      brokenLines: 0xFFFFFF,
      leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
      rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
      sticks: 0x03B3C3,
    }
  })
})

const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number

// 简化的高速路动画
class HyperspeedEffect {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private options: any
  private road: THREE.Group
  private carLights: THREE.Group
  private sticks: THREE.Group

  constructor(canvas: HTMLCanvasElement, options: any) {
    this.options = options
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      options.fov,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setClearColor(options.colors.background, 1)
    
    this.road = new THREE.Group()
    this.carLights = new THREE.Group()
    this.sticks = new THREE.Group()
    
    this.scene.add(this.road)
    this.scene.add(this.carLights)
    this.scene.add(this.sticks)
    
    this.setupScene()
    this.animate()
  }

  private setupScene() {
    // 创建道路几何体
    const roadGeometry = new THREE.PlaneGeometry(this.options.roadWidth, this.options.length)
    const roadMaterial = new THREE.MeshBasicMaterial({ color: this.options.colors.roadColor })
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial)
    roadMesh.rotation.x = -Math.PI / 2
    this.road.add(roadMesh)

    // 创建车灯效果
    this.createCarLights()
    
    // 创建光柱
    this.createLightSticks()

    // 设置相机位置
    this.camera.position.set(0, 2, 5)
    this.camera.lookAt(0, 0, -10)
  }

  private createCarLights() {
    for (let i = 0; i < this.options.lightPairsPerRoadWay; i++) {
      const z = -i * (this.options.length / this.options.lightPairsPerRoadWay)
      
      // 左侧车灯（红色，远离）
      const leftGeometry = new THREE.SphereGeometry(0.1, 8, 6)
      const leftMaterial = new THREE.MeshBasicMaterial({ 
        color: this.options.colors.leftCars[i % this.options.colors.leftCars.length],
        transparent: true,
        opacity: 0.8
      })
      const leftLight = new THREE.Mesh(leftGeometry, leftMaterial)
      leftLight.position.set(-this.options.roadWidth / 4, 0.2, z)
      this.carLights.add(leftLight)

      // 右侧车灯（蓝色，靠近）
      const rightGeometry = new THREE.SphereGeometry(0.1, 8, 6)
      const rightMaterial = new THREE.MeshBasicMaterial({ 
        color: this.options.colors.rightCars[i % this.options.colors.rightCars.length],
        transparent: true,
        opacity: 0.8
      })
      const rightLight = new THREE.Mesh(rightGeometry, rightMaterial)
      rightLight.position.set(this.options.roadWidth / 4, 0.2, z)
      this.carLights.add(rightLight)
    }
  }

  private createLightSticks() {
    for (let i = 0; i < this.options.totalSideLightSticks; i++) {
      const z = -i * (this.options.length / this.options.totalSideLightSticks)
      
      // 左侧光柱
      const leftStickGeometry = new THREE.BoxGeometry(0.1, 2, 0.1)
      const leftStickMaterial = new THREE.MeshBasicMaterial({ color: this.options.colors.sticks })
      const leftStick = new THREE.Mesh(leftStickGeometry, leftStickMaterial)
      leftStick.position.set(-this.options.roadWidth / 2 - 1, 1, z)
      this.sticks.add(leftStick)

      // 右侧光柱
      const rightStickGeometry = new THREE.BoxGeometry(0.1, 2, 0.1)
      const rightStickMaterial = new THREE.MeshBasicMaterial({ color: this.options.colors.sticks })
      const rightStick = new THREE.Mesh(rightStickGeometry, rightStickMaterial)
      rightStick.position.set(this.options.roadWidth / 2 + 1, 1, z)
      this.sticks.add(rightStick)
    }
  }

  private animate = () => {
    animationId = requestAnimationFrame(this.animate)
    
    // 移动车灯
    this.carLights.children.forEach((light: THREE.Object3D, index: number) => {
      if (index % 2 === 0) {
        // 左侧车灯向前移动
        light.position.z += 0.5
        if (light.position.z > 10) {
          light.position.z = -this.options.length
        }
      } else {
        // 右侧车灯向后移动
        light.position.z -= 0.8
        if (light.position.z < -this.options.length - 10) {
          light.position.z = 10
        }
      }
    })

    // 移动光柱
    this.sticks.children.forEach((stick: THREE.Object3D) => {
      stick.position.z += 0.3
      if (stick.position.z > 10) {
        stick.position.z = -this.options.length
      }
    })

    this.renderer.render(this.scene, this.camera)
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  public destroy() {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    this.renderer.dispose()
  }
}

let hyperspeedEffect: HyperspeedEffect | null = null

onMounted(() => {
  if (canvas.value && container.value) {
    hyperspeedEffect = new HyperspeedEffect(canvas.value, props.effectOptions)
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (hyperspeedEffect && container.value) {
        const { clientWidth, clientHeight } = container.value
        hyperspeedEffect.resize(clientWidth, clientHeight)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (hyperspeedEffect) {
        hyperspeedEffect.destroy()
      }
    })
  }
})
</script>

<style scoped>
.hyperspeed-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style> 