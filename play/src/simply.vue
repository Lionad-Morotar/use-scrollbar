<template>
  <div class="play-container" ref="playRef">
    <div class="header">
      <h4>## Principle（Simply Usage）</h4>
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
import { ref, reactive, watch, nextTick, onMounted } from "vue";
import { useScrollbar } from "@/hooks";

const elemRef = ref<HTMLElement>();
const barStates = useScrollbar();

watch(elemRef, async ($elm) => {
  if ($elm) {
    const $content = $elm.querySelector('.content')
    barStates.offset.x.left = 8 + 2
    barStates.offset.x.bottom = 8 + 4
    barStates.offset.y.top = 8 + 2
    barStates.offset.y.right = 8 + 4
    barStates.init({
      mount: $elm,
      content: $content
    })
  }
})
</script>

<style scoped>
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
