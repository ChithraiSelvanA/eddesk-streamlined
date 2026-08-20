import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  Download,
  Phone,
  MessageSquare,
  Users,
  TrendingDown,
  LayoutGrid,
  ShieldAlert,
  Flame,
  CalendarX2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/lib/scroll-to";
import { classes, students, type Student } from "@/data/mock";

export const Route = createFileRoute("/_app/reports/chronic-absentees")({
  head: () => ({
    meta: [
      { title: "Chronic absentees report — EdDesk One" },
      { name: "description", content: "Students with repeated absences over the selected window, with risk tiers and parent follow-up actions." },
      { property: "og:title", content: "Chronic absentees report — EdDesk One" },
      { property: "og:description", content: "Students with repeated absences over the selected window, with risk tiers and parent follow-up actions." },
    ],
  }),
  component: ChronicAbsentees,
});

type Mark = "present" | "absent" | "late";

/** Same deterministic generator as the daily report so numbers stay consistent. */
function markFor(studentId: string, date: string): Mark {
  let h = 7;
  const key = `${studentId}|${date}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100003;
  const r = h % 100;
  if (r < 88) return "present";
  if (r < 96) return "absent";
  return "late";
}

type Tier = "critical" | "high" | "watch";

const tierMeta: Record<Tier, { label: string; tone: "danger" | "warning" | "info"; icon: typeof Flame }> = {
  critical: { label: "Critical", tone: "danger", icon: Flame },
  high: { label: "High risk", tone: "warning", icon: ShieldAlert },
  watch: { label: "Watchlist", tone: "info", icon: AlertTriangle },
};

type Row = {
  student: Student;
  absences: number;
  lates: number;
  schoolDays: number;
  rate: number;
  streak: number;
  lastAbsent: string | null;
  tier: Tier;
};

const windows = [
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
];

const navItems: { value: "all" | Tier; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "critical", label: "Critical", icon: Flame },
  { value: "high", label: "High", icon: ShieldAlert },
  { value: "watch", label: "Watchlist", icon: AlertTriangle },
];

function ChronicAbsentees() {
  const [days, setDays] = useState(30);
  const [classId, setClassId] = useState<string>("all");
  const [threshold, setThreshold] = useState(3);
  const [activeNav, setActiveNav] = useState<"all" | Tier>("all");

  const rows = useMemo<Row[]>(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 1; i <= days; i++) {
      const d = subDays(today, i);
      const dow = d.getDay();
      if (dow === 0) continue; // Sundays are holidays
      dates.push(format(d, "yyyy-MM-dd"));
    }

    const base = classId === "all" ? students : students.filter(s => s.classId === classId);

    return base
      .map(s => {
        let absences = 0;
        let lates = 0;
        let streak = 0;
        let running = 0;
        let lastAbsent: string | null = null;
        // dates[0] is the most recent day
        dates.forEach((d, idx) => {
          const m = markFor(s.id, d);
          if (m === "absent") {
            absences += 1;
            if (!lastAbsent) lastAbsent = d;
            running += 1;
            streak = Math.max(streak, running);
          } else {
            if (idx === 0 || running > 0) running = 0;
            if (m === "late") lates += 1;
          }
        });
        const schoolDays = dates.length;
        const rate = schoolDays ? Math.round((absences / schoolDays) * 1000) / 10 : 0;
        const tier: Tier = rate >= 12 ? "critical" : rate >= 8 ? "high" : "watch";
        return { student: s, absences, lates, schoolDays, rate, streak, lastAbsent, tier };
      })
      .filter(r => r.absences >= threshold)
      .sort((a, b) => b.absences - a.absences || a.student.name.localeCompare(b.student.name));
  }, [days, classId, threshold]);

  const totals = useMemo(() => {
    const critical = rows.filter(r => r.tier === "critical").length;
    const high = rows.filter(r => r.tier === "high").length;
    const watch = rows.filter(r => r.tier === "watch").length;
    const avgRate = rows.length
      ? Math.round((rows.reduce((a, r) => a + r.rate, 0) / rows.length) * 10) / 10
      : 0;
    return { critical, high, watch, total: rows.length, avgRate };
  }, [rows]);

  const byClass = useMemo(() => {
    return classes
      .map(c => {
        const list = rows.filter(r => r.student.classId === c.id);
        const enrolled = students.filter(s => s.classId === c.id).length;
        return {
          cls: c,
          count: list.length,
          enrolled,
          share: enrolled ? Math.round((list.length / enrolled) * 100) : 0,
          absences: list.reduce((a, r) => a + r.absences, 0),
        };
      })
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const exportCsv = () => {
    const header = "Admission No,Student,Class,Roll,Absences,Late,School days,Absence rate %,Longest streak,Last absent,Risk,Parent,Mobile";
    const lines = rows.map(r =>
      [
        r.student.admissionNo,
        r.student.name,
        r.student.className,
        r.student.rollNo,
        r.absences,
        r.lates,
        r.schoolDays,
        r.rate,
        r.streak,
        r.lastAbsent ?? "—",
        tierMeta[r.tier].label,
        r.student.parentName,
        r.student.parentMobile,
      ]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chronic-absentees-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", { description: `${rows.length} students over the last ${days} days.` });
  };

  const handleNav = (value: "all" | Tier) => {
    setActiveNav(value);
    scrollToId(value === "all" ? "chronic-all" : `chronic-${value}`, 108);
  };

  const renderRow = (r: Row) => (
    <div
      key={r.student.id}
      className="flex items-center gap-3 border-b border-border/40 px-3.5 py-2.5 last:border-0 sm:px-5"
    >
      <AvatarMono name={r.student.name} hue={r.student.avatarHue} size={34} />
      <Link
        to="/students/$classId/$studentId"
        params={{ classId: r.student.classId, studentId: r.student.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-medium">{r.student.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {r.student.className} · Roll {r.student.rollNo} · {r.student.admissionNo}
        </p>
        <p className="truncate text-[11px] text-muted-foreground sm:hidden">
          {r.absences} absent · {r.rate}% · streak {r.streak}
        </p>
      </Link>

      <div className="hidden shrink-0 items-center gap-6 text-right sm:flex">
        <div className="w-16">
          <p className="text-sm font-semibold tabular-nums">{r.absences}</p>
          <p className="text-[10px] text-muted-foreground">absences</p>
        </div>
        <div className="w-16">
          <p className="text-sm font-semibold tabular-nums">{r.rate}%</p>
          <p className="text-[10px] text-muted-foreground">of {r.schoolDays} days</p>
        </div>
        <div className="w-16">
          <p className="text-sm font-semibold tabular-nums">{r.streak}</p>
          <p className="text-[10px] text-muted-foreground">streak</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <StatusPill tone={tierMeta[r.tier].tone}>{tierMeta[r.tier].label}</StatusPill>
        <a
          href={`tel:${r.student.parentMobile.replace(/\s/g, "")}`}
          aria-label={`Call ${r.student.parentName}`}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <Phone className="h-4 w-4" />
        </a>
        <Link
          to="/communication"
          search={{ tab: "chat", parent: r.student.parentId, parentInfo: r.student.className } as never}
          aria-label={`Message ${r.student.parentName}`}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  const section = (id: string, title: string, list: Row[], empty: string) => (
    <section id={id} className="scroll-mt-28">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground/80">{title}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="card-soft overflow-hidden">
        {list.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          list.map(renderRow)
        )}
      </div>
    </section>
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Reports", to: "/reports" }, { label: "Chronic absentees" }]}
        title="Chronic absentees"
        description={`Students with ${threshold}+ absences in the last ${days} days.`}
        actions={
          <Button variant="outline" className="h-9" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 pb-24 sm:px-6 md:space-y-6 md:px-8 md:py-6 md:pb-6">
        {/* Controls */}
        <div className="card-soft grid gap-3 p-3.5 sm:grid-cols-3 sm:p-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Period</label>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {windows.map(w => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
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
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Minimum absences</label>
            <select
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {[2, 3, 5, 8, 10].map(n => (
                <option key={n} value={n}>{n}+ absences</option>
              ))}
            </select>
          </div>
        </div>

        <section id="chronic-all" className="scroll-mt-28">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Flagged students", value: totals.total, icon: Users },
              { label: "Critical", value: totals.critical, icon: Flame },
              { label: "High risk", value: totals.high, icon: ShieldAlert },
              { label: "Avg absence rate", value: `${totals.avgRate}%`, icon: TrendingDown },
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

          {/* Class concentration */}
          <div className="mt-5 md:mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-foreground/80">Where it concentrates</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="card-soft overflow-hidden">
              {byClass.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No class crosses the current threshold.
                </p>
              )}
              {byClass.map(b => (
                <div key={b.cls.id} className="border-b border-border/40 px-3.5 py-3 last:border-0 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                      <CalendarX2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.cls.name}-{b.cls.section}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {b.count} of {b.enrolled} students · {b.absences} absences logged
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">{b.share}%</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-destructive)]/70"
                      style={{ width: `${Math.min(100, b.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full list */}
          <div className="mt-5 md:mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-foreground/80">All flagged students ({totals.total})</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="card-soft overflow-hidden">
              {rows.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No student crosses {threshold} absences in this period.
                </p>
              ) : (
                rows.map(renderRow)
              )}
            </div>
          </div>
        </section>

        {section("chronic-critical", `Critical (${totals.critical})`, rows.filter(r => r.tier === "critical"), "No critical cases right now.")}
        {section("chronic-high", `High risk (${totals.high})`, rows.filter(r => r.tier === "high"), "No high-risk cases right now.")}
        <div className="pb-2">
          {section("chronic-watch", `Watchlist (${totals.watch})`, rows.filter(r => r.tier === "watch"), "Watchlist is empty.")}
        </div>
      </div>

      {/* Mobile bottom section nav */}
      <nav
        aria-label="Chronic absentee sections"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="flex items-stretch overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map(i => {
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
