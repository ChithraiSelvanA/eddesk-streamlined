import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { getClass, studentsInClass } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/students/$classId/")({
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
  const [q, setQ] = useState("");
  const list = studentsInClass(cls.id).filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()));

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
            <Button size="sm"><Plus className="h-4 w-4" /> New admission</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-6">
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
