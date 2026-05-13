import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-surface transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
