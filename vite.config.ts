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
    resolve: {
      alias: [
        {
          find: /^@\/hooks$/,
          replacement: path.join(__dirname, './src/hooks/index.ts'),
        },
        {
          find: /^@xe-utils$/,
          replacement: path.join(__dirname, './patch/xe-utils-esm/index.js'),
        },
      ],
    },
    build: {
      minify: true,
      lib: {
        entry: path.resolve(__dirname, './src/hooks/index.ts'),
        name: 'UseHooks',
        formats: ['es', 'cjs'],
        fileName: (format) => {
          return `lib/index.${format}.js`
        },
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          },
        },
      },
    },
  }

  console.log('[info] mode', mode)

  return config;
})
