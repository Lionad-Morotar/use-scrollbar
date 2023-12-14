<template>
  <div class="play-container">
    <h1># use-scrollbar</h1>
    <p align="center">
      <img width="555" alt="use-scrollbar" src="../../docs/assets/logo.png">
    </p>
    <p class="intro">
      `Use-Scrollbar` enables a component relies on a native scrollbar to replace its native scrollbar with a virtual scrollbar instead, NOT virtual scroll.
    </p>
    <h2>## examples</h2>
    <ol>
      <li><a href="./compare-styles?type=normal">Simply Usage</a></li>
      <li><a href="./ant-vue-table">ant-design-vue table + use-scrollbars</a></li>
      <li><a href="./vxe-table">VXETable + use-scrollbars</a></li>
      <li><a href="./vxe-table-multy">VXETable 多表格 + use-scrollbars</a></li>
      <li><a href="./gantt">GanttElastic + use-scrollbars</a></li>
    </ol>
    <h2>## styles</h2>
    <ol>
      <li><a href="./compare-styles?type=normal">Normal Style</a></li>
      <li><a href="./compare-styles?type=steam">Steam App Style</a></li>
      <li><a href="./compare-styles?type=css-tricks">CSS Tricks</a></li>
    </ol>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.intro {
  max-width: clamp(60em, 62vw);
}
.play-container {
  display: flex;
  flex-direction: column;
  padding: 5em;
}
</style>
