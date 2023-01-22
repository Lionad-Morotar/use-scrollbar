<template>
  <div class="play-container" ref="playRef">
    <vxe-table
      border
      stripe
      height="100%"
      :loading="demo1.loading"
      :column-config="{resizable: true}"
      :row-config="{isHover: true}"
      :checkbox-config="{labelField: 'id', highlight: true, range: true}"
      :data="demo1.tableData">
      <vxe-column type="seq" :width="60"></vxe-column>
      <vxe-column type="checkbox" title="ID" :width="140"></vxe-column>
      <vxe-column field="name" title="Name" sortable :width="140"></vxe-column>
      <vxe-column field="sex" title="Sex" :filters="demo1.sexList" :filter-multiple="false" :formatter="formatterSex" :width="140">
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
    </vxe-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";

const playRef = ref();

 const demo1 = reactive({
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

const formatterSex = ({ cellValue }) => {
  const item = demo1.sexList.find(item => item.value === cellValue)
  return item ? item.label : ''
}

const filterAgeMethod = ({ value, row }) => {
  return row.age >= value
}

onMounted(() => {
  demo1.loading = true
  setTimeout(() => {
    demo1.tableData = Array(300).fill(0).map((x, idx) => {
      return { id: 10000 + idx, name: 'Test-' + (idx + 1), role: 'Develop', sex: '0', age: 28, address: Array(10).fill('long address long long long address').join(', ') }
    })
    demo1.loading = false
  }, 1200)
})
</script>

<style>
.vxe-table {
  width: 100%;
  height: 100%;
}
</style>
