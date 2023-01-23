<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## VXETable Example {{ isHover ? ' - Hovered' : '' }}</h4>
      <el-checkbox v-model="states.isVirtualScroll">表格虚拟滚动</el-checkbox>
    </div>
    <vxe-table-virtual-scrollbar
      border
      stripe
      :loading="states.loading"
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
      <vxe-column field="name" title="Name" sortable :width="140"></vxe-column>
      <vxe-column field="sex" title="Sex" :filters="states.sexList" :filter-multiple="false" :formatter="formatterSex" :width="140">
      </vxe-column>
      <vxe-column
        field="age"
        title="Age"
        sortable
        :filters="[{label: '大于16岁', value: 16}, {label: '大于26岁', value: 26}, {label: '大于30岁', value: 30}]"
        :filter-method="filterAgeMethod"
        :width="120">
      </vxe-column>
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
import VxeTableVirtualScrollbar from "./vxe-table-virtual-scrollbar.vue";

const playRef = ref();
const isHover = useElementHover(playRef);

 const states = reactive({
  isVirtualScroll: false,
  loading: false,
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

const filterAgeMethod = ({ value, row }: any) => {
  return row.age >= value
}

const refresh = async () => {
  states.loading = true
  setTimeout(() => {
    const itemCount = 500
    let parentId = 0
    states.tableData = Array(itemCount).fill(0).map((x, idx) => {
      const res = { id: idx, parentId: null,  name: 'Test-' + (idx + 1), role: 'Develop', sex: '0', age: 28, address: Array(10).fill('long address long long long address').join(', ') }
      if (Math.random() < 0.5) {
        parentId = idx
      }
      if (Math.random() < 0.5) {
        res.parentId = parentId
      }
      return res
    })
    states.loading = false
  }, 300)
}

onMounted(refresh)
watch(() => states.isVirtualScroll, refresh)
</script>

<style>
.play-container {
  display: grid;
  grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);
  box-sizing: border-box;
  padding: 8px;
  border: solid 2px #eee;
  overflow: hidden;
}
.header {
  display: flex;
  gap: 1em;
}
.header h4 {
  margin: 0;
  padding: 0;
  width: 100%;
  line-height: 1.75em;
  font-size: 22px;
  color: black;
  text-align: left;
}
</style>
