import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { pendingFeeStudents, recentPayments, students } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MobileTabNav } from "@/components/app/mobile-tab-nav";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Receipt, Download, Wallet, TrendingUp, Banknote, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/fees")({
  head: () => ({
    meta: [
      { title: "Fees — EdDesk One" },
      { name: "description", content: "See pending fees, recent payments, receipts and fee reports. Every student action opens their profile." },
      { property: "og:title", content: "Fees — EdDesk One" },
      { property: "og:description", content: "See pending fees, recent payments, receipts and fee reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fees,
});

type PendingStudent = (typeof pendingFeeStudents)[number];
type Payment = (typeof recentPayments)[number];

function escapeCsv(value: string | number) {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, """)}"`;
  return str;
}

function exportTab(tab: string, pending: PendingStudent[], payments: Payment[]) {
  let csv = "";
  let filename = "";
  if (tab === "pending") {
    csv = [
      "Student,Admission No,Class,Amount,Status",
      ...pending.map((s) =>
        [s.name, s.admissionNo, s.className, s.feeDue, s.feeStatus].map(escapeCsv).join(",")
      ),
    ].join("\n");
    filename = "pending-fees.csv";
  } else if (tab === "payments" || tab === "receipts") {
    csv = [
      "Receipt,Student,Class,Method,Date,Amount",
      ...payments.map((p) =>
        [p.receiptNo, p.studentName, p.className, p.method, p.date, p.amount].map(escapeCsv).join(",")
      ),
    ].join("\n");
    filename = tab === "payments" ? "payments.csv" : "receipts.csv";
  } else {
    csv = [
      "Report,Period",
      ["Collection summary", "This term"],
      ["Class-wise dues", "Live"],
      ["Overdue students", "> 30 days"],
      ["Payment methods split", "This quarter"],
      ["Concessions & waivers", "This year"],
      ["Fee structure", "Master"],
    ].map((r) => r.map(escapeCsv).join(",")).join("\n");
    filename = "fee-reports.csv";
  }
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Export started", { description: filename });
}

function ExportButton({
  tab,
  pending,
  payments,
  className,
}: {
  tab: string;
  pending: PendingStudent[];
  payments: Payment[];
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => exportTab(tab, pending, payments)}
    >
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}

function RecordPaymentButton({
  pendingStudents,
  onRecord,
  className,
}: {
  pendingStudents: PendingStudent[];
  onRecord: (record: { student: PendingStudent; amount: number; method: string; note: string }) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => pendingStudents.find((s) => s.id === studentId) || pendingStudents[0],
    [pendingStudents, studentId]
  );

  const reset = () => {
    setAmount("");
    setMethod("upi");
    setNote("");
    setError(null);
  };

  const submit = () => {
    if (!selected) {
      setError("No student with pending fees.");
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (value > selected.feeDue) {
      setError("Amount is more than the pending due.");
      return;
    }
    onRecord({ student: selected, amount: value, method, note });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className={className}>
          <Receipt className="h-4 w-4" /> Record payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Record a new fee payment and generate a receipt automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select
              value={selected ? selected.id : ""}
              onValueChange={(v) => setStudentId(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {pendingStudents.length === 0 && (
                  <SelectItem value="none" disabled>No pending students</SelectItem>
                )}
                {pendingStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.className} · ₹{s.feeDue.toLocaleString()} due
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rp-amount">Amount (₹)</Label>
              <Input
                id="rp-amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder={selected ? String(selected.feeDue) : "0"}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="netbanking">Net banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rp-note">Note (optional)</Label>
            <Textarea
              id="rp-note"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Term 2 tuition instalment"
              className="min-h-20"
            />
          </div>

          {error && <p className="text-xs text-[color:var(--color-destructive)]">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!selected}>Save payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Fees() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState<PendingStudent[]>(() => [...pendingFeeStudents]);
  const [payments, setPayments] = useState<Payment[]>(() => [...recentPayments]);

  const pendingTotal = pending.reduce((a, s) => a + s.feeDue, 0);
  const collectedThisMonth = payments.reduce((a, p) => a + p.amount, 0);

  const handleRecord = (record: { student: PendingStudent; amount: number; method: string; note: string }) => {
    const { student, amount, method, note } = record;
    const remaining = student.feeDue - amount;
    setPending((prev) =>
      remaining <= 0
        ? prev.filter((s) => s.id !== student.id)
        : prev.map((s) =>
            s.id === student.id
              ? { ...s, feeDue: remaining, feeStatus: remaining > 0 ? ("due" as const) : ("paid" as const) }
              : s
          )
    );
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNo: `RCP-${10000 + payments.length + 1}`,
      studentName: student.name,
      className: student.className,
      method,
      amount,
      date: new Date().toLocaleDateString("en-GB"),
    };
    setPayments((prev) => [newPayment, ...prev]);
    toast.success(`₹${amount.toLocaleString()} recorded`, {
      description: `${student.name} · ${method.toUpperCase()} · receipt ${newPayment.receiptNo}`,
    });
  };

  const tabs = [
    { value: "pending", label: "Pending", icon: <Wallet className="h-[18px] w-[18px]" /> },
    { value: "payments", label: "Payments", icon: <Banknote className="h-[18px] w-[18px]" /> },
    { value: "receipts", label: "Receipts", icon: <Receipt className="h-[18px] w-[18px]" /> },
    { value: "reports", label: "Reports", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Fees" }]}
        title="Fees"
        description="Track dues, record payments and generate receipts."
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <ExportButton tab={tab} pending={pending} payments={payments} />
            <RecordPaymentButton pendingStudents={pending} onRecord={handleRecord} />
          </div>
        }
      />

      <div className="sticky top-14 z-30 flex items-center gap-2 border-b border-border bg-background/95 p-2 backdrop-blur md:hidden">
        <ExportButton tab={tab} pending={pending} payments={payments} className="flex-1" />
        <RecordPaymentButton pendingStudents={pending} onRecord={handleRecord} className="flex-1" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6 space-y-6 md:pb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat title="Collected this month" value={`₹${collectedThisMonth.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} trend="+12%" />
          <Stat title="Pending" value={`₹${pendingTotal.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} trend="-8%" tone="warn" />
          <Stat title="Students with dues" value={String(pending.length)} icon={<Wallet className="h-4 w-4" />} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="hidden md:flex bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start overflow-x-auto flex-nowrap">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}
                className="rounded-none border-b-2 border-transparent bg-transparent shrink-0 px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="mt-4 md:mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_140px_120px_100px] gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Student</span><span>Class</span><span>Amount</span><span>Status</span><span className="text-right">Action</span>
              </div>
              {pending.map(s => (
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
              {pending.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No pending fees. Great job!
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4 md:mt-6">
            <div className="card-soft overflow-hidden">
              <div className="grid grid-cols-[140px_1fr_1fr_120px_140px] gap-3 border-b border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Receipt</span><span>Student</span><span>Method</span><span>Date</span><span className="text-right">Amount</span>
              </div>
              {payments.map(p => (
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

          <TabsContent value="receipts" className="mt-4 md:mt-6">
            <div className="card-soft p-6 text-sm text-muted-foreground">
              Every recorded payment generates a receipt automatically. Search a student and open their Fees tab to download.
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-4 md:mt-6">
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

      <MobileTabNav items={tabs} value={tab} onChange={setTab} />
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
