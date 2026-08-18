<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { useAudio } from '../composables/useAudio'
import { t } from '../i18n/strings'
import ManualCover from './ManualCover.vue'
import type { Manual } from '../types'

const props = defineProps<{
  manual: Manual
  index: number
}>()

const router = useRouter()
const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const gameCount = computed(() => arcade.games.filter((g) => g.manualId === props.manual.id).length)
const titleKey = computed(() => props.manual.i18n[locale.current].title)

function enter() {
  sfx.insertCoin()
  router.push({ name: 'manual', params: { id: props.manual.id } })
}

const accentClass = computed(() => {
  switch (props.manual.accent) {
    case 'amber': return { ring: 'ring-amber/60 hover:shadow-neon-amber', text: 'amber-phosphor' }
    case 'green': return { ring: 'ring-phosphor-green/60 hover:shadow-neon-green', text: 'phosphor' }
    case 'magenta': return { ring: 'ring-magenta/60 hover:shadow-neon-magenta', text: 'magenta-phosphor' }
    case 'cyan': return { ring: 'ring-cyan/60 hover:shadow-neon-cyan', text: 'cyan-phosphor' }
    case 'red': return { ring: 'ring-danger/60 hover:shadow-neon-red', text: 'danger-phosphor' }
    case 'blue': return { ring: 'ring-blue-400/60', text: 'text-blue-300' }
    case 'yellow': return { ring: 'ring-yellow-300/60', text: 'text-yellow-300' }
  }
})
</script>

<template>
  <button
    type="button"
    class="cabinet group relative block w-full text-left transition-transform duration-150 ease-out hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-phosphor-green animate-boot-up"
    :class="accentClass.ring"
    :style="{ animationDelay: `${index * 80}ms` }"
    @click="enter"
  >
    <!-- Marquee (top) -->
    <div class="cabinet-marquee mb-2 ring-1 ring-surface-600">
      <span
        v-if="props.manual.id.endsWith('-pt')"
        class="absolute left-1.5 top-1.5 z-10 font-display text-[8px] tracking-widest px-1.5 py-0.5 rounded bg-amber/15 text-amber ring-1 ring-amber/40"
        title="Editora Lutécia — edição brasileira"
      >BR</span>
      <div class="absolute inset-0 flex items-center justify-center px-3">
        <span class="font-display text-[9px] tracking-widest truncate" :class="accentClass.text">
          {{ titleKey }}
        </span>
      </div>
      <div class="absolute inset-0 opacity-50">
        <div class="absolute inset-y-0 animate-marquee whitespace-nowrap text-[8px] font-mono text-ink-muted/40 flex items-center">
          ★ {{ props.manual.year }} ★ {{ gameCount }} {{ t('gamesAvailable', locale.current) }} ★ {{ props.manual.year }} ★&nbsp;
          ★ {{ props.manual.year }} ★ {{ gameCount }} {{ t('gamesAvailable', locale.current) }} ★ {{ props.manual.year }} ★&nbsp;
        </div>
      </div>
    </div>

    <!-- Screen with cover -->
    <div class="crt aspect-[5/7] mb-3 ring-2 ring-surface-600 group-hover:ring-ink-muted">
      <div class="crt-content absolute inset-3 sm:inset-4 flex items-center justify-center">
        <ManualCover :manual="props.manual" />
      </div>
    </div>

    <!-- Control panel -->
    <div class="space-y-2 rounded bg-surface-800 p-2.5 ring-1 ring-surface-600">
      <div class="flex items-center justify-between text-[9px] font-display tracking-widest text-ink-muted">
        <span>{{ props.manual.year }}</span>
        <span class="text-ink-dim">·</span>
        <span>{{ gameCount }} {{ t('gamesAvailable', locale.current) }}</span>
      </div>
      <p class="line-clamp-2 text-[10px] leading-snug text-ink-muted/90">
        {{ props.manual.i18n[locale.current].subtitle }}
      </p>
      <div class="flex items-center justify-between pt-1">
        <span
          class="inline-flex items-center gap-1.5 font-display text-[9px] tracking-widest"
          :class="accentClass.text"
        >
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          {{ t('insertCoin', locale.current) }}
        </span>
        <span class="font-display text-[9px] tracking-widest text-ink-dim group-hover:text-ink transition">
          ▶
        </span>
      </div>
    </div>

    <!-- Coin slot accent -->
    <div
      class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-current opacity-70"
      :class="accentClass.text"
      aria-hidden="true"
    />
  </button>
</template>
