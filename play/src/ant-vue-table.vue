<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## ant-vue table with Virtual Scrollbars</h4>
      <el-checkbox v-model="states.isVirtualScrollbar">表格虚拟滚动条</el-checkbox>
    </div>
    <a-table-pro ref="tableRef" :enable="states.isVirtualScrollbar" :columns="columns" :data-source="data"  :pagination="{ pageSize: 50 }" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref } from "vue";
import ATablePro from "./ant-vue-table/index.vue";

const playRef = ref();
const tableRef = ref();
onMounted(() => {
  console.log('playRef', playRef.value, tableRef.value)
})

const states = reactive({
  isVirtualScrollbar: false,
})

const columns = [
  { title: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
  { title: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
  { title: 'Column 1', dataIndex: 'address', key: '1', width: 150 },
  { title: 'Column 2', dataIndex: 'address', key: '2', width: 150 },
  { title: 'Column 3', dataIndex: 'address', key: '3', width: 150 },
  { title: 'Column 4', dataIndex: 'address', key: '4', width: 150 },
  { title: 'Column 5', dataIndex: 'address', key: '5', width: 150 },
  { title: 'Column 6', dataIndex: 'address', key: '6', width: 150 },
  { title: 'Column 7', dataIndex: 'address', key: '7', width: 150 },
  { title: 'Column 8', dataIndex: 'address', key: '8' },
];

const data = [];

for (let i = 0; i < 1000; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}
</script>
