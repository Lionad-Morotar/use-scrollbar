<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## VXETable with Virtual Scrollbars {{ isHover ? ' - Hovered' : '' }}</h4>
      <el-checkbox v-model="states.isVirtualScroll">表格虚拟滚动</el-checkbox>
      <el-checkbox v-model="states.isVirtualScrollbar">表格虚拟滚动条</el-checkbox>
      <el-button type="primary" @click="measure">测试滚动性能</el-button>
      <el-button type="primary" @click="refresh">刷新</el-button>
      <el-button type="primary" @click="addMore">+{{ listCount }}条数据</el-button>
    </div>
    <vxe-table-virtual-scrollbar
      v-model:tableRef="vxeTableRef"
      border
      stripe
      :enable="states.isVirtualScrollbar"
      :loading="states.isLoading"
      :tree-config="{transform: true}"
      :column-config="{resizable: true }"
      :row-config="{isHover: true}"
      :checkbox-config="{labelField: 'id', highlight: true}"
      :data="states.tableData"
      :scroll-x="{ enabled: states.isVirtualScroll, oSize: 0 }"
      :scroll-y="{ enabled: states.isVirtualScroll, oSize: 0 }"
      >
      <vxe-column type="seq" :width="180" fixed="left" tree-node></vxe-column>
      <vxe-column type="checkbox" title="ID" :width="140"></vxe-column>
      <vxe-column field="name" title="Name" :width="140"></vxe-column>
      <vxe-column field="sex" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="address" title="Address" show-overflow :min-width="300"></vxe-column>
      <vxe-column field="age1" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex1" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age2" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex2" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age3" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex3" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age4" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex4" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age5" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex5" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age6" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex6" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age7" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex7" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age8" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex8" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age9" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex9" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age10" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex10" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age11" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex11" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age12" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex12" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age13" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex13" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age14" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex14" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age15" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex15" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age16" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex16" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age17" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex17" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age18" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex18" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age19" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex19" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column field="age20" title="Age" :width="120"></vxe-column>
      <vxe-column field="sex20" title="Sex" :formatter="formatterSex" :width="140"></vxe-column>
      <vxe-column width="500" fixed="right">
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
        <el-button size="small" text>
          Upload<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
      </vxe-column>
    </vxe-table-virtual-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { ElButton, ElIcon } from "element-plus"
import { Upload } from "@element-plus/icons-vue"
import { useElementHover } from "@/hooks";
import VxeTableVirtualScrollbar from "./vxe-table/index.vue";
import NativeBird from "nativebird";

const playRef = ref();
const isHover = useElementHover(playRef);

const vxeTableRef = ref();
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

let count = 0
let parentId = 0
const listCount = 500
const getTableData = () => {
  const res = Array(listCount).fill(0).map((x) => {
    const res = {
      id: count++,
      parentId: null as number | null,
      name: 'Test-' + (count + 1),
      role: 'Develop',
      address: Array(10).fill('long address long long long address').join(', '),
      // @ts-ignore
      ...(Array.from({ length: 19 }).reduce((acc: any, _, idx) => {
        acc[`sex${idx + 1}`] = Math.random() < 0.5 ? '1' : '0'
        acc[`age${idx + 1}`] = Math.random() < 0.5 ? '1' : '0'
        return acc
      }, {} as Record<string, string>))
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
  setTimeout(async () => {
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

const measure = (async () => {
  if (!vxeTableRef.value) {
    throw new Error('[ERR] no vxeTableRef')
  }
  const startTime = performance.now()

  await NativeBird.mapSeries(Array.from({ length: 20 }), async (_, idx) => {
    await vxeTableRef.value.scrollTo(0, idx * 30)
  })

  const endTime = performance.now()
  console.log('[info] total time', endTime - startTime)
})
</script>
