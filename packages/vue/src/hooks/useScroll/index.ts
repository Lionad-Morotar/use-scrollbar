import type { MaybeRefOrGetter } from 'vue'
import { useEventListener } from '@vueuse/core'
import { noop, tryOnMounted, useDebounceFn, useThrottleFn } from '@vueuse/shared'
// toValue / MaybeRefOrGetter 自 Vue 3.3 起由核心提供，@vueuse/shared v13+ 移除了重复导出
import { computed, ref, toValue } from 'vue'

const defaultWindow = typeof window === 'undefined' ? undefined : window

export interface UseScrollOptions {
  window?: any
  /**
   * Throttle time for scroll event, it’s disabled by default.
   *
   * @default 0
   */
  throttle?: number

  /**
   * The check time when scrolling ends.
   * This configuration will be setting to (throttle + idle) when the `throttle` is configured.
   *
   * @default 200
   */
  idle?: number

  /**
   * Offset arrived states by x pixels
   *
   */
  offset?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }

  /**
   * Trigger it when scrolling.
   *
   */
  onScroll?: (e: Event) => void

  /**
   * Trigger it when scrolling ends.
   *
   */
  onStop?: (e: Event) => void

  /**
   * Listener options for scroll event.
   *
   * @default {capture: false, passive: true}
   */
  eventListenerOptions?: boolean | AddEventListenerOptions

  /**
   * Optionally specify a scroll behavior of `auto` (default, not smooth scrolling) or
   * `smooth` (for smooth scrolling) which takes effect when changing the `x` or `y` refs.
   *
   * @default 'auto'
   */
  behavior?: MaybeRefOrGetter<ScrollBehavior>
}

/**
 * perf reactive use-scroll instead of @vueuse/core's
 *
 * @see https://vueuse.org/useScroll
 * @param element
 * @param options
 */

export default function useScroll(
  element: MaybeRefOrGetter<HTMLElement | SVGElement | Window | Document | null | undefined>,
  options: UseScrollOptions = {},
) {
  const {
    throttle = 0,
    idle = 200,
    onStop = noop,
    onScroll = noop,
    eventListenerOptions = {
      capture: false,
      passive: true,
    },
    behavior = 'auto',
    window = defaultWindow,
  } = options

  const internalX = ref(0)
  const internalY = ref(0)

  // Use a computed for x and y because we want to write the value to the refs
  // during a `scrollTo()` without firing additional `scrollTo()`s in the process.
  const x = computed({
    get() {
      return internalX.value
    },
    set(x) {
      scrollTo(x, undefined)
    },
  })

  const y = computed({
    get() {
      return internalY.value
    },
    set(y) {
      scrollTo(undefined, y)
    },
  })

  function scrollTo(_x: number | undefined, _y: number | undefined) {
    if (!window)
      return

    const _element = toValue(element)
    if (!_element)
      return

    // 显式拆出目标元素：防御分号被自动修复工具吞掉后，`}(...)` 会与上方语句粘连
    const $elm = _element instanceof Document ? window.document.body : _element
    $elm?.scrollTo({
      top: toValue(_y) ?? y.value,
      left: toValue(_x) ?? x.value,
      behavior: toValue(behavior),
    })
  }

  const isScrolling = ref(false)

  const onScrollEnd = (e: Event) => {
    // dedupe if support native scrollend event
    if (!isScrolling.value)
      return

    isScrolling.value = false
    onStop(e)
  }
  const onScrollEndDebounced = useDebounceFn(onScrollEnd, throttle + idle)

  const setArrivedState = (
    target: HTMLElement | SVGElement | Window | Document | null | undefined,
  ) => {
    if (!window)
      return

    const el = (
      (target as Window).document
        ? (target as Window).document.documentElement
        : (target as Document).documentElement ?? target
    ) as HTMLElement

    const scrollLeft = el.scrollLeft

    internalX.value = scrollLeft

    let scrollTop = el.scrollTop

    // patch for mobile compatible
    if (target === window.document && !scrollTop)
      scrollTop = window.document.body.scrollTop

    internalY.value = scrollTop
  }

  const onScrollHandler = (e: Event) => {
    if (!window)
      return

    const eventTarget = ((e.target as Document).documentElement ?? e.target) as HTMLElement

    setArrivedState(eventTarget)

    isScrolling.value = true
    onScrollEndDebounced(e)
    onScroll(e)
  }

  useEventListener(
    element,
    'scroll',
    throttle ? useThrottleFn(onScrollHandler, throttle, true, false) : onScrollHandler,
    eventListenerOptions,
  )

  tryOnMounted(() => {
    const _element = toValue(element)
    if (!_element)
      return

    setArrivedState(_element)
  })

  useEventListener(element, 'scrollend', onScrollEnd, eventListenerOptions)

  return {
    x,
    y,
    isScrolling,
    measure() {
      const _element = toValue(element)

      if (window && _element)
        setArrivedState(_element)
    },
  }
}

export type UseScrollReturn = ReturnType<typeof useScroll>
