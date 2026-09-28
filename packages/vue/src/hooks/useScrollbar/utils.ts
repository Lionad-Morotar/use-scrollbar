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

function isScrollable($c: Element) {
  return (
    $c.scrollHeight > $c.clientHeight
    || $c.scrollWidth > $c.clientWidth
  )
}

/**
 * 在子树中找可滚容器：先认自身，再认直接子，再递归。
 * 横纵任一轴溢出即命中（纯横向表也要能自动初始化）。
 */
export function findScrollElement($el: Element): Element | null {
  if (isScrollable($el))
    return $el

  const $children = Array.from($el.children)
  const $long = $children.find(isScrollable)
  if ($long)
    return $long

  if (!$children.length)
    return null

  for (const $c of $children) {
    const nested = findScrollElement($c)
    if (nested)
      return nested
  }
  return null
}
