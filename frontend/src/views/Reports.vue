<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {api} from '../services/api'
import Chart from '../components/Chart.vue'

const tab = ref('evolution')
const days = ref(7)
const data = ref<any>({measurements: [], detections: [], releases: []})
const loading = ref(false)

async function load() {
  loading.value = true
  const path = tab.value === 'consumption'
    ? '/reports/consumption'
    : tab.value === 'overview' ? '/reports/overview' : '/reports/evolution'
  try {
    data.value = (await api.get(path, {params: {days: days.value}})).data
  } finally {
    loading.value = false
  }
}

onMounted(load)
const option = computed(() => {
  const rows = data.value.measurements || []
  const series = [
    ['Temperatura', 'temperature'],
    ['Umidade', 'humidity'],
    ['Reservatório', 'reservoir_level_percent'],
  ].map(([name, key]) => ({
    name,
    type: 'line',
    smooth: true,
    data: rows.map((row: any) => row[key]),
  }))
  return {
    tooltip: {trigger: 'axis'},
    legend: {data: ['Temperatura', 'Umidade', 'Reservatório']},
    grid: {left: 35, right: 15, bottom: 30},
    xAxis: {type: 'category', data: rows.map((row: any) => new Date(row.measured_at).toLocaleDateString('pt-BR'))},
    yAxis: {type: 'value'},
    series,
  }
})
</script>
<template><main class="mx-auto max-w-6xl p-5 pb-28"><h1 class="page-title">Relatórios</h1><div class="my-5 flex gap-2 overflow-x-auto"><button v-for="[id,label] in [['overview','Antes e depois'],['evolution','Evolução'],['consumption','Consumo']]" class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold" :class="tab===id?'bg-forest text-white':'bg-white'" @click="tab=id;load()">{{label}}</button></div><div v-if="tab!=='consumption'" class="mb-4 flex gap-2"><button v-for="d in [1,7,30]" class="rounded-xl px-3 py-2 text-sm" :class="days===d?'bg-mint text-forest':'bg-white'" @click="days=d;load()">{{d===1?'24 horas':d+' dias'}}</button></div><section class="card"><p v-if="loading">Carregando relatório…</p><template v-else-if="tab==='consumption'"><h2 class="font-bold">Histórico de liberações</h2><p class="my-3 text-sm text-slate-500">Consumo só é apresentado quando o dispositivo envia uma medição válida.</p><div v-for="r in data.releases" class="border-t py-3">{{r.released_amount??'Quantidade não medida'}} {{r.unit||''}} · {{new Date(r.released_at).toLocaleString('pt-BR')}}</div><p v-if="!data.releases?.length" class="text-slate-500">Sem liberações registradas.</p></template><template v-else><Chart v-if="data.measurements?.length" :option="option"/><p v-else class="text-center text-slate-500">Sem dados no período selecionado.</p><p v-if="tab==='overview'" class="mt-3 text-xs text-slate-500">A comparação usa somente medições armazenadas nos períodos selecionados.</p></template></section></main></template>
