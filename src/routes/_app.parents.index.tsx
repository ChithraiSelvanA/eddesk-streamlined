import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { parents } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/status-pill";
import { useState } from "react";
import { Search, ChevronRight, Phone } from "lucide-react";

export const Route = createFileRoute("/_app/parents/")({
  head: () => ({
    meta: [
      { title: "Parents — EdDesk One" },
      { name: "description", content: "Find any parent by name or mobile. Every action for a parent lives inside their profile." },
      { property: "og:title", content: "Parents — EdDesk One" },
      { property: "og:description", content: "Find any parent by name or mobile. Every action for a parent lives inside their profile." },
    ],
  }),
  component: ParentsIndex,
});

function ParentsIndex() {
  const [q, setQ] = useState("");
  const list = parents.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.mobile.includes(q)
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Parents" }]}
        title="Parents"
        description={`${parents.length} parents linked to student accounts`}
      />
      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <div className="relative mb-6 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or mobile number…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-surface pl-9"
          />
        </div>

        <div className="card-soft overflow-hidden">
          {list.map(p => (
            <Link
              key={p.id}
              to="/parents/$parentId"
              params={{ parentId: p.id }}
              className="flex items-center gap-4 border-b border-border/40 px-5 py-3 last:border-0 hover:bg-muted/50"
            >
              <AvatarMono name={p.name} hue={200} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> {p.mobile} · {p.childIds.length} child{p.childIds.length > 1 ? "ren" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {p.pendingTotal > 0 && <StatusPill tone="warning">₹{p.pendingTotal.toLocaleString()} due</StatusPill>}
                {p.unreadChats > 0 && <StatusPill tone="info">{p.unreadChats} unread</StatusPill>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
