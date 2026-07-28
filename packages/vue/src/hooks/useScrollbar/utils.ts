/** ***************************************************************** Types */

export function notEmpty(n: any) {
  const isUndefined = typeof n === 'undefined'
  const isNull = typeof n === 'object' && !n
  return !(isUndefined || isNull)
}

/** ***************************************************************** Numbers */

export const SCROLLBAR_GAP = 4

export function safeRatio(n: number) {
  const nv = Math.max(Math.min(n, 1), 0)
  return Number.isNaN(nv) ? 0 : nv
}

export function safe(n: number) {
  return Number.isNaN(n) ? 0 : n < 0 ? 0 : n
}

export const safePrecicion = (n = 0) => +safe(+n).toFixed(3)

/** ********************************************************************* DOM */

export function findScrollElement($el: Element) {
  const $children = Array.from($el.children)
  const $long = $children.find($c => $c.scrollHeight > $c.clientHeight)
  if ($long) {
    return $long
  }
  else if ($children.length) {
    const $longInChild = $children
      .map($c => findScrollElement($c))
      .find(notEmpty) as Element | null
    if ($longInChild) {
      return $longInChild
    }
    else {
      return null
    }
  }
}
