import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark, NavLinks, UserChip } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[17rem] bg-sidebar p-0">
        <div className="flex h-14 items-center border-b border-border/70 px-5">
          <BrandMark />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
        <div className="border-t border-border/70 p-3">
          <UserChip />
        </div>
      </SheetContent>
    </Sheet>
  );
}
