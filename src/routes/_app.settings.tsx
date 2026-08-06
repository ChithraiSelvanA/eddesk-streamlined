import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Building2, CalendarClock, Users, Shield, Palette, CreditCard, ArrowRight, Bell } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — EdDesk One" },
      { name: "description", content: "School profile, academic year, staff access, branding, billing and notifications." },
      { property: "og:title", content: "Settings — EdDesk One" },
      { property: "og:description", content: "School profile, academic year, staff access, branding, billing and notifications." },
    ],
  }),
  component: Settings,
});

const items = [
  { icon: Building2, title: "School profile", desc: "Name, address, contact and logo" },
  { icon: CalendarClock, title: "Academic year", desc: "Current session, terms and holidays" },
  { icon: Users, title: "Staff & access", desc: "Admins, teachers, roles and permissions" },
  { icon: Shield, title: "Security", desc: "Sign-in, sessions and audit log" },
  { icon: Palette, title: "Branding", desc: "Colors, logo and receipt template" },
  { icon: CreditCard, title: "Billing", desc: "Plan, invoices and payment method" },
  { icon: Bell, title: "Notifications", desc: "SMS, email and app defaults" },
];

function Settings() {
  return (
    <div>
      <PageHeader crumbs={[{ label: "Settings" }]} title="Settings" description="Configure your school and workspace." />
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <button key={title} className="card-soft group flex items-start gap-3 p-5 text-left hover:shadow-[var(--shadow-elevated)]">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
