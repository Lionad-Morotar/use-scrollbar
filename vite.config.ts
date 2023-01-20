import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

import type { UserConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const config: UserConfig = {
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
        formats: ['es', 'cjs'],
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
            '@vueuse/core': 'VueUseCore',
            '@vueuse/shared': 'VueUseShared',
          },
        },
      },
    },
  }

  console.log('[info] mode', mode)

  return config;
})
