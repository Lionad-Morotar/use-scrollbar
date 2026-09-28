import type { MaybeComputedElementRef } from '@vueuse/core'
import type { Fn } from '@vueuse/shared'

import type { Ref } from 'vue'
import { unrefElement, useEventListener } from '@vueuse/core'
import { tryOnUnmounted } from '@vueuse/shared'
import { ref, watch } from 'vue'

export default function useElementHover(
  target: MaybeComputedElementRef,
  cb1?: (...args: any[]) => any,
  cb2?: (...args: any[]) => any,
): Ref<boolean> {
  const isHovered = ref(false)
  const targetRef = ref(target)

  const cleanup = ref<Fn[]>([])

  const stopAll = () => {
    cleanup.value.map(stop => stop())
    cleanup.value = []
  }

  watch(
    targetRef,
    (value) => {
      stopAll()
      if (value) {
        cleanup.value = [
          useEventListener(
            () => unrefElement(value),
            'mouseenter',
            () => {
              isHovered.value = true
              cb1?.()
            },
          ),
          useEventListener(
            () => unrefElement(value),
            'mouseleave',
            () => {
              isHovered.value = false
              cb2?.()
            },
          ),
        ]
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  tryOnUnmounted(stopAll)

  return isHovered
}
