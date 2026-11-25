<script setup lang="ts">
import { computed, ref } from 'vue'
import { GAMES } from '../data/games'
import { MANUALS } from '../data/manuals'
import { useLocaleStore } from '../stores/locale'
const locale = useLocaleStore(),
  search = ref('')
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const groups = computed(() =>
  MANUALS.map((manual) => ({
    manual,
    games: GAMES.filter(
      (game) =>
        game.manualId === manual.id &&
        normalize(
          game.i18n[locale.current].title +
            ' ' +
            manual.i18n[locale.current].title,
        ).includes(normalize(search.value.trim())),
    ),
  })).filter((group) => group.games.length),
)
</script>
<template>
  <section class="collection">
    <header class="collection-head">
      <h1>{{ locale.isPt ? 'Salão Remastered' : 'Remastered Hall' }}</h1>
      <input
        v-model="search"
        type="search"
        :aria-label="
          locale.isPt ? 'Buscar jogo ou manual' : 'Find game or manual'
        "
        :placeholder="
          locale.isPt ? 'Buscar jogo ou manual…' : 'Find game or manual…'
        "
      />
    </header>
    <div
      v-for="{ manual, games } in groups"
      :key="manual.id"
      class="collection-group"
    >
      <div class="shelf-heading">
        <div class="shelf-cover" aria-hidden="true">
          <img
            :src="'/images/salons/' + manual.id + '.webp'"
            width="300"
            height="300"
            alt=""
            loading="lazy"
          />
        </div>
        <h2>{{ manual.i18n[locale.current].title }}</h2>
      </div>
      <ul>
        <li v-for="game in games" :key="game.id">
          <RouterLink :to="{ name: 'edition', params: { id: game.id } }">
            {{ game.i18n[locale.current].title }}
            <span aria-hidden="true">↗</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    <p v-if="!groups.length">
      {{ locale.isPt ? 'Nenhum jogo encontrado.' : 'No games found.' }}
    </p>
    <RouterLink class="edition-link" to="/remastered">
      {{
        locale.isPt
          ? 'Jogo extra · Correio Lunar'
          : 'Bonus game · Lunar Courier'
      }}
    </RouterLink>
  </section>
</template>
