<script setup lang="ts">
/**
 * Logo Language — full turtle graphics interpreter
 * Reconstructed from Apple Logo II / LogoWriter (1985).
 * Type commands like: FD 50, RT 90, REPEAT 4 [FD 50 RT 90], TO SQUARE END
 */
import { ref, onMounted, watch, nextTick } from 'vue'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { LogoInterpreter, type TurtleState, type Procedure } from './interpreter'

const locale = useLocaleStore()
const { sfx } = useAudio()

const SCOPE = 'logo'
const W = 760
const H = 480

const canvasRef = ref<HTMLCanvasElement | null>(null)
const state = ref<TurtleState>({
  x: 0, y: 0, heading: 0, penDown: true, visible: true,
  color: '#7CFC00', width: 2,
})
const log = ref<string[]>([])
const labels = ref<{ text: string; x: number; y: number }[]>([])
const started = ref(false)
const input = ref('')
const programs = ref<{ name: string; code: string }[]>([
  { name: 'SQUARE', code: 'TO SQUARE :S\nREPEAT 4 [FD :S RT 90]\nEND' },
  { name: 'STAR', code: 'TO STAR :S\nREPEAT 5 [FD :S RT 144]\nEND' },
  { name: 'SPIRAL', code: 'TO SPIRAL\nMAKE "S 5\nREPEAT 40 [FD :S RT 91 MAKE "S :S + 3]\nEND' },
  { name: 'FLOWER', code: 'TO FLOWER :P\nREPEAT 8 [REPEAT 60 [FD 1 RT 6] RT 45]\nEND' },
  { name: 'TREE', code: 'TO TREE :LEN\nIF :LEN < 5 [STOP]\nFD :LEN\nLT 30 TREE :LEN * 0.7\nRT 60 TREE :LEN * 0.7\nLT 30\nBK :LEN\nEND' },
])

const history = ref<string[]>([])
const histIdx = ref(-1)
const showHelp = ref(false)
const showProgramList = ref(false)
const procedures = ref<Procedure[]>([])

let interp: LogoInterpreter

const i18n = {
  title: { 'pt-BR': 'LOGO LANGUAGE', en: 'LOGO LANGUAGE' },
  subtitle: { 'pt-BR': 'Apple Logo · Turtle Graphics', en: 'Apple Logo · Turtle Graphics' },
  prompt: '?',
  pressStart: { 'pt-BR': 'PRESSIONE ENTER PARA INICIAR', en: 'PRESS ENTER TO START' },
  help: { 'pt-BR': 'AJUDA', en: 'HELP' },
  examples: { 'pt-BR': 'EXEMPLOS', en: 'EXAMPLES' },
  reset: { 'pt-BR': 'LIMPAR', en: 'CLEAR' },
  hint: {
    'pt-BR': 'Digite comandos Logo: FD 50 RT 90 REPEAT 4 [FD 50 RT 90]  TO SQUARE :S REPEAT 4 [FD :S RT 90] END',
    en: 'Type Logo commands: FD 50 RT 90 REPEAT 4 [FD 50 RT 90]  TO SQUARE :S REPEAT 4 [FD :S RT 90] END'
  },
  helpText: {
    'pt-BR': `Comandos Logo:
  FD n   avança n pixels
  BK n   recua n pixels
  RT n   gira direita n graus
  LT n   gira esquerda n graus
  PU     levanta caneta
  PD     abaixa caneta
  HOME   vai ao centro
  CS     limpa a tela
  REPEAT n [ ... ]   repete n vezes
  SETXY x y   move para (x,y)
  SETH n      define direção (0=cima, 90=direita)
  SETCOLOR n  muda cor (0-5)
  WAIT n      espera n ms
  PRINT x     imprime valor
  LABEL "txt  escreve texto
  TO nome :a :b ... END   define procedimento
  MAKE "x v   cria variável
  :x          lê variável`,
    en: `Logo commands:
  FD n   forward n pixels
  BK n   back n pixels
  RT n   turn right n degrees
  LT n   turn left n degrees
  PU     pen up
  PD     pen down
  HOME   go to center
  CS     clear screen
  REPEAT n [ ... ]   repeat n times
  SETXY x y   move to (x,y)
  SETH n      set heading (0=up, 90=right)
  SETCOLOR n  change color (0-5)
  WAIT n      wait n ms
  PRINT x     print value
  LABEL "txt  draw text
  TO name :a :b ... END   define procedure
  MAKE "x v   set variable
  :x          read variable`
  },
  cs: { 'pt-BR': 'Tela limpa', en: 'Screen cleared' },
  procList: { 'pt-BR': 'PROCEDIMENTOS DEFINIDOS', en: 'DEFINED PROCEDURES' },
  noProcs: { 'pt-BR': '(nenhum ainda)', en: '(none yet)' },
  run: { 'pt-BR': 'RODAR', en: 'RUN' },
}

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // Initial state
  interp = new LogoInterpreter({
    init: { x: 0, y: 0 },
    onDraw: (from, to, color, width) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(W / 2 + from.x, H / 2 - from.y)
      ctx.lineTo(W / 2 + to.x, H / 2 - to.y)
      ctx.stroke()
    },
    onClear: () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, W, H)
      // draw subtle grid
      ctx.strokeStyle = 'rgba(124, 252, 0, 0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < W; x += 40) {
        ctx.moveTo(x, 0); ctx.lineTo(x, H)
      }
      for (let y = 0; y < H; y += 40) {
        ctx.moveTo(0, y); ctx.lineTo(W, y)
      }
      ctx.stroke()
      labels.value = []
    },
    onPrint: (text) => {
      log.value.push(`PRINT: ${text}`)
    },
    onLabel: (text, x, y) => {
      labels.value.push({ text, x, y })
      ctx.fillStyle = interp.state.color
      ctx.font = '14px ui-monospace, monospace'
      ctx.fillText(text, W / 2 + x, H / 2 - y)
    },
    onTurtle: (s) => {
      state.value = { ...s }
      drawTurtle(s)
    },
    wait: (ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
  })
  interp.reset()
  started.value = true
}

function drawTurtle(s: TurtleState) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  // re-clear with grid (cheap: just redraw turtle on a small box)
  // Actually we keep the canvas, just draw turtle on top
  // For correct render we need to track all paths; for simplicity redraw grid only where turtle is
  // Better: re-render all labels on top after each turtle move
  // Simplest: clear a small box, redraw turtle
  const cx = W / 2 + s.x
  const cy = H / 2 - s.y
  const r = 12
  ctx.save()
  // Restore background in a square around turtle (small)
  ctx.fillStyle = '#000000'
  ctx.fillRect(cx - r - 2, cy - r - 2, (r + 2) * 2, (r + 2) * 2)
  // Redraw grid in that area
  ctx.strokeStyle = 'rgba(124, 252, 0, 0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = cx - r - 2; x < cx + r + 2; x += 40) {
    ctx.moveTo(x, cy - r - 2); ctx.lineTo(x, cy + r + 2)
  }
  for (let y = cy - r - 2; y < cy + r + 2; y += 40) {
    ctx.moveTo(cx - r - 2, y); ctx.lineTo(cx + r + 2, y)
  }
  ctx.stroke()
  if (s.visible) {
    // Triangle
    const rad = (s.heading - 90) * Math.PI / 180
    const tipX = cx + Math.cos(rad) * r
    const tipY = cy + Math.sin(rad) * r
    const leftRad = rad + (140 * Math.PI / 180)
    const rightRad = rad - (140 * Math.PI / 180)
    const leftX = cx + Math.cos(leftRad) * r * 0.8
    const leftY = cy + Math.sin(leftRad) * r * 0.8
    const rightX = cx + Math.cos(rightRad) * r * 0.8
    const rightY = cy + Math.sin(rightRad) * r * 0.8
    ctx.fillStyle = s.color
    ctx.strokeStyle = s.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(tipX, tipY)
    ctx.lineTo(leftX, leftY)
    ctx.lineTo(rightX, rightY)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function appendLog(msg: string) {
  log.value.push(msg)
  if (log.value.length > 200) log.value.shift()
}

async function runCode(code: string) {
  if (!interp) return
  appendLog(`> ${code.split('\n')[0]}${code.includes('\n') ? ' …' : ''}`)
  const result = await interp.run(code)
  procedures.value = result.procedures
  if (result.errors.length) {
    for (const e of result.errors) appendLog('! ' + e)
  }
  sfx.type()
}

async function submit() {
  const line = input.value.trim()
  if (!line) return
  history.value.push(line)
  if (history.value.length > 50) history.value.shift()
  histIdx.value = history.value.length
  input.value = ''
  await runCode(line)
}

function loadExample(p: { name: string; code: string }) {
  input.value = p.code
  showProgramList.value = false
}

function clearAll() {
  if (!interp) return
  interp.reset()
  appendLog(locale.current === 'pt-BR' ? 'Tela limpa.' : 'Screen cleared.')
  procedures.value = []
  labels.value = []
  sfx.tick()
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    if (history.value.length === 0) return
    histIdx.value = Math.max(0, histIdx.value - 1)
    input.value = history.value[histIdx.value] ?? ''
  } else if (e.key === 'ArrowDown') {
    if (history.value.length === 0) return
    histIdx.value = Math.min(history.value.length, histIdx.value + 1)
    input.value = history.value[histIdx.value] ?? ''
  }
}

onMounted(async () => {
  await nextTick()
  setupCanvas()
})

watch(() => locale.current, () => {
  appendLog(locale.current === 'pt-BR' ? 'Idioma alterado.' : 'Language switched.')
})

defineExpose({ clearAll })
</script>

<template>
  <div class="font-mono text-sm space-y-3">
    <header class="flex flex-wrap items-baseline justify-between gap-2 border-b border-surface-600 pb-2">
      <h2 class="font-display text-lg tracking-widest phosphor text-shadow-neon">
        <span class="text-cyan">&gt;</span> {{ i18n.title[locale.current] }}
      </h2>
      <span class="text-[10px] tracking-widest text-ink-muted">APPLE LOGO II · 1985</span>
    </header>

    <!-- Canvas -->
    <div class="crt-frame p-2 bg-black">
      <canvas
        ref="canvasRef"
        :width="W"
        :height="H"
        class="block w-full max-w-full"
        :style="{ aspectRatio: `${W}/${H}` }"
      />
    </div>

    <!-- Status + buttons -->
    <div class="flex flex-wrap items-center gap-2 text-[10px] tracking-widest">
      <span class="text-ink-muted">X:</span><span class="text-amber">{{ state.x.toFixed(0) }}</span>
      <span class="text-ink-muted">Y:</span><span class="text-amber">{{ state.y.toFixed(0) }}</span>
      <span class="text-ink-muted">HDG:</span><span class="text-amber">{{ state.heading.toFixed(0) }}°</span>
      <span class="text-ink-muted">PEN:</span>
      <span :class="state.penDown ? 'text-cyan' : 'text-ink-dim'">{{ state.penDown ? 'DOWN' : 'UP' }}</span>
      <span class="text-ink-muted">VIS:</span>
      <span :class="state.visible ? 'text-cyan' : 'text-ink-dim'">{{ state.visible ? 'SHOW' : 'HIDE' }}</span>
      <span class="text-ink-muted">CLR:</span>
      <span :style="{ color: state.color }">●</span>
    </div>

    <!-- Input + buttons -->
    <div class="flex flex-wrap items-stretch gap-1 border border-surface-600 bg-void-deep p-2">
      <span class="phosphor self-center text-amber text-lg pr-1">{{ i18n.prompt }}</span>
      <input
        v-model="input"
        @keyup.enter="submit"
        @keyup="onKeyUp"
        class="flex-1 bg-transparent text-amber outline-none placeholder-ink-dim text-sm min-w-0"
        :placeholder="i18n.hint[locale.current]"
        autocomplete="off"
        spellcheck="false"
        autofocus
      />
      <button class="arcade-btn arcade-btn-amber text-[10px] px-3" @click="submit" :disabled="!input.trim()">
        ▶ {{ i18n.run[locale.current] }}
      </button>
      <button class="arcade-btn arcade-btn-ghost text-[10px] px-3" @click="clearAll">
        {{ i18n.reset[locale.current] }}
      </button>
      <button class="arcade-btn arcade-btn-cyan text-[10px] px-3" @click="showProgramList = !showProgramList">
        {{ i18n.examples[locale.current] }}
      </button>
      <button class="arcade-btn arcade-btn-ghost text-[10px] px-3" @click="showHelp = !showHelp">
        {{ i18n.help[locale.current] }}
      </button>
    </div>

    <!-- Help / Examples panels -->
    <div v-if="showHelp" class="border border-surface-600 bg-surface-800 p-3 text-xs text-ink whitespace-pre-wrap font-mono">{{ i18n.helpText[locale.current] }}</div>
    <div v-if="showProgramList" class="border border-surface-600 bg-surface-800 p-3 text-xs text-ink space-y-2">
      <p class="text-ink-muted">{{ i18n.procList[locale.current] }}:</p>
      <ul class="space-y-1">
        <li v-for="p in programs" :key="p.name" class="flex items-center gap-2">
          <span class="text-cyan font-display text-[10px] tracking-widest">[{{ p.name }}]</span>
          <code class="text-amber flex-1 truncate">{{ p.code }}</code>
          <button class="arcade-btn arcade-btn-amber text-[10px] px-2" @click="loadExample(p)">load</button>
        </li>
      </ul>
      <details v-if="procedures.length" class="mt-3">
        <summary class="cursor-pointer text-ink-muted">User-defined ({{ procedures.length }})</summary>
        <ul class="mt-1 space-y-1">
          <li v-for="proc in procedures" :key="proc.name" class="text-ink-dim">
            <code class="text-cyan">TO {{ proc.name }} {{ proc.params.map(p => ':' + p).join(' ') }}</code>
            <span class="text-ink-dim"> · {{ proc.body.length }} cmd</span>
          </li>
        </ul>
      </details>
    </div>

    <!-- Output log -->
    <div class="border border-surface-600 bg-void-deep p-2 h-32 overflow-y-auto text-[11px] font-mono">
      <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      <p v-if="!log.length" class="text-ink-dim italic">
        {{ locale.current === 'pt-BR' ? 'Turtle pronta. Digite FD 50 para começar.' : 'Turtle ready. Type FD 50 to start.' }}
      </p>
    </div>
  </div>
</template>
