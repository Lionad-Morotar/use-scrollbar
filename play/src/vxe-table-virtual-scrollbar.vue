<template>
  <vxe-table ref="tableRef" height="100%" v-bind="$attrs">
    <slot />
  </vxe-table>
</template>

<script setup lang="ts">
import { useSlots, onMounted, nextTick, ref } from "vue";
import { until } from "@vueuse/core";
import { useScrollbar } from "@/hooks";

const slots = useSlots();
if (!slots.default) {
  throw new Error("[ERR] no default slot");
}

const tableRef = ref<any | null>(null);

onMounted(async () => {
  await nextTick();
  await until(tableRef.value).toMatch((x) => x?.$el?.parentElement);
  try {
    const barStates = useScrollbar();

    const $parentElem = tableRef.value.$el.parentElement;
    const $header = $parentElem.querySelector(".vxe-table--header-wrapper");
    const $bodyWrapper = $parentElem.querySelector(".vxe-table--body-wrapper");
    const $bodyContent = $parentElem.querySelector(".vxe-table--body");
    const $bodyXSpace = $parentElem.querySelector(".vxe-body--x-space");
    const $bodyYSpace = $parentElem.querySelector(".vxe-body--y-space");

    barStates.visibleOnHover(tableRef);
    barStates.traceOffsetOn({ y: { top: $header } });
    barStates.init({
      mount: tableRef,
      place: $bodyWrapper,
      content: [$bodyContent, $bodyWrapper, $bodyXSpace, $bodyYSpace],
      wrapper: [$bodyContent, $bodyWrapper],
    });

  } catch (err) {
    console.error("[ERR] error when init virtual scrollbar", err, tableRef);
  }
})
</script>

<style>
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
.vxe-table--body-wrapper,
.vxe-table--fixed-left-wrapper,
.vxe-table--fixed-right-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100% !important;
}
.vxe-table--body-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
