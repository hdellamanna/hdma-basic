<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const phase = ref<'menu' | 'encode' | 'decode' | 'result'>('menu')
const input = ref('')
const output = ref('')
const shift = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  phase.value = 'menu'
  input.value = ''
  output.value = ''
  log.value = []
}

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
}

function shift1(s: string, n: number) {
  return s.split('').map((c) => {
    if (c === ' ') return ' '
    const code = c.charCodeAt(0) + n
    if (code > 90) return String.fromCharCode(code - 26)
    if (code < 65) return String.fromCharCode(code + 26)
    return String.fromCharCode(code)
  }).join('')
}

function reverse(s: string) {
  return s.split('').reverse().join('')
}

function swapPairs(s: string) {
  let out = ''
  for (let i = 0; i < s.length; i += 2) {
    out += (s[i + 1] ?? '') + s[i]
  }
  return out
}

function encode() {
  const raw = norm(input.value)
  if (!raw) return
  shift.value = 1 + Math.floor(Math.random() * 25)
  let enc = shift1(raw, shift.value)
  enc = reverse(enc)
  enc = swapPairs(enc)
  // Prepend a letter indicating shift (A=1, B=2, ..., Y=25, Z=0)
  const shiftLetter = shift.value === 0 ? 'Z' : String.fromCharCode(64 + shift.value)
  output.value = shiftLetter + enc
  log.value.push(`✓ ${input.value} → ${output.value}`)
  sfx.powerup()
  phase.value = 'result'
}

function decode() {
  const raw = norm(input.value)
  if (!raw) return
  if (raw.length < 2) {
    sfx.error()
    return
  }
  const shiftLetter = raw[0]
  const shiftNum = shiftLetter === 'Z' ? 0 : shiftLetter.charCodeAt(0) - 64
  let dec = raw.substring(1)
  // Reverse swap
  dec = swapPairs(dec)
  // Reverse
  dec = reverse(dec)
  // Reverse shift
  dec = shift1(dec, 26 - shiftNum)
  output.value = dec
  log.value.push(`✓ ${input.value} → ${dec}`)
  sfx.powerup()
  phase.value = 'result'
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'MENSAGENS SECRETAS' : 'SECRET MESSAGES'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="phase === 'menu'" class="text-center py-6 space-y-3">
      <p class="text-ink-muted text-sm">
        {{ locale.current === 'pt-BR' ? 'Codifique ou decodifique mensagens' : 'Encode or decode messages' }}
      </p>
      <div class="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        <button class="arcade-btn arcade-btn-amber" @click="phase = 'encode'">1. {{ locale.current === 'pt-BR' ? 'CODIFICAR' : 'ENCODE' }}</button>
        <button class="arcade-btn arcade-btn-cyan" @click="phase = 'decode'">2. {{ locale.current === 'pt-BR' ? 'DECODIFICAR' : 'DECODE' }}</button>
      </div>
    </div>
    <div v-else class="space-y-3">
      <div class="flex items-center gap-2">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1 px-2" @click="start">◀ {{ locale.current === 'pt-BR' ? 'MENU' : 'MENU' }}</button>
        <span class="text-cyan text-xs">{{ phase === 'encode' ? (locale.current === 'pt-BR' ? 'CODIFICAR' : 'ENCODE') : (locale.current === 'pt-BR' ? 'DECODIFICAR' : 'DECODE') }}</span>
      </div>
      <form v-if="phase !== 'result'" class="space-y-2" @submit.prevent="phase === 'encode' ? encode() : decode()">
        <input
          v-model="input"
          :placeholder="phase === 'encode' ? (locale.current === 'pt-BR' ? 'Sua mensagem (A-Z)' : 'Your message (A-Z)') : (locale.current === 'pt-BR' ? 'Código para decodificar' : 'Code to decode')"
          class="w-full bg-void-deep border border-surface-600 px-2 py-2 text-amber outline-none focus:border-phosphor-green font-mono"
          autofocus
        />
        <button type="submit" class="arcade-btn arcade-btn-amber w-full">▶ {{ phase === 'encode' ? (locale.current === 'pt-BR' ? 'CODIFICAR' : 'ENCODE') : (locale.current === 'pt-BR' ? 'DECODIFICAR' : 'DECODE') }}</button>
      </form>
      <div v-if="phase === 'result'" class="space-y-2">
        <div class="border border-surface-600 bg-surface-800 p-3">
          <p class="text-ink-muted text-[9px] font-display tracking-widest mb-1">
            {{ output ? (locale.current === 'pt-BR' ? 'CÓDIGO' : 'CODE') : '' }}
          </p>
          <p class="text-amber font-mono text-sm break-all">{{ output }}</p>
        </div>
        <button class="arcade-btn-ghost border border-surface-600 w-full text-[10px] py-1.5" @click="phase = 'menu'; output = ''; input = ''">↺ {{ locale.current === 'pt-BR' ? 'OUTRA' : 'ANOTHER' }}</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-3)" :key="i" :class="i === log.slice(-3).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
    </div>
  </CrtFrame>
</template>
