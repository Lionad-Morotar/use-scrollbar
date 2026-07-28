import useElementHover from './useElementHover'
import useElementSize from './useElementSize'
import useNativeScrollbar from './useNativeScrollbar'
import useScroll from './useScroll'
import useScrollbar from './useScrollbar'

export * from './useElementHover'
export * from './useElementSize'
export * from './useNativeScrollbar'
export * from './useScroll'
export * from './useScrollbar'

const useScrollbars = useScrollbar

export {
  useElementHover,
  useElementSize,
  useNativeScrollbar,
  useScroll,
  useScrollbar,
  useScrollbars,
}

const index = {
  useElementSize,
  useElementHover,
  useScroll,
  useScrollbar,
  useScrollbars,
  useNativeScrollbar,
}

export default index
