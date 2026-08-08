import type { NuxtModule } from '@nuxt/schema'
import { addImports, defineNuxtModule } from '@nuxt/kit'

export interface UseScrollbarModuleOptions {
  /**
   * 注入核心包的虚拟滚动条样式（@lionad/use-scrollbar/dist/style.css）。
   * 需要完全自管样式时置 false。
   */
  injectStyles?: boolean
}

/**
 * 只注册 auto-imports 与样式注入，不注册任何插件：
 * 核心包的 composable 在 SSR 下是无害的（DOM 访问已守卫、静默跳过），
 * 不需要 client-only 插件把运行时与 SSR 隔离；水合后 init/mount 才触碰真实 DOM
 *
 * 显式标注 NuxtModule：rollup-plugin-dts 无法从 .pnpm 虚拟 store 路径
 * 可移植地命名 defineNuxtModule 的推断返回类型（TS2742），须以 import 锚定
 */
const useScrollbarModule: NuxtModule<UseScrollbarModuleOptions> = defineNuxtModule<UseScrollbarModuleOptions>({
  meta: {
    name: '@lionad/use-scrollbar-nuxt',
    configKey: 'useScrollbar',
  },
  defaults: {
    injectStyles: true,
  },
  setup(options, nuxt) {
    if (options.injectStyles)
      nuxt.options.css.push('@lionad/use-scrollbar/dist/style.css')

    // useScroll/useElementSize/useElementHover 是库内部实现细节且与 @vueuse/core
    // 同名——注册会把消费方的 vueuse 自动导入静默替换为库版残缺实现（useScroll 无
    // arrivedState/onScroll，useElementHover 无 delay 选项），只注册库独有 API
    const composables = [
      'useScrollbar',
      'useScrollbars',
      'useNativeScrollbar',
    ]
    addImports(composables.map(name => ({ name, from: '@lionad/use-scrollbar' })))
  },
})

export default useScrollbarModule
