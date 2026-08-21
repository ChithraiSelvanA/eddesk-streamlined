import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, differenceInCalendarDays, format, subDays } from "date-fns";
import {
  CalendarDays,
  Check,
  Clock,
  Download,
  LayoutGrid,
  MessageSquare,
  Phone,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/lib/scroll-to";
import { classes, students, type Student } from "@/data/mock";

export const Route = createFileRoute("/_app/reports/leave-summary")({
  head: () => ({
    meta: [
      { title: "Leave summary report — EdDesk One" },
      {
        name: "description",
        content:
          "Student leave requests over a selected window with approved, declined and pending counts, reason mix and one-tap approvals.",
      },
      { property: "og:title", content: "Leave summary report — EdDesk One" },
      {
        property: "og:description",
        content:
          "Student leave requests over a selected window with approved, declined and pending counts, reason mix and one-tap approvals.",
      },
    ],
  }),
  component: LeaveSummary,
});

type Status = "pending" | "approved" | "declined";

const reasons = ["Medical", "Family function", "Travel", "Religious", "Sports / competition", "Other"] as const;

type LeaveRow = {
  id: string;
  student: Student;
  reason: string;
  from: Date;
  to: Date;
  days: number;
  status: Status;
  requestedOn: Date;
};

const statusMeta: Record<Status, { label: string; tone: "warning" | "success" | "danger"; icon: typeof Clock }> = {
  pending: { label: "Pending", tone: "warning", icon: Clock },
  approved: { label: "Approved", tone: "success", icon: Check },
  declined: { label: "Declined", tone: "danger", icon: X },
};

const windows = [
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
];

const navItems: { value: "all" | Status; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: Check },
  { value: "declined", label: "Declined", icon: X },
];

/** Deterministic pseudo-random helper so the report is stable between renders. */
function hash(key: string) {
  let h = 11;
  for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) % 1000003;
  return h;
}

function buildLeaves(days: number): LeaveRow[] {
  const today = new Date();
  const rows: LeaveRow[] = [];

  students.forEach(s => {
    const count = hash(`${s.id}|count`) % 100 < 55 ? (hash(`${s.id}|n`) % 3) + 1 : 0;
    for (let k = 0; k < count; k++) {
      const seed = hash(`${s.id}|leave|${k}`);
      const offset = seed % days;
      const from = subDays(today, offset);
      const span = (hash(`${s.id}|span|${k}`) % 4) + 1;
      const to = addDays(from, span - 1);
      const reason = reasons[hash(`${s.id}|reason|${k}`) % reasons.length];
      const r = hash(`${s.id}|status|${k}`) % 100;
      // Recent requests are more likely to still be pending.
      const status: Status = offset <= 4 ? (r < 65 ? "pending" : r < 90 ? "approved" : "declined") : r < 74 ? "approved" : r < 90 ? "declined" : "pending";
      rows.push({
        id: `lv-${s.id}-${k}`,
        student: s,
        reason,
        from,
        to,
        days: span,
        status,
        requestedOn: subDays(from, (hash(`${s.id}|req|${k}`) % 3) + 1),
      });
    }
  });

  return rows.sort((a, b) => b.from.getTime() - a.from.getTime());
}

function LeaveSummary() {
  const [days, setDays] = useState(30);
  const [classId, setClassId] = useState("all");
  const [reason, setReason] = useState("all");
  const [activeNav, setActiveNav] = useState<"all" | Status>("all");
  const [overrides, setOverrides] = useState<Record<string, Status>>({});

  const all = useMemo(() => buildLeaves(days), [days]);

  const rows = useMemo(() => {
    return all
      .filter(r => (classId === "all" ? true : r.student.classId === classId))
      .filter(r => (reason === "all" ? true : r.reason === reason))
      .map(r => ({ ...r, status: overrides[r.id] ?? r.status }));
  }, [all, classId, reason, overrides]);

  const totals = useMemo(() => {
    const pending = rows.filter(r => r.status === "pending");
    const approved = rows.filter(r => r.status === "approved");
    const declined = rows.filter(r => r.status === "declined");
    const daysLost = approved.reduce((a, r) => a + r.days, 0);
    const avg = rows.length ? Math.round((rows.reduce((a, r) => a + r.days, 0) / rows.length) * 10) / 10 : 0;
    const approvalRate = approved.length + declined.length ? Math.round((approved.length / (approved.length + declined.length)) * 100) : 0;
    return {
      total: rows.length,
      pending: pending.length,
      approved: approved.length,
      declined: declined.length,
      daysLost,
      avg,
      approvalRate,
      pendingRows: pending,
      approvedRows: approved,
      declinedRows: declined,
    };
  }, [rows]);

  const byReason = useMemo(() => {
    return reasons
      .map(r => {
        const list = rows.filter(x => x.reason === r);
        return {
          reason: r as string,
          count: list.length,
          days: list.reduce((a, x) => a + x.days, 0),
          share: rows.length ? Math.round((list.length / rows.length) * 100) : 0,
        };
      })
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const byClass = useMemo(() => {
    return classes
      .map(c => {
        const list = rows.filter(r => r.student.classId === c.id);
        return {
          cls: c,
          count: list.length,
          days: list.reduce((a, r) => a + r.days, 0),
          pending: list.filter(r => r.status === "pending").length,
        };
      })
      .filter(c => c.count > 0)
      .sort((a, b) => b.days - a.days);
  }, [rows]);

  const decide = (row: LeaveRow, status: Status) => {
    setOverrides(prev => ({ ...prev, [row.id]: status }));
    toast.success(status === "approved" ? "Leave approved" : "Leave declined", {
      description: `${row.student.name} · ${format(row.from, "d MMM")}${row.days > 1 ? ` – ${format(row.to, "d MMM")}` : ""}`,
    });
  };

  const exportCsv = () => {
    const header = "Admission No,Student,Class,Reason,From,To,Days,Status,Requested on,Parent,Mobile";
    const lines = rows.map(r =>
      [
        r.student.admissionNo,
        r.student.name,
        r.student.className,
        r.reason,
        format(r.from, "yyyy-MM-dd"),
        format(r.to, "yyyy-MM-dd"),
        r.days,
        statusMeta[r.status].label,
        format(r.requestedOn, "yyyy-MM-dd"),
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
    a.download = `leave-summary-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", { description: `${rows.length} leave requests over the last ${days} days.` });
  };

  const handleNav = (value: "all" | Status) => {
    setActiveNav(value);
    scrollToId(value === "all" ? "leave-all" : `leave-${value}`, 108);
  };

  const renderRow = (r: LeaveRow) => {
    const range = r.days > 1 ? `${format(r.from, "d MMM")} – ${format(r.to, "d MMM")}` : format(r.from, "d MMM");
    const upcoming = differenceInCalendarDays(r.from, new Date()) >= 0;
    return (
      <div key={r.id} className="flex items-center gap-3 border-b border-border/40 px-3.5 py-2.5 last:border-0 sm:px-5">
        <AvatarMono name={r.student.name} hue={r.student.avatarHue} size={34} />
        <Link
          to="/students/$classId/$studentId"
          params={{ classId: r.student.classId, studentId: r.student.id }}
          className="min-w-0 flex-1"
        >
          <p className="truncate text-sm font-medium">{r.student.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {r.student.className} · Roll {r.student.rollNo} · {r.reason}
          </p>
          <p className="truncate text-[11px] text-muted-foreground sm:hidden">
            {range} · {r.days} {r.days === 1 ? "day" : "days"}
            {upcoming ? " · upcoming" : ""}
          </p>
        </Link>

        <div className="hidden shrink-0 items-center gap-6 text-right sm:flex">
          <div className="w-28">
            <p className="text-sm font-medium tabular-nums">{range}</p>
            <p className="text-[10px] text-muted-foreground">{upcoming ? "upcoming" : `requested ${format(r.requestedOn, "d MMM")}`}</p>
          </div>
          <div className="w-14">
            <p className="text-sm font-semibold tabular-nums">{r.days}</p>
            <p className="text-[10px] text-muted-foreground">{r.days === 1 ? "day" : "days"}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <StatusPill tone={statusMeta[r.status].tone}>{statusMeta[r.status].label}</StatusPill>
          {r.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => decide(r, "approved")}
                aria-label={`Approve leave for ${r.student.name}`}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => decide(r, "declined")}
                aria-label={`Decline leave for ${r.student.name}`}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  };

  const section = (id: string, title: string, list: LeaveRow[], empty: string) => (
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

  const selectCls =
    "h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Reports", to: "/reports" }, { label: "Leave summary" }]}
        title="Leave summary"
        description={`Student leave requests in the last ${days} days — approved, declined and awaiting a decision.`}
        actions={
          <Button variant="outline" className="h-9" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 pb-28 sm:px-6 md:space-y-6 md:px-8 md:py-6 md:pb-8">
        {/* Filters */}
        <div className="card-soft grid grid-cols-2 gap-3 p-3.5 sm:p-4 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground" htmlFor="lv-period">
              Period
            </label>
            <select id="lv-period" className={selectCls} value={days} onChange={e => setDays(Number(e.target.value))}>
              {windows.map(w => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground" htmlFor="lv-class">
              Class
            </label>
            <select id="lv-class" className={selectCls} value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="all">All classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}-{c.section}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground" htmlFor="lv-reason">
              Reason
            </label>
            <select id="lv-reason" className={selectCls} value={reason} onChange={e => setReason(e.target.value)}>
              <option value="all">All reasons</option>
              {reasons.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section id="leave-all" className="scroll-mt-28">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Requests", value: totals.total, icon: Users },
              { label: "Awaiting decision", value: totals.pending, icon: Clock },
              { label: "Approval rate", value: `${totals.approvalRate}%`, icon: Check },
              { label: "Approved days lost", value: totals.daysLost, icon: CalendarDays },
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

          {/* Reason mix */}
          <div className="mt-5 grid gap-5 md:mt-6 md:grid-cols-2 md:gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground/80">Why students take leave</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="card-soft overflow-hidden">
                {byReason.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">No leave in this period.</p>
                )}
                {byReason.map(r => (
                  <div key={r.reason} className="border-b border-border/40 px-3.5 py-3 last:border-0 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.reason}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {r.count} requests · {r.days} days
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">{r.share}%</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.min(100, r.share)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground/80">Class-wise leave</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="card-soft overflow-hidden">
                {byClass.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing to show.</p>
                )}
                {byClass.map(c => (
                  <div key={c.cls.id} className="flex items-center gap-3 border-b border-border/40 px-3.5 py-3 last:border-0 sm:px-5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.cls.name}-{c.cls.section}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {c.count} requests · {c.days} days
                        {c.pending > 0 ? ` · ${c.pending} pending` : ""}
                      </p>
                    </div>
                    {c.pending > 0 && <StatusPill tone="warning">{c.pending} pending</StatusPill>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full register */}
          <div className="mt-5 md:mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-foreground/80">All requests ({totals.total})</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="card-soft overflow-hidden">
              {rows.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No leave requests match these filters.
                </p>
              ) : (
                rows.map(renderRow)
              )}
            </div>
          </div>
        </section>

        {section("leave-pending", `Awaiting decision (${totals.pending})`, totals.pendingRows, "Nothing is waiting on you.")}
        {section("leave-approved", `Approved (${totals.approved})`, totals.approvedRows, "No approved leave in this period.")}
        <div className="pb-2">
          {section("leave-declined", `Declined (${totals.declined})`, totals.declinedRows, "No declined leave in this period.")}
        </div>
      </div>

      {/* Mobile bottom section nav */}
      <nav
        aria-label="Leave sections"
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
