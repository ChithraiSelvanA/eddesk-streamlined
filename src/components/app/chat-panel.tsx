import { useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, Phone, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarMono } from "@/components/app/avatar-mono";
import { chats } from "@/data/mock";
import { cn } from "@/lib/utils";

type Msg = { mine: boolean; text: string; time: string };

const threadMessages: Record<string, Msg[]> = {
  ch1: [
    { mine: false, text: "Hi Rhea — could Aanya be excused early on Friday for a dental visit at 2 PM?", time: "12:04" },
    { mine: true, text: "Absolutely, we'll note it down. Please share a note with the class teacher too.", time: "12:09" },
    { mine: false, text: "Thanks so much!", time: "12:11" },
  ],
  ch2: [
    { mine: false, text: "Thanks for the update on the science project!", time: "10:20" },
    { mine: true, text: "Happy to help — Ishaan did a great job on the model.", time: "10:24" },
  ],
  ch3: [
    { mine: false, text: "Is the fee receipt available on the portal?", time: "09:02" },
    { mine: true, text: "Yes, receipt RCT-8818 is under Fees → Payment history.", time: "09:15" },
  ],
  ch4: [
    { mine: false, text: "Please share the timetable for next month.", time: "Yesterday" },
    { mine: true, text: "Sharing it as soon as the academic team publishes it.", time: "Yesterday" },
  ],
};

export function ChatPanel({ initialChatId }: { initialChatId?: string }) {
  const valid = initialChatId && chats.some((c) => c.id === initialChatId) ? initialChatId : undefined;
  const [activeId, setActiveId] = useState(valid ?? chats[0].id);
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(Boolean(valid));
  const active = chats.find((c) => c.id === activeId) ?? chats[0];
  const messages = threadMessages[active.id] ?? [];

  return (
    <>
      {/* Mobile — Messenger style */}
      <div className="md:hidden">
        {mobileOpen ? (
          <MessengerThread thread={active} messages={messages} onBack={() => setMobileOpen(false)} />
        ) : (
          <MessengerList
            activeId={activeId}
            onOpen={(id) => {
              setActiveId(id);
              setMobileOpen(true);
            }}
          />
        )}
      </div>

      {/* Desktop */}
      <div
        className={cn(
          "hidden md:block",
          fullscreen && "fixed inset-y-0 right-0 left-60 z-40 bg-background p-4"
        )}
      >
        <div
          className={cn(
            "card-soft grid grid-cols-[320px_1fr] overflow-hidden",
            fullscreen ? "h-full" : "h-[calc(100vh-15rem)] min-h-[28rem]"
          )}
        >
          <div className="overflow-y-auto border-r border-border/60">
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "w-full border-b border-border/40 px-4 py-3 text-left last:border-0 hover:bg-muted/50",
                  c.id === activeId && "bg-muted/60"
                )}
              >
                <div className="flex items-start gap-3">
                  <AvatarMono name={c.parentName} hue={c.hue} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{c.parentName}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.classInfo}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{active.parentName}</p>
                <p className="truncate text-xs text-muted-foreground">{active.classInfo}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={fullscreen ? "Exit full screen" : "View full screen"}
                onClick={() => setFullscreen((v) => !v)}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {fullscreen ? "Exit full screen" : "Full screen"}
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <Bubble key={i} mine={m.mine}>
                  {m.text}
                </Bubble>
              ))}
            </div>

            <Composer />
          </div>
        </div>
      </div>
    </>
  );
}

function Bubble({ mine, children }: { mine: boolean; children: React.ReactNode }) {
  return (
    <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          mine ? "bg-chat-mine text-chat-mine-foreground" : "bg-chat-theirs text-chat-theirs-foreground"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Composer({ rounded }: { rounded?: boolean }) {
  return (
    <div className="border-t border-border/60 p-3">
      <div
        className={cn(
          "flex items-center gap-2 border border-border bg-surface px-3 py-2",
          rounded ? "rounded-full" : "rounded-lg"
        )}
      >
        <input
          placeholder="Aa"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {rounded ? (
          <button
            aria-label="Send"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-chat-mine"
          >
            <Send className="h-4 w-4" />
          </button>
        ) : (
          <Button size="sm">Send</Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Mobile: Messenger ---------- */

function MessengerList({ activeId, onOpen }: { activeId: string; onOpen: (id: string) => void }) {
  return (
    <div className="-mx-1">
      <div className="px-1 pb-3">
        <div className="flex h-10 items-center gap-2 rounded-full bg-muted px-4 text-sm text-muted-foreground">
          Search messages
        </div>
      </div>
      <ul>
        {chats.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onOpen(c.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left active:bg-muted/60",
                c.id === activeId && "bg-muted/30"
              )}
            >
              <AvatarMono name={c.parentName} hue={c.hue} size={56} />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[15px]", c.unread > 0 ? "font-semibold" : "font-medium")}>
                  {c.parentName}
                </p>
                <p
                  className={cn(
                    "truncate text-[13px]",
                    c.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {c.lastMessage} · {c.time}
                </p>
              </div>
              {c.unread > 0 && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-chat-mine" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessengerThread({
  thread,
  messages,
  onBack,
}: {
  thread: (typeof chats)[number];
  messages: Msg[];
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-2 border-b border-border/60 px-2 py-2">
        <button
          aria-label="Back"
          onClick={onBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-chat-mine active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <AvatarMono name={thread.parentName} hue={thread.hue} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{thread.parentName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{thread.classInfo}</p>
        </div>
        <button aria-label="Call" className="grid h-9 w-9 place-items-center rounded-full text-chat-mine active:bg-muted">
          <Phone className="h-5 w-5" />
        </button>
        <button aria-label="Details" className="grid h-9 w-9 place-items-center rounded-full text-chat-mine active:bg-muted">
          <Info className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <p className="pb-2 text-center text-[11px] text-muted-foreground">Today</p>
        {messages.map((m, i) => (
          <div key={i} className={cn("flex items-end gap-2", m.mine ? "justify-end" : "justify-start")}>
            {!m.mine && <AvatarMono name={thread.parentName} hue={thread.hue} size={28} />}
            <div
              className={cn(
                "max-w-[74%] px-3.5 py-2 text-[15px] leading-snug",
                m.mine
                  ? "rounded-3xl rounded-br-md bg-chat-mine text-chat-mine-foreground"
                  : "rounded-3xl rounded-bl-md bg-chat-theirs text-chat-theirs-foreground"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="pb-[env(safe-area-inset-bottom)]">
        <Composer rounded />
      </div>
    </div>
  );
}
