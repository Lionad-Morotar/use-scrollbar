import { afterEach, describe, expect, it, vi } from 'vitest'
import useNativeScrollbar from '../src/hooks/useNativeScrollbar'

describe('useNativeScrollbar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('通过内外层 offsetHeight 差值测量原生滚动条宽度', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(85)

    const states = useNativeScrollbar()
    expect(states.thick).toBe(15)
  })

  it('测量用的探针元素会从 body 移除', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(0)
    const before = document.body.children.length

    useNativeScrollbar()
    expect(document.body.children.length).toBe(before)
  })
})
