import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandMark, NavLinks, UserChip } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  // Close on route change and make sure Radix never leaves the body inert.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="z-[60] flex w-[17rem] flex-col bg-sidebar p-0">
          <div className="flex h-14 items-center border-b border-border/70 px-5">
            <BrandMark />
            <SheetTitle className="sr-only">Navigation</SheetTitle>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <div className="border-t border-border/70 p-3">
            <UserChip />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
