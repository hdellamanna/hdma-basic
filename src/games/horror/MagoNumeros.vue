<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const numbers = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
const used = ref<boolean[]>(Array(10).fill(false))
const tries = ref(8)
const d1 = ref(0); const d2 = ref(0)
const a = ref(''); const b = ref('')
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  tries.value = 8
  used.value = Array(10).fill(false)
  a.value = ''
  b.value = ''
  log.value = []
  status.value = 'playing'
  roll()
}

function roll() {
  d1.value = 1 + Math.floor(Math.random() * 6)
  d2.value = 1 + Math.floor(Math.random() * 6)
  if (d1.value === d2.value) {
    tries.value++
    log.value.push(`▶ ${d1.value}+${d2.value} = ${d1.value + d2.value} (dobradinha! +1)`)
  } else {
    log.value.push(`▶ ${d1.value}+${d2.value} = ${d1.value + d2.value}`)
  }
  sfx.tick()
}

function submit() {
  if (status.value !== 'playing') return
  const x = parseInt(a.value, 10)
  const y = parseInt(b.value, 10)
  if (isNaN(x) || isNaN(y) || x < 0 || x > 9 || y < 0 || y > 9) {
    log.value.push(locale.current === 'pt-BR' ? '✗ Inválido' : '✗ Invalid')
    return
  }
  if (x === y) {
    log.value.push(locale.current === 'pt-BR' ? '✗ Não pode repetir' : '✗ Can\'t repeat')
    return
  }
  if (used.value[x] || used.value[y]) {
    log.value.push(locale.current === 'pt-BR' ? '✗ Já usado' : '✗ Already used')
    return
  }
  if (x + y !== d1.value + d2.value) {
    log.value.push(locale.current === 'pt-BR' ? `✗ ${x}+${y}≠${d1.value + d2.value}` : `✗ ${x}+${y}≠${d1.value + d2.value}`)
    return
  }
  if (x !== 0) used.value[x] = true
  if (y !== 0) used.value[y] = true
  a.value = ''
  b.value = ''
  sfx.coin()
  log.value.push(`✓ ${x} + ${y}`)
  if (used.value.slice(1).every((u) => u)) {
    status.value = 'won'
    sfx.win()
    return
  }
  nextTurn()
}

function nextTurn() {
  a.value = ''
  b.value = ''
  if (status.value !== 'playing') return
  tries.value--
  if (tries.value <= 0) {
    status.value = 'lost'
    sfx.lose()
  } else {
    roll()
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'O MAGO DOS NÚMEROS' : 'THE NUMBER WIZARD'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'O Mago joga 2 dados. Encontre 2 números da tela cuja soma bata. 8 tentativas.' : 'The Wizard rolls 2 dice. Find 2 numbers from the screen that sum to it. 8 tries.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TRIES <span :class="tries < 3 ? 'danger-phosphor' : 'text-amber'">{{ tries }}</span></p>
      <div class="grid grid-cols-10 gap-1">
        <button
          v-for="(n, i) in numbers"
          :key="i"
          :disabled="used[i]"
          class="aspect-square text-amber border border-surface-600 phosphor"
          :class="used[i] ? 'opacity-30 line-through' : 'hover:bg-phosphor-green/20'"
          @click="a === '' ? a = String(n) : b = String(n)"
        >{{ n }}</button>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="a" type="number" min="0" max="9" class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center outline-none focus:border-phosphor-green" />
        <span class="text-cyan">+</span>
        <input v-model="b" type="number" min="0" max="9" class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center outline-none focus:border-phosphor-green" />
        <span class="text-cyan">=</span>
        <span class="text-amber text-2xl font-display w-12 text-center">{{ d1 + d2 }}</span>
      </div>
      <button v-if="status === 'playing'" class="arcade-btn w-full" @click="nextTurn">{{ locale.current === 'pt-BR' ? 'Passar vez' : 'Pass turn' }}</button>
      <button v-if="status === 'playing'" class="arcade-btn arcade-btn-amber w-full" @click="submit">▶ SUBMIT</button>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ DERROTOU O MAGO ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ MAGO VENCEU ✕</p>
    </div>
  </CrtFrame>
</template>
