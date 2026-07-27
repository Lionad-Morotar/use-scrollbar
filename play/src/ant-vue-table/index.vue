<script setup lang="ts">
import { until, useElementSize } from '@vueuse/core'
import { computed, ref, unref, watch } from 'vue'
import { useScrollbar } from '@/hooks'

const props = withDefaults(
  defineProps<{
    enable?: boolean
  }>(),
  {
    enable: true,
  },
)

const tableRef = ref()
const { width, height } = useElementSize(tableRef)
const scroll = computed(() => ({
  x: unref(width) + 160 /* ？ */,
  y: unref(height) - 60 /* header height */,
}))

const barStates = useScrollbar()
watch(
  () => props.enable,
  async (enable) => {
    console.log('[info] 开启虚拟滚动条', enable)
    if (enable) {
      await until(tableRef.value).toMatch(x => x?.$el?.parentElement)
      try {
        const $table = tableRef.value.$el
        const $header = $table.querySelector('.ant-table-header')
        const $bodyContent = $table.querySelector('.ant-table-body > table')

        console.log('barStates', barStates)

        barStates.setOffset({ y: { top: $header } })
        barStates.init({
          mount: tableRef,
          content: [$bodyContent],
        })
      }
      catch (err) {
        console.error('[ERR] error when init virtual scrollbar', err, tableRef)
      }
    }
    else {
      barStates.destroy()
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <a-table
    ref="tableRef"
    :class="[props.enable ? 'is-virtual-scrollbar' : '']"
    :scroll="scroll"
    v-bind="$attrs"
  >
    <slot />
  </a-table>
</template>

<style lang="less">
  .is-virtual-scrollbar {
    &.ant-table-wrapper {
      box-sizing: border-box;
      border: solid 1px #333;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;

      td {
        white-space: nowrap;
      }
      .ant-table-body::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  }
</style>
