<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'
import { GAMES } from '../data/games'
import { MANUALS } from '../data/manuals'

// Import games dynamically by id
import HauntedHouse from '../games/HauntedHouse.vue'
import StarshipTakeoff from '../games/space/StarshipTakeoff.vue'
import IntergalacticGames from '../games/space/IntergalacticGames.vue'
import EvilAlien from '../games/space/EvilAlien.vue'
import BeatBugEyes from '../games/space/BeatBugEyes.vue'
import Moonlander from '../games/space/Moonlander.vue'
import MonstersGalacticon from '../games/space/MonstersGalacticon.vue'
import AlienSnipers from '../games/space/AlienSnipers.vue'
import AsteroidBelt from '../games/space/AsteroidBelt.vue'
import TripFuture from '../games/space/TripFuture.vue'
import DeathValley from '../games/space/DeathValley.vue'
import SpaceMines from '../games/space/SpaceMines.vue'
import SpaceRescue from '../games/space/SpaceRescue.vue'
import Touchdown from '../games/space/Touchdown.vue'
import DungeonOfDoom from '../games/DungeonOfDoom.vue'
import RobotMissile from '../games/battle/RobotMissile.vue'
import VitalMessage from '../games/battle/VitalMessage.vue'
import Shootout from '../games/battle/Shootout.vue'
import DesertTank from '../games/battle/DesertTank.vue'
import TraitorsCastle from '../games/battle/TraitorsCastle.vue'
import RobotInvaders from '../games/battle/RobotInvaders.vue'
import SecretWeapon from '../games/battle/SecretWeapon.vue'
import Escape from '../games/battle/Escape.vue'
import PirateDogfight from '../games/battle/PirateDogfight.vue'
import SupersonicBomber from '../games/battle/SupersonicBomber.vue'
import Iceberg from '../games/battle/Iceberg.vue'
import TheWall from '../games/battle/TheWall.vue'
import MissileGame from '../games/battle/MissileGame.vue'
import TowerTerror from '../games/weird/TowerTerror.vue'
import SkullsPyramid from '../games/weird/SkullsPyramid.vue'
import MonsterWrestling from '../games/weird/MonsterWrestling.vue'
import Jaws from '../games/weird/Jaws.vue'
import FlyingWitches from '../games/weird/FlyingWitches.vue'
import Micropuzzle from '../games/weird/Micropuzzle.vue'
import Pesadelo from '../games/horror/Pesadelo.vue'
import MagoNumeros from '../games/horror/MagoNumeros.vue'
import AspiradorFantasmas from '../games/horror/AspiradorFantasmas.vue'
import MulherAranha from '../games/horror/MulherAranha.vue'
import Cemiterio from '../games/horror/Cemiterio.vue'
import CasaMaluca from '../games/horror/CasaMaluca.vue'
import LabirintoAssombrado from '../games/horror/LabirintoAssombrado.vue'
import SessaoEspirita from '../games/horror/SessaoEspirita.vue'
import MarieCeleste from '../games/msx/MarieCeleste.vue'
import DigaMestre from '../games/msx/DigaMestre.vue'
import EuAcuso from '../games/msx/EuAcuso.vue'
import StarTrek from '../games/msx/StarTrek.vue'
import SuperBreakout from '../games/msx/SuperBreakout.vue'
import Labirinto3D from '../games/msx/Labirinto3D.vue'
import Damas from '../games/msx/Damas.vue'
import Xadrez from '../games/msx/Xadrez.vue'
import Gustavus from '../games/msx/Gustavus.vue'
import OlhosEspiao from '../games/spy/OlhosEspiao.vue'
import Holofote from '../games/spy/Holofote.vue'
import Espiobot from '../games/spy/Espiobot.vue'
import TesteEspioes from '../games/spy/TesteEspioes.vue'
import GeradorMensagens from '../games/spy/GeradorMensagens.vue'
import EncontroMarcado from '../games/spy/EncontroMarcado.vue'
import CodigoMorse from '../games/spy/CodigoMorse.vue'

const route = useRoute()
const router = useRouter()
const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()

const gameId = computed(() => String(route.params.id || ''))
const game = computed(() => GAMES.find((g) => g.id === gameId.value) ?? null)
const manual = computed(() => MANUALS.find((m) => m.id === game.value?.manualId) ?? null)

const gameMap: Record<string, any> = {
  'haunted-house': HauntedHouse,
  'starship-takeoff': StarshipTakeoff,
  'intergalactic-games': IntergalacticGames,
  'evil-alien': EvilAlien,
  'beat-the-bug-eyes': BeatBugEyes,
  'moonlander': Moonlander,
  'monsters-of-galacticon': MonstersGalacticon,
  'alien-snipers': AlienSnipers,
  'asteroid-belt': AsteroidBelt,
  'trip-into-the-future': TripFuture,
  'death-valley': DeathValley,
  'space-mines': SpaceMines,
  'space-rescue': SpaceRescue,
  'touchdown': Touchdown,
  'dungeon-of-doom': DungeonOfDoom,
  'robot-missile': RobotMissile,
  'the-vital-message': VitalMessage,
  'shootout': Shootout,
  'desert-tank-battle': DesertTank,
  'battle-at-traitors-castle': TraitorsCastle,
  'robot-invaders': RobotInvaders,
  'secret-weapon': SecretWeapon,
  'escape': Escape,
  'pirate-dogfight': PirateDogfight,
  'supersonic-bomber': SupersonicBomber,
  'iceberg': Iceberg,
  'the-wall': TheWall,
  'missile': MissileGame,
  'tower-of-terror': TowerTerror,
  'skulls-of-the-pyramid': SkullsPyramid,
  'monster-wrestling': MonsterWrestling,
  'jaws': Jaws,
  'flying-witches': FlyingWitches,
  'micropuzzle': Micropuzzle,
  'pesadelo': Pesadelo,
  'mago-dos-numeros': MagoNumeros,
  'aspirador-de-fantasmas': AspiradorFantasmas,
  'mulher-aranha': MulherAranha,
  'cemiterio': Cemiterio,
  'casa-maluca': CasaMaluca,
  'labirinto-assombrado': LabirintoAssombrado,
  'sessao-espirita': SessaoEspirita,
  'marie-celeste': MarieCeleste,
  'diga-mestre': DigaMestre,
  'eu-acuso': EuAcuso,
  'star-trek': StarTrek,
  'super-breakout': SuperBreakout,
  'labirinto-3d': Labirinto3D,
  'damas': Damas,
  'xadrez': Xadrez,
  'gustavus': Gustavus,
  'olhos-espiao': OlhosEspiao,
  'holofote': Holofote,
  'espiobot': Espiobot,
  'teste-espioes': TesteEspioes,
  'gerador-mensagens': GeradorMensagens,
  'encontro-marcado': EncontroMarcado,
  'codigo-morse': CodigoMorse,
}

const GameComponent = computed(() => gameMap[gameId.value] ?? null)

onMounted(() => {
  if (!game.value) {
    router.replace({ name: 'floor' })
  }
})

watch(gameId, () => {
  if (!GAMES.find((g) => g.id === gameId.value)) {
    router.replace({ name: 'floor' })
  }
})

const accentText = computed(() => {
  if (!manual.value) return 'phosphor'
  switch (manual.value.accent) {
    case 'amber': return 'amber-phosphor'
    case 'green': return 'phosphor'
    case 'magenta': return 'magenta-phosphor'
    case 'cyan': return 'cyan-phosphor'
    case 'red': return 'danger-phosphor'
    case 'blue': return 'text-blue-300'
    case 'yellow': return 'text-yellow-300'
  }
})

// Show instructions panel before launching
const showInstructions = ref(true)
function startGame() {
  showInstructions.value = false
  sfx.start()
}
</script>

<template>
  <section v-if="game" class="relative mx-auto w-full max-w-7xl px-4 py-4 sm:py-6">
    <!-- Top nav -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <RouterLink
        v-if="manual"
        :to="`/manual/${manual.id}`"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ◀ {{ manual.i18n[locale.current].title }}
      </RouterLink>
      <RouterLink
        to="/"
        class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs"
        @click="sfx.select()"
      >
        ▤ {{ t('backToFloor', locale.current) }}
      </RouterLink>
    </div>

    <!-- Title -->
    <header class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
      <h1 class="font-display text-lg sm:text-2xl text-shadow-neon" :class="accentText">
        {{ game.i18n[locale.current].title }}
      </h1>
      <span class="text-[10px] font-display tracking-widest text-ink-muted">
        {{ game.year }} · {{ manual?.i18n[locale.current].title }}
      </span>
    </header>

    <!-- Instructions intro (first visit per game) -->
    <div
      v-if="showInstructions"
      class="rounded border border-surface-600 bg-surface-800 p-4 sm:p-6 mb-4"
    >
      <h2 class="font-display text-xs tracking-widest text-amber mb-3">
        ▶ {{ t('howToPlay', locale.current) }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('objective', locale.current) }}
          </p>
          <p class="text-sm text-ink mb-3">
            {{ game.i18n[locale.current].objective }}
          </p>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('controls', locale.current) }}
          </p>
          <p class="text-sm text-ink">
            {{ game.i18n[locale.current].controlsHint ?? '—' }}
          </p>
        </div>
        <div>
          <p class="text-[10px] font-display tracking-widest text-ink-muted mb-1">
            {{ t('howToPlay', locale.current) }}
          </p>
          <p class="text-sm text-ink leading-relaxed">
            {{ game.i18n[locale.current].instructions }}
          </p>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="arcade-btn arcade-btn-amber"
          @click="startGame"
        >
          ▶ {{ t('pressStart', locale.current) }}
        </button>
        <a
          v-if="manual"
          :href="manual.pdfPath"
          target="_blank"
          rel="noopener"
          class="text-[10px] font-display tracking-widest text-ink-muted hover:text-ink underline-offset-4 hover:underline"
          @click="sfx.select()"
        >
          ⤓ {{ t('fromTheManual', locale.current) }} (PDF)
        </a>
      </div>
    </div>

    <!-- The game itself -->
    <component
      v-if="!showInstructions && GameComponent"
      :is="GameComponent"
    />
    <div
      v-else-if="!showInstructions && !GameComponent"
      class="rounded border border-danger/40 bg-danger/5 p-6 text-center"
    >
      <p class="danger-phosphor text-shadow-neon font-display text-sm">⚠ {{ t('gameOver', locale.current) }}</p>
      <p class="text-sm text-ink-muted mt-2">
        Game component missing for <code class="text-ink">{{ gameId }}</code>.
      </p>
    </div>
  </section>
</template>
