<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import ManualCover from '../components/ManualCover.vue'
import { useAudio } from '../composables/useAudio'

const route = useRoute()
const router = useRouter()
const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const manualId = computed(() => String(route.params.id || ''))
const manual = computed(() => arcade.manuals.find((m) => m.id === manualId.value) ?? null)
const games = computed(() => arcade.games.filter((g) => g.manualId === manualId.value))

const accentClass = computed(() => {
  if (!manual.value) return null
  switch (manual.value.accent) {
    case 'amber': return { ring: 'ring-amber/40', text: 'amber-phosphor', btn: 'arcade-btn-amber' }
    case 'green': return { ring: 'ring-phosphor-green/40', text: 'phosphor', btn: '' }
    case 'magenta': return { ring: 'ring-magenta/40', text: 'magenta-phosphor', btn: 'arcade-btn-magenta' }
    case 'cyan': return { ring: 'ring-cyan/40', text: 'cyan-phosphor', btn: 'arcade-btn-cyan' }
    case 'red': return { ring: 'ring-danger/40', text: 'danger-phosphor', btn: '' }
    case 'blue': return { ring: 'ring-blue-400/40', text: 'text-blue-300', btn: '' }
    case 'yellow': return { ring: 'ring-yellow-300/40', text: 'text-yellow-300', btn: '' }
  }
})

onMounted(() => {
  arcade.selectManual(manualId.value)
  if (!manual.value) router.replace({ name: 'floor' })
})

watch(manualId, (id) => arcade.selectManual(id))

function playGame(gameId: string) {
  sfx.start()
  router.push({ name: 'play', params: { manualId: manualId.value, gameId } })
}

function controlLabel(ctrl: string): string {
  const map: Record<string, string> = {
    typing: t('controls_typing', locale.current),
    arrows: t('controls_arrows', locale.current),
    wasd: t('controls_wasd', locale.current),
    azerty: t('controls_azerty', locale.current),
    mouse: t('controls_mouse', locale.current),
    click: t('controls_click', locale.current),
  }
  return map[ctrl] ?? ctrl
}

function difficultyLabel(d: number) {
  const locale_strings: Record<string, string[]> = {
    'pt-BR': ['Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil'],
    en: ['Very easy', 'Easy', 'Medium', 'Hard', 'Very hard'],
  }
  return locale_strings[locale.current][d - 1] ?? '?'
}
</script>

<template>
  <section v-if="manual" class="relative mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
    <!-- Header bar -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <RouterLink
        to="/"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ◀ {{ t('backToFloor', locale.current) }}
      </RouterLink>
      <RouterLink
        to="/downloads"
        class="arcade-btn arcade-btn-amber text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ⤓ {{ t('downloadManuals', locale.current) }}
      </RouterLink>
    </div>

    <!-- Header: cover + blurb -->
    <div class="mb-6 grid gap-5 sm:gap-6 sm:grid-cols-[200px_1fr] md:grid-cols-[260px_1fr] items-start">
      <div class="crt aspect-[5/7] w-full max-w-[260px] ring-2" :class="accentClass?.ring">
        <div class="crt-content absolute inset-2 flex items-center justify-center">
          <ManualCover :manual="manual" />
        </div>
      </div>
      <div class="space-y-3">
        <h1 class="font-display text-xl sm:text-2xl md:text-3xl leading-tight text-shadow-neon" :class="accentClass?.text">
          {{ manual.i18n[locale.current].title }}
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted">{{ manual.i18n[locale.current].subtitle }}</p>
        <p class="text-sm text-ink/90 leading-relaxed max-w-prose">{{ manual.i18n[locale.current].blurb }}</p>
        <dl class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-display tracking-widest text-ink-dim">
          <div>
            <dt class="inline text-ink-muted">{{ t('year', locale.current) }}:</dt>
            <dd class="inline ml-1" :class="accentClass?.text">{{ manual.year }}</dd>
          </div>
          <div>
            <dt class="inline text-ink-muted">{{ t('publisher', locale.current) }}:</dt>
            <dd class="inline ml-1 text-ink">{{ manual.publisher }}</dd>
          </div>
          <div>
            <dt class="inline text-ink-muted">{{ t('authors', locale.current) }}:</dt>
            <dd class="inline ml-1 text-ink">{{ manual.authors.join(', ') }}</dd>
          </div>
        </dl>
        <a
          v-if="manual.pdfPath"
          :href="manual.pdfPath"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-[10px] font-display tracking-widest text-ink-muted hover:text-ink underline-offset-4 hover:underline transition"
          @click="sfx.select()"
        >
          ⤓ {{ t('fromTheManual', locale.current) }} (PDF)
        </a>
      </div>
    </div>

    <!-- Games grid -->
    <div>
      <h2 class="font-display text-sm tracking-widest text-amber mb-3">
        ▶ {{ t('gameSelect', locale.current) }} · {{ games.length }}
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="game in games"
          :key="game.id"
          class="group relative overflow-hidden rounded border border-surface-600 bg-surface-800 p-4 transition-all hover:border-ink-muted hover:bg-surface-700"
        >
          <header class="mb-2 flex items-start justify-between gap-2">
            <h3 class="font-display text-sm leading-tight" :class="accentClass?.text">
              {{ game.i18n[locale.current].title }}
            </h3>
            <span
              class="shrink-0 border px-1.5 py-0.5 text-[8px] font-display tracking-widest"
              :class="`border-current opacity-80 ${accentClass?.text}`"
            >
              {{ game.year }}
            </span>
          </header>
          <p class="mb-3 text-xs leading-snug text-ink-muted line-clamp-3">
            {{ game.i18n[locale.current].shortDesc }}
          </p>
          <dl class="mb-3 grid grid-cols-2 gap-1 text-[9px] font-display tracking-widest text-ink-dim">
            <div>
              <dt class="text-ink-muted">{{ t('difficulty', locale.current) }}:</dt>
              <dd :class="accentClass?.text">{{ difficultyLabel(game.difficulty) }}</dd>
            </div>
            <div>
              <dt class="text-ink-muted">{{ t('controls', locale.current) }}:</dt>
              <dd class="text-ink">{{ controlLabel(game.controls) }}</dd>
            </div>
          </dl>
          <button
            type="button"
            class="arcade-btn w-full text-[10px] sm:text-xs"
            :class="accentClass?.btn"
            @click="playGame(game.id)"
          >
            ▶ {{ t('playGame', locale.current) }}
          </button>
          <RouterLink class="edition-link" :to="{ name: 'edition', params: { id: game.id } }">Remastered ↗</RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>
