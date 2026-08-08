<script setup lang="ts">
// fixture 的 SSR 验证点：setup 在服务端渲染期执行，
// 调用 composable 不得因访问 document/window 抛错（initOn 为 null 时内部静默跳过）
const elRef = ref<HTMLElement | null>(null)
const { init, destroy } = useScrollbar(elRef)

// auto-import 生效即证明模块的 addImports 注册成功；
// init 放 onMounted：模板 ref 此时已解析，且 onMounted 只在客户端执行，
// 服务端渲染期不会触碰 DOM（核心包 SSR 守卫的另一层实证）
onMounted(() => {
  init({ mount: elRef, content: [elRef] })
})

onUnmounted(() => destroy())
</script>

<template>
  <!-- fixture：SSR 验证页 -->
  <div data-testid="fixture-root">
    <h1>@lionad/use-scrollbar-nuxt fixture</h1>
    <div ref="elRef" class="scroll-host">
      <p v-for="i in 50" :key="i">
        row {{ i }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.scroll-host {
  height: 120px;
  overflow-y: auto;
}
</style>
