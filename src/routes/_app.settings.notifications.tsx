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
import { Bell, Check, Mail, MessageSquare, Smartphone, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_app/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — EdDesk One" },
      {
        name: "description",
        content: "Choose which alerts parents and staff receive over SMS, email and the app, and set quiet hours.",
      },
      { property: "og:title", content: "Notifications — EdDesk One" },
      { property: "og:description", content: "SMS, email and in-app alert defaults with quiet hours." },
    ],
  }),
  component: Notifications,
});

type Channels = { sms: boolean; email: boolean; app: boolean };

const initialEvents: { id: string; title: string; desc: string; channels: Channels }[] = [
  { id: "fee-due", title: "Fee due reminder", desc: "Sent 3 days before the due date.", channels: { sms: true, email: true, app: true } },
  { id: "fee-paid", title: "Payment receipt", desc: "Sent as soon as a payment is recorded.", channels: { sms: true, email: true, app: true } },
  { id: "absent", title: "Absence alert", desc: "Sent to parents when a student is marked absent.", channels: { sms: true, email: false, app: true } },
  { id: "notice", title: "New notice published", desc: "Circulars and school announcements.", channels: { sms: false, email: true, app: true } },
  { id: "exam", title: "Exam & result updates", desc: "Timetables, hall tickets and result day.", channels: { sms: false, email: true, app: true } },
  { id: "chat", title: "New parent message", desc: "Alerts staff about unread parent chats.", channels: { sms: false, email: false, app: true } },
];

function Notifications() {
  const [events, setEvents] = useState(initialEvents);
  const [senderId, setSenderId] = useState("GRNWDS");
  const [replyTo, setReplyTo] = useState("office@greenwood.edu.in");
  const [quietHours, setQuietHours] = useState(true);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:30");
  const [language, setLanguage] = useState("en");
  const [digest, setDigest] = useState("daily");
  const [signature, setSignature] = useState("— Greenwood Public School, Office");
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, ch: keyof Channels) => {
    setEvents((list) => list.map((e) => (e.id === id ? { ...e, channels: { ...e.channels, [ch]: !e.channels[ch] } } : e)));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Notification settings saved", { description: `${smsCount} alerts go out over SMS` });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setEvents(initialEvents);
    setSenderId("GRNWDS");
    setReplyTo("office@greenwood.edu.in");
    setQuietHours(true);
    setQuietFrom("20:00");
    setQuietTo("07:30");
    setLanguage("en");
    setDigest("daily");
    setSignature("— Greenwood Public School, Office");
    setSaved(false);
    toast.info("Notification settings reset");
  };

  const smsCount = events.filter((e) => e.channels.sms).length;

  return (
    <div className="pb-28 sm:pb-0">
      <PageHeader
        crumbs={[{ label: "Settings", to: "/settings" }, { label: "Notifications" }]}
        title="Notifications"
        description="Decide what parents and staff hear about, and how."
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-3 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card-soft p-3 sm:p-4 md:p-5">
            <div className="mb-1 flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Alerts</h2>
            </div>
            <p className="mb-3 text-xs text-muted-foreground sm:mb-4">Turn each channel on or off per alert.</p>

            <div className="hidden grid-cols-[1fr_repeat(3,4.5rem)] items-center gap-2 border-b border-border/70 pb-2 text-xs text-muted-foreground sm:grid">
              <span>Alert</span>
              <span className="text-center">SMS</span>
              <span className="text-center">Email</span>
              <span className="text-center">App</span>
            </div>

            <div className="divide-y divide-border/70">
              {events.map((e) => (
                <div key={e.id} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[1fr_repeat(3,4.5rem)] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                  {(["sms", "email", "app"] as const).map((ch) => (
                    <div key={ch} className="flex items-center justify-between gap-2 sm:justify-center">
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {ch === "sms" ? "SMS" : ch === "email" ? "Email" : "App"}
                      </span>
                      <Switch checked={e.channels[ch]} onCheckedChange={() => toggle(e.id, ch)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="card-soft p-3 sm:p-4 md:p-5">
            <h2 className="mb-3 text-sm font-medium sm:mb-4">Delivery</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">SMS sender ID</Label>
                <Input value={senderId} onChange={(e) => { setSenderId(e.target.value); setSaved(false); }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email reply-to</Label>
                <Input value={replyTo} onChange={(e) => { setReplyTo(e.target.value); setSaved(false); }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Message language</Label>
                <Select value={language} onValueChange={(v) => { setLanguage(v); setSaved(false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Staff digest</Label>
                <Select value={digest} onValueChange={(v) => { setDigest(v); setSaved(false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="daily">Daily at 8:00 AM</SelectItem>
                    <SelectItem value="weekly">Weekly on Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator className="my-4 md:my-5" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Quiet hours</p>
                <p className="text-xs text-muted-foreground">Hold non-urgent messages until morning.</p>
              </div>
              <Switch checked={quietHours} onCheckedChange={(v) => { setQuietHours(v); setSaved(false); }} />
            </div>
            {quietHours && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:max-w-sm sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">From</Label>
                  <Input type="time" value={quietFrom} onChange={(e) => { setQuietFrom(e.target.value); setSaved(false); }} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Until</Label>
                  <Input type="time" value={quietTo} onChange={(e) => { setQuietTo(e.target.value); setSaved(false); }} />
                </div>
              </div>
            )}
            <div className="mt-4 space-y-1.5 sm:mt-5">
              <Label className="text-xs font-medium text-muted-foreground">Message signature</Label>
              <Textarea rows={2} value={signature} onChange={(e) => { setSignature(e.target.value); setSaved(false); }} />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-soft p-3 sm:p-4 md:p-5">
            <h2 className="mb-3 text-sm font-medium">Preview</h2>
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">SMS · {senderId || "SENDER"}</p>
              <p className="mt-2 text-sm leading-snug">
                Dear parent, Term 2 fees of ₹12,500 for Aarav S. are due on 20 Aug 2026. Pay online from the parent app.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{signature}</p>
            </div>
          </section>

          <section className="card-soft p-3 sm:p-4 md:p-5">
            <h2 className="mb-3 text-sm font-medium">Channel summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> SMS</span>
                <span>{smsCount} alerts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Email</span>
                <span>{events.filter((e) => e.channels.email).length} alerts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Smartphone className="h-4 w-4" /> App push</span>
                <span>{events.filter((e) => e.channels.app).length} alerts</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quiet hours</span>
                <span>{quietHours ? `${quietFrom} – ${quietTo}` : "Off"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/95 p-3 backdrop-blur sm:static sm:mt-6 sm:border-t-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-[1400px] gap-3 sm:justify-end sm:px-6 md:px-8">
          <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button className="flex-1 sm:flex-initial" disabled={saved} onClick={handleSave}>
            {saved ? <Check className="mr-2 h-4 w-4" /> : null}
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
