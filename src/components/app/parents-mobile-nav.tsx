import { Link } from "@tanstack/react-router";
import { parentGroupDefs, type ParentGroupId } from "@/data/mock";
import { Wallet, MessageSquare, Users, Bus, CalendarPlus } from "lucide-react";

const groupLabels: Record<ParentGroupId, string> = {
  "pending-dues": "Pending Dues",
  "unread-chats": "Unread Messages",
  "multiple-children": "More than one Child",
  "bus-children": "bus travellers",
  "new-parents": "new this year",
};

const groupIcons: Record<ParentGroupId, typeof Wallet> = {
  "pending-dues": Wallet,
  "unread-chats": MessageSquare,
  "multiple-children": Users,
  "bus-children": Bus,
  "new-parents": CalendarPlus,
};

export function ParentsMobileNav({ activeGroup }: { activeGroup?: string }) {
  return (
    <nav
      aria-label="Parent groups"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex items-stretch overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {parentGroupDefs.map((g) => {
            const Icon = groupIcons[g.id];
            const on = g.id === activeGroup;
            return (
              <Link
                key={g.id}
                to="/parents/list"
                search={{ group: g.id }}
                className={
                  "flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors " +
                  (on ? "bg-muted text-foreground" : "text-muted-foreground active:bg-muted/60")
                }
              >
                <span className={on ? "text-foreground" : ""}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="whitespace-nowrap">{groupLabels[g.id]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
