<script setup lang="ts">
/**
 * Encontro Marcado (Dead Drop) — Usborne Computer Spy Games (1984)
 * Simplified adventure: collect briefcase + meet contact before the last flight.
 * Uses 2-word commands: GO/IR [place], FOLLOW/SEGUIR, EXAMINE/EXAMINAR,
 * SAY/DIZER [password], READ/LER, OPEN/ABRIR [num], LEAVE/DEIXAR, WAIT/ESPERAR, TIME/HORA.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const PLACES = [
  'aeroporto', 'estacao', 'hotel', 'aeroporto2',
  'ponte', 'rio', 'parque', 'circo',
  'coreto', 'igreja', 'escola', 'praca',
  'correio', 'delegacia', 'prefeitura', 'biblioteca',
  'casa1', 'casa2', 'casa3', 'casa4',
]
const placeNames = computed(() => {
  const r = locale.current
  return r === 'pt-BR'
    ? ['Aeroporto', 'Estação', 'Hotel', 'Aeroporto 2', 'Ponte', 'Rio', 'Parque', 'Circo', 'Coreto', 'Igreja', 'Escola', 'Praça', 'Correio', 'Delegacia', 'Prefeitura', 'Biblioteca', 'Casa 1', 'Casa 2', 'Casa 3', 'Casa 4']
    : ['Airport', 'Station', 'Hotel', 'Airport 2', 'Bridge', 'River', 'Park', 'Circus', 'Bandstand', 'Church', 'School', 'Square', 'Post', 'Police', 'Townhall', 'Library', 'House 1', 'House 2', 'House 3', 'House 4']
})

// Adjacency (simplified — each place connects to ~2 others)
const ADJ: Record<number, number[]> = {
  0: [1, 2], 1: [0, 4, 9], 2: [0, 11, 12], 3: [0, 7],
  4: [1, 5], 5: [4, 6], 6: [5, 7, 11], 7: [3, 6, 8],
  8: [7, 9, 13], 9: [1, 8, 10], 10: [9, 14], 11: [2, 6, 15],
  12: [2, 16], 13: [8, 17], 14: [10, 18], 15: [11, 19],
  16: [12, 19], 17: [13, 18], 18: [14, 17, 19], 19: [15, 16, 18],
}

const playerPlace = ref(0)
const spyPlace = ref(2)  // Hotel
const keyPlace = ref(2)  // Hotel (enemies have it)
const briefcasePlace = ref(1)  // Estação
const contactPlace = ref(15)  // Biblioteca
const hasKey = ref(false)
const hasBriefcase = ref(false)
const metContact = ref(false)
const messageLeft = ref(false)
const hour = ref(10)  // 10.00
const minute = ref(0)
const lastFlightHour = ref(23)
const phase = ref<'menu' | 'play' | 'win' | 'lose'>('menu')
const log = ref<string[]>([])
const input = ref('')
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  input.value = ''
  playerPlace.value = 0
  spyPlace.value = 2
  hasKey.value = false
  hasBriefcase.value = false
  metContact.value = false
  messageLeft.value = false
  hour.value = 10
  minute.value = 0
  lastFlightHour.value = 23
  status.value = 'playing'
  log.value = [
    locale.current === 'pt-BR'
      ? 'Missão: apanhe a maleta na estação, encontre a senha, deixe mensagem no local do contato, e chegue ao aeroporto antes do último voo (23h).'
      : 'Mission: get the briefcase at the station, find the password, leave a message at the contact location, and reach the airport before the last flight (23h).',
    locale.current === 'pt-BR' ? `Local: ${placeNames.value[0]}` : `Location: ${placeNames.value[0]}`,
    locale.current === 'pt-BR' ? `Hora: ${pad(hour.value)}:${pad(minute.value)}` : `Time: ${pad(hour.value)}:${pad(minute.value)}`,
  ]
  sfx.start()
  phase.value = 'play'
}

function pad(n: number) { return n.toString().padStart(2, '0') }

function placeName(idx: number) { return placeNames.value[idx] }

function moveTo(place: string) {
  const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f\s]/g, '').toLowerCase()
  const name = normalize(place)
  const target = PLACES.findIndex((id, index) => id === name || normalize(placeName(index)) === name)
  if (target === -1) {
    log.value.push(locale.current === 'pt-BR' ? `✗ Lugar "${place}" desconhecido` : `✗ Place "${place}" unknown`)
    sfx.error()
    return
  }
  if (!ADJ[playerPlace.value].includes(target)) {
    log.value.push(locale.current === 'pt-BR' ? `✗ ${placeName(target)} não é vizinho` : `✗ ${placeName(target)} not adjacent`)
    sfx.error()
    return
  }
  const previous = playerPlace.value
  playerPlace.value = target
  advanceTime(15)
  if (status.value !== 'playing') return
  if (target === spyPlace.value) {
    log.value.push(locale.current === 'pt-BR' ? '✕ O espião inimigo te viu! Capturado.' : '✕ Enemy spy saw you! Captured.')
    status.value = 'lost'
    sfx.lose()
    return
  }
  spyPlace.value = previous
  sfx.tick()
  log.value.push(locale.current === 'pt-BR' ? `▶ ${placeName(target)}` : `▶ ${placeName(target)}`)
  checkLandmarks()
}

function checkLandmarks() {
  const p = playerPlace.value
  if (p === 1 && !hasBriefcase.value && briefcasePlace.value === 1) {
    if (hasKey.value) {
      hasBriefcase.value = true
      log.value.push(locale.current === 'pt-BR' ? '✓ Pegou a maleta do escaninho.' : '✓ Got the briefcase from the locker.')
      sfx.powerup()
    } else {
      log.value.push(locale.current === 'pt-BR' ? '▸ Escaninho trancado. Precisa da chave.' : '▸ Locker is locked. Need the key.')
    }
  }
  if (p === contactPlace.value && !messageLeft.value) {
    log.value.push(locale.current === 'pt-BR' ? '▸ Local do contato. DIZER senha ou DEIXAR mensagem.' : '▸ Contact location. SAY password or LEAVE message.')
  }
  if (p === 0 && metContact.value) {
    log.value.push(locale.current === 'pt-BR' ? '▸ Aeroporto. DIZER senha para entrar no último voo.' : '▸ Airport. SAY password to board the last flight.')
  }
}

function examine() {
  if (playerPlace.value === spyPlace.value) {
    log.value.push(locale.current === 'pt-BR' ? `▸ Espião aqui. EXAMINAR (com cuidado).` : `▸ Spy here. EXAMINE (carefully).`)
    return
  }
  // If examining someone with key in same place
  if (playerPlace.value === keyPlace.value && !hasKey.value) {
    hasKey.value = true
    log.value.push(locale.current === 'pt-BR' ? '✓ Achou a chave!' : '✓ Found the key!')
    sfx.coin()
  } else {
    log.value.push(locale.current === 'pt-BR' ? 'Nada de especial.' : 'Nothing special.')
  }
}

function say(pwd: string) {
  // password is the city — try checking
  if (pwd.toLowerCase() === 'escola' || pwd.toLowerCase() === 'school') {
    log.value.push(locale.current === 'pt-BR' ? '✓ Senha correta!' : '✓ Correct password!')
    if (playerPlace.value === contactPlace.value && hasBriefcase.value) {
      metContact.value = true
    } else if (playerPlace.value === 0 && hasBriefcase.value && metContact.value && messageLeft.value) {
      advanceTime(2)
      if (status.value === 'playing') {
        status.value = 'won'
        sfx.win()
      }
      return
    }
    sfx.powerup()
  } else {
    log.value.push(locale.current === 'pt-BR' ? `✗ Senha "${pwd}" errada` : `✗ Password "${pwd}" wrong`)
    sfx.error()
  }
  advanceTime(2)
}

function leave(msg: string) {
  if (playerPlace.value !== contactPlace.value) {
    log.value.push(locale.current === 'pt-BR' ? '✗ Não é o local do contato' : '✗ Not the contact location')
    return
  }
  messageLeft.value = true
  log.value.push(locale.current === 'pt-BR' ? `✓ Mensagem "${msg}" deixada` : `✓ Message "${msg}" left`)
  sfx.coin()
  advanceTime(5)
}

function read() {
  log.value.push(locale.current === 'pt-BR' ? '▸ Nenhuma mensagem para ler aqui.' : '▸ No message to read here.')
}

function open() {
  // try opening briefcase — but we already auto-pickup
  log.value.push(locale.current === 'pt-BR' ? '▸ Nada para abrir aqui.' : '▸ Nothing to open here.')
}

function checkTime() {
  return `${pad(hour.value)}:${pad(minute.value)}`
}

function advanceTime(min: number) {
  minute.value += min
  while (minute.value >= 60) {
    minute.value -= 60
    hour.value++
  }
  if (hour.value >= lastFlightHour.value) {
    log.value.push(locale.current === 'pt-BR' ? '✕ Último voo partiu. Missão falhou.' : '✕ Last flight left. Mission failed.')
    status.value = 'lost'
    sfx.lose()
  }

}

function parse(text: string) {
  const t = text.toLowerCase().trim()
  const parts = t.split(/\s+/)
  const verb = parts[0]
  const noun = parts.slice(1).join(' ')
  if (status.value !== 'playing') return
  sfx.type()
  if (['go', 'ir', 'walk', 'andar'].includes(verb)) {
    if (!noun) {
      log.value.push(locale.current === 'pt-BR' ? '✗ IR para onde?' : '✗ GO where?')
      return
    }
    moveTo(noun)
  } else if (['examine', 'examinar', 'look', 'ver'].includes(verb)) {
    examine()
  } else if (['say', 'dizer', 'falar'].includes(verb)) {
    if (!noun) {
      log.value.push(locale.current === 'pt-BR' ? '✗ DIZER o quê?' : '✗ SAY what?')
      return
    }
    say(noun)
  } else if (['leave', 'deixar'].includes(verb)) {
    if (!noun) {
      log.value.push(locale.current === 'pt-BR' ? '✗ DEIXAR o quê?' : '✗ LEAVE what?')
      return
    }
    leave(noun)
  } else if (['read', 'ler'].includes(verb)) {
    read()
  } else if (['open', 'abrir'].includes(verb)) {
    open()
  } else if (['time', 'hora'].includes(verb)) {
    log.value.push(locale.current === 'pt-BR' ? `▸ ${checkTime()}` : `▸ ${checkTime()}`)
  } else if (['help', 'ajuda', '?'].includes(verb)) {
    log.value.push(locale.current === 'pt-BR'
      ? '▸ IR [lugar] · EXAMINAR · DIZER [senha] · DEIXAR [msg] · LER · HORA · AJUDA'
      : '▸ GO [place] · EXAMINE · SAY [pwd] · LEAVE [msg] · READ · TIME · HELP')
  } else {
    log.value.push(locale.current === 'pt-BR' ? `✗ "${verb}" desconhecido. AJUDA.` : `✗ "${verb}" unknown. HELP.`)
  }
}

function submit() {
  parse(input.value)
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'ENCONTRO MARCADO' : 'DEAD DROP'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="phase === 'menu'" class="text-center py-6 space-y-3">
      <p class="text-ink-muted text-sm">
        {{ locale.current === 'pt-BR'
          ? 'Missão de espionagem. Colete a maleta, descubra a senha (escola), faça o contato, e pegue o último voo.'
          : 'Spy mission. Collect the briefcase, find the password (school), meet the contact, and catch the last flight.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ {{ locale.current === 'pt-BR' ? 'COMEÇAR' : 'START' }}</button>
    </div>
    <div v-else class="font-mono text-sm leading-relaxed flex flex-col h-[60vh] min-h-[420px]">
      <div class="flex items-center gap-3 text-xs mb-2 flex-wrap">
        <span class="text-cyan">▸ {{ placeName(playerPlace) }}</span>
        <span :class="hasKey ? 'amber-phosphor' : 'text-ink-dim'">🔑 {{ hasKey ? 'SIM' : '—' }}</span>
        <span :class="hasBriefcase ? 'amber-phosphor' : 'text-ink-dim'">💼 {{ hasBriefcase ? 'SIM' : '—' }}</span>
        <span :class="metContact ? 'amber-phosphor' : 'text-ink-dim'">🤝 {{ metContact ? 'SIM' : '—' }}</span>
        <span :class="messageLeft ? 'amber-phosphor' : 'text-ink-dim'">✉ {{ messageLeft ? 'SIM' : '—' }}</span>
        <span class="text-magenta ml-auto">⏰ {{ pad(hour) }}:{{ pad(minute) }}</span>
      </div>
      <p class="text-xs text-cyan">{{ locale.current === 'pt-BR' ? 'Destinos' : 'Destinations' }}: {{ ADJ[playerPlace].map(placeName).join(' · ') }}. {{ locale.current === 'pt-BR' ? 'Espião' : 'Spy' }}: {{ placeName(spyPlace) }}</p>
      <GameLog :entries="log" :limit="30" preserve-whitespace class="flex-1 pr-2 space-y-0.5 phosphor" />
      <form v-if="status === 'playing'" class="mt-2 flex items-center gap-2 border-t border-surface-600 pt-2" @submit.prevent="submit">
        <span class="phosphor">&gt;</span>
        <input
          v-model="input"
          :aria-label="locale.isPt ? 'Comando da aventura' : 'Adventure command'"
          class="flex-1 bg-transparent border-none outline-none text-amber font-mono placeholder-ink-dim"
          :placeholder="locale.current === 'pt-BR' ? 'IR ESTACAO · EXAMINAR · DIZER ESCOLA · HORA' : 'GO STATION · EXAMINE · SAY SCHOOL · TIME'"
          autofocus
          autocomplete="off"
          spellcheck="false"
        />
      </form>
      <div v-else class="mt-2 border-t border-surface-600 pt-2 text-center">
        <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display">★ MISSÃO COMPLETA ★</p>
        <p v-else class="danger-phosphor text-shadow-neon font-display">✕ MISSÃO FALHOU ✕</p>
      </div>
    </div>
  </CrtFrame>
</template>
