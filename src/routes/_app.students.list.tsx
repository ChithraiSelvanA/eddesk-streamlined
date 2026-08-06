import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { getSmartGroup, studentsInGroup, smartGroupDefs } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ChevronRight, Bus } from "lucide-react";
import { useState } from "react";

type ListSearch = { group: string };

export const Route = createFileRoute("/_app/students/list")({
  validateSearch: (search: Record<string, unknown>): ListSearch => ({
    group: typeof search.group === "string" ? search.group : "pending-fees",
  }),
  head: () => ({
    meta: [
      { title: "Filtered students — EdDesk One" },
      { name: "description", content: "Students matching the selected smart group filter. Open a profile to see fees, attendance and parents." },
      { property: "og:title", content: "Filtered students — EdDesk One" },
      { property: "og:description", content: "Students matching the selected smart group filter." },
    ],
  }),
  component: FilteredList,
});

function FilteredList() {
  const { group } = Route.useSearch();
  const def = getSmartGroup(group);
  const [q, setQ] = useState("");

  const base = studentsInGroup(group);
  const list = base.filter(
    s => s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Students", to: "/students" }, { label: def?.label ?? "Filtered" }]}
        title={def?.label ?? "Filtered students"}
        description={`${base.length} students · ${def?.hint ?? "Custom filter"}`}
        actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>}
      />

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {smartGroupDefs.map(g => (
            <Link
              key={g.id}
              to="/students/list"
              search={{ group: g.id }}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                g.id === group ? "border-foreground bg-foreground text-[color:var(--color-background)]" : "border-border bg-surface hover:bg-muted"
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input placeholder="Search within this group…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 max-w-sm bg-surface" />
          <span className="ml-auto text-xs text-muted-foreground">{list.length} of {base.length}</span>
        </div>

        <div className="card-soft overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_110px_1fr_120px_90px_32px] md:items-center gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Student</span><span>Admission no.</span><span>Class</span><span>Parent</span><span>Fees</span><span className="text-right">Att.</span><span />
          </div>
          {list.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No students in this group.</p>}
          {list.map(s => (
            <Link
              key={s.id}
              to="/students/$classId/$studentId"
              params={{ classId: s.classId, studentId: s.id }}
              className="flex flex-col gap-1.5 md:grid md:grid-cols-[1fr_140px_110px_1fr_120px_90px_32px] md:items-center md:gap-3 border-b border-border/40 px-4 py-3 text-sm last:border-0 md:px-5 md:py-2.5 hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                <span className="truncate font-medium">{s.name}</span>
                {s.transport === "bus" && <Bus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              </div>
              <span className="truncate text-muted-foreground">{s.admissionNo}</span>
              <span className="text-muted-foreground">{s.className}</span>
              <div className="min-w-0">
                <p className="truncate">{s.parentName}</p>
                <p className="truncate text-xs text-muted-foreground">{s.parentMobile}</p>
              </div>
              <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
              </StatusPill>
              <span className="text-right tabular-nums">{s.attendance}%</span>
              <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
