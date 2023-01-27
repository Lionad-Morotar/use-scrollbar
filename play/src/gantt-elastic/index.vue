<template>
  <gantt-elastic ref="ganttRef" v-bind="$attrs">
    <slot />
  </gantt-elastic>
</template>

<script setup lang="ts">
import { useSlots, onMounted, nextTick, ref } from "vue";
import { until } from "@vueuse/core";
import { useScrollbar } from "@/hooks";
import GanttElastic from "./gantt-elastic.vue";

const slots = useSlots();
if (!slots.default) {
  throw new Error("[ERR] no default slot");
}

const ganttRef = ref<any | null>(null);

onMounted(async () => {
  await nextTick();
  await until(ganttRef.value).toMatch((x) => x?.$el?.parentElement);
  try {
    const barStates = useScrollbar();

    const $parentElem = ganttRef.value.$el.parentElement;
    const $chart = $parentElem.querySelector(".gantt-elastic__chart");
    const $viewport = $parentElem.querySelector(".gantt-elastic__chart-graph-container");
    const $svg = $parentElem.querySelector(".gantt-elastic__chart-graph-svg");
    const $barX = $parentElem.querySelector(".gantt-elastic__chart-scroll-container--horizontal");
    const $barY = $parentElem.querySelector(".gantt-elastic__chart-scroll-container--vertical");

    barStates.setOffset({
      y: { top: $parentElem.querySelector(".gantt-elastic__chart-calendar-container") }
    });
    barStates.init({
      mount: $chart,
      content: [$svg],
      wrapper: [$viewport, $barX, $barY],
    });

  } catch (err) {
    console.error("[ERR] error in gantt chart initVirtualScrollbar", err, ganttRef);
  }
})
</script>
