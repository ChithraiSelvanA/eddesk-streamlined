/** Smoothly scrolls an element into view under sticky headers.
 *  Uses a manual animation: native `behavior: "smooth"` is a no-op in some embedded/preview browsers. */
export function scrollToElement(el: HTMLElement | null, offset = 72) {
  if (!el) return;

  // nearest scrollable ancestor, else the page itself
  let node: HTMLElement | null = el.parentElement;
  let scroller: HTMLElement | null = null;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      scroller = node;
      break;
    }
    node = node.parentElement;
  }

  const write = (y: number) => {
    if (scroller) scroller.scrollTop = y;
    else window.scrollTo(0, y);
  };
  const max = scroller
    ? scroller.scrollHeight - scroller.clientHeight
    : document.documentElement.scrollHeight - window.innerHeight;

  const from = scroller ? scroller.scrollTop : window.scrollY;
  const delta = scroller
    ? el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    : el.getBoundingClientRect().top;
  const to = Math.min(Math.max(from + delta - offset, 0), Math.max(max, 0));
  if (Math.abs(to - from) < 2) return;

  const duration = 420;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    write(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function scrollToId(id: string, offset = 72) {
  scrollToElement(document.getElementById(id), offset);
}
