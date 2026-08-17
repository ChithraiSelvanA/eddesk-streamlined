import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { getParentGroup, parentsInGroup, parentGroupDefs, childrenOf, normalizeMobile } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ChevronRight, Bus, Wallet, MessageSquare, Users, CalendarPlus } from "lucide-react";

const groupIcons: Record<string, typeof Users> = {
  "pending-dues": Wallet,
  "unread-chats": MessageSquare,
  "multiple-children": Users,
  "bus-children": Bus,
  "new-parents": CalendarPlus,
};

type ListSearch = { group: string };

export const Route = createFileRoute("/_app/parents/list")({
  validateSearch: (search: Record<string, unknown>): ListSearch => ({
    group: typeof search.group === "string" ? search.group : "pending-dues",
  }),
  head: () => ({
    meta: [
      { title: "Filtered parents — EdDesk One" },
      { name: "description", content: "Parents matching the selected smart group, with their children and classrooms for quick narrowing." },
      { property: "og:title", content: "Filtered parents — EdDesk One" },
      { property: "og:description", content: "Parents matching the selected smart group, with children and classrooms." },
    ],
  }),
  component: FilteredParents,
});

function FilteredParents() {
  const { group } = Route.useSearch();
  const def = getParentGroup(group);
  const [q, setQ] = useState("");

  const base = parentsInGroup(group);
  const query = q.trim().toLowerCase();
  const digits = normalizeMobile(q);
  const list = base.filter(p => {
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      (digits.length > 0 && normalizeMobile(p.mobile).includes(digits)) ||
      childrenOf(p).some(s => s.name.toLowerCase().includes(query) || s.admissionNo.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Parents", to: "/parents" }, { label: def?.label ?? "Filtered" }]}
        title={def?.label ?? "Filtered parents"}
        description={`${base.length} parents · ${def?.hint ?? "Custom filter"}`}
        actions={<Button variant="outline" size="sm" className="hidden md:inline-flex"><Download className="h-4 w-4" /> Export</Button>}
      />

      <div className="sticky top-14 z-30 flex items-center gap-2 border-b border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        <Button variant="outline" className="h-10 flex-1 text-xs"><Download className="h-4 w-4" /> Export</Button>
        <span className="shrink-0 pr-1 text-xs text-muted-foreground">{list.length}/{base.length}</span>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 pb-4 pt-2 sm:px-6 md:px-8 md:py-6">
        <div className="sticky top-[5.5rem] z-30 -mx-3 mb-3 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur md:static md:mx-0 md:mb-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:pb-0 [&::-webkit-scrollbar]:hidden">
            {parentGroupDefs.map(g => {
              const Icon = groupIcons[g.id] ?? Users;
              return (
                <Link
                  key={g.id}
                  to="/parents/list"
                  search={{ group: g.id }}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                    g.id === group ? "border-foreground bg-foreground text-[color:var(--color-background)]" : "border-border bg-surface hover:bg-muted"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {g.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
          <Input
            placeholder="Search parent, mobile, student or admission no.…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full bg-surface md:h-9 md:max-w-md"
          />
          <span className="ml-auto hidden text-xs text-muted-foreground md:block">{list.length} of {base.length}</span>
        </div>

        <div className="card-soft overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_150px_1.4fr_120px_100px_32px] md:items-center gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Parent</span><span>Mobile</span><span>Students &amp; class</span><span>Dues</span><span className="text-right">Chats</span><span />
          </div>
          {list.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No parents in this group.</p>}
          {list.map(p => {
            const kids = childrenOf(p);
            return (
              <Link
                key={p.id}
                to="/parents/$parentId"
                params={{ parentId: p.id }}
                className="flex flex-col gap-2.5 border-b border-border/40 px-4 py-3.5 text-sm last:border-0 hover:bg-muted/50 md:grid md:grid-cols-[1fr_150px_1.4fr_120px_100px_32px] md:items-center md:gap-3 md:px-5 md:py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarMono name={p.name} hue={200} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.occupation}</p>
                  </div>
                  <div className="shrink-0 md:hidden">
                    {p.pendingTotal > 0 ? (
                      <StatusPill tone="warning">₹{p.pendingTotal.toLocaleString()}</StatusPill>
                    ) : (
                      <StatusPill tone="success">Cleared</StatusPill>
                    )}
                  </div>
                </div>

                <span className="hidden truncate text-muted-foreground md:block">{p.mobile}</span>

                <div className="min-w-0 rounded-lg bg-muted/40 p-2.5 md:rounded-none md:bg-transparent md:p-0 md:space-y-0.5">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">
                    {p.mobile} · {kids.length} student{kids.length === 1 ? "" : "s"}
                  </p>
                  {kids.slice(0, 3).map(s => (
                    <p key={s.id} className="truncate text-xs">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground"> · {s.className} · Roll {s.rollNo}</span>
                      {s.transport === "bus" && <Bus className="ml-1 inline h-3 w-3 text-muted-foreground" />}
                    </p>
                  ))}
                  {kids.length > 3 && <p className="text-xs text-muted-foreground">+{kids.length - 3} more</p>}
                  {kids.length === 0 && <p className="text-xs text-muted-foreground">No students linked</p>}
                </div>

                <div className="hidden md:block">
                  {p.pendingTotal > 0 ? (
                    <StatusPill tone="warning">₹{p.pendingTotal.toLocaleString()}</StatusPill>
                  ) : (
                    <StatusPill tone="success">Cleared</StatusPill>
                  )}
                </div>
                <span className="hidden text-right tabular-nums text-muted-foreground md:block">{p.unreadChats || "—"}</span>
                <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

