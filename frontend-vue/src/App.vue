<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/store/theme'
import NavBar from '@/components/NavBar.vue'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
</script>

<style>
/* 全局样式由CSS文件处理 */
</style> 