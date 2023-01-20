import { ref, watch, computed } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { unrefElement } from "@vueuse/core";

import type { MaybeComputedElementRef } from "@vueuse/core";
import type { UseResizeObserverOptions } from "@vueuse/core";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Reactive size of an HTML element.
 *
 * @fix incorrect size on SVG
 * @see https://github.com/vueuse/vueuse/pull/2661
 *
 * @doc https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
export default function useElementSize(
  target: MaybeComputedElementRef,
  initialSize: ElementSize = { width: 0, height: 0 },
  options: UseResizeObserverOptions = {},
) {
  const { box = 'content-box' } = options
  const isSVG = computed(() => unrefElement(target)?.namespaceURI?.includes('svg'))
  const width = ref(initialSize.width)
  const height = ref(initialSize.height)

  useResizeObserver(
    target,
    ([entry]) => {
      const boxSize =
        box === 'border-box'
          ? entry.borderBoxSize
          : box === 'content-box'
          ? entry.contentBoxSize
          : entry.devicePixelContentBoxSize

      if (isSVG.value) {
        const $elem = unrefElement(target)
        if ($elem) {
          // TODO use getBoundingRect
          const styles = window.getComputedStyle($elem)
          width.value = parseFloat(styles.getPropertyValue('width'))
          height.value = parseFloat(styles.getPropertyValue('height'))
        }
      } else {
        if (boxSize) {
          width.value = boxSize.reduce((acc, { inlineSize }) => acc + inlineSize, 0)
          height.value = boxSize.reduce((acc, { blockSize }) => acc + blockSize, 0)
        } else {
          // fallback
          width.value = entry.contentRect.width
          height.value = entry.contentRect.height
        }
      }
    },
    options,
  )

  watch(
    () => unrefElement(target),
    (ele) => {
      width.value = ele ? initialSize.width : 0
      height.value = ele ? initialSize.height : 0
    },
  )

  return {
    width,
    height,
  }
}

export type UseElementSizeReturn = ReturnType<typeof useElementSize>;
