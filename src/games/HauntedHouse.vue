<script setup lang="ts">
/**
 * Haunted House — Reconstructed from "Write Your Own Adventure Programs" (Usborne 1983)
 * Original program by Jenny Tyler & Les Howarth. 26 rooms, 11 objects, 7 treasures, 2 endings.
 * This is a faithful but modernized recreation: command parser, 2-word verbs, parser hints.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useAudio } from '../composables/useAudio'
import { useKeyboard } from '../composables/useKeyboard'
import CrtFrame from '../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const SCOPE = 'haunted-house'

const ui = {
  go: { 'pt-BR': 'ir', en: 'go' },
  get: { 'pt-BR': 'pegar', en: 'get' },
  drop: { 'pt-BR': 'largar', en: 'drop' },
  examine: { 'pt-BR': 'examinar', en: 'examine' },
  inv: { 'pt-BR': 'inventario', en: 'inventory' },
  score: { 'pt-BR': 'pontos', en: 'score' },
  help: { 'pt-BR': 'ajuda', en: 'help' },
  quit: { 'pt-BR': 'sair', en: 'quit' },
  open: { 'pt-BR': 'abrir', en: 'open' },
  close: { 'pt-BR': 'fechar', en: 'close' },
  light: { 'pt-BR': 'acender', en: 'light' },
  kill: { 'pt-BR': 'matar', en: 'kill' },
  drink: { 'pt-BR': 'beber', en: 'drink' },
  n: { 'pt-BR': 'norte', en: 'north' },
  s: { 'pt-BR': 'sul', en: 'south' },
  e: { 'pt-BR': 'leste', en: 'east' },
  w: { 'pt-BR': 'oeste', en: 'west' },
  u: { 'pt-BR': 'cima', en: 'up' },
  d: { 'pt-BR': 'baixo', en: 'down' },
  pressStart: { 'pt-BR': 'PRESSIONE ENTER PARA JOGAR', en: 'PRESS ENTER TO PLAY' },
  welcomeTitle: {
    'pt-BR': 'HAUNTED HOUSE',
    en: 'HAUNTED HOUSE',
  },
  youAreIn: { 'pt-BR': 'Você está em', en: 'You are in' },
  youSee: { 'pt-BR': 'Você vê:', en: 'You see:' },
  exits: { 'pt-BR': 'Saídas:', en: 'Exits:' },
  carrying: { 'pt-BR': 'Inventário:', en: 'Carrying:' },
  emptyHands: { 'pt-BR': '(mãos vazias)', en: '(empty hands)' },
  scoreIs: { 'pt-BR': 'Pontuação:', en: 'Score:' },
  treasuresLeft: { 'pt-BR': 'tesouros restantes', en: 'treasures left' },
  prompt: { 'pt-BR': '>', en: '>' },
  helpText: {
    'pt-BR': `Comandos (até 2 palavras):
  IR [N|S|L|O|C|B] (ou NORTE/SUL/LESTE/OESTE/CIMA/BAIXO)
  PEGAR [objeto] / LARGAR [objeto]
  EXAMINAR [objeto]
  ABRIR [objeto] / ACENDER [objeto]
  INVENTARIO / PONTOS / AJUDA / SAIR
  Para abrir portas trancadas você pode precisar de uma chave.`,
    en: `Commands (up to 2 words):
  GO [N|S|E|W|U|D] (or NORTH/SOUTH/EAST/WEST/UP/DOWN)
  GET [object] / DROP [object]
  EXAMINE [object]
  OPEN [object] / LIGHT [object]
  INVENTORY / SCORE / HELP / QUIT
  Locked doors may need a key.`,
  },
  youDied: {
    'pt-BR': '*** Você morreu. GAME OVER. ***',
    en: '*** You died. GAME OVER. ***',
  },
  youEscaped: {
    'pt-BR': '*** Você saiu vivo! Parabéns! ***',
    en: '*** You escaped alive! Congratulations! ***',
  },
  treasureCount: {
    'pt-BR': 'Você coletou todos os 7 tesouros!',
    en: 'You collected all 7 treasures!',
  },
  needMore: {
    'pt-BR': 'Você precisa de mais tesouros para escapar.',
    en: 'You need more treasures to escape.',
  },
  cantDo: {
    'pt-BR': 'Você não pode fazer isso aqui.',
    en: 'You can\'t do that here.',
  },
  dontHave: {
    'pt-BR': 'Você não tem esse objeto.',
    en: 'You don\'t have that.',
  },
  dontSee: {
    'pt-BR': 'Você não vê isso aqui.',
    en: 'You don\'t see that here.',
  },
  alreadyHave: {
    'pt-BR': 'Você já tem isso.',
    en: 'You already have it.',
  },
  taken: {
    'pt-BR': 'OK.',
    en: 'Taken.',
  },
  dropped: {
    'pt-BR': 'Largado.',
    en: 'Dropped.',
  },
  noDoor: {
    'pt-BR': 'Não há saída nessa direção.',
    en: 'No exit that way.',
  },
}

// Game state
const score = ref(0)
const turns = ref(0)
const inventory = ref<string[]>([])
const currentRoom = ref<number>(0)
const log = ref<string[]>([])
const gameOver = ref(false)
const escaped = ref(false)
const won = ref(false)
const input = ref('')
const started = ref(false)
const hasLight = ref(false)
const ghostsBanished = ref(false)
const batDisturbed = ref(false)
const drankPotion = ref(false)
const snakeAlive = ref(true)
const messageColor = ref('text-amber')

// Objects: 0=key, 1=candle, 2=match, 3=sword, 4=bag, 5=coins, 6=ring, 7=potions, 8=axe, 9=rope, 10=mirror
// Each object: { name, location, portable, treasure? }
const obj = ref([
  { name: { 'pt-BR': 'chave', en: 'key' }, loc: 0, portable: true, treasure: false },
  { name: { 'pt-BR': 'vela', en: 'candle' }, loc: 8, portable: true, treasure: false },
  { name: { 'pt-BR': 'fósforo', en: 'match' }, loc: 5, portable: true, treasure: false },
  { name: { 'pt-BR': 'espada', en: 'sword' }, loc: 1, portable: true, treasure: false },
  { name: { 'pt-BR': 'bolsa', en: 'bag' }, loc: 9, portable: true, treasure: true },
  { name: { 'pt-BR': 'moedas', en: 'coins' }, loc: 4, portable: true, treasure: true },
  { name: { 'pt-BR': 'anel', en: 'ring' }, loc: 25, portable: true, treasure: true },
  { name: { 'pt-BR': 'poção', en: 'potion' }, loc: 20, portable: true, treasure: false },
  { name: { 'pt-BR': 'machado', en: 'axe' }, loc: 16, portable: true, treasure: false },
  { name: { 'pt-BR': 'corda', en: 'rope' }, loc: 6, portable: true, treasure: false },
  { name: { 'pt-BR': 'espelho', en: 'mirror' }, loc: 13, portable: true, treasure: false },
])

// 26 rooms in a grid. Each room: name + exits + locks + danger
// Layout: 5x5 + 1 basement
const roomNames = computed(() => {
  const r = locale.current
  return [
    { 'pt-BR': 'Entrada da casa', en: 'House entrance' },
    { 'pt-BR': 'Sala de estar', en: 'Living room' },
    { 'pt-BR': 'Cozinha', en: 'Kitchen' },
    { 'pt-BR': 'Sala de jantar', en: 'Dining room' },
    { 'pt-BR': 'Corredor oeste', en: 'West hall' },
    { 'pt-BR': 'Escada para cima', en: 'Staircase up' },
    { 'pt-BR': 'Sótão', en: 'Attic' },
    { 'pt-BR': 'Quarto principal', en: 'Master bedroom' },
    { 'pt-BR': 'Banheiro', en: 'Bathroom' },
    { 'pt-BR': 'Quarto de hóspedes', en: 'Guest room' },
    { 'pt-BR': 'Corredor central', en: 'Central hall' },
    { 'pt-BR': 'Porão', en: 'Basement' },
    { 'pt-BR': 'Adega', en: 'Wine cellar' },
    { 'pt-BR': 'Sala de espelhos', en: 'Mirror room' },
    { 'pt-BR': 'Corredor escuro', en: 'Dark hall' },
    { 'pt-BR': 'Biblioteca', en: 'Library' },
    { 'pt-BR': 'Galeria', en: 'Gallery' },
    { 'pt-BR': 'Jardim interno', en: 'Inner garden' },
    { 'pt-BR': 'Escritório', en: 'Study' },
    { 'pt-BR': 'Sala de música', en: 'Music room' },
    { 'pt-BR': 'Sala das poções', en: 'Potion room' },
    { 'pt-BR': 'Cripta', en: 'Crypt' },
    { 'pt-BR': 'Saída dos fundos', en: 'Back exit' },
    { 'pt-BR': 'Telhado', en: 'Roof' },
    { 'pt-BR': 'Cozinha velha', en: 'Old kitchen' },
    { 'pt-BR': 'Cofre', en: 'Vault' },
  ]
})

// exits: N S E W U D
const exits = ref([
  /* 0 entrada */     { n: -1, s: 5, e: 1, w: -1, u: -1, d: -1 },
  /* 1 sala */         { n: -1, s: -1, e: 2, w: 0, u: -1, d: -1 },
  /* 2 cozinha */      { n: -1, s: -1, e: 3, w: 1, u: -1, d: -1 },
  /* 3 jantar */       { n: 4, s: 10, e: -1, w: 2, u: -1, d: -1 },
  /* 4 corredor O */   { n: 8, s: 3, e: -1, w: -1, u: -1, d: -1 },
  /* 5 escada */       { n: 0, s: -1, e: 10, w: -1, u: 6, d: 11 },
  /* 6 sótão */        { n: -1, s: -1, e: 7, w: -1, u: -1, d: 5 },
  /* 7 quarto */       { n: -1, s: -1, e: -1, w: 6, u: -1, d: -1 },
  /* 8 banheiro */     { n: -1, s: 4, e: -1, w: -1, u: -1, d: -1 },
  /* 9 hospede */      { n: -1, s: -1, e: 6, w: -1, u: -1, d: -1 },
  /* 10 central */     { n: 3, s: 14, e: 16, w: 5, u: -1, d: -1 },
  /* 11 porao */       { n: -1, s: -1, e: 12, w: -1, u: 5, d: -1 },
  /* 12 adega */       { n: -1, s: -1, e: 13, w: 11, u: -1, d: -1 },
  /* 13 espelhos */    { n: -1, s: -1, e: -1, w: 12, u: -1, d: -1 },
  /* 14 corredor esc.*/{ n: 10, s: 18, e: -1, w: 15, u: -1, d: -1 },
  /* 15 biblioteca */  { n: -1, s: -1, e: 14, w: -1, u: -1, d: -1 },
  /* 16 galeria */     { n: -1, s: -1, e: 17, w: 10, u: -1, d: -1 },
  /* 17 jardim */      { n: -1, s: -1, e: 22, w: 16, u: -1, d: -1 },
  /* 18 escritorio */  { n: 14, s: -1, e: 19, w: -1, u: -1, d: -1 },
  /* 19 musica */      { n: -1, s: -1, e: 20, w: 18, u: -1, d: -1 },
  /* 20 pocoes */      { n: -1, s: -1, e: 21, w: 19, u: -1, d: -1 },
  /* 21 cripta */      { n: -1, s: -1, e: -1, w: 20, u: -1, d: -1 },
  /* 22 saida */       { n: -1, s: -1, e: -1, w: 17, u: -1, d: -1 },
  /* 23 telhado */     { n: -1, s: -1, e: -1, w: -1, u: -1, d: 6 },
  /* 24 cozinha velha*/{ n: -1, s: -1, e: 25, w: 11, u: -1, d: -1 },
  /* 25 cofre */       { n: -1, s: -1, e: -1, w: 24, u: -1, d: -1 },
])

// Doors: special locks (need key or other conditions)
// Room 1 -> 2 locked (needs key) ; Room 14 -> 18 is dark (needs candle+fósforo) ; etc.

// Some rooms are dark; in those you die unless you have a lit candle
const darkRooms = new Set([11, 12, 13, 14, 18, 20, 21, 24, 25])

// Room-specific descriptions for flavor
const flavor = computed(() => {
  const r = locale.current
  return [
    { 'pt-BR': 'A porta range. Você sente um calafrio.', en: 'The door creaks. You feel a chill.' },
    { 'pt-BR': 'Poltronas empoeiradas, cortinas rasgadas.', en: 'Dusty armchairs, torn curtains.' },
    { 'pt-BR': 'Uma pia velha goteja. Cheiro de mofo.', en: 'An old sink drips. Smells moldy.' },
    { 'pt-BR': 'Mesa de jantar coberta de teias de aranha.', en: 'Dining table covered in cobwebs.' },
    { 'pt-BR': 'O corredor é estreito. Você ouve sussurros.', en: 'The hall is narrow. You hear whispers.' },
    { 'pt-BR': 'A escada range a cada passo.', en: 'The staircase creaks with every step.' },
    { 'pt-BR': 'Caixas velhas empilhadas. Poeira grossa.', en: 'Old boxes piled up. Thick dust.' },
    { 'pt-BR': 'Cama desfeita. Quadro torto na parede.', en: 'Unmade bed. Tilted painting on the wall.' },
    { 'pt-BR': 'Banheira enferrujada. O espelho está embaçado.', en: 'Rusty bathtub. The mirror is foggy.' },
    { 'pt-BR': 'Cama de criança. Brinquedos no chão.', en: 'A child\'s bed. Toys on the floor.' },
    { 'pt-BR': 'Relógio de pé bateu meia-noite faz tempo.', en: 'The grandfather clock struck midnight long ago.' },
    { 'pt-BR': 'Parede úmida. Você ouve água pingando.', en: 'Damp walls. You hear water dripping.' },
    { 'pt-BR': 'Garrafas cobertas de poeira. Uma rolha.', en: 'Dusty bottles. A cork.' },
    { 'pt-BR': 'Espelhos em todas as paredes. Reflete infinitamente.', en: 'Mirrors on every wall. Reflects infinitely.' },
    { 'pt-BR': 'Escuridão quase total. Algo se move.', en: 'Almost total darkness. Something moves.' },
    { 'pt-BR': 'Estantes do chão ao teto. Poeira e cheiro de livro velho.', en: 'Shelves floor to ceiling. Dust and old book smell.' },
    { 'pt-BR': 'Quadros antigos. Um te observa.', en: 'Old paintings. One watches you.' },
    { 'pt-BR': 'Plantas mortas. Um banco de pedra.', en: 'Dead plants. A stone bench.' },
    { 'pt-BR': 'Mesa de trabalho. Penas e tinta.', en: 'Work desk. Feathers and ink.' },
    { 'pt-BR': 'Piano de cauda coberto. Teclas amareladas.', en: 'Covered grand piano. Yellowed keys.' },
    { 'pt-BR': 'Frascos com líquidos de cores estranhas.', en: 'Jars with strange-colored liquids.' },
    { 'pt-BR': 'Caixões na parede. Frio intenso.', en: 'Coffins on the wall. Intense cold.' },
    { 'pt-BR': 'A porta dos fundos! Você vê a luz do dia!', en: 'The back door! You see daylight!' },
    { 'pt-BR': 'Telhas soltas. O vento é cortante.', en: 'Loose tiles. The wind is cutting.' },
    { 'pt-BR': 'Cozinha em ruínas. Há algo se mexendo.', en: 'Kitchen in ruins. Something is moving.' },
    { 'pt-BR': 'Cofre de ferro. Tem uma fechadura.', en: 'Iron safe. It has a lock.' },
  ]
})

const startExitsText = computed(() => {
  const ex = exits.value[currentRoom.value]
  const out: string[] = []
  const r = locale.current
  const labels: Record<string, Record<string, string>> = {
    n: { 'pt-BR': 'N', en: 'N' }, s: { 'pt-BR': 'S', en: 'S' },
    e: { 'pt-BR': 'L', en: 'E' }, w: { 'pt-BR': 'O', en: 'W' },
    u: { 'pt-BR': 'C', en: 'U' }, d: { 'pt-BR': 'B', en: 'D' },
  }
  for (const dir of Object.keys(ex) as (keyof typeof ex)[]) {
    if (ex[dir] !== -1) out.push(labels[dir][r])
  }
  return out.join(' · ')
})

const objectsInRoom = computed(() => {
  return obj.value.filter((o) => o.loc === currentRoom.value)
})

function logMsg(msg: string, color = 'text-amber') {
  log.value.push(msg)
  messageColor.value = color
  if (log.value.length > 80) log.value.shift()
}

function findObjectIdx(name: string): number {
  const n = name.toLowerCase().trim()
  return obj.value.findIndex((o, i) => {
    const nname = o.name[locale.current].toLowerCase()
    return nname === n || nname.startsWith(n) || n.startsWith(nname)
  })
}

function hasObject(name: string): boolean {
  // Check by PT/EN name OR by id (chave/key, vela/candle, fosforo/match, espada/sword, machado/axe)
  const r = locale.current
  for (let i = 0; i < obj.value.length; i++) {
    const n = obj.value[i].name[r].toLowerCase()
    if (n === name || n.startsWith(name) || name.startsWith(n)) {
      return inventory.value.includes(obj.value[i].name[r])
    }
  }
  return false
}

function lookAround() {
  if (darkRooms.has(currentRoom.value) && !hasLight.value) {
    logMsg(locale.current === 'pt-BR' ? 'Escuridão total. Você tropeça e cai.' : 'Total darkness. You trip and fall.', 'text-danger')
    die()
    return
  }
  logMsg(`${ui.youAreIn[locale.current]}: ${roomNames.value[currentRoom.value][locale.current]}`, 'text-amber')
  logMsg(flavor.value[currentRoom.value][locale.current], 'text-ink-muted')
  if (objectsInRoom.value.length) {
    const names = objectsInRoom.value.map((o) => o.name[locale.current]).join(', ')
    logMsg(`${ui.youSee[locale.current]} ${names}`, 'text-cyan')
  }
  if (startExitsText.value) logMsg(`${ui.exits[locale.current]} ${startExitsText.value}`, 'text-ink-muted')
}

function die() {
  gameOver.value = true
  won.value = false
  sfx.lose()
  logMsg(ui.youDied[locale.current], 'text-danger')
}

function checkWin() {
  if (currentRoom.value === 22) {
    // back exit
    const treasures = inventory.value.filter((name) => {
      const o = obj.value.find((oo) => oo.name[locale.current] === name)
      return o?.treasure
    })
    if (treasures.length >= 3) {
      escaped.value = true
      won.value = true
      gameOver.value = true
      sfx.win()
      logMsg(ui.treasureCount[locale.current], 'text-amber')
      logMsg(ui.youEscaped[locale.current], 'text-amber')
    } else {
      logMsg(`${ui.needMore[locale.current]} (${treasures.length}/3)`, 'text-amber')
    }
  }
}

function move(dirKey: 'n'|'s'|'e'|'w'|'u'|'d') {
  if (gameOver.value) return
  const ex = exits.value[currentRoom.value]
  const target = ex[dirKey]
  if (target === -1) {
    logMsg(ui.noDoor[locale.current], 'text-danger')
    return
  }
  // Special locked doors
  if (currentRoom.value === 1 && target === 2 && !hasObject(locale.current === 'pt-BR' ? 'chave' : 'key')) {
    logMsg(locale.current === 'pt-BR' ? 'A porta está trancada.' : 'The door is locked.', 'text-danger')
    return
  }
  if (currentRoom.value === 24 && target === 25 && !hasObject(locale.current === 'pt-BR' ? 'chave' : 'key')) {
    logMsg(locale.current === 'pt-BR' ? 'O cofre está trancado.' : 'The safe is locked.', 'text-danger')
    return
  }
  if (currentRoom.value === 17 && target === 22 && snakeAlive.value) {
    logMsg(locale.current === 'pt-BR' ? 'Uma cobra bloqueia a saída! Mate-a primeiro.' : 'A snake blocks the exit! Kill it first.', 'text-danger')
    return
  }
  currentRoom.value = target
  turns.value++
  // Room events
  if (currentRoom.value === 6 && batDisturbed.value) {
    logMsg(locale.current === 'pt-BR' ? 'Morcegos voam para cima! Você cai.' : 'Bats fly up! You fall.', 'text-danger')
    die()
    return
  }
  if (currentRoom.value === 11 && !ghostsBanished.value) {
    logMsg(locale.current === 'pt-BR' ? 'Fantasmas bloqueiam o caminho!' : 'Ghosts block the path!', 'text-danger')
    die()
    return
  }
  if (currentRoom.value === 13 && inventory.value.includes(obj.value[10].name[locale.current])) {
    logMsg(locale.current === 'pt-BR' ? 'Seu reflexo no espelho é estranho...' : 'Your reflection is strange...', 'text-cyan')
  }
  lookAround()
}

function getItem(name: string) {
  if (gameOver.value) return
  const idx = findObjectIdx(name)
  if (idx === -1) {
    logMsg(ui.dontSee[locale.current], 'text-danger')
    return
  }
  const o = obj.value[idx]
  if (o.loc !== currentRoom.value) {
    logMsg(ui.dontSee[locale.current], 'text-danger')
    return
  }
  if (!o.portable) {
    logMsg(locale.current === 'pt-BR' ? 'Não dá para pegar isso.' : 'Can\'t take that.', 'text-danger')
    return
  }
  const nameStr = o.name[locale.current]
  if (inventory.value.includes(nameStr)) {
    logMsg(ui.alreadyHave[locale.current], 'text-ink-muted')
    return
  }
  inventory.value.push(nameStr)
  o.loc = 100 // carried
  if (o.treasure) score.value += 5
  sfx.coin()
  logMsg(`${ui.taken[locale.current]} (${nameStr})`, 'text-amber')
  if (nameStr === obj.value[0].name[locale.current]) sfx.powerup()
}

function dropItem(name: string) {
  if (gameOver.value) return
  const idx = findObjectIdx(name)
  if (idx === -1) {
    logMsg(ui.dontHave[locale.current], 'text-danger')
    return
  }
  const o = obj.value[idx]
  const nameStr = o.name[locale.current]
  const i = inventory.value.indexOf(nameStr)
  if (i === -1) {
    logMsg(ui.dontHave[locale.current], 'text-danger')
    return
  }
  inventory.value.splice(i, 1)
  o.loc = currentRoom.value
  if (o.treasure) score.value -= 5
  logMsg(ui.dropped[locale.current], 'text-ink-muted')
}

function examineItem(name: string) {
  if (gameOver.value) return
  const idx = findObjectIdx(name)
  if (idx === -1) {
    logMsg(ui.dontSee[locale.current], 'text-danger')
    return
  }
  const o = obj.value[idx]
  const inRoom = o.loc === currentRoom.value
  const carried = inventory.value.includes(o.name[locale.current])
  if (!inRoom && !carried) {
    logMsg(ui.dontSee[locale.current], 'text-danger')
    return
  }
  const ex: Record<number, Record<string, string>> = {
    0: { 'pt-BR': 'Uma chave velha de bronze.', en: 'An old bronze key.' },
    1: { 'pt-BR': 'Uma vela meio derretida. Cheira a cera.', en: 'A half-melted candle. Smells of wax.' },
    2: { 'pt-BR': 'Um único fósforo. Vai gastar rápido.', en: 'A single match. Will be used quickly.' },
    3: { 'pt-BR': 'Uma espada. Brilhante apesar da poeira.', en: 'A sword. Shiny despite the dust.' },
    4: { 'pt-BR': 'Bolsa de couro. Tem mais dentro.', en: 'A leather bag. There\'s more inside.' },
    5: { 'pt-BR': 'Moedas de ouro antigas.', en: 'Ancient gold coins.' },
    6: { 'pt-BR': 'Anel de sinete. Tem um brasão.', en: 'A signet ring. It has a crest.' },
    7: { 'pt-BR': 'Uma poção borbulhante. Cor verde.', en: 'A bubbling potion. Green color.' },
    8: { 'pt-BR': 'Um machado pesado. Útil para cortar.', en: 'A heavy axe. Useful for cutting.' },
    9: { 'pt-BR': 'Corda de cânhamo. Forte.', en: 'Hemp rope. Strong.' },
    10: { 'pt-BR': 'Espelho antigo. Seu reflexo está atrasado.', en: 'Old mirror. Your reflection is delayed.' },
  }
  logMsg(ex[idx][locale.current], 'text-ink')
}

function openItem(name: string) {
  if (gameOver.value) return
  if (currentRoom.value === 24 && (name.includes('cofre') || name.includes('safe'))) {
    if (hasObject(locale.current === 'pt-BR' ? 'chave' : 'key')) {
      logMsg(locale.current === 'pt-BR' ? 'Você abre o cofre. Está vazio agora.' : 'You open the safe. It is empty now.', 'text-amber')
    } else {
      logMsg(locale.current === 'pt-BR' ? 'O cofre está trancado. Precisa de uma chave.' : 'The safe is locked. You need a key.', 'text-danger')
    }
    return
  }
  if (currentRoom.value === 20 && (name.includes('frasco') || name.includes('potion') || name.includes('poção'))) {
    if (inventory.value.includes(obj.value[7].name[locale.current])) {
      logMsg(locale.current === 'pt-BR' ? 'O frasco está aberto. Você sente um cheiro forte.' : 'The jar is open. You smell a strong odor.', 'text-cyan')
    } else {
      logMsg(ui.dontHave[locale.current], 'text-danger')
    }
    return
  }
  logMsg(ui.cantDo[locale.current], 'text-danger')
}

function lightItem(name: string) {
  if (gameOver.value) return
  if ((name.includes('vela') || name.includes('candle')) && hasObject(locale.current === 'pt-BR' ? 'vela' : 'candle') && hasObject(locale.current === 'pt-BR' ? 'fósforo' : 'match')) {
    if (!hasLight.value) {
      hasLight.value = true
      sfx.start()
      logMsg(locale.current === 'pt-BR' ? 'A vela acende. Agora você vê no escuro.' : 'The candle lights up. You can see in the dark now.', 'text-amber')
    } else {
      logMsg(locale.current === 'pt-BR' ? 'A vela já está acesa.' : 'The candle is already lit.', 'text-ink-muted')
    }
    return
  }
  logMsg(ui.cantDo[locale.current], 'text-danger')
}

function killTarget(name: string) {
  if (gameOver.value) return
  if ((name.includes('cobra') || name.includes('snake')) && currentRoom.value === 17) {
    if (hasObject(locale.current === 'pt-BR' ? 'espada' : 'sword') || hasObject(locale.current === 'pt-BR' ? 'machado' : 'axe')) {
      snakeAlive.value = false
      sfx.hit()
      logMsg(locale.current === 'pt-BR' ? 'Você mata a cobra. A saída está livre.' : 'You kill the snake. The exit is clear.', 'text-amber')
    } else {
      logMsg(locale.current === 'pt-BR' ? 'Você não tem arma!' : 'You have no weapon!', 'text-danger')
      die()
    }
    return
  }
  if ((name === 'fantasma' || name === 'ghost') && currentRoom.value === 11) {
    if (hasObject(locale.current === 'pt-BR' ? 'espelho' : 'mirror')) {
      ghostsBanished.value = true
      sfx.powerup()
      logMsg(locale.current === 'pt-BR' ? 'Os fantasmas se vêem no espelho e somem!' : 'The ghosts see themselves in the mirror and vanish!', 'text-amber')
    } else {
      logMsg(locale.current === 'pt-BR' ? 'Os fantasmas riem de você.' : 'The ghosts laugh at you.', 'text-danger')
      die()
    }
    return
  }
  if ((name === 'morcego' || name === 'bat') && currentRoom.value === 6) {
    if (hasObject(locale.current === 'pt-BR' ? 'machado' : 'axe')) {
      batDisturbed.value = true
      logMsg(locale.current === 'pt-BR' ? 'Você espanta os morcegos.' : 'You scare the bats away.', 'text-ink-muted')
    } else {
      logMsg(locale.current === 'pt-BR' ? 'Os morcegos voam para cima!' : 'The bats fly up!', 'text-danger')
      die()
    }
    return
  }
  logMsg(ui.cantDo[locale.current], 'text-danger')
}

function drinkItem(name: string) {
  if (gameOver.value) return
  if ((name.includes('poção') || name.includes('potion')) && hasObject(locale.current === 'pt-BR' ? 'poção' : 'potion')) {
    drankPotion.value = true
    sfx.powerup()
    logMsg(locale.current === 'pt-BR' ? 'Você bebe a poção. Tudo brilha.' : 'You drink the potion. Everything glows.', 'text-cyan')
    inventory.value = inventory.value.filter((n) => n !== obj.value[7].name[locale.current])
    obj.value[7].loc = 200
  } else {
    logMsg(ui.dontHave[locale.current], 'text-danger')
  }
}

function parse(input: string) {
  if (gameOver.value) return
  const text = input.trim().toLowerCase()
  if (!text) return
  sfx.type()
  turns.value++

  const parts = text.split(/\s+/)
  const verbRaw = parts[0]
  const noun = parts.slice(1).join(' ')
  const r = locale.current
  const verbMap: Record<string, string> = {
    ir: 'go', norte: 'go', sul: 'go', leste: 'go', oeste: 'go', cima: 'go', baixo: 'go',
    n: 'go', s: 'go', l: 'go', o: 'go', c: 'go', b: 'go',
    pegar: 'get', pegar2: 'get', drop: 'drop', dropar: 'drop', largar: 'drop',
    examinar: 'examine', ver: 'examine', olhar: 'examine',
    inventario: 'inv', inv: 'inv',
    pontos: 'score', score: 'score',
    ajuda: 'help', help: 'help', '?': 'help',
    sair: 'quit', quit: 'quit',
    abrir: 'open', acender: 'light', matar: 'kill', beber: 'drink',
  }
  const verb = verbMap[verbRaw] ?? null

  if (verb === 'go') {
    // direction
    const dMap: Record<string, 'n'|'s'|'e'|'w'|'u'|'d'> = {
      norte: 'n', n: 'n', sul: 's', s: 's', leste: 'e', l: 'e', e: 'e',
      oeste: 'w', o: 'w', w: 'w', cima: 'u', c: 'u', u: 'u', baixo: 'd', b: 'd', d: 'd',
    }
    const d = dMap[verbRaw] ?? dMap[noun]
    if (d) move(d)
    else logMsg(locale.current === 'pt-BR' ? 'Direção inválida.' : 'Invalid direction.', 'text-danger')
    return
  }

  if (verb === 'get') { getItem(noun); return }
  if (verb === 'drop') { dropItem(noun); return }
  if (verb === 'examine') { examineItem(noun); return }
  if (verb === 'open') { openItem(noun); return }
  if (verb === 'light') { lightItem(noun); return }
  if (verb === 'kill') { killTarget(noun); return }
  if (verb === 'drink') { drinkItem(noun); return }
  if (verb === 'inv') {
    if (inventory.value.length === 0) logMsg(ui.emptyHands[r], 'text-ink-muted')
    else logMsg(`${ui.carrying[r]} ${inventory.value.join(', ')}`, 'text-amber')
    return
  }
  if (verb === 'score') {
    const treasures = obj.value.filter((o) => o.treasure && inventory.value.includes(o.name[r])).length
    logMsg(`${ui.scoreIs[r]} ${score.value} (${treasures}/7 ${ui.treasuresLeft[r]})`, 'text-amber')
    return
  }
  if (verb === 'help') {
    logMsg(ui.helpText[r], 'text-ink-muted')
    return
  }
  if (verb === 'quit') {
    router.push('/')
    return
  }
  logMsg(locale.current === 'pt-BR' ? 'Não entendi. Tente AJUDA.' : 'I don\'t understand. Try HELP.', 'text-danger')
}

function submit() {
  parse(input.value)
  input.value = ''
  checkWin()
}

function reset() {
  score.value = 0
  turns.value = 0
  inventory.value = []
  currentRoom.value = 0
  log.value = []
  gameOver.value = false
  escaped.value = false
  won.value = false
  hasLight.value = false
  ghostsBanished.value = false
  batDisturbed.value = false
  drankPotion.value = false
  snakeAlive.value = true
  // restore objects
  obj.value = [
    { name: { 'pt-BR': 'chave', en: 'key' }, loc: 0, portable: true, treasure: false },
    { name: { 'pt-BR': 'vela', en: 'candle' }, loc: 8, portable: true, treasure: false },
    { name: { 'pt-BR': 'fósforo', en: 'match' }, loc: 5, portable: true, treasure: false },
    { name: { 'pt-BR': 'espada', en: 'sword' }, loc: 1, portable: true, treasure: false },
    { name: { 'pt-BR': 'bolsa', en: 'bag' }, loc: 9, portable: true, treasure: true },
    { name: { 'pt-BR': 'moedas', en: 'coins' }, loc: 4, portable: true, treasure: true },
    { name: { 'pt-BR': 'anel', en: 'ring' }, loc: 25, portable: true, treasure: true },
    { name: { 'pt-BR': 'poção', en: 'potion' }, loc: 20, portable: true, treasure: false },
    { name: { 'pt-BR': 'machado', en: 'axe' }, loc: 16, portable: true, treasure: false },
    { name: { 'pt-BR': 'corda', en: 'rope' }, loc: 6, portable: true, treasure: false },
    { name: { 'pt-BR': 'espelho', en: 'mirror' }, loc: 13, portable: true, treasure: false },
  ]
  started.value = true
  lookAround()
}

const kb = useKeyboard(SCOPE)
kb.push({ key: 'Enter', handler: () => { if (!started.value) reset() } })

onMounted(() => {
  if (started.value) reset()
})

const status = computed(() => {
  if (gameOver.value && won.value) return 'won'
  if (gameOver.value) return 'lost'
  return 'playing'
})

function onQuit() {
  router.push('/')
}
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status as any"
    :title="locale.current === 'pt-BR' ? 'HAUNTED HOUSE' : 'HAUNTED HOUSE'"
    @restart="reset"
    @quit="onQuit"
  >
    <div v-if="!started" class="text-center py-8">
      <h2 class="font-display text-lg phosphor text-shadow-neon mb-3 animate-flicker">
        {{ ui.welcomeTitle[locale.current] }}
      </h2>
      <p class="text-ink-muted text-sm mb-1">
        {{ locale.current === 'pt-BR'
          ? 'A casa mal-assombrada te espera. 26 salas, 7 tesouros, 2 finais.'
          : 'The haunted house awaits. 26 rooms, 7 treasures, 2 endings.' }}
      </p>
      <p class="text-cyan text-xs mb-6">
        {{ locale.current === 'pt-BR' ? 'Colete pelo menos 3 tesouros para escapar.' : 'Collect at least 3 treasures to escape.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="reset">
        ▶ {{ ui.pressStart[locale.current] }}
      </button>
    </div>
    <div v-else class="font-mono text-sm leading-relaxed h-[60vh] min-h-[420px] flex flex-col">
      <div
        ref="logBox"
        class="flex-1 overflow-y-auto pr-2 space-y-0.5 text-amber"
      >
        <p
          v-for="(m, i) in log"
          :key="i"
          class="whitespace-pre-wrap"
          :class="(i === log.length - 1) ? messageColor : (i < log.length - 1 ? 'text-ink-dim' : 'text-ink-muted')"
        >{{ m }}</p>
      </div>
      <form
        v-if="!gameOver"
        class="mt-3 flex items-center gap-2 border-t border-surface-600 pt-3"
        @submit.prevent="submit"
      >
        <span class="phosphor">{{ ui.prompt[locale.current] }}</span>
        <input
          v-model="input"
          class="flex-1 bg-transparent border-none outline-none text-amber font-mono placeholder-ink-dim"
          :placeholder="locale.current === 'pt-BR' ? 'PEGAR CHAVE  /  IR NORTE  /  EXAMINAR ESPELHO' : 'GET KEY  /  GO NORTH  /  EXAMINE MIRROR'"
          autofocus
          autocomplete="off"
          spellcheck="false"
        />
      </form>
      <div v-else class="mt-3 border-t border-surface-600 pt-3 text-center">
        <p
          class="font-display text-sm mb-2"
          :class="won ? 'amber-phosphor' : 'danger-phosphor'"
        >
          {{ won ? ui.youEscaped[locale.current] : ui.youDied[locale.current] }}
        </p>
        <p class="text-ink-muted text-xs">
          {{ locale.current === 'pt-BR' ? 'Pontuação final:' : 'Final score:' }}
          <span class="text-amber">{{ score }}</span>
        </p>
      </div>
    </div>
  </CrtFrame>
</template>
