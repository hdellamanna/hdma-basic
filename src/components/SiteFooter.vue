<script setup lang="ts">
import { useLocaleStore } from '../stores/locale'
import { t } from '../i18n/strings'

const locale = useLocaleStore()
</script>

<template>
  <footer class="relative z-10 mt-8 border-t border-surface-700 bg-void-deep/80 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[10px] sm:text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
      <p class="leading-snug">{{ t('copyright', locale.current) }}</p>
      <p class="font-display tracking-widest text-phosphor-green/80">{{ t('builtWith', locale.current) }}</p>
    </div>
  </footer>
</template>
