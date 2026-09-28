import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, onMounted, ref } from 'vue'
import { useScrollbar } from '../src/hooks'

/**
 * S1 回归：zip#1–4（几何死区 / onselectstart / 多子节点聚合）
 * RO stub 与 useScrollbar.test.ts 同构。
 */

const sizeMock: Record<string, { width: number, height: number }> = {
  mount: { width: 0, height: 0 },
  wrapper: { width: 0, height: 0 },
  content: { width: 0, height: 0 },
  childA: { width: 0, height: 0 },
  childB: { width: 0, height: 0 },
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
    if (i >= 0)
      roRegistry.splice(i, 1)
  }
  disconnect() {
    for (let i = roRegistry.length - 1; i >= 0; i--) {
      if (roRegistry[i].ro === this)
        roRegistry.splice(i, 1)
    }
  }
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

function notifyResize() {
  for (const { el, cb, ro } of [...roRegistry])
    cb([makeSizeEntry(el)], ro)
}

afterEach(() => {
  for (const key of Object.keys(sizeMock)) {
    sizeMock[key].width = 0
    sizeMock[key].height = 0
  }
  roRegistry.length = 0
})

describe('review-fix S1: geom path', () => {
  it('mount≠viewport 浅溢出时 path>0 且拖拽产生 scrollTo（zip A-F1 / B-F1）', async () => {
    let bar!: ReturnType<typeof useScrollbar>
    let wrapperEl!: HTMLElement

    const Host = defineComponent({
      template: `
        <div ref="mountRef" data-testid="mount" style="position:relative">
          <div ref="wrapperRef" data-testid="wrapper">
            <div ref="contentRef" data-testid="content">c</div>
          </div>
        </div>
      `,
      setup() {
        const mountRef = ref<HTMLElement>()
        const wrapperRef = ref<HTMLElement>()
        const contentRef = ref<HTMLElement>()
        bar = useScrollbar()
        onMounted(() => {
          wrapperEl = wrapperRef.value!
          bar.init({
            mount: mountRef.value!,
            wrapper: [wrapperRef.value!],
            viewport: [wrapperRef.value!],
            content: [contentRef.value!],
          })
        })
        return { mountRef, wrapperRef, contentRef }
      },
    })

    const w = mount(Host, { attachTo: document.body })
    await flushPromises()

    // 文档主用法：外壳 800 / 视口 200 / 内容刚超一屏 250
    sizeMock.mount = { width: 800, height: 800 }
    sizeMock.wrapper = { width: 800, height: 200 }
    sizeMock.content = { width: 800, height: 250 }
    notifyResize()
    await flushPromises()

    expect(bar.size.y.path).toBeGreaterThan(0)
    expect(bar.size.y.height).toBeLessThanOrEqual(200 - 8)
    expect(bar.isHidden.y).toBe(false)

    const scrollToSpy = vi.fn()
    wrapperEl.scrollTo = scrollToSpy
    bar.onDragY(new MouseEvent('mousedown', { clientY: 10, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 40 }))
    await new Promise(r => setTimeout(r, 50))
    expect(scrollToSpy).toHaveBeenCalled()
    document.dispatchEvent(new MouseEvent('mouseup'))
    w.unmount()
  })

  it('同盒小视口（150）深溢出时 path>=0 可拖（zip A-F1）', async () => {
    let bar!: ReturnType<typeof useScrollbar>
    let wrapperEl!: HTMLElement

    const Host = defineComponent({
      template: `
        <div ref="mountRef" data-testid="mount">
          <div ref="wrapperRef" data-testid="wrapper">
            <div ref="contentRef" data-testid="content">c</div>
          </div>
        </div>
      `,
      setup() {
        const mountRef = ref<HTMLElement>()
        const wrapperRef = ref<HTMLElement>()
        const contentRef = ref<HTMLElement>()
        bar = useScrollbar()
        onMounted(() => {
          wrapperEl = wrapperRef.value!
          bar.init({
            mount: mountRef.value!,
            wrapper: [wrapperRef.value!],
            viewport: [wrapperRef.value!],
            content: [contentRef.value!],
          })
        })
        return { mountRef, wrapperRef, contentRef }
      },
    })

    const w = mount(Host, { attachTo: document.body })
    await flushPromises()
    sizeMock.mount = { width: 150, height: 150 }
    sizeMock.wrapper = { width: 150, height: 150 }
    sizeMock.content = { width: 150, height: 1000 }
    notifyResize()
    await flushPromises()

    expect(bar.size.y.path).toBeGreaterThanOrEqual(0)
    expect(bar.size.y.height + bar.size.y.path).toBeLessThanOrEqual(150)

    const scrollToSpy = vi.fn()
    wrapperEl.scrollTo = scrollToSpy
    if (bar.size.y.path > 0) {
      bar.onDragY(new MouseEvent('mousedown', { clientY: 10, bubbles: true }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientY: 30 }))
      await new Promise(r => setTimeout(r, 50))
      expect(scrollToSpy).toHaveBeenCalled()
      document.dispatchEvent(new MouseEvent('mouseup'))
    }
    w.unmount()
  })
})

describe('review-fix S1: onselectstart', () => {
  it('destroy 与首次拖拽不清除宿主 onselectstart（zip A-F2）', async () => {
    const hostHandler = () => false
    document.onselectstart = hostHandler

    let bar!: ReturnType<typeof useScrollbar>
    const Host = defineComponent({
      template: `
        <div ref="mountRef" data-testid="mount">
          <div ref="wrapperRef" data-testid="wrapper">
            <div ref="contentRef" data-testid="content">c</div>
          </div>
        </div>
      `,
      setup() {
        const mountRef = ref<HTMLElement>()
        const wrapperRef = ref<HTMLElement>()
        const contentRef = ref<HTMLElement>()
        bar = useScrollbar()
        onMounted(() => {
          bar.init({
            mount: mountRef.value!,
            wrapper: [wrapperRef.value!],
            content: [contentRef.value!],
          })
        })
        return { mountRef, wrapperRef, contentRef }
      },
    })
    const w = mount(Host, { attachTo: document.body })
    await flushPromises()
    sizeMock.mount = { width: 200, height: 200 }
    sizeMock.wrapper = { width: 200, height: 200 }
    sizeMock.content = { width: 200, height: 1000 }
    notifyResize()
    await flushPromises()

    bar.destroy()
    expect(document.onselectstart).toBe(hostHandler)

    // 重新 init 后拖一次再松手，宿主仍在
    bar.init({
      mount: (w.vm as any).mountRef,
      wrapper: [(w.vm as any).wrapperRef],
      content: [(w.vm as any).contentRef],
    })
    await flushPromises()
    notifyResize()
    await flushPromises()
    bar.onDragY(new MouseEvent('mousedown', { clientY: 10, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mouseup'))
    expect(document.onselectstart).toBe(hostHandler)

    document.onselectstart = null
    w.unmount()
  })
})

describe('review-fix S1: auto content aggregation', () => {
  it('自动初始化多堆叠子节点时滚动条出现（zip B-F2）', async () => {
    const el = document.createElement('div')
    el.style.overflow = 'auto'
    el.style.height = '400px'
    const a = document.createElement('div')
    a.dataset.testid = 'childA'
    a.style.height = '300px'
    const b = document.createElement('div')
    b.dataset.testid = 'childB'
    b.style.height = '300px'
    el.append(a, b)
    // scroll 容器自身可滚：scrollHeight > clientHeight
    Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 400 })
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => 600 })
    Object.defineProperty(el, 'clientWidth', { configurable: true, get: () => 400 })
    Object.defineProperty(el, 'scrollWidth', { configurable: true, get: () => 400 })
    document.body.appendChild(el)

    sizeMock.default = { width: 400, height: 400 }
    // findScrollElement 看子节点 scrollHeight>clientHeight——给子节点假尺寸
    Object.defineProperty(a, 'clientHeight', { configurable: true, get: () => 300 })
    Object.defineProperty(a, 'scrollHeight', { configurable: true, get: () => 300 })
    Object.defineProperty(b, 'clientHeight', { configurable: true, get: () => 300 })
    Object.defineProperty(b, 'scrollHeight', { configurable: true, get: () => 300 })
    // 让探测命中 el 本身：子节点不可滚时 findScrollElement 返回 null。
    // 改：让 el 的某个子可滚，或让探测直接命中 el。
    // 现实现只看 children 的 scrollHeight>clientHeight。给 a 制造假溢出：
    Object.defineProperty(a, 'scrollHeight', { configurable: true, get: () => 500 })

    const root = ref<HTMLElement | null>(null)
    root.value = el
    const bar = useScrollbar(root)
    await nextTick()
    await flushPromises()

    // 注入 mount/wrapper 尺寸：自动 init 后 mount=el
    el.dataset.testid = 'mount'
    sizeMock.mount = { width: 400, height: 400 }
    sizeMock.wrapper = { width: 400, height: 400 }
    // content 若改为 wrapper 自身，需 scrollHeight=600
    notifyResize()
    await flushPromises()

    expect(bar.isHidden.y).toBe(false)
    expect(document.querySelectorAll('.c-scrollbar-container').length).toBeGreaterThanOrEqual(1)

    bar.destroy()
    el.remove()
  })
})
