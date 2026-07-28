import { afterEach, describe, expect, it, vi } from 'vitest'

// useNativeScrollbar 的厚度测量结果在模块级缓存（同一会话内是浏览器级常量），
// 每个用例须 resetModules + 动态 import 获得独立模块实例，避免缓存跨用例污染

describe('useNativeScrollbar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('通过内外层 offsetHeight 差值测量原生滚动条宽度', async () => {
    vi.resetModules()
    const { default: useNativeScrollbar } = await import('../src/hooks/useNativeScrollbar')
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(85)

    const states = useNativeScrollbar()
    expect(states.thick).toBe(15)
  })

  it('测量用的探针元素会从 body 移除', async () => {
    vi.resetModules()
    const { default: useNativeScrollbar } = await import('../src/hooks/useNativeScrollbar')
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(0)
    const before = document.body.children.length

    useNativeScrollbar()
    expect(document.body.children.length).toBe(before)
  })

  it('重复调用命中模块级缓存，不再创建探针元素', async () => {
    vi.resetModules()
    const { default: useNativeScrollbar } = await import('../src/hooks/useNativeScrollbar')
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(0)

    const first = useNativeScrollbar()
    const createSpy = vi.spyOn(document, 'createElement')
    const second = useNativeScrollbar()

    expect(createSpy).not.toHaveBeenCalled()
    expect(second.thick).toBe(first.thick)
  })
})
