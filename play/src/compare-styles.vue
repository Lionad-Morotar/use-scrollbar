<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## Principle（Simply Usage）</h4>
      <el-radio-group class="type-radio-group" v-model="states.type">
        <el-radio :label="1">Normal</el-radio>
        <el-radio :label="2">Steam</el-radio>
      </el-radio-group>
    </div>
    <div class="compare-container">

      <!-- native-scrollbar -->
      <div class="complex-component-example">
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

      <!-- custom-scrollbar -->
      <div class="complex-component-example cutom-scrollbar" ref="elemRef">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useScrollbar } from "@/hooks";

const states = reactive({
  type: 1
});

const elemRef = ref<HTMLElement>();
const barStates = useScrollbar(elemRef, {
  offset: {
    x: {
      left: 8 + 2,
      bottom: 8 + 2,
    },
    y: {
      top: 8 + 2,
      right: 8 + 4,
    },
  }
});

console.log('[debug] barStates', barStates);
</script>

<style scoped>
.type-radio-group {
  flex-shrink: 0;
  margin-right: 26px;
}
.compare-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2em;
  box-sizing: border-box;
  padding-bottom: 12vh;
  width: 100%;
  height: 100%;
  border: solid 1px #eee;
}
.complex-component-example {
  position: relative;
  padding: 8px;
  width: 600px;
  height: 372px;
  border: solid 2px black;
  background: #eee;
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
</style>
