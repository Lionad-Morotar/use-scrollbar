import { ref, watch } from "vue-demi";
import { useEventListener, unrefElement } from '@vueuse/core'

import type { Ref } from "vue-demi";
import type { MaybeComputedElementRef } from '@vueuse/core'
import type { Fn } from '@vueuse/shared'

export default function useElementHover(
  target: MaybeComputedElementRef,
  cb1?: (...args: any[]) => any,
  cb2?: (...args: any[]) => any,
): Ref<boolean> {
  const isHovered = ref(false)
  const targetRef = ref(target)

  const cleanup = ref<Fn[]>([])

  watch(
    targetRef,
    (value, oldValue) => {
      if (value && !oldValue) {
        cleanup.value.map((stop) => stop())
        cleanup.value = [
          useEventListener(unrefElement(value), 'mouseenter', () => {
            isHovered.value = true
            cb1?.()
          }),
          useEventListener(unrefElement(value), 'mouseleave', () => {
            isHovered.value = false
            cb2?.()
          }),
        ]
      }
    },
    {
      immediate: true,
    },
  )

  return isHovered
}
