<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Bug, CloudSun, FlaskConical, LogOut, RefreshCw, Thermometer, Wifi} from 'lucide-vue-next'
import {api} from '../services/api'
import {useAuth} from '../stores/auth'

const data = ref<any>(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const auth = useAuth()
const router = useRouter()
let refreshTimer: number | undefined

async function load(silent = false) {
  if (silent) refreshing.value = true
  else loading.value = true
  try {
    data.value = (await api.get('/dashboard', {params: {_: Date.now()}})).data
    error.value = ''
  } catch {
    error.value = 'Não foi possível carregar os dados.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

const fmt = (value: unknown) => value == null ? '—' : new Date(String(value)).toLocaleString('pt-BR')

onMounted(() => {
  load()
  refreshTimer = window.setInterval(() => load(true), 10_000)
})
onBeforeUnmount(() => window.clearInterval(refreshTimer))
</script>

<template>
  <main class="mx-auto max-w-6xl p-5 pb-28">
    <header class="mb-5 flex items-center justify-between rounded-b-2xl bg-forest p-5 text-white shadow-lg">
      <div>
        <p class="text-sm text-emerald-100">BPS · Visão geral</p>
        <h1 class="text-2xl font-black">{{data?.hive?.name || 'BPS'}}</h1>
      </div>
      <div class="flex gap-2">
        <button class="rounded-xl bg-white/10 p-3 hover:bg-white/20" :disabled="refreshing" aria-label="Atualizar dados" @click="load(true)">
          <RefreshCw :class="{'animate-spin': refreshing}" />
        </button>
        <button class="rounded-xl bg-white/10 p-3 hover:bg-white/20" aria-label="Sair" @click="logout"><LogOut /></button>
      </div>
    </header>

    <div v-if="loading" class="card animate-pulse">Carregando indicadores…</div>
    <p v-else-if="error && !data" class="card text-red-700">{{error}}</p>
    <section v-else-if="data?.empty" class="card text-center">
      <h2 class="font-bold">Ainda não há uma colmeia</h2>
      <p class="mt-2 text-sm text-slate-500">Cadastre um dispositivo e envie a primeira leitura pelo simulador.</p>
    </section>
    <template v-else>
      <div v-if="data.demo_mode" class="mb-4 rounded-xl bg-amber/20 p-3 text-sm font-semibold">Modo de demonstração — os dados recebidos podem ser simulados.</div>
      <p v-if="error" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{error}}</p>
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article class="card"><Thermometer class="text-leaf"/><p class="mt-5 text-sm text-slate-500">Temperatura</p><p class="metric">{{data.measurement?.temperature ?? '—'}}<small> °C</small></p></article>
        <article class="card"><CloudSun class="text-leaf"/><p class="mt-5 text-sm text-slate-500">Umidade</p><p class="metric">{{data.measurement?.humidity ?? '—'}}<small>%</small></p></article>
        <article class="card"><Bug class="text-leaf"/><p class="mt-5 text-sm text-slate-500">Possíveis detecções</p><p class="metric">{{data.detection?.positive_detections ?? '—'}}</p></article>
        <article class="card"><FlaskConical class="text-leaf"/><p class="mt-5 text-sm text-slate-500">Reservatório</p><p class="metric">{{data.measurement?.reservoir_level_percent ?? '—'}}<small>%</small></p></article>
      </section>
      <section class="mt-4 grid gap-4 lg:grid-cols-2">
        <article class="card">
          <div class="flex items-center gap-2"><Wifi class="text-leaf"/><h2 class="font-bold">Conexão</h2></div>
          <p class="mt-4">{{data.device?.last_seen_at ? 'Sincronizado' : 'Sem sincronização'}}</p>
          <p class="text-sm text-slate-500">Última sincronização: {{fmt(data.device?.last_seen_at)}}</p>
          <p class="text-sm text-slate-500">Medição: {{fmt(data.measurement?.measured_at)}}</p>
        </article>
        <article class="card">
          <h2 class="font-bold">Alertas recentes</h2>
          <p v-if="!data.alerts?.length" class="mt-4 text-sm text-slate-500">Nenhum alerta registrado.</p>
          <div v-for="alert in data.alerts" :key="alert.id" class="mt-3 border-t pt-3"><span class="badge bg-amber/20">{{alert.severity}}</span> {{alert.title}}</div>
        </article>
      </section>
      <p class="mt-3 text-center text-xs text-slate-400">Atualização automática a cada 10 segundos.</p>
    </template>
  </main>
</template>
