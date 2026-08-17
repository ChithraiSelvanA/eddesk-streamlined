import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { holidays as seedHolidays } from "@/data/mock";
import { Check, Plus, Trash2, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_app/settings/academic-year")({
  head: () => ({
    meta: [
      { title: "Academic year — EdDesk One" },
      {
        name: "description",
        content:
          "Set the active session, term dates, working days and holiday calendar for your school.",
      },
      { property: "og:title", content: "Academic year — EdDesk One" },
      {
        property: "og:description",
        content: "Active session, term dates, working days and the holiday calendar.",
      },
    ],
  }),
  component: AcademicYear,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const initialSession = {
  label: "2026 – 2027",
  start: "2026-06-01",
  end: "2027-04-15",
  resultDay: "2027-04-20",
  attendanceMin: "75",
  terms: [
    { id: "t1", name: "Term 1", start: "2026-06-01", end: "2026-09-30" },
    { id: "t2", name: "Term 2", start: "2026-10-10", end: "2027-01-15" },
    { id: "t3", name: "Term 3", start: "2027-01-20", end: "2027-04-15" },
  ],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AcademicYear() {
  const [session, setSession] = useState(initialSession);
  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [lockPastTerms, setLockPastTerms] = useState(true);
  const [autoPromote, setAutoPromote] = useState(false);
  const [holidays, setHolidays] = useState(
    seedHolidays.map((h) => ({ ...h }))
  );
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", type: "Festival" });
  const [saved, setSaved] = useState(true);

  const touch = () => setSaved(false);

  const setTerm = (id: string, key: "name" | "start" | "end", value: string) => {
    setSession((s) => ({
      ...s,
      terms: s.terms.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
    }));
    touch();
  };

  const addTerm = () => {
    setSession((s) => ({
      ...s,
      terms: [
        ...s.terms,
        { id: `t${Date.now()}`, name: `Term ${s.terms.length + 1}`, start: "", end: "" },
      ],
    }));
    touch();
  };

  const removeTerm = (id: string) => {
    setSession((s) => ({ ...s, terms: s.terms.filter((t) => t.id !== id) }));
    touch();
  };

  const toggleDay = (d: string) => {
    setWorkingDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
    touch();
  };

  const addHoliday = () => {
    if (!newHoliday.name.trim() || !newHoliday.date.trim()) {
      toast.error("Add a holiday name and date.");
      return;
    }
    setHolidays((h) => [
      ...h,
      { id: `h${Date.now()}`, name: newHoliday.name.trim(), date: newHoliday.date.trim(), type: newHoliday.type },
    ]);
    setNewHoliday({ name: "", date: "", type: "Festival" });
    touch();
    toast.success("Holiday added to the calendar");
  };

  const save = () => {
    setSaved(true);
    toast.success("Academic year saved", {
      description: `${session.label} · ${session.terms.length} terms · ${holidays.length} holidays`,
    });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Academic year" }]}
        title="Academic year"
        description="Session dates, terms, working days and the holiday calendar."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setSession(initialSession);
                setHolidays(seedHolidays.map((h) => ({ ...h })));
                setWorkingDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
                setSaved(true);
              }}
            >
              Reset
            </Button>
            <Button onClick={save} disabled={saved}>
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:py-5 sm:px-6 md:px-8 md:py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <section className="card-soft p-4 sm:p-5">
              <h2 className="text-sm font-medium">Active session</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Drives fee cycles, attendance and report cards.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Session label">
                  <Input
                    value={session.label}
                    onChange={(e) => { setSession((s) => ({ ...s, label: e.target.value })); touch(); }}
                  />
                </Field>
                <Field label="Minimum attendance %">
                  <Input
                    value={session.attendanceMin}
                    onChange={(e) => { setSession((s) => ({ ...s, attendanceMin: e.target.value })); touch(); }}
                  />
                </Field>
                <Field label="Session starts">
                  <Input
                    type="date"
                    value={session.start}
                    onChange={(e) => { setSession((s) => ({ ...s, start: e.target.value })); touch(); }}
                  />
                </Field>
                <Field label="Session ends">
                  <Input
                    type="date"
                    value={session.end}
                    onChange={(e) => { setSession((s) => ({ ...s, end: e.target.value })); touch(); }}
                  />
                </Field>
                <Field label="Result day">
                  <Input
                    type="date"
                    value={session.resultDay}
                    onChange={(e) => { setSession((s) => ({ ...s, resultDay: e.target.value })); touch(); }}
                  />
                </Field>
              </div>
            </section>

            <section className="card-soft p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium">Terms</h2>
                  <p className="text-xs text-muted-foreground">
                    Exam and reporting periods inside this session.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addTerm}>
                  <Plus className="h-4 w-4" /> Add term
                </Button>
              </div>

              <div className="space-y-3">
                {session.terms.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-3 rounded-md border border-border/70 p-3 sm:flex-row sm:items-end"
                  >
                    <div className="sm:w-40">
                      <Field label="Name">
                        <Input value={t.name} onChange={(e) => setTerm(t.id, "name", e.target.value)} />
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field label="Starts">
                        <Input type="date" value={t.start} onChange={(e) => setTerm(t.id, "start", e.target.value)} />
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field label="Ends">
                        <Input type="date" value={t.end} onChange={(e) => setTerm(t.id, "end", e.target.value)} />
                      </Field>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="self-end text-muted-foreground hover:text-destructive"
                      onClick={() => removeTerm(t.id)}
                      aria-label={`Remove ${t.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {session.terms.length === 0 && (
                  <p className="rounded-md border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                    No terms yet — add the first one.
                  </p>
                )}
              </div>
            </section>

            <section className="card-soft p-4 sm:p-5">
              <h2 className="text-sm font-medium">Holiday calendar</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Excluded from attendance and timetable generation.
              </p>

              <ul className="divide-y divide-border/70">
                {holidays.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 py-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.date} · {h.type}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => { setHolidays((cur) => cur.filter((x) => x.id !== h.id)); touch(); }}
                      aria-label={`Remove ${h.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Field label="Holiday name">
                    <Input
                      placeholder="Diwali"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday((n) => ({ ...n, name: e.target.value }))}
                    />
                  </Field>
                </div>
                <div className="sm:w-36">
                  <Field label="Date">
                    <Input
                      placeholder="Nov 8"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday((n) => ({ ...n, date: e.target.value }))}
                    />
                  </Field>
                </div>
                <div className="sm:w-40">
                  <Field label="Type">
                    <Select
                      value={newHoliday.type}
                      onValueChange={(v) => setNewHoliday((n) => ({ ...n, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="Festival">Festival</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Vacation">Vacation</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button onClick={addHoliday}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="card-soft p-4 sm:p-5">
              <h2 className="text-sm font-medium">Working days</h2>
              <p className="mb-4 text-xs text-muted-foreground">Used for attendance registers.</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => {
                  const on = workingDays.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={
                        "rounded-md border px-2.5 py-1.5 text-xs transition-colors " +
                        (on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 text-muted-foreground hover:bg-muted")
                      }
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {workingDays.length} working days per week
              </p>
            </section>

            <section className="card-soft p-4 sm:p-5">
              <h2 className="text-sm font-medium">Rules</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">Lock past terms</p>
                    <p className="text-xs text-muted-foreground">
                      Prevent edits to marks after a term ends.
                    </p>
                  </div>
                  <Switch
                    checked={lockPastTerms}
                    onCheckedChange={(v) => { setLockPastTerms(v); touch(); }}
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">Auto-promote students</p>
                    <p className="text-xs text-muted-foreground">
                      Move classes forward when the session closes.
                    </p>
                  </div>
                  <Switch
                    checked={autoPromote}
                    onCheckedChange={(v) => { setAutoPromote(v); touch(); }}
                  />
                </div>
              </div>
            </section>

            <section className="card-soft p-4 sm:p-5">
              <h2 className="text-sm font-medium">Summary</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Session</dt>
                  <dd className="font-medium">{session.label}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Terms</dt>
                  <dd className="font-medium">{session.terms.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Holidays</dt>
                  <dd className="font-medium">{holidays.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Min attendance</dt>
                  <dd className="font-medium">{session.attendanceMin}%</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
