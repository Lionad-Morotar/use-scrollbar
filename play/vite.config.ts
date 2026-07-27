import path from 'node:path'
import process from 'node:process'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Vite 8 移除了 server.https: boolean，自签证书改由插件提供（仅本地调试需要 HTTPS 时启用）
    plugins: [vue(), env.HTTPS ? basicSsl() : null].filter(Boolean),
    resolve: {
      alias: [
        {
          find: /^@\/hooks$/,
          replacement: path.join(import.meta.dirname, '../src/hooks/index.ts'),
        },
      ],
    },
    server: {
      // 固定端口由 `npx -y @lionad/port-key use-scrollbar` 生成，host 暴露局域网
      port: 7232,
      host: true,
    },
    // pnpm 10 严格布局下 vxe-table 的传递依赖（@vxe-ui/core、dom-zindex）仅在
    // esbuild 预打包阶段（从项目根 resolve）可达；若 exclude 则原始 JS 的
    // import-analysis 从 .pnpm 内视角解析会失败。vue-demi 已移除，旧版 exclude
    // 防双 vue 实例的动机不复存在，故不再排除。
    optimizeDeps: {
      include: ['vue', '@vue/shared', 'xe-utils', 'element-plus', 'vxe-table'],
    },
  }
})
