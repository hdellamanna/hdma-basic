<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'

const locale = useLocaleStore()
const copy = computed(() => locale.isPt ? {
  title: 'Correio Lunar', intro: 'Entregue os três cilindros de correio antes que a bateria do veículo acabe.',
  rule: 'Cada passo custa 1 de energia. Estacione nas placas solares para recarregar. Crateras bloqueiam a passagem.',
  controls: 'Use as setas, os botões de direção ou toque numa casa vizinha.',
  energy: 'Energia', delivered: 'Entregas', restart: 'Recomeçar', classic: 'Jogar Moonlander clássico',
  won: 'As três entregas chegaram.', lost: 'Bateria esgotada. Recomece e planeje as recargas.',
  basic: 'Baixar o Correio Lunar em BASIC',
  rover: 'Veículo', crater: 'Cratera', station: 'Estação de correio', solar: 'Placa solar', terrain: 'Terreno',
  directions: ['Cima', 'Esquerda', 'Baixo', 'Direita'],
} : {
  title: 'Lunar Courier', intro: 'Deliver all three mail capsules before your rover runs out of power.',
  rule: 'Every step costs 1 energy. Stop at solar panels to recharge. Craters block your path.',
  controls: 'Use the arrow keys, the direction buttons or tap an adjacent tile.',
  energy: 'Energy', delivered: 'Deliveries', restart: 'Restart', classic: 'Play classic Moonlander',
  won: 'All three deliveries arrived.', lost: 'Battery depleted. Restart and plan your recharge stops.',
  basic: 'Download Lunar Courier in BASIC',
  rover: 'Rover', crater: 'Crater', station: 'Mail station', solar: 'Solar panel', terrain: 'Terrain',
  directions: ['Up', 'Left', 'Down', 'Right'],
})

const terrain = [
  'R..#..',
  '.#.S.M',
  '...#..',
  '#.M#..',
  'S...#.',
  '...S.M',
]
const width = terrain[0].length
const capacity = 8
const tiles = terrain.flatMap((row) => [...row])
const stations = tiles.filter((tile) => tile === 'M').length
const direction = [
  { key: 'ArrowUp', glyph: '↑', dx: 0, dy: -1 },
  { key: 'ArrowLeft', glyph: '←', dx: -1, dy: 0 },
  { key: 'ArrowDown', glyph: '↓', dx: 0, dy: 1 },
  { key: 'ArrowRight', glyph: '→', dx: 1, dy: 0 },
]
const position = ref(tiles.indexOf('R'))
const energy = ref(capacity)
const delivered = ref<number[]>([])
const cleared = computed(() => delivered.value.length === stations)
const finished = computed(() => cleared.value || energy.value === 0)

function walkable(index: number) {
  if (index < 0 || index >= tiles.length || finished.value || tiles[index] === '#') return false
  const distance = Math.abs(index % width - position.value % width)
    + Math.abs(Math.floor(index / width) - Math.floor(position.value / width))
  return distance === 1
}

function move(index: number) {
  if (!walkable(index)) return
  position.value = index
  energy.value = tiles[index] === 'S' ? capacity : energy.value - 1
  if (tiles[index] === 'M' && !delivered.value.includes(index)) delivered.value.push(index)
}

function step(dx: number, dy: number) {
  const x = position.value % width + dx
  const y = Math.floor(position.value / width) + dy
  if (x >= 0 && x < width && y >= 0 && y < terrain.length) move(y * width + x)
}

function reset() {
  position.value = tiles.indexOf('R')
  energy.value = capacity
  delivered.value = []
}

function keydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || finished.value) return
  const control = direction.find(({ key }) => key === event.key)
  if (!control) return
  event.preventDefault()
  step(control.dx, control.dy)
}

function tileName(tile: string, index: number) {
  const name = tile === '#' ? copy.value.crater : tile === 'S' ? copy.value.solar
    : tile === 'M' ? copy.value.station : copy.value.terrain
  const location = `${Math.floor(index / width) + 1}, ${index % width + 1}`
  return index === position.value ? `${copy.value.rover} · ${name} (${location})` : `${name} (${location})`
}

onMounted(() => window.addEventListener('keydown', keydown))
onUnmounted(() => window.removeEventListener('keydown', keydown))
</script>

<template>
  <section class="lunar-courier">
    <div class="courier-story">
      <RouterLink to="/" class="pavilion-link">← {{ locale.isPt ? 'Voltar ao salão' : 'Back to the hall' }}</RouterLink>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.intro }}</p>
      <p>{{ copy.rule }}</p>
      <p>{{ copy.controls }}</p>
      <RouterLink :to="{ name: 'play', params: { manualId: 'space-1982', gameId: 'moonlander' } }"
        class="pavilion-link">{{ copy.classic }}</RouterLink>
      <p><a class="pavilion-link" href="/basic/correio-lunar.bas" download>{{ copy.basic }}</a></p>
    </div>

    <div class="courier-cabinet">
      <div class="courier-hud" role="status" aria-atomic="true">
        <span>{{ copy.energy }} <strong>{{ energy }}/{{ capacity }}</strong></span>
        <span>{{ copy.delivered }} <strong>{{ delivered.length }}/{{ stations }}</strong></span>
      </div>
      <div class="courier-board">
        <button v-for="(tile, index) in tiles" :key="index" type="button" class="courier-tile"
          :class="{ crater: tile === '#', solar: tile === 'S', station: tile === 'M', rover: position === index, delivered: delivered.includes(index) }"
          :aria-label="tileName(tile, index)" :disabled="!walkable(index)" @click="move(index)">
          <span aria-hidden="true">{{ position === index ? '▰' : tile === 'S' ? '▤' : tile === 'M' ? (delivered.includes(index) ? '✓' : '◆') : '' }}</span>
        </button>
      </div>
      <p v-if="finished" class="courier-result" role="status">{{ cleared ? copy.won : copy.lost }}</p>
      <div class="courier-controls">
        <button v-for="(control, index) in direction" :key="control.key" type="button" :disabled="finished"
          :aria-label="copy.directions[index]" @click="step(control.dx, control.dy)">{{ control.glyph }}</button>
        <button type="button" class="courier-reset" @click="reset">{{ copy.restart }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lunar-courier {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 29rem);
  gap: clamp(1.5rem, 7vw, 5rem);
  padding: clamp(1rem, 6vw, 5rem) clamp(1rem, 4vw, 3.5rem);
  font-family: var(--arcade-text);
}
.courier-story h1 {
  margin-block: .8rem 1.15rem;
  color: var(--brass);
  font: 600 clamp(3rem, 6vw, 5rem)/.98 var(--arcade-display);
}
.courier-story p { max-width: 40ch; margin-bottom: .95rem; color: var(--parchment-muted); }
.courier-cabinet { align-self: start; padding: clamp(.65rem, 2vw, 1.4rem); background: #243c36; border: 1px solid var(--filigree); }
.courier-hud { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .25rem .8rem; margin-bottom: .7rem; }
.courier-hud strong { color: var(--brass); font-variant-numeric: tabular-nums; }
.courier-board { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .2rem; padding: .3rem; background: #101f1d; }
.courier-tile { aspect-ratio: 1; min-width: 0; background: #35423b; color: var(--paper); font-size: clamp(1rem, 4vw, 2rem); }
.courier-tile:not(:disabled) { box-shadow: inset 0 0 0 1px #8c9b76; }
.courier-tile:not(:disabled):hover { box-shadow: inset 0 0 0 2px var(--brass); }
.courier-tile.crater { background: #1a2926; }
.courier-tile.solar { background: #263d58; color: #d4e1f3; }
.courier-tile.station { color: #ffd895; background: #634037; }
.courier-tile.delivered { color: #ace3ac; }
.courier-tile.rover { color: var(--petrol); background: var(--brass); }
.courier-result { margin-top: .8rem; }
.courier-controls { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .8rem; }
.courier-controls button { min-width: 2.75rem; min-height: 2.75rem; padding-inline: .5rem; border: 1px solid var(--filigree); }
.courier-controls button:hover:not(:disabled) { background: var(--petrol); }
.courier-controls button:disabled { opacity: .45; }
.courier-reset { margin-inline-start: auto; }
@media (max-width: 720px) {
  .lunar-courier { grid-template-columns: minmax(0, 1fr); }
}
</style>
