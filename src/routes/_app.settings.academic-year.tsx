import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { holidays as seedHolidays } from "@/data/mock";
import { CalendarClock, Check, Plus, Trash2, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_app/settings/academic-year")({
  head: () => ({
    meta: [
      { title: "Academic year — EdDesk One" },
      {
        name: "description",
        content:
          "Set the active session, term dates, working days and holiday calendar for your school.",
      },
      { property: "og:title", content: "Academic year — EdDesk One" },
      {
        property: "og:description",
        content: "Active session, term dates, working days and the holiday calendar.",
      },
    ],
  }),
  component: AcademicYear;
});

function AcademicYear() {
  return null;
}
