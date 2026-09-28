import type { MaybeComputedElementRef, MaybeElement } from '@vueuse/core'
// MaybeRef 自 Vue 3.3 起由核心导出，@vueuse/core v13+ 移除了重复导出
import type { CSSProperties, EffectScope, MaybeRef, Ref } from 'vue'
import type { States } from './states'
import { unrefElement, useEventListener } from '@vueuse/core'
import { tryOnScopeDispose, tryOnUnmounted } from '@vueuse/shared'
import { computed, effectScope, onScopeDispose, reactive, ref, unref, watch, watchEffect } from 'vue'
import { useElementSize, useScroll } from '@/hooks'

import { createComponent } from './scrollbars'
import getOpts from './states'
import { findScrollElement, notEmpty, safePrecicion, safeRatio, SCROLLBAR_GAP } from './utils'

import './index.less'

export * from './type'

type MaybeElem = MaybeRef<MaybeElement>
type MaybeElemOrNumber = MaybeRef<MaybeElement>
type Direction = 'x' | 'y'

/**
 * init() 的入参形态。
 * 声明在模块作用域而非 useScrollbar 函数体内：init 随返回值暴露给调用方，
 * 函数体内的 interface 会让默认导出函数的返回类型引用私有名（TS4060），
 * unplugin-dts 因此放弃生成 useScrollbar/index.d.ts
 */
interface InitOpts {
  mount: MaybeElem
  content: MaybeElem | MaybeElem[] | null
  wrapper?: MaybeElem | MaybeElem[]
  viewport?: MaybeElem | MaybeElem[]
  // TODO contents?: MaybeElem | MaybeElem[] | null
}

/** init() 完成 guards 归一化后的形态（content/wrapper/viewport 均为非空数组） */
interface NormalizedInitOpts {
  mount: MaybeElem
  content: MaybeElem[]
  wrapper: MaybeElem[]
  viewport: MaybeElem[]
}

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
  passOpts: Partial<States> = {},
) {
  const config = {
    size: {
      base: 280,
      // 滑块最小长度钳制:内容远超一屏时按比例缩到 75 会短成一个点,拖拽命中区
      // 与视觉可辨识度都不够;160 是产品设计契约(滑块太短不成形)。x/y 共用
      // 单一来源,窄容器横向条同步放大,超出轨道的部分由 max 侧钳制兜住
      min: 160,
      max: 500,
    },
  }
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
      getOpts(),
      passOpts,
    ),
  )

  // console.log('states', states)

  // hover 监听器的清理句柄：init 在事件回调（如 onMounted）里执行时
  // 没有 active effect scope，watcher 的自动清理不会注册，必须由本闭包手动持有并回收
  let stopHover: (() => void) | null = null

  // 每次 init 的响应式副作用（~20+ watcher）收进独立 scope：
  // 重复 init 时整体回收上一批，否则 watcher 会随 init 次数线性泄漏
  let initScope: EffectScope | null = null

  function destroy() {
    // 拖拽可能正在进行：先复位拖拽副作用（挂起的 rAF、document 监听器、onselectstart），
    // 否则卸载路径无人触发 mouseup，这些资源会残留至页面结束
    clean()
    stopHover?.()
    stopHover = null
    initScope?.stop()
    initScope = null
    instance.value?.destroy?.()
    instance.value = null
  }
  tryOnScopeDispose(destroy)

  // 监听元素的 hover 事件以改变滚动条的显示隐藏状态。
  // 返回清理函数；重复注册前应先调用上一次返回的清理函数，否则监听器会累加
  function visibleOnHover($hoverOn: MaybeComputedElementRef) {
    const enter = () => (inTrigger.value.y = inTrigger.value.x = true)
    const leave = () => (inTrigger.value.y = inTrigger.value.x = false)
    let bound: HTMLElement | null = null
    const unbind = () => {
      bound?.removeEventListener('mouseenter', enter)
      bound?.removeEventListener('mouseleave', leave)
      bound = null
    }
    const stopWatch = watch(
      () => unrefElement($hoverOn),
      ($el) => {
        unbind()
        bound = ($el as HTMLElement | null) ?? null
        bound?.addEventListener('mouseenter', enter)
        bound?.addEventListener('mouseleave', leave)
      },
      { immediate: true, flush: 'post' },
    )
    return () => {
      stopWatch()
      unbind()
    }
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
    const gap = SCROLLBAR_GAP
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
    $elms.forEach(($elm) => {
      const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
      watchEffect(() => {
        if (opts?.x?.left === $elm)
          states.offset.x.left = safePrecicion(width.value + gap)
        if (opts?.x?.bottom === $elm)
          states.offset.x.bottom = safePrecicion(height.value + gap)
        if (opts?.y?.right === $elm)
          states.offset.y.right = safePrecicion(width.value + gap)
        if (opts?.y?.top === $elm)
          states.offset.y.top = safePrecicion(height.value + gap)
      })
    })
  }

  /**
   * 滚动条计算初始化
   *
   * opts 字段：
   * - mount：滚动条 DOM 挂载的容器
   * - wrapper：滚动容器，用于计算内容区的 scrollTop 等属性，默认为 opts.content 的父容器
   * - content：滚动子项的非定高父容器
   * - viewport：视口元素
   */
  function init(opts: InitOpts) {
    /* Guards */

    // SSR 环境（Nuxt 服务端渲染 setup 阶段）无 document：
    // init 的一切工作都围绕真实 DOM 展开，直接静默跳过而非抛出，
    // 让 composable 在同构代码里可以无条件调用，水合后由客户端再次 init
    if (typeof document === 'undefined')
      return

    opts.mount = opts.mount!
    opts.content = Array.isArray(opts.content) ? opts.content : [opts.content]
    opts.content = opts.content.filter(notEmpty) as MaybeElem[]
    // 显式标注参数类型：TS 5.9 对 opts.content 连续赋值 + as 断言后的 CFA 收窄会丢失元素类型
    opts.wrapper = opts.wrapper || opts.content.map((x: MaybeElem) => unrefElement(x)!.parentElement)
    opts.wrapper = Array.isArray(opts.wrapper) ? opts.wrapper : [opts.wrapper]
    opts.wrapper = opts.wrapper.filter(notEmpty) as MaybeElem[]
    opts.viewport = Array.isArray(opts.viewport)
      ? opts.viewport
      : opts.viewport
        ? [opts.viewport]
        : opts.wrapper
    opts.viewport = opts.viewport.filter(notEmpty) as MaybeElem[]
    // console.log('[debug] init opts', opts)

    // 先回收上一次 init 的 hover 监听器与全部响应式副作用，再在独立 scope 内重建
    stopHover?.()
    stopHover = null
    initScope?.stop()
    initScope = effectScope()
    initScope.run(() => setup(opts as NormalizedInitOpts))
  }

  /**
   * 在独立 effect scope 内建立一次 init 的全部响应式副作用，
   * 使重复 init 与 destroy 可以把整批 watcher 一次性回收。
   * 入参为 init() 完成 guards 归一化后的形态（content/wrapper/viewport 均为非空数组）
   */
  function setup(opts: NormalizedInitOpts) {
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
      opts.viewport.forEach(($elm: MaybeElem) => {
        const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
        ws.push(width)
        hs.push(height)
      })
      watchEffect(() => {
        viewportW.value = Math.max(...ws.map(unref))
      })
      watchEffect(() => {
        viewportH.value = Math.max(...hs.map(unref))
      })
    }
    if (opts.content.length) {
      // RO 给 border-box；当 content 即滚动容器本身时还需 scrollWidth/Height
      // （自动初始化走 content=[$wrapper]），否则多子节点 Math.max(RO) 会低估总高
      const ws = [] as Ref<number>[]
      const hs = [] as Ref<number>[]
      const els = [] as MaybeElem[]
      opts.content.forEach(($elm: MaybeElem) => {
        const { width, height } = useElementSize($elm, undefined, { box: 'border-box' })
        ws.push(width)
        hs.push(height)
        els.push($elm)
      })
      watchEffect(() => {
        contentW.value = Math.max(
          ...els.map(($elm, i) => {
            const el = unrefElement($elm as MaybeElem) as HTMLElement | null | undefined
            const ro = unref(ws[i])
            return el ? Math.max(ro, el.scrollWidth || 0) : ro
          }),
        )
      })
      watchEffect(() => {
        contentH.value = Math.max(
          ...els.map(($elm, i) => {
            const el = unrefElement($elm as MaybeElem) as HTMLElement | null | undefined
            const ro = unref(hs[i])
            return el ? Math.max(ro, el.scrollHeight || 0) : ro
          }),
        )
      })
    }
    if (opts.wrapper.length) {
      const tops = [] as Ref<number>[]
      const lefts = [] as Ref<number>[]
      opts.wrapper.forEach(($elm: MaybeElem) => {
        const { x: left, y: top } = useScroll($elm as HTMLElement)
        tops.push(top)
        lefts.push(left)
      })
      watchEffect(() => {
        scrollTop.value = Math.max(...tops.map(unref))
      })
      watchEffect(() => {
        scrollLeft.value = Math.max(...lefts.map(unref))
      })
      // scrollTo 只需赋值一次：闭包在每次调用时实时 unref 元素，
      // 包 watchEffect 只会多一个无收益 watcher
      states.scrollTo = (x: number, y: number) => {
        ;(opts.wrapper as MaybeElem[]).map($elm =>
          (unref($elm) as HTMLElement)?.scrollTo?.(x, y),
        )
      }
    }

    /* 计算滚动条的显隐状态 */

    // 轨道随滚补偿：overlay 挂进 mount 内部，track 以 absolute 相对 mount padding box
    // 定位；mount 自身即滚动容器时该坐标系随内容上移，track/thumb 会被带进可视区外。
    // 取 mount 自身的 scrollTop/scrollLeft 原位反向平移轨道坐标系——mount 可滚时
    // 补偿量恰为其滚动量；mount 为不滚动的外层壳形态时恒为 0，既有行为不变
    const { x: mountScrollX, y: mountScrollY } = useScroll(opts.mount as HTMLElement)
    watchEffect(() => {
      states.trackStyles['--vscroll-y'] = `${safePrecicion(mountScrollY.value)}px`
    })
    watchEffect(() => {
      states.trackStyles['--vscroll-x'] = `${safePrecicion(mountScrollX.value)}px`
    })

    watchEffect(() => {
      states.visible.x = states.isDragging.x || (!states.isHidden.x && inTrigger.value.x)
    })
    watchEffect(() => {
      states.visible.y = states.isDragging.y || (!states.isHidden.y && inTrigger.value.y)
    })

    /**
     * 计算滚动条本身尺寸（高度和宽度）
     * 算法具体规则：
     * 1. 当内容不超过一屏时，不显示滚动条
     * 2. 当内容超出一屏，但超出量在一屏以内时，尺寸从 size.max 逼近 size.base
     * 3. 当内容超出更多，尺寸从 size.base 逼近 size.min
     * thumb 长度与 path 必须同参照面：轨道行程 = viewport - GAP×2，
     * min/max 按轨道裁剪，保证 path 恒 ≥ 0（旧实现用 mountOn 算长度、viewport 算 path，
     * mount≠viewport 或小视口时 path 变负，拖拽与跟随全死）
     */
    const MIN_PATH = 1
    watchEffect(() => {
      const top = states.offset.y.top || 0
      const track = Math.max(0, viewportH.value - SCROLLBAR_GAP * 2)
      const maxByMount = Math.max(0, states.mountOnH - top - SCROLLBAR_GAP * 2)
      const maxByTrack = Math.max(0, track - MIN_PATH)
      const max = Math.min(config.size.max, maxByMount, maxByTrack)
      const min = Math.min(config.size.min, max)
      const base = Math.min(config.size.base, max)
      let height = base
      const hiddenY = contentH.value <= viewportH.value
      states.isHidden.y = hiddenY

      const isBaseNearMax = max > 0 && Math.abs(base - max) / max < 0.1
      if (isBaseNearMax) {
        height *= 0.7
      }

      const overflow = Math.abs(contentH.value - viewportH.value)
      const isOnePageY = overflow < viewportH.value
      if (isOnePageY) {
        const unset = max - base
        const offset = (1 - overflow / viewportH.value) * unset
        height += offset
      }
      else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), viewportH.value) * 10
        const ratio = 1 - overflowSQRT / viewportH.value
        height *= safeRatio(ratio)
      }
      const safeHeight = Math.min(Math.max(height, min), max)
      states.size.y.height = safeHeight
    })
    watchEffect(() => {
      const left = states.offset.x.left || 0
      const track = Math.max(0, viewportW.value - SCROLLBAR_GAP * 2)
      const maxByMount = Math.max(0, states.mountOnW - left - SCROLLBAR_GAP * 2)
      const maxByTrack = Math.max(0, track - MIN_PATH)
      const max = Math.min(config.size.max, maxByMount, maxByTrack)
      const min = Math.min(config.size.min, max)
      const base = Math.min(config.size.base, max)
      let width = base
      const hiddenX = contentW.value <= viewportW.value
      states.isHidden.x = hiddenX

      const isBaseNearMax = max > 0 && Math.abs(base - max) / max < 0.1
      if (isBaseNearMax) {
        width *= 0.7
      }

      const overflow = Math.abs(contentW.value - viewportW.value)
      const isOnePageX = overflow < viewportW.value
      if (isOnePageX) {
        const unset = max - base
        const offset = (1 - overflow / viewportW.value) * unset
        width += offset
      }
      else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), viewportW.value) * 10
        const ratio = 1 - overflowSQRT / viewportW.value
        width *= safeRatio(ratio)
      }
      const safeWidth = Math.min(Math.max(width, min), max)
      states.size.x.width = safeWidth
    })

    /* 滚动条轨道高度 */

    watchEffect(() => {
      states.size.y.path = Math.max(0, viewportH.value - states.size.y.height - SCROLLBAR_GAP * 2)
    })
    watchEffect(() => {
      states.size.x.path = Math.max(0, viewportW.value - states.size.x.width - SCROLLBAR_GAP * 2)
    })

    /* 滚动条距离顶部的比例 */

    const scrollbarToEdgeRatio = computed(() => ({
      y: safeRatio(scrollTop.value / (contentH.value - viewportH.value)),
      x: safeRatio(scrollLeft.value / (contentW.value - viewportW.value)),
    }))

    /* 计算滚动条距边缘的距离 */

    watchEffect(() => {
      const top = states.size.y.path * scrollbarToEdgeRatio.value.y
      const safeTop = Math.min(states.size.y.path, Math.max(top, 0))
      states.position.y.top = safeTop
    })
    watchEffect(() => {
      const left = states.size.x.path * scrollbarToEdgeRatio.value.x
      const safeLeft = Math.min(states.size.x.path, Math.max(left, 0))
      states.position.x.left = safeLeft
    })

    // 显式依赖 mount 元素：元素就绪/更换时重挂载；避免旧实现的隐式依赖
    // （instance 自写、states 样式写入）触发无约束重跑导致实例爆炸
    watch(
      () => unrefElement(opts.mount as MaybeElem),
      ($mount) => {
        if (!$mount)
          return
        mount($mount)
        stopHover?.()
        stopHover = visibleOnHover($mount)
      },
      { immediate: true, flush: 'post' },
    )

    const scrollingX = ref(false)
    const scrollingY = ref(false)
    // timer 句柄放闭包变量而非 ref：旧实现把 timeout id 存 ref（scrollXTick），
    // 滚动期每次 setTimeout 返回新 id 都会触发依赖它的代理 effect 空跑
    let scrollXTimer = 0
    let scrollYTimer = 0
    watch(scrollLeft, () => {
      scrollingX.value = true
      clearTimeout(scrollXTimer)
      scrollXTimer = setTimeout(() => {
        scrollingX.value = false
      }, 17 * 6) as unknown as number
    })
    watch(scrollTop, () => {
      scrollingY.value = true
      clearTimeout(scrollYTimer)
      scrollYTimer = setTimeout(() => {
        scrollingY.value = false
      }, 17 * 3) as unknown as number
    })
    onScopeDispose(() => {
      clearTimeout(scrollXTimer)
      clearTimeout(scrollYTimer)
    })

    /* 将部分值代理为状态 */

    // 单 effect 全字段比较写入：比较是廉价操作，合并把 watcher 数量从 10 降到 1，
    // 且滚动期重跑次数随之减半（旧实现 scrollLeft 与 tick id 各触发一个 effect）
    watchEffect(() => {
      if (states.mountOnW !== mountOnW.value) {
        states.mountOnW = mountOnW.value
      }
      if (states.mountOnH !== mountOnH.value) {
        states.mountOnH = mountOnH.value
      }
      if (states.viewportH !== viewportH.value) {
        states.viewportH = viewportH.value
      }
      if (states.viewportW !== viewportW.value) {
        states.viewportW = viewportW.value
      }
      if (states.contentH !== contentH.value) {
        states.contentH = contentH.value
      }
      if (states.contentW !== contentW.value) {
        states.contentW = contentW.value
      }
      if (states.scrollTop !== scrollTop.value) {
        states.scrollTop = scrollTop.value
      }
      if (states.scrollLeft !== scrollLeft.value) {
        states.scrollLeft = scrollLeft.value
      }
      if (states.isScrolling.x !== scrollingX.value) {
        states.isScrolling.x = scrollingX.value
      }
      if (states.isScrolling.y !== scrollingY.value) {
        states.isScrolling.y = scrollingY.value
      }
    })
  }

  /* 计算滚动条样式 */

  // 样式按写入频率分层：静态字段（offset/size/拖拽态，低频）与位移字段
  // （position，滚动期每帧）分属不同 effect。滚动期只原位写 --thumb-* 自定义属性，
  // states.styles 对象引用保持稳定，避免每帧重建样式对象与全量字符串拼接；
  // transform 经 var() 消费位移变量，浏览器侧只重算 transform 而非整组内联样式
  watchEffect(() => {
    const style = states.styles.y as CSSProperties
    style.top = `${safePrecicion(states.offset.y.top)}px`
    style.right = `${safePrecicion(states.offset.y.right)}px`
    style.height = `${safePrecicion(states.size.y.height)}px`
    style.transform = 'translateY(var(--thumb-y, 0px))'
    // 用空串而非 delete 移除字段：states.styles 是稳定引用对象，Vue patchStyle
    // 的删除路径依赖 prev/next 为不同对象，同引用下被 delete 的键会在 DOM 残留
    style[`--prefer-opacity`] = states.isDragging.x ? '0.25' : ''

    // will-change 常驻会强制提升合成层，只在滚动/拖拽期间附加
    const willChange = states.isScrolling.y || states.isDragging.y ? 'transform' : ''
    if (style.willChange !== willChange)
      style.willChange = willChange
  })
  watchEffect(() => {
    const style = states.styles.x as CSSProperties
    style.left = `${safePrecicion(states.offset.x.left)}px`
    style.bottom = `${safePrecicion(states.offset.x.bottom)}px`
    style.width = `${safePrecicion(states.size.x.width)}px`
    style.transform = 'translateX(var(--thumb-x, 0px))'
    // 用空串而非 delete 移除字段：states.styles 是稳定引用对象，Vue patchStyle
    // 的删除路径依赖 prev/next 为不同对象，同引用下被 delete 的键会在 DOM 残留
    style[`--prefer-opacity`] = states.isDragging.y ? '0.25' : ''

    const willChange = states.isScrolling.x || states.isDragging.x ? 'transform' : ''
    if (style.willChange !== willChange)
      style.willChange = willChange
  })
  watchEffect(() => {
    ;(states.styles.y as CSSProperties)[`--thumb-y`] = `${safePrecicion(states.position.y.top)}px`
  })
  watchEffect(() => {
    ;(states.styles.x as CSSProperties)[`--thumb-x`] = `${safePrecicion(states.position.x.left)}px`
  })

  /* 滚动条拖动事件 */

  const direction = ref<Direction>('x')
  const lastPosition = ref({ top: 0, left: 0 })
  const mouseOffsetYStart = ref(0)
  const mouseOffsetXStart = ref(0)
  const mouseOffsetYCurrent = ref(0)
  const mouseOffsetXCurrent = ref(0)
  const selectEventRaw = ref()

  // 拖拽位移的 rAF 合并句柄：mousemove 频率可达帧率数倍以上，
  // 每次直驱 scrollTo 会与由此触发的 scroll 事件在同一帧重复驱动效应链
  let dragRafId = 0

  const onMouseMove = (e: MouseEvent) => {
    // console.log("[debug] onMouseMove", e);
    e.preventDefault()

    mouseOffsetYCurrent.value = e.clientY
    mouseOffsetXCurrent.value = e.clientX
    if (dragRafId)
      return
    dragRafId = requestAnimationFrame(() => {
      dragRafId = 0
      applyDrag()
    })
  }

  // 把最近一帧内的拖拽位移映射为滚动位置；path 为 0 时轨道不可定位，
  // 强行按比例换算（除零经钳制得 1）会把内容直接拉到底，直接跳过
  function applyDrag() {
    if (direction.value === 'y') {
      const path = states.size.y.path
      if (path <= 0)
        return
      const offset = mouseOffsetYCurrent.value - mouseOffsetYStart.value
      const top = Math.min(path, Math.max(lastPosition.value.top + offset, 0))
      const ratio = safeRatio(top / path)
      const targetScroll = (states.contentH - states.viewportH) * ratio
      states.scrollTo(states.scrollLeft, targetScroll)
    }
    if (direction.value === 'x') {
      const path = states.size.x.path
      if (path <= 0)
        return
      // console.log("[debug] on drag x", states.viewportW, states.size.x.width);
      const offset = mouseOffsetXCurrent.value - mouseOffsetXStart.value
      const left = Math.min(path, Math.max(lastPosition.value.left + offset, 0))
      const ratio = safeRatio(left / path)
      // console.log("ratio", ratio, states.contentW, states.viewportW);
      const targetScroll = (states.contentW - states.viewportW) * ratio
      states.scrollTo(targetScroll, states.scrollTop)
    }
  }
  // 仅在本库写入过 onselectstart 后才恢复；避免 destroy/首次 clean
  // 把宿主页面的 handler 清成 null（selectEventRaw 初值 undefined）
  const selectStartOwned = ref(false)
  const onMouseUp = () => {
    clean()
    states.isDragging.x = states.isDragging.y = false
  }
  const onMouseDown = (e: MouseEvent) => {
    // SSR 环境无 window/document：拖拽本质是客户端交互，守卫只为同构代码的容错
    if (typeof window === 'undefined')
      return

    // console.log("[debug] onMouseDown", e);
    // 先捕获宿主 handler，再 clean——clean 只在 owned 时恢复，顺序安全
    if (!selectStartOwned.value)
      selectEventRaw.value = document.onselectstart

    clean()
    e.stopPropagation()
    e.stopImmediatePropagation()
    window.getSelection()?.removeAllRanges()

    document.onselectstart = () => {
      // eslint-disable-next-line no-console -- 拖拽期的信息追踪，故意保留（库本体仅此处输出）
      console.log('[info] temporarily disable select when dragging scrollbars')
      return false
    }
    selectStartOwned.value = true

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

    // 拖拽已结束（mouseup/mouseleave）时丢弃挂起的帧调度：
    // 否则 mouseup 后还会补一帧 scrollTo，内容在松手后再跳一次
    if (dragRafId) {
      cancelAnimationFrame(dragRafId)
      dragRafId = 0
    }

    // 仅恢复本库写入过的 onselectstart；从未拖拽时 destroy→clean 不得抹宿主 handler
    if (typeof document !== 'undefined' && selectStartOwned.value) {
      document.onselectstart = selectEventRaw.value ?? null
      selectStartOwned.value = false
      selectEventRaw.value = undefined
    }

    while (clean.todos.length) {
      const cleanJob = clean.todos.pop()
      cleanJob?.()
    }
  }
  clean.todos = [] as (() => void)[]
  // 宿主无组件实例时(如自定义指令 mounted 钩子里调用)跳过注册:
  // 该场景由宿主卸载路径的 destroy 兜底(destroy 内含 clean),裸 onUnmounted 只会产生 Vue 警告
  tryOnUnmounted(clean)

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

  // 将滚动条挂载在某个 DOM 节点。
  // 挂载前先销毁旧实例：createApp 的副作用不在任何 watcher 的清理范围内，
  // 不去重会让每次重挂载都累积一个 Vue 应用与 DOM 容器
  // TODO remove event
  function mount($elem: MaybeElem) {
    // SSR 环境无 document，createComponent 的 createElement 会抛 ReferenceError；
    // 服务端跳过挂载，水合后由客户端路径重建实例
    if (typeof document === 'undefined')
      return

    instance.value?.destroy?.()
    instance.value = null
    instance.value = createComponent(states)
    const $el = unrefElement($elem as HTMLElement)
    $el && $el.appendChild(instance.value.$el)
  }
  // onUnMounted(unmount)

  /* ----------------------------------------------------------- */

  if (initOn) {
    // 直接跟踪解引用结果：ref(initOn) 会把 getter 函数本身存成静态值，
    // 元素晚就绪（v-if / 异步挂载）时 watcher 永不重跑
    watch(
      () => unrefElement(initOn),
      ($elm) => {
        if ($elm) {
          try {
            const $wrapper = findScrollElement($elm)
            if (!$wrapper) {
              console.error('[ERR] no scrollable element under', initOn)
              return
            }
            // 自动路径：content 取滚动容器自身（用 scrollHeight 量总高），
            // 不再把每个直接子节点当 content 喂给 Math.max——堆叠子项会被低估
            init({
              mount: $elm,
              wrapper: [$wrapper as HTMLElement],
              content: [$wrapper as HTMLElement],
            })
          }
          catch (err) {
            console.error('[ERR] error in init virtual scrollbar', initOn, err)
          }
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )
  }

  return states
}

export type ScrollbarStates = ReturnType<typeof useScrollbar>
