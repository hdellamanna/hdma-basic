<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
type Player = 'amber' | 'jade'
const current = ref<Player>('amber'),
  loser = ref<Player>(),
  twoPlayers = ref(false),
  selected = ref(-1)
const history = ref<{ a: number; b: number; owner: Player }[]>([])
const notice = ref(false)
const points = Array.from({ length: 6 }, (_, i) => ({
  x: 150 + 104 * Math.sin((i * Math.PI) / 3),
  y: 130 - 104 * Math.cos((i * Math.PI) / 3),
  name: String.fromCharCode(65 + i),
}))
const edges = points.flatMap((_, a) =>
  points.slice(a + 1).map((_, i) => ({ a, b: a + i + 1 })),
)
const played = (a: number, b: number) =>
  history.value.find((e) => e.a === Math.min(a, b) && e.b === Math.max(a, b))
function triangle(a: number, b: number, owner: Player) {
  return points.findIndex(
    (_, c) =>
      c !== a &&
      c !== b &&
      played(a, c)?.owner === owner &&
      played(b, c)?.owner === owner,
  )
}
const lastTriangle = computed(() => {
  if (!loser.value) return ''
  const last = history.value[history.value.length - 1]
  return [last.a, last.b, triangle(last.a, last.b, loser.value)]
    .map((i) => points[i].x + ',' + points[i].y)
    .join(' ')
})
function place(a: number, b: number) {
  const owner = current.value
  const loses = triangle(a, b, owner) >= 0
  history.value.push({ a: Math.min(a, b), b: Math.max(a, b), owner })
  if (loses) loser.value = owner
  else current.value = owner === 'amber' ? 'jade' : 'amber'
}
function choose(i: number) {
  if (loser.value) return
  notice.value = false
  if (selected.value === i) {
    selected.value = -1
    return
  }
  if (selected.value < 0) {
    selected.value = i
    return
  }
  const a = selected.value
  if (played(a, i)) {
    notice.value = true
    selected.value = -1
    return
  }
  selected.value = -1
  place(a, i)
  if (!twoPlayers.value && !loser.value) {
    const remaining = edges.filter((e) => !played(e.a, e.b))
    const safe = remaining.filter((e) => triangle(e.a, e.b, 'jade') === -1)
    const choices = safe.length ? safe : remaining
    const edge = choices[Math.floor(Math.random() * choices.length)]
    place(edge.a, edge.b)
  }
}
function reset() {
  current.value = 'amber'
  loser.value = undefined
  history.value = []
  selected.value = -1
  notice.value = false
}
function playerName(p: Player) {
  return p === 'amber' ? tr('Âmbar', 'Amber') : tr('Jade', 'Jade')
}
</script>
<template>
  <section class="glass-game">
    <div>
      <h2>{{ tr('O vitral de Gustavus', 'Gustavus’ stained glass') }}</h2>
      <p>
        {{
          tr(
            'Ligue duas pérolas com um filete. Quem fechar um triângulo da própria cor perde. O âmbar joga com linhas contínuas e o jade, com tracejadas.',
            'Join two pearls with a strip of glass. A triangle in your own color loses the game. Amber plays solid lines and Jade plays dashed lines.',
          )
        }}
      </p>
      <label>
        <input
          v-model="twoPlayers"
          type="checkbox"
          :disabled="history.length > 0"
        />
        {{ tr('Dois jogadores locais', 'Two local players') }}
      </label>
      <p role="status">
        {{
          loser
            ? playerName(loser === 'amber' ? 'jade' : 'amber') +
              ' · ' +
              tr('vitória', 'wins')
            : notice
              ? tr('Essa ligação já existe.', 'That connection is taken.')
              : playerName(current) +
                ' · ' +
                (selected < 0
                  ? tr('Escolha a primeira pérola', 'Choose the first pearl')
                  : tr('Escolha a segunda pérola', 'Choose the second pearl'))
        }}
      </p>
      <button class="pavilion-button" @click="reset">
        {{ tr('Recomeçar', 'Restart') }}
      </button>
    </div>
    <div class="glass-board">
      <svg viewBox="0 0 300 260" aria-hidden="true">
        <ellipse
          cx="150"
          cy="130"
          rx="121"
          ry="122"
          stroke="#a58858"
          fill="none"
        />
        <ellipse
          cx="150"
          cy="130"
          rx="115"
          ry="116"
          stroke="#6b654c"
          fill="none"
        />
        <g v-for="(p, i) in points" :key="i">
          <path
            d="M150 10Q104 62 150 104Q196 62 150 10Z"
            :transform="'rotate(' + i * 60 + ' 150 130)'"
            fill="#22483e"
            stroke="#566a52"
          />
        </g>
        <polygon
          v-if="lastTriangle"
          :points="lastTriangle"
          fill="#e9b377"
          opacity=".35"
        />
        <line
          v-for="e in history"
          :key="e.a + '-' + e.b"
          :x1="points[e.a].x"
          :x2="points[e.b].x"
          :y1="points[e.a].y"
          :y2="points[e.b].y"
          :stroke="e.owner === 'amber' ? '#fad08d' : '#8ee5cb'"
          :stroke-dasharray="e.owner === 'jade' ? '7 4' : undefined"
          stroke-width="3.5"
        />
      </svg>
      <button
        v-for="(p, i) in points"
        :key="i"
        :aria-pressed="selected === i"
        :disabled="Boolean(loser)"
        :style="{ left: p.x / 3 + '%', top: p.y / 2.6 + '%' }"
        @click="choose(i)"
      >
        {{ p.name }}
      </button>
    </div>
  </section>
</template>
