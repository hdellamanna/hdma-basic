<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const s = ref(10) // grid size
const x = ref(0); const y = ref(0); const d = ref(0)
const xi = ref(''); const yi = ref(''); const di = ref('')
const bombs = ref(4)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  x.value = Math.floor(Math.random() * s.value)
  y.value = Math.floor(Math.random() * s.value)
  d.value = Math.floor(Math.random() * s.value)
  bombs.value = 4
  xi.value = ''; yi.value = ''; di.value = ''
  log.value = []
  status.value = 'playing'
}

function submit() {
  const a = parseInt(xi.value, 10)
  const b = parseInt(yi.value, 10)
  const c = parseInt(di.value, 10)
  if ([a, b, c].some(isNaN)) return
  bombs.value--
  sfx.shoot()

  if (a === x.value && b === y.value && c === d.value) {
    log.value.push(`▶ ${a} ${b} ${c} → ★ BOOM! ACERTOU!`)
    status.value = 'won'
    sfx.explode()
    return
  }
  let msg = `▶ ${a} ${b} ${c} →`
  if (b > y.value) msg += ' NORTH'
  if (b < y.value) msg += ' SOUTH'
  if (a > x.value) msg += ' WEST'
  if (a < x.value) msg += ' EAST'
  if (c > d.value) msg += ' TOO FAR'
  if (c < d.value) msg += ' NOT FAR ENOUGH'
  log.value.push(msg)
  sfx.error()

  if (bombs.value <= 0) {
    log.value.push(`✕ Elron te capturou. (${x.value}, ${y.value}, ${d.value})`)
    status.value = 'lost'
    sfx.lose()
  }
  xi.value = ''; yi.value = ''; di.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="EVIL ALIEN ELRON"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR'
          ? 'Elron está em um grid 3D. Você tem 4 bombas. Mate-o!'
          : 'Elron is hidden in a 3D grid. You have 4 bombs. Kill him!' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2 text-amber">
      <p class="text-danger text-lg">BOMBS: <span class="font-bold">{{ bombs }}</span></p>
      <div class="border border-surface-600 bg-surface-800 p-3 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="grid grid-cols-3 gap-1" @submit.prevent="submit">
        <input v-model="xi" type="number" min="0" max="9" placeholder="X" class="bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green text-center" />
        <input v-model="yi" type="number" min="0" max="9" placeholder="Y" class="bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green text-center" />
        <input v-model="di" type="number" min="0" max="9" placeholder="D" class="bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green text-center" />
        <button class="col-span-3 arcade-btn">💣 FIRE</button>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-2">★ BOOM! ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center py-2">✕ CAPTURED ✕</p>
    </div>
  </CrtFrame>
</template>
