import { ref, unref, watchEffect, computed, watch, reactive, onUnmounted } from 'vue-demi'
import { useEventListener, useScroll, unrefElement } from '@vueuse/core'
import { useElementHover } from '@/hooks'
import { useElementSize } from '@/hooks'
import { createComponent } from "./scrollbars";
import { notEmpty, safeRatio, safePrecicion, SCROLLBAR_GAP, findScrollElement } from './utils'
import defaultOpts from './states'

import type { Ref, CSSProperties } from "vue-demi";
import type { MaybeComputedElementRef, MaybeComputedRef, MaybeElement } from '@vueuse/core'

import "./index.less";

type MaybeElem = MaybeComputedRef<MaybeElement>;
// TODO type MaybeElemOrNumber = MaybeComputedRef<MaybeElement | number>
type MaybeElemOrNumber = MaybeComputedRef<MaybeElement>
type Direction = "x" | "y";

const HALF_GAP = SCROLLBAR_GAP / 2;

/**
 * 一个滚动系统通常包含以下部分：
 * 1. 容器，用于包含大量子项，并通过 overflow 在界面上控制滚动显示
 * 2. 子项，通常子项的元素尺寸是确定的或至少是可估算的
 * 3. 滚动条，虚拟滚动条 virtual scrollbar，或容器的原生滚动条 native scrollbar
 * 确定好滚动系统的容器和子项，再把自定义滚动条挂载到 HTML 节点中，
 * 再把滚动条的尺寸和位置计算出来，
 * 最后把滚动条的拖动事件绑定到滚动条上，
 * 就可以实现一个简单但完整的滚动系统
 */
export default function useScrollbar(
  initOn?: MaybeComputedElementRef,
  // TODO DeepPartial<typeof defaultOpts>
  passOpts: Partial<typeof defaultOpts> = {},
) {
  const config = {
    size: {
      base: 280,
      min: 75,
      max: 500,
    },
  }
  const mountOnRefStyles: Ref<CSSStyleDeclaration> = ref({} as CSSStyleDeclaration)
  const instance = ref()
  // 空值滚动条显隐
  const inTrigger = ref({
    x: false,
    y: false,
  })
  const states = reactive(
    Object.assign(
      {
        visibleOnHover,
        setOffset,
        init,
        onDragY,
        onDragX,
        mount,
        destroy,
      },
      defaultOpts,
      passOpts,
    ),
  )

  const stops = [] as (() => void)[]
  function destroy() {
    stops.map((s) => s())
    clean()
    instance.value?.destroy?.()
    // init() TODO
  }
  const watchEffectGathered = (...args: Parameters<typeof watchEffect>) => {
    const stop = watchEffect(...args)
    stops.push(stop)
    return stop
  }

  // 监听元素的 hover 事件以改变滚动条的显示隐藏状态
  function visibleOnHover($hoverOn: MaybeComputedElementRef) {
    useElementHover(
      $hoverOn,
      () => (inTrigger.value.y = inTrigger.value.x = true),
      () => (inTrigger.value.y = inTrigger.value.x = false),
    )
  }

  // 使用元素 x 的宽度作为滚动条的 offset.left 或 offset.right，
  // 使用元素 y 的高度作为滚动条的 offset.top 或 offset.bottom
  // TODO padding of opts.mount
  function setOffset(opts: {
    x?: {
      left?: MaybeElemOrNumber
      bottom?: MaybeElemOrNumber
      top?: MaybeElemOrNumber
      right?: MaybeElemOrNumber
    }
    y?: {
      top?: MaybeElemOrNumber
      right?: MaybeElemOrNumber
      left?: MaybeElemOrNumber
      bottom?: MaybeElemOrNumber
    }
  }) {
    const gap = HALF_GAP
    const args = [
      opts?.x?.left,
      opts?.x?.right,
      opts?.x?.top,
      opts?.x?.bottom,
      opts?.y?.left,
      opts?.y?.right,
      opts?.y?.top,
      opts?.y?.bottom,
    ]
    // TODO number
    const $elms = args.filter(notEmpty)
    $elms.map(($elm) => {
      const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
      watchEffectGathered(() => {
        if (opts?.x?.left === $elm) states.offset.x.left = safePrecicion(width.value + gap)
        if (opts?.x?.bottom === $elm) states.offset.x.bottom = safePrecicion(height.value + gap)
        if (opts?.y?.right === $elm) states.offset.y.right = safePrecicion(width.value + gap)
        if (opts?.y?.top === $elm) states.offset.y.top = safePrecicion(height.value + gap)
      })
    })
  }

  /**
   * 滚动条计算初始化
   * @param opts.mount 滚动条 DOM 挂载的容器
   * @param opts.wrapper 滚动容器，用于计算内容区的 scrollTop 等属性，默认为 opts.content 的父容器
   * @param opts.content 滚动子项的非定高父容器
   * @param opts.viewport
   */
  function init(opts: {
    mount: MaybeElem
    content: MaybeElem | MaybeElem[] | null
    wrapper?: MaybeElem | MaybeElem[]
    viewport?: MaybeElem | MaybeElem[]
  }) {
    /* Vars Gurad */

    opts.mount = opts.mount!
    opts.content = Array.isArray(opts.content) ? opts.content : [opts.content]
    opts.content = opts.content.filter(notEmpty) as MaybeElem[]
    opts.wrapper = opts.wrapper || opts.content.map((x) => unrefElement(x)!.parentElement)
    opts.wrapper = Array.isArray(opts.wrapper) ? opts.wrapper : [opts.wrapper]
    opts.wrapper = opts.wrapper.filter(notEmpty) as MaybeElem[]
    opts.viewport = Array.isArray(opts.viewport)
      ? opts.viewport
      : opts.viewport
      ? [opts.viewport]
      : opts.wrapper
    opts.viewport = opts.viewport.filter(notEmpty) as MaybeElem[]
    // console.log('[debug] init opts', opts)

    const { width: mountOnW, height: mountOnH } = useElementSize(opts.mount, undefined, {
      box: 'content-box',
    })
    const viewportW = ref(0)
    const viewportH = ref(0)
    const contentW = ref(0)
    const contentH = ref(0)
    const scrollTop = ref(0)
    const scrollLeft = ref(0)

    /* 初始化数据 */

    if (opts.viewport.length) {
      const ws = [] as Ref<number>[]
      const hs = [] as Ref<number>[]
      opts.viewport.map(($elm) => {
        const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
        ws.push(width)
        hs.push(height)
      })
      watchEffectGathered(() => {
        viewportW.value = Math.max(...ws.map(unref))
      })
      watchEffectGathered(() => {
        viewportH.value = Math.max(...hs.map(unref))
      })
    }
    if (opts.content.length) {
      const ws = [] as Ref<number>[]
      const hs = [] as Ref<number>[]
      opts.content.map(($elm) => {
        const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
        ws.push(width)
        hs.push(height)
      })
      watchEffectGathered(() => {
        contentW.value = Math.max(...ws.map(unref))
      })
      watchEffectGathered(() => {
        contentH.value = Math.max(...hs.map(unref))
      })
    }
    if (opts.wrapper.length) {
      const tops = [] as Ref<number>[]
      const lefts = [] as Ref<number>[]
      opts.wrapper.map(($elm) => {
        const { x: left, y: top } = useScroll($elm as HTMLElement)
        tops.push(top)
        lefts.push(left)
      })
      watchEffectGathered(() => {
        scrollTop.value = Math.max(...tops.map(unref))
      })
      watchEffectGathered(() => {
        scrollLeft.value = Math.max(...lefts.map(unref))
      })
      watchEffectGathered(() => {
        states.scrollTo = (x: number, y: number) => {
          (opts.wrapper as MaybeElem[]).map(($elm) =>
            (unref($elm) as HTMLElement)?.scrollTo?.(x, y),
          )
        }
      })
    }

    /* 计算滚动条的显隐状态 */

    watchEffectGathered(() => {
      states.visible.x = states.isDragging.x || (!states.isHidden.x && inTrigger.value.x)
    })
    watchEffectGathered(() => {
      states.visible.y = states.isDragging.y || (!states.isHidden.y && inTrigger.value.y)
    })

    /**
     * 计算滚动条本身尺寸（高度和宽度）
     * 算法具体规则：
     * 1. 当内容不超过一屏时，不显示滚动条
     * 2. 当内容超出一屏，但超出量在一屏以内时，尺寸从 size.max 逼近 size.base
     * 3. 当内容超出更多，尺寸从 size.base 逼近 size.min
     * @FIXME 当容器尺寸大于滚动条尺寸时
     */
    watchEffectGathered(() => {
      const base = Math.min(config.size.base, states.mountOnH)
      const max = Math.min(config.size.max, states.mountOnH)
      let height = config.size.base
      const hiddenY = contentH.value <= viewportH.value
      states.isHidden.y = hiddenY

      const overflow = Math.abs(contentH.value - viewportH.value)
      const isOnePageY = overflow < viewportH.value
      if (isOnePageY) {
        const unset = max - base
        const offset = (1 - overflow / viewportH.value) * unset
        height += offset
      } else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), viewportH.value) * 10
        const ratio = 1 - overflowSQRT / viewportH.value
        height *= safeRatio(ratio)
      }
      const safeHeight = Math.min(Math.max(height, config.size.min), max)
      states.size.y.height = safeHeight
    })
    watchEffectGathered(() => {
      const base = Math.min(config.size.base, states.mountOnW)
      const max = Math.min(config.size.max, states.mountOnW)
      let width = config.size.base
      const hiddenX = contentW.value <= viewportW.value
      states.isHidden.x = hiddenX

      const overflow = Math.abs(contentW.value - viewportW.value)
      const isOnePageX = overflow < viewportW.value
      if (isOnePageX) {
        const unset = max - base
        const offset = (1 - overflow / viewportW.value) * unset
        width += offset
      } else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), viewportW.value) * 10
        const ratio = 1 - overflowSQRT / viewportW.value
        width *= safeRatio(ratio)
      }
      const safeWidth = Math.min(Math.max(width, config.size.min), max)
      states.size.x.width = safeWidth
    })

    /* 滚动条轨道高度 */

    watchEffectGathered(() => {
      states.size.y.path = viewportH.value - states.size.y.height - SCROLLBAR_GAP * 2
      states.size.x.path = viewportW.value - states.size.x.width - SCROLLBAR_GAP * 2
      // console.log("[debug] scrollbar path", viewportH.value, states.size.y.height);
    })

    /* 滚动条距离顶部的比例 */

    const scrollbarToEdgeRatio = computed(() => ({
      y: safeRatio(scrollTop.value / (contentH.value - viewportH.value)),
      x: safeRatio(scrollLeft.value / (contentW.value - viewportW.value)),
    }))

    /* 计算滚动条距边缘的距离 */

    watchEffectGathered(() => {
      const top = states.size.y.path * scrollbarToEdgeRatio.value.y
      const safeTop = Math.min(states.size.y.path, Math.max(top, 0))
      states.position.y.top = safeTop
    })
    watchEffectGathered(() => {
      const left = states.size.x.path * scrollbarToEdgeRatio.value.x
      const safeLeft = Math.min(states.size.x.path, Math.max(left, 0))
      states.position.x.left = safeLeft
    })

    watchEffectGathered(() => {
      mount(opts.mount)
      visibleOnHover(opts.mount)

      const $elem = unrefElement(opts.mount)
      if ($elem) {
        const styles = getComputedStyle($elem)
        mountOnRefStyles.value = styles
      }
    })

    /* 将部分值代理为状态 */

    watchEffectGathered(() => (states.mountOnW = mountOnW.value))
    watchEffectGathered(() => (states.mountOnH = mountOnH.value))
    watchEffectGathered(() => (states.viewportH = viewportH.value))
    watchEffectGathered(() => (states.viewportW = viewportW.value))
    watchEffectGathered(() => (states.contentH = contentH.value))
    watchEffectGathered(() => (states.contentW = contentW.value))
    watchEffectGathered(() => (states.scrollTop = scrollTop.value))
    watchEffectGathered(() => (states.scrollLeft = scrollLeft.value))
  }

  /* 计算滚动条样式 */

  watchEffect(() => {
    const style: CSSProperties = {}
    style.top = safePrecicion(states.offset.y.top) + 'px'
    style.right = safePrecicion(states.offset.y.right) + 'px'
    style.height = safePrecicion(states.size.y.height) + 'px'
    style.transform = `translateY(${safePrecicion(states.position.y.top) + 'px'})`
    if (states.isDragging.x) style.opacity = '0.25'
    states.styles.y = style
  })
  watchEffect(() => {
    const style: CSSProperties = {}
    style.left = safePrecicion(states.offset.x.left) + 'px'
    style.bottom = safePrecicion(states.offset.x.bottom) + 'px'
    style.width = safePrecicion(states.size.x.width) + 'px'
    style.transform = `translateX(${safePrecicion(states.position.x.left) + 'px'})`
    if (states.isDragging.y) style.opacity = '0.25'
    states.styles.x = style
  })

  /* 滚动条拖动事件 */

  const direction = ref<Direction>('x')
  const lastPosition = ref({ top: 0, left: 0 })
  const mouseOffsetYStart = ref(0)
  const mouseOffsetXStart = ref(0)
  const mouseOffsetYCurrent = ref(0)
  const mouseOffsetXCurrent = ref(0)

  const onMouseMove = (e: MouseEvent) => {
    // console.log("[debug] onMouseMove", e);
    e.preventDefault()

    if (direction.value === 'y') {
      mouseOffsetYCurrent.value = e.clientY
      const offset = mouseOffsetYCurrent.value - mouseOffsetYStart.value
      const top = Math.min(states.size.y.path, Math.max(lastPosition.value.top + offset, 0))
      const ratio = safeRatio(top / states.size.y.path)
      const targetScroll = (states.contentH - states.viewportH) * ratio
      states.scrollTo(states.scrollLeft, targetScroll)
    }
    if (direction.value === 'x') {
      // console.log("[debug] on drag x", states.viewportW, states.size.x.width);
      mouseOffsetXCurrent.value = e.clientX
      const offset = mouseOffsetXCurrent.value - mouseOffsetXStart.value
      const left = Math.min(states.size.x.path, Math.max(lastPosition.value.left + offset, 0))
      const ratio = safeRatio(left / states.size.x.path)
      // console.log("ratio", ratio, states.contentW, states.viewportW);
      const targetScroll = (states.contentW - states.viewportW) * ratio
      states.scrollTo(targetScroll, states.scrollTop)
    }
  }
  const onMouseUp = () => {
    clean()
    states.isDragging.x = states.isDragging.y = false
  }
  const onMouseDown = (e: MouseEvent) => {
    // console.log("[debug] onMouseDown", e);
    clean()
    e.stopPropagation()
    e.stopImmediatePropagation()
    window.getSelection()?.removeAllRanges()
    document.onselectstart = () => false

    states.isDragging[direction.value] = true
    mouseOffsetYStart.value = e.clientY
    mouseOffsetXStart.value = e.clientX
    lastPosition.value.top = states.position.y.top
    lastPosition.value.left = states.position.x.left

    clean.todos.push(useEventListener(document, 'mousemove', onMouseMove))
    clean.todos.push(useEventListener(document, 'mouseup', onMouseUp))
    clean.todos.push(useEventListener(document, 'mouseleave', onMouseUp))
  }
  function clean() {
    mouseOffsetYStart.value = 0
    mouseOffsetYCurrent.value = 0
    mouseOffsetXStart.value = 0
    mouseOffsetXCurrent.value = 0

    while (clean.todos.length) {
      const cleanJob = clean.todos.pop()
      cleanJob?.()
    }
  }
  clean.todos = [] as (() => void)[]
  onUnmounted(clean)

  /**
   * 拖动滚动条时的事件处理，
   * 使用方式形如：<bar @mousedown="onDragY" />
   */

  function onDragY(e: MouseEvent) {
    direction.value = 'y'
    onMouseDown.bind(e)(e)
  }
  function onDragX(e: MouseEvent) {
    direction.value = 'x'
    onMouseDown.bind(e)(e)
  }

  // 将滚动条挂载在某个 DOM 节点
  // TODO remove event
  function mount($elem: MaybeElem) {
    instance.value = createComponent(states)
    const $el = unrefElement($elem as HTMLElement)
    $el && $el.appendChild(instance.value.$el)
  }
  // onUnMounted(unmount)

  if (initOn) {
    const initOnRef = ref(initOn)
    watch(
      initOnRef,
      (x) => {
        const $elm = unrefElement(x) as HTMLElement
        if ($elm) {
          try {
            const $wrapper = findScrollElement($elm) as HTMLElement
            const $content = Array.from($wrapper.children) as HTMLElement[]
            visibleOnHover($elm)
            init({
              mount: $elm,
              wrapper: [$wrapper!],
              content: $content,
            })
          } catch (err) {
            console.error('[ERR] error in init virtual scrollbar', x, err)
          }
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )
  }

  /* ----------------------------------------------------------- */

  return states
}

export type ScrollbarStates = ReturnType<typeof useScrollbar>;
