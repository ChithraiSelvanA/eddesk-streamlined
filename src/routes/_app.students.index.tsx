import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { classes, students, smartGroupDefs, CURRENT_YEAR } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowRight, Users, Wallet, Bus, CalendarPlus, TrendingDown, AlertTriangle } from "lucide-react";
import { AvatarMono } from "@/components/app/avatar-mono";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/status-pill";

export const Route = createFileRoute("/_app/students/")({
  head: () => ({
    meta: [
      { title: "Find a student — EdDesk One" },
      { name: "description", content: "Search a student by name or admission number, or filter with smart groups like pending fees, new admissions and bus travellers." },
      { property: "og:title", content: "Find a student — EdDesk One" },
      { property: "og:description", content: "Search a student by name or admission number, or filter with smart groups like pending fees, new admissions and bus travellers." },
    ],
  }),
  component: StudentsIndex,
});

const groupIcons: Record<string, typeof Users> = {
  "pending-fees": Wallet,
  "overdue-fees": AlertTriangle,
  "joined-this-year": CalendarPlus,
  bus: Bus,
  "low-attendance": TrendingDown,
};

function StudentsIndex() {
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return students
      .filter(s => s.name.toLowerCase().includes(query) || s.admissionNo.toLowerCase().includes(query))
      .slice(0, 8);
  }, [q]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Students" }]}
        title="Find a student"
        description={`${students.length.toLocaleString()} students · ${classes.length} classrooms. Search directly, or start from a smart group.`}
        actions={
          <>
            <Button variant="outline" size="sm">Import CSV</Button>
            <Button size="sm"><Plus className="h-4 w-4" /> New admission</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Normal search */}
        <section className="card-soft p-6">
          <h2 className="text-sm font-medium">Normal search</h2>
          <p className="mt-1 text-xs text-muted-foreground">Type a student name or admission number — pick a result to open their profile.</p>
          <div className="relative mt-4 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="e.g. Aanya Sharma or EDK-2025-1004"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 bg-surface pl-9"
            />
          </div>

          {q.trim() && (
            <div className="mt-4 max-w-xl overflow-hidden rounded-lg border border-border">
              {matches.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No student matches “{q}”</p>
              )}
              {matches.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: s.classId, studentId: s.id }}
                  className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/50"
                >
                  <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.admissionNo} · {s.className}</p>
                  </div>
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Advanced search — smart groups */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">Advanced search</h2>
              <p className="mt-1 text-xs text-muted-foreground">A quick review of smart groups. Open one to see the student list.</p>
            </div>
            <span className="text-xs text-muted-foreground">Academic year {CURRENT_YEAR}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {smartGroupDefs.map(g => {
              const list = students.filter(g.match);
              const Icon = groupIcons[g.id] ?? Users;
              const preview = list.slice(0, 4);
              return (
                <Link
                  key={g.id}
                  to="/students/list"
                  search={{ group: g.id }}
                  className="card-soft group flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground/70">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight">{list.length}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-medium">{g.label}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.hint}</p>
                  <div className="mt-4 flex -space-x-2">
                    {preview.map(s => (
                      <div key={s.id} className="rounded-full ring-2 ring-[var(--color-card)]">
                        <AvatarMono name={s.name} hue={s.avatarHue} size={24} />
                      </div>
                    ))}
                    {list.length > preview.length && (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-[var(--color-card)]">
                        +{list.length - preview.length}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span>View students</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Browse by classroom */}
        <section className="mt-8">
          <h2 className="text-sm font-medium">Or browse by classroom</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {classes.map(c => (
              <Link
                key={c.id}
                to="/students/$classId"
                params={{ classId: c.id }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm hover:bg-muted"
              >
                {c.name}–{c.section}
                <span className="text-xs text-muted-foreground">{c.studentCount}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
