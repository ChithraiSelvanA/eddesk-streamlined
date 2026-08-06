import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
}: {
  crumbs?: Crumb[];
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border/70 bg-background/60 px-4 pt-5 pb-4 backdrop-blur sm:px-6 md:px-8 md:pt-6 md:pb-5">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
              {c.to ? (
                <Link
                  to={c.to as never}
                  params={c.params as never}
                  className="rounded px-1 py-0.5 hover:bg-muted hover:text-foreground"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="px-1 py-0.5 text-foreground/80">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
