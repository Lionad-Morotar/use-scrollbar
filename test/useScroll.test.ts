import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import useScroll from '../src/hooks/useScroll'

function defineScrollPosition(el: HTMLElement, scrollLeft: number, scrollTop: number) {
  Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true })
  Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true })
}

describe('useScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('挂载时立即测量当前滚动位置', () => {
    const el = document.createElement('div')
    defineScrollPosition(el, 30, 50)
    const { x, y } = useScroll(el)
    expect(x.value).toBe(30)
    expect(y.value).toBe(50)
  })

  it('scroll 事件更新 x/y 并标记 isScrolling，静止 idle 后触发 onStop', async () => {
    const el = document.createElement('div')
    defineScrollPosition(el, 0, 0)
    const onStop = vi.fn()
    const { x, y, isScrolling } = useScroll(el, { onStop, idle: 200 })

    defineScrollPosition(el, 90, 80)
    el.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(x.value).toBe(90)
    expect(y.value).toBe(80)
    expect(isScrolling.value).toBe(true)
    expect(onStop).not.toHaveBeenCalled()

    vi.advanceTimersByTime(250)
    expect(isScrolling.value).toBe(false)
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('写入 x/y 会滚动元素且不引发递归更新', async () => {
    const el = document.createElement('div')
    defineScrollPosition(el, 0, 0)
    const scrollTo = vi.fn()
    ;(el as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo

    const { x, y } = useScroll(el)
    x.value = 100
    y.value = 200

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100 }))
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 200 }))
  })
})
