import { useEffect, useState } from "react";
import { Zap, Wallet, MessagesSquare, ClipboardList, UserPlus, CalendarDays } from "lucide-react";

export type SectionItem = { id: string; label: string; icon: React.ReactNode };

export const dashboardSections: SectionItem[] = [
  { id: "quick-actions", label: "Actions", icon: <Zap className="h-[18px] w-[18px]" /> },
  { id: "pending-fees", label: "Fees", icon: <Wallet className="h-[18px] w-[18px]" /> },
  { id: "parent-messages", label: "Messages", icon: <MessagesSquare className="h-[18px] w-[18px]" /> },
  { id: "leave-requests", label: "Leaves", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
  { id: "recent-admissions", label: "Recent", icon: <UserPlus className="h-[18px] w-[18px]" /> },
  { id: "upcoming-events", label: "Events", icon: <CalendarDays className="h-[18px] w-[18px]" /> },
];

export function MobileSectionNav({ items }: { items: SectionItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);

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

    const offset = 72;
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const write = (y: number) => {
      if (scroller) scroller.scrollTop = y;
      else window.scrollTo(0, y);
    };
    const max = scroller
      ? scroller.scrollHeight - scroller.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;

    const from = read();
    const delta = scroller
      ? el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      : el.getBoundingClientRect().top;
    const to = Math.min(Math.max(from + delta - offset, 0), Math.max(max, 0));
    if (Math.abs(to - from) < 2) return;

    // manual animation: native `behavior: "smooth"` is a no-op in some embedded/preview browsers
    const duration = 420;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      write(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };



  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex items-stretch overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((i) => {
            const on = active === i.id;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => go(i.id)}
                aria-current={on ? "true" : undefined}
                className={
                  "flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors " +
                  (on ? "bg-muted text-foreground" : "text-muted-foreground active:bg-muted/60")
                }
              >
                <span className={on ? "text-foreground" : ""}>{i.icon}</span>
                <span className="whitespace-nowrap">{i.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
