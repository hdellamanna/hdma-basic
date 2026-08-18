<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import Cabinet from '../components/Cabinet.vue'
import { useAudio } from '../composables/useAudio'

const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const totalGames = computed(() => arcade.totalGames)
const yearSpan = computed(() => arcade.yearSpan)
</script>

<template>
  <section class="relative mx-auto w-full max-w-7xl px-4 py-6 sm:py-10">
    <!-- Hero header -->
    <div class="mb-6 sm:mb-10 flex flex-col items-start gap-3">
      <div class="flex items-center gap-2 text-[10px] font-display tracking-widest text-amber">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
        {{ t('freePlay', locale.current) }}
      </div>
      <h1 class="font-display text-2xl sm:text-4xl leading-tight phosphor text-shadow-neon animate-flicker">
        {{ t('chooseCabinet', locale.current) }}
      </h1>
      <p class="max-w-2xl text-sm text-ink-muted">
        {{ t('chooseCabinetSub', locale.current) }}
      </p>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-display tracking-widest text-ink-dim">
        <span><span class="text-amber">{{ totalGames }}</span> {{ t('totalGames', locale.current) }}</span>
        <span class="text-surface-600">·</span>
        <span><span class="text-cyan">{{ arcade.totalManuals }}</span> {{ t('totalManuals', locale.current) }}</span>
        <span class="text-surface-600">·</span>
        <span><span class="text-magenta">{{ yearSpan }}</span></span>
      </div>
    </div>

    <!-- The arcade floor: grid of cabinets -->
    <div class="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <Cabinet
        v-for="(m, i) in arcade.manuals"
        :key="m.id"
        :manual="m"
        :index="i"
      />
    </div>

    <!-- Secondary actions -->
    <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-surface-700 pt-4">
      <RouterLink
        to="/downloads"
        class="arcade-btn arcade-btn-amber text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ⤓ {{ t('downloadManuals', locale.current) }}
      </RouterLink>
      <RouterLink
        to="/about"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ? {{ t('history', locale.current) }}
      </RouterLink>
    </div>
  </section>
</template>
