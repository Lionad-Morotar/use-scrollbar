import { SCROLLBAR_GAP } from './utils'

import type { Theme } from './type'

const HALF_GAP = SCROLLBAR_GAP / 2

const states = {
  theme: 'normal' as Theme,
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
      left: HALF_GAP,
      bottom: HALF_GAP,
    },
    y: {
      top: HALF_GAP,
      right: HALF_GAP,
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
    y: {},
    x: {},
  },
  /* 挂载滚动条的容器的尺寸 */
  mountOnW: 0,
  mountOnH: 0,
  /* 容器的尺寸 */
  viewportW: 0,
  viewportH: 0,
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
}

type States = typeof states

export default states as States
