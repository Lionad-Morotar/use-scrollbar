import { Transition, h, withCtx, withDirectives, createVNode, vShow, createApp } from "vue-demi";

import type { ScrollbarStates } from "./index";

export function createComponent(states: ScrollbarStates) {
  const component = {
    name: "CScrollbars",
    setup() {
      return () => {
        return h("div",{ class: "c-scrollbar-container", style: "display: contents" }, [
          createVNode(
            Transition,
            {
              name: "scrollbar-fade",
            },
            {
              default: withCtx(() => [
                withDirectives(
                  createVNode(
                    "div",
                    { class: "c-scrollbar is-y", style: states.styles.y, onMousedown: states.onDragY },
                    []
                  ),
                  [[vShow, states.visible.y]]
                ),
              ]),
            }
          ),
          createVNode(
            Transition,
            {
              name: "scrollbar-fade",
            },
            {
              default: withCtx(() => [
                withDirectives(
                  createVNode(
                    "div",
                    { class: "c-scrollbar is-x", style: states.styles.x, onMousedown: states.onDragX },
                    []
                  ),
                  [[vShow, states.visible.x]]
                ),
              ]),
            }
          ),
        ]);
      };
    },
  };

  const instance = createApp(component);

  const vm = instance.mount(document.createElement("div"));

  function destroy() {
    removeDOMChild()
    instance.unmount()
  }

  function removeDOMChild() {
    vm.$el?.parentNode?.removeChild(vm.$el)
  }

  return {
    destroy,
    vm,
    get $el(): HTMLElement {
      return vm.$el;
    },
  };
}
