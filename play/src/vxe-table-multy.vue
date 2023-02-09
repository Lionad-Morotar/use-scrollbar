<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## VXETable with Virtual Scrollbars {{ isHover ? ' - Hovered' : '' }}</h4>
      <el-checkbox v-model="states.isVirtualScroll">表格虚拟滚动</el-checkbox>
      <el-checkbox v-model="states.isVirtualScrollbar">表格虚拟滚动条</el-checkbox>
    </div>
    <div class="table-cons">
      <!-- <div class="padding" /> -->
      <vxe-table-virtual-scrollbar
        border
        stripe
        :enable="states.isVirtualScrollbar"
        :loading="states.isLoading"
        :tree-config="{transform: true}"
        :column-config="{resizable: true}"
        :row-config="{isHover: true}"
        :checkbox-config="{labelField: 'id', highlight: true}"
        :data="states.tableData"
        :scroll-x="{ enabled: states.isVirtualScroll }"
        :scroll-y="{ enabled: states.isVirtualScroll }"
        >
        <vxe-column type="seq" :width="180" fixed="left" tree-node></vxe-column>
        <vxe-column type="checkbox" title="ID" :width="140"></vxe-column>
        <vxe-column field="name" title="Name" :width="140"></vxe-column>
        <vxe-column field="sex" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
        <vxe-column field="age" title="Age" :width="120"></vxe-column>
        <vxe-column field="address" title="Address" show-overflow :min-width="300"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column type="seq" :width="60" fixed="right"></vxe-column>
      </vxe-table-virtual-scrollbar>
      <vxe-table-virtual-scrollbar
        border
        stripe
        :enable="states.isVirtualScrollbar"
        :loading="states.isLoading"
        :tree-config="{transform: true}"
        :column-config="{resizable: true}"
        :row-config="{isHover: true}"
        :checkbox-config="{labelField: 'id', highlight: true}"
        :data="states.tableData"
        :scroll-x="{ enabled: states.isVirtualScroll }"
        :scroll-y="{ enabled: states.isVirtualScroll }"
        >
        <vxe-column type="seq" :width="180" fixed="left" tree-node></vxe-column>
        <vxe-column type="checkbox" title="ID" :width="140"></vxe-column>
        <vxe-column field="name" title="Name" :width="140"></vxe-column>
        <vxe-column field="sex" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
        <vxe-column field="age" title="Age" :width="120"></vxe-column>
        <vxe-column field="address" title="Address" show-overflow :min-width="300"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column type="seq" :width="60" fixed="right"></vxe-column>
      </vxe-table-virtual-scrollbar>
      <!-- <vxe-table-virtual-scrollbar
        border
        stripe
        :enable="states.isVirtualScrollbar"
        :loading="states.isLoading"
        :tree-config="{transform: true}"
        :column-config="{resizable: true}"
        :row-config="{isHover: true}"
        :checkbox-config="{labelField: 'id', highlight: true}"
        :data="states.tableData"
        :scroll-x="{ enabled: states.isVirtualScroll }"
        :scroll-y="{ enabled: states.isVirtualScroll }"
        >
        <vxe-column type="seq" :width="180" fixed="left" tree-node></vxe-column>
        <vxe-column type="checkbox" title="ID" :width="140"></vxe-column>
        <vxe-column field="name" title="Name" :width="140"></vxe-column>
        <vxe-column field="sex" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
        <vxe-column field="age" title="Age" :width="120"></vxe-column>
        <vxe-column field="address" title="Address" show-overflow :min-width="300"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column field="address" title="Address Another" :width="1000"></vxe-column>
        <vxe-column type="seq" :width="60" fixed="right"></vxe-column>
      </vxe-table-virtual-scrollbar> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useElementHover } from "@/hooks";
import VxeTableVirtualScrollbar from "./vxe-table/index.vue";

const playRef = ref();
const isHover = useElementHover(playRef);

 const states = reactive({
  isVirtualScroll: true,
  isVirtualScrollbar: true,
  isLoading: false,
  tableData: [] as any[],
  sexList: [
    {
      label: '女',
      value: '0'
    },
    {
      label: '男',
      value: '1'
    }
  ]
})

const formatterSex = ({ cellValue }: any) => {
  const item = states.sexList.find(item => item.value === cellValue)
  return item ? item.label : ''
}

const refresh = async () => {
  states.isLoading = true
  setTimeout(() => {
    const itemCount = 500
    let parentId = 0
    states.tableData = Array(itemCount).fill(0).map((x, idx) => {
      const res = {
        id: idx,
        parentId: null as number | null,
        name: 'Test-' + (idx + 1),
        role: 'Develop',
        sex: Math.random() < 0.5 ? '1' : '0',
        age: 28,
        address: Array(10).fill('long address long long long address').join(', ')
      }
      if (Math.random() < 0.5) {
        parentId = idx
      }
      if (Math.random() < 0.5) {
        res.parentId = parentId
      }
      return res
    })
    states.isLoading = false
  }, 300)
}

onMounted(refresh)
watch(() => states.isVirtualScroll, refresh)
watch(() => states.isVirtualScrollbar, refresh)
</script>

<style lang="less">
.table-cons {
  display: grid;
  grid-template: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 3fr) / 1fr;
  grid-gap: 1%;
}
</style>
