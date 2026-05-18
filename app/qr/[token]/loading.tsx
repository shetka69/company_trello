import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Skeleton className="h-5 w-28" />
        <section className="overflow-hidden rounded-lg border border-stroke bg-panel">
          <div className="border-b border-stroke bg-panelSoft p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-8 w-64 max-w-full" />
            <Skeleton className="mt-2 h-4 w-44" />
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
            <Skeleton className="mx-auto aspect-[360/392] w-full max-w-[280px]" />
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-md bg-panel px-3 py-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-4 w-36" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
