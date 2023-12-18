<template>
  <vxe-table
    :class="[
      props.enable ? 'is-virtual-scrollbar' : '',
      barStates.isScrolling.x ? 'is-scrolling-x' : '',
      barStates.isScrolling.y ? 'is-scrolling-y' : '',
      (!barStates.isScrolling.x && !barStates.isScrolling.y) ? 'is-no-scrolling' : '',
    ]"
    ref="tableRef"
    height="100%"
    v-bind="$attrs"
  >
    <slot />
  </vxe-table>
</template>

<script setup lang="ts">
import { useSlots, nextTick, ref, watch } from "vue";
import { until } from "@vueuse/core";
import { useScrollbar } from "@/hooks";

const props = defineProps<{
  enable: boolean
}>();

const slots = useSlots();
if (!slots.default) {
  throw new Error("[ERR] no default slot");
}

const tableRef = ref<any | null>(null);
const barStates = useScrollbar();
console.log('[info] barStates', barStates)

watch(() => props.enable, async (enable) => {
  console.log('[info] 开启虚拟滚动条', enable)
  if (enable) {
    await nextTick();
    await until(tableRef.value).toMatch((x) => x?.$el?.parentElement);
    try {
      const $table = tableRef.value.$el;
      const $header = $table.querySelector(".vxe-table--header-wrapper");
      const $bodyWrapper = $table.querySelector(".vxe-table--body-wrapper");
      const $bodyContent = $table.querySelector(".vxe-table--body");
      const $bodyXSpace = $table.querySelector(".vxe-body--x-space");
      const $bodyYSpace = $table.querySelector(".vxe-body--y-space");

      // console.log('barStates', barStates)

      barStates.setOffset({ y: { top: $header } });
      barStates.init({
        mount: tableRef,
        content: [$bodyWrapper, $bodyContent, $bodyXSpace, $bodyYSpace],
        viewport: [$bodyWrapper]
      });
    } catch (err) {
      console.error("[ERR] error when init virtual scrollbar", err, tableRef);
    }
  } else {
    barStates.destroy()
  }
}, {
  immediate: true,
})
</script>

<style lang="less">
.vxe-table {
  box-sizing: border-box;
  border: solid 1px #333;
  width: 100%;
  height: 100%;
}
.vxe-table--main-wrapper {
  display: grid;
  grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);
}
.vxe-table--render-wrapper,
.vxe-table--main-wrapper,
.vxe-table--main-wrapper .vxe-table--body-wrapper,
.vxe-table--fixed-left-wrapper,
.vxe-table--fixed-right-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100% !important;
}
.vxe-table.is-virtual-scrollbar .vxe-table--body-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/** test box-shadow on scroll */
.vxe-table.vxe-table.vxe-table {
  --color-1: rgb(0 0 0 / 5%);
  --color-2: rgb(0 0 0 / 3%);
  --color-3: rgb(0 0 0 / 8%);

  .vxe-table--header-wrapper {
    z-index: 9;
  }

  .vxe-table--header-wrapper.body--wrapper,
  .vxe-table--fixed-left-wrapper,
  .vxe-table--fixed-right-wrapper {
    box-shadow: 0 0 0 0 var(--color-1), 0 0 0 0 var(--color-2), 0 0 0 -8px var(--color-3);
    transition: box-shadow 0.35s ease-out;
    transition-delay: 0.5s;
    will-change: box-shadow;
  }
  &.is-scrolling-x {
    .vxe-table--fixed-left-wrapper,
    .vxe-table--fixed-right-wrapper {
      box-shadow: 0 9px 28px 0 var(--color-1), 0 12px 48px 16px var(--color-2), 0 6px 16px -8px var(--color-3);
      transition: box-shadow 0.25s ease-in;
      transition-delay: 0.01s;
    }
  }
  &.is-scrolling-y {
    .vxe-table--header-wrapper.body--wrapper {
      box-shadow: 0 0 8px 0 var(--color-1), 0 0 12px 18px var(--color-2), 0 0 16px -8px var(--color-3);
      transition: box-shadow 0.25s ease-in;
      transition-delay: 0.01s;
    }
    .vxe-table--fixed-left-wrapper .vxe-table--header,
    .vxe-table--fixed-right-wrapper .vxe-table--header {
      box-shadow: 0 0 8px 0 var(--shadow-color-1), 0 0 12px 18px var(--shadow-color-2), 0 0 16px -8px var(--shadow-color-3);
      transition: box-shadow 0.25s ease-in;
      transition-delay: 0.01s;
    }
  }
}
</style>
