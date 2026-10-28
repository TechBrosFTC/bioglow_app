import { useRoute } from 'vue-router';
import { Home, Camera, Bug, FlaskConical, TriangleAlert, ChartNoAxesCombined } from 'lucide-vue-next';
const route = useRoute();
const nav = [['/', 'Início', Home], ['/camera', 'Câmera', Camera], ['/varroa', 'Varroa', Bug], ['/acid', 'Ácido', FlaskConical], ['/alerts', 'Alertas', TriangleAlert], ['/reports', 'Relatórios', ChartNoAxesCombined]];
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
// @ts-ignore
__VLS_withDotValue(route, {});
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view'] | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
routerView;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
// @ts-ignore
}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
{
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    const [{ Component }] = __VLS_vSlot(__VLS_nonNull(__VLS_5));
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        name: "fade", mode: "out-in",
    }));
    const __VLS_8 = __VLS_7({
        name: "fade",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
    const __VLS_12 = (Component);
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    // @ts-ignore
    }));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_9;
}
var __VLS_3;
if (route.value.path != '/login') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "fixed bottom-0 left-0 right-0 z-20 border-t border-emerald-800 bg-forest/95 backdrop-blur lg:bottom-4 lg:left-1/2 lg:w-[760px] lg:-translate-x-1/2 lg:rounded-2xl lg:border" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-emerald-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-forest/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:left-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:w-[760px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:-translate-x-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:border']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mx-auto grid max-w-4xl grid-cols-6" },
    });
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-6']} */ ;
    const __VLS_17 = __VLS_tryAsConstant((__VLS_unwrap(nav, {})));
    for (const [[to, label, icon]] of __VLS_vFor(__VLS_nonNull(__VLS_17))) {
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            to: to, ...{ class: "flex min-w-0 flex-col items-center gap-1 px-1 py-3 text-[10px] text-emerald-100" }, activeClass: "!text-amber",
        }));
        const __VLS_20 = __VLS_19({
            to: to,
            ...{ class: "flex min-w-0 flex-col items-center gap-1 px-1 py-3 text-[10px] text-emerald-100" },
            activeClass: "!text-amber",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-emerald-100']} */ ;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        const __VLS_24 = (icon);
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
            // @ts-ignore
            size: (21),
        }));
        const __VLS_26 = __VLS_25({
            size: (21),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (label);
        // @ts-ignore
        [route, nav,];
        var __VLS_21;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
