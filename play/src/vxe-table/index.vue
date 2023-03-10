<template>
  <vxe-table
    :class="props.enable ? 'is-virtual-scrollbar' : ''"
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
</style>
