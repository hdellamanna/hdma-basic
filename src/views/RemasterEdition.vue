<script setup lang="ts">
import ManualPage from '../components/ManualPage.vue'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { GAMES } from '../data/games'
import { missions } from '../remasters/catalog'
import { classicGames } from '../games/loaders'
import { useLocaleStore } from '../stores/locale'
const route = useRoute(),
  locale = useLocaleStore()
const game = GAMES.find((g) => g.id === route.params.id)!
const mission = missions[game.id]
const engines = {
  flight: () => import('../remasters/FlightGame.vue'),
  expedition: () => import('../remasters/ExpeditionGame.vue'),
  console: () => import('../remasters/ConsoleGame.vue'),
  table: classicGames[game.id],
}
const specials = {
  gustavus: defineAsyncComponent(
    () => import('../remasters/GustavusGlass.vue'),
  ),
  'space-mines': defineAsyncComponent(
    () => import('../remasters/AstronExchange.vue'),
  ),
  'trip-into-the-future': defineAsyncComponent(
    () => import('../remasters/TimeObservatory.vue'),
  ),
}
const titles: Record<string, [string, string, string, string]> = {
  gustavus: ['O vitral', 'The stained glass', 'Quadrados', 'Dots and boxes'],
  'space-mines': [
    'Bolsa de Astron',
    'Astron Exchange',
    'Desarme orbital',
    'Orbital disposal',
  ],
  'trip-into-the-future': [
    'Observatório do Tempo',
    'Time Observatory',
    'Sequência de portais',
    'Portal sequence',
  ],
}
const special = specials[game.id as keyof typeof specials]
const showSpecial = ref(Boolean(special))
const Cabinet = defineAsyncComponent(engines[mission.kind])
const rule = computed(() => mission.rule[locale.isPt ? 0 : 1])
</script>
<template>
  <section class="edition">
    <nav>
      <RouterLink to="/remasters">
        ← {{ locale.isPt ? 'Salão Remastered' : 'Remastered Hall' }}
      </RouterLink>
      <RouterLink
        :to="{
          name: 'play',
          params: { manualId: game.manualId, gameId: game.id },
        }"
      >
        {{ locale.isPt ? 'Edição clássica' : 'Classic edition' }} ↗
      </RouterLink>
    </nav>
    <header class="edition-heading">
      <img
        :src="'/images/salons/' + game.manualId + '.webp'"
        width="300"
        height="300"
        alt=""
      />
      <div>
        <h1>{{ game.i18n[locale.current].title }}</h1>
        <p v-if="!showSpecial">{{ rule }}</p>
      </div>
    </header>
    <div v-if="special" class="mission-picker">
      <button :aria-pressed="showSpecial" @click="showSpecial = true">
        {{ titles[game.id][locale.isPt ? 0 : 1] }}
      </button>
      <button :aria-pressed="!showSpecial" @click="showSpecial = false">
        {{ titles[game.id][locale.isPt ? 2 : 3] }}
      </button>
    </div>
    <component v-if="showSpecial" :is="special" />
    <Cabinet v-else :id="game.id" :remastered="true" />
    <RouterLink
      v-if="game.id === 'moonlander'"
      class="edition-link"
      to="/remastered"
    >
      {{
        locale.isPt
          ? 'Missão extra · Correio Lunar'
          : 'Bonus mission · Lunar Courier'
      }}
    </RouterLink>
    <ManualPage v-if="game" :game="game" />
  </section>
</template>
