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
    navigate({ to: "/students/$classId", params: { classId: cls.id }, search: {}, replace: true });
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
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New admission</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-6">
        {showForm && (
          <form
            className="card-soft mb-6 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const name = new FormData(e.currentTarget).get("name");
              setSaved(String(name || "Student"));
              closeForm();
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-medium">New admission — {cls.name}-{cls.section}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Class teacher {cls.teacher} · {cls.room}</p>
              </div>
              <button type="button" onClick={closeForm} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="na-name">Student name</Label>
                <Input id="na-name" name="name" required placeholder="Full name" className="h-9 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-adm">Admission no.</Label>
                <Input id="na-adm" name="admissionNo" placeholder="EDK-2026-0001" className="h-9 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-dob">Date of birth</Label>
                <Input id="na-dob" name="dob" type="date" className="h-9 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-parent">Parent name</Label>
                <Input id="na-parent" name="parentName" placeholder="Parent / guardian" className="h-9 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-mobile">Parent mobile</Label>
                <Input id="na-mobile" name="parentMobile" placeholder="+91 …" className="h-9 bg-surface" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="na-roll">Roll no.</Label>
                <Input id="na-roll" name="rollNo" type="number" placeholder="Auto" className="h-9 bg-surface" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input placeholder="Search name or admission no." value={q} onChange={(e) => setQ(e.target.value)} className="h-9 max-w-sm bg-surface" />
          <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filter</Button>
          <span className="ml-auto text-xs text-muted-foreground">{list.length} of {cls.studentCount}</span>
        </div>


        <div className="card-soft overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_140px_1fr_120px_80px_32px] items-center gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Roll</span><span>Student</span><span>Admission no.</span><span>Parent</span><span>Fees</span><span className="text-right">Att.</span><span />
          </div>
          {list.map(s => (
            <Link
              key={s.id}
              to="/students/$classId/$studentId"
              params={{ classId: cls.id, studentId: s.id }}
              className="grid grid-cols-[60px_1fr_140px_1fr_120px_80px_32px] items-center gap-3 border-b border-border/40 px-5 py-2.5 text-sm last:border-0 hover:bg-muted/50"
            >
              <span className="text-muted-foreground tabular-nums">{s.rollNo}</span>
              <div className="flex min-w-0 items-center gap-3">
                <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                <span className="truncate font-medium">{s.name}</span>
              </div>
              <span className="truncate text-muted-foreground">{s.admissionNo}</span>
              <div className="min-w-0">
                <p className="truncate">{s.parentName}</p>
                <p className="truncate text-xs text-muted-foreground">{s.parentMobile}</p>
              </div>
              <StatusPill tone={s.feeStatus === "paid" ? "success" : s.feeStatus === "due" ? "warning" : "danger"}>
                {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
              </StatusPill>
              <span className="text-right tabular-nums">{s.attendance}%</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
