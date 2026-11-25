<script setup lang="ts">
import ManualPage from '../components/ManualPage.vue'
import { computed, onMounted, onUnmounted, ref, shallowRef, type Component } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'
import { GAMES } from '../data/games'
import { MANUALS } from '../data/manuals'

import { classicGames } from '../games/loaders'
const route = useRoute()
const router = useRouter()
const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const manualId = computed(() => String(route.params.manualId || ''))
const gameId = computed(() => String(route.params.gameId || ''))
const game = computed(() => GAMES.find((g) => g.id === gameId.value && g.manualId === manualId.value) ?? null)
const manual = computed(() => MANUALS.find((m) => m.id === manualId.value) ?? null)

onMounted(() => {
  arcade.selectManual(manualId.value)
  if (!game.value) router.replace({ name: 'floor' })
})

const accentText = computed(() => {
  if (!manual.value) return 'phosphor'
  switch (manual.value.accent) {
    case 'amber': return 'amber-phosphor'
    case 'green': return 'phosphor'
    case 'magenta': return 'magenta-phosphor'
    case 'cyan': return 'cyan-phosphor'
    case 'red': return 'danger-phosphor'
    case 'blue': return 'text-blue-300'
    case 'yellow': return 'text-yellow-300'
  }
})

// Show instructions panel before launching
const showInstructions = ref(true)
const GameComponent = shallowRef<Component | null>(null)
const loading = ref(false)
const loadError = ref(false)
let active = true
onUnmounted(() => { active = false })

async function startGame() {
  if (loading.value) return
  loading.value = true
  loadError.value = false
  sfx.start()
  try {
    const selected = await classicGames[gameId.value]()
    if (!active) return
    GameComponent.value = selected.default
    showInstructions.value = false
  } catch {
    if (active) loadError.value = true
  } finally {
    if (active) loading.value = false
  }
}
</script>

<template>
  <section v-if="game" class="relative mx-auto w-full max-w-7xl px-4 py-4 sm:py-6">
    <!-- Top nav -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <RouterLink
        v-if="manual"
        :to="`/manual/${manual.id}`"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ◀ {{ manual.i18n[locale.current].title }}
      </RouterLink>
      <RouterLink
        to="/"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ▤ {{ t('backToFloor', locale.current) }}
      </RouterLink>
    </div>

    <!-- Title -->
    <header class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
      <h1 class="font-display text-lg sm:text-2xl text-shadow-neon" :class="accentText">
        {{ game.i18n[locale.current].title }}
      </h1>
      <RouterLink :to="{ name: 'edition', params: { id: game.id } }" class="pavilion-link">
        {{ locale.isPt ? 'Jogar edição remasterizada' : 'Play remastered edition' }}
      </RouterLink>
      <span class="text-[10px] font-display tracking-widest text-ink-muted">
        {{ game.year }} · {{ manual?.i18n[locale.current].title }}
      </span>
    </header>

    <!-- Instructions intro (first visit per game) -->
    <div
      v-if="showInstructions"
      class="rounded border border-surface-600 bg-surface-800 p-4 sm:p-6 mb-4"
    >
      <h2 class="font-display text-xs tracking-widest text-amber mb-3">
        ▶ {{ t('howToPlay', locale.current) }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('objective', locale.current) }}
          </p>
          <p class="text-sm text-ink mb-3">
            {{ game.i18n[locale.current].objective }}
          </p>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('controls', locale.current) }}
          </p>
          <p class="text-sm text-ink">
            {{ game.i18n[locale.current].controlsHint ?? '—' }}
          </p>
        </div>
        <div>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('howToPlay', locale.current) }}
          </p>
          <p class="text-sm text-ink leading-relaxed">
            {{ game.i18n[locale.current].instructions }}
          </p>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="arcade-btn arcade-btn-amber"
          :disabled="loading"
          @click="startGame"
        >
          ▶ {{ loading ? (locale.isPt ? 'Carregando…' : 'Loading…') : t('pressStart', locale.current) }}
        </button>

      </div>
    </div>

    <!-- The game itself -->
    <component
      v-if="!showInstructions && GameComponent"
      :is="GameComponent"
    />
    <p v-if="loadError" role="alert" class="mt-4 text-danger">
      {{ locale.isPt ? 'Falha ao carregar o jogo. Tente iniciar novamente.' : 'The game could not load. Try starting it again.' }}
    </p>
    <ManualPage v-if="game" :game="game" />
  </section>
</template>
