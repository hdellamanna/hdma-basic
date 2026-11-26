<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { GAMES } from '../data/games'
import { MANUALS } from '../data/manuals'
import { pavilionSizes, pavilionSrcset } from '../data/pavilion'

const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
const cabinets = [
  {
    id: 'space-mines',
    x: 52.2,
    y: 61.8,
    title: ['Bolsa de Astron', 'Astron Exchange'],
    detail: [
      'Dez anos para governar uma colônia mineira em Astron.',
      'Ten years to govern a mining colony on Astron.',
    ],
  },
  {
    id: 'trip-into-the-future',
    x: 59.3,
    y: 60,
    title: ['Observatório do Tempo', 'Time Observatory'],
    detail: [
      'Dois relógios, uma nave e três viagens relativísticas.',
      'Two clocks, one ship and three relativistic voyages.',
    ],
  },
  {
    id: 'gustavus',
    x: 69.5,
    y: 58,
    title: ['O vitral de Gustavus', 'Gustavus’ stained glass'],
    detail: [
      'Ligue as pérolas do vitral sem fechar um triângulo da sua cor.',
      'Join the pearls without closing a triangle of your own colour.',
    ],
  },
  {
    id: 'courier',
    x: 82.4,
    y: 56.3,
    title: ['Correio Lunar', 'Lunar Courier'],
    detail: [
      'Entregue três cápsulas antes que a bateria do rover acabe.',
      'Deliver three capsules before the rover runs out of power.',
    ],
  },
] as const
const selected = ref(0)
const feature = computed(() => cabinets[selected.value])
const language = computed(() => (locale.isPt ? 0 : 1))
const query = ref('')
const searchInput = ref<HTMLInputElement>()
function clearSearch() {
  query.value = ''
  searchInput.value?.focus()
}
const manuals = MANUALS.filter((manual) => manual.pdfPath)
const count = (id: string) =>
  GAMES.filter((game) => game.manualId === id).length
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const index = GAMES.map((game) => {
  const manual = MANUALS.find((book) => book.id === game.manualId)!
  return {
    game,
    text: normalize(
      [
        game.id,
        game.i18n.en.title,
        game.i18n['pt-BR'].title,
        manual.i18n.en.title,
        manual.i18n['pt-BR'].title,
      ].join(' '),
    ),
  }
})
const matches = computed(() => {
  const terms = normalize(query.value).split(/\s+/)
  return index.filter((row) => terms.every((term) => row.text.includes(term)))
})
function selectCabinet(index: number) {
  selected.value = (index + cabinets.length) % cabinets.length
}
</script>

<template>
  <div class="floor">
    <section class="floor-stage" aria-labelledby="floor-title">
      <div class="floor-invitation">
        <h1 id="floor-title">
          {{ tr('Fliperama', 'Arcade') }}
          <em>2000</em>
        </h1>
        <p>
          {{
            tr(
              'Um salão de jogos em BASIC na Paris que imaginava o futuro. Escolha uma máquina e entre na partida.',
              'A BASIC arcade in the Paris that dreamed of the future. Choose a machine and step inside.',
            )
          }}
        </p>
        <div class="floor-doors">
          <a class="floor-ticket" href="#classicos">
            {{ tr('Jogar clássicos', 'Play classics') }}
            <span aria-hidden="true">↓</span>
          </a>
          <RouterLink to="/remasters">
            {{ tr('Explorar Remastered', 'Explore Remastered') }} ↗
          </RouterLink>
        </div>
      </div>
      <div class="floor-machine">
        <div class="floor-print">
          <picture>
            <source
              type="image/avif"
              :srcset="pavilionSrcset"
              :sizes="pavilionSizes"
            />
            <img
              src="/images/arcade-pavilion-640.webp"
              width="1152"
              height="768"
              fetchpriority="high"
              alt=""
            />
          </picture>
          <div
            :key="feature.id"
            class="crt-projection"
            aria-hidden="true"
            :style="{ '--x': feature.x + '%', '--y': feature.y + '%' }"
          >
            <svg viewBox="0 0 40 28">
              <g v-if="selected === 0">
                <path
                  d="M2 24H39 M2 21 9 17 16 21 M20 21V8l5-5 5 5v13 M20 9h10 M20 13h10"
                />
                <g class="rail-cart">
                  <path d="M3 13h10l-2 5H5z" />
                  <circle cx="6" cy="20" r="1" />
                  <circle cx="11" cy="20" r="1" />
                </g>
              </g>
              <g v-else-if="selected === 1">
                <circle cx="20" cy="14" r="11" />
                <path class="clock-pointer" d="M20 5v9l6 3" />
              </g>
              <g v-else-if="selected === 2">
                <path class="glass-trace" d="M5 14 12 3 31 22 33 4 8 24 5 14" />
              </g>
              <g v-else>
                <path d="M1 22h38 M5 20l6-4 5 3 M32 20V5l6 3-6 3" />
                <g class="rail-cart">
                  <rect x="8" y="10" width="10" height="5" />
                  <circle cx="10" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </g>
              </g>
            </svg>
          </div>
          <div
            class="cabinet-positions"
            role="group"
            :aria-label="tr('Escolher máquina', 'Choose a cabinet')"
          >
            <button
              v-for="(cab, i) in cabinets"
              :key="cab.id"
              :style="{ '--x': cab.x + '%', '--y': cab.y + '%' }"
              :aria-pressed="selected === i"
              :aria-label="i + 1 + ' · ' + cab.title[language]"
              @click="selectCabinet(i)"
            >
              <span>{{ i + 1 }}</span>
            </button>
          </div>
        </div>
        <div class="floor-console">
          <div class="floor-selection" aria-live="polite" aria-atomic="true">
            <div :key="feature.id">
              <h2>{{ feature.title[language] }}</h2>
              <p>{{ feature.detail[language] }}</p>
            </div>
          </div>
          <div class="floor-console-actions">
            <button
              :aria-label="tr('Máquina anterior', 'Previous machine')"
              @click="selectCabinet(selected - 1)"
            >
              ‹
            </button>
            <RouterLink
              class="floor-launch"
              :to="
                feature.id === 'courier'
                  ? { name: 'remastered' }
                  : { name: 'edition', params: { id: feature.id } }
              "
              :aria-label="tr('Jogar', 'Play') + ' ' + feature.title[language]"
            >
              {{ tr('Jogar', 'Play') }} ↗
            </RouterLink>
            <button
              :aria-label="tr('Próxima máquina', 'Next machine')"
              @click="selectCabinet(selected + 1)"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      id="classicos"
      class="floor-catalog"
      aria-labelledby="catalog-title"
    >
      <div class="catalog-heading">
        <div>
          <h2 id="catalog-title">
            {{ tr('Escolha seu jogo', 'Choose your game') }}
          </h2>
          <p>
            {{
              tr(
                '58 jogos em oito manuais, com edições clássicas e remasterizadas.',
                '58 games from eight manuals, in classic and remastered editions.',
              )
            }}
          </p>
        </div>
        <label class="floor-search">
          <span>
            {{ tr('Buscar jogo ou manual', 'Find a game or manual') }}
          </span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            :placeholder="tr('Ex.: Moonlander', 'e.g. Moonlander')"
          />
        </label>
      </div>
      <template v-if="query.trim()">
        <p class="floor-result-count" role="status">
          {{ matches.length }} {{ tr('resultados', 'results') }}
        </p>
        <ul class="floor-results">
          <li v-for="{ game } in matches" :key="game.id">
            <strong>{{ game.i18n[locale.current].title }}</strong>
            <div>
              <RouterLink
                :to="{
                  name: 'play',
                  params: { gameId: game.id, manualId: game.manualId },
                }"
                :aria-label="
                  tr('Clássico', 'Classic') +
                  ' · ' +
                  game.i18n[locale.current].title
                "
              >
                {{ tr('Clássico', 'Classic') }}
              </RouterLink>
              <RouterLink
                :to="{ name: 'edition', params: { id: game.id } }"
                :aria-label="'Remastered · ' + game.i18n[locale.current].title"
              >
                Remastered
              </RouterLink>
            </div>
          </li>
        </ul>
        <button class="clear-search" @click="clearSearch">
          {{ tr('Limpar busca', 'Clear search') }}
        </button>
      </template>
      <ul v-else class="floor-books">
        <li v-for="manual in manuals" :key="manual.id">
          <RouterLink :to="{ name: 'manual', params: { id: manual.id } }">
            <img
              :src="'/images/floor/books/' + manual.id + '.webp'"
              width="128"
              height="128"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div>
              <span>
                {{ manual.year }} · {{ count(manual.id) }}
                {{
                  count(manual.id) === 1
                    ? tr('jogo', 'game')
                    : tr('jogos', 'games')
                }}
              </span>
              <h3>{{ manual.i18n[locale.current].title }}</h3>
            </div>
            <b aria-hidden="true">↗</b>
          </RouterLink>
        </li>
      </ul>
    </section>

    <nav
      class="floor-extras"
      :aria-label="tr('Oficinas e recursos', 'Workshops and resources')"
    >
      <RouterLink to="/play/apple-logo/apple-logo">
        <strong>{{ tr('Oficina de Logo', 'Logo workshop') }}</strong>
        <span>
          {{ tr('Programe com a tartaruga', 'Draw with the turtle') }} ↗
        </span>
      </RouterLink>
      <RouterLink to="/remastered">
        <strong>{{ tr('Correio Lunar', 'Lunar Courier') }}</strong>
        <span>
          {{ tr('Jogue e baixe o BASIC', 'Play and download the BASIC') }} ↗
        </span>
      </RouterLink>
      <RouterLink to="/downloads">
        <strong>{{ tr('Biblioteca de manuais', 'Manual library') }}</strong>
        <span>
          {{ tr('Consulte os oito PDFs', 'Browse all eight PDFs') }} ↗
        </span>
      </RouterLink>
    </nav>
  </div>
</template>
<style scoped src="./arcade-floor.css"></style>
