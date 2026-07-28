<script lang="ts" setup>
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import { nextTick, reactive, ref, watch } from 'vue'
import { useScrollbar } from '@/hooks'

// AG Grid v33+ 模块化体系：功能模块须显式注册，样式随 themeQuartz 运行时注入，
// 不再走 css import
ModuleRegistry.registerModules([AllCommunityModule])

const wrapperRef = ref<HTMLElement>()
const states = reactive({
  enable: true,
  // 列宽合计按容器宽适配（address 吃 flex），只演示纵向滚动；
  // 容器过窄时 address 的 minWidth 兜底仍可能撑出横向，滚动条会如实出现
  rowData: Array.from({ length: 300 }, (_, idx) => ({
    id: idx + 1,
    name: `Test-${idx + 1}`,
    role: 'Develop',
    sex: idx % 2 ? '女' : '男',
    age: 20 + (idx % 30),
    address: Array(10).fill('long address long long long address').join(', '),
  })),
})

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 140 },
  { field: 'role', headerName: 'Role', width: 140 },
  { field: 'sex', headerName: 'Sex', width: 100 },
  { field: 'age', headerName: 'Age', width: 100 },
  { field: 'address', headerName: 'Address', flex: 1, minWidth: 320 },
]
const defaultColDef = { resizable: true, sortable: true, filter: true }

const barStates = useScrollbar()

// gridReady 之前 AG Grid 的滚动视口 DOM 尚未渲染，只能在此之后 init；
// 滚动视口类名 .ag-grid-viewport 为 v36 实测（旧版 .ag-body-viewport 已改名）
async function applyBar(enable: boolean) {
  if (!enable) {
    barStates.destroy()
    return
  }
  await nextTick()
  const $viewport = wrapperRef.value?.querySelector('.ag-grid-viewport')
  if (!$viewport)
    return
  barStates.init({
    mount: wrapperRef,
    wrapper: [$viewport as HTMLElement],
    content: Array.from($viewport.children) as HTMLElement[],
  })
}

watch(() => states.enable, applyBar)

function onGridReady() {
  void applyBar(states.enable)
}
</script>

<template>
  <div class="play-container" data-testid="ag-grid-play">
    <!-- 页头：开关与说明 -->
    <div class="header">
      <h4>## AG Grid with Virtual Scrollbars</h4>
      <el-checkbox v-model="states.enable">
        虚拟滚动条
      </el-checkbox>
    </div>
    <!-- AG Grid 容器：虚拟滚动条挂载层，须相对定位且定高 -->
    <div
      ref="wrapperRef"
      class="ag-grid-play"
      :class="{ 'is-virtual-scrollbar': states.enable }"
    >
      <AgGridVue
        class="ag-grid-inner"
        :theme="themeQuartz"
        :column-defs="columnDefs"
        :row-data="states.rowData"
        :default-col-def="defaultColDef"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<style lang="less">
  .ag-grid-play {
    position: relative;
    width: 100%;
    height: 460px;
    border: solid 1px #333;
  }
  .ag-grid-inner {
    width: 100%;
    height: 100%;
  }
  /* 开启虚拟滚动条后隐藏原生滚动条，避免双条并存；
     AG Grid v36 默认已隐藏原生条（scrollbar-width:none），此规则为跨版本冗余兜底 */
  .ag-grid-play.is-virtual-scrollbar .ag-grid-viewport::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
</style>
