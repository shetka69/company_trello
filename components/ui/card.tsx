import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-stroke bg-panel p-5 shadow-clean", className)}>{children}</div>;
}
