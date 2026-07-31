import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function RecordPaymentDialog({
  studentName,
  admissionNo,
  due,
  trigger,
}: {
  studentName: string;
  admissionNo: string;
  due: number;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(due ? String(due) : "");
  const [method, setMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (value > 500000) {
      setError("Amount looks too large — please verify.");
      return;
    }
    if (reference.length > 60 || note.length > 300) {
      setError("Reference or note is too long.");
      return;
    }
    setError(null);
    setOpen(false);
    toast.success(`₹${value.toLocaleString()} recorded for ${studentName}`, {
      description: `${method.toUpperCase()} · ${admissionNo} · receipt will be generated`,
    });
    setReference("");
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {studentName} · {admissionNo}
            {due > 0 ? ` · ₹${due.toLocaleString()} outstanding` : " · no dues pending"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rp-amount">Amount (₹)</Label>
            <Input
              id="rp-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
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

          <div className="space-y-1.5">
            <Label htmlFor="rp-ref">Reference (optional)</Label>
            <Input id="rp-ref" maxLength={60} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Txn ID / cheque no." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rp-note">Note (optional)</Label>
            <Textarea id="rp-note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Term 2 tuition instalment" className="min-h-20" />
          </div>

          {error && <p className="text-xs text-[color:var(--color-destructive)]">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
