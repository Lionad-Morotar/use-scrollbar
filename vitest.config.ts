import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/hooks$/,
        replacement: resolve(import.meta.dirname, 'src/hooks/index.ts'),
      },
    ],
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        // 让 VueUse 与 SFC/测试文件走同一条 vite 管线、共享同一 vue 实例：
        // 若被 externalize 原生加载，vue 的 activeEffect 成为模块级双单例，
        // 依赖响应式源的动态 target watch 会静默不触发（vitest 4.1 + vueuse 14.3
        // 的上游社区实证）。本仓库现有测试尚未直接触发该场景，此处为预防性配置
        inline: ['@vueuse/core', '@vueuse/shared'],
      },
    },
  },
})
