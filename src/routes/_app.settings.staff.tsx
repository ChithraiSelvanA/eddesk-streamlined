import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teachers } from "@/data/mock";
import { Check, MailPlus, Search, Shield, Trash2, UserCog } from "lucide-react";

export const Route = createFileRoute("/_app/settings/staff")({
  head: () => ({
    meta: [
      { title: "Staff & access — EdDesk One" },
      {
        name: "description",
        content:
          "Invite staff, assign roles and control what admins, teachers and accountants can access.",
      },
      { property: "og:title", content: "Staff & access — EdDesk One" },
      {
        property: "og:description",
        content: "Invite staff, assign roles and control permissions per role.",
      },
    ],
  }),
  component: StaffAccess,
});

const ROLES = ["Administrator", "Teacher", "Accountant", "Front desk"] as const;
type Role = (typeof ROLES)[number];

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "disabled";
  hue: number;
  lastActive: string;
};

const seedStaff: Member[] = [
  { id: "u1", name: "Rhea Malhotra", email: "rhea@eddesk.one", role: "Administrator", status: "active", hue: 265, lastActive: "Just now" },
  { id: "u2", name: "Nikhil Bansal", email: "nikhil@eddesk.one", role: "Accountant", status: "active", hue: 190, lastActive: "2 hours ago" },
  { id: "u3", name: "Fatima Sheikh", email: "fatima@eddesk.one", role: "Front desk", status: "invited", hue: 340, lastActive: "Invite pending" },
  ...teachers.slice(0, 4).map((t, i) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    role: "Teacher" as Role,
    status: (i === 3 ? "disabled" : "active") as Member["status"],
    hue: t.avatarHue,
    lastActive: ["Yesterday", "3 days ago", "1 week ago", "Never"][i],
  })),
];

const PERMISSIONS = [
  { id: "students", label: "Students", desc: "View and edit student records" },
  { id: "fees", label: "Fees & payments", desc: "Record payments and issue receipts" },
  { id: "academic", label: "Academic setup", desc: "Classes, subjects and timetable" },
  { id: "communication", label: "Communication", desc: "Notices, events and parent chat" },
  { id: "reports", label: "Reports", desc: "Export school-wide reports" },
  { id: "settings", label: "Settings", desc: "School profile, billing and access" },
];

const defaultMatrix: Record<Role, string[]> = {
  Administrator: PERMISSIONS.map((p) => p.id),
  Teacher: ["students", "academic", "communication"],
  Accountant: ["students", "fees", "reports"],
  "Front desk": ["students", "communication"],
};

function statusTone(s: Member["status"]) {
  return s === "active" ? "success" : s === "invited" ? "info" : "neutral";
}

function StaffAccess() {
  const [staff, setStaff] = useState<Member[]>(seedStaff);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [matrix, setMatrix] = useState<Record<Role, string[]>>(defaultMatrix);
  const [activeRole, setActiveRole] = useState<Role>("Teacher");
  const [twoFactor, setTwoFactor] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Teacher" as Role });

  const list = useMemo(
    () =>
      staff.filter(
        (m) =>
          (roleFilter === "all" || m.role === roleFilter) &&
          `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q.toLowerCase())
      ),
    [staff, q, roleFilter]
  );

  const counts = useMemo(
    () =>
      ROLES.map((r) => ({ role: r, n: staff.filter((m) => m.role === r).length })),
    [staff]
  );

  const sendInvite = () => {
    if (!invite.name.trim() || !invite.email.trim()) {
      toast.error("Add a name and email to send the invite.");
      return;
    }
    setStaff((s) => [
      {
        id: `u${Date.now()}`,
        name: invite.name.trim(),
        email: invite.email.trim(),
        role: invite.role,
        status: "invited",
        hue: Math.floor(Math.random() * 360),
        lastActive: "Invite pending",
      },
      ...s,
    ]);
    setInvite({ name: "", email: "", role: "Teacher" });
    setInviteOpen(false);
    toast.success("Invite sent", { description: `${invite.name} will get an email to join.` });
  };

  const setRole = (id: string, role: Role) => {
    setStaff((s) => s.map((m) => (m.id === id ? { ...m, role } : m)));
    toast.success("Role updated");
  };

  const toggleStatus = (id: string) => {
    setStaff((s) =>
      s.map((m) =>
        m.id === id ? { ...m, status: m.status === "disabled" ? "active" : "disabled" } : m
      )
    );
  };

  const remove = (id: string) => {
    setStaff((s) => s.filter((m) => m.id !== id));
    toast.success("Staff member removed");
  };

  const togglePerm = (perm: string) => {
    if (activeRole === "Administrator") {
      toast.info("Administrators always have full access.");
      return;
    }
    setMatrix((m) => {
      const cur = m[activeRole];
      return {
        ...m,
        [activeRole]: cur.includes(perm) ? cur.filter((p) => p !== perm) : [...cur, perm],
      };
    });
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Staff & access" }]}
        title="Staff & access"
        description="Invite your team, assign roles and control what each role can do."
        actions={
          <div className="hidden md:flex items-center gap-2">
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <MailPlus className="h-4 w-4" /> Invite staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite a staff member</DialogTitle>
                  <DialogDescription>
                    They'll receive an email invite and can set their own password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Full name</Label>
                    <Input
                      autoFocus
                      value={invite.name}
                      onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                      placeholder="e.g. Ananya Rao"
                      className="bg-surface"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Work email</Label>
                    <Input
                      type="email"
                      value={invite.email}
                      onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                      placeholder="name@school.edu"
                      className="bg-surface"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select
                      value={invite.role}
                      onValueChange={(v) => setInvite({ ...invite, role: v as Role })}
                    >
                      <SelectTrigger className="bg-surface">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {matrix[invite.role].length} of {PERMISSIONS.length} areas accessible
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendInvite}>Send invite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Mobile sticky invite bar */}
      <div className="sticky top-14 z-20 border-b border-border bg-background px-4 py-2 sm:px-6 md:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2">
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <MailPlus className="h-4 w-4" /> Invite staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a staff member</DialogTitle>
                <DialogDescription>
                  They'll receive an email invite and can set their own password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full name</Label>
                  <Input
                    autoFocus
                    value={invite.name}
                    onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                    placeholder="e.g. Ananya Rao"
                    className="bg-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Work email</Label>
                  <Input
                    type="email"
                    value={invite.email}
                    onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    placeholder="name@school.edu"
                    className="bg-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select
                    value={invite.role}
                    onValueChange={(v) => setInvite({ ...invite, role: v as Role })}
                  >
                    <SelectTrigger className="bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {matrix[invite.role].length} of {PERMISSIONS.length} areas accessible
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvite}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-4 pb-24 sm:py-5 sm:px-6 md:px-8 md:py-6 md:pb-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {counts.map(({ role, n }) => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
              className={
                "card-soft p-3 text-left transition-shadow hover:shadow-[var(--shadow-elevated)] sm:p-4 " +
                (roleFilter === role ? "ring-1 ring-foreground/20" : "")
              }
            >
              <p className="text-xs text-muted-foreground">{role}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{n}</p>
            </button>
          ))}
        </div>

        <div className="card-soft overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search staff by name, email or role…"
                className="h-9 bg-surface pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserCog className="h-4 w-4" />
              {list.length} {list.length === 1 ? "member" : "members"}
              {roleFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setRoleFilter("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          </div>

          {list.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No staff match your search.
            </p>
          )}

          {list.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 border-b border-border/40 px-3 py-3.5 last:border-0 hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <AvatarMono name={m.name} hue={m.hue} size={38} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                </div>
              </div>

              <div className="hidden w-32 text-xs text-muted-foreground lg:block">
                {m.lastActive}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="self-start sm:self-auto">
                  <StatusPill tone={statusTone(m.status) as never}>
                    {m.status === "active" ? "Active" : m.status === "invited" ? "Invited" : "Disabled"}
                  </StatusPill>
                </div>

                <Select value={m.role} onValueChange={(v) => setRole(m.id, v as Role)}>
                  <SelectTrigger className="h-8 min-w-[7rem] flex-1 bg-surface text-xs sm:w-[150px] sm:flex-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => toggleStatus(m.id)}
                >
                  {m.status === "disabled" ? "Enable" : "Disable"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(m.id)}
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>


        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="card-soft p-4 sm:p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Role permissions</h2>
                <p className="text-xs text-muted-foreground">
                  Choose what each role can reach across the workspace.
                </p>
              </div>
              <Select value={activeRole} onValueChange={(v) => setActiveRole(v as Role)}>
                <SelectTrigger className="h-9 w-[170px] bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 divide-y divide-border/50">
              {PERMISSIONS.map((p) => {
                const on = matrix[activeRole].includes(p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <Switch
                      checked={on}
                      onCheckedChange={() => togglePerm(p.id)}
                      disabled={activeRole === "Administrator"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-soft space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Access rules</h2>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Require 2-step sign-in</p>
                <p className="text-xs text-muted-foreground">
                  Staff confirm a code on every new device.
                </p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Administrators keep full access at all times. Teachers only see the classes
              assigned to them.
            </div>
            <Button
              className="w-full"
              onClick={() =>
                toast.success("Access settings saved", {
                  description: `${staff.length} staff · ${
                    twoFactor ? "2-step sign-in on" : "2-step sign-in off"
                  }`,
                })
              }
            >
              <Check className="h-4 w-4" /> Save access settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
