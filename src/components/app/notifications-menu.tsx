import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, MessageSquare, Banknote, CalendarDays, Inbox, Megaphone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { chats, leaveRequests, notices, events, pendingFeeStudents } from "@/data/mock";

type Item = {
  id: string;
  icon: typeof Bell;
  title: string;
  detail: string;
  time: string;
  to: string;
};

function buildItems(): Item[] {
  const items: Item[] = [];

  chats.filter(c => c.unread > 0).forEach(c => items.push({
    id: `chat-${c.id}`,
    icon: MessageSquare,
    title: `${c.parentName} sent a message`,
    detail: c.lastMessage,
    time: c.time,
    to: "/communication",
  }));

  leaveRequests.filter(l => l.status === "pending").slice(0, 2).forEach(l => items.push({
    id: `leave-${l.id}`,
    icon: Inbox,
    title: `Leave request — ${l.studentName}`,
    detail: `${l.reason} · ${l.dates}`,
    time: "today",
    to: "/communication",
  }));

  if (pendingFeeStudents.length > 0) {
    items.push({
      id: "fees",
      icon: Banknote,
      title: `${pendingFeeStudents.length} students have pending fees`,
      detail: "Review dues and send reminders",
      time: "today",
      to: "/fees",
    });
  }

  const nextEvent = events[0];
  if (nextEvent) {
    items.push({
      id: `event-${nextEvent.id}`,
      icon: CalendarDays,
      title: nextEvent.title,
      detail: `${nextEvent.date} · ${nextEvent.time} · ${nextEvent.location}`,
      time: nextEvent.date,
      to: "/communication",
    });
  }

  const notice = notices[0];
  if (notice) {
    items.push({
      id: `notice-${notice.id}`,
      icon: Megaphone,
      title: notice.title,
      detail: notice.body,
      time: notice.date,
      to: "/communication",
    });
  }

  return items;
}

export function NotificationsMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const all = useMemo(buildItems, []);
  const [readIds, setReadIds] = useState<string[]>([]);
  const unread = all.filter(i => !readIds.includes(i.id));

  const go = (item: Item) => {
    setReadIds(prev => [...prev, item.id]);
    setOpen(false);
    navigate({ to: item.to });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-destructive)] px-1 text-[10px] font-semibold leading-none text-[color:var(--color-destructive-foreground)]">
              {unread.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread.length > 0 && (
            <button
              onClick={() => setReadIds(all.map(i => i.id))}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {all.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
          )}
          {all.map(item => {
            const Icon = item.icon;
            const isRead = readIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => go(item)}
                className={`flex w-full items-start gap-3 border-b border-border/60 px-3 py-2.5 text-left last:border-0 hover:bg-accent ${isRead ? "opacity-60" : ""}`}
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    {!isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-destructive)]" />}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{item.detail}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground/80">{item.time}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => { setOpen(false); navigate({ to: "/communication", search: { tab: undefined, chat: undefined } }); }}
          >
            Open communication hub
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
