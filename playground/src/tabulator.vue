<script lang="ts" setup>
import type { ColumnDefinition, Options } from 'tabulator-tables'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useScrollbar } from '@/hooks'
import 'tabulator-tables/dist/css/tabulator.min.css'

const wrapperRef = ref<HTMLElement>()
const tableElRef = ref<HTMLElement>()
const states = reactive({
  enable: true,
})

const columns: ColumnDefinition[] = [
  { title: 'ID', field: 'id', width: 90 },
  { title: 'Name', field: 'name', width: 140 },
  { title: 'Role', field: 'role', width: 140 },
  { title: 'Sex', field: 'sex', width: 100 },
  { title: 'Age', field: 'age', width: 100 },
  { title: 'Address', field: 'address', minWidth: 320 },
]
const rowData = Array.from({ length: 300 }, (_, idx) => ({
  id: idx + 1,
  name: `Test-${idx + 1}`,
  role: 'Develop',
  sex: idx % 2 ? '女' : '男',
  age: 20 + (idx % 30),
  address: Array(10).fill('long address long long long address').join(', '),
}))

let table: Tabulator | null = null
const barStates = useScrollbar()

// tableBuilt 之前 .tabulator-tableholder 没有滚动尺寸，提前 init 会量出 0
async function applyBar(enable: boolean) {
  if (!enable) {
    barStates.destroy()
    return
  }
  await nextTick()
  const $viewport = wrapperRef.value?.querySelector('.tabulator-tableholder')
  if (!$viewport)
    return
  barStates.init({
    mount: wrapperRef,
    wrapper: [$viewport as HTMLElement],
    content: Array.from($viewport.children) as HTMLElement[],
  })
}

watch(() => states.enable, applyBar)

const options: Options = {
  height: '420px',
  data: rowData,
  columns,
  layout: 'fitColumns',
}

onMounted(() => {
  table = new Tabulator(tableElRef.value!, options)
  // @types/tabulator-tables 的 Options 类型不含事件回调字段，统一走实例 on() 订阅
  table.on('tableBuilt', () => void applyBar(states.enable))
})

onUnmounted(() => {
  barStates.destroy()
  table?.destroy()
  table = null
})
</script>

<template>
  <div class="play-container" data-testid="tabulator-play">
    <!-- 页头：开关与说明 -->
    <div class="header">
      <h4>## Tabulator with Virtual Scrollbars</h4>
      <el-checkbox v-model="states.enable">
        虚拟滚动条
      </el-checkbox>
    </div>
    <!-- Tabulator 容器：虚拟滚动条挂载层，须相对定位；内部 div 交由 Tabulator 接管 -->
    <div
      ref="wrapperRef"
      class="tabulator-play"
      :class="{ 'is-virtual-scrollbar': states.enable }"
    >
      <div ref="tableElRef" />
    </div>
  </div>
</template>

<style lang="less">
  .tabulator-play {
    position: relative;
    width: 100%;
    border: solid 1px #333;
  }
  /* 开启虚拟滚动条后隐藏原生滚动条，避免双条并存 */
  .tabulator-play.is-virtual-scrollbar .tabulator-tableholder::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
</style>
