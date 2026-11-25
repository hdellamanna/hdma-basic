<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
const locale = useLocaleStore()
const tr = (pt: string, en: string) => (locale.isPt ? pt : en)
const year = ref(1),
  mines = ref(2),
  credits = ref(24),
  ore = ref(8),
  morale = ref(3)
const sales = ref(4),
  rations = ref(6),
  expand = ref(false)
const phase = ref<'ready' | 'play' | 'won' | 'lost'>('ready')
const settlement = ref<{ income: number; cost: number; yield: number }>()
const market = [3, 2, 4, 2, 3, 5, 2, 4, 3, 4]
const price = computed(() => market[year.value - 1])
const population = computed(() => 4 + mines.value)
const investment = 15
const harvest = computed(() => mines.value * (year.value % 3 === 0 ? 3 : 4))
const treasury = computed(
  () =>
    credits.value +
    sales.value * price.value -
    rations.value * 2 -
    (expand.value ? investment : 0),
)
function start() {
  year.value = 1
  mines.value = 2
  credits.value = 24
  ore.value = 8
  morale.value = 3
  sales.value = 4
  rations.value = 6
  expand.value = false
  settlement.value = undefined
  phase.value = 'play'
}
function settle() {
  if (phase.value !== 'play' || treasury.value < 0) return
  settlement.value = {
    income: sales.value * price.value,
    cost: rations.value * 2 + (expand.value ? investment : 0),
    yield: harvest.value,
  }
  credits.value = treasury.value
  ore.value += harvest.value - sales.value
  morale.value = Math.max(
    0,
    Math.min(5, morale.value + Math.sign(rations.value - population.value)),
  )
  if (expand.value) mines.value++
  if (!morale.value) {
    phase.value = 'lost'
    return
  }
  if (year.value === 10) {
    phase.value = 'won'
    return
  }
  year.value++
  expand.value = false
  sales.value = Math.min(ore.value, sales.value)
}
</script>
<template>
  <section class="observatory">
    <div class="observatory-art">
      <img src="/images/astron-exchange.webp" alt="" width="640" height="480" />
      <h2>{{ tr('Bolsa de Astron', 'Astron Exchange') }}</h2>
    </div>
    <div class="observatory-body">
      <p>
        {{
          tr(
            'Governe a colônia por dez anos. Venda minério, alimente as famílias e decida quando abrir uma galeria. Sem apoio, o mandato acaba.',
            'Govern the colony for ten years. Sell ore, feed the families and decide when to open a gallery. Lose their support and your term ends.',
          )
        }}
      </p>
      <template v-if="phase === 'play'">
        <dl class="observatory-stats">
          <div>
            <dt>{{ tr('Ano', 'Year') }}</dt>
            <dd>{{ year }}/10</dd>
          </div>
          <div>
            <dt>{{ tr('Tesouro', 'Treasury') }}</dt>
            <dd>{{ credits }} ₳</dd>
          </div>
          <div>
            <dt>{{ tr('Estoque', 'Stock') }}</dt>
            <dd>{{ ore }} t</dd>
          </div>
          <div>
            <dt>{{ tr('Apoio', 'Support') }}</dt>
            <dd>{{ morale }}/5</dd>
          </div>
        </dl>
        <label>
          {{ tr('Vender minério', 'Sell ore') }}
          <strong>{{ sales }} t × {{ price }} ₳</strong>
          <input v-model.number="sales" type="range" min="0" :max="ore" />
        </label>
        <label>
          {{ tr('Comprar rações', 'Buy rations') }}
          <strong>
            {{ rations }} / {{ population }} {{ tr('famílias', 'families') }}
          </strong>
          <input
            v-model.number="rations"
            type="range"
            min="0"
            :max="population + 2"
          />
        </label>
        <label class="trade-check">
          <input v-model="expand" type="checkbox" />
          {{ tr('Abrir galeria', 'Open gallery') }} (15 ₳)
        </label>
        <p class="forecast">
          {{ tr('Saldo previsto', 'Projected balance') }} · {{ treasury }} ₳
          &nbsp; / &nbsp; {{ tr('Extração', 'Production') }} · {{ harvest }} t
        </p>
        <button :disabled="treasury < 0" @click="settle">
          {{ tr('Fechar o ano', 'Close the year') }}
        </button>
        <small v-if="treasury < 0">
          {{
            tr(
              'Reduza as despesas ou venda mais minério.',
              'Reduce spending or sell more ore.',
            )
          }}
        </small>
      </template>
      <template v-else>
        <p v-if="phase !== 'ready'" role="status">
          {{
            phase === 'won'
              ? tr('Mandato concluído.', 'Term completed.')
              : tr(
                  'A colônia retirou seu apoio.',
                  'The colony withdrew its support.',
                )
          }}
          {{ credits }} ₳ · {{ ore }} t
        </p>
        <button @click="start">
          {{
            phase === 'ready'
              ? tr('Assumir o governo', 'Take office')
              : tr('Novo mandato', 'New term')
          }}
        </button>
      </template>
      <small v-if="settlement">
        {{ tr('Último balanço', 'Last settlement') }} · +{{
          settlement.income
        }}
        ₳ / −{{ settlement.cost }} ₳ / +{{ settlement.yield }} t
      </small>
    </div>
  </section>
</template>
