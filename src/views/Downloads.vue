<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'
import ManualCover from '../components/ManualCover.vue'

const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const manuals = computed(() => arcade.manuals.filter((manual) => manual.pdfPath))
</script>

<template>
  <section class="relative mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
    <RouterLink
      to="/"
      class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs mb-4"
      @click="sfx.select()"
    >
      ◀ {{ t('backToFloor', locale.current) }}
    </RouterLink>

    <h1 class="font-display text-xl sm:text-3xl phosphor text-shadow-neon mb-2">
      ⤓ {{ t('downloadManuals', locale.current) }}
    </h1>
    <p class="text-sm text-ink-muted mb-6 max-w-2xl">
      {{ locale.current === 'pt-BR'
        ? 'Consulte os manuais que deram origem aos jogos da coleção.'
        : 'Browse the manuals that inspired the games in the collection.' }}
    </p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="m in manuals"
        :key="m.id"
        class="group flex gap-3 rounded border border-surface-600 bg-surface-800 p-3 hover:border-ink-muted transition"
      >
        <div class="crt h-32 w-24 shrink-0 ring-1 ring-surface-600">
          <div class="crt-content absolute inset-1 flex items-center justify-center">
            <ManualCover :manual="m" />
          </div>
        </div>
        <div class="flex flex-1 flex-col">
          <h2 class="font-display text-sm text-ink leading-tight mb-1">
            {{ m.i18n[locale.current].title }}
          </h2>
          <p class="text-[10px] text-ink-muted mb-2 leading-snug">{{ m.i18n[locale.current].subtitle }}</p>
          <div class="mt-auto flex flex-wrap items-center gap-2">
            <span class="text-[9px] font-display tracking-widest text-ink-dim">{{ m.year }}</span>
            <span class="text-ink-dim">·</span>
            <span class="text-[9px] text-ink-muted truncate">{{ m.publisher }}</span>
          </div>
          <a
            :href="m.pdfPath"
            target="_blank"
            rel="noopener"
            download
            class="arcade-btn arcade-btn-amber mt-2 self-start text-[9px]"
            @click="sfx.select()"
          >
            ⤓ PDF
          </a>
        </div>
      </article>
    </div>

  </section>
</template>
