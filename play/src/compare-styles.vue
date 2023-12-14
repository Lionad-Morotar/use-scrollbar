<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## Principle（Simply Usage）</h4>
      <el-radio-group class="type-radio-group" v-model="states.type">
        <el-radio label="normal">Normal</el-radio>
        <el-radio label="steam">Steam</el-radio>
        <el-radio label="css-tricks">CSS Tricks</el-radio>
      </el-radio-group>
    </div>
    <div class="compare-container">

      <h4>use-scrollbars</h4>
      <div class="complex-component-example cutom-scrollbar" :class="kls" ref="elemRef">
        <div class="content-wrapper">
          <pre class="content">
// use-scrollbar
function hello() {
  console.log('hello world!')
  console.log('I like cola and cola and longcola and longcola and longcola and longcola and longcola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}
          </pre>
        </div>
      </div>

      <!-- native-scrollbar -->
      <h4>native scrollbar</h4>
      <div class="complex-component-example" :class="kls">
        <div class="content-wrapper">
          <pre class="content">
// native-scrollbar
function hello() {
  console.log('hello world!')
  console.log('I like cola and cola and longcola and longcola and longcola and longcola and longcola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}
          </pre>
        </div>
      </div>

      <!-- OverlayScrollbars -->
      <h4>overlay-scrollbars-vue</h4>
      <div class="complex-component-example" :class="kls">
        <div class="content-wrapper" ref="overlayScrollbarDivRef">
          <pre class="content">
// OverlayScrollbars
function hello() {
  console.log('hello world!')
  console.log('I like cola and cola and longcola and longcola and longcola and longcola and longcola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}

function world() {
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
  console.log('hello world!')
  console.log('I like cola and cola')
}
          </pre>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, watchEffect, onMounted } from "vue";
import { useOverlayScrollbars } from "overlayscrollbars-vue";
import { useScrollbar } from "@/hooks";

import type { Theme } from "@/hooks";

const querys = new URLSearchParams(window.location.search);
const states = reactive({
  type: (querys.get('type') || 'normal') as Theme
});
const kls = computed(() => ({
  [`is-${states.type}`]: true,
}))

const elemRef = ref<HTMLElement>();
const barStates = useScrollbar(elemRef);

watchEffect(() => {
  barStates.theme = states.type
})

watchEffect(() => {
  const offset = {
      x: {
        left: 8 + 2,
        bottom: 8 + 2.5,
      },
      y: {
        top: 8 + 2,
        right: 8 + 2.5,
      },
    }
  if (states.type === 'css-tricks') {
    offset.x.left = 0
    offset.x.bottom = 0
    offset.y.top = 0
    offset.y.right = 0
  }
  if (states.type === 'steam') {
    offset.y.right = 8 + 2
  }
  barStates.offset = offset
})

console.log('[debug] barStates', barStates);

const overlayScrollbarDivRef = ref(null);
const reactiveParams = reactive({ options: {}, events: {}, defer: false });
const [initialize, instance] = useOverlayScrollbars(reactiveParams);

onMounted(() => {
  console.log('overlayScrollbarDivRef.value')
  initialize({ target: overlayScrollbarDivRef.value! });
})
</script>

<style scoped>
.type-radio-group {
  flex-shrink: 0;
  margin-right: 26px;
}
.compare-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  box-sizing: border-box;
  padding-bottom: 12vh;
  width: 100%;
  height: auto;
  border: solid 1px var(--el-border-color-dark);
  overflow: auto;

  h4 {
    margin: 1em 0 0 0;
    font-size: 16px;
    line-height: 1;
  }
}
.complex-component-example {
  position: relative;
  padding: 8px;
  width: 600px;
  height: 372px;
  border: solid 2px black;
  background: solid 1px var(--el-border-color-dark);
}
.content-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  border-radius: 4px;
  overflow: auto auto;
}
.complex-component-example .content {
  margin: 0;
  padding: 12px;
  width: max-content;
}
.complex-component-example.cutom-scrollbar .content-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
}
/* theme steam */
.complex-component-example.is-steam .content-wrapper {
  background: linear-gradient(45deg, #1c1f22, #2c313c);
  color: #ccc;
}
.complex-component-example.is-steam .content-wrapper .content {
  background: unset;
}
/* theme css-tricks */
.complex-component-example.is-css-tricks {
  border: none;
  background: linear-gradient(13deg, #262626, #545454);
  color: #ccc;
}
.complex-component-example.is-css-tricks .content-wrapper,
.complex-component-example.is-css-tricks .content-wrapper .content {
  background: unset;
}
</style>
