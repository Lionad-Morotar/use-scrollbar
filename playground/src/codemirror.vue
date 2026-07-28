<script lang="ts" setup>
import { basicSetup, EditorView } from 'codemirror'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useScrollbar } from '@/hooks'

const wrapperRef = ref<HTMLElement>()
const editorRef = ref<HTMLElement>()
const states = reactive({
  enable: true,
})

// 纵向超长行数 + 不折行的超长行撑出双向滚动；
// 超长行放在文档前部：CodeMirror 视口渲染只量已渲染行宽，
// 藏在未渲染区段的超长行不会在初次加载时贡献横向溢出
const longLine = `  console.log('${'very long cola and '.repeat(12)}')`
const doc = [
  '// CodeMirror 6 + use-scrollbar',
  'function hello() {',
  longLine,
  ...Array.from({ length: 60 }, (_, idx) => `  console.log('hello world! ${idx + 1}')`),
  ...Array.from({ length: 30 }, (_, idx) => `  console.log('hello again! ${idx + 1}')`),
  '}',
].join('\n')

let view: EditorView | null = null
const barStates = useScrollbar()

// EditorView 构造即同步产出 DOM，onMounted 后即可 init
async function applyBar(enable: boolean) {
  if (!enable) {
    barStates.destroy()
    return
  }
  await nextTick()
  const $viewport = wrapperRef.value?.querySelector('.cm-scroller')
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
  // 定高编辑区靠 theme 把 .cm-scroller 变成原生滚动元素，use-scrollbar 才能接管；
  // EditorView 配置直接收 doc/extensions（内部自建 state），无需引入 @codemirror/state
  view = new EditorView({
    doc,
    extensions: [
      basicSetup,
      EditorView.theme({
        '&': { height: '320px' },
        '.cm-scroller': { overflow: 'auto' },
      }),
    ],
    parent: editorRef.value!,
  })
  void applyBar(states.enable)
})

onUnmounted(() => {
  barStates.destroy()
  view?.destroy()
  view = null
})
</script>

<template>
  <div class="play-container" data-testid="codemirror-play">
    <!-- 页头：开关与说明 -->
    <div class="header">
      <h4>## CodeMirror 6 with Virtual Scrollbars</h4>
      <el-checkbox v-model="states.enable">
        虚拟滚动条
      </el-checkbox>
    </div>
    <!-- 编辑器容器：虚拟滚动条挂载层，须相对定位；内部 div 交由 CodeMirror 接管 -->
    <div
      ref="wrapperRef"
      class="codemirror-play"
      :class="{ 'is-virtual-scrollbar': states.enable }"
    >
      <div ref="editorRef" />
    </div>
  </div>
</template>

<style lang="less">
  .codemirror-play {
    position: relative;
    width: 600px;
    border: solid 1px #333;
  }
  /* 开启虚拟滚动条后隐藏原生滚动条，避免双条并存 */
  .codemirror-play.is-virtual-scrollbar .cm-scroller::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
</style>
