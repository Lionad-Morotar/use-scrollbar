export const safe = (n: number) => (isNaN(n) ? 0 : Math.max(n, 0));

export function isEmptyOrFallback(x: any) {
  return !x || ["-", "/", "未知"].includes(x);
}
