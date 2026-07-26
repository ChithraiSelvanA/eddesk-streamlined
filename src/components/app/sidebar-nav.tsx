import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UsersRound,
  Wallet,
  MessagesSquare,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/academic", label: "Academic", icon: GraduationCap },
  { to: "/students", label: "Students", icon: Users },
  { to: "/parents", label: "Parents", icon: UsersRound },
  { to: "/fees", label: "Fees", icon: Wallet },
  { to: "/communication", label: "Communication", icon: MessagesSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border/70 md:bg-sidebar">
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">EdDesk One</span>
          <span className="text-[10px] text-muted-foreground">Ridgeview Academy</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className={cn("h-4 w-4 opacity-70", active && "opacity-100")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            RM
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium">Rhea Malhotra</p>
            <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
