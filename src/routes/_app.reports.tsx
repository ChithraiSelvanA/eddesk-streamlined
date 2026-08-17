import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { MobileSectionNav, type SectionItem } from "@/components/app/mobile-section-nav";
import { BarChart3, ArrowRight, CalendarCheck, GraduationCap, Wallet, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
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

const groups = [
  {
    id: "attendance",
    title: "Attendance",
    items: [
      ["Daily attendance", "Class-wise breakdown"],
      ["Chronic absentees", "> 5 absences this month"],
      ["Leave summary", "Approved / declined"],
    ],
  },
  {
    id: "academic",
    title: "Academic",
    items: [
      ["Term report", "All grades"],
      ["Subject performance", "Averages & top students"],
      ["Timetable coverage", "Substitutions this term"],
    ],
  },
  {
    id: "fees",
    title: "Fees",
    items: [
      ["Collection summary", "This term"],
      ["Overdue students", "> 30 days"],
      ["Concessions", "Applied this year"],
    ],
  },
  {
    id: "communication",
    title: "Communication",
    items: [
      ["Notice reach", "Delivered vs read"],
      ["Message volume", "Per class / parent"],
      ["Event RSVPs", "Confirmed / declined"],
    ],
  },
];

const sections: SectionItem[] = [
  { id: "attendance", label: "Attendance", icon: <CalendarCheck className="h-[18px] w-[18px]" /> },
  { id: "academic", label: "Academic", icon: <GraduationCap className="h-[18px] w-[18px]" /> },
  { id: "fees", label: "Fees", icon: <Wallet className="h-[18px] w-[18px]" /> },
  { id: "communication", label: "Comms", icon: <MessagesSquare className="h-[18px] w-[18px]" /> },
];

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
              {g.items.map(([t, s]) => (
                <button key={t} className="card-soft group flex items-center gap-3 p-4 text-left active:bg-muted/40 sm:items-start sm:p-5 hover:shadow-[var(--shadow-elevated)]">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted"><BarChart3 className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t}</p>
                    <p className="truncate text-xs text-muted-foreground">{s}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <MobileSectionNav items={sections} />
    </div>
  );
}
