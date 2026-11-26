<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const SLOTS = 10
const RANK = computed(() => {
  const r = locale.current
  return r === 'pt-BR'
    ? ['Superespião', 'Espião Chefe', 'Espião Nível 1', 'Espião Nível 2', 'Espião Nível 3', 'Espião Aprendiz']
    : ['Superspy', 'Chief Spy', 'Spy Level 1', 'Spy Level 2', 'Spy Level 3', 'Spy Trainee']
})

const slots = ref<number[]>(Array(SLOTS).fill(0))
const level = ref(5)  // starts at Apprentice = 5
const discardsLeft = ref(5)
const currentNum = ref(0)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
const input = ref('')

function start() {
  slots.value = Array(SLOTS).fill(0)
  level.value = 5
  discardsLeft.value = 5
  log.value = []
  status.value = 'playing'
  next()
}

function next() {
  currentNum.value = 1 + Math.floor(Math.random() * 99)
  log.value.push(locale.current === 'pt-BR' ? `▸ ${currentNum.value} → onde? (1-${SLOTS}, D=descartar)` : `▸ ${currentNum.value} → where? (1-${SLOTS}, D=discard)`)
}

function submit() {
  if (status.value !== 'playing') return
  const raw = input.value.trim().toUpperCase()
  if (!raw) return
  sfx.type()
  if (raw === 'D') {
    if (discardsLeft.value <= 0) {
      log.value.push(locale.current === 'pt-BR' ? '✗ Sem descartes' : '✗ No discards')
      sfx.error()
      input.value = ''
      return
    }
    discardsLeft.value--
    log.value.push(`  descartou (${discardsLeft.value} restantes)`)
    sfx.tick()
    input.value = ''
    next()
    return
  }
  const p = parseInt(raw, 10)
  if (isNaN(p) || p < 1 || p > SLOTS) {
    log.value.push(locale.current === 'pt-BR' ? `✗ Inválido` : `✗ Invalid`)
    sfx.error()
    input.value = ''
    return
  }
  if (slots.value[p - 1] !== 0) {
    log.value.push(locale.current === 'pt-BR' ? `✗ Posição ${p} ocupada` : `✗ Slot ${p} occupied`)
    sfx.error()
    input.value = ''
    return
  }
  // Check ordering
  let valid = true
  for (let i = 0; i < p - 1; i++) {
    if (slots.value[i] > currentNum.value && slots.value[i] !== 0) valid = false
  }
  for (let i = p; i < SLOTS; i++) {
    if (slots.value[i] < currentNum.value && slots.value[i] !== 0) valid = false
  }
  if (!valid) {
    log.value.push(locale.current === 'pt-BR' ? `✗ ${currentNum.value} em ${p} = ERRADO` : `✗ ${currentNum.value} in ${p} = WRONG`)
    sfx.lose()
    status.value = 'lost'
    return
  }
  slots.value[p - 1] = currentNum.value
  log.value.push(`  ✓ ${currentNum.value} em ${p}`)
  sfx.powerup()
  input.value = ''
  // Check if all filled
  if (slots.value.every((s) => s !== 0)) {
    // level up
    if (level.value === 0) {
      status.value = 'won'
      sfx.win()
      log.value.push(locale.current === 'pt-BR' ? '★ SUPERESPIÃO!' : '★ SUPERSPY!')
      return
    }
    level.value--
    discardsLeft.value = 5 - level.value
    slots.value = Array(SLOTS).fill(0)
    log.value.push(locale.current === 'pt-BR' ? `─ Subiu para ${RANK.value[level.value]}` : `─ Promoted to ${RANK.value[level.value]}`)
    sfx.coin()
    next()
  } else {
    next()
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="5 - level"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'TESTE PARA ESPIÕES' : 'SPY TEST'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR'
          ? 'Coloque 10 números em ordem do menor para o maior. D = descartar.'
          : 'Place 10 numbers in order from smallest to largest. D = discard.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="cyan-phosphor">NÍVEL: <span class="text-amber">{{ RANK[level] }}</span></span>
        <span class="text-ink-muted">D: <span class="text-amber">{{ discardsLeft }}</span></span>
      </p>
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(s, i) in slots"
          :key="i"
          class="aspect-square border border-surface-600 grid place-items-center text-amber font-mono text-sm bg-void-deep"
          :class="s ? 'border-amber' : ''"
        >
          <span class="text-ink-dim text-[9px] absolute">{{ i + 1 }}</span>
          <span>{{ s || '·' }}</span>
        </div>
      </div>
      <GameLog :entries="log" :limit="8" class="border border-surface-600 bg-surface-800 p-2 h-32 text-xs space-y-0.5" />
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="input"
          :aria-label="locale.isPt ? 'Posição de 1 a 10 ou D para descartar' : 'Position from 1 to 10 or D to discard'"
          maxlength="2"
          :placeholder="locale.current === 'pt-BR' ? '1-10 ou D' : '1-10 or D'"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center text-2xl outline-none focus:border-phosphor-green uppercase"
          autofocus
        />
      </form>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ SUPERESPIÃO ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ REPROVADO ✕</p>
    </div>
  </CrtFrame>
</template>

<style scoped>
.aspect-square { position: relative; }
</style>
