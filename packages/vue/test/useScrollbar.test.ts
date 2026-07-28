import type { EffectScope } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, getCurrentScope, onMounted, ref } from 'vue'
import { useScrollbar } from '../src/hooks'

// 尺寸源头控制：happy-dom 元素尺寸恒 0，且其 ResizeObserver 是空实现（observe 不做事），
// 而 useScrollbar 的 contentH/viewportH 派生自 useElementSize（vueuse 经 RO 回调驱动），
// 测试手写 states 会被同步 effect 拉回——必须 stub 一个真的会回调的 RO，
// 按被观察元素的 data-testid 从 sizeMock 取尺寸
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

// 尺寸 mock 变更后手动向所有被观察元素派发新一轮尺寸（真实 RO 由浏览器自动触发）
function notifyResize() {
  for (const { el, cb, ro } of [...roRegistry]) {
    cb([makeSizeEntry(el)], ro)
  }
}

// 集成测试：走真实 init() 路径（自动挂载），验证滚动条 DOM 的生成、销毁与泄漏防护。
// 尺寸/拖拽等精细行为的覆盖留给后续专项测试。

describe('useScrollbar', () => {
  afterEach(() => {
    // 尺寸 mock 与 RO 注册表是模块级共享状态，用例间必须复位，
    // 否则非零尺寸与残留观察项会泄漏到下个用例
    for (const key of Object.keys(sizeMock)) {
      sizeMock[key].width = 0
      sizeMock[key].height = 0
    }
    roRegistry.length = 0
  })

  // 构造一个挂载真实容器并调用 init 的宿主组件，返回宿主句柄
  function mountHost(initTimes = 1) {
    let bar: ReturnType<typeof useScrollbar> | undefined
    let mountEl: HTMLElement | undefined
    let wrapperEl: HTMLElement | undefined
    let scope: EffectScope | undefined

    const Host = defineComponent({
      template: `
        <div ref="mountRef" class="mount" data-testid="mount">
          <div ref="wrapperRef" data-testid="wrapper">
            <div ref="contentRef" data-testid="content">content</div>
          </div>
        </div>
      `,
      setup() {
        scope = getCurrentScope() as EffectScope
        const mountRef = ref<HTMLElement>()
        const wrapperRef = ref<HTMLElement>()
        const contentRef = ref<HTMLElement>()
        bar = useScrollbar()
        onMounted(() => {
          mountEl = mountRef.value!
          wrapperEl = wrapperRef.value!
          for (let i = 0; i < initTimes; i++) {
            bar!.init({
              mount: mountRef.value!,
              wrapper: [wrapperRef.value!],
              viewport: [wrapperRef.value!],
              content: [contentRef.value!],
            })
          }
        })
        return { mountRef, wrapperRef, contentRef }
      },
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return {
      wrapper,
      get bar() { return bar! },
      get mountEl() { return mountEl! },
      get wrapperEl() { return wrapperEl! },
      get scope() { return scope! },
      count: () => mountEl!.querySelectorAll('.c-scrollbar-container').length,
    }
  }

  it('init 后在挂载容器中生成双轴滚动条 DOM，destroy 移除当前实例', async () => {
    const host = mountHost()
    await flushPromises()

    expect(host.count()).toBeGreaterThanOrEqual(1)
    expect(host.mountEl.querySelector('.c-scrollbar-track.is-y')).not.toBeNull()
    expect(host.mountEl.querySelector('.c-scrollbar-track.is-x')).not.toBeNull()

    const before = host.count()
    host.bar.destroy()
    await flushPromises()
    expect(host.count()).toBe(before - 1)

    host.wrapper.unmount()
  })

  it('重复 init 不累积滚动条实例：容器数恒为 1', async () => {
    const host = mountHost(3)
    await flushPromises()

    expect(host.count()).toBe(1)

    host.wrapper.unmount()
  })

  it('重复 init 不累积响应式副作用：宿主 scope 的 effects 数不随 init 次数增长', async () => {
    // init 创建的 watcher 若直接挂进宿主组件 scope，N 次 init 后 effects 数会成倍放大；
    // 正确的实现应把每次 init 的副作用收进独立 scope 并在重复 init 时整体回收
    const effectCount = (scope: EffectScope) =>
      (scope as unknown as { effects: unknown[] }).effects.length

    const h1 = mountHost(1)
    await flushPromises()
    const baseline = effectCount(h1.scope)

    const h3 = mountHost(3)
    await flushPromises()
    expect(effectCount(h3.scope)).toBe(baseline)

    h1.wrapper.unmount()
    h3.wrapper.unmount()
  })

  it('hover 驱动显隐，destroy 后 hover 不再生效', async () => {
    // 行为断言而非监听器计数：VTU 的 VueWrapper 会在根元素注册自己的
    // mouseenter/mouseleave 转发监听器，计数法无法与库监听器区分
    const host = mountHost(3)
    await flushPromises()

    // happy-dom 中元素尺寸为 0，isHidden 恒 true；强制置 false 以打开显隐通路
    host.bar.isHidden.x = false

    host.mountEl.dispatchEvent(new MouseEvent('mouseenter'))
    await flushPromises()
    expect(host.bar.visible.x).toBe(true)

    host.mountEl.dispatchEvent(new MouseEvent('mouseleave'))
    await flushPromises()
    expect(host.bar.visible.x).toBe(false)

    // destroy 清理 hover 监听器后，hover 不再影响显隐
    host.bar.destroy()
    await flushPromises()
    host.mountEl.dispatchEvent(new MouseEvent('mouseenter'))
    await flushPromises()
    expect(host.bar.visible.x).toBe(false)

    host.wrapper.unmount()
  })

  it('拖拽滚动映射按帧合并：同帧多次 mousemove 只产生一次 scrollTo 且取最后位移', async () => {
    const host = mountHost()
    await flushPromises()

    // 通过尺寸 mock 构造可拖拽的映射条件：content 1000 / viewport 200
    // （states 派生自 useElementSize，手写会被同步 effect 拉回，只能控制源头）
    sizeMock.content.height = 1000
    sizeMock.wrapper.height = 200
    notifyResize()
    await flushPromises()

    expect(host.bar.contentH).toBe(1000)
    expect(host.bar.viewportH).toBe(200)
    const path = host.bar.size.y.path
    expect(path).toBeGreaterThan(0)

    const scrollToSpy = vi.fn()
    host.wrapperEl.scrollTo = scrollToSpy

    host.bar.onDragY(new MouseEvent('mousedown', { clientY: 100, bubbles: true }))
    // 同帧连续三次位移：50 / 60 / 70
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 160 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 170 }))

    // rAF 未执行前不应产生 scrollTo（旧实现为每次 mousemove 各调一次）
    expect(scrollToSpy).toHaveBeenCalledTimes(0)

    // happy-dom 的 rAF 以 setTimeout 模拟，等过一个帧周期
    await new Promise(r => setTimeout(r, 50))
    expect(scrollToSpy).toHaveBeenCalledTimes(1)
    // 取最后一次位移 offset=70，thumb 从 top 0 出发被钳制在轨道内：
    // targetScroll = (contentH - viewportH) * min(path, 70) / path
    const expected = 800 * (Math.min(path, 70) / path)
    expect(scrollToSpy).toHaveBeenCalledWith(0, expected)

    document.dispatchEvent(new MouseEvent('mouseup'))
    host.wrapper.unmount()
  })

  it('轨道不可定位（path<=0）时拖拽不产生 scrollTo', async () => {
    // happy-dom 尺寸为 0，path 经公式算得负值：映射比例会除零（经钳制得 1）
    // 把内容直接拉到底，必须短路
    const host = mountHost()
    await flushPromises()

    expect(host.bar.size.y.path).toBeLessThanOrEqual(0)

    const scrollToSpy = vi.fn()
    host.wrapperEl.scrollTo = scrollToSpy

    host.bar.onDragY(new MouseEvent('mousedown', { clientY: 100, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 170 }))
    await new Promise(r => setTimeout(r, 50))

    expect(scrollToSpy).toHaveBeenCalledTimes(0)

    document.dispatchEvent(new MouseEvent('mouseup'))
    host.wrapper.unmount()
  })

  it('松手早于帧回调时丢弃挂起的拖拽帧：mouseup 后不再补滚', async () => {
    // mousemove 调度 rAF 后、帧回调执行前就 mouseup：clean 必须取消挂起的帧，
    // 否则内容会在松手后再跳一帧
    const host = mountHost()
    await flushPromises()

    sizeMock.content.height = 1000
    sizeMock.wrapper.height = 200
    notifyResize()
    await flushPromises()

    const scrollToSpy = vi.fn()
    host.wrapperEl.scrollTo = scrollToSpy

    host.bar.onDragY(new MouseEvent('mousedown', { clientY: 100, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 170 }))
    // 帧回调（happy-dom 以 setTimeout 模拟 rAF）尚未执行即松手
    document.dispatchEvent(new MouseEvent('mouseup'))

    await new Promise(r => setTimeout(r, 50))
    expect(scrollToSpy).toHaveBeenCalledTimes(0)

    host.wrapper.unmount()
  })

  it('isScrolling 分方向翻转并按各自的 idle 时序恢复', async () => {
    // 行为锁定：play demo 以 is-scrolling-x / is-scrolling-y 独立类名消费分方向语义，
    // 响应式图瘦身不得改变该对外行为（y idle=51ms，x idle=102ms）
    const host = mountHost()
    await flushPromises()

    expect(host.bar.isScrolling.x).toBe(false)
    expect(host.bar.isScrolling.y).toBe(false)

    host.wrapperEl.scrollTop = 120
    host.wrapperEl.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(host.bar.isScrolling.y).toBe(true)
    expect(host.bar.isScrolling.x).toBe(false)

    await new Promise(r => setTimeout(r, 70))
    await flushPromises()
    expect(host.bar.isScrolling.y).toBe(false)

    host.wrapperEl.scrollLeft = 60
    host.wrapperEl.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(host.bar.isScrolling.x).toBe(true)
    expect(host.bar.isScrolling.y).toBe(false)

    await new Promise(r => setTimeout(r, 120))
    await flushPromises()
    expect(host.bar.isScrolling.x).toBe(false)

    host.wrapper.unmount()
  })

  it('滚动期样式对象引用稳定，位移经 CSS 变量原位更新', async () => {
    // 渲染层优化：位移从 transform 字符串全量重建改为 CSS 变量字段原位写入，
    // 滚动期 states.styles 对象引用必须保持稳定，避免每帧重建样式对象
    const host = mountHost()
    await flushPromises()

    sizeMock.content.height = 1000
    sizeMock.wrapper.height = 200
    notifyResize()
    await flushPromises()

    const styleY = host.bar.styles.y as Record<string, string>
    expect(styleY.transform).toBe('translateY(var(--thumb-y, 0px))')
    const thumbYBefore = styleY['--thumb-y']

    host.wrapperEl.scrollTop = 120
    host.wrapperEl.dispatchEvent(new Event('scroll'))
    await flushPromises()

    expect(host.bar.styles.y).toBe(styleY)
    expect(styleY['--thumb-y']).not.toBe(thumbYBefore)
    expect(Number.parseFloat(styleY['--thumb-y'])).toBeCloseTo(host.bar.position.y.top, 5)

    host.wrapper.unmount()
  })

  it('will-change 随滚动/拖拽激活并在静止后移除', async () => {
    // will-change 常驻会强制提升合成层浪费内存，只在滚动或拖拽期间附加
    const host = mountHost()
    await flushPromises()

    sizeMock.content.height = 1000
    sizeMock.wrapper.height = 200
    notifyResize()
    await flushPromises()

    const styleY = host.bar.styles.y as Record<string, string>
    const styleX = host.bar.styles.x as Record<string, string>
    expect(styleY.willChange ?? '').toBe('')

    host.wrapperEl.scrollTop = 120
    host.wrapperEl.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(styleY.willChange).toBe('transform')

    await new Promise(r => setTimeout(r, 70))
    await flushPromises()
    expect(styleY.willChange).toBe('')

    host.bar.onDragY(new MouseEvent('mousedown', { clientY: 100, bubbles: true }))
    await flushPromises()
    expect(styleY.willChange).toBe('transform')
    // 拖拽 y 时 x 滚动条降低不透明度（--prefer-opacity 交叉语义）
    expect(styleX['--prefer-opacity']).toBe('0.25')

    document.dispatchEvent(new MouseEvent('mouseup'))
    await flushPromises()
    expect(styleY.willChange).toBe('')
    // 同引用样式对象下的字段移除须以空串写入，delete 会在 DOM 残留
    expect(styleX['--prefer-opacity']).toBe('')

    host.wrapper.unmount()
  })
})
