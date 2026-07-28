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
    name: '@lionad/nuxt-use-scrollbar',
    configKey: 'useScrollbar',
  },
  defaults: {
    injectStyles: true,
  },
  setup(options, nuxt) {
    if (options.injectStyles)
      nuxt.options.css.push('@lionad/use-scrollbar/dist/style.css')

    const composables = [
      'useScrollbar',
      'useScrollbars',
      'useScroll',
      'useElementSize',
      'useElementHover',
      'useNativeScrollbar',
    ]
    addImports(composables.map(name => ({ name, from: '@lionad/use-scrollbar' })))
  },
})

export default useScrollbarModule
