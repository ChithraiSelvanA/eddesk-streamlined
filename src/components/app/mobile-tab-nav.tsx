export type TabItem = { value: string; label: string; icon: React.ReactNode };

export function MobileTabNav({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex items-stretch overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((i) => {
            const on = value === i.value;
            return (
              <button
                key={i.value}
                type="button"
                onClick={() => onChange(i.value)}
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
