let cache = 0;

/**
 * Calculate height of scrollbar in current browser
 * 
 * @todo reactive state
 */
export function useScrollbarHeight() {
  if (cache) {
    return cache
  }
  try {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.height = "100px";
    // @ts-ignore
    outer.style.msOverflowStyle = "scrollbar";
    document.body.appendChild(outer);
    var noScroll = outer.offsetHeight;
    outer.style.overflow = "scroll";
    var inner = document.createElement("div");
    inner.style.height = "100%";
    outer.appendChild(inner);
    var withScroll = inner.offsetHeight;
    outer?.parentNode?.removeChild?.(outer);
    const height = noScroll - withScroll;
    return (cache = height);

  } catch (err) {
    console.log("[ERR] err on useScrollbarHeight", err);
    return 0
  }
}