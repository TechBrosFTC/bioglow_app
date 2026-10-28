import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
const { defineProps, } = {};
use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent]);
const __VLS_props = defineProps(), type, __VLS_PublicProps = __VLS_Props;
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.vChart | typeof __VLS_components.VChart | typeof __VLS_components['v-chart']} */
vChart;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    ...{ class: "h-64 w-full" }, option: (__VLS_ctx.option), autoresize: true,
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-64 w-full" },
    option: (__VLS_ctx.option),
    autoresize: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-64']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
// @ts-ignore
[option,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
