import { reactive } from 'vue'

export default function useNativeScrollbar() {
  const states = reactive({
    // 滚动条的宽度（y 轴的 wdith 或 x 轴的 height）
    thick: 0,
    calcThick,
  })

  /**
   * 计算原生滚动条的宽度
   * @todo 也许计算 div padding 的方式更简单
   */
  function calcThick() {
    try {
      const $outer = document.createElement('div')
      $outer.style.visibility = 'hidden'
      $outer.style.height = '100px'
      // @ts-expect-error msOverflowStyle 是 IE 专有的遗留样式属性，无标准类型声明
      $outer.style.msOverflowStyle = 'scrollbar'
      document.body.appendChild($outer)

      const heightNoScroll = $outer.offsetHeight

      const $inner = document.createElement('div')
      $outer.style.overflow = 'scroll'
      $inner.style.height = '100%'
      $outer.appendChild($inner)

      const heightWithScroll = $inner.offsetHeight

      $outer?.parentNode?.removeChild?.($outer)

      states.thick = heightNoScroll - heightWithScroll
    }
    catch (err) {
      console.error('[ERR] err on useScrollbarHeight', err)
    }
  }

  calcThick()

  return states
}
