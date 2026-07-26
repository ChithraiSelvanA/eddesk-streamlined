import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { getClass, studentsInClass, subjects as allSubjects, teachers } from "@/data/mock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import { Users, BookOpen, CalendarCheck2, Clock, Pencil, MoreHorizontal } from "lucide-react";
import { MiniTimetable } from "./_app.academic";

export const Route = createFileRoute("/_app/academic/classes/$classId")({
  loader: ({ params }) => {
    const cls = getClass(params.classId);
    if (!cls) throw notFound();
    return { cls };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cls.name}-${loaderData.cls.section} — Academic — EdDesk One` },
          { name: "description", content: `Class details, students, subjects, teachers and timetable for ${loaderData.cls.name}-${loaderData.cls.section}.` },
        ]
      : [{ title: "Class — EdDesk One" }, { name: "robots", content: "noindex" }],
  }),
  component: ClassDetail,
});

function ClassDetail() {
  const { cls } = Route.useLoaderData();
  const students = studentsInClass(cls.id);
  const clsSubjects = allSubjects.filter(s => cls.subjects.includes(s.id));

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Academic", to: "/academic" },
          { label: "Classes", to: "/academic" },
          { label: `${cls.name}-${cls.section}` },
        ]}
        title={`${cls.name}-${cls.section}`}
        description={`${cls.room} · Class teacher ${cls.teacher}`}
        actions={
          <>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Students" value={cls.studentCount} />
          <Stat icon={<BookOpen className="h-4 w-4" />} label="Subjects" value={clsSubjects.length} />
          <Stat icon={<CalendarCheck2 className="h-4 w-4" />} label="Attendance today" value="94%" />
          <Stat icon={<Clock className="h-4 w-4" />} label="Periods / day" value={6} />
        </div>

        <Tabs defaultValue="students">
          <TabsList className="bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start">
            {[
              ["students", "Students"],
              ["subjects", "Subjects"],
              ["teachers", "Teachers"],
              ["attendance", "Attendance"],
              ["timetable", "Timetable"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_140px_140px_120px_80px] items-center gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Roll</span><span>Student</span><span>Admission no.</span><span>Parent</span><span>Fees</span><span className="text-right">Att.</span>
              </div>
              {students.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: cls.id, studentId: s.id }}
                  className="grid grid-cols-[60px_1fr_140px_140px_120px_80px] items-center gap-3 border-b border-border/40 px-5 py-2.5 text-sm last:border-0 hover:bg-muted/50"
                >
                  <span className="text-muted-foreground tabular-nums">{s.rollNo}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                    <span className="truncate font-medium">{s.name}</span>
                  </div>
                  <span className="truncate text-muted-foreground">{s.admissionNo}</span>
                  <span className="truncate">{s.parentName}</span>
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                    {s.feeStatus}
                  </StatusPill>
                  <span className="text-right tabular-nums">{s.attendance}%</span>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clsSubjects.map(s => (
                <div key={s.id} className="card-soft p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground"><BookOpen className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code} · {s.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.filter(t => t.classes.some(c => c.startsWith(cls.name))).map(t => (
                <div key={t.id} className="card-soft flex items-center gap-3 p-4">
                  <AvatarMono name={t.name} hue={t.avatarHue} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.subjects.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="card-soft p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Today · Monday, 4 Aug</p>
                  <p className="text-xs text-muted-foreground">30 present · 2 absent · 0 leave</p>
                </div>
                <Button size="sm" variant="outline">Mark attendance</Button>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 lg:grid-cols-16">
                {students.slice(0, 32).map((s, i) => (
                  <div key={s.id} title={s.name}
                    className={"aspect-square rounded-md " + ([2, 17].includes(i) ? "bg-[color-mix(in_oklab,var(--color-destructive)_25%,transparent)]" : "bg-[color-mix(in_oklab,var(--color-success)_20%,transparent)]")}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Each tile is one student. Hover to see names. Tap to change status.</p>
            </div>
          </TabsContent>

          <TabsContent value="timetable" className="mt-6">
            <div className="card-soft p-6">
              <MiniTimetable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-muted">{icon}</div>
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
