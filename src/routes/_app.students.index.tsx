import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { classes, students } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight } from "lucide-react";
import { AvatarMono } from "@/components/app/avatar-mono";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/students/")({
  head: () => ({
    meta: [
      { title: "Students — EdDesk One" },
      { name: "description", content: "Browse students by classroom. Every action for a student lives inside their profile." },
      { property: "og:title", content: "Students — EdDesk One" },
      { property: "og:description", content: "Browse students by classroom. Every action for a student lives inside their profile." },
    ],
  }),
  component: StudentsIndex,
});

function StudentsIndex() {
  const [q, setQ] = useState("");
  const filtered = classes.filter(c => (c.name + " " + c.section).toLowerCase().includes(q.toLowerCase()));
  const total = students.length;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Students" }]}
        title="Students"
        description={`${total} students across ${classes.length} classrooms`}
        actions={
          <>
            <Button variant="outline" size="sm">Import CSV</Button>
            <Button size="sm"><Plus className="h-4 w-4" /> New admission</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Filter classrooms…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 max-w-xs bg-surface"
          />
          <p className="ml-auto text-xs text-muted-foreground">Tip: use header search to jump directly to a student.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => {
            const preview = students.filter(s => s.classId === c.id).slice(0, 4);
            return (
              <Link
                key={c.id}
                to="/students/$classId"
                params={{ classId: c.id }}
                className="card-soft group flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.room}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{c.name}–{c.section}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.teacher}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                    <Users className="h-3 w-3" /> {c.studentCount}
                  </div>
                </div>

                <div className="mt-5 flex -space-x-2">
                  {preview.map(s => (
                    <div key={s.id} className="ring-2 ring-[var(--color-card)] rounded-full">
                      <AvatarMono name={s.name} hue={s.avatarHue} size={28} />
                    </div>
                  ))}
                  <div className="ring-2 ring-[var(--color-card)] grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    +{c.studentCount - preview.length}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span>Open classroom</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
