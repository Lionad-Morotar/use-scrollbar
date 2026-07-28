<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useScrollbar } from '@/hooks'

const wrapperRef = ref<HTMLElement>()
const states = reactive({
  enable: true,
  tableData: Array.from({ length: 300 }, (_, idx) => ({
    id: idx + 1,
    name: `Test-${idx + 1}`,
    role: 'Develop',
    sex: idx % 2 ? '女' : '男',
    address: Array(10).fill('long address long long long address').join(', '),
    ...Object.fromEntries(
      Array.from({ length: 6 }, (_, i) => [`age${i + 1}`, 20 + ((idx + i) % 30)]),
    ),
  })),
})

const barStates = useScrollbar()

// el-table 定高后表体才有滚动尺寸；其内部滚动容器实现随版本漂移
// （el-scrollbar__wrap 或直接 body-wrapper），按序兜底
async function applyBar(enable: boolean) {
  if (!enable) {
    barStates.destroy()
    return
  }
  await nextTick()
  const $viewport = wrapperRef.value?.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    ?? wrapperRef.value?.querySelector('.el-table__body-wrapper')
  if (!$viewport)
    return
  barStates.init({
    mount: wrapperRef,
    wrapper: [$viewport as HTMLElement],
    content: Array.from($viewport.children) as HTMLElement[],
  })
}

watch(() => states.enable, applyBar)

onMounted(() => {
  void applyBar(states.enable)
})
</script>

<template>
  <div class="play-container" data-testid="el-table-play">
    <!-- 页头：开关与说明 -->
    <div class="header">
      <h4>## Element Plus Table with Virtual Scrollbars</h4>
      <el-checkbox v-model="states.enable">
        虚拟滚动条
      </el-checkbox>
    </div>
    <!-- el-table 容器：虚拟滚动条挂载层，须相对定位 -->
    <div
      ref="wrapperRef"
      class="el-table-play"
      :class="{ 'is-virtual-scrollbar': states.enable }"
    >
      <el-table :data="states.tableData" height="420" border stripe>
        <el-table-column type="index" width="60" fixed />
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="Name" width="140" />
        <el-table-column prop="role" label="Role" width="140" />
        <el-table-column prop="sex" label="Sex" width="100" />
        <!-- 列宽合计刻意超出常见视口宽，保证横向溢出可复现 -->
        <el-table-column prop="address" label="Address" min-width="1200" show-overflow-tooltip />
        <el-table-column prop="age1" label="Age1" width="100" />
        <el-table-column prop="age2" label="Age2" width="100" />
        <el-table-column prop="age3" label="Age3" width="100" />
        <el-table-column prop="age4" label="Age4" width="100" />
        <el-table-column prop="age5" label="Age5" width="100" />
        <el-table-column prop="age6" label="Age6" width="100" />
      </el-table>
    </div>
  </div>
</template>

<style lang="less">
  .el-table-play {
    position: relative;
    width: 100%;
    border: solid 1px #333;
  }
  /* 开启虚拟滚动条后同时隐藏原生滚动条与 el-scrollbar 自带的细条，避免多 Scrollbar 并存 */
  .el-table-play.is-virtual-scrollbar .el-scrollbar__wrap::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  .el-table-play.is-virtual-scrollbar .el-scrollbar__bar {
    display: none;
  }
</style>
