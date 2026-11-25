<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const props = defineProps<{ id: string }>()
const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
// Each floor plan is connected. Rotation and reflection preserve its routes.
const plans = [
  ['.......', '.##.#..', '....#..', '.#...#.', '...#...', '.##....', '.......'],
  ['.......', '..#.#..', '.#...#.', '...#...', '.##.##.', '.......', '..#.#..'],
  ['.......', '.#.#.#.', '.#.....', '...##..', '.#...#.', '..#.#..', '.......'],
]
type Setting = [
  number,
  number,
  string,
  string,
  'chase' | 'water' | 'sweep' | 'fuse',
  string,
]
const settings: Record<string, Setting> = {
  'haunted-house': [0, 2, 'Relíquias', 'Relics', 'chase', 'gem'],
  'death-valley': [1, 1, 'Cantis', 'Canteens', 'water', 'drop'],
  'space-mines': [2, 0, 'Minas', 'Mines', 'fuse', 'spark'],
  'space-rescue': [1, 3, 'Astronautas', 'Astronauts', 'water', 'person'],
  'dungeon-of-doom': [0, 1, 'Runas', 'Runes', 'chase', 'gem'],
  'battle-at-traitors-castle': [1, 2, 'Postos', 'Outposts', 'sweep', 'flag'],
  escape: [2, 1, 'Chaves', 'Keys', 'sweep', 'key'],
  'tower-of-terror': [2, 2, 'Selos', 'Seals', 'fuse', 'gem'],
  jaws: [0, 0, 'Presas', 'Prey', 'chase', 'fish'],
  'flying-witches': [1, 0, 'Ingredientes', 'Ingredients', 'water', 'drop'],
  cemiterio: [0, 3, 'Lanternas', 'Lanterns', 'chase', 'spark'],
  'labirinto-assombrado': [2, 3, 'Cristais', 'Crystals', 'chase', 'gem'],
  'marie-celeste': [0, 0, 'Sobreviventes', 'Survivors', 'water', 'person'],
  'labirinto-3d': [1, 1, 'Marcos', 'Markers', 'chase', 'flag'],
  holofote: [2, 2, 'Documentos', 'Documents', 'sweep', 'scroll'],
  'encontro-marcado': [0, 1, 'Despachos', 'Dispatches', 'sweep', 'key'],
}
const [plan, rotation, pt, en, rule, icon] = settings[props.id]
const shapes: Record<string, string> = {
  gem: 'M0 -8 7 0 0 9 -7 0Z M-7 0H7',
  drop: 'M0 -9Q13 4 4 8Q-10 12 -7 2Z',
  spark: 'M2 -9 -6 1H-1L-3 9 7 -2H2Z',
  person: 'M-5 8V3Q-4 -1 0 -1Q5 -1 5 3V8 M0 -2A3 3 0 1 0 0 -8A3 3 0 0 0 0 -2',
  flag: 'M-5 9V-8Q0 -11 6 -6L2 -2 -5 -3',
  key: 'M-2 0A4 4 0 1 1 0 -3L8 5 5 8 3 6 1 7Z',
  fish: 'M-8 -5 -4 -2Q1 -9 8 0Q2 7 -4 2L-8 5Z',
  scroll: 'M-6 -8H5V8H-6Z M-3 -4H2 M-3 0H2',
}
const terrain = Array.from({ length: 49 }, (_, i) => {
  let x = i % 7,
    y = Math.floor(i / 7)
  for (let k = 0; k < rotation; k++) [x, y] = [6 - y, x]
  return plans[plan][y][x]
})
const adjacent = (a: number, b: number) =>
  Math.abs((a % 7) - (b % 7)) +
    Math.abs(Math.floor(a / 7) - Math.floor(b / 7)) ===
  1
const neighbors = (p: number) =>
  [p - 7, p + 7, p - 1, p + 1].filter(
    (n) => n >= 0 && n < 49 && terrain[n] !== '#' && adjacent(n, p),
  )
const position = ref(0),
  collected = ref<number[]>([]),
  turn = ref(0),
  supply = ref(18),
  foe = ref(48)
const limit = props.id === 'tower-of-terror' ? 48 : rule === 'fuse' ? 32 : 60
const board = ref<HTMLElement>()
const visited = ref<number[]>([0])
const fog = ['labirinto-assombrado', 'labirinto-3d'].includes(props.id)
const ordered = [
  'encontro-marcado',
  'battle-at-traitors-castle',
  'tower-of-terror',
].includes(props.id)
const isVisible = (cell: number) =>
  !fog ||
  visited.value.includes(cell) ||
  adjacent(cell, position.value) ||
  cell === position.value
const phase = ref<'ready' | 'play' | 'won' | 'lost'>('ready')
const sites = [6, 42, 24].map((n) => (terrain[n] === '#' ? neighbors(n)[0] : n))
const remaining = computed(() =>
  sites.filter((n) => !collected.value.includes(n)),
)
const danger = computed(() =>
  rule === 'chase'
    ? [foe.value]
    : rule === 'sweep'
      ? [7 * (1 + (Math.floor(turn.value / 2) % 5)) + 3]
      : [],
)
function start() {
  board.value?.focus()
  visited.value = [0]
  position.value = 0
  collected.value = []
  turn.value = 0
  supply.value = 18
  foe.value = 48
  phase.value = 'play'
}
function pursue() {
  const queue = [position.value],
    seen = new Set(queue)
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]
    if (adjacent(p, foe.value)) {
      foe.value = p
      return
    }
    for (const n of neighbors(p))
      if (!seen.has(n)) {
        seen.add(n)
        queue.push(n)
      }
  }
}
function move(n: number) {
  if (
    phase.value !== 'play' ||
    (position.value !== n && !neighbors(position.value).includes(n))
  )
    return
  position.value = n
  turn.value++
  if (!visited.value.includes(n)) visited.value.push(n)
  if (danger.value.includes(n)) {
    phase.value = 'lost'
    return
  }
  if (rule === 'water') supply.value--
  if (ordered ? remaining.value[0] === n : remaining.value.includes(n)) {
    collected.value.push(n)
    supply.value = 18
  }
  if (!remaining.value.length && n === 48) {
    phase.value = 'won'
    return
  }
  if (rule === 'chase' && turn.value % 3 === 0) pursue()
  if (danger.value.includes(n) || supply.value === 0 || turn.value >= limit)
    phase.value = 'lost'
}
const directions = [
  ['ArrowUp', '↑', -7],
  ['ArrowLeft', '←', -1],
  ['ArrowDown', '↓', 7],
  ['ArrowRight', '→', 1],
] as const
function key(e: KeyboardEvent) {
  const d = directions.find(([key]) => key === e.key)
  if (d && phase.value === 'play') {
    e.preventDefault()
    move(position.value + d[2])
  }
}
</script>
<template>
  <div ref="board" class="instrument" tabindex="0" @keydown="key">
    <div class="meter">
      <span>{{ locale.isPt ? pt : en }} · {{ collected.length }} / 3</span>
      <span>
        {{
          rule === 'water' ? tr('Reserva', 'Supply') : tr('Turnos', 'Turns')
        }}
        · {{ rule === 'water' ? supply : limit - turn }}
      </span>
    </div>
    <svg
      class="chart"
      viewBox="0 0 224 224"
      role="img"
      :aria-label="tr('Mapa da expedição', 'Expedition map')"
    >
      <g
        v-for="(cell, i) in terrain"
        :key="i"
        :transform="
          'translate(' +
          ((i % 7) * 32 + 16) +
          ' ' +
          (Math.floor(i / 7) * 32 + 16) +
          ')'
        "
        @click="move(i)"
      >
        <rect
          x="-15"
          y="-15"
          width="30"
          height="30"
          rx="2"
          :fill="cell === '#' ? '#57675b' : '#172e2a'"
        />
        <rect
          v-if="!isVisible(i)"
          x="-15"
          y="-15"
          width="30"
          height="30"
          fill="#10201e"
        />
        <path
          v-if="isVisible(i) && cell === '#'"
          d="M-12 9 0 -8 11 8 M-7 9 0 -1 6 8"
          fill="none"
          stroke="#96a392"
        />
        <path
          v-if="i === 48"
          d="M-9 10V-4Q0 -18 9 -4V10 M-11 10H11"
          fill="none"
          stroke="#e4bf81"
          stroke-width="2"
        />
        <path
          v-if="
            isVisible(i) &&
            (ordered ? remaining[0] === i : remaining.includes(i))
          "
          :d="shapes[icon]"
          stroke="#ffe6a5"
          fill="#806845"
          stroke-width="1.6"
        />
        <path
          v-if="isVisible(i) && danger.includes(i)"
          d="M0 -10 10 8H-10Z M0 -4V2 M0 4V6"
          stroke="#f7b89f"
          fill="#843d37"
          stroke-width="2"
        />
        <circle
          v-if="position === i"
          r="8"
          fill="#8fe1c7"
          stroke="#153b34"
          stroke-width="3"
        />
      </g>
    </svg>
    <div class="game-controls">
      <template v-if="phase === 'play'">
        <button
          v-for="[key, glyph, delta] in directions"
          :key="key"
          :aria-label="key"
          @click="move(position + delta)"
        >
          {{ glyph }}
        </button>
        <button @click="move(position)">
          {{ tr('Esperar', 'Wait') }}
        </button>
      </template>
      <template v-else>
        <span v-if="phase !== 'ready'" role="status">
          {{
            phase === 'won'
              ? tr('Missão cumprida', 'Mission complete')
              : tr('Expedição encerrada', 'Expedition over')
          }}
        </span>
        <button @click="start">
          {{
            phase === 'ready'
              ? tr('Iniciar missão', 'Start mission')
              : tr('Jogar novamente', 'Play again')
          }}
        </button>
      </template>
    </div>
  </div>
</template>
