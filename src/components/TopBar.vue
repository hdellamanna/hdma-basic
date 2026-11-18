<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { t, LOCALE_LABELS } from '../i18n/strings'
import { useAudio } from '../composables/useAudio'

const locale = useLocaleStore()
const { muted, toggleMute } = useAudio()
</script>

<template>
  <nav class="arcade-navigation" :aria-label="locale.isPt ? 'Navegação principal' : 'Main navigation'">
    <RouterLink to="/" class="arcade-wordmark">
      <span aria-hidden="true" class="arcade-mark"></span>
      HDMA BASIC
    </RouterLink>
    <div class="arcade-nav-links">
      <RouterLink to="/downloads">{{ locale.isPt ? 'Manuais' : 'Manuals' }}</RouterLink>
      <RouterLink to="/about">{{ locale.isPt ? 'História' : 'History' }}</RouterLink>
    </div>
    <div class="arcade-settings">
      <button type="button" :aria-pressed="muted" :aria-label="locale.isPt ? 'Silenciar som' : 'Mute sound'" @click="toggleMute">
        {{ locale.isPt ? (muted ? 'Som: desligado' : 'Som: ligado') : (muted ? 'Sound: off' : 'Sound: on') }}
      </button>
      <div class="arcade-languages" role="group" :aria-label="t('language', locale.current)">
        <button v-for="language in (['pt-BR', 'en'] as const)" :key="language" type="button"
          :lang="language" :aria-pressed="locale.current === language" @click="locale.set(language)">
          {{ LOCALE_LABELS[language] }}
        </button>
      </div>
    </div>
  </nav>
</template>
