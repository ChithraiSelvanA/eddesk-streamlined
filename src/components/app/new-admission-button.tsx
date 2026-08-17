import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { classes } from "@/data/mock";

export function NewAdmissionButton({
  size = "sm",
  variant = "default",
  label = "New admission",
  fab = false,
}: {
  size?: "sm" | "default";
  variant?: "default" | "outline";
  label?: string;
  fab?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const list = classes.filter(c => `${c.name} ${c.section} ${c.teacher} ${c.room}`.toLowerCase().includes(q.toLowerCase()));

  const pick = (classId: string) => {
    setOpen(false);
    setQ("");
    navigate({ to: "/students/$classId", params: { classId }, search: { new: true } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {fab ? (
          <button
            aria-label={label}
            className="fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-6px_oklch(0.2_0.02_260/0.45)] transition-transform active:scale-95 md:hidden"
            style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
          >
            <Plus className="h-6 w-6" />
          </button>
        ) : (
          <Button size={size} variant={variant}>
            <Plus className="h-4 w-4" /> {label}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a class</DialogTitle>
          <DialogDescription>Choose the classroom for the new admission — we'll take you there to add the student.</DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          placeholder="Filter classes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-9 bg-surface"
        />

        <div className="max-h-80 overflow-auto rounded-lg border border-border">
          {list.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No classes match “{q}”</p>}
          {list.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              className="flex w-full items-center gap-3 border-b border-border/40 px-4 py-2.5 text-left last:border-0 hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}–{c.section}</p>
                <p className="truncate text-xs text-muted-foreground">{c.teacher} · {c.room}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {c.studentCount}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
