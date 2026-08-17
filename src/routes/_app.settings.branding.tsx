import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ImagePlus, Palette } from "lucide-react";

export const Route = createFileRoute("/_app/settings/branding")({
  head: () => ({
    meta: [
      { title: "Branding — EdDesk One" },
      {
        name: "description",
        content: "Set the school accent colour, logo, receipt template and footer note used across EdDesk One.",
      },
      { property: "og:title", content: "Branding — EdDesk One" },
      { property: "og:description", content: "Accent colour, logo, receipt template and printed footer note." },
    ],
  }),
  component: Branding,
});

const ACCENTS = [
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "teal", label: "Teal", hex: "#0d9488" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "slate", label: "Graphite", hex: "#334155" },
];

const initial = {
  accent: "indigo",
  shortName: "EdDesk One",
  schoolName: "Greenwood Public School",
  tagline: "Learn. Lead. Serve.",
  receiptTemplate: "compact",
  footerNote: "This is a computer generated receipt. Fees once paid are not refundable.",
  showLogoOnReceipt: true,
  showSignature: true,
  roundedCorners: true,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Branding() {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(true);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const accent = ACCENTS.find((a) => a.id === form.accent) ?? ACCENTS[0];
  const initials = form.schoolName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Branding" }]}
        title="Branding"
        description="Colours, logo and how printed receipts look."
        actions={
          <>
            <Button variant="outline" onClick={() => { setForm(initial); setSaved(true); toast.info("Branding reset"); }}>
              Reset
            </Button>
            <Button onClick={() => { setSaved(true); toast.success("Branding saved", { description: `${accent.label} accent · ${form.receiptTemplate} receipt` }); }}>
              {saved ? <Check className="mr-2 h-4 w-4" /> : null}
              {saved ? "Saved" : "Save changes"}
            </Button>
          </>
        }
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card-soft p-5">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Accent colour</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => set("accent", a.id)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    form.accent === a.id ? "border-foreground/40 bg-muted" : "border-border/70 hover:bg-muted/60"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: a.hex }} />
                  {a.label}
                  {form.accent === a.id && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </section>

          <section className="card-soft p-5">
            <h2 className="mb-4 text-sm font-medium">Logo & identity</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-lg font-semibold text-white"
                style={{ background: accent.hex }}
              >
                {initials || "S"}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.info("Logo upload will open your file picker on the live site.")}>
                  <ImagePlus className="mr-2 h-4 w-4" /> Upload logo
                </Button>
                <Button variant="ghost" onClick={() => toast.success("Logo removed")}>Remove</Button>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="School name">
                <Input value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
              </Field>
              <Field label="Short name" hint="Shown in the sidebar and on mobile.">
                <Input value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section className="card-soft p-5">
            <h2 className="mb-4 text-sm font-medium">Receipt template</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Layout">
                <Select value={form.receiptTemplate} onValueChange={(v) => set("receiptTemplate", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact (half page)</SelectItem>
                    <SelectItem value="detailed">Detailed (A4)</SelectItem>
                    <SelectItem value="thermal">Thermal print (80mm)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Corners">
                <div className="flex h-9 items-center gap-3">
                  <Switch checked={form.roundedCorners} onCheckedChange={(v) => set("roundedCorners", v)} />
                  <span className="text-sm text-muted-foreground">Rounded card style</span>
                </div>
              </Field>
            </div>
            <Separator className="my-5" />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Show logo on receipt</p>
                  <p className="text-xs text-muted-foreground">Prints at the top-left of every receipt.</p>
                </div>
                <Switch checked={form.showLogoOnReceipt} onCheckedChange={(v) => set("showLogoOnReceipt", v)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Signature line</p>
                  <p className="text-xs text-muted-foreground">Space for the accountant's signature.</p>
                </div>
                <Switch checked={form.showSignature} onCheckedChange={(v) => set("showSignature", v)} />
              </div>
            </div>
            <div className="mt-5">
              <Field label="Footer note">
                <Textarea rows={3} value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} />
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-soft p-5">
            <h2 className="mb-3 text-sm font-medium">Receipt preview</h2>
            <div className={`border border-border/70 p-4 ${form.roundedCorners ? "rounded-lg" : "rounded-none"}`}>
              <div className="flex items-center gap-3">
                {form.showLogoOnReceipt && (
                  <div className="grid h-9 w-9 place-items-center rounded-md text-xs font-semibold text-white" style={{ background: accent.hex }}>
                    {initials || "S"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{form.schoolName || "School name"}</p>
                  <p className="truncate text-xs text-muted-foreground">{form.tagline}</p>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">Receipt #2026-00184 · {form.receiptTemplate}</p>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Term 2 tuition</span><span>₹10,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bus fee</span><span>₹2,500</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium"><span>Total paid</span><span style={{ color: accent.hex }}>₹12,500</span></div>
              </div>
              {form.showSignature && (
                <div className="mt-6 text-right text-xs text-muted-foreground">
                  <div className="ml-auto mb-1 h-px w-28 bg-border" />
                  Authorised signatory
                </div>
              )}
              <p className="mt-4 text-[11px] leading-snug text-muted-foreground">{form.footerNote}</p>
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => toast.success("Sample receipt sent to printer queue")}>
              Print sample
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
