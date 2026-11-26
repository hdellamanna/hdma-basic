<script setup lang="ts">
import { computed, onBeforeUpdate, onMounted, onUpdated, useTemplateRef } from 'vue'
import { useLocaleStore } from '../stores/locale'

const props = withDefaults(defineProps<{
  entries: string[]
  limit?: number
  firstIndex?: number
  latestColor?: string
  preserveWhitespace?: boolean
}>(), { firstIndex: 0, latestColor: 'text-amber' })

const locale = useLocaleStore()
const box = useTemplateRef<HTMLDivElement>('box')
const offset = computed(() => props.limit === undefined ? 0 : Math.max(0, props.entries.length - props.limit))
const visible = computed(() => offset.value ? props.entries.slice(offset.value) : props.entries)
let previousEntries = props.entries
let follow = true

onBeforeUpdate(() => {
  const el = box.value
  if (!el) return
  // Read the previous layout before Vue inserts the new lines.
  const restarted = props.entries !== previousEntries && props.entries.length < previousEntries.length
  follow = restarted || el.scrollHeight - el.clientHeight - el.scrollTop <= 2
  previousEntries = props.entries
})

function followLatest() {
  if (follow && box.value) box.value.scrollTop = box.value.scrollHeight
}

onMounted(followLatest)
onUpdated(followLatest)

function keepReading(event: KeyboardEvent) {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
    event.stopPropagation()
  }
}
</script>

<template>
  <div
    ref="box"
    role="log"
    :aria-label="locale.isPt ? 'Histórico da partida' : 'Game history'"
    tabindex="0"
    class="overflow-y-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
    @keydown="keepReading"
  >
    <p
      v-for="(message, i) in visible"
      :key="firstIndex + offset + i"
      :class="[preserveWhitespace && 'whitespace-pre-wrap', i === visible.length - 1 ? latestColor : 'text-ink-dim']"
    >{{ message }}</p>
    <slot v-if="!visible.length" />
  </div>
</template>
