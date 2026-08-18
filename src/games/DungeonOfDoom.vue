<script setup lang="ts">
/**
 * Dungeon of Doom — Reconstructed from "Fantasy Games" (Usborne 1983)
 * Procedural dungeon RPG: generate character, explore levels, find idol.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useAudio } from '../composables/useAudio'
import CrtFrame from '../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

type Hero = { strength: number; skill: number; stamina: number; luck: number; hp: number; maxHp: number }
type Room = { id: number; n: string; s: string; e: string; w: string; desc: string; monster?: string; treasure?: string }
type Item = { name: string; price: number; effect: 'heal' | 'damage' | 'shield' }

const ui = {
  intro: {
    'pt-BR': 'RPG procedural. Crie seu herói. Compre equipamento. Encontre o Ídolo Mágico.',
    en: 'Procedural RPG. Create your hero. Buy gear. Find the Magic Idol.',
  },
  tradingPost: { 'pt-BR': 'TRADING POST', en: 'TRADING POST' },
  gold: { 'pt-BR': 'OURO', en: 'GOLD' },
  create: { 'pt-BR': 'CRIAR HERÓI', en: 'CREATE HERO' },
  roll: { 'pt-BR': 'Role os dados (clique)', en: 'Roll the dice (click)' },
  hero: { 'pt-BR': 'Herói:', en: 'Hero:' },
  str: { 'pt-BR': 'Força', en: 'Strength' },
  skl: { 'pt-BR': 'Habilidade', en: 'Skill' },
  sta: { 'pt-BR': 'Resistência', en: 'Stamina' },
  lck: { 'pt-BR': 'Sorte', en: 'Luck' },
  hp: { 'pt-BR': 'HP', en: 'HP' },
  youAreIn: { 'pt-BR': 'Você está em', en: 'You are in' },
  exits: { 'pt-BR': 'Saídas:', en: 'Exits:' },
  inv: { 'pt-BR': 'Inventário:', en: 'Inventory:' },
  youSee: { 'pt-BR': 'Você vê:', en: 'You see:' },
  youDied: { 'pt-BR': 'VOCÊ MORREU', en: 'YOU DIED' },
  youWon: { 'pt-BR': '★ ÍDOLO ENCONTRADO ★', en: '★ IDOL FOUND ★' },
  found: { 'pt-BR': 'Você encontrou o Ídolo!', en: 'You found the Idol!' },
  tooDeep: { 'pt-BR': 'Masmorra muito profunda.', en: 'Dungeon too deep.' },
  notDeep: { 'pt-BR': 'Volte para a superfície.', en: 'Return to surface.' },
  go: { 'pt-BR': 'IR', en: 'GO' },
  buy: { 'pt-BR': 'COMPRAR', en: 'BUY' },
  use: { 'pt-BR': 'USAR', en: 'USE' },
  fight: { 'pt-BR': 'LUTAR', en: 'FIGHT' },
  flee: { 'pt-BR': 'FUGIR', en: 'FLEE' },
  search: { 'pt-BR': 'PROCURAR', en: 'SEARCH' },
  enterDungeon: { 'pt-BR': 'ENTRAR NA MASMORRA', en: 'ENTER DUNGEON' },
}

const STAGE = { NAME: 0, STATS: 1, TRADE: 2, DUNGEON: 3, COMBAT: 4, END: 5 } as const
const stage = ref<typeof STAGE[keyof typeof STAGE]>(STAGE.NAME)
const heroName = ref('')
const hero = ref<Hero>({ strength: 0, skill: 0, stamina: 0, luck: 0, hp: 0, maxHp: 0 })
const gold = ref(20)
const inventory = ref<string[]>([])
const level = ref(0)
const room = ref<Room | null>(null)
const currentMonster = ref<{ name: string; hp: number; skill: number } | null>(null)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

const SHOP = computed(() => {
  const r = locale.current
  return [
    { name: { 'pt-BR': 'Espada', en: 'Sword' }, price: 10, effect: 'damage' as const, value: 2 },
    { name: { 'pt-BR': 'Poção de cura', en: 'Healing potion' }, price: 5, effect: 'heal' as const, value: 6 },
    { name: { 'pt-BR': 'Escudo', en: 'Shield' }, price: 8, effect: 'shield' as const, value: 1 },
  ]
})

const MONSTERS = computed(() => {
  const r = locale.current
  return [
    { name: { 'pt-BR': 'Goblin', en: 'Goblin' }, skill: 3, hp: 4 },
    { name: { 'pt-BR': 'Esqueleto', en: 'Skeleton' }, skill: 4, hp: 5 },
    { name: { 'pt-BR': 'Orc', en: 'Orc' }, skill: 5, hp: 6 },
    { name: { 'pt-BR': 'Troll', en: 'Troll' }, skill: 6, hp: 7 },
    { name: { 'pt-BR': 'Dragão', en: 'Dragon' }, skill: 8, hp: 10 },
    { name: { 'pt-BR': 'Klimm!', en: 'Klimm!' }, skill: 10, hp: 14 },
  ]
})

const ITEMS = computed(() => {
  const r = locale.current
  return [
    { name: { 'pt-BR': 'bolsa de ouro', en: 'gold bag' } },
    { name: { 'pt-BR': 'anel de prata', en: 'silver ring' } },
    { name: { 'pt-BR': 'rubi', en: 'ruby' } },
    { name: { 'pt-BR': 'taça', en: 'goblet' } },
    { name: { 'pt-BR': 'íDOLO MÁGICO!', en: 'MAGIC IDOL!' } },
  ]
})

const ROOM_NAMES = computed(() => {
  const r = locale.current
  return [
    { 'pt-BR': 'Corredor de pedra', en: 'Stone corridor' },
    { 'pt-BR': 'Salão com tochas', en: 'Hall with torches' },
    { 'pt-BR': 'Cripta escura', en: 'Dark crypt' },
    { 'pt-BR': 'Câmara do tesouro', en: 'Treasure chamber' },
    { 'pt-BR': 'Salão do trono', en: 'Throne room' },
  ]
})

function roll6() { return Math.floor(Math.random() * 6) + 1 }

function rollStats() {
  hero.value = {
    strength: roll6() + 6,
    skill: roll6() + 6,
    stamina: roll6() + 6,
    luck: roll6() + 6,
    hp: 0,
    maxHp: 0,
  }
  hero.value.hp = hero.value.stamina
  hero.value.maxHp = hero.value.stamina
  sfx.powerup()
  log.value.push(`STR ${hero.value.strength} SKL ${hero.value.skill} STA ${hero.value.stamina} LCK ${hero.value.luck}`)
}

function startName() {
  if (!heroName.value.trim()) heroName.value = locale.current === 'pt-BR' ? 'Herói' : 'Hero'
  stage.value = STAGE.STATS
  sfx.start()
}

function startTrade() {
  stage.value = STAGE.TRADE
  sfx.coin()
}

function buy(item: typeof SHOP.value[number]) {
  if (gold.value < item.price) {
    log.value.push(locale.current === 'pt-BR' ? 'Sem ouro.' : 'No gold.')
    sfx.error()
    return
  }
  gold.value -= item.price
  inventory.value.push(item.name[locale.current])
  if (item.effect === 'damage') hero.value.skill += item.value
  if (item.effect === 'shield') hero.value.stamina += item.value
  if (item.effect === 'heal') { hero.value.hp = Math.min(hero.value.maxHp, hero.value.hp + item.value) }
  sfx.coin()
}

function enterDungeon() {
  level.value = 1
  generateRoom()
  stage.value = STAGE.DUNGEON
  sfx.start()
}

function generateRoom() {
  const r = locale.current
  const name = ROOM_NAMES.value[Math.floor(Math.random() * ROOM_NAMES.value.length)][r]
  const monsterChance = 0.4 + level.value * 0.05
  const treasureChance = 0.3
  const hasMonster = Math.random() < monsterChance
  const hasTreasure = !hasMonster && Math.random() < treasureChance
  room.value = {
    id: Math.floor(Math.random() * 1000),
    n: Math.random() > 0.4 ? `room-${Math.random()}` : '',
    s: Math.random() > 0.4 ? `room-${Math.random()}` : '',
    e: Math.random() > 0.4 ? `room-${Math.random()}` : '',
    w: Math.random() > 0.4 ? `room-${Math.random()}` : '',
    desc: name,
    monster: hasMonster ? MONSTERS.value[Math.min(MONSTERS.value.length - 1, level.value - 1)].name[r] : undefined,
    treasure: hasTreasure ? ITEMS.value[Math.min(ITEMS.value.length - 1, level.value)].name[r] : undefined,
  }
  if (room.value.treasure && room.value.treasure.includes('ÍDOLO') || (room.value.treasure && room.value.treasure.includes('IDOL'))) {
    log.value.push(`★ ${ui.found[locale.current]} ★`)
  }
}

function search() {
  if (!room.value) return
  if (room.value.treasure) {
    const t = room.value.treasure
    log.value.push(`🔍 ${t}`)
    if (t.includes('ÍDOLO') || t.includes('IDOL')) {
      status.value = 'won'
      stage.value = STAGE.END
      sfx.win()
      return
    }
    inventory.value.push(t)
    if (t.includes('ouro') || t.includes('gold')) gold.value += 10
    if (t.includes('anel') || t.includes('ring')) gold.value += 5
    if (t.includes('rubi') || t.includes('ruby')) gold.value += 8
    room.value.treasure = undefined
    sfx.coin()
  } else {
    log.value.push(locale.current === 'pt-BR' ? 'Nada aqui.' : 'Nothing here.')
  }
}

function combat() {
  if (!room.value?.monster) {
    log.value.push(locale.current === 'pt-BR' ? 'Nenhum monstro aqui.' : 'No monster here.')
    return
  }
  if (stage.value === STAGE.DUNGEON) {
    // Start combat
    const m = MONSTERS.value.find((mm) => mm.name[locale.current] === room.value!.monster)
    if (m) {
      currentMonster.value = { name: m.name[locale.current], hp: m.hp, skill: m.skill }
      stage.value = STAGE.COMBAT
      sfx.hit()
    }
  } else {
    // Resolve attack
    if (!currentMonster.value) return
    const heroAtk = hero.value.skill + roll6()
    const monAtk = currentMonster.value.skill + roll6()
    if (heroAtk > monAtk) {
      currentMonster.value.hp -= 2
      log.value.push(`▶ ${locale.current === 'pt-BR' ? 'Você acerta!' : 'You hit!'} (${heroAtk} vs ${monAtk})`)
      sfx.hit()
      if (currentMonster.value.hp <= 0) {
        log.value.push(`★ ${currentMonster.value.name} ${locale.current === 'pt-BR' ? 'derrotado' : 'defeated'}!`)
        sfx.powerup()
        room.value!.monster = undefined
        currentMonster.value = null
        stage.value = STAGE.DUNGEON
      }
    } else {
      const dmg = Math.max(1, monAtk - heroAtk - hero.value.stamina)
      hero.value.hp -= dmg
      log.value.push(`▶ ${locale.current === 'pt-BR' ? 'Você erra!' : 'You miss!'} (-${dmg} HP)`)
      sfx.error()
      if (hero.value.hp <= 0) {
        status.value = 'lost'
        stage.value = STAGE.END
        sfx.lose()
        return
      }
    }
  }
}

function flee() {
  if (Math.random() < 0.5) {
    log.value.push(locale.current === 'pt-BR' ? 'Você fugiu!' : 'You fled!')
    currentMonster.value = null
    stage.value = STAGE.DUNGEON
  } else {
    log.value.push(locale.current === 'pt-BR' ? 'Não conseguiu fugir!' : 'Couldn\'t flee!')
    sfx.error()
  }
}

function move(dir: 'n' | 's' | 'e' | 'w') {
  if (Math.random() < 0.7) {
    level.value++
    if (level.value > 5) {
      log.value.push(ui.tooDeep[locale.current])
      level.value = 5
      return
    }
    generateRoom()
    sfx.tick()
  } else {
    log.value.push(locale.current === 'pt-BR' ? 'Passagem bloqueada.' : 'Passage blocked.')
  }
}

function reset() {
  stage.value = STAGE.NAME
  hero.value = { strength: 0, skill: 0, stamina: 0, luck: 0, hp: 0, maxHp: 0 }
  heroName.value = ''
  gold.value = 20
  inventory.value = []
  level.value = 0
  room.value = null
  currentMonster.value = null
  log.value = []
  status.value = 'playing'
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="gold"
    :lives="Math.ceil(hero.hp / Math.max(1, hero.maxHp) * 3)"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'DUNGEON OF DOOM' : 'DUNGEON OF DOOM'"
    @restart="reset"
    @quit="onQuit"
  >
    <!-- NAME -->
    <div v-if="stage === 0" class="text-center py-6 space-y-3">
      <p class="text-ink-muted text-sm">{{ ui.intro[locale.current] }}</p>
      <input
        v-model="heroName"
        :placeholder="ui.hero[locale.current]"
        class="bg-void-deep border border-surface-600 px-3 py-1 text-amber text-center outline-none focus:border-phosphor-green"
        @keyup.enter="startName"
      />
      <div>
        <button class="arcade-btn arcade-btn-amber" @click="startName">▶ {{ ui.create[locale.current] }}</button>
      </div>
    </div>
    <!-- STATS -->
    <div v-else-if="stage === 1" class="text-center py-6 space-y-3">
      <p class="phosphor font-display text-lg">{{ heroName }}</p>
      <button v-if="hero.strength === 0" class="arcade-btn" @click="rollStats">🎲 {{ ui.roll[locale.current] }}</button>
      <div v-else class="space-y-1 text-amber font-mono">
        <p>{{ ui.str[locale.current] }}: <span class="font-bold">{{ hero.strength }}</span></p>
        <p>{{ ui.skl[locale.current] }}: <span class="font-bold">{{ hero.skill }}</span></p>
        <p>{{ ui.sta[locale.current] }}: <span class="font-bold">{{ hero.stamina }}</span></p>
        <p>{{ ui.lck[locale.current] }}: <span class="font-bold">{{ hero.luck }}</span></p>
        <p>{{ ui.hp[locale.current] }}: <span class="font-bold">{{ hero.hp }}</span></p>
        <button class="arcade-btn arcade-btn-amber mt-3" @click="startTrade">▶ {{ ui.tradingPost[locale.current] }}</button>
      </div>
    </div>
    <!-- TRADE -->
    <div v-else-if="stage === 2" class="space-y-3 py-3">
      <div class="text-center">
        <p class="font-display text-amber text-shadow-neon">★ {{ ui.tradingPost[locale.current] }} ★</p>
        <p class="text-cyan text-sm">{{ ui.gold[locale.current] }}: <span class="font-bold">{{ gold }}</span></p>
      </div>
      <div class="grid gap-2">
        <div
          v-for="(item, i) in SHOP"
          :key="i"
          class="flex items-center justify-between border border-surface-600 bg-surface-800 p-2 text-sm"
        >
          <span class="text-amber">{{ item.name[locale.current] }} <span class="text-ink-dim text-xs">(+{{ item.value }})</span></span>
          <button
            class="arcade-btn arcade-btn-amber text-[10px] py-1"
            :disabled="gold < item.price"
            @click="buy(item)"
          >{{ item.price }}g {{ ui.buy[locale.current] }}</button>
        </div>
      </div>
      <button class="arcade-btn w-full" @click="enterDungeon">▶ {{ ui.enterDungeon[locale.current] }}</button>
    </div>
    <!-- DUNGEON / COMBAT -->
    <div v-else-if="stage === 3 || stage === 4" class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-cyan">LVL <span class="text-amber">{{ level }}</span></span>
        <span :class="hero.hp < hero.maxHp / 3 ? 'danger-phosphor' : 'text-amber'">HP {{ hero.hp }}/{{ hero.maxHp }}</span>
        <span class="text-amber">GOLD {{ gold }}</span>
      </div>
      <div v-if="room" class="border border-surface-600 bg-surface-800 p-3 text-amber text-sm">
        <p class="font-display text-xs mb-1">▶ {{ room.desc }}</p>
        <p v-if="room.monster" class="danger-phosphor">⚔ {{ room.monster }}</p>
        <p v-if="room.treasure" class="cyan-phosphor">💎 {{ room.treasure }}</p>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div v-if="stage === 3" class="grid grid-cols-2 gap-1">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="move('n')">↑ N</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="move('s')">↓ S</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="move('e')">→ E</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="move('w')">← W</button>
        <button class="arcade-btn-cyan text-[10px] py-1.5" @click="search">🔍 {{ ui.search[locale.current] }}</button>
        <button v-if="room?.monster" class="arcade-btn-magenta text-[10px] py-1.5" @click="combat">⚔ {{ ui.fight[locale.current] }}</button>
      </div>
      <div v-else-if="stage === 4 && currentMonster" class="space-y-1">
        <p class="text-center danger-phosphor font-display text-sm">⚔ VS {{ currentMonster.name }} (HP {{ currentMonster.hp }})</p>
        <div class="grid grid-cols-2 gap-1">
          <button class="arcade-btn-magenta text-[10px] py-1.5" @click="combat">⚔ ATK</button>
          <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="flee">🏃 {{ ui.flee[locale.current] }}</button>
        </div>
      </div>
    </div>
    <!-- END -->
    <div v-else class="text-center py-8">
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-lg mb-2">★ {{ ui.youWon[locale.current] }} ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-lg mb-2">✕ {{ ui.youDied[locale.current] }} ✕</p>
      <p class="text-ink-muted text-sm">Gold: <span class="text-amber">{{ gold }}</span></p>
    </div>
  </CrtFrame>
</template>
