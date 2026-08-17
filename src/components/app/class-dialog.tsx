import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects, teachers, type ClassRoom } from "@/data/mock";

export function ClassDialog({
  mode = "add",
  classRoom,
  onSave,
}: {
  mode?: "add" | "edit";
  classRoom?: ClassRoom;
  onSave: (c: ClassRoom) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClassRoom>(
    classRoom ?? {
      id: "",
      name: "",
      section: "A",
      teacher: teachers[0].name,
      studentCount: 0,
      subjects: subjects.filter((s) => s.category === "Core").map((s) => s.id),
      room: "",
    }
  );

  const toggleSubject = (id: string) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(id)
        ? f.subjects.filter((s) => s !== id)
        : [...f.subjects, id],
    }));

  const submit = () => {
    if (!form.name.trim() || !form.section.trim()) {
      toast.error("Add a class name and section.");
      return;
    }
    if (form.subjects.length === 0) {
      toast.error("Pick at least one subject.");
      return;
    }
    const saved: ClassRoom = {
      ...form,
      id: form.id || `c${Date.now()}`,
      name: form.name.trim(),
      section: form.section.trim().toUpperCase(),
      room: form.room.trim() || "Unassigned",
    };
    onSave(saved);
    setOpen(false);
    toast.success(mode === "add" ? "Class created" : "Class updated", {
      description: `${saved.name}–${saved.section} · ${saved.teacher} · ${saved.subjects.length} subjects`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add class
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add a class" : `Edit ${form.name}–${form.section}`}</DialogTitle>
          <DialogDescription>
            Set the classroom basics — you can assign students afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Class name</Label>
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grade 9"
                className="bg-surface"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Section</Label>
              <Input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A"
                className="bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Class teacher</Label>
              <Select value={form.teacher} onValueChange={(v) => setForm({ ...form, teacher: v })}>
                <SelectTrigger className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Room</Label>
              <Input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Room 304"
                className="bg-surface"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Subjects</Label>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s) => {
                const on = form.subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={
                      "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                      (on
                        ? "border-foreground/20 bg-foreground text-background"
                        : "border-border bg-surface text-muted-foreground hover:bg-muted")
                    }
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{mode === "add" ? "Create class" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
