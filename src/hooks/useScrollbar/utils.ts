export const SCROLLBAR_GAP = 4;

export const safeRatio = (n: number) => {
  const nv = Math.max(Math.min(n, 1), 0);
  return isNaN(nv) ? 0 : nv;
};

export const safePrecicion = (n = 0) => n.toFixed(2);
