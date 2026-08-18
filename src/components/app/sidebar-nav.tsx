import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/academic", label: "Academic", icon: GraduationCap },
  { to: "/students", label: "Students", icon: Users },
  { to: "/parents", label: "Parents", icon: UsersRound },
  { to: "/fees", label: "Fees", icon: Wallet },
  { to: "/communication", label: "Communication", icon: MessagesSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">EdDesk One</span>
        <span className="truncate text-[10px] text-muted-foreground">Ridgeview Academy</span>
      </div>
    </div>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <>
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors md:py-1.5",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0 opacity-70", active && "opacity-100")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function UserChip({ onNavigate }: { onNavigate?: () => void } = {}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onNavigate?.();
    toast.success("Signed out", { description: "You have been logged out of EdDesk One." });
    navigate({ to: "/" });
  };

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-medium text-primary">
        RM
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-medium">Rhea Malhotra</p>
        <p className="truncate text-[10px] text-muted-foreground">Administrator</p>
      </div>
      <button
        type="button"
        aria-label="Log out"
        title="Log out"
        onClick={handleLogout}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border/70 md:bg-sidebar md:overflow-hidden">
      <div className="flex h-14 items-center px-5">
        <BrandMark />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <NavLinks />
      </nav>

      <div className="border-t border-border/70 p-3">
        <UserChip />
      </div>
    </aside>
  );
}
