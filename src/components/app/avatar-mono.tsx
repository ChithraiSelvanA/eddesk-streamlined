export function AvatarMono({ name, hue = 220, size = 36 }: { name: string; hue?: number; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = `oklch(0.92 0.04 ${hue})`;
  const fg = `oklch(0.35 0.08 ${hue})`;
  return (
    <div
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
