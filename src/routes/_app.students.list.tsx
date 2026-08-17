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
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
          </div>
        }
      />

      <div className="sticky top-14 z-30 flex items-center border-b border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        <Button variant="outline" size="sm" className="h-10 flex-1 text-xs"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 md:px-8 md:py-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
          {smartGroupDefs.map(g => (
            <Link
              key={g.id}
              to="/students/list"
              search={{ group: g.id }}
              className={`rounded-full border px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs ${
                g.id === group ? "border-foreground bg-foreground text-[color:var(--color-background)]" : "border-border bg-surface hover:bg-muted"
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
          <Input placeholder="Search within this group…" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 flex-1 bg-surface md:max-w-sm" />
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
              className="group block border-b border-border/40 px-3 py-2.5 text-sm last:border-0 active:bg-muted/60 hover:bg-muted/50 sm:px-4 md:grid md:grid-cols-[1fr_140px_110px_1fr_120px_90px_32px] md:items-center md:gap-3 md:px-5 md:py-2.5"
            >
              {/* Mobile compact row */}
              <div className="flex items-center gap-3 md:hidden">
                <AvatarMono name={s.name} hue={s.avatarHue} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[15px] font-medium leading-tight">
                    <span className="truncate">{s.name}</span>
                    {s.transport === "bus" && <Bus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {s.className} · {s.admissionNo}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/80">
                    {s.parentName} · {s.parentMobile}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{s.attendance}% att.</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>

              {/* Desktop grid cells */}
              <div className="hidden min-w-0 items-center gap-3 md:flex">
                <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                <span className="truncate font-medium">{s.name}</span>
                {s.transport === "bus" && <Bus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              </div>
              <span className="hidden truncate md:block">{s.admissionNo}</span>
              <span className="hidden md:block">{s.className}</span>
              <span className="hidden truncate md:block">{s.parentName}</span>
              <div className="hidden md:block">
                <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                  {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                </StatusPill>
              </div>
              <span className="hidden tabular-nums md:block md:text-right">{s.attendance}%</span>
              <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
