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
import type { Notice, EventItem } from "@/data/mock";

const audiences = ["All parents", "Grades 4–8", "Selected parents", "Staff only"];

export function CreateNoticeDialog({
  trigger,
  onCreate,
}: {
  trigger: ReactNode;
  onCreate: (n: Notice) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(audiences[0]);

  function submit() {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and a message before publishing.");
      return;
    }
    onCreate({
      id: `n-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      author: "Principal's Office",
      date: "Just now",
      audience,
    });
    toast.success("Notice published", { description: `Visible to ${audience.toLowerCase()}.` });
    setTitle(""); setBody(""); setAudience(audiences[0]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create notice</DialogTitle>
          <DialogDescription>Post an announcement to the notice board.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notice-title">Title</Label>
            <Input id="notice-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Parent-Teacher Meeting" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-body">Message</Label>
            <Textarea id="notice-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share the details parents need to know…" />
          </div>
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {audiences.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Publish notice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const categories = ["Academic", "School", "Trip", "PTM", "Sports"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function NewEventDialog({
  trigger,
  onCreate,
  event,
}: {
  trigger: ReactNode;
  onCreate: (e: EventItem) => void;
  event?: EventItem;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState(event?.location ?? "");
  const [category, setCategory] = useState(event?.category ?? categories[0]);

  function submit() {
    if (!title.trim() || !date) {
      toast.error("Add a title and a date for the event.");
      return;
    }
    const d = new Date(date + "T00:00:00");
    const label = `${months[d.getMonth()]} ${d.getDate()}`;
    const timeLabel = time
      ? new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "All day";
    onCreate({
      id: event?.id ?? `e-${Date.now()}`,
      title: title.trim(),
      date: label,
      time: timeLabel,
      location: location.trim() || "School campus",
      category,
    });
    toast.success(event ? "Event updated" : "Event added", { description: `${title.trim()} · ${label}` });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>Add it to the school calendar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annual Science Exhibition" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-time">Start time</Label>
              <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input id="event-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Main Hall" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{event ? "Save changes" : "Add event"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
