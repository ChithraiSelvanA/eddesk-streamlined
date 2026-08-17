import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { classes as seedClasses, subjects, teachers, holidays, type ClassRoom } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Calendar, CalendarClock } from "lucide-react";
import { StatusPill } from "@/components/app/status-pill";
import { AvatarMono } from "@/components/app/avatar-mono";
import { ClassDialog } from "@/components/app/class-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";


export const Route = createFileRoute("/_app/academic")({
  head: () => ({
    meta: [
      { title: "Academic — EdDesk One" },
      { name: "description", content: "Manage academic year, classes, subjects, teachers, timetable and holidays in one place." },
      { property: "og:title", content: "Academic — EdDesk One" },
      { property: "og:description", content: "Manage academic year, classes, subjects, teachers, timetable and holidays." },
    ],
  }),
  component: AcademicLayout,
});

function AcademicLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // If we're on a nested route, render outlet only
  if (pathname !== "/academic") return <Outlet />;
  return <AcademicHome />;
}

function AcademicHome() {
  const [tab, setTab] = useState("classes");
  const [classes, setClasses] = useState<ClassRoom[]>(seedClasses.map((c) => ({ ...c })));

  const upsertClass = (c: ClassRoom) =>
    setClasses((cur) => (cur.some((x) => x.id === c.id) ? cur.map((x) => (x.id === c.id ? c : x)) : [...cur, c]));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Academic" }]}
        title="Academic"
        description="Academic year 2025–26 · Term 1"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setTab("timetable")}><CalendarClock className="h-4 w-4" /> Timetable</Button>
            <ClassDialog onSave={upsertClass} />
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start overflow-x-auto flex-nowrap">
            {[
              ["classes", "Classes", classes.length],

              ["subjects", "Subjects", subjects.length],
              ["teachers", "Teachers", teachers.length],
              ["timetable", "Timetable"],
              ["holidays", "Holidays", holidays.length],
            ].map(([v, label, count]) => (
              <TabsTrigger
                key={v as string}
                value={v as string}
                className="rounded-none border-b-2 border-transparent bg-transparent shrink-0 px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {label}
                {count !== undefined && (
                  <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{count as number}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="classes" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(c => (
                <Link
                  key={c.id}
                  to="/academic/classes/$classId"
                  params={{ classId: c.id }}
                  className="card-soft group p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.room}</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">{c.name}–{c.section}</h3>
                    </div>
                    <StatusPill tone="neutral">
                      <Users className="h-3 w-3" /> {c.studentCount}
                    </StatusPill>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Class teacher</span>
                    <span className="font-medium">{c.teacher}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subjects</span>
                    <span className="font-medium">{c.subjects.length}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span>View class</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_120px_80px] gap-4 border-b border-border/60 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Subject</span><span>Code</span><span>Category</span><span className="text-right">Classes</span>
              </div>
              {subjects.map(s => {
                const usedIn = classes.filter(c => c.subjects.includes(s.id)).length;
                return (
                  <div key={s.id} className="grid grid-cols-[1fr_100px_120px_80px] items-center gap-4 border-b border-border/40 px-5 py-3 last:border-0 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground"><BookOpen className="h-4 w-4" /></div>
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{s.code}</span>
                    <StatusPill tone={s.category === "Core" ? "info" : "neutral"}>{s.category}</StatusPill>
                    <span className="text-right text-sm tabular-nums">{usedIn}</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map(t => (
                <div key={t.id} className="card-soft p-5">
                  <div className="flex items-center gap-3">
                    <AvatarMono name={t.name} hue={t.avatarHue} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Teaches</span><span className="font-medium">{t.subjects.join(", ")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Classes</span><span className="font-medium">{t.classes.length}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timetable" className="mt-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Master timetable · Grade 5-A shown as a preview. Open a class to edit.
              </div>
              <MiniTimetable />
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="mt-6">
            <div className="card-soft">
              {holidays.map(h => (
                <div key={h.id} className="flex items-center gap-4 border-b border-border/40 px-5 py-3 last:border-0">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-center">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">{h.date.split(" ")[0]}</p>
                      <p className="text-sm font-semibold">{h.date.split(" ")[1]}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.type}</p>
                  </div>
                  <StatusPill tone="info">{h.type}</StatusPill>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function MiniTimetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const slots = ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00"];
  const grid = [
    ["Math","Eng","Sci","Break","SST","Art"],
    ["Eng","Math","PE","Break","Sci","Music"],
    ["Sci","Math","Eng","Break","SST","CS"],
    ["Math","Sci","Eng","Break","Art","PE"],
    ["Eng","SST","Math","Break","Sci","Music"],
    ["Math","Sci","—","—","—","—"],
  ];
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="w-16 text-left text-xs font-medium text-muted-foreground"></th>
            {slots.map(s => <th key={s} className="text-left text-xs font-medium text-muted-foreground">{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((d, di) => (
            <tr key={d}>
              <td className="pr-2 text-xs font-medium text-muted-foreground">{d}</td>
              {grid[di].map((cell, ci) => (
                <td key={ci}>
                  <div className={"rounded-md border border-border/60 px-2 py-2 text-xs " + (cell === "Break" || cell === "—" ? "bg-muted/50 text-muted-foreground" : "bg-surface")}>
                    {cell}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
