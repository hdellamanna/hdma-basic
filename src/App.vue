<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAudio } from './composables/useAudio'
import TopBar from './components/TopBar.vue'
import ScanlineOverlay from './components/ScanlineOverlay.vue'
import { useLocaleStore } from './stores/locale'

const { unlock } = useAudio()
const locale = useLocaleStore()

onMounted(() => {
  document.documentElement.lang = locale.current
  // Unlock audio on first user gesture
  const unlockOnce = () => {
    unlock()
    window.removeEventListener('pointerdown', unlockOnce)
    window.removeEventListener('keydown', unlockOnce)
  }
  window.addEventListener('pointerdown', unlockOnce, { once: true })
  window.addEventListener('keydown', unlockOnce, { once: true })
})
</script>

<template>
  <div class="relative min-h-screen flex flex-col bg-void-deep text-ink">
    <ScanlineOverlay />
    <TopBar />
    <main class="relative z-10 flex-1 flex flex-col">
      <RouterView v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease-out, filter 0.18s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: blur(2px);
}
</style>
