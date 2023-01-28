<template>
  <div class="play-container">
    <h1># use-scrollbar</h1>
    <p class="intro">
      `use-scrollbar` enables a component based on a native scrollbar to replace its native scrollbar with a virtual scrollbar, NOT virtual scroll.
    </p>
    <h2>## examples</h2>
    <ol>
      <li><a href="./compare-styles?type=normal">Simply Usage</a></li>
      <li><a href="./vxe-table">VXETable + 虚拟滚动条</a></li>
      <li><a href="./gantt">GanttElastic + 虚拟滚动条</a></li>
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
