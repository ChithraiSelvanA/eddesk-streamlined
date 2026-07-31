import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { classes, students, smartGroupDefs, CURRENT_YEAR } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { NewAdmissionButton } from "@/components/app/new-admission-button";
import { Search, ArrowRight, Users, Wallet, Bus, CalendarPlus, TrendingDown, AlertTriangle } from "lucide-react";

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
  const [mode, setMode] = useState<"name" | "admission">("name");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const query = q.trim().toLowerCase();

  const nameMatches = useMemo(() => {
    if (mode !== "name" || !query) return [];
    return students.filter(s => s.name.toLowerCase().includes(query)).slice(0, 12);
  }, [query, mode]);

  const admissionMatch = useMemo(() => {
    if (mode !== "admission" || !query) return null;
    return students.find(s => s.admissionNo.toLowerCase() === query) ?? null;
  }, [query, mode]);

  const admissionSuggestions = useMemo(() => {
    if (mode !== "admission" || !query || admissionMatch) return [];
    return students.filter(s => s.admissionNo.toLowerCase().includes(query)).slice(0, 6);
  }, [query, mode, admissionMatch]);

  const openStudent = (s: (typeof students)[number]) =>
    navigate({ to: "/students/$classId/$studentId", params: { classId: s.classId, studentId: s.id } });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Students" }]}
        title="Find a student"
        description={`${students.length.toLocaleString()} students · ${classes.length} classrooms. Search directly, or start from a smart group.`}
        actions={
          <>
            <Button variant="outline" size="sm">Import CSV</Button>
            <NewAdmissionButton />
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Normal search */}
        <section className="card-soft p-6">
          <h2 className="text-sm font-medium">Normal search</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose what you're searching by. Names return a list of matches; an admission number opens the profile directly.
          </p>

          <div className="mt-4 inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
            {([["name", "Student name"], ["admission", "Admission number"]] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => { setMode(v); setQ(""); }}
                className={
                  "rounded-md px-3.5 py-1.5 text-sm transition-colors " +
                  (mode === v ? "bg-card font-medium text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground")
                }
              >
                {l}
              </button>
            ))}
          </div>

          <form
            className="relative mt-4 max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "admission" && admissionMatch) openStudent(admissionMatch);
              if (mode === "name" && nameMatches.length === 1) openStudent(nameMatches[0]);
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={mode === "name" ? "e.g. Aanya Sharma" : "e.g. EDK-2025-1004"}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 bg-surface pl-9"
            />
          </form>

          {query && mode === "name" && (
            <div className="mt-4 max-w-xl overflow-hidden rounded-lg border border-border">
              {nameMatches.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No student matches “{q}”</p>
              )}
              {nameMatches.length > 0 && (
                <p className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                  {nameMatches.length} match{nameMatches.length > 1 ? "es" : ""} — open a profile
                </p>
              )}
              {nameMatches.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: s.classId, studentId: s.id }}
                  className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/50"
                >
                  <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.admissionNo} · {s.className} · Roll {s.rollNo}</p>
                  </div>
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}

          {query && mode === "admission" && (
            <div className="mt-4 max-w-xl overflow-hidden rounded-lg border border-border">
              {admissionMatch ? (
                <Link
                  to="/students/$classId/$studentId"
                  params={{ classId: admissionMatch.classId, studentId: admissionMatch.id }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
                >
                  <AvatarMono name={admissionMatch.name} hue={admissionMatch.avatarHue} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{admissionMatch.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Exact match · press Enter to open profile</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ) : admissionSuggestions.length > 0 ? (
                <>
                  <p className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">Partial matches</p>
                  {admissionSuggestions.map(s => (
                    <Link
                      key={s.id}
                      to="/students/$classId/$studentId"
                      params={{ classId: s.classId, studentId: s.id }}
                      className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/50"
                    >
                      <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.admissionNo}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.name} · {s.className}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No admission number matches “{q}”</p>
              )}
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
