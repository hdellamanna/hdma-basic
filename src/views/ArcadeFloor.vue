<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import ManualCover from '../components/ManualCover.vue'

const locale = useLocaleStore()
const arcade = useArcadeStore()
const manuals = computed(() => arcade.manuals.filter((manual) => manual.pdfPath))
const counts = computed(() => {
  const totals = new Map<string, number>()
  for (const game of arcade.games) totals.set(game.manualId, (totals.get(game.manualId) ?? 0) + 1)
  return totals
})
function gameCount(manualId: string) {
  const count = counts.value.get(manualId) ?? 0
  if (locale.isPt) return `${count} ${count === 1 ? 'jogo' : 'jogos'}`
  return `${count} ${count === 1 ? 'game' : 'games'}`
}
const logo = computed(() => arcade.manuals.find((manual) => manual.id === 'apple-logo'))
</script>

<template>
  <div class="arcade-floor">
    <section class="pavilion" aria-labelledby="pavilion-title">
      <div class="pavilion-copy">
        <h1 id="pavilion-title">{{ locale.isPt ? 'Fliperama' : 'Arcade' }} <em>2000</em></h1>
        <p>{{ locale.isPt
          ? 'Paris da Belle Époque imaginou o futuro. Aqui, ele chegou em fósforo verde e fichas de fliperama.'
          : 'Belle Époque Paris imagined the future. Here it arrived in green phosphor and arcade tokens.' }}</p>
        <div class="pavilion-actions">
          <a class="pavilion-button" href="#classicos">{{ locale.isPt ? 'Jogar clássicos' : 'Play classics' }}</a>
          <RouterLink class="pavilion-link" :to="{ name: 'collection' }">
            {{ locale.isPt ? 'Explorar Remastered' : 'Explore Remastered' }}
            <span aria-hidden="true">↗</span>
          </RouterLink>
        </div>
      </div>
      <img class="pavilion-image" src="/images/arcade-pavilion.webp" srcset="/images/arcade-pavilion-640.webp 640w, /images/arcade-pavilion.webp 1152w"
        sizes="(max-width: 660px) calc(100vw - 2.6rem), (max-width: 1360px) 48vw, 680px"
        width="1152" height="768"
        alt="" fetchpriority="high">
    </section>

    <section id="classicos" class="classic-gallery" aria-labelledby="classics-title">
      <header class="gallery-heading">
        <h2 id="classics-title">{{ locale.isPt ? 'Salão dos clássicos' : 'Hall of classics' }}</h2>
        <p>{{ arcade.totalGames - (counts.get('apple-logo') ?? 0) }} {{ locale.isPt ? 'jogos em' : 'games from' }}
          {{ manuals.length }} {{ locale.isPt ? 'manuais' : 'manuals' }}</p>
      </header>
      <ul class="gallery-list">
        <li v-for="manual in manuals" :key="manual.id">
          <RouterLink class="gallery-entry" :to="{ name: 'manual', params: { id: manual.id } }">
            <div class="gallery-cover" aria-hidden="true"><ManualCover :manual="manual" /></div>
            <div class="gallery-item-copy">
              <p>{{ manual.year }} · {{ manual.publisher }}</p>
              <h3>{{ manual.i18n[locale.current].title }}</h3>
              <span>{{ gameCount(manual.id) }}</span>
            </div>
            <span class="gallery-arrow" aria-hidden="true">↗</span>
          </RouterLink>
        </li>
      </ul>
      <RouterLink v-if="logo" class="logo-workshop" :to="{ name: 'manual', params: { id: logo.id } }">
        <span>{{ locale.isPt ? 'Oficina de Logo' : 'Logo workshop' }}</span>
        <span>{{ locale.isPt ? 'Programe e desenhe com a tartaruga.' : 'Program and draw with the turtle.' }}</span>
        <span aria-hidden="true">↗</span>
      </RouterLink>
    </section>
  </div>
</template>
