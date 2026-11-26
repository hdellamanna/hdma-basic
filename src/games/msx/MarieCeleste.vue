<script setup lang="ts">
/**
 * Marie Celeste — Reconstructed from "The MSX Games Book" (1985)
 * Text adventure on a ghost ship. Find survivors, solve the mystery.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import { useKeyboard } from '../../composables/useKeyboard'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()
const SCOPE = 'marie-celeste'

const ui = {
  intro: {
    'pt-BR': 'O Marie Celeste jaz vazio. A tripulação desapareceu. Encontre os sobreviventes.',
    en: 'The Marie Celeste lies empty. The crew vanished. Find the survivors.',
  },
  youAreIn: { 'pt-BR': 'Você está', en: 'You are' },
  youSee: { 'pt-BR': 'Você vê:', en: 'You see:' },
  exits: { 'pt-BR': 'Saídas:', en: 'Exits:' },
  carrying: { 'pt-BR': 'Você carrega:', en: 'You carry:' },
  prompt: { 'pt-BR': '>', en: '>' },
  helpText: {
    'pt-BR': `Comandos (2 palavras):
  IR [PRO|POP|BOR|BOM] (frente, ré, bombordo, estibordo)
  PEGAR/LEVAR [objeto] / LARGAR [objeto]
  EXAMINAR [objeto] / LER [objeto]
  ABRIR [objeto] / FECHAR [objeto]
  SUBIR/DESCER [corda|escada]
  AMARRAR [objeto] / CORTAR [objeto]
  VESTIR/CALÇAR [objeto]
  ENTRAR deposito / SAIR deposito
  INVENTARIO / AJUDA / SAIR`,
    en: `Commands (2 words):
  GO [FWD|AFT|PORT|STBD] (forward, aft, port, starboard)
  GET/TAKE [object] / DROP [object]
  EXAMINE/READ [object]
  OPEN [object] / CLOSE [object]
  CLIMB/DESCEND [rope|ladder]
  TIE [object] / CUT [object]
  WEAR/PUT [object]
  ENTER hold / EXIT hold
  INVENTORY / HELP / QUIT`,
  },
  youDied: { 'pt-BR': '*** Você morreu. ***', en: '*** You died. ***' },
  youWon: { 'pt-BR': '*** Mistério resolvido! ***', en: '*** Mystery solved! ***' },
}

// Simplified 5 rooms: popa, convés, proa, cabine, depósito
const rooms = [
  { id: 1, name: { 'pt-BR': 'na popa', en: 'in the stern' }, descKey: 'stern' },
  { id: 2, name: { 'pt-BR': 'no convés', en: 'on the deck' }, descKey: 'deck' },
  { id: 3, name: { 'pt-BR': 'na proa', en: 'in the bow' }, descKey: 'bow' },
  { id: 4, name: { 'pt-BR': 'na cabine do capitão', en: 'in the captain\'s cabin' }, descKey: 'cabin' },
  { id: 5, name: { 'pt-BR': 'no depósito', en: 'in the hold' }, descKey: 'hold' },
]
const exits: Record<number, Record<string, number>> = {
  1: { fwd: 2 }, // stern -> deck
  2: { aft: 1, fwd: 3, down: 5 }, // deck -> stern, bow, hold
  3: { aft: 2 }, // bow -> deck
  4: { out: 2 }, // cabin -> deck
  5: { up: 2, in: 4 }, // hold -> deck, cabin (if unlocked)
}

const obj = ref([
  { id: 'knife', name: { 'pt-BR': 'faca', en: 'knife' }, loc: 1, carried: false, desc: { 'pt-BR': 'É afiada!', en: 'It\'s sharp!' } },
  { id: 'rope', name: { 'pt-BR': 'corda', en: 'rope' }, loc: 0, carried: false, desc: { 'pt-BR': 'Bem grossa e resistente.', en: 'Thick and sturdy.' } },
  { id: 'bucket', name: { 'pt-BR': 'balde', en: 'bucket' }, loc: 3, carried: false, desc: { 'pt-BR': 'É de água salgada!', en: 'Salt water!' } },
  { id: 'key', name: { 'pt-BR': 'chave', en: 'key' }, loc: 4, carried: false, desc: { 'pt-BR': 'É do depósito!', en: 'It\'s the hold key!' } },
  { id: 'ticket', name: { 'pt-BR': 'bilhete', en: 'note' }, loc: 0, carried: false, desc: { 'pt-BR': 'Está escrito "DEPÓSITO"!', en: 'It says "HOLD"!' } },
  { id: 'cat', name: { 'pt-BR': 'gato', en: 'cat' }, loc: 0, carried: false, desc: { 'pt-BR': 'Foge atrás de um rato!', en: 'Runs after a mouse!' } },
  { id: 'shoes', name: { 'pt-BR': 'galochas', en: 'boots' }, loc: 0, carried: false, desc: { 'pt-BR': 'Fedorentas!', en: 'Smelly!' } },
  { id: 'mop', name: { 'pt-BR': 'esfregão', en: 'mop' }, loc: 5, carried: false, desc: { 'pt-BR': 'Para limpar.', en: 'For cleaning.' } },
  { id: 'lona', name: { 'pt-BR': 'lona', en: 'canvas' }, loc: 0, carried: false, desc: { 'pt-BR': 'Cobrir o convés.', en: 'Cover the deck.' } },
])

const room = ref(2) // start on deck
const log = ref<string[]>([])
const input = ref('')
const status = ref<'playing' | 'won' | 'lost'>('playing')
const started = ref(false)
const holdLocked = ref(true)
const ratsKilled = ref(false)

function look() {
  if (started.value) sfx.tick()
  const r = rooms.find((rr) => rr.id === room.value)
  if (!r) return
  log.value.push(`${ui.youAreIn[locale.current]} ${r.name[locale.current]}.`)
  const here = obj.value.filter((o) => o.loc === room.value && !o.carried)
  if (here.length) {
    log.value.push(`${ui.youSee[locale.current]} ${here.map((o) => o.name[locale.current]).join(', ')}.`)
  }
  // exits
  const ex = exits[room.value]
  if (ex) {
    const labels: Record<string, Record<string, string>> = {
      fwd: { 'pt-BR': 'frente', en: 'forward' },
      aft: { 'pt-BR': 'ré', en: 'aft' },
      port: { 'pt-BR': 'bombordo', en: 'port' },
      stbd: { 'pt-BR': 'estibordo', en: 'starboard' },
      up: { 'pt-BR': 'cima', en: 'up' },
      down: { 'pt-BR': 'baixo', en: 'down' },
      in: { 'pt-BR': 'dentro', en: 'in' },
      out: { 'pt-BR': 'fora', en: 'out' },
    }
    const exList = Object.keys(ex).filter((d) => !(d === 'in' && holdLocked.value)).map((d) => labels[d][locale.current])
    if (exList.length) log.value.push(`${ui.exits[locale.current]} ${exList.join(', ')}.`)
  }
}

function start() {
  log.value = []
  status.value = 'playing'
  started.value = true
  holdLocked.value = true
  ratsKilled.value = false
  obj.value = obj.value.map((o) => ({ ...o, loc: o.id === 'rope' || o.id === 'ticket' || o.id === 'cat' || o.id === 'shoes' || o.id === 'lona' ? 0 : o.loc, carried: false }))
  // Place fixed items
  obj.value.find((o) => o.id === 'knife')!.loc = 1
  obj.value.find((o) => o.id === 'bucket')!.loc = 3
  obj.value.find((o) => o.id === 'key')!.loc = 4
  obj.value.find((o) => o.id === 'mop')!.loc = 5
  room.value = 2
  sfx.start()
  look()
}

function move(dir: string) {
  const map: Record<string, string> = {
    pro: 'fwd', fwd: 'fwd', frente: 'fwd',
    pop: 'aft', aft: 'aft', re: 'aft', 'ré': 'aft',
    bor: 'port', port: 'port', bombordo: 'port',
    bom: 'stbd', stbd: 'stbd', estibordo: 'stbd',
    cima: 'up', subir: 'up', c: 'up', u: 'up', up: 'up',
    baixo: 'down', descer: 'down', b: 'down', d: 'down', down: 'down',
    dentro: 'in', entrar: 'in', in: 'in',
    fora: 'out', sair: 'out', out: 'out',
  }
  const d = map[dir]
  if (!d) {
    log.value.push(locale.current === 'pt-BR' ? 'Direção inválida' : 'Invalid direction')
    return
  }
  const ex = exits[room.value]
  if (!ex || ex[d] === undefined) {
    log.value.push(locale.current === 'pt-BR' ? 'Não pode ir aí' : 'Can\'t go that way')
    return
  }
  if (d === 'in' && holdLocked.value) {
    log.value.push(locale.current === 'pt-BR' ? 'Está trancado!' : 'It\'s locked!')
    return
  }
  room.value = ex[d]
  look()
}

function getItem(name: string) {
  const o = obj.value.find((oo) => oo.name[locale.current].toLowerCase().includes(name) || name.includes(oo.name[locale.current].toLowerCase()))
  if (!o) {
    log.value.push(locale.current === 'pt-BR' ? 'Não há esse aqui' : 'Not here')
    return
  }
  if (o.loc !== room.value || o.carried) {
    log.value.push(locale.current === 'pt-BR' ? 'Não pode pegar' : 'Can\'t take')
    return
  }
  o.loc = 0; o.carried = true
  log.value.push(locale.current === 'pt-BR' ? 'Pegou.' : 'Taken.')
  sfx.coin()
}

function dropItem(name: string) {
  const o = obj.value.find((oo) => oo.name[locale.current].toLowerCase().includes(name))
  if (!o || !o.carried) {
    log.value.push(locale.current === 'pt-BR' ? 'Não tem isso' : 'Don\'t have it')
    return
  }
  o.loc = room.value; o.carried = false
  log.value.push(locale.current === 'pt-BR' ? 'Largou.' : 'Dropped.')
}

function examineItem(name: string) {
  const o = obj.value.find((oo) => oo.name[locale.current].toLowerCase().includes(name))
  if (!o || (o.loc !== room.value && !o.carried)) {
    log.value.push(locale.current === 'pt-BR' ? 'Não vê isso' : 'Don\'t see it')
    return
  }
  log.value.push(o.desc[locale.current])
  // Special: read ticket unlocks
  if (o.id === 'ticket') {
    holdLocked.value = false
    log.value.push(locale.current === 'pt-BR' ? 'O depósito está destrancado!' : 'The hold is unlocked!')
  }
}

function openItem(name: string) {
  if (name.includes('deposito') || name.includes('hold')) {
    if (obj.value.find((o) => o.id === 'key')?.carried) {
      holdLocked.value = false
      log.value.push(locale.current === 'pt-BR' ? 'Abriu o depósito.' : 'Opened the hold.')
    } else {
      log.value.push(locale.current === 'pt-BR' ? 'Trancado.' : 'Locked.')
    }
  }
}

function parse(text: string) {
  if (status.value !== 'playing') return
  const t = text.toLowerCase().trim()
  if (!t) return
  sfx.type()
  const parts = t.split(/\s+/)
  const verb = parts[0]
  const noun = parts.slice(1).join(' ')

  const verbsDir: Record<string, string> = {
    ir: 'go', 'go': 'go',
    pro: 'go', pop: 'go', bor: 'go', bom: 'go', fwd: 'go', aft: 'go', port: 'go', stbd: 'go', c: 'go', u: 'go', d: 'go', b: 'go', subir: 'go', descer: 'go',
    n: 'go', s: 'go', e: 'go', o: 'go', l: 'go',
  }
  if (verbsDir[verb] === 'go') {
    move(verb)
    return
  }
  if (verb === 'pegar' || verb === 'levar' || verb === 'carregar' || verb === 'get' || verb === 'take' || verb === 'grab') { getItem(noun); return }
  if (verb === 'largar' || verb === 'soltar' || verb === 'drop') { dropItem(noun); return }
  if (verb === 'examinar' || verb === 'ler' || verb === 'ver' || verb === 'examine' || verb === 'read' || verb === 'look') { examineItem(noun); return }
  if (verb === 'abrir' || verb === 'open') { openItem(noun); return }
  if (verb === 'inventario' || verb === 'inv' || verb === 'inventory' || verb === 'i') {
    const carried = obj.value.filter((o) => o.carried)
    if (carried.length === 0) log.value.push(locale.current === 'pt-BR' ? 'Mãos vazias.' : 'Empty hands.')
    else log.value.push(`${ui.carrying[locale.current]} ${carried.map((o) => o.name[locale.current]).join(', ')}`)
    return
  }
  if (verb === 'ajuda' || verb === 'help' || verb === '?') {
    log.value.push(ui.helpText[locale.current])
    return
  }
  if (verb === 'sair' || verb === 'quit') {
    router.push('/')
    return
  }
  // Win: if at deck and have key + ticket read
  if (room.value === 2 && obj.value.find((o) => o.id === 'ticket')?.carried && !holdLocked.value) {
    status.value = 'won'
    sfx.win()
    log.value.push(ui.youWon[locale.current])
    return
  }
  log.value.push(locale.current === 'pt-BR' ? 'Não entendi. AJUDA.' : 'Didn\'t understand. HELP.')
}

function submit() {
  parse(input.value)
  input.value = ''
}

const kb = useKeyboard(SCOPE)
kb.push({ key: 'Enter', handler: () => { if (!started.value) start() } })

onMounted(() => {
  if (started.value) start()
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'MARIE CELESTE' : 'MARIE CELESTE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="!started" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">{{ ui.intro[locale.current] }}</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono text-sm leading-relaxed flex flex-col h-[60vh] min-h-[420px]">
      <GameLog :entries="log" preserve-whitespace class="flex-1 pr-2 space-y-0.5 phosphor" />
      <form v-if="status === 'playing'" class="mt-3 flex items-center gap-2 border-t border-surface-600 pt-3" @submit.prevent="submit">
        <span class="phosphor">{{ ui.prompt[locale.current] }}</span>
        <input
          v-model="input"
          :aria-label="locale.isPt ? 'Comando da aventura' : 'Adventure command'"
          class="flex-1 bg-transparent border-none outline-none text-amber font-mono placeholder-ink-dim"
          :placeholder="locale.current === 'pt-BR' ? 'IR NORTE  /  PEGAR CHAVE  /  EXAMINAR BILHETE' : 'GO NORTH  /  GET KEY  /  EXAMINE NOTE'"
          autofocus
          autocomplete="off"
          spellcheck="false"
        />
      </form>
      <div v-else class="mt-3 text-center">
        <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display">★ {{ ui.youWon[locale.current] }} ★</p>
      </div>
    </div>
  </CrtFrame>
</template>
