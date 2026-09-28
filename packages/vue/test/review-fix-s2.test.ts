import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useScrollbar } from '../src/hooks'

const sizeMock: Record<string, { width: number, height: number }> = {
  mount: { width: 0, height: 0 },
  wrapper: { width: 0, height: 0 },
  content: { width: 0, height: 0 },
  default: { width: 0, height: 0 },
}
const roRegistry: Array<{ el: Element, cb: ResizeObserverCallback, ro: ResizeObserver }> = []

function makeSizeEntry(el: Element): ResizeObserverEntry {
  const testid = (el as HTMLElement).dataset?.testid
  const size = sizeMock[testid && testid in sizeMock ? testid : 'default']
  return {
    target: el,
    borderBoxSize: [{ inlineSize: size.width, blockSize: size.height }],
    contentBoxSize: [{ inlineSize: size.width, blockSize: size.height }],
    contentRect: { width: size.width, height: size.height },
  } as unknown as ResizeObserverEntry
}

class MockResizeObserver implements ResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe(el: Element) {
    roRegistry.push({ el, cb: this.cb, ro: this })
    this.cb([makeSizeEntry(el)], this)
  }
  unobserve(el: Element) {
    const i = roRegistry.findIndex(r => r.el === el && r.ro === this)
    if (i >= 0) roRegistry.splice(i, 1)
  }
  disconnect() {
    for (let i = roRegistry.length - 1; i >= 0; i--) {
      if (roRegistry[i].ro === this) roRegistry.splice(i, 1)
    }
  }
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

afterEach(() => {
  for (const key of Object.keys(sizeMock)) {
    sizeMock[key].width = 0
    sizeMock[key].height = 0
  }
  roRegistry.length = 0
})

describe('review-fix S2: initOn getter', () => {
  it('getter 形态在元素晚就绪后完成初始化（zip A-F3 / B-F10）', async () => {
    const elRef = ref<HTMLElement | null>(null)
    const bar = useScrollbar(() => elRef.value)

    const host = document.createElement('div')
    host.dataset.testid = 'mount'
    Object.defineProperty(host, 'scrollHeight', { configurable: true, get: () => 800 })
    Object.defineProperty(host, 'clientHeight', { configurable: true, get: () => 200 })
    Object.defineProperty(host, 'scrollWidth', { configurable: true, get: () => 200 })
    Object.defineProperty(host, 'clientWidth', { configurable: true, get: () => 200 })
    document.body.appendChild(host)

    expect(document.querySelectorAll('.c-scrollbar-container').length).toBe(0)

    elRef.value = host
    await nextTick()
    await flushPromises()
    sizeMock.mount = { width: 200, height: 200 }
    sizeMock.default = { width: 200, height: 200 }
    for (const { el, cb, ro } of [...roRegistry])
      cb([makeSizeEntry(el)], ro)
    await flushPromises()

    expect(document.querySelectorAll('.c-scrollbar-container').length).toBeGreaterThanOrEqual(1)
    bar.destroy()
    host.remove()
  })
})
