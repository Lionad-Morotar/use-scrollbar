import { reactive } from 'vue'

// 原生滚动条宽度是同一会话内的浏览器级常量：模块级缓存避免每次调用
// 都创建探针元素并触发两次强制同步布局；0 是有效测量值，故用 null 作未测量哨兵
let cachedThick: number | null = null

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
    if (cachedThick !== null) {
      states.thick = cachedThick
      return
    }
    // SSR 环境无 document：不测量也不写缓存（留待客户端首次调用），
    // 也避免每个实例都在 catch 里打一条错误日志
    if (typeof document === 'undefined')
      return
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
      cachedThick = states.thick
    }
    catch (err) {
      console.error('[ERR] err on useScrollbarHeight', err)
    }
  }

  calcThick()

  return states
}
