<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAudio } from './composables/useAudio'
import TopBar from './components/TopBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useLocaleStore } from './stores/locale'
import './arcade.css'

const { unlock } = useAudio()
const locale = useLocaleStore()

function removeUnlockListeners() {
  window.removeEventListener('pointerdown', unlockOnce)
  window.removeEventListener('keydown', unlockOnce)
}

function unlockOnce() {
  unlock()
  removeUnlockListeners()
}

watch(() => locale.current, (language) => {
  document.documentElement.lang = language
}, { immediate: true })

onMounted(() => {
  window.addEventListener('pointerdown', unlockOnce)
  window.addEventListener('keydown', unlockOnce)
})
onUnmounted(removeUnlockListeners)
</script>

<template>
  <div class="arcade-app">
    <a href="#conteudo" class="skip-link">{{ locale.isPt ? 'Pular para o conteúdo' : 'Skip to content' }}</a>
    <header><TopBar /></header>
    <main id="conteudo" tabindex="-1">
      <RouterView v-slot="{ Component, route }">
        <div :class="route.name === 'floor' ? 'floor-page' : 'arcade-page'">
          <component :is="Component" :key="route.path" />
        </div>
      </RouterView>
    </main>
    <SiteFooter />
  </div>
</template>
