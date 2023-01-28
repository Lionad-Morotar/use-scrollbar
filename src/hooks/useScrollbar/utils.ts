/******************************************************************* Types */

export const notEmpty = (n: any) => {
  const isUndefined = typeof n === 'undefined'
  const isNull = typeof n === 'object' && !n
  return !(isUndefined || isNull)
}

/******************************************************************* Numbers */

export const SCROLLBAR_GAP = 4;

export const safeRatio = (n: number) => {
  const nv = Math.max(Math.min(n, 1), 0);
  return isNaN(nv) ? 0 : nv;
};

export const safe = (n: number) => {
  return isNaN(n) ? 0 : n < 0 ? 0 : n
}

export const safePrecicion = (n = 0) => +(safe(+n).toFixed(3))

/*********************************************************************** DOM */

export const findScrollElement = ($el: Element) => {
  const $children = Array.from($el.children)
  const $long = $children.find(($c) => $c.scrollHeight > $c.clientHeight)
  if ($long) {
    return $long
  } else if ($children.length) {
    const $longInChild = $children.map(($c) => findScrollElement($c)).find(notEmpty) as (Element | null)
    if ($longInChild) {
      return $longInChild
    } else {
      return null
    }
  }
}
