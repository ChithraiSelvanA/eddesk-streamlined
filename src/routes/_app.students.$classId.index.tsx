import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { getClass, studentsInClass } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Filter, Download, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/students/$classId/")({
  validateSearch: (search: Record<string, unknown>) => ({
    new: search.new === true || search.new === "true" ? true : undefined,
  }),
  loader: ({ params }) => {
    const cls = getClass(params.classId);
    if (!cls) throw notFound();
    return { cls };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cls.name}-${loaderData.cls.section} — Students — EdDesk One` },
          { name: "description", content: `Student list for ${loaderData.cls.name}-${loaderData.cls.section}. Open a profile to see everything about a student.` },
        ]
      : [{ title: "Classroom — EdDesk One" }, { name: "robots", content: "noindex" }],
  }),
  component: StudentList,
});

function StudentList() {
  const { cls } = Route.useLoaderData();
  const { new: isNew } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(Boolean(isNew));
  const [saved, setSaved] = useState<string | null>(null);
  const list = studentsInClass(cls.id).filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => { if (isNew) setShowForm(true); }, [isNew]);

  const closeForm = () => {
    setShowForm(false);
    navigate({ to: "/students/$classId", params: { classId: cls.id }, search: { new: undefined }, replace: true });
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Students", to: "/students" },
          { label: "Classrooms", to: "/students" },
          { label: `${cls.name}-${cls.section}` },
        ]}
        title={`${cls.name}-${cls.section}`}
        description={`${cls.studentCount} students · Class teacher ${cls.teacher}`}
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New admission</Button>
          </div>
        }
      />

      <div className="sticky top-14 z-30 flex items-center gap-2 border-b border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        <Button variant="outline" size="sm" className="h-10 flex-1 text-xs"><Download className="h-4 w-4" /> Export</Button>
        <Button size="sm" className="h-10 flex-1 text-xs" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New admission</Button>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 md:px-8 md:py-6">
        {showForm && (
          <form
            className="card-soft mb-4 p-4 sm:p-5 md:mb-6 md:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const name = new FormData(e.currentTarget).get("name");
              setSaved(String(name || "Student"));
              closeForm();
            }}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">New admission — {cls.name}-{cls.section}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Class teacher {cls.teacher} · {cls.room}</p>
              </div>
              <button type="button" onClick={closeForm} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="na-name">Student name</Label>
                <Input id="na-name" name="name" required placeholder="Full name" className="h-10 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-adm">Admission no.</Label>
                <Input id="na-adm" name="admissionNo" placeholder="EDK-2026-0001" className="h-10 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-dob">Date of birth</Label>
                <Input id="na-dob" name="dob" type="date" className="h-10 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-parent">Parent name</Label>
                <Input id="na-parent" name="parentName" placeholder="Parent / guardian" className="h-10 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-mobile">Parent mobile</Label>
                <Input id="na-mobile" name="parentMobile" placeholder="+91 …" className="h-10 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-roll">Roll no.</Label>
                <Input id="na-roll" name="rollNo" type="number" placeholder="Auto" className="h-10 bg-surface" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 md:mt-5">
              <Button type="submit" size="sm">Add student</Button>
              <Button type="button" size="sm" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        )}

        {saved && (
          <p className="mb-4 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-muted-foreground">
            {saved} would be admitted to {cls.name}-{cls.section} once the backend is connected.
          </p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
          <Input placeholder="Search name or admission no." value={q} onChange={(e) => setQ(e.target.value)} className="h-10 flex-1 bg-surface md:max-w-sm" />
          <Button variant="outline" size="sm" className="h-10"><Filter className="h-4 w-4" /> Filter</Button>
          <span className="ml-auto text-xs text-muted-foreground">{list.length} of {cls.studentCount}</span>
        </div>


        <div className="card-soft overflow-hidden">
          <div className="hidden md:grid grid-cols-[60px_1fr_140px_1fr_120px_80px_32px] md:items-center gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Roll</span><span>Student</span><span>Admission no.</span><span>Parent</span><span>Fees</span><span className="text-right">Att.</span><span />
          </div>
          {list.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No students found.</p>}
          {list.map(s => (
            <Link
              key={s.id}
              to="/students/$classId/$studentId"
              params={{ classId: cls.id, studentId: s.id }}
              className="group block border-b border-border/40 px-3 py-2.5 text-sm last:border-0 active:bg-muted/60 hover:bg-muted/50 sm:px-4 md:grid md:grid-cols-[60px_1fr_140px_1fr_120px_80px_32px] md:items-center md:gap-3 md:px-5 md:py-2.5"
            >
              {/* Mobile compact row */}
              <div className="flex items-center gap-3 md:hidden">
                <AvatarMono name={s.name} hue={s.avatarHue} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium leading-tight">{s.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Roll {s.rollNo} · {s.admissionNo}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/80">
                    {s.parentName} · {s.parentMobile}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{s.attendance}% att.</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>

              {/* Desktop grid cells */}
              <span className="hidden text-muted-foreground tabular-nums md:block">{s.rollNo}</span>
              <div className="hidden min-w-0 items-center gap-3 md:flex">
                <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                <span className="truncate font-medium">{s.name}</span>
              </div>
              <span className="hidden truncate md:block">{s.admissionNo}</span>
              <span className="hidden truncate md:block">{s.parentName}</span>
              <div className="hidden md:block">
                <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                  {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                </StatusPill>
              </div>
              <span className="hidden tabular-nums md:block md:text-right">{s.attendance}%</span>
              <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
