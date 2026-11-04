import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Camera, ExternalLink, RefreshCw, VideoOff } from 'lucide-vue-next';
import { api } from '../services/api';
const { defineProps, } = {};
const props = defineProps();
const rows = ref([]);
const device = ref(null);
const loading = ref(true);
const error = ref('');
const videoElement = ref(null);
const cameraStream = ref(null);
const cameraMode = ref((import.meta.env.VITE_CAMERA_SOURCE || 'notebook') === 'esp32' ? 'esp32' : 'notebook');
const cameraError = ref('');
const cameraStarting = ref(false);
const meta = computed(() => ({
    camera: ['Câmera', 'Visualização local da webcam do notebook ou acesso direto à câmera do ESP32.'],
    varroa: ['Varroa', 'Detecções dos últimos 3 dias; não representa diagnóstico biológico real.'],
    acid: ['Ácido fórmico', 'Acompanhamento somente leitura. O servidor não aciona o mecanismo.'],
    alerts: ['Alertas', 'Ocorrências e status de leitura.'],
}[props.kind]));
async function load() {
    loading.value = true;
    error.value = '';
    try {
        if (props.kind === 'camera')
            device.value = (await api.get('/devices')).data[0];
        else {
            const path = props.kind === 'varroa' ? '/detections' : props.kind === 'acid' ? '/acid-releases' : '/alerts';
            const options = props.kind === 'varroa' ? { params: { days: 3 } } : {};
            rows.value = (await api.get(path, options)).data;
        }
    }
    catch {
        error.value = 'Não foi possível carregar os dados.';
    }
    finally {
        loading.value = false;
    }
}
function stopNotebookCamera() {
    cameraStream.value?.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
    if (videoElement.value)
        videoElement.value.srcObject = null;
}
async function startNotebookCamera() {
    stopNotebookCamera();
    cameraError.value = '';
    cameraStarting.value = true;
    try {
        if (!navigator.mediaDevices?.getUserMedia)
            throw new Error('Este navegador não oferece acesso à webcam.');
        cameraStream.value = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
        await nextTick();
        if (videoElement.value) {
            videoElement.value.srcObject = cameraStream.value;
            await videoElement.value.play();
        }
    }
    catch (exception) {
        stopNotebookCamera();
        cameraError.value = exception?.name === 'NotAllowedError'
            ? 'Permissão da webcam negada. Libere a câmera nas configurações do navegador.'
            : exception?.name === 'NotReadableError'
                ? 'A webcam está ocupada. Pause ou feche o BPS Vision e tente novamente.'
                : exception?.message || 'Não foi possível abrir a webcam.';
    }
    finally {
        cameraStarting.value = false;
    }
}
async function selectCameraMode(mode) {
    cameraMode.value = mode;
    if (mode === 'notebook')
        await startNotebookCamera();
    else
        stopNotebookCamera();
}
async function read(row) { await api.patch(`/alerts/${row.id}/read`); row.is_read = true; }
const fmt = (value) => value ? new Date(value).toLocaleString('pt-BR') : '—';
onMounted(load);
onBeforeUnmount(stopNotebookCamera);
watch(() => props.kind, () => { stopNotebookCamera(); load(); });
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
// @ts-ignore
__VLS_withDotValue(meta, {});
// @ts-ignore
__VLS_withDotValue(loading, {});
// @ts-ignore
__VLS_withDotValue(error, {});
// @ts-ignore
__VLS_withDotValue(cameraMode, {});
// @ts-ignore
__VLS_withDotValue(device, {});
// @ts-ignore
__VLS_withDotValue(cameraStream, {});
// @ts-ignore
__VLS_withDotValue(cameraStarting, {});
// @ts-ignore
__VLS_withDotValue(cameraError, {});
// @ts-ignore
__VLS_withDotValue(rows, {});
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "mx-auto max-w-5xl p-5 pb-28" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-28']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "mb-6" },
});
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
(meta.value[0]);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-slate-500" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
(meta.value[1]);
if (loading.value) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card animate-pulse" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
}
else if (error.value) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "card text-red-700" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
    (error.value);
}
else if (__VLS_ctx.kind === 'camera') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 flex flex-wrap gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: // @ts-ignore
            (...[$event]) => {
                void $event;
                if (!!(loading.value))
                    throw 0;
                if (!!(error.value))
                    throw 0;
                if (!(__VLS_ctx.kind === 'camera'))
                    throw 0;
                return (selectCameraMode('notebook'));
                // @ts-ignore
                [meta, meta, loading, error, error, kind,];
            } },
        ...{ class: "btn inline-flex gap-2" },
        ...{ class: ({ '!bg-white !text-forest ring-1 ring-forest/20': cameraMode.value !== 'notebook' }) },
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['!bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['!text-forest']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['ring-forest/20']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.Camera} */
    Camera;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    if (device.value?.local_camera_url) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: // @ts-ignore
                (...[$event]) => {
                    void $event;
                    if (!!(loading.value))
                        throw 0;
                    if (!!(error.value))
                        throw 0;
                    if (!(__VLS_ctx.kind === 'camera'))
                        throw 0;
                    if (!(device.value?.local_camera_url))
                        throw 0;
                    return (selectCameraMode('esp32'));
                    // @ts-ignore
                    [cameraMode, device,];
                } },
            ...{ class: "btn inline-flex gap-2" },
            ...{ class: ({ '!bg-white !text-forest ring-1 ring-forest/20': cameraMode.value !== 'esp32' }) },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['!bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['!text-forest']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-forest/20']} */ ;
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.ExternalLink} */
        ExternalLink;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        }));
        const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
    if (cameraMode.value === 'notebook') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "aspect-video overflow-hidden rounded-2xl bg-slate-950 grid place-items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['aspect-video']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-slate-950']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
            ref: "videoElement",
            autoplay: true,
            muted: true,
            playsinline: true,
            ...{ class: "h-full w-full object-cover" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (cameraStream.value), }, __VLS_nonNull(null), __VLS_nonNull(null));
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
        if (!cameraStream.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-5 text-center text-white" },
            });
            /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            let __VLS_10;
            /** @ts-ignore @type { | typeof __VLS_components.VideoOff} */
            VideoOff;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                // @ts-ignore
                ...{ class: "mx-auto mb-3 h-10 w-10" },
            }));
            const __VLS_12 = __VLS_11({
                ...{ class: "mx-auto mb-3 h-10 w-10" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (startNotebookCamera) },
            ...{ class: "btn mt-4 inline-flex gap-2" },
            disabled: (cameraStarting.value),
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_15;
        /** @ts-ignore @type { | typeof __VLS_components.Camera} */
        Camera;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        // @ts-ignore
        }));
        const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
        (cameraStarting.value ? 'Abrindo…' : cameraStream.value ? 'Reabrir webcam' : 'Liberar webcam');
        if (cameraError.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-50']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
            (cameraError.value);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-4 text-xs text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "aspect-video rounded-2xl bg-forest/10 grid place-items-center text-center p-5" },
        });
        /** @type {__VLS_StyleScopedClasses['aspect-video']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-forest/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (device.value?.local_camera_url ? 'Abra o stream ESP32 em uma nova janela.' : 'Endereço da câmera ESP32 não configurado.');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 flex flex-wrap gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        if (device.value?.local_camera_url) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (device.value.local_camera_url),
                target: "_blank",
                rel: "noopener",
                ...{ class: "btn inline-flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            let __VLS_20;
            /** @ts-ignore @type { | typeof __VLS_components.ExternalLink} */
            ExternalLink;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            // @ts-ignore
            }));
            const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (load) },
            ...{ class: "btn !bg-white !text-forest ring-1 ring-forest/20 inline-flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['!bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['!text-forest']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-forest/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        let __VLS_25;
        /** @ts-ignore @type { | typeof __VLS_components.RefreshCw} */
        RefreshCw;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        }));
        const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    const __VLS_30 = __VLS_tryAsConstant((rows.value));
    for (const [row] of __VLS_vFor(__VLS_nonNull(__VLS_30))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (row.id),
            ...{ class: "card" },
        });
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        if (__VLS_ctx.kind === 'varroa') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (row.positive_detections ? 'Possível Varroa detectada' : 'Sem Varroa detectada');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "badge bg-mint" },
            });
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-mint']} */ ;
            (row.samples_analyzed ? Math.round(row.positive_detections / row.samples_analyzed * 100) : 0);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "mt-2 text-sm text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            (row.positive_detections);
            (row.samples_analyzed);
            (__VLS_unwrap(fmt, {})(row.detected_at));
        }
        else if (__VLS_ctx.kind === 'acid') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            (row.released_amount ?? 'Quantidade não medida');
            (row.unit || '');
            (__VLS_unwrap(fmt, {})(row.released_at));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "badge bg-amber/20" },
            });
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-amber/20']} */ ;
            (row.severity);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "mt-2 font-bold" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (row.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-slate-500" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
            (row.description);
            (__VLS_unwrap(fmt, {})(row.created_at));
            if (!row.is_read) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: // @ts-ignore
                        (...[$event]) => {
                            void $event;
                            if (!!(loading.value))
                                throw 0;
                            if (!!(error.value))
                                throw 0;
                            if (!!(__VLS_ctx.kind === 'camera'))
                                throw 0;
                            if (!!(__VLS_ctx.kind === 'varroa'))
                                throw 0;
                            if (!!(__VLS_ctx.kind === 'acid'))
                                throw 0;
                            if (!(!row.is_read))
                                throw 0;
                            return (read(row));
                            // @ts-ignore
                            [kind, kind, cameraMode, cameraMode, device, device, device, cameraStream, cameraStream, cameraStream, cameraStarting, cameraStarting, cameraError, cameraError, rows, fmt, fmt, fmt,];
                        } },
                    ...{ class: "text-sm font-semibold text-leaf" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-leaf']} */ ;
            }
        }
        // @ts-ignore
        [];
    }
    if (!rows.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card text-center text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
}
// @ts-ignore
[rows,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
