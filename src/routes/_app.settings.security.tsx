import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Laptop, LogOut, Shield, Smartphone, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_app/settings/security")({
  head: () => ({
    meta: [
      { title: "Security — EdDesk One" },
      {
        name: "description",
        content: "Sign-in rules, two-step verification, active sessions and the audit log for your school workspace.",
      },
      { property: "og:title", content: "Security — EdDesk One" },
      { property: "og:description", content: "Sign-in rules, two-step verification, sessions and audit log." },
    ],
  }),
  component: Security,
});

const initialSessions = [
  { id: "s1", device: "MacBook Pro · Chrome", place: "Kochi, IN", when: "Active now", current: true, mobile: false },
  { id: "s2", device: "iPhone 15 · EdDesk app", place: "Kochi, IN", when: "2 hours ago", current: false, mobile: true },
  { id: "s3", device: "Windows PC · Edge", place: "Front desk", when: "Yesterday", current: false, mobile: false },
];

const auditLog = [
  { id: "a1", who: "Anita Menon", what: "Recorded fee payment ₹12,500 for Aarav S.", when: "Today, 6:12 PM" },
  { id: "a2", who: "You", what: "Updated staff permissions for Front desk", when: "Today, 4:40 PM" },
  { id: "a3", who: "Rahul Nair", what: "Published notice “Annual day rehearsal”", when: "Yesterday, 11:05 AM" },
  { id: "a4", who: "System", what: "Nightly backup completed", when: "Yesterday, 2:00 AM" },
];

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Security() {
  const [twoStep, setTwoStep] = useState(true);
  const [twoStepStaffOnly, setTwoStepStaffOnly] = useState(false);
  const [singleSession, setSingleSession] = useState(false);
  const [ipLock, setIpLock] = useState(false);
  const [minLength, setMinLength] = useState("8");
  const [expiry, setExpiry] = useState("90");
  const [timeout, setTimeoutMins] = useState("60");
  const [sessions, setSessions] = useState(initialSessions);
  const [saved, setSaved] = useState(true);

  const touch = () => setSaved(false);

  const revoke = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Session signed out");
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Security" }]}
        title="Security"
        description="Sign-in rules, two-step verification, sessions and audit trail."
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-4 sm:py-5 sm:px-6 md:px-8 md:py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card-soft p-4 sm:p-5">
            <div className="mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Sign-in rules</h2>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">Applies to everyone who signs in to this school.</p>
            <Separator />
            <Row title="Two-step verification" desc="Ask for a one-time code after the password.">
              <Switch checked={twoStep} onCheckedChange={(v) => { setTwoStep(v); touch(); }} />
            </Row>
            <Separator />
            <Row title="Require it only for staff with money access" desc="Accountants and administrators are always asked.">
              <Switch
                checked={twoStepStaffOnly}
                disabled={!twoStep}
                onCheckedChange={(v) => { setTwoStepStaffOnly(v); touch(); }}
              />
            </Row>
            <Separator />
            <Row title="One device at a time" desc="Signing in on a new device ends the previous session.">
              <Switch checked={singleSession} onCheckedChange={(v) => { setSingleSession(v); touch(); }} />
            </Row>
            <Separator />
            <Row title="Restrict admin sign-in to school network" desc="Blocks settings and fees access from outside the campus.">
              <Switch checked={ipLock} onCheckedChange={(v) => { setIpLock(v); touch(); }} />
            </Row>
          </section>

          <section className="card-soft p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Password policy</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Minimum length</Label>
                <Select value={minLength} onValueChange={(v) => { setMinLength(v); touch(); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["6", "8", "10", "12"].map((n) => (
                      <SelectItem key={n} value={n}>{n} characters</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Password expires after</Label>
                <Select value={expiry} onValueChange={(v) => { setExpiry(v); touch(); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Never</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Auto sign-out after idle (mins)</Label>
                <Input
                  value={timeout}
                  inputMode="numeric"
                  onChange={(e) => { setTimeoutMins(e.target.value); touch(); }}
                />
              </div>
            </div>
          </section>

          <section className="card-soft p-4 sm:p-5">
            <h2 className="mb-1 text-sm font-medium">Audit log</h2>
            <p className="mb-2 text-xs text-muted-foreground">Every money and settings change is recorded.</p>
            <div className="divide-y divide-border/70">
              {auditLog.map((a) => (
                <div key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{a.what}</p>
                    <p className="text-xs text-muted-foreground">{a.who}</p>
                  </div>
                  <span className="text-xs text-muted-foreground sm:shrink-0">{a.when}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => toast.success("Audit log exported as CSV")}>
              Export log
            </Button>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-soft p-4 sm:p-5">
            <h2 className="mb-1 text-sm font-medium">Active sessions</h2>
            <p className="mb-3 text-xs text-muted-foreground">{sessions.length} device{sessions.length === 1 ? "" : "s"} signed in.</p>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-start gap-3 rounded-md border border-border/70 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                    {s.mobile ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Laptop className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.place} · {s.when}</p>
                  </div>
                  {s.current ? (
                    <Badge variant="secondary" className="shrink-0">This device</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="shrink-0" onClick={() => revoke(s.id)}>
                      Sign out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card-soft p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-medium">Security summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Two-step</dt><dd>{twoStep ? "On" : "Off"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Min password</dt><dd>{minLength} chars</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Idle sign-out</dt><dd>{timeout || 0} mins</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Network lock</dt><dd>{ipLock ? "Campus only" : "Anywhere"}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
