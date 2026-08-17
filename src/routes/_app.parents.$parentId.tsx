import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { getParent, students as allStudents, chats } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MobileTabNav } from "@/components/app/mobile-tab-nav";
import { Phone, Mail, MessageSquare, Wallet, ChevronRight, Users, Inbox } from "lucide-react";


export const Route = createFileRoute("/_app/parents/$parentId")({
  loader: ({ params }) => {
    const p = getParent(params.parentId);
    if (!p) throw notFound();
    return { p };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.p.name} — Parent — EdDesk One` },
          { name: "description", content: `Parent profile: children, chats, requests and payment summary for ${loaderData.p.name}.` },
        ]
      : [{ title: "Parent — EdDesk One" }, { name: "robots", content: "noindex" }],
  }),
  component: ParentProfile,
});

function ParentProfile() {
  const { p } = Route.useLoaderData();
  const children = allStudents.filter(s => p.childIds.includes(s.id));
  const parentChats = chats.filter(c => c.parentName === p.name);
  const [tab, setTab] = useState("children");

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Parents", to: "/parents" }, { label: p.name }]}
        title={p.name}
        description={`${p.occupation} · ${p.mobile}`}
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4" /> Message</Button>
            <Button size="sm"><Wallet className="h-4 w-4" /> Record payment</Button>
          </div>
        }
      />

      <div className="sticky top-14 z-30 flex items-center gap-2 border-b border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        <Button variant="outline" className="h-10 flex-1 text-xs"><MessageSquare className="h-4 w-4" /> Message</Button>
        <Button className="h-10 flex-1 text-xs"><Wallet className="h-4 w-4" /> Record payment</Button>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-4 pb-24 sm:px-6 md:px-8 md:py-6 md:pb-6">
        <div className="card-soft mb-4 flex flex-col gap-4 p-4 sm:p-6 md:mb-6 md:flex-row md:items-center md:gap-5">
          <AvatarMono name={p.name} hue={200} size={72} className="h-14 w-14 md:h-[72px] md:w-[72px]" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">{p.name}</h2>
              {p.pendingTotal > 0 ? (
                <StatusPill tone="warning">₹{p.pendingTotal.toLocaleString()} pending</StatusPill>
              ) : (
                <StatusPill tone="success">All dues cleared</StatusPill>
              )}
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-muted-foreground md:mt-3 md:flex-row md:flex-wrap md:gap-4">
              <a href={`tel:${p.mobile}`} className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {p.mobile}</a>
              <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{p.email}</span></a>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} id="parent-tabs">
          <TabsList className="hidden md:flex bg-transparent p-0 gap-1 h-auto border-b border-border rounded-none w-full justify-start overflow-x-auto flex-nowrap">
            {[["children","Children"],["chats","Chats"],["requests","Requests"],["payments","Payment summary"]].map(([v,l]) => (

              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent shrink-0 px-3 pb-2.5 pt-1 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="children" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {children.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: s.classId, studentId: s.id }}
                  className="card-soft flex items-center gap-4 p-4 hover:shadow-[var(--shadow-elevated)]"
                >
                  <AvatarMono name={s.name} hue={s.avatarHue} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.className} · Roll {s.rollNo}</p>
                  </div>
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : "warning"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="mt-6">
            <div className="card-soft">
              {(parentChats.length ? parentChats : chats.slice(0, 2)).map(c => (
                <div key={c.id} className="flex items-start gap-3 border-b border-border/40 px-5 py-3 last:border-0">
                  <AvatarMono name={c.parentName} hue={c.hue} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.parentName}</p>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="card-soft p-6 text-sm text-muted-foreground">
              No open requests. Requests raised by parents will appear here for acknowledgement.
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SmallStat label="Total billed" value={`₹${(48000).toLocaleString()}`} />
              <SmallStat label="Paid" value={`₹${(48000 - p.pendingTotal).toLocaleString()}`} />
              <SmallStat label="Pending" value={`₹${p.pendingTotal.toLocaleString()}`} tone={p.pendingTotal > 0 ? "warning" : "neutral"} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SmallStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" }) {
  return (
    <div className="card-soft p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={"mt-1 text-2xl font-semibold tabular-nums " + (tone === "warning" ? "text-[oklch(0.4_0.1_75)]" : "")}>{value}</p>
    </div>
  );
}
