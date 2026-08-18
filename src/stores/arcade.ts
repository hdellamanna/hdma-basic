import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocaleStore } from './locale'
import { MANUALS } from '../data/manuals'
import { GAMES } from '../data/games'

export const useArcadeStore = defineStore('arcade', () => {
  const localeStore = useLocaleStore()

  const selectedManualId = ref<string | null>(null)
  const selectedGameId = ref<string | null>(null)
  /** Coin counter for the cabinet UI flair */
  const coins = ref(0)
  /** True when the user has paid (used) a coin to start a game */
  const hasCoin = ref(false)
  /** Persistent scoreboard per game id */
  const highScores = ref<Record<string, number>>({})

  const manuals = computed(() => MANUALS)
  const games = computed(() => GAMES)
  const totalGames = computed(() => GAMES.length)
  const totalManuals = computed(() => MANUALS.length)
  const yearSpan = computed(() => {
    const years = MANUALS.map((m) => m.year)
    return `${Math.min(...years)}–${Math.max(...years)}`
  })

  const selectedManual = computed(() =>
    selectedManualId.value ? MANUALS.find((m) => m.id === selectedManualId.value) ?? null : null
  )

  const selectedGame = computed(() =>
    selectedGameId.value ? GAMES.find((g) => g.id === selectedGameId.value) ?? null : null
  )

  const gamesForSelectedManual = computed(() => {
    if (!selectedManualId.value) return []
    return GAMES.filter((g) => g.manualId === selectedManualId.value)
  })

  function selectManual(id: string | null) {
    selectedManualId.value = id
    selectedGameId.value = null
  }

  function selectGame(id: string | null) {
    selectedGameId.value = id
  }

  function backToFloor() {
    selectedGameId.value = null
    selectedManualId.value = null
  }

  function backToManual() {
    selectedGameId.value = null
  }

  function insertCoin() {
    coins.value++
    hasCoin.value = true
  }

  function consumeCoin() {
    if (coins.value > 0) coins.value--
  }

  function setHighScore(gameId: string, score: number) {
    const prev = highScores.value[gameId] ?? 0
    if (score > prev) highScores.value[gameId] = score
  }

  function getHighScore(gameId: string): number {
    return highScores.value[gameId] ?? 0
  }

  return {
    selectedManualId,
    selectedGameId,
    coins,
    hasCoin,
    highScores,
    manuals,
    games,
    totalGames,
    totalManuals,
    yearSpan,
    selectedManual,
    selectedGame,
    gamesForSelectedManual,
    selectManual,
    selectGame,
    backToFloor,
    backToManual,
    insertCoin,
    consumeCoin,
    setHighScore,
    getHighScore,
    locale: computed(() => localeStore.current),
  }
})
