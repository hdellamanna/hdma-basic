<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { useArcadeStore } from '../stores/arcade'
import { t } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'

const locale = useLocaleStore()
const arcade = useArcadeStore()
const { sfx } = useAudio()
</script>

<template>
  <section class="relative mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
    <RouterLink
      to="/"
      class="arcade-btn arcade-btn-ghost text-[10px] sm:text-xs mb-4"
      @click="sfx.select()"
    >
      ◀ {{ t('backToFloor', locale.current) }}
    </RouterLink>

    <h1 class="font-display text-xl sm:text-3xl phosphor text-shadow-neon mb-4">
      ? {{ t('history', locale.current) }}
    </h1>

    <article class="prose-custom space-y-4 text-sm leading-relaxed text-ink">
      <p v-if="locale.current === 'pt-BR'">
        <strong class="phosphor">HDMA MLogo Era</strong> é um arcade virtual com
        <strong>{{ arcade.totalGames }} jogos</strong> reconstruídos em JavaScript a partir
        de <strong>{{ arcade.totalManuals }} manuais clássicos da Usborne Publishing</strong>
        ({{ arcade.yearSpan }}), incluindo as edições brasileiras da Editora Lutécia.
        Tudo jogável no navegador, em PT-BR e EN.
      </p>
      <p v-else>
        <strong class="phosphor">HDMA MLogo Era</strong> is a virtual arcade with
        <strong>{{ arcade.totalGames }} games</strong> rebuilt in JavaScript from
        <strong>{{ arcade.totalManuals }} classic Usborne Publishing manuals</strong>
        ({{ arcade.yearSpan }}), including the Brazilian editions by Editora Lutécia.
        All playable in the browser, in PT-BR and EN.
      </p>

      <p v-if="locale.current === 'pt-BR'">
        Os manuais Usborne ensinaram uma geração inteira a programar BASIC em micros como
        ZX81, BBC Micro, ZX Spectrum, TRS-80, MSX, VIC-20 e Apple II. Cada programa
        era escrito em uma variante de BASIC, com conversões marcadas por símbolos
        (<code>●</code> Apple, <code>◆</code> BBC, <code>§</code> Spectrum, <code>■</code> TRS-80, <code>▲</code> C64).
        Aqui, todos eles ganham uma vida nova em canvas, com sons 8-bit e controles modernos.
      </p>
      <p v-else>
        The Usborne manuals taught a whole generation to program BASIC on micros like the
        ZX81, BBC Micro, ZX Spectrum, TRS-80, MSX, VIC-20 and Apple II. Each program was
        written in a BASIC dialect, with conversions marked by symbols
        (<code>●</code> Apple, <code>◆</code> BBC, <code>§</code> Spectrum, <code>■</code> TRS-80, <code>▲</code> C64).
        Here, they all get a new life on canvas, with 8-bit sounds and modern controls.
      </p>

      <h2 class="font-display text-sm text-amber mt-6">
        {{ locale.current === 'pt-BR' ? 'O que está aqui' : 'What is here' }}
      </h2>
      <ul class="list-none space-y-1 text-sm">
        <li v-if="locale.current === 'pt-BR'">
          <strong class="phosphor">{{ arcade.totalGames }} jogos</strong> — todos reconstruídos, todos jogáveis.
        </li>
        <li v-else>
          <strong class="phosphor">{{ arcade.totalGames }} games</strong> — all reconstructed, all playable.
        </li>
        <li v-if="locale.current === 'pt-BR'">
          <strong class="phosphor">{{ arcade.totalManuals }} manuais</strong> disponíveis para download (PDF).
        </li>
        <li v-else>
          <strong class="phosphor">{{ arcade.totalManuals }} manuals</strong> available for download (PDF).
        </li>
        <li v-if="locale.current === 'pt-BR'">
          <strong class="phosphor">i18n completo</strong> PT-BR + EN, com troca instantânea.
        </li>
        <li v-else>
          <strong class="phosphor">Full i18n</strong> PT-BR + EN, instant toggle.
        </li>
        <li v-if="locale.current === 'pt-BR'">
          <strong class="phosphor">Sons 8-bit</strong> gerados em tempo real com Web Audio.
        </li>
        <li v-else>
          <strong class="phosphor">8-bit sounds</strong> generated in real time with Web Audio.
        </li>
        <li v-if="locale.current === 'pt-BR'">
          <strong class="phosphor">CRT + scanlines</strong> para nostalgia autêntica.
        </li>
        <li v-else>
          <strong class="phosphor">CRT + scanlines</strong> for authentic nostalgia.
        </li>
      </ul>

      <h2 class="font-display text-sm text-amber mt-6">
        {{ locale.current === 'pt-BR' ? 'Stack' : 'Stack' }}
      </h2>
      <p v-if="locale.current === 'pt-BR'">
        Vue 3 + TypeScript + Vite + Pinia + Tailwind. Sem dependências de UI prontas —
        tudo é desenhado à mão, do scanline ao phosphor glow.
      </p>
      <p v-else>
        Vue 3 + TypeScript + Vite + Pinia + Tailwind. No pre-built UI dependencies —
        everything is hand-drawn, from the scanline to the phosphor glow.
      </p>

      <h2 class="font-display text-sm text-amber mt-6">
        {{ locale.current === 'pt-BR' ? 'Créditos' : 'Credits' }}
      </h2>
      <p v-if="locale.current === 'pt-BR'">
        Construído por <strong class="phosphor">Henrique Della Manna</strong> com o agente
        Mavis, do MiniMax Code. Manuais originais são de Usborne Publishing (Reino Unido)
        e Editora Lutécia (Brasil).
      </p>
      <p v-else>
        Built by <strong class="phosphor">Henrique Della Manna</strong> with the Mavis
        agent, from MiniMax Code. Original manuals are from Usborne Publishing (UK)
        and Editora Lutécia (Brazil).
      </p>

      <p class="pt-4">
        <a
          href="https://github.com/hdellamanna"
          target="_blank"
          rel="noopener"
          class="arcade-btn arcade-btn-cyan text-[10px]"
        >
          ↗ {{ t('repoLink', locale.current) }}
        </a>
      </p>
    </article>
  </section>
</template>

<style scoped>
.prose-custom code {
  @apply bg-surface-700 px-1 py-0.5 text-amber text-[11px];
}
</style>
