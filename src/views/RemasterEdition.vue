<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
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
        <p>{{ rule }}</p>
      </div>
    </header>
    <Cabinet :id="game.id" :remastered="true" />
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
  </section>
</template>
