<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'

const props = withDefaults(
  defineProps<{
    score?: number
    lives?: number
    status?: 'intro' | 'playing' | 'won' | 'lost' | 'paused'
    title?: string
    showHud?: boolean
  }>(),
  { showHud: true }
)

const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const emit = defineEmits<{
  (e: 'restart'): void
  (e: 'quit'): void
}>()

const accent = computed(() => {
  const m = arcade.selectedManual
  switch (m?.accent) {
    case 'amber': return 'amber-phosphor'
    case 'magenta': return 'magenta-phosphor'
    case 'cyan': return 'cyan-phosphor'
    case 'red': return 'danger-phosphor'
    case 'blue': return 'text-blue-300'
    case 'yellow': return 'text-yellow-300'
    default: return 'phosphor'
  }
})

function onRestart() {
  sfx.select()
  emit('restart')
}
function onQuit() {
  sfx.select()
  emit('quit')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- HUD bar -->
    <div
      v-if="showHud"
      class="flex items-center justify-between border border-surface-600 bg-surface-800 px-3 py-1.5 text-[10px] font-display tracking-widest"
    >
      <div class="flex items-center gap-3">
        <span v-if="title" :class="accent">{{ title }}</span>
        <span v-if="props.score !== undefined" class="text-ink-muted">
          {{ t('score', locale.current) }}: <span class="text-amber">{{ props.score }}</span>
        </span>
        <span v-if="props.lives !== undefined" class="text-ink-muted">
          {{ t('lives', locale.current) }}: <span class="text-danger">{{ '♥'.repeat(Math.max(0, props.lives)) }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button class="arcade-btn-ghost border border-surface-600 px-2 py-0.5 text-[9px] hover:border-ink-muted transition" @click="onRestart">
          ↺ {{ t('restart', locale.current) }}
        </button>
        <button class="arcade-btn-ghost border border-surface-600 px-2 py-0.5 text-[9px] hover:border-danger hover:text-danger transition" @click="onQuit">
          ✕ {{ t('quit', locale.current) }}
        </button>
      </div>
    </div>

    <!-- The screen -->
    <div class="crt relative ring-2 ring-surface-600">
      <div class="crt-content p-3 sm:p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
