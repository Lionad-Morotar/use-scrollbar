<template>
  <vxe-table
    :class="kls"
    ref="vxeTableRef"
    height="100%"
    v-bind="$attrs"
  >
    <slot />
  </vxe-table>
</template>

<script setup lang="ts">
import { computed, watchEffect, useAttrs, useSlots, nextTick, ref, watch } from "vue";
import { until, refDebounced, eagerComputed, useVModel } from "@vueuse/core";
import { useScrollbar } from "@/hooks";
import { useDefer } from "./hooks";

const slots = useSlots();
if (!slots.default) {
  throw new Error("[ERR] no default slot");
}

const attrs = useAttrs() as any;
const emits = defineEmits(["update:tableRef"]);
const props = defineProps<{
  enable: boolean
  tableRef: any
}>();

const vxeTableRef = useVModel(props, "tableRef", emits);
const leftFixedWidth = ref(0);
const rightFixedWidth = ref(0);
watchEffect(async () => {
  if (!vxeTableRef.value) {
    return;
  }
  if (!attrs.data?.length) {
    return
  }
  console.log("[INFO] data", attrs.data?.length);
  await nextTick();
  try {
    const deferLeft = useDefer<HTMLElement>();
    const tickLeft = setInterval(() => {
      try {
        const leftFixed = vxeTableRef.value.$el.querySelector(".vxe-table--fixed-left-wrapper");
        if (leftFixed) {
          deferLeft.resolve(leftFixed);
          clearInterval(tickLeft);
        }
      } catch (err) {
        clearInterval(tickLeft);
        deferLeft.reject();
      }
    }, 17 * 5);
    deferLeft.then((leftFixed: HTMLElement) => {
      const width = leftFixed.clientWidth;
      leftFixedWidth.value = width;
    });
    const deferRight = useDefer<HTMLElement>();
    const tickRight = setInterval(() => {
      try {
        const rightFixed = vxeTableRef.value.$el.querySelector(".vxe-table--fixed-right-wrapper");
        if (rightFixed) {
          deferRight.resolve(rightFixed);
          clearInterval(tickRight);
        }
      } catch (err) {
        clearInterval(tickRight);
        deferRight.reject();
      }
    }, 17 * 5);
    deferRight.then((rightFixed: HTMLElement) => {
      const width = rightFixed.clientWidth;
      rightFixedWidth.value = width;
    });
  } catch (err) {
    leftFixedWidth.value = 0;
    rightFixedWidth.value = 0;
    console.log("[ERR]", err);
  }
});
const cssLeftFixedWidth = eagerComputed(() => {
  console.log("[INFO] leftFixedWidth.value", leftFixedWidth.value);
  return leftFixedWidth.value + "px";
});
const cssRightFixedWidth = eagerComputed(() => {
  console.log("[INFO] rightFixedWidth.value", rightFixedWidth.value);
  return rightFixedWidth.value + "px";
});

const barStates = useScrollbar();

console.log('[info] barStates', barStates)

watch(() => props.enable, async (enable) => {
  console.log('[info] 开启虚拟滚动条', enable)
  if (enable) {
    await nextTick();
    await until(vxeTableRef.value).toMatch((x) => x?.$el?.parentElement);
    try {
      const $table = vxeTableRef.value.$el;
      const $header = $table.querySelector(".vxe-table--header-wrapper");
      const $bodyWrapper = $table.querySelector(".vxe-table--body-wrapper");
      const $bodyContent = $table.querySelector(".vxe-table--body");
      const $bodyXSpace = $table.querySelector(".vxe-body--x-space");
      const $bodyYSpace = $table.querySelector(".vxe-body--y-space");

      // console.log('barStates', barStates)

      barStates.setOffset({ y: { top: $header } });
      barStates.init({
        mount: vxeTableRef,
        content: [$bodyContent, $bodyXSpace, $bodyYSpace],
        viewport: [$bodyWrapper]
      });
    } catch (err) {
      console.error("[ERR] error when init virtual scrollbar", err, vxeTableRef);
    }
  } else {
    barStates.destroy()
  }
}, {
  immediate: true,
})

const kls = refDebounced(computed(() => [
  props.enable ? 'is-virtual-scrollbar' : '',
  barStates.isDragging.x ? 'is-dragging-x' : '',
  barStates.isScrolling.x ? 'is-scrolling-x' : '',
  barStates.isScrolling.y ? 'is-scrolling-y' : '',
  (!barStates.isScrolling.x && !barStates.isScrolling.y) ? 'is-no-scrolling' : '',
]), 17 * 3)
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
  --color-1: rgba(0, 0, 0, 0%);
  --color-2: rgba(0, 0, 0, 0%);
  --color-3: rgba(0, 0, 0, 0%);
  --left-col-width: v-bind(cssLeftFixedWidth);
  --right-col-width: v-bind(cssRightFixedWidth);

  @table-header-column-height: 50px;
  @header-with-shadow-height: @table-header-column-height + 50px;
  .vxe-table--header-wrapper.body--wrapper {
    clip-path: polygon(var(--left-col-width, 0) 0, calc(100% - var(--right-col-width, 0)) 0%, calc(100% - var(--right-col-width, 0)) @table-header-column-height, 100% @table-header-column-height, 100% calc(100% + @header-with-shadow-height), 0 calc(100% + @header-with-shadow-height), 0 @table-header-column-height, var(--left-col-width) @table-header-column-height);
  }

  .vxe-table--header-wrapper {
    z-index: 9;
  }

  .vxe-table--fixed-left-wrapper,
  .vxe-table--fixed-right-wrapper {
    box-shadow: 0 0 8px 0 var(--color-1), 0 12px 48px 16px var(--color-2), 0 0 16px -8px var(--color-3);
    transition: box-shadow 0.35s ease-out;
    transition-delay: 0.5s;
    will-change: box-shadow;
  }
  .vxe-table--header-wrapper.body--wrapper {
    box-shadow: 0 0 8px 0 var(--color-1), 0 0 18px 16px var(--color-2), 0 0 16px -8px var(--color-3);
    transition: box-shadow 0.35s ease-out;
    transition-delay: 0.5s;
    will-change: box-shadow;
  }

  &:not(.is-dragging-x) {
    &.is-scrolling-x {
      .vxe-table--fixed-left-wrapper,
      .vxe-table--fixed-right-wrapper {
        --color-1: rgba(0, 0, 0, 6%);
        --color-2: rgba(0, 0, 0, 4%);
        --color-3: rgba(0, 0, 0, 10%);
        transition: box-shadow 0.25s ease-in;
        transition-delay: 0.01s;
      }
    }
    &.is-scrolling-y {
      .vxe-table--header-wrapper.body--wrapper {
        --color-1: rgba(0, 0, 0, 6%);
        --color-2: rgba(0, 0, 0, 4%);
        --color-3: rgba(0, 0, 0, 10%);
        transition: box-shadow 0.25s ease-in;
        transition-delay: 0.01s;
      }
    }
  }
}
</style>
