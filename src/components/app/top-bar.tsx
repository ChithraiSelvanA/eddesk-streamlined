import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, Command, Plus } from "lucide-react";
import { students, parents } from "@/data/mock";
import { AvatarMono } from "./avatar-mono";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function TopBar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return { s: [], p: [] };
    const query = q.toLowerCase();
    return {
      s: students.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.admissionNo.toLowerCase().includes(query) ||
        s.parentMobile.includes(query)
      ).slice(0, 5),
      p: parents.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.mobile.includes(query)
      ).slice(0, 4),
    };
  }, [q]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/70 bg-background/80 px-3 backdrop-blur-md sm:gap-4 sm:px-6 md:px-8" style={{ height: 56 }}>
      <MobileNav />
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search students, admission no., parents…"
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 sm:pr-16 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 hidden sm:flex -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </span>

        {open && q.trim() && (
          <div className="absolute inset-x-0 top-11 z-40 max-h-96 overflow-auto rounded-xl border border-border bg-popover p-2 shadow-[0_16px_40px_-8px_oklch(0.2_0.02_260/0.15)]">
            {results.s.length === 0 && results.p.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for "{q}"</p>
            )}
            {results.s.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Students</p>
                {results.s.map(s => (
                  <Link key={s.id} to="/students/$classId/$studentId" params={{ classId: s.classId, studentId: s.id }}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent">
                    <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.admissionNo} · {s.className}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
            {results.p.length > 0 && (
              <>
                <p className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Parents</p>
                {results.p.map(p => (
                  <Link key={p.id} to="/parents/$parentId" params={{ parentId: p.id }}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent">
                    <AvatarMono name={p.name} hue={200} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.mobile}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => navigate({ to: "/students" })}>
          <Plus className="h-4 w-4" /> New admission
        </Button>
        <NotificationsMenu />

      </div>
    </header>
  );
}
