/** @vitest-environment node */

import { describe, expect, it } from 'vitest'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

/**
 * SSR 环境安全契约：库被 Nuxt 等 SSR 场景 import 与调用时，
 * 任何路径（渲染期 setup、直接 API 调用）都不得因访问 document/window 抛错。
 * 本文件在 node 环境（无 DOM 全局）运行，守护 typeof document 守卫不回退。
 * 标题以中文开头是刻意的：test/prefer-lowercase-title 会把拉丁字母开头的
 * 标题首字母小写化（"SSR" → "sSR"），中文开头可避开这条 fix 的反复改写。
 */
describe('服务端渲染（SSR）环境安全', () => {
  it('文件确实运行在 node 环境（无 document 全局）', () => {
    expect(typeof document === 'undefined').toBe(true)
  })

  it('node 环境下 import 包不抛错', async () => {
    const mod = await import('@/hooks')
    expect(mod.useScrollbar).toBeTypeOf('function')
  })

  it('服务端渲染调用 useScrollbar() 的组件不抛错', async () => {
    const { useScrollbar } = await import('@/hooks')
    const app = createSSRApp({
      setup() {
        useScrollbar()
        return () => h('div', 'ok')
      },
    })
    await expect(renderToString(app)).resolves.toContain('ok')
  })

  it('服务端渲染 initOn 为 null ref 不抛错', async () => {
    const { useScrollbar } = await import('@/hooks')
    const app = createSSRApp({
      setup() {
        useScrollbar(ref(null))
        return () => h('div', 'ok')
      },
    })
    await expect(renderToString(app)).resolves.toContain('ok')
  })

  it('服务端直接调用 init 不抛错', async () => {
    const { useScrollbar } = await import('@/hooks')
    let api!: ReturnType<typeof useScrollbar>
    const app = createSSRApp({
      setup() {
        api = useScrollbar()
        return () => h('div')
      },
    })
    await renderToString(app)
    expect(() => api.init({ mount: ref(null), content: [ref(null)] })).not.toThrow()
  })

  it('服务端直接调用 mount 不抛错', async () => {
    const { useScrollbar } = await import('@/hooks')
    let api!: ReturnType<typeof useScrollbar>
    const app = createSSRApp({
      setup() {
        api = useScrollbar()
        return () => h('div')
      },
    })
    await renderToString(app)
    expect(() => api.mount(ref(null))).not.toThrow()
  })

  it('服务端直接调用 destroy 不抛错', async () => {
    const { useScrollbar } = await import('@/hooks')
    let api!: ReturnType<typeof useScrollbar>
    const app = createSSRApp({
      setup() {
        api = useScrollbar()
        return () => h('div')
      },
    })
    await renderToString(app)
    expect(() => api.destroy()).not.toThrow()
  })
})
