<script setup lang="ts">
// Static scanline + scan beam overlay used across the app
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
    <!-- Vignette -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%);"
    ></div>
    <!-- Scanlines -->
    <div
      class="absolute inset-0 opacity-[0.06] mix-blend-screen"
      style="background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(57, 255, 20, 0.6) 2px, rgba(57, 255, 20, 0.6) 3px);"
    ></div>
    <!-- Slow scanning beam -->
    <div
      class="absolute inset-x-0 h-32 animate-scan opacity-[0.04] mix-blend-screen"
      style="background: linear-gradient(to bottom, transparent 0%, rgba(57, 255, 20, 0.6) 50%, transparent 100%);"
    ></div>
  </div>
</template>
