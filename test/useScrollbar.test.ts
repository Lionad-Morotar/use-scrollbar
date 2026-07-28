import type { EffectScope } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, getCurrentScope, onMounted, ref } from 'vue'
import { useScrollbar } from '../src/hooks'

// 集成测试：走真实 init() 路径（自动挂载），验证滚动条 DOM 的生成、销毁与泄漏防护。
// 尺寸/拖拽等精细行为的覆盖留给后续专项测试。

describe('useScrollbar', () => {
  // 构造一个挂载真实容器并调用 init 的宿主组件，返回宿主句柄
  function mountHost(initTimes = 1) {
    let bar: ReturnType<typeof useScrollbar> | undefined
    let mountEl: HTMLElement | undefined
    let scope: EffectScope | undefined

    const Host = defineComponent({
      template: `
        <div ref="mountRef" class="mount">
          <div ref="wrapperRef">
            <div ref="contentRef">content</div>
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
          for (let i = 0; i < initTimes; i++) {
            bar!.init({
              mount: mountRef.value!,
              wrapper: [wrapperRef.value!],
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
})
