import { ref, unref, watchEffect, computed, reactive, onUnmounted } from "vue-demi";
import { useEventListener, useScroll, unrefElement } from '@vueuse/core'
import { useElementHover } from '@/hooks'
import { useElementSize } from '@/hooks'
import { createComponent } from "./scrollbars";
import { safeRatio, SCROLLBAR_GAP } from "./utils";

import type { Ref, CSSProperties } from "vue-demi";
import type { MaybeComputedElementRef, MaybeComputedRef, MaybeElement } from '@vueuse/core'

import "./index.less";

type MaybeElem = MaybeComputedRef<MaybeElement>;
type Direction = "x" | "y";

const HALF_GAP = SCROLLBAR_GAP / 2;

const safeToFixed = (n = 0) => n.toFixed(2);

/**
 * 用于创建滚动条所需要的状态，从而可以在界面上根据状态生成非原生滚动条，
 * 目前有 x 轴、y 轴两种方向的滚动条，依赖不同的状态。
 * 一个滚动系统通常包含以下部分：
 * 1. 容器，以下称为 place element，用于包含大量子项，并通过 overflow 在界面上控制滚动显示
 * 2. 子项，以下统称子项为 content，通常子项的元素尺寸是确定的或至少是可估算的
 * 3. 滚动条，虚拟滚动条 virtual scrollbar，或容器的原生滚动条 native scrollbar
 */
export default function useScrollbar() {
  const config = {
    size: {
      base: 280,
      min: 75,
      max: 500,
    },
  };
  const $mountOn = ref<HTMLElement>()
  const instance = ref()
  // 空值滚动条显隐
  const inTrigger = ref({
    x: false,
    y: false,
  });
  const states = reactive({
    // 是否隐藏滚动条（优先级应当高于 visible）
    isHidden: {
      x: false,
      y: false,
    },
    // 空值滚动条显隐
    visible: {
      x: false,
      y: false,
    },
    // 滚动条的偏移量
    offset: {
      x: {
        left: SCROLLBAR_GAP / 2,
        bottom: SCROLLBAR_GAP,
      },
      y: {
        top: SCROLLBAR_GAP / 2,
        right: SCROLLBAR_GAP,
      },
    },
    // 滚动条的尺寸
    size: {
      x: {
        width: 0,
        path: 0,
      },
      y: {
        height: 0,
        path: 0,
      },
    },
    // 滚动条距边缘（place element）的距离
    position: {
      x: {
        left: 0,
      },
      y: {
        top: 0,
      },
    },
    // 滚动条的拖动状态
    isDragging: {
      x: false,
      y: false,
    },
    // 滚动条样式
    styles: {
      y: {} as CSSProperties,
      x: {} as CSSProperties,
    },
    /* 容器的尺寸 */
    placeW: 0,
    placeH: 0,
    /* 子项的总尺寸 */
    contentW: 0,
    contentH: 0,
    /* 容器的滚动属性 */
    scrollTop: 0,
    scrollLeft: 0,
    /* 将容器滚动到某处 */
    scrollTo: (() => {
      throw new Error('uninitial')
    }) as (x: number, y: number) => void,

    visibleOnHover,
    traceOffsetOn,
    init,
    onDragY,
    onDragX,
    mount,
    destroy,
  })

  const stops = [] as (() => void)[]
  function destroy() {
    stops.map(s => s())
    clean()
    instance.value?.destroy?.()
    // init() TODO
  }
  const watchEffectGathered = (...args: Parameter<typeof watchEffect>) => {
    const stop = watchEffect(args)
    stops.push(stop)
    return stop
  }

  // 监听元素的 hover 事件以改变滚动条的显示隐藏状态
  function visibleOnHover($hoverOn: MaybeComputedElementRef) {
    useElementHover(
      $hoverOn,
      () => ( inTrigger.value.y = inTrigger.value.x = true ),
      () => ( inTrigger.value.y = inTrigger.value.x = false ),
    )
  }

  // 使用元素 x 的宽度作为滚动条的 offset.left 或 offset.right，
  // 使用元素 y 的高度作为滚动条的 offset.top 或 offset.bottom
  function traceOffsetOn(opts: {
    x?: { left?: MaybeElem; bottom?: MaybeElem };
    y?: { right?: MaybeElem; top?: MaybeElem };
  }) {
    const $elms = [opts?.x?.left, opts?.x?.bottom, opts?.y?.right, opts?.y?.top].filter((x) => x);
    $elms.map(($elm) => {
      const { width, height } = useElementSize($elm);
      watchEffectGathered(() => {
        if (opts?.x?.left === $elm) states.offset.x.left = Math.ceil(width.value + HALF_GAP)
        if (opts?.x?.bottom === $elm) states.offset.x.bottom = Math.ceil(height.value + HALF_GAP)
        if (opts?.y?.right === $elm) states.offset.y.right = Math.ceil(width.value + HALF_GAP)
        if (opts?.y?.top === $elm) states.offset.y.top = Math.ceil(height.value + HALF_GAP)
      })
    });
  }

  /**
   * 滚动条计算初始化
   * @param opts.mount 滚动条 DOM 挂载的容器
   * @param opts.place 滚动容器，place element，通常是 opts.wrapper 中的一个
   * @param opts.content 滚动子项的非定高父容器
   * @param opts.wrapper 滚动容器，用于计算内容区的 scrollTop 等属性，不传则默认是 opts.content 的父容器
   */
  function init(opts: { mount: MaybeElem; place: MaybeElem; content: MaybeElem[]; wrapper: MaybeElem[] }) {
    const { width: placeW, height: placeH } = useElementSize(opts.place);
    const contentW = ref(0);
    const contentH = ref(0);
    const scrollTop = ref(0);
    const scrollLeft = ref(0);

    /* Vars Gurad */

    opts.place = opts.place || opts.mount;
    opts.content = Array.isArray(opts.content) ? opts.content : [opts.content];
    opts.wrapper = opts.wrapper || opts.content.map(x => x.parentElement);
    opts.wrapper = Array.isArray(opts.wrapper) ? opts.wrapper : [opts.wrapper];
    console.log('[debug] init opts', opts);

    /* 初始化数据 */

    if (opts.content.length) {
      const ws = [] as Ref<number>[];
      const hs = [] as Ref<number>[];
      opts.content.map(($elm) => {
        const { width, height } = useElementSize($elm);
        ws.push(width);
        hs.push(height);
      });
      watchEffectGathered(() => {
        contentW.value = Math.max(...ws.map(unref));
      });
      watchEffectGathered(() => {
        contentH.value = Math.max(...hs.map(unref));
      });
    }
    if (opts.wrapper.length) {
      const tops = [] as Ref<number>[];
      const lefts = [] as Ref<number>[];
      opts.wrapper.map(($elm) => {
        const { x: left, y: top } = useScroll($elm as HTMLElement);
        tops.push(top);
        lefts.push(left);
      });
      watchEffectGathered(() => {
        scrollTop.value = Math.max(...tops.map(unref));
      });
      watchEffectGathered(() => {
        scrollLeft.value = Math.max(...lefts.map(unref));
      });
      watchEffectGathered(() => {
        states.scrollTo = (x: number, y: number) => {
          opts.wrapper.map(($elm) => (unref($elm) as HTMLElement)?.scrollTo?.(x, y));
        };
      });
    }

    /* 计算滚动条的显隐状态 */

    watchEffectGathered(() => {
      states.visible.x = states.isDragging.x || (!states.isHidden.x && inTrigger.value.x);
    });
    watchEffectGathered(() => {
      states.visible.y = states.isDragging.y || (!states.isHidden.y && inTrigger.value.y);
    });

    /**
     * 计算滚动条本身尺寸（高度和宽度）
     * 算法具体规则：
     * 1. 当内容不超过一屏时，不显示滚动条
     * 2. 当内容超出一屏，但超出量在一屏以内时，尺寸从 size.max 逼近 size.base
     * 3. 当内容超出更多，尺寸从 size.base 逼近 size.min
     */

    watchEffectGathered(() => {
      let height = config.size.base;
      const hiddenY = contentH.value <= placeH.value;
      states.isHidden.y = hiddenY;

      const overflow = Math.abs(Math.ceil(contentH.value - placeH.value));
      const isOnePage = overflow < placeH.value;
      if (isOnePage) {
        const unset = config.size.max - config.size.base;
        const offset = (1 - overflow / placeH.value) * unset;
        height += offset;
      } else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), placeH.value) * 10;
        const ratio = 1 - overflowSQRT / placeH.value;
        height *= safeRatio(ratio);
      }
      const safeHeight = Math.min(Math.max(height, config.size.min), config.size.max);
      states.size.y.height = safeHeight;
    });
    watchEffectGathered(() => {
      let width = config.size.base;
      const hiddenX = contentW.value <= placeW.value;
      states.isHidden.x = hiddenX;

      const overflow = Math.abs(Math.ceil(contentW.value - placeW.value));
      const isOnePage = overflow < placeW.value;
      if (isOnePage) {
        const unset = config.size.max - config.size.base;
        const offset = (1 - overflow / placeW.value) * unset;
        width += offset;
      } else {
        const overflowSQRT = Math.min(Math.sqrt(overflow), placeW.value) * 10;
        const ratio = 1 - overflowSQRT / placeW.value;
        width *= safeRatio(ratio);
      }
      const safeWidth = Math.min(Math.max(width, config.size.min), config.size.max);
      states.size.x.width = safeWidth;
    });

    /* 滚动条轨道高度 */

    watchEffectGathered(() => {
      states.size.y.path = placeH.value - states.size.y.height - SCROLLBAR_GAP * 2;
      states.size.x.path = placeW.value - states.size.x.width - SCROLLBAR_GAP * 2;
      // console.log("[debug] scrollbar path", placeH.value, states.size.y.height);
    });

    /* 滚动条距离顶部的比例 */

    const scrollbarToEdgeRatio = computed(() => ({
      y: safeRatio(scrollTop.value / (contentH.value - placeH.value)),
      x: safeRatio(scrollLeft.value / (contentW.value - placeW.value)),
    }));

    /* 计算滚动条距边缘的距离 */

    watchEffectGathered(() => {
      const top = states.size.y.path * scrollbarToEdgeRatio.value.y;
      const safeTop = Math.min(states.size.y.path, Math.max(top, 0));
      states.position.y.top = safeTop;
    });
    watchEffectGathered(() => {
      const left = states.size.x.path * scrollbarToEdgeRatio.value.x;
      const safeLeft = Math.min(states.size.x.path, Math.max(left, 0));
      states.position.x.left = safeLeft;
    });

    opts.mount && mount(opts.mount);

    /* 将部分值代理为状态 */

    watchEffectGathered(() => (states.placeH = placeH.value));
    watchEffectGathered(() => (states.placeW = placeW.value));
    watchEffectGathered(() => (states.contentH = contentH.value));
    watchEffectGathered(() => (states.contentW = contentW.value));
    watchEffectGathered(() => (states.scrollTop = scrollTop.value));
    watchEffectGathered(() => (states.scrollLeft = scrollLeft.value));
  }

  /* 计算滚动条样式 */

  watchEffect(() => {
    const style: CSSProperties = {};
    style.top = safeToFixed(states.offset.y.top) + "px";
    style.right = safeToFixed(states.offset.y.right) + "px";
    style.height = safeToFixed(states.size.y.height) + "px";
    style.transform = `translateY(${safeToFixed(states.position.y.top) + "px"})`;
    if (states.isDragging.x) style.opacity = "0.25";
    states.styles.y = style;
  });
  watchEffect(() => {
    const style: CSSProperties = {};
    style.left = safeToFixed(states.offset.x.left) + "px";
    style.bottom = safeToFixed(states.offset.x.bottom) + "px";
    style.width = safeToFixed(states.size.x.width) + "px";
    style.transform = `translateX(${safeToFixed(states.position.x.left) + "px"})`;
    if (states.isDragging.y) style.opacity = "0.25";
    states.styles.x = style;
  });

  /* 滚动条拖动事件 */

  const direction = ref<Direction>("x");
  const lastPosition = ref({ top: 0, left: 0 });
  const mouseOffsetYStart = ref(0);
  const mouseOffsetXStart = ref(0);
  const mouseOffsetYCurrent = ref(0);
  const mouseOffsetXCurrent = ref(0);

  const onMouseMove = (e: MouseEvent) => {
    // console.log("[debug] onMouseMove", e);
    e.preventDefault();

    if (direction.value === "y") {
      mouseOffsetYCurrent.value = e.clientY;
      const offset = mouseOffsetYCurrent.value - mouseOffsetYStart.value;
      const top = Math.min(states.size.y.path, Math.max(lastPosition.value.top + offset, 0));
      const ratio = safeRatio(top / states.size.y.path);
      const targetScroll = (states.contentH - states.placeH) * ratio;
      states.scrollTo(states.scrollLeft, targetScroll);
    }
    if (direction.value === "x") {
      // console.log("[debug] on drag x", states.placeW, states.size.x.width);
      mouseOffsetXCurrent.value = e.clientX;
      const offset = mouseOffsetXCurrent.value - mouseOffsetXStart.value;
      const left = Math.min(states.size.x.path, Math.max(lastPosition.value.left + offset, 0));
      const ratio = safeRatio(left / states.size.x.path);
      // console.log("ratio", ratio, states.contentW, states.placeW);
      const targetScroll = (states.contentW - states.placeW) * ratio;
      states.scrollTo(targetScroll, states.scrollTop);
    }
  };
  const onMouseUp = () => {
    clean();
    states.isDragging.x = states.isDragging.y = false;
  };
  const onMouseDown = (e: MouseEvent) => {
    // console.log("[debug] onMouseDown", e);
    clean();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.getSelection()?.removeAllRanges();
    document.onselectstart = () => false;

    states.isDragging[direction.value] = true;
    mouseOffsetYStart.value = e.clientY;
    mouseOffsetXStart.value = e.clientX;
    lastPosition.value.top = states.position.y.top;
    lastPosition.value.left = states.position.x.left;

    clean.todos.push(useEventListener(document, "mousemove", onMouseMove));
    clean.todos.push(useEventListener(document, "mouseup", onMouseUp));
    clean.todos.push(useEventListener(document, "mouseleave", onMouseUp));
  };
  function clean() {
    mouseOffsetYStart.value = 0;
    mouseOffsetYCurrent.value = 0;
    mouseOffsetXStart.value = 0;
    mouseOffsetXCurrent.value = 0;

    while (clean.todos.length) {
      const cleanJob = clean.todos.pop();
      cleanJob?.();
    }
  }
  clean.todos = [] as (() => void)[];
  onUnmounted(clean);

  /**
   * 拖动滚动条时的事件处理，
   * 使用方式形如：<bar @mousedown="onDragY" />
   */

  function onDragY(e: MouseEvent) {
    direction.value = "y";
    onMouseDown.bind(e)(e);
  }
  function onDragX(e: MouseEvent) {
    direction.value = "x";
    onMouseDown.bind(e)(e);
  }

  // 将滚动条挂载在某个 DOM 节点
  // TODO remove event
  function mount($elem: MaybeElem) {
    instance.value = createComponent(states);
    const $el = unrefElement($elem as HTMLElement);
    $mountOn.value = $el
    $el.appendChild(instance.value.$el)
  }
  // onUnMounted(unmount)

  /* ----------------------------------------------------------- */

  return states;
}

export type ScrollbarStates = ReturnType<typeof useScrollbar>;
