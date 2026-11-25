<script setup lang="ts">
import { computed } from 'vue'
import { originals } from '../data/originals'
import { MANUALS } from '../data/manuals'
import { GAMES } from '../data/games'
import { useLocaleStore } from '../stores/locale'
import type { GameManifest } from '../types'

const props = defineProps<{ game: GameManifest }>()
const locale = useLocaleStore()
const source = computed(() => originals[props.game.id])
const manual = computed(() =>
  MANUALS.find((book) => book.id === props.game.manualId),
)
const thumbnail = computed(() => {
  const contents = GAMES.filter((game) => game.manualId === props.game.manualId)
  const index = contents.findIndex((game) => game.id === props.game.id)
  const cols = Math.min(4, contents.length)
  const rows = Math.ceil(contents.length / cols)
  const x = cols === 1 ? 0 : ((index % cols) * 100) / (cols - 1)
  const y = rows === 1 ? 0 : (Math.floor(index / cols) * 100) / (rows - 1)
  return {
    backgroundImage:
      'url(/images/manual-pages/' + props.game.manualId + '.webp)',
    backgroundSize: cols * 100 + '% ' + rows * 100 + '%',
    backgroundPosition: x + '% ' + y + '%',
  }
})
</script>
<template>
  <aside v-if="manual?.pdfPath && source" class="manual-source">
    <a
      :href="manual.pdfPath + '#page=' + source.page"
      target="_blank"
      rel="noopener"
    >
      <span class="source-leaf" :style="thumbnail" aria-hidden="true"></span>
      <span class="source-story">
        <strong>
          {{ locale.isPt ? 'No manual original' : 'In the original manual' }}
        </strong>
        <span>{{ locale.isPt ? source.pt : source.en }}</span>
        <span class="source-cite">
          {{ manual.i18n[locale.current].title }} · PDF p. {{ source.page }} ↗
        </span>
      </span>
    </a>
  </aside>
</template>
