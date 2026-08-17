import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Download, Check, Users } from "lucide-react";

export const Route = createFileRoute("/_app/settings/billing")({
  head: () => ({
    meta: [
      { title: "Billing — EdDesk One" },
      {
        name: "description",
        content: "Manage your EdDesk One plan, seats, payment method and download past invoices.",
      },
      { property: "og:title", content: "Billing — EdDesk One" },
      { property: "og:description", content: "Plan, seats, payment method and invoice history." },
    ],
  }),
  component: Billing,
});

const PLANS = [
  { id: "starter", name: "Starter", price: 2999, students: "up to 300 students", features: ["Students & parents", "Fees & receipts", "Email support"] },
  { id: "growth", name: "Growth", price: 5999, students: "up to 1,200 students", features: ["Everything in Starter", "Communication & chat", "Reports & exports"] },
  { id: "campus", name: "Campus", price: 11999, students: "unlimited students", features: ["Everything in Growth", "Multi-branch", "Priority support"] },
];

const invoices = [
  { id: "INV-2026-08", date: "1 Aug 2026", amount: 5999, status: "Paid" },
  { id: "INV-2026-07", date: "1 Jul 2026", amount: 5999, status: "Paid" },
  { id: "INV-2026-06", date: "1 Jun 2026", amount: 5999, status: "Paid" },
  { id: "INV-2026-05", date: "1 May 2026", amount: 4999, status: "Paid" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Billing() {
  const [plan, setPlan] = useState("growth");
  const [autoRenew, setAutoRenew] = useState(true);
  const [gstin, setGstin] = useState("32ABCDE1234F1Z5");
  const [billingEmail, setBillingEmail] = useState("accounts@greenwood.edu.in");
  const current = PLANS.find((p) => p.id === plan)!;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Billing" }]}
        title="Billing"
        description="Your plan, seats, payment method and invoices."
        actions={
          <Button onClick={() => toast.success("Billing details saved")}>
            <Check className="mr-2 h-4 w-4" /> Save details
          </Button>
        }
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card-soft p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium">{current.name} plan</h2>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{inr(current.price)} / month · {current.students} · renews 1 Sep 2026</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Auto-renew</span>
                <Switch checked={autoRenew} onCheckedChange={(v) => { setAutoRenew(v); toast.info(v ? "Auto-renew on" : "Auto-renew off"); }} />
              </div>
            </div>
            <Separator className="my-5" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLANS.map((p) => {
                const active = p.id === plan;
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-4 ${active ? "border-foreground/40 bg-muted/50" : "border-border/70"}`}
                  >
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="mt-1 text-lg font-semibold">{inr(p.price)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground">{p.students}</p>
                    <ul className="mt-3 space-y-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={active ? "secondary" : "outline"}
                      className="mt-4 w-full"
                      disabled={active}
                      onClick={() => { setPlan(p.id); toast.success(`Switched to the ${p.name} plan`); }}
                    >
                      {active ? "Current plan" : "Switch"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card-soft p-5">
            <h2 className="mb-4 text-sm font-medium">Invoices</h2>
            <div className="divide-y divide-border/70">
              {invoices.map((i) => (
                <div key={i.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{i.id}</p>
                    <p className="text-xs text-muted-foreground">{i.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{inr(i.amount)}</span>
                    <Badge variant="secondary">{i.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`${i.id} downloaded`)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-soft p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Payment method</h2>
            </div>
            <div className="rounded-md border border-border/70 p-3">
              <p className="text-sm font-medium">HDFC •••• 4821</p>
              <p className="text-xs text-muted-foreground">Expires 09 / 28 · Primary</p>
            </div>
            <Button variant="outline" className="mt-3 w-full" onClick={() => toast.info("Card update opens a secure payment window.")}>
              Update card
            </Button>
          </section>

          <section className="card-soft p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Usage this month</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Students</dt><dd>842</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Staff seats</dt><dd>18</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">SMS sent</dt><dd>3,420</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Next invoice</dt><dd>{inr(current.price)}</dd></div>
            </dl>
          </section>

          <section className="card-soft p-5">
            <h2 className="mb-4 text-sm font-medium">Billing details</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Billing email</Label>
                <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">GSTIN</Label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
