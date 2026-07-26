import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { notices, events, chats, leaveRequests } from "@/data/mock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AvatarMono } from "@/components/app/avatar-mono";
import { StatusPill } from "@/components/app/status-pill";
import { Megaphone, Plus, Bell, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/communication")({
  head: () => ({
    meta: [
      { title: "Communication — EdDesk One" },
      { name: "description", content: "Notice board, events, parent chat, requests and notifications — everything in cards." },
      { property: "og:title", content: "Communication — EdDesk One" },
      { property: "og:description", content: "Notice board, events, parent chat, requests and notifications — everything in cards." },
    ],
  }),
  component: Communication,
});

function Communication() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Communication" }]}
        title="Communication"
        description="Notices, events, chat and requests — one clean workspace."
        actions={
          <>
            <Button variant="outline" size="sm"><Calendar className="h-4 w-4" /> New event</Button>
            <Button size="sm"><Megaphone className="h-4 w-4" /> Create notice</Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <Tabs defaultValue="notices">
          <TabsList className="bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start">
            {[["notices","Notice board"],["events","Events"],["chat","Chat"],["requests","Requests"],["notifications","Notifications"]].map(([v,l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="notices" className="mt-6">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {notices.map(n => (
                <div key={n.id} className="card-soft p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><Megaphone className="h-4 w-4 text-muted-foreground" /></div>
                    <StatusPill tone="info">{n.audience}</StatusPill>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight">{n.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{n.author}</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              ))}
              <button className="card-soft flex flex-col items-center justify-center gap-2 border-dashed p-6 text-sm text-muted-foreground hover:bg-muted/40">
                <Plus className="h-4 w-4" /> New notice
              </button>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {events.map(e => (
                <div key={e.id} className="card-soft p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-center leading-tight">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">{e.date.split(" ")[0]}</p>
                        <p className="text-lg font-semibold">{e.date.split(" ")[1]}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.time} · {e.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusPill tone="info">{e.category}</StatusPill>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="card-soft grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
              <div className="border-b md:border-b-0 md:border-r border-border/60">
                {chats.map((c, i) => (
                  <button key={c.id} className={"w-full border-b border-border/40 px-4 py-3 text-left last:border-0 hover:bg-muted/50 " + (i === 0 ? "bg-muted/60" : "")}>
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
              <div className="flex flex-col">
                <div className="border-b border-border/60 px-5 py-3">
                  <p className="text-sm font-medium">{chats[0].parentName}</p>
                  <p className="text-xs text-muted-foreground">{chats[0].classInfo}</p>
                </div>
                <div className="flex-1 space-y-3 p-5">
                  <Bubble mine={false}>Hi Rhea — could Aanya be excused early on Friday for a dental visit at 2 PM?</Bubble>
                  <Bubble mine={true}>Absolutely, we'll note it down. Please share a note with the class teacher too.</Bubble>
                  <Bubble mine={false}>Thanks so much!</Bubble>
                </div>
                <div className="border-t border-border/60 p-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                    <input placeholder="Reply…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="card-soft">
              {leaveRequests.map(l => (
                <div key={l.id} className="flex flex-wrap items-center gap-4 border-b border-border/40 px-5 py-4 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{l.studentName} · {l.className}</p>
                    <p className="text-xs text-muted-foreground">{l.reason} · {l.dates}</p>
                  </div>
                  <StatusPill tone="warning">Pending</StatusPill>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="card-soft">
              {[
                ["Fee reminder sent", "SMS delivered to 42 parents", "Today"],
                ["Attendance summary", "Emailed to Grade 5-A parents", "Yesterday"],
                ["Event RSVPs", "38 confirmed for Science Exhibition", "2 days ago"],
              ].map(([t, s, w], i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border/40 px-5 py-3 last:border-0">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-muted"><Bell className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{s}</p></div>
                  <span className="text-xs text-muted-foreground">{w}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Bubble({ mine, children }: { mine: boolean; children: React.ReactNode }) {
  return (
    <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
      <div className={"max-w-[80%] rounded-2xl px-3.5 py-2 text-sm " + (mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {children}
      </div>
    </div>
  );
}
