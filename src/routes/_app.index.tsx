import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import {
  Wallet, CalendarCheck2, MessagesSquare, ClipboardList, UserPlus, PartyPopper,
  Plus, Receipt, Megaphone, GraduationCap, ArrowUpRight, TrendingUp, ChevronRight,
} from "lucide-react";
import {
  pendingFeeStudents, chats, leaveRequests, recentAdmissions, events, students,
} from "@/data/mock";
import { NewAdmissionButton } from "@/components/app/new-admission-button";
import { MobileSectionNav, dashboardSections } from "@/components/app/mobile-section-nav";


export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EdDesk One" },
      { name: "description", content: "Actionable overview of attendance, fees, messages and admissions for your school." },
      { property: "og:title", content: "Dashboard — EdDesk One" },
      { property: "og:description", content: "Actionable overview of attendance, fees, messages and admissions for your school." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalStudents = students.length;
  const presentToday = Math.round(totalStudents * 0.94);
  const attendancePct = Math.round((presentToday / totalStudents) * 100);
  const unreadCount = chats.reduce((a, c) => a + c.unread, 0);
  const pendingLeaves = leaveRequests.filter(l => l.status === "pending").length;
  const totalPending = pendingFeeStudents.reduce((a, s) => a + s.feeDue, 0);

  return (
    <div>
      <PageHeader
        title="Good morning, Rhea"
        description="Here's what needs your attention across Ridgeview Academy today."
        actions={
          <>
            <Button variant="outline" size="sm"><Megaphone className="h-4 w-4" /> Create notice</Button>
            <NewAdmissionButton />
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-28 sm:px-6 md:px-8 md:py-8 md:pb-8 space-y-8">

        {/* At a glance */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <GlanceCard
            label="Attendance today"
            value={`${attendancePct}%`}
            hint={`${presentToday} of ${totalStudents} present`}
            trend="+2.1%"
            icon={<CalendarCheck2 className="h-4 w-4" />}
          />
          <GlanceCard
            label="Pending fees"
            value={`₹${(totalPending / 1000).toFixed(1)}k`}
            hint={`${pendingFeeStudents.length} students`}
            trend="-8%"
            trendTone="good"
            icon={<Wallet className="h-4 w-4" />}
          />
          <GlanceCard
            label="Parent messages"
            value={String(unreadCount)}
            hint="Unread across 3 threads"
            icon={<MessagesSquare className="h-4 w-4" />}
          />
          <GlanceCard
            label="Leave requests"
            value={String(pendingLeaves)}
            hint="Awaiting approval"
            icon={<ClipboardList className="h-4 w-4" />}
          />
        </section>

        {/* Quick actions */}
        <section id="quick-actions" className="scroll-mt-20">
          <SectionTitle title="Quick actions" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickAction icon={<UserPlus className="h-4 w-4" />} label="New admission" to="/students" hint="Add a student and parent" />
            <QuickAction icon={<Receipt className="h-4 w-4" />} label="Record payment" to="/fees" hint="Log a fee payment" />
            <QuickAction icon={<Megaphone className="h-4 w-4" />} label="Create notice" to="/communication" hint="Announce to parents" />
            <QuickAction icon={<GraduationCap className="h-4 w-4" />} label="Add a class" to="/academic" hint="Configure grade & section" />
          </div>
        </section>

        {/* Actionable cards row */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ActionCard
            id="pending-fees"

            title="Pending fees"
            hint={`${pendingFeeStudents.length} students · ₹${(totalPending / 1000).toFixed(1)}k due`}
            cta={{ label: "Open Fees", to: "/fees" }}
          >
            <ul className="divide-y divide-border/60">
              {pendingFeeStudents.slice(0, 4).map(s => (
                <li key={s.id}>
                  <Link
                    to="/students/$classId/$studentId"
                    params={{ classId: s.classId, studentId: s.id }}
                    className="flex items-center gap-3 py-2.5 hover:opacity-80"
                  >
                    <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.className} · {s.admissionNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">₹{s.feeDue.toLocaleString()}</p>
                      <StatusPill tone={s.feeStatus === "overdue" ? "danger" : "warning"}>
                        {s.feeStatus}
                      </StatusPill>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </ActionCard>

          <ActionCard
            id="parent-messages"
            title="Parent messages"

            hint={`${unreadCount} unread`}
            cta={{ label: "Open Chat", to: "/communication" }}
          >
            <ul className="divide-y divide-border/60">
              {chats.slice(0, 4).map(c => (
                <li key={c.id} className="flex items-start gap-3 py-2.5">
                  <AvatarMono name={c.parentName} hue={c.hue} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{c.parentName}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="mt-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </ActionCard>

          <ActionCard
            id="leave-requests"
            title="Leave requests"

            hint={`${pendingLeaves} awaiting review`}
            cta={{ label: "Review all", to: "/communication" }}
          >
            <ul className="divide-y divide-border/60">
              {leaveRequests.map(l => (
                <li key={l.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{l.studentName}</p>
                    <StatusPill tone="warning">Pending</StatusPill>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {l.className} · {l.dates} · {l.reason}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Approve</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Decline</Button>
                  </div>
                </li>
              ))}
            </ul>
          </ActionCard>
        </section>

        {/* Bottom row */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActionCard
            id="recent-admissions"
            title="Recent admissions"

            hint="Last 5"
            cta={{ label: "All students", to: "/students" }}
          >
            <ul className="divide-y divide-border/60">
              {recentAdmissions.map(s => (
                <li key={s.id}>
                  <Link
                    to="/students/$classId/$studentId"
                    params={{ classId: s.classId, studentId: s.id }}
                    className="flex items-center gap-3 py-2.5 hover:opacity-80"
                  >
                    <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Admitted to {s.className} · {s.admissionNo}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </ActionCard>

          <ActionCard
            id="upcoming-events"
            title="Upcoming events"

            hint="Next 30 days"
            cta={{ label: "Open calendar", to: "/communication" }}
          >
            <ul className="divide-y divide-border/60">
              {events.map(e => (
                <li key={e.id} className="flex items-center gap-4 py-2.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-surface-muted text-center leading-tight">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">{e.date.split(" ")[0]}</p>
                      <p className="text-sm font-semibold">{e.date.split(" ")[1]}</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.time} · {e.location}</p>
                  </div>
                  <StatusPill tone="info">{e.category}</StatusPill>
                </li>
              ))}
            </ul>
          </ActionCard>
        </section>
      </div>

      <NewAdmissionButton fab label="New admission" />
      <MobileSectionNav items={dashboardSections} />
    </div>

  );
}

function GlanceCard({ label, value, hint, trend, trendTone = "good", icon }: {
  label: string; value: string; hint: string; trend?: string; trendTone?: "good" | "bad"; icon: React.ReactNode;
}) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div>
        {trend && (
          <span className={"inline-flex items-center gap-0.5 text-xs font-medium " + (trendTone === "good" ? "text-[color:var(--color-success)]" : "text-[color:var(--color-destructive)]")}>
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-foreground/70">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function QuickAction({ icon, label, hint, to }: { icon: React.ReactNode; label: string; hint: string; to: string }) {
  return (
    <Link to={to} className="card-soft group flex items-center gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-sm font-medium text-foreground/80">{title}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function ActionCard({ id, title, hint, cta, children }: {
  id?: string; title: string; hint?: string; cta?: { label: string; to: string }; children: React.ReactNode;
}) {
  return (
    <div id={id} className="card-soft flex flex-col scroll-mt-20">

      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {cta && (
          <Link to={cta.to} className="text-xs font-medium text-foreground/70 hover:text-foreground">
            {cta.label} →
          </Link>
        )}
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

// unused imports guard
void PartyPopper;
