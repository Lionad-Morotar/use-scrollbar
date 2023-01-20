import { ref } from "vue";
import { useEventListener } from "@vueuse/core";

import type { Ref } from "vue";
import type { MaybeComputedRef } from '@vueuse/shared';

export default function useElementHover(
  el: MaybeComputedRef<EventTarget | null | undefined>,
  cb1?: (...args: any[]) => any,
  cb2?: (...args: any[]) => any,
): Ref<boolean> {
  const isHovered = ref(false)

  useEventListener(el, 'mouseenter', () => {
    isHovered.value = true
    cb1?.()
  })
  useEventListener(el, 'mouseleave', () => {
    isHovered.value = false
    cb2?.()
  })

  return isHovered
}
