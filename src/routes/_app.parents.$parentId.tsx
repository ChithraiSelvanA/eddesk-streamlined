import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { getParent, students as allStudents, chats, normalizeMobile } from "@/data/mock";
import { AvatarMono } from "@/components/app/avatar-mono";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/status-pill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MobileTabNav } from "@/components/app/mobile-tab-nav";
import { Phone, Mail, MessageSquare, Wallet, ChevronRight, Users, Inbox, MessageCircle } from "lucide-react";


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
  const payFor = children.find(c => (c.feeDue ?? 0) > 0) ?? children[0];
  const chatId = parentChats[0]?.id;
  const waNumber = normalizeMobile(p.mobile).replace(/^0+/, "");
  const waHref = `https://wa.me/${waNumber.length > 10 ? waNumber : `91${waNumber}`}`;
  const feesSearch = { tab: "pending", pay: payFor?.id };
  const commSearch = {
    tab: "chat",
    chat: chatId,
    parent: p.name,
    parentInfo: children.length
      ? `Parent of ${children.map(c => c.name.split(" ")[0]).join(", ")}`
      : p.occupation,
  };
  const openWhatsApp = () => window.open(waHref, "_blank", "noopener,noreferrer");

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Parents", to: "/parents" }, { label: p.name }]}
        title={p.name}
        description={`${p.occupation} · ${p.mobile}`}
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${normalizeMobile(p.mobile)}`}><Phone className="h-4 w-4" /> Call</a>
            </Button>
            <Button variant="outline" size="sm" onClick={openWhatsApp}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/communication" search={commSearch}><MessageSquare className="h-4 w-4" /> Message</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/fees" search={feesSearch}><Wallet className="h-4 w-4" /> Record payment</Link>
            </Button>
          </div>
        }
      />

      <div className="sticky top-14 z-30 border-b border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 flex-1 text-xs" asChild>
            <a href={`tel:${normalizeMobile(p.mobile)}`}><Phone className="h-4 w-4" /> Call</a>
          </Button>
          <Button variant="outline" className="h-10 flex-1 text-xs" onClick={openWhatsApp}>
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button variant="outline" className="h-10 flex-1 text-xs" asChild>
            <Link to="/communication" search={commSearch}><MessageSquare className="h-4 w-4" /> Message</Link>
          </Button>
          <Button className="h-10 flex-1 text-xs" asChild>
            <Link to="/fees" search={feesSearch}><Wallet className="h-4 w-4" /> Record payment</Link>
          </Button>
        </div>
      </div>



      <div className="mx-auto max-w-[1400px] px-3 py-4 pb-24 sm:px-6 md:px-8 md:py-6 md:pb-6">
        <div className="card-soft mb-4 flex flex-col gap-4 p-4 sm:p-6 md:mb-6 md:flex-row md:items-center md:gap-5">
          <div className="md:hidden"><AvatarMono name={p.name} hue={200} size={56} /></div>
          <div className="hidden md:block"><AvatarMono name={p.name} hue={200} size={72} /></div>

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

          <TabsContent value="children" className="mt-4 md:mt-6">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {children.map(s => (
                <Link
                  key={s.id}
                  to="/students/$classId/$studentId"
                  params={{ classId: s.classId, studentId: s.id }}
                  className="card-soft flex items-center gap-3 p-3.5 hover:shadow-[var(--shadow-elevated)] sm:gap-4 sm:p-4"
                >
                  <AvatarMono name={s.name} hue={s.avatarHue} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.className} · Roll {s.rollNo}</p>
                  </div>
                  <StatusPill tone={s.feeStatus === "paid" ? "success" : "warning"}>
                    {s.feeStatus === "paid" ? "Paid" : `₹${s.feeDue.toLocaleString()}`}
                  </StatusPill>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                </Link>
              ))}
              {children.length === 0 && (
                <p className="card-soft p-5 text-sm text-muted-foreground">No students linked to this parent.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="mt-4 md:mt-6">
            <div className="card-soft">
              {(parentChats.length ? parentChats : chats.slice(0, 2)).map(c => (
                <div key={c.id} className="flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0 md:px-5">
                  <AvatarMono name={c.parentName} hue={c.hue} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{c.parentName}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4 md:mt-6">
            <div className="card-soft p-4 text-sm text-muted-foreground sm:p-6">
              No open requests. Requests raised by parents will appear here for acknowledgement.
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4 md:mt-6">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <SmallStat label="Total billed" value={`₹${(48000).toLocaleString()}`} />
              <SmallStat label="Paid" value={`₹${(48000 - p.pendingTotal).toLocaleString()}`} />
              <SmallStat label="Pending" value={`₹${p.pendingTotal.toLocaleString()}`} tone={p.pendingTotal > 0 ? "warning" : "neutral"} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileTabNav
        value={tab}
        onChange={setTab}
        scrollTargetId="parent-tabs"
        items={[
          { value: "children", label: "Children", icon: <Users className="h-[18px] w-[18px]" /> },
          { value: "chats", label: "Chats", icon: <MessageSquare className="h-[18px] w-[18px]" /> },
          { value: "requests", label: "Requests", icon: <Inbox className="h-[18px] w-[18px]" /> },
          { value: "payments", label: "Fees", icon: <Wallet className="h-[18px] w-[18px]" /> },
        ]}
      />
    </div>
  );
}


function SmallStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" }) {
  return (
    <div className="card-soft p-3.5 sm:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={"mt-1 text-lg font-semibold tabular-nums sm:text-2xl " + (tone === "warning" ? "text-[oklch(0.4_0.1_75)]" : "")}>{value}</p>

    </div>
  );
}
