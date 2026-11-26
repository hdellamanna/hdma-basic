<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ManualPage from '../components/ManualPage.vue'
import { GAMES } from '../data/games'
import { MANUALS } from '../data/manuals'
import { classicGames } from '../games/loaders'
import { useArcadeStore } from '../stores/arcade'
import { useLocaleStore } from '../stores/locale'
import './classic-reader.css'

const route = useRoute()
const router = useRouter()
const locale = useLocaleStore()
const arcade = useArcadeStore()
const tr = (pt: string, en: string) => locale.isPt ? pt : en
const game = GAMES.find(item => item.id === route.params.gameId && item.manualId === route.params.manualId)
const manual = MANUALS.find(item => item.id === game?.manualId)
const copy = computed(() => game?.i18n[locale.current])

const GameComponent = shallowRef<Component | null>(null)
const loadError = ref(false)
const guideOpen = ref(window.matchMedia('(min-width: 58rem)').matches)
const textSize = ref('normal')
const preferenceKey = 'hdma-classic-text-size'
try {
  if (localStorage.getItem(preferenceKey) === 'large') textSize.value = 'large'
} catch { /* The reader also works when storage is disabled. */ }

function saveTextSize() {
  try { localStorage.setItem(preferenceKey, textSize.value) } catch { /* Session only. */ }
}

let active = true
async function loadGame() {
  if (!game) return
  loadError.value = false
  try {
    const module = await classicGames[game.id]()
    if (active) GameComponent.value = module.default
  } catch {
    if (active) loadError.value = true
  }
}

onMounted(() => {
  if (!game) {
    void router.replace({ name: 'floor' })
    return
  }
  arcade.selectManual(game.manualId)
  void loadGame()
})
onUnmounted(() => { active = false })
</script>

<template>
  <section v-if="game && manual && copy" class="classic-runner" :data-text-size="textSize">
    <nav class="classic-path" :aria-label="tr('Navegação do jogo', 'Game navigation')" @keydown.stop>
      <RouterLink to="/">{{ tr('Fliperama', 'Arcade') }}</RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink :to="{ name: 'manual', params: { id: manual.id } }">{{ manual.i18n[locale.current].title }}</RouterLink>
    </nav>

    <header class="classic-heading">
      <div>
        <h1>{{ copy.title }}</h1>
        <p>{{ tr('Edição clássica', 'Classic edition') }} · {{ game.year }}</p>
      </div>
      <RouterLink class="classic-other" :to="{ name: 'edition', params: { id: game.id } }" @keydown.stop>
        {{ tr('Jogar edição remasterizada', 'Play remastered edition') }} <span aria-hidden="true">↗</span>
      </RouterLink>
    </header>

    <div class="classic-layout">
      <aside class="classic-tools" :aria-label="tr('Guia e leitura', 'Guide and reading settings')" @keydown.stop @keyup.stop>
        <label class="classic-text-control" for="classic-text-size">
          <span>{{ tr('Tamanho do texto', 'Text size') }}</span>
          <select id="classic-text-size" v-model="textSize" @change="saveTextSize">
            <option value="normal">{{ tr('Normal', 'Standard') }}</option>
            <option value="large">{{ tr('Grande', 'Large') }}</option>
          </select>
        </label>
        <details class="classic-guide" :open="guideOpen" @toggle="guideOpen = ($event.currentTarget as HTMLDetailsElement).open">
          <summary>{{ tr('Como jogar', 'How to play') }}
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg>
          </summary>
          <dl>
            <dt>{{ tr('Objetivo', 'Objective') }}</dt><dd>{{ copy.objective }}</dd>
            <dt>{{ tr('Instruções', 'Instructions') }}</dt><dd>{{ copy.instructions }}</dd>
            <template v-if="copy.controlsHint"><dt>{{ tr('Controles', 'Controls') }}</dt><dd>{{ copy.controlsHint }}</dd></template>
          </dl>
        </details>
      </aside>
      <div class="classic-play">
        <component v-if="GameComponent" :is="GameComponent" />
        <div v-else-if="loadError" class="classic-load" role="alert">
          <p>{{ tr('Falha ao carregar o jogo.', 'The game could not be loaded.') }}</p>
          <button type="button" @click="loadGame">{{ tr('Tentar novamente', 'Try again') }}</button>
        </div>
        <p v-else class="classic-load" role="status">{{ tr('Carregando o jogo…', 'Loading game…') }}</p>
      </div>
    </div>
    <ManualPage :game="game" />
  </section>
</template>
