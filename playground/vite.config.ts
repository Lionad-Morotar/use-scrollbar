import path from 'node:path'
import process from 'node:process'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // GitHub Pages 以 /<repo>/ 子路径托管,asset 路径构建期固化进产物,故从环境读入(本地开发缺省 '/')
    base: env.VITE_APP_BASE_URL ?? '/',
    // Vite 8 移除了 server.https: boolean，自签证书改由插件提供（仅本地调试需要 HTTPS 时启用）
    plugins: [vue(), env.HTTPS ? basicSsl() : null].filter(Boolean),
    resolve: {
      alias: [
        {
          find: /^@\/hooks$/,
          replacement: path.join(import.meta.dirname, '../packages/vue/src/hooks/index.ts'),
        },
      ],
    },
    server: {
      // 固定端口由 `npx -y @lionad/port-key use-scrollbar` 生成，host 暴露局域网
      port: 7232,
      host: true,
    },
    // vxe-table 4.5 自声明依赖，排除预打包保持源码直引（4.20 时代因传递依赖
    // 声明缺失被迫 include 并显式补声明，回退后该动机不复存在）
    optimizeDeps: {
      include: ['vue', '@vue/shared', 'xe-utils', 'element-plus'],
      exclude: ['vxe-table'],
    },
  }
})
