import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  console.log('[info] mode', mode)
  return {
    plugins: [
      dts({
        include: ['./src/hooks/**/*.ts'],
        outputDir: path.resolve(__dirname, './dist/types/'),
      }),
    ],
    build: {
      minify: true,
      lib: {
        entry: path.resolve(__dirname, './src/hooks/index.ts'),
        name: 'UseHooks',
        formats: ['es', 'cjs', 'iife'],
        fileName: format => {
          return `lib/index.${format}.js`
        },
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
})
