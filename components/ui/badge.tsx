import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-stroke bg-panelSoft text-muted",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  red: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  blue: "border-sky-300/25 bg-sky-300/10 text-sky-100"
};

export function Badge({
  children,
  variant = "neutral",
  className
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
