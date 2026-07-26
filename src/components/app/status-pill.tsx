import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const map: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[color:var(--color-success)]",
  warning: "bg-[color-mix(in_oklab,var(--color-warning)_20%,transparent)] text-[oklch(0.4_0.1_75)]",
  danger: "bg-[color-mix(in_oklab,var(--color-destructive)_15%,transparent)] text-[color:var(--color-destructive)]",
  info: "bg-[color-mix(in_oklab,var(--color-info)_15%,transparent)] text-[color:var(--color-info)]",
};

export function StatusPill({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", map[tone], className)}>
      {children}
    </span>
  );
}
