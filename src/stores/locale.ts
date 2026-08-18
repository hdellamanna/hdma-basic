import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Locale } from '../types'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/strings'

const STORAGE_KEY = 'hdma-mlogo-era:locale'

function loadInitial(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (SUPPORTED_LOCALES as string[]).includes(stored)) {
      return stored as Locale
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE
}

export const useLocaleStore = defineStore('locale', () => {
  const current = ref<Locale>(loadInitial())

  const isPt = computed(() => current.value === 'pt-BR')
  const isEn = computed(() => current.value === 'en')

  function set(locale: Locale) {
    current.value = locale
  }

  function toggle() {
    set(current.value === 'pt-BR' ? 'en' : 'pt-BR')
  }

  watch(current, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, val)
    } catch {
      // ignore
    }
    document.documentElement.lang = val
  }, { immediate: true })

  return { current, isPt, isEn, set, toggle }
})
