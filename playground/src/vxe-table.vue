<script lang="ts" setup>
import { Upload } from '@element-plus/icons-vue'
import { ElButton, ElIcon } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { useElementHover } from '@/hooks'
import VxeTableVirtualScrollbar from './vxe-table/index.vue'

const playRef = ref()
const isHover = useElementHover(playRef)

const vxeTableRef = ref()
const states = reactive({
  isVirtualScroll: true,
  isVirtualScrollbar: true,
  isLoading: false,
  tableData: [] as any[],
  sexList: [
    {
      label: '女',
      value: '0',
    },
    {
      label: '男',
      value: '1',
    },
  ],
})

function formatterSex({ cellValue }: any) {
  const item = states.sexList.find(item => item.value === cellValue)
  return item ? item.label : ''
}

let count = 0
let parentId = 0
const listCount = 500
function getTableData() {
  const res = Array(listCount)
    .fill(0)
    .map(() => {
      const res = {
        id: count++,
        parentId: null as number | null,
        name: `Test-${count + 1}`,
        role: 'Develop',
        address: Array(10).fill('long address long long long address').join(', '),
        // @ts-expect-error 动态生成 sex/age 列，展开的键不在行类型声明中
        ...Array.from({ length: 6 }).reduce((acc: any, _, idx) => {
          acc[`sex${idx + 1}`] = Math.random() < 0.5 ? '1' : '0'
          acc[`age${idx + 1}`] = Math.random() < 0.5 ? '1' : '0'
          return acc
        }, {} as Record<string, string>),
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

async function refresh() {
  states.isLoading = true
  states.tableData = []
  setTimeout(async () => {
    states.tableData = getTableData()
    states.isLoading = false
  }, 300)
}

async function addMore() {
  states.isLoading = true
  setTimeout(() => {
    states.tableData = states.tableData.concat(getTableData())
    states.isLoading = false
  }, 300)
}

onMounted(refresh)
watch(() => states.isVirtualScroll, refresh)
watch(() => states.isVirtualScrollbar, refresh)

async function measure() {
  if (!vxeTableRef.value) {
    throw new Error('[ERR] no vxeTableRef')
  }
  const startTime = performance.now()

  // 顺序滚动（原 NativeBird.mapSeries 的等价实现）：nativebird 的 export= 声明
  // 与 Bundler 模块解析不兼容，且其能力可用原生串行 await 完整替代，故移除该依赖
  for (let idx = 0; idx < 20; idx++)
    await vxeTableRef.value.scrollTo(0, idx * 30)

  const endTime = performance.now()
  console.log('[info] total time', endTime - startTime)
}
</script>

<template>
  <div ref="playRef" class="play-container">
    <div class="header">
      <h4>## VXETable with Virtual Scrollbars {{ isHover ? ' - Hovered' : '' }}</h4>
      <el-checkbox v-model="states.isVirtualScroll">
        表格虚拟滚动
      </el-checkbox>
      <el-checkbox v-model="states.isVirtualScrollbar">
        表格虚拟滚动条
      </el-checkbox>
      <ElButton type="primary" @click="measure">
        测试滚动性能
      </ElButton>
      <ElButton type="primary" @click="refresh">
        刷新
      </ElButton>
      <ElButton type="primary" @click="addMore">
        +{{ listCount }}条数据
      </ElButton>
    </div>
    <VxeTableVirtualScrollbar
      v-model:table-ref="vxeTableRef"
      border
      stripe
      :enable="states.isVirtualScrollbar"
      :loading="states.isLoading"
      :tree-config="{ transform: true }"
      :column-config="{ resizable: true }"
      :row-config="{ isHover: true }"
      :checkbox-config="{ labelField: 'id', highlight: true }"
      :data="states.tableData"
      :scroll-x="{ enabled: states.isVirtualScroll, oSize: 0 }"
      :scroll-y="{ enabled: states.isVirtualScroll, oSize: 0 }"
    >
      <vxe-column type="seq" :width="180" fixed="left" tree-node />
      <vxe-column type="checkbox" title="ID" :width="140" />
      <vxe-column field="name" title="Name" :width="140" />
      <vxe-column field="sex" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="address" title="Address" show-overflow :min-width="300" />
      <vxe-column field="age1" title="Age" :width="120" />
      <vxe-column field="sex1" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="age2" title="Age" :width="120" />
      <vxe-column field="sex2" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="age3" title="Age" :width="120" />
      <vxe-column field="sex3" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="age4" title="Age" :width="120" />
      <vxe-column field="sex4" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="age5" title="Age" :width="120" />
      <vxe-column field="sex5" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column field="age6" title="Age" :width="120" />
      <vxe-column field="sex6" title="Sex" :formatter="formatterSex" :width="140" />
      <vxe-column width="220">
        <ElButton size="small" text>
          Upload<ElIcon class="el-icon--right">
            <Upload />
          </ElIcon>
        </ElButton>
        <ElButton size="small" text>
          Upload<ElIcon class="el-icon--right">
            <Upload />
          </ElIcon>
        </ElButton>
      </vxe-column>
    </VxeTableVirtualScrollbar>
  </div>
</template>
