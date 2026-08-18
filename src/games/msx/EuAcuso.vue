<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const SUSPECTS = computed(() => {
  const r = locale.current
  return [
    { name: r === 'pt-BR' ? 'Sr. Silva' : 'Mr. Smith', alibi: 'library', guilty: false },
    { name: r === 'pt-BR' ? 'Sra. Jones' : 'Mrs. Jones', alibi: 'kitchen', guilty: true },
    { name: r === 'pt-BR' ? 'Dr. Costa' : 'Dr. Brown', alibi: 'study', guilty: false },
    { name: r === 'pt-BR' ? 'Srta. Lima' : 'Miss Lee', alibi: 'garden', guilty: false },
  ]
})

const WEAPONS = [
  { name: { 'pt-BR': 'castiçal', en: 'candlestick' }, used: true },
  { name: { 'pt-BR': 'faca', en: 'knife' }, used: false },
  { name: { 'pt-BR': 'corda', en: 'rope' }, used: false },
  { name: { 'pt-BR': 'revolver', en: 'revolver' }, used: false },
]

const PLACES = ['library', 'kitchen', 'study', 'garden', 'ballroom']

const target = ref<{ suspect: typeof SUSPECTS.value[number]; weapon: typeof WEAPONS[number] } | null>(null)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const input = ref('')
const tries = ref(0)

function start() {
  const sus = SUSPECTS.value[Math.floor(Math.random() * SUSPECTS.value.length)]
  const wep = WEAPONS[Math.floor(Math.random() * WEAPONS.length)]
  target.value = { suspect: sus, weapon: wep }
  log.value = [locale.current === 'pt-BR' ? 'Houve um crime! Encontre o culpado e a arma.' : 'A crime! Find the killer and weapon.']
  status.value = 'playing'
  tries.value = 0
  input.value = ''
}

function interrogate(name: string) {
  if (!target.value) return
  const sus = SUSPECTS.value.find((s) => s.name.toLowerCase().includes(name.toLowerCase()))
  if (!sus) {
    log.value.push(locale.current === 'pt-BR' ? 'Não há essa pessoa.' : 'No such person.')
    return
  }
  tries.value++
  sfx.type()
  if (sus.guilty) {
    log.value.push(`${sus.name}: "${locale.current === 'pt-BR' ? 'Eu estava...' : 'I was...'}" (hesita)`)
  } else {
    log.value.push(`${sus.name}: "${locale.current === 'pt-BR' ? 'Eu estava na ' + sus.alibi : 'I was in the ' + sus.alibi}"`)
  }
}

function accuse() {
  if (!target.value) return
  const parts = input.value.toLowerCase().split(/\s+/)
  const susName = parts.slice(1).join(' ')
  const wepName = parts[0]
  const sus = SUSPECTS.value.find((s) => s.name.toLowerCase().includes(susName))
  const wep = WEAPONS.find((w) => w.name[locale.current].toLowerCase().includes(wepName) || wepName.includes(w.name[locale.current].toLowerCase()))
  if (sus && sus.guilty && wep === target.value.weapon) {
    status.value = 'won'
    sfx.win()
  } else {
    log.value.push(locale.current === 'pt-BR' ? '✗ Acusação errada' : '✗ Wrong accusation')
    tries.value += 3
    sfx.error()
    if (tries.value > 8) {
      status.value = 'lost'
      sfx.lose()
    }
  }
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'EU ACUSO!' : 'I ACCUSE!'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="tries === 0 && log.length === 1 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Interrogue suspeitos (nome). Acuse: "FACA SILVA" = arma suspeito.' : 'Interrogate (name). Accuse: "KNIFE SMITH" = weapon suspect.' }}
      </p>
      <p class="text-cyan text-xs mb-4">Suspeitos: {{ SUSPECTS.map((s) => s.name).join(', ') }}</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TENTATIVAS <span :class="tries > 6 ? 'danger-phosphor' : 'text-amber'">{{ tries }}</span></p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <button
          v-for="s in SUSPECTS"
          :key="s.name"
          class="arcade-btn-ghost border border-surface-600 text-[10px] py-1"
          @click="interrogate(s.name)"
        >?</button>
      </div>
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="accuse">
        <input
          v-model="input"
          :placeholder="locale.current === 'pt-BR' ? 'arma suspeito' : 'weapon suspect'"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
        />
        <button class="arcade-btn arcade-btn-magenta">⚖</button>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ CASO RESOLVIDO ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ FALHOU ✕</p>
    </div>
  </CrtFrame>
</template>
