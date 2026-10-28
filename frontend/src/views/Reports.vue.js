import { computed, onMounted, ref } from 'vue';
import { api } from '../services/api';
import Chart from '../components/Chart.vue';
const tab = ref('evolution');
const days = ref(7);
const data = ref({ measurements: [], detections: [], releases: [] });
const loading = ref(false);
async function load() {
    loading.value = true;
    const path = tab.value === 'consumption'
        ? '/reports/consumption'
        : tab.value === 'overview' ? '/reports/overview' : '/reports/evolution';
    try {
        data.value = (await api.get(path, { params: { days: days.value } })).data;
    }
    finally {
        loading.value = false;
    }
}
onMounted(load);
const option = computed(() => {
    const rows = data.value.measurements || [];
    const series = [
        ['Temperatura', 'temperature'],
        ['Umidade', 'humidity'],
        ['Reservatório', 'reservoir_level_percent'],
    ].map(([name, key]) => ({
        name,
        type: 'line',
        smooth: true,
        data: rows.map((row) => row[key]),
    }));
    return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Temperatura', 'Umidade', 'Reservatório'] },
        grid: { left: 35, right: 15, bottom: 30 },
        xAxis: { type: 'category', data: rows.map((row) => new Date(row.measured_at).toLocaleDateString('pt-BR')) },
        yAxis: { type: 'value' },
        series,
    };
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
// @ts-ignore
__VLS_withDotValue(tab, {});
// @ts-ignore
__VLS_withDotValue(days, {});
// @ts-ignore
__VLS_withDotValue(loading, {});
// @ts-ignore
__VLS_withDotValue(data, {});
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "mx-auto max-w-6xl p-5 pb-28" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-28']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-5 flex gap-2 overflow-x-auto" },
});
/** @type {__VLS_StyleScopedClasses['my-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
const __VLS_0 = __VLS_tryAsConstant(([['overview', 'Antes e depois'], ['evolution', 'Evolução'], ['consumption', 'Consumo']]));
for (const [[id, label]] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: // @ts-ignore
            (...[$event]) => {
                void $event;
                tab.value = id;
                load();
                // @ts-ignore
                [tab,];
            } },
        ...{ class: "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold" },
        ...{ class: (tab.value === id ? 'bg-forest text-white' : 'bg-white') },
    });
    /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (label);
    // @ts-ignore
    [tab,];
}
if (tab.value !== 'consumption') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4 flex gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    const __VLS_1 = __VLS_tryAsConstant(([1, 7, 30]));
    for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: // @ts-ignore
                (...[$event]) => {
                    void $event;
                    if (!(tab.value !== 'consumption'))
                        throw 0;
                    days.value = d;
                    load();
                    // @ts-ignore
                    [tab, days,];
                } },
            ...{ class: "rounded-xl px-3 py-2 text-sm" },
            ...{ class: (days.value === d ? 'bg-mint text-forest' : 'bg-white') },
        });
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (d === 1 ? '24 horas' : d + ' dias');
        // @ts-ignore
        [days,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
if (loading.value) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else if (tab.value === 'consumption') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "my-3 text-sm text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['my-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    const __VLS_2 = __VLS_tryAsConstant((data.value.releases));
    for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_2))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "border-t py-3" },
        });
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        (r.released_amount ?? 'Quantidade não medida');
        (r.unit || '');
        (new Date(r.released_at).toLocaleString('pt-BR'));
        // @ts-ignore
        [tab, loading, data,];
    }
    if (!data.value.releases?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
}
else {
    if (data.value.measurements?.length) {
        const __VLS_3 = Chart;
        // @ts-ignore
        const __VLS_4 = __VLS_asFunctionalComponent1(__VLS_3, new __VLS_3({
            // @ts-ignore
            option: (__VLS_unwrap(option, {})),
        }));
        const __VLS_5 = __VLS_4({
            option: (__VLS_unwrap(option, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-center text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
    if (tab.value === 'overview') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mt-3 text-xs text-slate-500" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    }
}
// @ts-ignore
[tab, data, data, option,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
