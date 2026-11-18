<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const water = ref(5)
const food = ref(5)
const energy = ref(5)
const turn = ref(0)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

const ACTIONS = computed(() => {
  const r = locale.current
  return [
    { id: 'walk', label: { 'pt-BR': 'Andar (+progresso)', en: 'Walk (+progress)' }, cost: { w: 1, f: 1, e: 1 } },
    { id: 'rest', label: { 'pt-BR': 'Descansar', en: 'Rest' }, cost: { w: 0, f: 1, e: -2 } },
    { id: 'hunt', label: { 'pt-BR': 'Caçar (pegar comida)', en: 'Hunt (get food)' }, cost: { w: 1, f: -3, e: 1 } },
    { id: 'findwater', label: { 'pt-BR': 'Procurar água', en: 'Find water' }, cost: { w: -3, f: 0, e: 1 } },
  ]
})

function act(id: string) {
  const a = ACTIONS.value.find((x) => x.id === id)
  if (!a) return
  sfx.type()
  water.value -= a.cost.w
  food.value -= a.cost.f
  energy.value -= a.cost.e
  turn.value++

  // Random events
  const r = Math.random()
  if (r < 0.2) {
    // Sandstorm
    energy.value -= 2
    log.value.push(locale.current === 'pt-BR' ? '☼ Tempestade de areia! -2 energia' : '☼ Sandstorm! -2 energy')
  } else if (r < 0.4) {
    // Oasis
    water.value = Math.min(5, water.value + 2)
    log.value.push(locale.current === 'pt-BR' ? '☼ Oásis! +2 água' : '☼ Oasis! +2 water')
  }

  log.value.push(`▶ ${a.label[locale.current]} | W:${water.value} F:${food.value} E:${energy.value}`)

  if (water.value <= 0) { log.value.push(locale.current === 'pt-BR' ? '✕ Você morreu de sede' : '✕ Died of thirst'); status.value = 'lost'; sfx.lose() }
  else if (food.value <= 0) { log.value.push(locale.current === 'pt-BR' ? '✕ Você morreu de fome' : '✕ Died of hunger'); status.value = 'lost'; sfx.lose() }
  else if (energy.value <= 0) { log.value.push(locale.current === 'pt-BR' ? '✕ Você desmaiou' : '✕ Collapsed'); status.value = 'lost'; sfx.lose() }
  else if (turn.value >= 10) { status.value = 'won'; sfx.win(); log.value.push(locale.current === 'pt-BR' ? '★ Atravessou!' : '★ Crossed!') }
}

function start() {
  water.value = 5
  food.value = 5
  energy.value = 5
  turn.value = 0
  log.value = []
  status.value = 'playing'
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="DEATH VALLEY"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Atravesse o vale em 10 turnos. Gerencie água, comida e energia.' : 'Cross the valley in 10 turns. Manage water, food and energy.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">WATER</div>
          <div :class="water < 2 ? 'danger-phosphor' : 'cyan-phosphor'">💧{{ water }}</div>
        </div>
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">FOOD</div>
          <div :class="food < 2 ? 'danger-phosphor' : 'amber-phosphor'">🌵{{ food }}</div>
        </div>
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">ENERGY</div>
          <div :class="energy < 2 ? 'danger-phosphor' : 'phosphor'">⚡{{ energy }}</div>
        </div>
      </div>
      <p class="text-ink-muted text-xs">TURN <span class="text-amber">{{ turn }}</span>/10</p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div v-if="status === 'playing'" class="grid grid-cols-2 gap-1">
        <button
          v-for="a in ACTIONS"
          :key="a.id"
          class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5"
          @click="act(a.id)"
        >{{ a.label[locale.current] }}</button>
      </div>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ SURVIVED ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ FAILED ✕</p>
    </div>
  </CrtFrame>
</template>
