<template>
  <div class="play-container" ref="playRef">
    Hello World {{ isHover ? "Hover" : "Not Hover" }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useElementHover } from "../../src/hooks";

const playRef = ref<HTMLElement>();
const isHover = useElementHover(playRef);
</script>

<style lang="scss"></style>
