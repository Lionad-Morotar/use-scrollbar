import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import useElementHover from '../src/hooks/useElementHover'

// 本测试锁定 useElementHover 的监听器接线与状态翻转行为。
// 注意：此处 target getter 返回的是 watch 快照值（非持续响应式源），
// 因此它并不能捕获"双 vue 实例导致动态依赖收集失效"的问题——
// 该防护见 vitest.config.ts 的 server.deps.inline 预防性配置

describe('useElementHover', () => {
  it('mouseenter/mouseleave 翻转 hover 状态并触发回调', async () => {
    const onEnter = vi.fn()
    const onLeave = vi.fn()
    let hovered: { value: boolean }

    const wrapper = mount({
      template: '<div ref="el" class="target" />',
      setup() {
        const el = ref<HTMLElement>()
        hovered = useElementHover(el, onEnter, onLeave)
        return { el }
      },
    })
    // useElementHover 与其内部的 useEventListener 都经 flush:post 的 watch 绑定监听，
    // 需充分排空微任务队列后事件监听器才就位
    await flushPromises()

    await wrapper.find('.target').trigger('mouseenter')
    expect(hovered!.value).toBe(true)
    expect(onEnter).toHaveBeenCalledTimes(1)

    await wrapper.find('.target').trigger('mouseleave')
    expect(hovered!.value).toBe(false)
    expect(onLeave).toHaveBeenCalledTimes(1)
  })
})
