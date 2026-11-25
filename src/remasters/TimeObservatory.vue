<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
const voyages = [
  { earth: 10, crew: 7 },
  { earth: 15, crew: 8 },
  { earth: 20, crew: 9 },
]
const stage = ref(0),
  velocity = ref(6),
  distance = ref(5),
  phase = ref<'ready' | 'play' | 'won'>('ready'),
  feedback = ref<'date' | 'crew' | null>(null)
const speed = computed(() => velocity.value / 10)
const earth = computed(() => distance.value / speed.value)
const ship = computed(() => earth.value * Math.sqrt(1 - speed.value ** 2))
const job = computed(() => voyages[stage.value])
const digits = (n: number) =>
  n.toLocaleString(locale.isPt ? 'pt-BR' : 'en', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })
function start() {
  stage.value = 0
  velocity.value = 6
  distance.value = 5
  feedback.value = null
  phase.value = 'play'
}
function depart() {
  if (Math.abs(earth.value - job.value.earth) > 0.5) {
    feedback.value = 'date'
    return
  }
  if (ship.value > job.value.crew) {
    feedback.value = 'crew'
    return
  }
  feedback.value = null
  if (stage.value === voyages.length - 1) {
    phase.value = 'won'
    return
  }
  stage.value++
  velocity.value = 6
  distance.value = 5
}
</script>
<template>
  <section class="observatory">
    <div class="observatory-art">
      <img
        src="/images/time-observatory.webp"
        alt=""
        width="640"
        height="480"
      />
      <h2>{{ tr('Observatório do Tempo', 'Time Observatory') }}</h2>
    </div>
    <div class="observatory-body">
      <p>
        {{
          tr(
            'Programe três viagens relativísticas. A distância é o percurso total. Aumentar a velocidade faz o relógio de bordo avançar menos que o da Terra.',
            'Plan three relativistic voyages. Distance is the total route. Increasing speed makes the ship clock advance less than the Earth clock.',
          )
        }}
      </p>
      <template v-if="phase === 'play'">
        <p class="forecast">
          {{ tr('Missão', 'Mission') }} {{ stage + 1 }}/3 ·
          {{ tr('Retorno em', 'Return in') }} {{ job.earth }}
          {{
            tr(
              'anos terrestres (±0,5). Limite a bordo',
              'Earth years (±0.5). Ship limit',
            )
          }}
          · {{ job.crew }} {{ tr('anos', 'years') }}
        </p>
        <dl class="time-clocks">
          <div v-for="(v, i) in [earth, ship]" :key="i">
            <dt>{{ i ? tr('Nave', 'Ship') : tr('Terra', 'Earth') }}</dt>
            <dd>
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="36" />
                <path
                  v-for="j in 12"
                  :key="j"
                  d="M40 6v5"
                  :transform="'rotate(' + j * 30 + ' 40 40)'"
                />
                <path
                  class="clock-hand"
                  d="M40 40V15"
                  :transform="'rotate(' + v * 30 + ' 40 40)'"
                />
              </svg>
              <b>{{ digits(v) }}</b>
              {{ tr('anos', 'years') }}
            </dd>
          </div>
        </dl>
        <label>
          {{ tr('Velocidade', 'Speed') }}
          <strong>{{ digits(speed) }} c</strong>
          <input v-model.number="velocity" type="range" min="3" max="9" />
        </label>
        <label>
          {{ tr('Percurso', 'Route') }}
          <strong>
            {{ digits(distance) }} {{ tr('anos-luz', 'light years') }}
          </strong>
          <input
            v-model.number="distance"
            type="range"
            min="1"
            max="20"
            step=".5"
          />
        </label>
        <button @click="depart">
          {{ tr('Autorizar viagem', 'Authorize voyage') }}
        </button>
        <p v-if="feedback" role="status">
          {{
            feedback === 'date'
              ? tr(
                  'A data de retorno está fora da janela. Ajuste o percurso.',
                  'The return date is outside the window. Adjust the route.',
                )
              : tr(
                  'A tripulação envelheceria demais. Tente uma velocidade maior.',
                  'The crew would age too much. Try a higher speed.',
                )
          }}
        </p>
      </template>
      <template v-else>
        <p v-if="phase === 'won'" role="status">
          {{
            tr(
              'Os três voos chegaram na data prevista.',
              'All three flights reached their scheduled dates.',
            )
          }}
        </p>
        <button @click="start">
          {{
            phase === 'ready'
              ? tr('Abrir as efemérides', 'Open the ephemeris')
              : tr('Repetir os voos', 'Replay voyages')
          }}
        </button>
      </template>
    </div>
  </section>
</template>
