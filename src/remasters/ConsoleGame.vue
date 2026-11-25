<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const props = defineProps<{ id: string }>()
const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
const rand = (low: number, high: number) =>
  low + Math.floor(Math.random() * (high - low + 1))
function shuffled<T>(items: T[]) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
const modes: Record<string, string> = {
  moonlander: 'landing',
  touchdown: 'landing',
  'the-wall': 'build',
  'mago-dos-numeros': 'sum',
  'skulls-of-the-pyramid': 'sum',
  'casa-maluca': 'switch',
  'the-vital-message': 'memory',
  espiobot: 'memory',
  pesadelo: 'memory',
  'beat-the-bug-eyes': 'memory',
  'olhos-espiao': 'memory',
  shootout: 'duel',
  'aspirador-de-fantasmas': 'duel',
  'evil-alien': 'radar',
  'robot-missile': 'letter',
  'mulher-aranha': 'letter',
  'secret-weapon': 'lock',
  'teste-espioes': 'sort',
}
const mode = modes[props.id] ?? 'quiz'
const phase = ref<'ready' | 'play' | 'won' | 'lost'>('ready')
const stage = ref(1),
  lives = ref(3),
  prompt = ref(''),
  choices = ref<string[]>([]),
  answer = ref('')
const dossier = ref<{ name: string; place: string; mark: string }[]>([])
const clues = ref(''),
  sequence = ref<number[]>([]),
  progress = ref<number[]>([]),
  lit = ref(-1),
  watching = ref(false)
const altitude = ref(0),
  speed = ref(0),
  fuel = ref(0),
  target = ref(0),
  total = ref(0),
  moves = ref(0)
const digits = ref([0, 0, 0]),
  secret = ref<number[]>([]),
  lamps = ref<boolean[]>([])
let timer: ReturnType<typeof setTimeout>
const symbols = computed(() => {
  if (props.id === 'espiobot') return ['←', '→']
  if (props.id === 'the-vital-message') return ['A', 'K', 'M', 'S']
  if (props.id === 'beat-the-bug-eyes') return ['◉ I', '◉ II', '◉ III', '◉ IV']
  return ['1', '2', '3', '4']
})
function nextStage() {
  if (stage.value === 3) {
    phase.value = 'won'
    return
  }
  stage.value++
  setup()
}
function fail() {
  if (--lives.value <= 0) phase.value = 'lost'
}
function start() {
  clearTimeout(timer)
  stage.value = 1
  lives.value = 3
  phase.value = 'play'
  setup()
}
function setup() {
  clues.value = ''
  dossier.value = []
  progress.value = []
  moves.value = 0
  total.value = 0
  lit.value = -1
  watching.value = false
  const n = stage.value
  if (mode === 'landing') {
    altitude.value = 30 + n * 6
    speed.value = 3 + n
    fuel.value = 28 + n * 5
  } else if (mode === 'build') {
    target.value = 9 + n * 2
    fuel.value = 2
  } else if (mode === 'sum') {
    target.value = rand(6, 15)
    choices.value = ['1', '2', '3', '4', '5', '6']
  } else if (mode === 'switch') {
    lamps.value = Array(5).fill(true)
    for (const i of shuffled([0, 1, 2, 3, 4]).slice(0, n + 1)) flip(i)
  } else if (mode === 'letter') {
    target.value = rand(0, 25)
    digits.value = [12]
    choices.value = []
  } else if (mode === 'radar' || mode === 'lock') {
    secret.value = Array.from({ length: 3 }, () => rand(0, 3))
    digits.value = [0, 0, 0]
  } else if (mode === 'sort') {
    choices.value = shuffled(
      Array.from({ length: 4 + n }, (_, i) => String(i * 8 + rand(1, 7))),
    )
  } else if (mode === 'memory') {
    sequence.value = Array.from({ length: n + 2 }, () =>
      rand(0, symbols.value.length - 1),
    )
    replay()
  } else if (mode === 'duel') {
    timer = setTimeout(
      () => {
        lit.value = rand(0, 3)
        timer = setTimeout(() => {
          fail()
          if (phase.value === 'play') setup()
        }, 1400)
      },
      rand(900, 2200),
    )
  } else quiz()
}
function replay() {
  clearTimeout(timer)
  progress.value = []
  watching.value = true
  let i = 0
  function show() {
    lit.value = sequence.value[i++]
    timer = setTimeout(() => {
      lit.value = -1
      if (i < sequence.value.length) timer = setTimeout(show, 240)
      else watching.value = false
    }, 680)
  }
  timer = setTimeout(show, 400)
}
function pressSignal(i: number) {
  if (watching.value) return
  if (mode === 'duel') {
    clearTimeout(timer)
    if (i === lit.value) nextStage()
    else {
      fail()
      if (phase.value === 'play') setup()
    }
    return
  }
  if (i !== sequence.value[progress.value.length]) {
    fail()
    if (phase.value === 'play') replay()
    return
  }
  progress.value.push(i)
  if (progress.value.length === sequence.value.length) nextStage()
}
function flip(i: number) {
  lamps.value = lamps.value.map((v, j) => (Math.abs(i - j) <= 1 ? !v : v))
}
function toggle(i: number) {
  flip(i)
  moves.value++
  if (lamps.value.every(Boolean)) nextStage()
}
function burn(power: number) {
  const used = Math.min(power, fuel.value)
  fuel.value -= used
  speed.value = Math.max(
    0,
    speed.value + (props.id === 'touchdown' ? 2 : 1) - used,
  )
  altitude.value = Math.max(0, altitude.value - speed.value)
  if (!altitude.value) {
    if (speed.value <= 3) nextStage()
    else {
      fail()
      if (phase.value === 'play') setup()
    }
  }
}
function build(quarry: boolean) {
  moves.value++
  if (quarry) fuel.value += 4
  else {
    const blocks = Math.min(3, fuel.value)
    fuel.value -= blocks
    total.value += blocks
  }
  if (total.value >= target.value) nextStage()
  else if (moves.value >= stage.value + 8) {
    fail()
    if (phase.value === 'play') setup()
  }
}
function dial(index: number, delta: number) {
  const limit = mode === 'letter' ? 26 : 4
  digits.value[index] = (digits.value[index] + delta + limit) % limit
}
const letter = (i: number) => String.fromCharCode(65 + i)
function transmit() {
  moves.value++
  const values = digits.value
  let ok = false
  if (mode === 'letter') {
    ok = values[0] === target.value
    clues.value = letter(values[0]) + (values[0] < target.value ? ' ↑' : ' ↓')
  } else {
    ok = secret.value.every((v, i) => v === values[i])
    const echoes =
      mode === 'radar'
        ? secret.value
            .map((v, i) => (v === values[i] ? '✓' : v > values[i] ? '↑' : '↓'))
            .join(' ')
        : String(secret.value.filter((v, i) => v === values[i]).length) + '/3'
    clues.value = values.join(' · ') + ' → ' + echoes
  }
  if (ok) nextStage()
  else if (moves.value >= (mode === 'lock' ? 12 : mode === 'letter' ? 6 : 5)) {
    fail()
    if (phase.value === 'play') setup()
  }
}
const morse = [
  '.-',
  '-...',
  '-.-.',
  '-..',
  '.',
  '..-.',
  '--.',
  '....',
  '..',
  '.---',
  '-.-',
  '.-..',
  '--',
  '-.',
  '---',
  '.--.',
  '--.-',
  '.-.',
  '...',
  '-',
  '..-',
  '...-',
  '.--',
  '-..-',
  '-.--',
  '--..',
]
function quiz() {
  const a = rand(3, 9),
    b = rand(2, 5),
    c = rand(1, 4)
  let value: number
  switch (props.id) {
    case 'starship-takeoff':
      prompt.value =
        tr('Massa × gravidade', 'Mass × gravity') +
        ' · ' +
        a +
        ' t × ' +
        b +
        ' m/s²'
      value = a * b
      break
    case 'intergalactic-games':
      prompt.value =
        tr('Subir de', 'Raise from') +
        ' ' +
        a * b +
        ' km → ' +
        (a * b + c * b) +
        ' km · Δ?'
      value = c * b
      break
    case 'desert-tank-battle':
      prompt.value =
        tr('Mira + deriva', 'Sight + drift') + ' · ' + a * b + '° + ' + c + '°'
      value = a * b + c
      break
    case 'monster-wrestling':
      prompt.value =
        tr('Peso × alavanca', 'Weight × leverage') + ' · ' + (a + c) + ' × ' + b
      value = (a + c) * b
      break
    case 'diga-mestre':
      prompt.value =
        tr('Mesma família', 'Same family') +
        ' · ' +
        b +
        ', ' +
        b * 2 +
        ', ' +
        b * 3 +
        ' …'
      value = b * 4
      choices.value = shuffled(
        [value, value + 1, value - 1, value + b + 1].map(String),
      )
      answer.value = String(value)
      return
    case 'eu-acuso':
    case 'sessao-espirita': {
      const names =
        props.id === 'eu-acuso'
          ? ['Alba', 'Bento', 'Ciro', 'Dora']
          : ['Íris', 'Nox', 'Lira', 'Sol']
      const places =
        props.id === 'eu-acuso'
          ? [tr('Estação', 'Station'), tr('Jardim', 'Garden')]
          : [tr('Lua', 'Moon'), tr('Sol', 'Sun')]
      const marks =
        props.id === 'eu-acuso'
          ? [tr('Luvas', 'Gloves'), tr('Anel', 'Ring')]
          : [tr('Chama', 'Flame'), tr('Névoa', 'Mist')]
      dossier.value = shuffled(names).map((name, k) => ({
        name,
        place: places[k % 2],
        mark: marks[Math.floor(k / 2)],
      }))
      const who = dossier.value[rand(0, 3)]
      prompt.value =
        tr('Pistas', 'Clues') + ' · ' + who.place + ' / ' + who.mark
      choices.value = shuffled(names)
      answer.value = who.name
      return
    }
    case 'codigo-morse':
    case 'gerador-mensagens': {
      const i = rand(0, 25)
      answer.value = letter(i)
      prompt.value =
        props.id === 'codigo-morse'
          ? morse[i]
          : letter((i + b) % 26) + '   −' + b
      choices.value = shuffled(
        [i, (i + 3) % 26, (i + 8) % 26, (i + 11) % 26].map(letter),
      )
      return
    }
    case 'micropuzzle':
      prompt.value = [a, a + b, a + b * 2, a + b * 3, '?'].join(' · ')
      value = a + b * 4
      break
    default:
      prompt.value = [1900 + a, 1900 + a + b, 1900 + a + 2 * b, '?'].join(' → ')
      value = 1900 + a + 3 * b
  }
  answer.value = String(value)
  choices.value = shuffled([value, value + 2, value - 1, value + 3].map(String))
}
function choose(v: string) {
  if (mode === 'sum') {
    total.value += Number(v)
    moves.value++
    if (moves.value < 3) return
    if (total.value === target.value) nextStage()
    else {
      fail()
      if (phase.value === 'play') setup()
    }
    return
  }
  if (mode === 'sort') {
    if (Number(v) !== Math.min(...choices.value.map(Number))) {
      fail()
      return
    }
    choices.value = choices.value.filter((item) => item !== v)
    if (!choices.value.length) nextStage()
    return
  }
  if (v === answer.value) nextStage()
  else {
    fail()
    choices.value = choices.value.filter((item) => item !== v)
  }
}
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <div class="instrument">
    <div v-if="phase === 'play'" class="meter">
      <span>{{ tr('Etapa', 'Stage') }} {{ stage }} / 3</span>
      <span>{{ tr('Vidas', 'Lives') }} · {{ lives }}</span>
    </div>
    <div v-if="phase !== 'play'" class="instrument-face">
      <p v-if="phase !== 'ready'" role="status">
        {{
          phase === 'won'
            ? tr('Missão cumprida', 'Mission complete')
            : tr('Fim da partida', 'Game over')
        }}
      </p>
      <button @click="start">
        {{
          phase === 'ready'
            ? tr('Iniciar missão', 'Start mission')
            : tr('Jogar novamente', 'Play again')
        }}
      </button>
    </div>
    <div v-else class="instrument-face">
      <template v-if="mode === 'landing'">
        <svg class="altimeter" viewBox="0 0 240 100" aria-hidden="true">
          <path
            d="M1 92 25 84 43 88 70 77 92 88H151L176 76 199 83 220 72 239 79V100H1Z"
            fill="#60786a"
          />
          <path
            d="M91 88H151 M6 12V80 M6 12H15 M6 46H15 M6 80H15"
            stroke="#e5c489"
            fill="none"
          />
          <g :transform="'translate(120 ' + (78 - altitude * 1.35) + ')'">
            <path
              d="M-7 4 -5 -5 0 -9 5 -5 7 4Z M-5 3 -10 9H-14 M5 3 10 9H14"
              stroke="#ffdb99"
              fill="#386859"
              stroke-width="2"
            />
          </g>
        </svg>
        <p>{{ altitude }} m · {{ speed }} m/s</p>
        <meter :value="altitude" min="0" max="48"></meter>
        <small>{{ tr('Combustível', 'Fuel') }} · {{ fuel }}</small>
        <div class="keys">
          <button v-for="v in [0, 1, 2, 4, 6]" :key="v" @click="burn(v)">
            Δ {{ v }}
          </button>
        </div>
      </template>
      <template v-else-if="mode === 'build'">
        <p>{{ total }} / {{ target }}</p>
        <small>
          {{ tr('Pedras', 'Stone') }} · {{ fuel }} |
          {{ tr('Turnos', 'Turns') }} · {{ stage + 8 - moves }}
        </small>
        <div class="keys">
          <button @click="build(true)">
            {{ tr('Extrair +4', 'Quarry +4') }}
          </button>
          <button @click="build(false)">
            {{ tr('Construir 3', 'Build 3') }}
          </button>
        </div>
      </template>
      <template v-else-if="mode === 'switch'">
        <p>{{ tr('Abra as cinco portas', 'Open all five doors') }}</p>
        <div class="keys">
          <button
            v-for="(lamp, i) in lamps"
            :key="i"
            :aria-pressed="lamp"
            :class="{ lit: lamp }"
            @click="toggle(i)"
          >
            {{ i + 1 }} {{ lamp ? '○' : '×' }}
          </button>
        </div>
      </template>
      <template
        v-else-if="mode === 'letter' || mode === 'lock' || mode === 'radar'"
      >
        <p>
          {{
            mode === 'letter'
              ? tr('Letra secreta', 'Secret letter')
              : mode === 'radar'
                ? 'X · Y · Z'
                : tr('Combinação', 'Combination')
          }}
        </p>
        <div class="keys">
          <div v-for="(v, i) in digits" :key="i" class="dial">
            <button :aria-label="'− ' + (i + 1)" @click="dial(i, -1)">−</button>
            <b>{{ mode === 'letter' ? letter(v) : v }}</b>
            <button :aria-label="'+ ' + (i + 1)" @click="dial(i, 1)">+</button>
          </div>
        </div>
        <small aria-live="polite">{{ clues }}</small>
        <button @click="transmit">
          {{ tr('Transmitir', 'Transmit') }}
        </button>
      </template>
      <template v-else-if="mode === 'duel' || mode === 'memory'">
        <p aria-live="polite">
          {{
            mode === 'duel'
              ? lit < 0
                ? tr('Aguarde…', 'Wait…')
                : tr('Agora!', 'Now!')
              : watching
                ? tr('Observe', 'Watch')
                : tr('Sua vez', 'Your turn')
          }}
        </p>
        <div class="keys">
          <button
            v-for="(s, i) in symbols"
            :key="i"
            :aria-pressed="lit === i"
            :class="{ lit: lit === i }"
            :disabled="watching"
            @click="pressSignal(i)"
          >
            {{ s }}
          </button>
        </div>
        <small v-if="mode === 'memory'">
          {{ progress.length }} / {{ sequence.length }}
        </small>
      </template>
      <template v-else>
        <p>
          {{
            mode === 'sort'
              ? tr('Escolha o menor', 'Choose the lowest')
              : mode === 'sum'
                ? total + ' / ' + target
                : prompt
          }}
        </p>
        <small v-if="mode === 'sum'">
          {{ 3 - moves }} {{ tr('escolhas restantes', 'choices left') }}
        </small>
        <dl v-if="dossier.length" class="dossier">
          <div v-for="card in dossier" :key="card.name">
            <dt>{{ card.name }}</dt>
            <dd>{{ card.place }} · {{ card.mark }}</dd>
          </div>
        </dl>
        <div class="keys">
          <button v-for="v in choices" :key="v" @click="choose(v)">
            {{ v }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
