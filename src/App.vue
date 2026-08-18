<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAudio } from './composables/useAudio'
import TopBar from './components/TopBar.vue'
import ScanlineOverlay from './components/ScanlineOverlay.vue'
import SiteFooter from './components/SiteFooter.vue'
import BasicRain from './components/BasicRain.vue'
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
  <div class="relative min-h-screen flex flex-col text-ink">
    <BasicRain />
    <ScanlineOverlay />
    <header class="relative z-20 shrink-0">
      <TopBar />
    </header>
    <main class="relative z-10 flex-1 flex flex-col">
      <div class="mx-auto w-full max-w-7xl flex-1 apple2-monitor my-4 sm:my-6">
        <RouterView v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </div>
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
