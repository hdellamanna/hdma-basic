<script setup lang="ts">
import { computed } from 'vue'
import type { Manual } from '../types'

const props = defineProps<{
  manual: Manual
  /** When true, render a more detailed / "screen" version */
  detailed?: boolean
}>()

/** Each manual gets a unique illustration. We render in pure SVG so it scales crisply. */
const palette = computed(() => {
  switch (props.manual.accent) {
    case 'amber': return { primary: '#ffb000', secondary: '#ffd966', dim: '#7a5400' }
    case 'green': return { primary: '#39ff14', secondary: '#7fff5c', dim: '#1f7a0a' }
    case 'magenta': return { primary: '#ff00ff', secondary: '#ff7fff', dim: '#7a007a' }
    case 'cyan': return { primary: '#00f0ff', secondary: '#7afaff', dim: '#007a7a' }
    case 'red': return { primary: '#ff5050', secondary: '#ff9090', dim: '#7a1f1f' }
    case 'blue': return { primary: '#5c8cff', secondary: '#a3baff', dim: '#1f3a7a' }
    case 'yellow': return { primary: '#fff066', secondary: '#ffffa3', dim: '#7a7a1f' }
  }
})
</script>

<template>
  <!-- HAUNTED HOUSE — Adventure 1983 -->
  <svg
    v-if="manual.id === 'adventure-1983'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="hh-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a0a2e" />
        <stop offset="1" stop-color="#0a0010" />
      </linearGradient>
      <filter id="hh-glow">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
    <rect width="200" height="280" fill="url(#hh-bg)" />
    <!-- moon -->
    <circle cx="160" cy="48" r="22" :fill="palette.secondary" />
    <circle cx="155" cy="44" r="3" fill="#0a0010" />
    <circle cx="166" cy="52" r="2" fill="#0a0010" />
    <!-- house -->
    <polygon points="50,140 100,80 150,140" :fill="palette.dim" />
    <rect x="60" y="140" width="80" height="80" :fill="palette.dim" />
    <!-- door -->
    <rect x="90" y="170" width="20" height="50" :fill="palette.primary" />
    <circle cx="105" cy="195" r="1.5" :fill="palette.dim" />
    <!-- windows (lit) -->
    <rect x="68" y="155" width="14" height="14" :fill="palette.primary" opacity="0.85" />
    <rect x="118" y="155" width="14" height="14" :fill="palette.primary" opacity="0.85" />
    <!-- chimney -->
    <rect x="125" y="95" width="12" height="20" :fill="palette.dim" />
    <!-- bats -->
    <path d="M 30 100 q 4 -4 8 0 q 4 -4 8 0" stroke="#fff" stroke-width="1.2" fill="none" />
    <path d="M 25 130 q 3 -3 6 0 q 3 -3 6 0" stroke="#fff" stroke-width="0.8" fill="none" />
    <!-- ground -->
    <line x1="0" y1="220" x2="200" y2="220" :stroke="palette.primary" stroke-width="1" />
    <rect x="0" y="220" width="200" height="60" fill="#000" />
    <!-- graves -->
    <g :fill="palette.dim">
      <ellipse cx="30" cy="230" rx="8" ry="3" />
      <rect x="22" y="230" width="16" height="14" rx="2" />
      <ellipse cx="170" cy="232" rx="8" ry="3" />
      <rect x="162" y="232" width="16" height="12" rx="2" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="11"
      :fill="palette.primary"
      style="letter-spacing: 0.5px;"
    >HAUNTED</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="11"
      :fill="palette.primary"
      style="letter-spacing: 0.5px;"
    >HOUSE</text>
  </svg>

  <!-- SPACE GAMES — 1982 -->
  <svg
    v-else-if="manual.id === 'space-1982'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000018" />
        <stop offset="1" stop-color="#000000" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#sp-bg)" />
    <!-- stars -->
    <g fill="#fff">
      <circle cx="20" cy="30" r="0.6" /><circle cx="50" cy="20" r="0.4" /><circle cx="80" cy="50" r="0.6" />
      <circle cx="120" cy="30" r="0.5" /><circle cx="170" cy="60" r="0.6" /><circle cx="40" cy="80" r="0.4" />
      <circle cx="190" cy="100" r="0.6" /><circle cx="15" cy="130" r="0.4" /><circle cx="60" cy="160" r="0.5" />
    </g>
    <!-- planet (Saturn) -->
    <ellipse cx="60" cy="200" rx="55" ry="14" fill="none" :stroke="palette.secondary" stroke-width="1.4" opacity="0.8" />
    <circle cx="60" cy="200" r="26" :fill="palette.primary" />
    <ellipse cx="60" cy="200" rx="30" ry="6" fill="none" :stroke="palette.primary" stroke-width="1.4" />
    <circle cx="50" cy="195" r="3" :fill="palette.dim" />
    <circle cx="65" cy="203" r="2" :fill="palette.dim" />
    <!-- rocket -->
    <g transform="translate(140, 90) rotate(35)">
      <polygon points="0,0 -20,30 0,25 20,30" :fill="palette.primary" />
      <rect x="-6" y="-18" width="12" height="22" rx="2" :fill="palette.secondary" />
      <polygon points="0,-18 -6,-6 6,-6" :fill="palette.primary" />
      <circle cx="0" cy="-3" r="2" :fill="palette.dim" />
      <!-- flame -->
      <polygon points="-5,12 0,28 5,12" :fill="palette.primary" opacity="0.9" />
    </g>
    <!-- alien -->
    <g transform="translate(35, 110)" :fill="palette.primary">
      <ellipse cx="0" cy="0" rx="14" ry="8" />
      <circle cx="-5" cy="-2" r="3" fill="#000" />
      <circle cx="5" cy="-2" r="3" fill="#000" />
      <line x1="-7" y1="4" x2="-3" y2="6" stroke="#000" stroke-width="1.2" />
      <line x1="-2" y1="5" x2="2" y2="5" stroke="#000" stroke-width="1.2" />
      <line x1="3" y1="6" x2="7" y2="4" stroke="#000" stroke-width="1.2" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >SPACE</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >GAMES</text>
  </svg>

  <!-- FANTASY (Dungeon of Doom) 1983 -->
  <svg
    v-else-if="manual.id === 'fantasy-1983'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="fn-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a0030" />
        <stop offset="1" stop-color="#0a0014" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#fn-bg)" />
    <!-- castle silhouette -->
    <g :fill="palette.dim">
      <rect x="40" y="100" width="120" height="140" />
      <rect x="35" y="90" width="14" height="30" />
      <rect x="151" y="90" width="14" height="30" />
      <rect x="65" y="70" width="20" height="30" />
      <rect x="115" y="70" width="20" height="30" />
    </g>
    <!-- door -->
    <rect x="90" y="180" width="20" height="60" :fill="palette.primary" />
    <path d="M 100 180 a 10 10 0 0 1 10 10 v 20 h -20 v -20 a 10 10 0 0 1 10 -10 z" :fill="palette.dim" />
    <!-- windows -->
    <rect x="55" y="140" width="12" height="14" :fill="palette.primary" />
    <rect x="133" y="140" width="12" height="14" :fill="palette.primary" />
    <!-- moon -->
    <circle cx="160" cy="50" r="20" :fill="palette.secondary" />
    <!-- dragon -->
    <g transform="translate(30, 220)" :fill="palette.primary">
      <path d="M 0 0 q 8 -10 18 -6 q 4 -4 8 0 q 6 -2 6 4 q 4 0 4 4 q -2 2 -6 2 q 0 4 -6 4 q -2 4 -8 2 q -4 4 -10 0 q -6 0 -6 -10 z" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >DUNGEON</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >OF DOOM</text>
  </svg>

  <!-- BATTLE GAMES 1982 -->
  <svg
    v-else-if="manual.id === 'battle-1982'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="bt-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a0008" />
        <stop offset="1" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#bt-bg)" />
    <!-- crosshair -->
    <g :stroke="palette.primary" stroke-width="1.4" fill="none">
      <circle cx="100" cy="120" r="48" />
      <line x1="100" y1="64" x2="100" y2="80" />
      <line x1="100" y1="160" x2="100" y2="176" />
      <line x1="44" y1="120" x2="60" y2="120" />
      <line x1="140" y1="120" x2="156" y2="120" />
    </g>
    <!-- tank -->
    <g transform="translate(60, 180)">
      <rect x="0" y="20" width="80" height="22" :fill="palette.primary" />
      <rect x="20" y="6" width="40" height="18" :fill="palette.primary" />
      <line x1="60" y1="6" x2="92" y2="-4" :stroke="palette.primary" stroke-width="3" />
      <circle cx="6" cy="44" r="5" :fill="palette.dim" />
      <circle cx="22" cy="44" r="5" :fill="palette.dim" />
      <circle cx="58" cy="44" r="5" :fill="palette.dim" />
      <circle cx="74" cy="44" r="5" :fill="palette.dim" />
    </g>
    <!-- explosions -->
    <g :fill="palette.secondary">
      <circle cx="155" cy="50" r="4" />
      <circle cx="160" cy="48" r="2" />
      <circle cx="148" cy="48" r="2" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >BATTLE</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >GAMES</text>
  </svg>

  <!-- WEIRD COMPUTER GAMES 1984 -->
  <svg
    v-else-if="manual.id === 'weird-1984'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="wd-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#00141a" />
        <stop offset="1" stop-color="#000408" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#wd-bg)" />
    <!-- tower -->
    <rect x="80" y="60" width="40" height="180" :fill="palette.dim" />
    <polygon points="100,40 70,60 130,60" :fill="palette.primary" />
    <!-- windows -->
    <g :fill="palette.primary">
      <rect x="86" y="80" width="8" height="10" />
      <rect x="106" y="80" width="8" height="10" />
      <rect x="86" y="100" width="8" height="10" />
      <rect x="106" y="100" width="8" height="10" />
      <rect x="86" y="120" width="8" height="10" />
      <rect x="106" y="120" width="8" height="10" />
      <rect x="86" y="140" width="8" height="10" />
      <rect x="106" y="140" width="8" height="10" />
      <rect x="86" y="160" width="8" height="10" />
      <rect x="106" y="160" width="8" height="10" />
      <rect x="86" y="180" width="8" height="10" />
      <rect x="106" y="180" width="8" height="10" />
    </g>
    <!-- witch on broom -->
    <g transform="translate(40, 110)">
      <line x1="-2" y1="0" x2="20" y2="0" :stroke="palette.primary" stroke-width="2" />
      <circle cx="10" cy="-4" r="3" :fill="palette.secondary" />
      <polygon points="6,-8 14,-8 10,-15" :fill="palette.dim" />
    </g>
    <!-- moon -->
    <circle cx="40" cy="50" r="16" :fill="palette.secondary" />
    <circle cx="36" cy="48" r="3" fill="#00141a" />
    <!-- spiderweb corner -->
    <g :stroke="palette.secondary" stroke-width="0.6" fill="none" opacity="0.6">
      <line x1="170" y1="0" x2="200" y2="30" />
      <line x1="200" y1="0" x2="170" y2="30" />
      <line x1="170" y1="0" x2="200" y2="0" />
      <line x1="200" y1="0" x2="200" y2="30" />
      <line x1="170" y1="0" x2="170" y2="30" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="8"
      :fill="palette.primary"
    >WEIRD</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="8"
      :fill="palette.primary"
    >GAMES</text>
  </svg>

  <!-- HORROR (PT-BR) 1983 -->
  <svg
    v-else-if="manual.id === 'horror-pt'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="hr-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a001a" />
        <stop offset="1" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#hr-bg)" />
    <!-- skull -->
    <g transform="translate(100, 120)">
      <ellipse cx="0" cy="0" rx="40" ry="44" :fill="palette.primary" />
      <rect x="-30" y="22" width="60" height="22" :fill="palette.primary" />
      <line x1="-30" y1="28" x2="30" y2="28" :stroke="palette.dim" stroke-width="0.8" />
      <line x1="-30" y1="34" x2="30" y2="34" :stroke="palette.dim" stroke-width="0.8" />
      <line x1="-30" y1="40" x2="30" y2="40" :stroke="palette.dim" stroke-width="0.8" />
      <!-- eye sockets -->
      <circle cx="-14" cy="-8" r="9" :fill="palette.dim" />
      <circle cx="14" cy="-8" r="9" :fill="palette.dim" />
      <circle cx="-14" cy="-8" r="2" :fill="palette.secondary" />
      <circle cx="14" cy="-8" r="2" :fill="palette.secondary" />
      <!-- nose -->
      <polygon points="0,2 -3,10 3,10" :fill="palette.dim" />
      <!-- teeth gap -->
      <line x1="0" y1="28" x2="0" y2="40" :stroke="palette.dim" stroke-width="0.8" />
    </g>
    <!-- spider -->
    <g transform="translate(40, 220)" :fill="palette.primary">
      <ellipse cx="0" cy="0" rx="6" ry="4" />
      <line x1="-6" y1="-1" x2="-12" y2="-6" :stroke="palette.primary" stroke-width="0.8" />
      <line x1="-6" y1="0" x2="-12" y2="0" :stroke="palette.primary" stroke-width="0.8" />
      <line x1="-6" y1="1" x2="-12" y2="6" :stroke="palette.primary" stroke-width="0.8" />
      <line x1="6" y1="-1" x2="12" y2="-6" :stroke="palette.primary" stroke-width="0.8" />
      <line x1="6" y1="0" x2="12" y2="0" :stroke="palette.primary" stroke-width="0.8" />
      <line x1="6" y1="1" x2="12" y2="6" :stroke="palette.primary" stroke-width="0.8" />
    </g>
    <g transform="translate(160, 50)" :fill="palette.primary">
      <ellipse cx="0" cy="0" rx="5" ry="3" />
      <line x1="-5" y1="-1" x2="-10" y2="-4" :stroke="palette.primary" stroke-width="0.6" />
      <line x1="5" y1="-1" x2="10" y2="-4" :stroke="palette.primary" stroke-width="0.6" />
      <line x1="-5" y1="0" x2="-10" y2="0" :stroke="palette.primary" stroke-width="0.6" />
      <line x1="5" y1="0" x2="10" y2="0" :stroke="palette.primary" stroke-width="0.6" />
    </g>
    <!-- title -->
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="9"
      :fill="palette.primary"
    >HORROR</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="7"
      :fill="palette.primary"
    >PROGRAMAS</text>
  </svg>

  <!-- MSX PT 1985 -->
  <svg
    v-else-if="manual.id === 'msx-pt'"
    viewBox="0 0 200 280"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="mx-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a1a3a" />
        <stop offset="1" stop-color="#00081a" />
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#mx-bg)" />
    <!-- MSX computer -->
    <rect x="30" y="120" width="140" height="80" rx="4" :fill="palette.dim" />
    <rect x="40" y="130" width="120" height="50" rx="2" fill="#000" />
    <rect x="44" y="134" width="112" height="42" fill="#0a0a14" />
    <!-- screen pattern -->
    <g :fill="palette.primary" opacity="0.7">
      <rect x="48" y="138" width="2" height="2" />
      <rect x="54" y="138" width="2" height="2" />
      <rect x="60" y="138" width="2" height="2" />
      <rect x="48" y="146" width="2" height="2" />
      <rect x="58" y="146" width="2" height="2" />
      <rect x="68" y="146" width="2" height="2" />
      <rect x="80" y="138" width="2" height="2" />
      <rect x="100" y="146" width="2" height="2" />
      <rect x="120" y="138" width="2" height="2" />
      <rect x="48" y="160" width="2" height="2" />
      <rect x="80" y="160" width="2" height="2" />
      <rect x="100" y="160" width="2" height="2" />
      <rect x="140" y="160" width="2" height="2" />
      <rect x="60" y="166" width="2" height="2" />
      <rect x="120" y="166" width="2" height="2" />
    </g>
    <!-- cartridge slot -->
    <rect x="80" y="100" width="40" height="20" rx="2" :fill="palette.primary" />
    <rect x="86" y="104" width="28" height="12" fill="#000" />
    <!-- keyboard -->
    <rect x="30" y="200" width="140" height="40" rx="2" :fill="palette.dim" />
    <g :fill="palette.primary">
      <rect x="40" y="208" width="8" height="6" /><rect x="50" y="208" width="8" height="6" />
      <rect x="60" y="208" width="8" height="6" /><rect x="70" y="208" width="8" height="6" />
      <rect x="80" y="208" width="8" height="6" /><rect x="90" y="208" width="8" height="6" />
      <rect x="100" y="208" width="8" height="6" /><rect x="110" y="208" width="8" height="6" />
      <rect x="120" y="208" width="8" height="6" /><rect x="130" y="208" width="8" height="6" />
      <rect x="40" y="218" width="8" height="6" /><rect x="50" y="218" width="8" height="6" />
      <rect x="60" y="218" width="8" height="6" /><rect x="70" y="218" width="8" height="6" />
      <rect x="80" y="218" width="8" height="6" /><rect x="90" y="218" width="8" height="6" />
      <rect x="100" y="218" width="8" height="6" /><rect x="110" y="218" width="8" height="6" />
      <rect x="120" y="218" width="8" height="6" /><rect x="130" y="218" width="8" height="6" />
    </g>
    <!-- joystick cable -->
    <path d="M 160 220 q 10 0 14 -8 q 4 -10 0 -16" stroke="#888" stroke-width="0.8" fill="none" />
    <circle cx="174" cy="194" r="4" :fill="palette.primary" />
    <!-- title -->
    <text
      x="100"
      y="78"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="11"
      :fill="palette.primary"
    >MSX</text>
    <text
      x="100"
      y="262"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="8"
      :fill="palette.primary"
    >GAMES</text>
    <text
      x="100"
      y="274"
      text-anchor="middle"
      font-family="'Press Start 2P', monospace"
      font-size="6"
      :fill="palette.primary"
    >BOOK</text>
  </svg>

  <!-- FALLBACK -->
  <svg v-else viewBox="0 0 200 280" class="h-full w-full">
    <rect width="200" height="280" fill="#0a0a14" />
    <text x="100" y="140" text-anchor="middle" :fill="palette.primary" font-family="monospace" font-size="10">MANUAL</text>
  </svg>
</template>
