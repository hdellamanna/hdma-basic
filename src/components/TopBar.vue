<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t, LOCALE_LABELS, LOCALE_FLAGS } from '../i18n/strings'
import type { Locale } from '../types'
import { useAudio } from '../composables/useAudio'

const locale = useLocaleStore()
const arcade = useArcadeStore()
const route = useRoute()
const { sfx, muted, toggleMute } = useAudio()

const yearSpan = computed(() => arcade.yearSpan)
const stats = computed(() => ({
  games: arcade.totalGames,
  manuals: arcade.totalManuals,
}))

function switchTo(next: Locale) {
  if (next === locale.current) return
  sfx.select()
  locale.set(next)
}

function onMute() {
  sfx.select()
  toggleMute()
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b-2 border-surface-600 bg-void-deep/95 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
      <!-- Logo -->
      <RouterLink
        to="/"
        class="group flex items-center gap-3 font-display text-[10px] sm:text-xs tracking-widest"
        @click="sfx.select()"
      >
        <span class="relative inline-block h-7 w-7 sm:h-8 sm:w-8">
          <span class="absolute inset-0 rounded bg-phosphor/20 animate-glow"></span>
          <span class="absolute inset-0 grid place-items-center font-display text-base phosphor">B</span>
        </span>
        <span class="flex flex-col leading-tight">
          <span class="phosphor text-shadow-neon group-hover:animate-flicker">HDMA BASIC</span>
          <span class="text-[9px] sm:text-[10px] text-ink-muted tracking-normal normal-case">
            {{ t('appTagline', locale.current) }}
          </span>
        </span>
      </RouterLink>

      <!-- Stats (center on desktop) -->
      <div class="hidden md:flex items-center gap-6 text-[10px] font-display tracking-widest text-ink-muted">
        <span>
          <span class="text-amber">{{ stats.games }}</span> {{ t('totalGames', locale.current) }}
        </span>
        <span class="text-surface-600">·</span>
        <span>
          <span class="text-cyan">{{ stats.manuals }}</span> {{ t('totalManuals', locale.current) }}
        </span>
        <span class="text-surface-600">·</span>
        <span>
          <span class="text-magenta">{{ yearSpan }}</span> {{ t('yearSpan', locale.current) }}
        </span>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="hidden sm:inline-flex items-center gap-1.5 border border-surface-600 px-2 py-1 text-[10px] font-display tracking-widest text-ink-muted hover:border-ink-muted hover:text-ink transition"
          :aria-pressed="muted"
          :title="muted ? 'Unmute' : 'Mute'"
          @click="onMute"
        >
          <span aria-hidden="true">{{ muted ? '◼' : '♪' }}</span>
        </button>
        <div
          class="inline-flex items-center border border-surface-600"
          role="group"
          :aria-label="t('language', locale.current)"
        >
          <button
            v-for="loc in (['pt-BR', 'en'] as const)"
            :key="loc"
            type="button"
            class="px-2 py-1 text-[10px] font-display tracking-widest transition"
            :class="
              locale.current === loc
                ? 'bg-phosphor-green text-black'
                : 'text-ink-muted hover:text-ink hover:bg-surface-700'
            "
            :aria-pressed="locale.current === loc"
            @click="switchTo(loc)"
          >
            {{ LOCALE_FLAGS[loc] }} {{ LOCALE_LABELS[loc] }}
          </button>
        </div>
      </div>
    </div>
    <!-- Marquee strip with cabinet name -->
    <div class="overflow-hidden border-t border-surface-700 bg-void-deep">
      <div class="cabinet-marquee">
        <div class="absolute inset-y-0 flex items-center gap-12 px-6 animate-marquee whitespace-nowrap text-[10px] font-display tracking-widest text-ink-muted">
          <span>★ HDMA BASIC ★ {{ arcade.totalGames }} GAMES ★ {{ arcade.totalManuals }} MANUALS ★ 1982–1985 ★ APPLE ][ · USBORNE · EDITORA LUTÉCIA ★</span>
          <span>★ HDMA BASIC ★ {{ arcade.totalGames }} GAMES ★ {{ arcade.totalManuals }} MANUALS ★ 1982–1985 ★ APPLE ][ · USBORNE · EDITORA LUTÉCIA ★</span>
        </div>
      </div>
    </div>
  </header>
</template>
