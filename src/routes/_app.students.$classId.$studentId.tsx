import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { getClass, getStudent, getParent, recentPayments } from "@/data/mock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import {
  Printer, MessageSquare, ArrowRightLeft, Receipt, Pencil, MoreHorizontal,
  Phone, Mail, MapPin, Cake, IdCard, CalendarCheck2, Wallet, FileText, Activity, BookOpen, UsersRound,
} from "lucide-react";

export const Route = createFileRoute("/_app/students/$classId/$studentId")({
  loader: ({ params }) => {
    const cls = getClass(params.classId);
    const s = getStudent(params.studentId);
    if (!cls || !s) throw notFound();
    return { cls, s };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.s.name} — Student — EdDesk One` },
          { name: "description", content: `Complete profile of ${loaderData.s.name}: overview, parents, fees, attendance, report cards, documents and timeline.` },
        ]
      : [{ title: "Student — EdDesk One" }, { name: "robots", content: "noindex" }],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { cls, s } = Route.useLoaderData();
  const parent = getParent(s.parentId);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Students", to: "/students" },
          { label: `${cls.name}-${cls.section}`, to: "/students/$classId", params: { classId: cls.id } },
          { label: s.name },
        ]}
        title={s.name}
        description={`${s.admissionNo} · ${cls.name}-${cls.section} · Roll ${s.rollNo}`}
        actions={
          <>
            <Button variant="outline" size="sm"><Printer className="h-4 w-4" /> Print ID card</Button>
            <Button variant="outline" size="sm"><ArrowRightLeft className="h-4 w-4" /> Transfer</Button>
            <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4" /> Message</Button>
            {parent && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/parents/$parentId" params={{ parentId: parent.id }}>
                  <UsersRound className="h-4 w-4" /> Parent profile
                </Link>
              </Button>
            )}
            <RecordPaymentDialog
              studentName={s.name}
              admissionNo={s.admissionNo}
              due={s.feeDue}
              trigger={<Button size="sm"><Receipt className="h-4 w-4" /> Record payment</Button>}
            />
            <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </>
        }
      />


      <div className="mx-auto max-w-[1400px] px-8 py-6">
        {/* Hero card */}
        <div className="card-soft mb-6 flex flex-col gap-5 p-6 md:flex-row md:items-center">
          <AvatarMono name={s.name} hue={s.avatarHue} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{s.name}</h2>
              <StatusPill tone="info">{s.gender === "M" ? "Male" : "Female"}</StatusPill>
              <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                {s.feeStatus === "paid" ? "Fees paid" : `Fees ${s.feeStatus} · ₹${s.feeDue.toLocaleString()}`}
              </StatusPill>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
              <MiniField icon={<IdCard className="h-3.5 w-3.5" />} label="Admission" value={s.admissionNo} />
              <MiniField icon={<BookOpen className="h-3.5 w-3.5" />} label="Class" value={`${cls.name}-${cls.section}`} />
              <MiniField icon={<Cake className="h-3.5 w-3.5" />} label="Date of birth" value={s.dob} />
              <MiniField icon={<CalendarCheck2 className="h-3.5 w-3.5" />} label="Attendance" value={`${s.attendance}%`} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start overflow-x-auto">
            {[
              ["overview", "Overview"],
              ["parents", "Parents"],
              ["attendance", "Attendance"],
              ["fees", "Fees"],
              ["report", "Report cards"],
              ["documents", "Documents"],
              ["comm", "Communication"],
              ["timeline", "Timeline"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Panel title="Personal" action={<Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Pencil className="h-3 w-3" /> Edit</Button>}>
                <FieldRow label="Full name" value={s.name} />
                <FieldRow label="Gender" value={s.gender === "M" ? "Male" : "Female"} />
                <FieldRow label="Date of birth" value={s.dob} />
                <FieldRow label="Blood group" value="B+" />
                <FieldRow label="Address" value="42 Ridgeview Lane, Bengaluru" />
              </Panel>

              <Panel title="Academic">
                <FieldRow label="Admission no." value={s.admissionNo} />
                <FieldRow label="Class" value={`${cls.name}-${cls.section}`} />
                <FieldRow label="Roll no." value={String(s.rollNo)} />
                <FieldRow label="Section" value={s.section} />
                <FieldRow label="Class teacher" value={cls.teacher} />
              </Panel>

              <Panel title="Primary parent" action={
                parent && (
                  <Link to="/parents/$parentId" params={{ parentId: parent.id }} className="text-xs text-foreground/70 hover:text-foreground">Open profile →</Link>
                )
              }>
                {parent && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <AvatarMono name={parent.name} hue={210} size={40} />
                      <div>
                        <p className="text-sm font-medium">{parent.name}</p>
                        <p className="text-xs text-muted-foreground">{parent.occupation}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> <span className="text-foreground">{parent.mobile}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> <span className="text-foreground">{parent.email}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> <span className="text-foreground">42 Ridgeview Lane, Bengaluru</span></div>
                    </div>
                  </div>
                )}
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="parents" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Panel title="Father">
                {parent && (
                  <>
                    <div className="flex items-center gap-3">
                      <AvatarMono name={parent.name} hue={210} size={44} />
                      <div>
                        <p className="text-sm font-medium">{parent.name}</p>
                        <p className="text-xs text-muted-foreground">{parent.occupation}</p>
                      </div>
                    </div>
                    <FieldRow label="Mobile" value={parent.mobile} />
                    <FieldRow label="Email" value={parent.email} />
                    <FieldRow label="Occupation" value={parent.occupation} />
                  </>
                )}
              </Panel>
              <Panel title="Mother">
                <div className="flex items-center gap-3">
                  <AvatarMono name={"Kavya " + (parent?.name.split(" ")[1] ?? "")} hue={340} size={44} />
                  <div>
                    <p className="text-sm font-medium">Kavya {parent?.name.split(" ")[1]}</p>
                    <p className="text-xs text-muted-foreground">Designer</p>
                  </div>
                </div>
                <FieldRow label="Mobile" value="+91 9812 345 021" />
                <FieldRow label="Email" value={"kavya." + (parent?.name.split(" ")[1].toLowerCase() ?? "") + "@example.com"} />
                <FieldRow label="Occupation" value="Designer" />
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <Panel title="This month">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }, (_, i) => {
                  const state = [3, 15, 21].includes(i) ? "absent" : i === 9 ? "leave" : "present";
                  const cls = state === "absent" ? "bg-[color-mix(in_oklab,var(--color-destructive)_25%,transparent)]"
                    : state === "leave" ? "bg-[color-mix(in_oklab,var(--color-warning)_35%,transparent)]"
                    : "bg-[color-mix(in_oklab,var(--color-success)_20%,transparent)]";
                  return <div key={i} className={`grid aspect-square place-items-center rounded-md text-[10px] ${cls}`}>{i + 1}</div>;
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[color-mix(in_oklab,var(--color-success)_20%,transparent)]" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[color-mix(in_oklab,var(--color-destructive)_25%,transparent)]" /> Absent</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[color-mix(in_oklab,var(--color-warning)_35%,transparent)]" /> Leave</span>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="fees" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Panel title="Balance">
                <div className="py-2">
                  <p className="text-3xl font-semibold tabular-nums">₹{s.feeDue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.feeStatus === "paid" ? "All dues cleared" : `Next due: 10 Aug 2026`}
                  </p>
                  <Button size="sm" className="mt-4"><Receipt className="h-4 w-4" /> Record payment</Button>
                </div>
              </Panel>
              <div className="lg:col-span-2">
                <Panel title="Payment history">
                  <div className="divide-y divide-border/60">
                    {recentPayments.slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center gap-3 py-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-muted"><Wallet className="h-4 w-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{p.receiptNo}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.date} · {p.method}</p>
                        </div>
                        <span className="text-sm font-medium tabular-nums">₹{p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <Panel title="Report cards">
              <div className="divide-y divide-border/60">
                {["Term 1 · 2025–26", "Term 2 · 2024–25", "Term 1 · 2024–25"].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1"><p className="text-sm font-medium">{r}</p><p className="text-xs text-muted-foreground">Grade average: A-</p></div>
                    <Button size="sm" variant="outline">Open</Button>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Panel title="Documents" action={<Button size="sm" variant="outline">Upload</Button>}>
              <div className="divide-y divide-border/60">
                {["Birth certificate.pdf", "Aadhaar copy.pdf", "Previous school transfer certificate.pdf", "Vaccination record.pdf"].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1"><p className="text-sm font-medium">{d}</p><p className="text-xs text-muted-foreground">Uploaded 12 Jun 2025 · 340 KB</p></div>
                    <Button size="sm" variant="ghost">Download</Button>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="comm" className="mt-6">
            <Panel title="Communication">
              <div className="divide-y divide-border/60">
                {[
                  ["Fee reminder · August cycle", "Sent to parent · 2 days ago", "SMS"],
                  ["Parent-teacher meeting invite", "Sent · 1 week ago", "Email"],
                  ["Attendance alert", "Sent · 2 weeks ago", "App notification"],
                ].map(([t, sub, kind], i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><MessageSquare className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1"><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
                    <StatusPill tone="info">{kind}</StatusPill>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Panel title="Timeline">
              <ol className="relative space-y-4 border-l border-border pl-4">
                {[
                  ["Payment received", "₹12,500 for August tuition", "Today, 11:20"],
                  ["Attendance marked", "Present for Monday, 4 Aug", "Today, 8:15"],
                  ["Report card published", "Term 1 · 2025–26", "1 week ago"],
                  ["Admitted", `Admitted to ${cls.name}-${cls.section}`, "Jun 12, 2025"],
                ].map(([t, sub, when], i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary ring-2 ring-background" />
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">{t}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{when}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </li>
                ))}
              </ol>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MiniField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-soft">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className="space-y-1 px-5 py-4">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}

// unused icon imports guard
void Activity; void UsersRound;
