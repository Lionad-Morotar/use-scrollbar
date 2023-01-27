export const SCROLLBAR_GAP = 4;

export const safeRatio = (n: number) => {
  const nv = Math.max(Math.min(n, 1), 0);
  return isNaN(nv) ? 0 : nv;
};

export const safe = (n: number) => {
  return isNaN(n) ? 0 : n < 0 ? 0 : n
}

export const notEmpty = (n: any) => {
  const isUndefined = typeof n === 'undefined'
  const isNull = typeof n === 'object' && !n
  return !(isUndefined || isNull)
}

export const safePrecicion = (n = 0) => safe(n).toFixed(3)
