import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import useElementSize from '../src/hooks/useElementSize'

// happy-dom 的 ResizeObserver 不会主动回调，这里用 mock 捕获回调后手动触发，
// 以锁定 useElementSize 对 ResizeObserverEntry 的消费逻辑

let observerCallback: ResizeObserverCallback

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    observerCallback = callback
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('useElementSize', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('元素挂载后初始值来自 initialSize', () => {
    let size: { width: Ref<number>, height: Ref<number> }
    const wrapper = mount({
      template: '<div ref="el" />',
      setup() {
        const el = ref<HTMLElement>()
        size = useElementSize(el, { width: 7, height: 9 })
        return { el }
      },
    })
    expect(size!.width.value).toBe(7)
    expect(size!.height.value).toBe(9)
    wrapper.unmount()
  })

  it('默认 content-box：累加 contentBoxSize 的 inlineSize/blockSize', async () => {
    let size: { width: Ref<number>, height: Ref<number> }
    const wrapper = mount({
      template: '<div ref="el" />',
      setup() {
        const el = ref<HTMLElement>()
        size = useElementSize(el)
        return { el }
      },
    })
    // useResizeObserver 在 immediate + flush:post 的 watch 中创建 observer，
    // 必须先等一个 tick，否则捕获到的是上一个用例遗留的回调
    await nextTick()
    observerCallback(
      [{ contentBoxSize: [{ inlineSize: 120, blockSize: 40 }] }] as unknown as ResizeObserverEntry[],
      {} as ResizeObserver,
    )
    expect(size!.width.value).toBe(120)
    expect(size!.height.value).toBe(40)
    wrapper.unmount()
  })

  it('entry 缺少 box size 时回退 contentRect', async () => {
    let size: { width: Ref<number>, height: Ref<number> }
    const wrapper = mount({
      template: '<div ref="el" />',
      setup() {
        const el = ref<HTMLElement>()
        size = useElementSize(el)
        return { el }
      },
    })
    await nextTick()
    observerCallback(
      [{ contentRect: { width: 55, height: 33 } }] as unknown as ResizeObserverEntry[],
      {} as ResizeObserver,
    )
    expect(size!.width.value).toBe(55)
    expect(size!.height.value).toBe(33)
    wrapper.unmount()
  })
})
