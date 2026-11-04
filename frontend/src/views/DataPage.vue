<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {Camera, ExternalLink, RefreshCw, VideoOff} from 'lucide-vue-next'
import {api} from '../services/api'

const props = defineProps<{kind:string}>()
const rows = ref<any[]>([])
const device = ref<any>(null)
const loading = ref(true)
const error = ref('')
const videoElement = ref<HTMLVideoElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)
const cameraMode = ref<'notebook'|'esp32'>((import.meta.env.VITE_CAMERA_SOURCE || 'notebook') === 'esp32' ? 'esp32' : 'notebook')
const cameraError = ref('')
const cameraStarting = ref(false)

const meta = computed(() => ({
  camera: ['Câmera', 'Visualização local da webcam do notebook ou acesso direto à câmera do ESP32.'],
  varroa: ['Varroa', 'Detecções dos últimos 3 dias; não representa diagnóstico biológico real.'],
  acid: ['Ácido fórmico', 'Acompanhamento somente leitura. O servidor não aciona o mecanismo.'],
  alerts: ['Alertas', 'Ocorrências e status de leitura.'],
} as any)[props.kind])

async function load() {
  loading.value = true; error.value = ''
  try {
    if (props.kind === 'camera') device.value = (await api.get('/devices')).data[0]
    else {
      const path = props.kind === 'varroa' ? '/detections' : props.kind === 'acid' ? '/acid-releases' : '/alerts'
      const options = props.kind === 'varroa' ? {params: {days: 3}} : {}
      rows.value = (await api.get(path, options)).data
    }
  } catch { error.value = 'Não foi possível carregar os dados.' }
  finally { loading.value = false }
}

function stopNotebookCamera() {
  cameraStream.value?.getTracks().forEach(track => track.stop())
  cameraStream.value = null
  if (videoElement.value) videoElement.value.srcObject = null
}

async function startNotebookCamera() {
  stopNotebookCamera(); cameraError.value = ''; cameraStarting.value = true
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não oferece acesso à webcam.')
    cameraStream.value = await navigator.mediaDevices.getUserMedia({video: {width: {ideal: 640}, height: {ideal: 480}, facingMode: 'user'}, audio: false})
    await nextTick()
    if (videoElement.value) { videoElement.value.srcObject = cameraStream.value; await videoElement.value.play() }
  } catch (exception:any) {
    stopNotebookCamera()
    cameraError.value = exception?.name === 'NotAllowedError'
      ? 'Permissão da webcam negada. Libere a câmera nas configurações do navegador.'
      : exception?.name === 'NotReadableError'
        ? 'A webcam está ocupada. Pause ou feche o BPS Vision e tente novamente.'
        : exception?.message || 'Não foi possível abrir a webcam.'
  } finally { cameraStarting.value = false }
}

async function selectCameraMode(mode:'notebook'|'esp32') {
  cameraMode.value = mode
  if (mode === 'notebook') await startNotebookCamera()
  else stopNotebookCamera()
}

async function read(row:any) { await api.patch(`/alerts/${row.id}/read`); row.is_read = true }
const fmt = (value:any) => value ? new Date(value).toLocaleString('pt-BR') : '—'
onMounted(load)
onBeforeUnmount(stopNotebookCamera)
watch(() => props.kind, () => { stopNotebookCamera(); load() })
</script>

<template>
  <main class="mx-auto max-w-5xl p-5 pb-28">
    <header class="mb-6"><h1 class="page-title">{{meta[0]}}</h1><p class="mt-1 text-sm text-slate-500">{{meta[1]}}</p></header>
    <div v-if="loading" class="card animate-pulse">Carregando…</div>
    <p v-else-if="error" class="card text-red-700">{{error}}</p>
    <section v-else-if="kind==='camera'" class="card">
      <div class="mb-4 flex flex-wrap gap-3">
        <button class="btn inline-flex gap-2" :class="{'!bg-white !text-forest ring-1 ring-forest/20':cameraMode!=='notebook'}" @click="selectCameraMode('notebook')"><Camera/> Webcam do notebook</button>
        <button v-if="device?.local_camera_url" class="btn inline-flex gap-2" :class="{'!bg-white !text-forest ring-1 ring-forest/20':cameraMode!=='esp32'}" @click="selectCameraMode('esp32')"><ExternalLink/> Câmera ESP32</button>
      </div>

      <template v-if="cameraMode==='notebook'">
        <div class="aspect-video overflow-hidden rounded-2xl bg-slate-950 grid place-items-center">
          <video v-show="cameraStream" ref="videoElement" autoplay muted playsinline class="h-full w-full object-cover"></video>
          <div v-if="!cameraStream" class="p-5 text-center text-white"><VideoOff class="mx-auto mb-3 h-10 w-10"/><p>A webcam ainda não foi liberada.</p></div>
        </div>
        <button class="btn mt-4 inline-flex gap-2" :disabled="cameraStarting" @click="startNotebookCamera"><Camera/> {{cameraStarting ? 'Abrindo…' : cameraStream ? 'Reabrir webcam' : 'Liberar webcam'}}</button>
        <p v-if="cameraError" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{cameraError}}</p>
        <p class="mt-4 text-xs text-slate-500">A imagem permanece no navegador e não é enviada ao servidor. Se o BPS Vision estiver usando a webcam, pressione P nele para liberar o dispositivo; desligue a webcam desta página antes de continuar a análise.</p>
      </template>

      <template v-else>
        <div class="aspect-video rounded-2xl bg-forest/10 grid place-items-center text-center p-5"><p>{{device?.local_camera_url ? 'Abra o stream ESP32 em uma nova janela.' : 'Endereço da câmera ESP32 não configurado.'}}</p></div>
        <div class="mt-4 flex flex-wrap gap-3"><a v-if="device?.local_camera_url" :href="device.local_camera_url" target="_blank" rel="noopener" class="btn inline-flex gap-2">Abrir câmera ESP32 <ExternalLink/></a><button class="btn !bg-white !text-forest ring-1 ring-forest/20 inline-flex gap-2" @click="load"><RefreshCw/> Atualizar</button></div>
      </template>
    </section>

    <section v-else class="space-y-3">
      <article v-for="row in rows" :key="row.id" class="card">
        <template v-if="kind==='varroa'"><div class="flex justify-between"><strong>{{row.positive_detections ? 'Possível Varroa detectada' : 'Sem Varroa detectada'}}</strong><span class="badge bg-mint">{{row.samples_analyzed ? Math.round(row.positive_detections/row.samples_analyzed*100) : 0}}%</span></div><p class="mt-2 text-sm text-slate-500">{{row.positive_detections}} positivas em {{row.samples_analyzed}} amostras · {{fmt(row.detected_at)}}</p></template>
        <template v-else-if="kind==='acid'"><strong>Liberação registrada</strong><p class="text-sm text-slate-500">{{row.released_amount ?? 'Quantidade não medida'}} {{row.unit || ''}} · {{fmt(row.released_at)}}</p></template>
        <template v-else><div class="flex justify-between gap-3"><div><span class="badge bg-amber/20">{{row.severity}}</span><h2 class="mt-2 font-bold">{{row.title}}</h2><p class="text-sm text-slate-500">{{row.description}} · {{fmt(row.created_at)}}</p></div><button v-if="!row.is_read" class="text-sm font-semibold text-leaf" @click="read(row)">Marcar como lido</button></div></template>
      </article>
      <div v-if="!rows.length" class="card text-center text-slate-500">Nenhum registro encontrado nos últimos 3 dias.</div>
    </section>
  </main>
</template>
