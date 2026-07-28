import { resolve } from 'node:path'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

// 库构建入口（src/hooks/index.ts）是纯 TS、不含 SFC，因此无需 @vitejs/plugin-vue；
// SFC 编译只发生在 playground（play/vite.config.ts）
export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      outDirs: 'dist/types',
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@\/hooks$/,
        replacement: resolve(import.meta.dirname, 'src/hooks/index.ts'),
      },
    ],
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/hooks/index.ts'),
      // ESM + CJS 双形式：修复历史声明（exports.require 曾指向从不产出的文件）；
      // 不再产出 UMD——无 CDN 全局名消费场景，且混合 default/named 导出的 UMD interop 语义脆弱
      formats: ['es', 'cjs'],
      // 显式 .mjs/.cjs 扩展名：不依赖 "type": "module" 推断，深路径消费者（"./*" 映射）在任何解析上下文都无歧义
      fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      // 固定 CSS 产物名 dist/style.css，保护既有深路径引用（'use-scrollbars/dist/style.css'）
      cssFileName: 'style',
    },
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      external: ['vue'],
      output: {
        // 入口同时含 default 与 named 导出，显式 named 让 CJS 互操作语义确定（require(...).default 取默认）
        exports: 'named',
      },
    },
  },
})
