import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { pendingFeeStudents, recentPayments } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Receipt, Download, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/fees")({
  head: () => ({
    meta: [
      { title: "Fees — EdDesk One" },
      { name: "description", content: "See pending fees, recent payments, receipts and fee reports. Every student action opens their profile." },
      { property: "og:title", content: "Fees — EdDesk One" },
      { property: "og:description", content: "See pending fees, recent payments, receipts and fee reports." },
    ],
  }),
  component: Fees,
});

function Fees() {
  const pendingTotal = pendingFeeStudents.reduce((a, s) => a + s.feeDue, 0);
  const collectedThisMonth = recentPayments.reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Fees" }]}
        title="Fees"
        description="Track dues, record payments and generate receipts."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm"><Receipt className="h-4 w-4" /> Record payment</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6 space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat title="Collected this month" value={`₹${collectedThisMonth.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} trend="+12%" />
          <Stat title="Pending" value={`₹${pendingTotal.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} trend="-8%" tone="warn" />
          <Stat title="Students with dues" value={String(pendingFeeStudents.length)} icon={<Wallet className="h-4 w-4" />} />
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start overflow-x-auto flex-nowrap">
            {[["pending","Pending"],["payments","Payments"],["receipts","Receipts"],["reports","Reports"]].map(([v,l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent shrink-0 px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_140px_120px_100px] gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Student</span><span>Class</span><span>Amount</span><span>Status</span><span className="text-right">Action</span>
              </div>
              {pendingFeeStudents.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: s.classId, studentId: s.id }}
                  className="grid grid-cols-[1fr_1fr_140px_120px_100px] items-center gap-3 border-b border-border/40 px-5 py-3 text-sm last:border-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarMono name={s.name} hue={s.avatarHue} size={30} />
                    <div className="min-w-0"><p className="truncate font-medium">{s.name}</p><p className="truncate text-xs text-muted-foreground">{s.admissionNo}</p></div>
                  </div>
                  <span className="text-muted-foreground">{s.className}</span>
                  <span className="tabular-nums font-medium">₹{s.feeDue.toLocaleString()}</span>
                  <StatusPill tone={s.feeStatus === "overdue" ? "danger" : "warning"}>{s.feeStatus}</StatusPill>
                  <span className="text-right text-xs text-muted-foreground">Open profile →</span>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[140px_1fr_1fr_120px_140px] gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Receipt</span><span>Student</span><span>Method</span><span>Date</span><span className="text-right">Amount</span>
              </div>
              {recentPayments.map(p => (
                <div key={p.id} className="grid grid-cols-[140px_1fr_1fr_120px_140px] items-center gap-3 border-b border-border/40 px-5 py-3 text-sm last:border-0">
                  <span className="font-mono text-xs text-muted-foreground">{p.receiptNo}</span>
                  <div><p className="font-medium">{p.studentName}</p><p className="text-xs text-muted-foreground">{p.className}</p></div>
                  <span className="text-muted-foreground">{p.method}</span>
                  <span className="text-muted-foreground">{p.date}</span>
                  <span className="text-right tabular-nums font-medium">₹{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="receipts" className="mt-6">
            <div className="card-soft p-6 text-sm text-muted-foreground">
              Every recorded payment generates a receipt automatically. Search a student and open their Fees tab to download.
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Collection summary", "This term"],
                ["Class-wise dues", "Live"],
                ["Overdue students", "> 30 days"],
                ["Payment methods split", "This quarter"],
                ["Concessions & waivers", "This year"],
                ["Fee structure", "Master"],
              ].map(([t, sub], i) => (
                <div key={i} className="card-soft p-5">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><TrendingUp className="h-4 w-4 text-muted-foreground" /></div>
                  <p className="mt-3 text-sm font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ title, value, icon, trend, tone = "neutral" }: { title: string; value: string; icon: React.ReactNode; trend?: string; tone?: "neutral" | "warn" }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div>
        {trend && <span className={"text-xs font-medium " + (tone === "warn" ? "text-[oklch(0.4_0.1_75)]" : "text-[color:var(--color-success)]")}>{trend}</span>}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-foreground/70">{title}</p>
    </div>
  );
}
