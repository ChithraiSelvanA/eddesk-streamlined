import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Upload, Check } from "lucide-react";

export const Route = createFileRoute("/_app/settings/school-profile")({
  head: () => ({
    meta: [
      { title: "School profile — EdDesk One" },
      {
        name: "description",
        content:
          "Edit your school's name, contact details, address, board affiliation and logo in EdDesk One.",
      },
      { property: "og:title", content: "School profile — EdDesk One" },
      {
        property: "og:description",
        content:
          "Edit your school's name, contact details, address, board affiliation and logo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchoolProfile,
});

const initial = {
  name: "Ridgeview Academy",
  shortName: "RVA",
  code: "EDK-RVA-01",
  board: "cbse",
  email: "office@ridgeview.edu",
  phone: "+91 98450 11223",
  website: "https://ridgeview.edu",
  address1: "12 Ridgeview Road",
  address2: "Off Palm Grove Avenue",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  principal: "Dr. Neha Rajan",
  established: "1998",
  about:
    "Ridgeview Academy is a co-educational day school serving Grades 1 to 10 with a focus on inquiry-led learning.",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SchoolProfile() {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(true);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const save = () => {
    setSaved(true);
    toast.success("School profile saved", {
      description: "Changes apply to receipts, reports and parent messages.",
    });
  };

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "School profile" }]}
        title="School profile"
        description="These details appear on receipts, report cards and parent communication."
      />

      <div className="mx-auto max-w-[1400px] px-3 py-3 pb-28 sm:px-4 sm:py-4 sm:pb-24 md:px-6 md:py-5 md:pb-8 lg:px-8 lg:py-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3 sm:space-y-4">
            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">Identity</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">
                How the school is named across the workspace.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="School name">
                  <Input value={form.name} onChange={(e) => set("name")(e.target.value)} />
                </Field>
                <Field label="Short name" hint="Used in receipts and SMS.">
                  <Input value={form.shortName} onChange={(e) => set("shortName")(e.target.value)} />
                </Field>
                <Field label="School code">
                  <Input value={form.code} onChange={(e) => set("code")(e.target.value)} />
                </Field>
                <Field label="Board / affiliation">
                  <Select value={form.board} onValueChange={set("board")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cbse">CBSE</SelectItem>
                      <SelectItem value="icse">ICSE</SelectItem>
                      <SelectItem value="ib">IB</SelectItem>
                      <SelectItem value="state">State board</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Principal">
                  <Input value={form.principal} onChange={(e) => set("principal")(e.target.value)} />
                </Field>
                <Field label="Established">
                  <Input value={form.established} onChange={(e) => set("established")(e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">Contact</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">
                Where parents reach the front office.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Office email">
                  <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Website">
                    <Input value={form.website} onChange={(e) => set("website")(e.target.value)} />
                  </Field>
                </div>
              </div>
            </section>

            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">Address</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">Printed on official documents.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="sm:col-span-2">
                  <Field label="Address line 1">
                    <Input value={form.address1} onChange={(e) => set("address1")(e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address line 2">
                    <Input value={form.address2} onChange={(e) => set("address2")(e.target.value)} />
                  </Field>
                </div>
                <Field label="City">
                  <Input value={form.city} onChange={(e) => set("city")(e.target.value)} />
                </Field>
                <Field label="State">
                  <Input value={form.state} onChange={(e) => set("state")(e.target.value)} />
                </Field>
                <Field label="PIN code">
                  <Input value={form.pincode} onChange={(e) => set("pincode")(e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">About</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">
                A short description used on the parent portal.
              </p>
              <Textarea
                rows={4}
                value={form.about}
                onChange={(e) => set("about")(e.target.value)}
              />
            </section>
          </div>

          <aside className="space-y-3 sm:space-y-4">
            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">Logo</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">PNG or SVG, at least 256×256.</p>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-base font-semibold text-primary sm:h-16 sm:w-16">
                  {initials}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => toast.info("Logo upload is not connected yet.")}
                >
                  <Upload className="h-4 w-4" /> Upload
                </Button>
              </div>
            </section>

            <section className="card-soft p-3 sm:p-4 md:p-5">
              <h2 className="text-sm font-medium">Preview</h2>
              <p className="mb-3 text-xs text-muted-foreground sm:mb-4">Receipt header</p>
              <div className="rounded-md border border-border/70 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{form.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {form.city}, {form.state} {form.pincode}
                    </p>
                  </div>
                </div>
                <Separator className="my-3" />
                <p className="text-[11px] text-muted-foreground">
                  {form.phone} · {form.email}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Code {form.code} · {form.board.toUpperCase()}
                </p>
              </div>
            </section>
          </aside>
        </div>

        <div className="fixed md:sticky bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.08)] backdrop-blur md:bottom-0 md:mt-5 md:rounded-lg md:border md:pb-3 md:shadow-sm md:backdrop-blur-none">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setForm(initial); setSaved(true); }}
            >
              Reset
            </Button>
            <Button
              className="flex-1"
              onClick={save}
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
