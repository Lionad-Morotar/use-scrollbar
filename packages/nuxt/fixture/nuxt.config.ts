export default defineNuxtConfig({
  modules: ['../src/module'],

  // 预渲染首页：在构建期真实执行一次 SSR 渲染，
  // 以此验证「SSR 下 import 与调用 composable 不抛错」的契约（不只是构建能过）
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  compatibilityDate: '2026-07-28',
})
