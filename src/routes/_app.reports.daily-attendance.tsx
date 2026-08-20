import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Phone,
  MessageSquare,
  Users,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { DateField } from "@/components/app/date-field";
import { StatusPill } from "@/components/app/status-pill";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/lib/scroll-to";
import { classes, students, type Student } from "@/data/mock";

export const Route = createFileRoute("/_app/reports/daily-attendance")({
  head: () => ({
    meta: [
      { title: "Daily attendance report — EdDesk One" },
      { name: "description", content: "Class-wise daily attendance with present, absent and late counts, plus absentee follow-up." },
      { property: "og:title", content: "Daily attendance report — EdDesk One" },
      { property: "og:description", content: "Class-wise daily attendance with present, absent and late counts, plus absentee follow-up." },
    ],
  }),
  component: DailyAttendance,
});

type Mark = "present" | "absent" | "late";

/** Deterministic pseudo-attendance so the report is stable per student + date. */
function markFor(studentId: string, date: string): Mark {
  let h = 7;
  const key = `${studentId}|${date}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100003;
  const r = h % 100;
  if (r < 88) return "present";
  if (r < 96) return "absent";
  return "late";
}

const markMeta: Record<Mark, { label: string; tone: "success" | "danger" | "warning"; icon: typeof CheckCircle2 }> = {
  present: { label: "Present", tone: "success", icon: CheckCircle2 },
  absent: { label: "Absent", tone: "danger", icon: XCircle },
  late: { label: "Late", tone: "warning", icon: Clock },
};

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

const navItems: { value: "all" | Mark; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "present", label: "Present", icon: CheckCircle2 },
  { value: "absent", label: "Absent", icon: XCircle },
  { value: "late", label: "Late", icon: Clock },
];

function DailyAttendance() {
  const [date, setDate] = useState(todayISO());
  const [classId, setClassId] = useState<string>("all");
  const [overrides, setOverrides] = useState<Record<string, Mark>>({});
  const [activeNav, setActiveNav] = useState<"all" | Mark>("all");

  // Reset manual edits when the date changes.
  const resetForDate = (next: string) => {
    setDate(next);
    setOverrides({});
  };

  const roster = useMemo(() => {
    const base = classId === "all" ? students : students.filter(s => s.classId === classId);
    return base.map(s => ({
      student: s,
      mark: overrides[`${date}|${s.id}`] ?? markFor(s.id, date),
    }));
  }, [classId, date, overrides]);

  const totals = useMemo(() => {
    const t = { present: 0, absent: 0, late: 0 };
    roster.forEach(r => { t[r.mark] += 1; });
    const total = roster.length || 1;
    return { ...t, total: roster.length, rate: Math.round(((t.present + t.late) / total) * 100) };
  }, [roster]);

  const byClass = useMemo(() => {
    return classes.map(c => {
      const rows = roster.filter(r => r.student.classId === c.id);
      const present = rows.filter(r => r.mark === "present").length;
      const absent = rows.filter(r => r.mark === "absent").length;
      const late = rows.filter(r => r.mark === "late").length;
      const total = rows.length;
      return {
        cls: c,
        total,
        present,
        absent,
        late,
        rate: total ? Math.round(((present + late) / total) * 100) : 0,
      };
    }).filter(r => r.total > 0);
  }, [roster]);

  const setMark = (s: Student, mark: Mark) => {
    setOverrides(prev => ({ ...prev, [`${date}|${s.id}`]: mark }));
  };

  const exportCsv = () => {
    const header = "Date,Admission No,Student,Class,Roll,Status,Parent,Mobile";
    const lines = roster.map(({ student: s, mark }) =>
      [date, s.admissionNo, s.name, s.className, s.rollNo, markMeta[mark].label, s.parentName, s.parentMobile]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance exported", { description: `${roster.length} records for ${format(parseISO(date), "dd MMM yyyy")}.` });
  };

  const presentRoster = roster.filter(r => r.mark === "present");
  const absentees = roster.filter(r => r.mark === "absent");
  const lateRoster = roster.filter(r => r.mark === "late");

  const handleNav = (value: "all" | Mark) => {
    setActiveNav(value);
    const id = value === "all" ? "attendance-all" : `attendance-${value}`;
    scrollToId(id, 108);
  };

  const renderStudentRow = ({ student: s, mark }: { student: Student; mark: Mark }) => (
    <div
      key={s.id}
      className="flex items-center gap-3 border-b border-border/40 px-3.5 py-2.5 last:border-0 sm:px-5"
    >
      <AvatarMono name={s.name} hue={s.avatarHue} size={34} />
      <Link
        to="/students/$classId/$studentId"
        params={{ classId: s.classId, studentId: s.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-medium">{s.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {s.className} · Roll {s.rollNo} · {s.admissionNo}
        </p>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        {(["present", "absent", "late"] as const).map(m => {
          const Icon = markMeta[m].icon;
          const active = mark === m;
          return (
            <button
              key={m}
              onClick={() => setMark(s, m)}
              aria-label={`Mark ${s.name} ${markMeta[m].label}`}
              title={markMeta[m].label}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md border transition-colors",
                active
                  ? m === "present"
                    ? "border-transparent bg-[color-mix(in_oklab,var(--color-success)_18%,transparent)] text-[color:var(--color-success)]"
                    : m === "absent"
                      ? "border-transparent bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)] text-[color:var(--color-destructive)]"
                      : "border-transparent bg-[color-mix(in_oklab,var(--color-warning)_22%,transparent)] text-[oklch(0.4_0.1_75)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <ChevronRight className="ml-0.5 hidden h-4 w-4 text-muted-foreground sm:block" />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Reports", to: "/reports" }, { label: "Daily attendance" }]}
        title="Daily attendance"
        description={`Class-wise attendance for ${format(parseISO(date), "EEEE, dd MMM yyyy")}.`}
        actions={
          <Button variant="outline" className="h-9" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 pb-24 sm:px-6 md:space-y-6 md:px-8 md:py-6 md:pb-6">
        {/* Controls */}
        <div className="card-soft grid gap-3 p-3.5 sm:grid-cols-2 sm:p-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
            <DateField value={date} onChange={v => resetForDate(v || todayISO())} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Class</label>
            <select
              value={classId}
              onChange={e => setClassId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
              ))}
            </select>
          </div>
        </div>

        {/* All section */}
        <section id="attendance-all" className="scroll-mt-28">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Attendance rate", value: `${totals.rate}%`, tone: "info" as const, icon: Users },
              { label: "Present", value: totals.present, tone: "success" as const, icon: CheckCircle2 },
              { label: "Absent", value: totals.absent, tone: "danger" as const, icon: XCircle },
              { label: "Late", value: totals.late, tone: "warning" as const, icon: Clock },
            ].map(k => (
              <div key={k.label} className="card-soft p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <k.icon className="h-3.5 w-3.5" />
                  <span className="truncate">{k.label}</span>
                </div>
                <p className="mt-1.5 text-xl font-semibold tabular-nums sm:text-2xl">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Class-wise breakdown */}
          <div className="mt-5 md:mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-foreground/80">Class-wise breakdown</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="card-soft overflow-hidden">
              <div className="hidden grid-cols-[1fr_90px_90px_90px_110px] gap-3 border-b border-border/70 px-5 py-2 text-[11px] uppercase tracking-wide text-muted-foreground md:grid">
                <span>Class</span><span className="text-right">Present</span><span className="text-right">Absent</span><span className="text-right">Late</span><span className="text-right">Rate</span>
              </div>
              {byClass.map(r => (
                <div
                  key={r.cls.id}
                  className="border-b border-border/40 px-3.5 py-3 text-sm last:border-0 sm:px-5 md:grid md:grid-cols-[1fr_90px_90px_90px_110px] md:items-center md:gap-3 md:py-2.5"
                >
                  <div className="flex items-center justify-between gap-2 md:block">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.cls.name}-{r.cls.section}</p>
                      <p className="truncate text-[11px] text-muted-foreground md:hidden">{r.cls.teacher} · {r.total} students</p>
                    </div>
                    <StatusPill tone={r.rate >= 90 ? "success" : r.rate >= 80 ? "warning" : "danger"} className="md:hidden">
                      {r.rate}%
                    </StatusPill>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted-foreground md:hidden">
                    <span>{r.present} present</span>
                    <span>{r.absent} absent</span>
                    <span>{r.late} late</span>
                  </div>
                  <span className="hidden tabular-nums md:block md:text-right">{r.present}</span>
                  <span className="hidden tabular-nums md:block md:text-right">{r.absent}</span>
                  <span className="hidden tabular-nums md:block md:text-right">{r.late}</span>
                  <div className="hidden md:flex md:justify-end">
                    <StatusPill tone={r.rate >= 90 ? "success" : r.rate >= 80 ? "warning" : "danger"}>{r.rate}%</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Present section */}
        <section id="attendance-present" className="scroll-mt-28">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground/80">Present ({totals.present})</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="card-soft overflow-hidden">
            {presentRoster.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No present students.</p>
            )}
            {presentRoster.map(renderStudentRow)}
          </div>
        </section>

        {/* Absent section */}
        <section id="attendance-absent" className="scroll-mt-28">
          {/* Absentee follow-up */}
          {absentees.length > 0 && (
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground/80">Absentee follow-up ({absentees.length})</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {absentees.slice(0, 9).map(({ student: s }) => (
                  <div key={s.id} className="card-soft flex items-center gap-3 p-3.5">
                    <AvatarMono name={s.name} hue={s.avatarHue} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{s.className} · {s.parentName}</p>
                    </div>
                    <a
                      href={`tel:${s.parentMobile.replace(/\s/g, "")}`}
                      aria-label={`Call ${s.parentName}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <Link
                      to="/communication"
                      search={{ tab: "chat", parent: s.parentId, parentInfo: s.className } as never}
                      aria-label={`Message ${s.parentName}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground/80">Absent register ({totals.absent})</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="card-soft overflow-hidden">
            {absentees.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No absent students.</p>
            )}
            {absentees.map(renderStudentRow)}
          </div>
        </section>

        {/* Late section */}
        <section id="attendance-late" className="scroll-mt-28 pb-2">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground/80">Late ({totals.late})</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="card-soft overflow-hidden">
            {lateRoster.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No late students.</p>
            )}
            {lateRoster.map(renderStudentRow)}
          </div>
        </section>
      </div>

      {/* Mobile bottom section nav */}
      <nav
        aria-label="Attendance sections"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="flex items-stretch overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((i) => {
              const on = activeNav === i.value;
              const Icon = i.icon;
              return (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => handleNav(i.value)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                    on ? "bg-muted text-foreground" : "text-muted-foreground active:bg-muted/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4", on ? "text-foreground" : "text-muted-foreground")} />
                  <span className="whitespace-nowrap">{i.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
