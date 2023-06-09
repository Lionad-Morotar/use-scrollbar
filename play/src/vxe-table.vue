<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## VXETable with Virtual Scrollbars {{ isHover ? ' - Hovered' : '' }}</h4>
      <el-checkbox v-model="states.isVirtualScroll">表格虚拟滚动</el-checkbox>
      <el-checkbox v-model="states.isVirtualScrollbar">表格虚拟滚动条</el-checkbox>
      <el-button type="primary" @click="refresh">刷新</el-button>
      <el-button type="primary" @click="addMore">+{{ listCount }}条数据</el-button>
    </div>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useElementHover } from "@/hooks";
import VxeTableVirtualScrollbar from "./vxe-table/index.vue";

const playRef = ref();
const isHover = useElementHover(playRef);

 const states = reactive({
  isVirtualScroll: false,
  isVirtualScrollbar: false,
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

let count = 0
let parentId = 0
const listCount = 50
const getTableData = () => {
  const res = Array(listCount).fill(0).map((x) => {
    const res = {
      id: count++,
      parentId: null as number | null,
      name: 'Test-' + (count + 1),
      role: 'Develop',
      sex: Math.random() < 0.5 ? '1' : '0',
      age: 28,
      address: Array(10).fill('long address long long long address').join(', ')
    }
    if (Math.random() < 0.5) {
      parentId = count
    }
    if (Math.random() < 0.5) {
      res.parentId = parentId
    }
    return res
  })
  return res
}

const refresh = async () => {
  states.isLoading = true
  states.tableData = []
  setTimeout(() => {
    states.tableData = getTableData()
    states.isLoading = false
  }, 300)
}

const addMore = async () => {
  states.isLoading = true
  setTimeout(() => {
    states.tableData = states.tableData.concat(getTableData())
    states.isLoading = false
  }, 300)
}

onMounted(refresh)
watch(() => states.isVirtualScroll, refresh)
watch(() => states.isVirtualScrollbar, refresh)
</script>
