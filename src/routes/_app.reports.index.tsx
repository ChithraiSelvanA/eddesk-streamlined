import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { MobileSectionNav, type SectionItem } from "@/components/app/mobile-section-nav";
import { BarChart3, ArrowRight, CalendarCheck, GraduationCap, Wallet, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/_app/reports/")({
  head: () => ({
    meta: [
      { title: "Reports — EdDesk One" },
      { name: "description", content: "Attendance, academic, fee and communication reports for your school." },
      { property: "og:title", content: "Reports — EdDesk One" },
      { property: "og:description", content: "Attendance, academic, fee and communication reports for your school." },
    ],
  }),
  component: Reports,
});

type ReportItem = { title: string; hint: string; to?: string };

const groups: { id: string; title: string; items: ReportItem[] }[] = [
  {
    id: "attendance",
    title: "Attendance",
    items: [
      { title: "Daily attendance", hint: "Class-wise breakdown", to: "/reports/daily-attendance" },
      { title: "Chronic absentees", hint: "Repeat absences & risk tiers", to: "/reports/chronic-absentees" },
      { title: "Leave summary", hint: "Approved / declined" },
    ],
  },
  {
    id: "academic",
    title: "Academic",
    items: [
      { title: "Term report", hint: "All grades" },
      { title: "Subject performance", hint: "Averages & top students" },
      { title: "Timetable coverage", hint: "Substitutions this term" },
    ],
  },
  {
    id: "fees",
    title: "Fees",
    items: [
      { title: "Collection summary", hint: "This term" },
      { title: "Overdue students", hint: "> 30 days" },
      { title: "Concessions", hint: "Applied this year" },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    items: [
      { title: "Notice reach", hint: "Delivered vs read" },
      { title: "Message volume", hint: "Per class / parent" },
      { title: "Event RSVPs", hint: "Confirmed / declined" },
    ],
  },
];

const sections: SectionItem[] = [
  { id: "attendance", label: "Attendance", icon: <CalendarCheck className="h-[18px] w-[18px]" /> },
  { id: "academic", label: "Academic", icon: <GraduationCap className="h-[18px] w-[18px]" /> },
  { id: "fees", label: "Fees", icon: <Wallet className="h-[18px] w-[18px]" /> },
  { id: "communication", label: "Comms", icon: <MessagesSquare className="h-[18px] w-[18px]" /> },
];

const cardCls =
  "card-soft group flex w-full items-center gap-3 p-4 text-left active:bg-muted/40 sm:items-start sm:p-5 hover:shadow-[var(--shadow-elevated)]";

function CardBody({ item }: { item: ReportItem }) {
  return (
    <>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </>
  );
}

function Reports() {
  return (
    <div>
      <PageHeader crumbs={[{ label: "Reports" }]} title="Reports" description="Pre-built reports for every module. Open one to drill down." />
      <div className="mx-auto max-w-[1400px] px-4 py-5 pb-24 sm:px-6 md:px-8 md:py-6 md:pb-6 space-y-7 md:space-y-8">
        {groups.map(g => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-medium text-foreground/80">{g.title}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {g.items.map(item =>
                item.to ? (
                  <Link key={item.title} to={item.to as never} className={cardCls}>
                    <CardBody item={item} />
                  </Link>
                ) : (
                  <button key={item.title} className={cardCls}>
                    <CardBody item={item} />
                  </button>
                )
              )}
            </div>
          </section>
        ))}
      </div>

      <MobileSectionNav items={sections} />
    </div>
  );
}
