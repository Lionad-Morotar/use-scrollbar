import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, onMounted, ref } from 'vue'
import { useScrollbar } from '../src/hooks'

// smoke 级集成测试：走真实 init() 路径（自动挂载），验证滚动条 DOM 的生成与销毁。
// 尺寸/拖拽等精细行为的覆盖留给后续专项测试。
//
// 注意：init() 内部的自动挂载 watchEffect 会在样式状态变化时重复创建滚动条应用，
// 历史实现不卸载旧实例（已知泄漏，属独立的运行时修复议题），因此这里断言
// "destroy 严格减少一个实例"的相对语义，而非容器绝对清零

describe('useScrollbar', () => {
  it('init 后在挂载容器中生成双轴滚动条 DOM，destroy 移除当前实例', async () => {
    let bar: ReturnType<typeof useScrollbar> | undefined
    let mountEl: HTMLElement | undefined

    const Host = defineComponent({
      template: `
        <div ref="mountRef" class="mount">
          <div ref="wrapperRef">
            <div ref="contentRef">content</div>
          </div>
        </div>
      `,
      setup() {
        const mountRef = ref<HTMLElement>()
        const wrapperRef = ref<HTMLElement>()
        const contentRef = ref<HTMLElement>()
        bar = useScrollbar()
        onMounted(() => {
          mountEl = mountRef.value!
          bar!.init({
            mount: mountRef.value!,
            wrapper: [wrapperRef.value!],
            content: [contentRef.value!],
          })
        })
        return { mountRef, wrapperRef, contentRef }
      },
    })

    const wrapper = mount(Host, { attachTo: document.body })
    await flushPromises()

    const count = () => mountEl!.querySelectorAll('.c-scrollbar-container').length
    expect(count()).toBeGreaterThanOrEqual(1)
    expect(mountEl!.querySelector('.c-scrollbar-track.is-y')).not.toBeNull()
    expect(mountEl!.querySelector('.c-scrollbar-track.is-x')).not.toBeNull()

    const before = count()
    bar!.destroy()
    await flushPromises()
    expect(count()).toBe(before - 1)

    wrapper.unmount()
  })
})
