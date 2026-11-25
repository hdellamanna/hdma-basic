<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const props = defineProps<{ id: string }>(),
  locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
const dodge = ['asteroid-belt', 'iceberg'].includes(props.id),
  bombing = props.id === 'supersonic-bomber'
const shapes: Record<string, string> = {
  'asteroid-belt': 'M-9 -4 -4 -10 5 -8 10 -1 6 8 -3 10 -10 4Z',
  iceberg: 'M-12 8 -4 -7 0 -3 4 -12 12 8Z',
  'pirate-dogfight':
    'M0 -12 3 -3 13 3 12 6 3 4 3 9 0 7 -3 9 -3 4 -12 6 -13 3 -3 -3Z',
  'monsters-of-galacticon':
    'M-10 -7 -5 -4 0 -8 5 -4 10 -7 8 3 11 7 4 6 0 10 -4 6 -11 7 -8 3Z',
  'alien-snipers': 'M-9 -6Q0 -13 9 -6L7 5 0 10 -7 5Z',
  'robot-invaders': 'M-9 -6H9V7H-9Z M-6 -10V-6 M6 -10V-6',
  'star-trek': 'M-12 -8 -7 4 -1 2 0 -7 2 2 7 4 12 -8 11 7 0 11 -11 7Z',
  missile: 'M0 -10Q6 -5 4 3L8 9 0 6 -8 9 -4 3Q-6 -5 0 -10Z',
  'supersonic-bomber': 'M-10 7V-5H-4V-9H4V-5H10V7Z',
}
const board = ref<HTMLElement>()
const shields = ref(2),
  shieldUntil = ref(0)
const frontier = ['alien-snipers', 'robot-invaders', 'missile'].includes(
  props.id,
)
function shield() {
  if (
    props.id === 'star-trek' &&
    phase.value === 'play' &&
    shields.value > 0 &&
    distance.value >= shieldUntil.value
  ) {
    shields.value--
    shieldUntil.value = distance.value + 2
  }
}
const lanes = [32, 82, 132, 182, 232],
  lane = ref(2),
  hull = ref(3),
  score = ref(0),
  distance = ref(0)
const phase = ref<'ready' | 'play' | 'won' | 'lost'>('ready')
const objects = ref<{ id: number; lane: number; y: number }[]>([]),
  shots = ref<{ id: number; lane: number; y: number }[]>([])
let frame = 0,
  previous = 0,
  untilSpawn = 0,
  cooldown = 0,
  serial = 0
function start() {
  board.value?.focus()
  shields.value = 2
  shieldUntil.value = 0
  cancelAnimationFrame(frame)
  lane.value = 2
  hull.value = 3
  score.value = 0
  distance.value = 0
  objects.value = []
  shots.value = []
  previous = 0
  untilSpawn = 0
  cooldown = 0
  phase.value = 'play'
  frame = requestAnimationFrame(tick)
}
function tick(now: number) {
  const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0
  previous = now
  distance.value += dt
  untilSpawn -= dt
  cooldown -= dt
  if (untilSpawn <= 0) {
    untilSpawn = props.id === 'missile' ? 0.78 : 1.08
    const track =
      props.id === 'alien-snipers' ? lane.value : Math.floor(Math.random() * 5)
    objects.value.push({ id: ++serial, lane: track, y: -12 })
    if (props.id === 'monsters-of-galacticon' || props.id === 'asteroid-belt')
      objects.value.push({ id: ++serial, lane: (track + 2) % 5, y: -12 })
  }
  for (const shot of shots.value) shot.y -= dt * 230
  for (const obj of objects.value) {
    const oldY = obj.y
    obj.y += dt * (props.id === 'iceberg' ? 68 : 95)
    if (props.id === 'pirate-dogfight' && oldY < 60 && obj.y >= 60)
      obj.lane = (obj.lane + 1) % 5
    if (props.id === 'robot-invaders' && oldY < 90 && obj.y >= 90)
      obj.lane = (obj.lane + 4) % 5
    const hit = shots.value.find(
      (s) => s.lane === obj.lane && Math.abs(s.y - obj.y) < 15,
    )
    if (hit) {
      hit.y = -60
      obj.y = 999
      score.value++
      continue
    }
    if (obj.y >= 184 && obj.lane === lane.value) {
      if (distance.value >= shieldUntil.value) hull.value--
      obj.y = 999
    } else if (obj.y >= 209) {
      if (frontier) hull.value--
      obj.y = 999
    }
  }
  objects.value = objects.value.filter((o) => o.y < 220)
  shots.value = shots.value.filter((s) => s.y > 0)
  if (hull.value <= 0) {
    phase.value = 'lost'
    return
  }
  if (dodge ? distance.value >= 20 : score.value >= 6) {
    phase.value = 'won'
    return
  }
  frame = requestAnimationFrame(tick)
}
function steer(delta: number) {
  if (phase.value === 'play')
    lane.value = Math.max(0, Math.min(4, lane.value + delta))
}
function fire() {
  if (phase.value !== 'play' || dodge || cooldown > 0) return
  cooldown = 0.22
  if (bombing) {
    const hit = objects.value.find(
      (o) => o.lane === lane.value && o.y >= 120 && o.y < 184,
    )
    if (hit) {
      objects.value = objects.value.filter((o) => o !== hit)
      score.value++
    }
  } else shots.value.push({ id: ++serial, lane: lane.value, y: 180 })
}
function key(e: KeyboardEvent) {
  if (
    phase.value !== 'play' ||
    !['ArrowLeft', 'ArrowRight', ' '].includes(e.key)
  )
    return
  e.preventDefault()
  if (e.key === ' ') fire()
  else steer(e.key === 'ArrowLeft' ? -1 : 1)
}
onUnmounted(() => cancelAnimationFrame(frame))
</script>
<template>
  <div ref="board" class="instrument" tabindex="0" @keydown="key">
    <div class="meter">
      <span>{{ tr('Casco', 'Hull') }} · {{ Math.max(0, hull) }} / 3</span>
      <span>
        {{
          dodge
            ? Math.min(20, Math.floor(distance)) + ' / 20 s'
            : score + ' / 6'
        }}
      </span>
    </div>
    <svg
      class="flight-chart"
      viewBox="0 0 264 212"
      role="img"
      :aria-label="tr('Corredores de aproximação', 'Approach lanes')"
    >
      <path
        v-for="x in lanes"
        :key="x"
        :d="'M' + x + ' 0v212'"
        stroke="#576456"
        stroke-dasharray="2 8"
      />
      <rect
        v-if="bombing"
        y="120"
        width="264"
        height="64"
        fill="#ab8846"
        opacity=".25"
      />
      <path
        v-for="o in objects"
        :key="o.id"
        :d="shapes[id]"
        :transform="'translate(' + lanes[o.lane] + ' ' + o.y + ')'"
        fill="#c58b61"
        stroke="#ffe1b7"
        stroke-width="1.5"
      />
      <path
        v-for="s in shots"
        :key="s.id"
        :d="'M' + lanes[s.lane] + ' ' + s.y + 'v9'"
        stroke="#ffe1a1"
        stroke-width="3"
      />
      <ellipse
        v-if="shieldUntil > distance"
        :cx="lanes[lane]"
        cy="186"
        rx="19"
        ry="21"
        stroke="#8fe1c7"
        fill="none"
      />
      <path
        :transform="'translate(' + lanes[lane] + ' 188)'"
        d="M0 -15 12 11 3 7 0 12 -3 7 -12 11Z"
        fill="#88dabe"
        stroke="#dcf8e5"
        stroke-width="1.5"
      />
    </svg>
    <div class="game-controls">
      <template v-if="phase === 'play'">
        <button aria-label="←" @click="steer(-1)">←</button>
        <button v-if="!dodge" @click="fire">
          {{ bombing ? tr('Soltar', 'Drop') : tr('Disparar', 'Fire') }}
        </button>
        <button
          v-if="id === 'star-trek'"
          :disabled="!shields || distance < shieldUntil"
          @click="shield"
        >
          {{ tr('Escudo', 'Shield') }} · {{ shields }}
        </button>
        <button aria-label="→" @click="steer(1)">→</button>
      </template>
      <template v-else>
        <span v-if="phase !== 'ready'" role="status">
          {{
            phase === 'won'
              ? tr('Missão cumprida', 'Mission complete')
              : tr('Fim da partida', 'Game over')
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
