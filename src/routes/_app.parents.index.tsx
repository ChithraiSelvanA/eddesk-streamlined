import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import {
  parents,
  students,
  parentGroupDefs,
  childrenOf,
  normalizeMobile,
  getParent,
  CURRENT_YEAR,
} from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/status-pill";
import { Search, ArrowRight, Users, Wallet, MessageSquare, Bus, CalendarPlus, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/parents/")({
  head: () => ({
    meta: [
      { title: "Find a parent — EdDesk One" },
      { name: "description", content: "Search a parent by mobile, parent name, student name or admission number, or start from a smart group like pending dues." },
      { property: "og:title", content: "Find a parent — EdDesk One" },
      { property: "og:description", content: "Search a parent by mobile, parent name, student name or admission number, or start from a smart group." },
    ],
  }),
  component: ParentsIndex,
});

const groupIcons: Record<string, typeof Users> = {
  "pending-dues": Wallet,
  "unread-chats": MessageSquare,
  "multiple-children": Users,
  "bus-children": Bus,
  "new-parents": CalendarPlus,
};

type Mode = "mobile" | "parent-name" | "student-name" | "admission";

const modeOptions: { value: Mode; label: string; placeholder: string; hint: string }[] = [
  { value: "mobile", label: "Parent mobile number", placeholder: "e.g. 9800012345", hint: "Exact match — opens the parent profile directly." },
  { value: "parent-name", label: "Parent name", placeholder: "e.g. Aanya Sharma", hint: "Shows every parent with a matching name." },
  { value: "student-name", label: "Student name", placeholder: "e.g. Vihaan Patel", hint: "Shows matching students — opens their parent profile." },
  { value: "admission", label: "Student admission number", placeholder: "e.g. EDK-2025-1004", hint: "Exact match — opens the parent profile directly." },
];

function ParentsIndex() {
  const [mode, setMode] = useState<Mode>("mobile");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const active = modeOptions.find(m => m.value === mode)!;
  const query = q.trim().toLowerCase();

  const parentMatches = useMemo(() => {
    if (mode !== "parent-name" || !query) return [];
    return parents.filter(p => p.name.toLowerCase().includes(query)).slice(0, 12);
  }, [mode, query]);

  const studentMatches = useMemo(() => {
    if (mode !== "student-name" || !query) return [];
    return students.filter(s => s.name.toLowerCase().includes(query)).slice(0, 12);
  }, [mode, query]);

  const exactParent = useMemo(() => {
    if (mode === "mobile") {
      const digits = normalizeMobile(q);
      if (digits.length < 4) return null;
      return parents.find(p => normalizeMobile(p.mobile) === digits || normalizeMobile(p.mobile).endsWith(digits) && digits.length >= 10) ?? null;
    }
    if (mode === "admission" && query) {
      const s = students.find(st => st.admissionNo.toLowerCase() === query);
      return s ? getParent(s.parentId) ?? null : null;
    }
    return null;
  }, [mode, q, query]);

  const openParent = (parentId: string) => navigate({ to: "/parents/$parentId", params: { parentId } });

  const showEmpty =
    !!query &&
    ((mode === "mobile" && !exactParent) ||
      (mode === "admission" && !exactParent) ||
      (mode === "parent-name" && parentMatches.length === 0) ||
      (mode === "student-name" && studentMatches.length === 0));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Parents" }]}
        title="Find a parent"
        description={`${parents.length} parents linked to ${students.length} student accounts. Search directly, or start from a smart group.`}
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {/* Normal search */}
        <section className="card-soft p-6">
          <h2 className="text-sm font-medium">Normal search</h2>
          <p className="mt-1 text-xs text-muted-foreground">{active.hint}</p>

          <form
            className="mt-4 flex max-w-2xl items-stretch overflow-hidden rounded-lg border border-border bg-surface focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
            onSubmit={(e) => {
              e.preventDefault();
              if (exactParent) openParent(exactParent.id);
              else if (mode === "parent-name" && parentMatches.length === 1) openParent(parentMatches[0].id);
              else if (mode === "student-name" && studentMatches.length === 1) openParent(studentMatches[0].parentId);
            }}
          >
            <select
              value={mode}
              onChange={(e) => { setMode(e.target.value as Mode); setQ(""); }}
              aria-label="Search by"
              className="h-11 shrink-0 border-r border-border bg-muted/60 px-3 text-sm text-foreground outline-none"
            >
              {modeOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder={active.placeholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-11 rounded-none border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
          </form>

          {query && (
            <div className="mt-4 max-w-2xl overflow-hidden rounded-lg border border-border">
              {showEmpty && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No {active.label.toLowerCase()} matches “{q}”</p>
              )}

              {exactParent && (
                <Link
                  to="/parents/$parentId"
                  params={{ parentId: exactParent.id }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
                >
                  <AvatarMono name={exactParent.name} hue={200} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{exactParent.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Exact match · press Enter to open profile</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}

              {parentMatches.length > 0 && (
                <>
                  <p className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                    {parentMatches.length} parent{parentMatches.length > 1 ? "s" : ""} — open a profile
                  </p>
                  {parentMatches.map(p => {
                    const kids = childrenOf(p);
                    return (
                      <Link
                        key={p.id}
                        to="/parents/$parentId"
                        params={{ parentId: p.id }}
                        className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/50"
                      >
                        <AvatarMono name={p.name} hue={200} size={32} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.mobile} · {kids.map(k => `${k.name} (${k.className})`).join(", ") || "No students linked"}
                          </p>
                        </div>
                        {p.pendingTotal > 0 && <StatusPill tone="warning">₹{p.pendingTotal.toLocaleString()} due</StatusPill>}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </>
              )}

              {studentMatches.length > 0 && (
                <>
                  <p className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                    {studentMatches.length} student{studentMatches.length > 1 ? "s" : ""} — opens the parent profile
                  </p>
                  {studentMatches.map(s => (
                    <Link
                      key={s.id}
                      to="/parents/$parentId"
                      params={{ parentId: s.parentId }}
                      className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/50"
                    >
                      <AvatarMono name={s.name} hue={s.avatarHue} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.className} · {s.admissionNo} · Parent: {s.parentName}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </section>

        {/* Advanced search — smart groups */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">Advanced search</h2>
              <p className="mt-1 text-xs text-muted-foreground">A quick review of parent smart groups. Open one to see the full list.</p>
            </div>
            <span className="text-xs text-muted-foreground">Academic year {CURRENT_YEAR}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parentGroupDefs.map(g => {
              const list = parents.filter(g.match);
              const Icon = groupIcons[g.id] ?? Users;
              const preview = list.slice(0, 4);
              return (
                <Link
                  key={g.id}
                  to="/parents/list"
                  search={{ group: g.id }}
                  className="card-soft group flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground/70">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight">{list.length}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-medium">{g.label}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.hint}</p>
                  <div className="mt-4 flex -space-x-2">
                    {preview.map(p => (
                      <div key={p.id} className="rounded-full ring-2 ring-[var(--color-card)]">
                        <AvatarMono name={p.name} hue={200} size={24} />
                      </div>
                    ))}
                    {list.length > preview.length && (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-[var(--color-card)]">
                        +{list.length - preview.length}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    View parents
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
