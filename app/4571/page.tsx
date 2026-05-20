const rows = Array.from({ length: 18 }, (_, index) => index);
const cards = Array.from({ length: 9 }, (_, index) => index);

export default function LoadingSkeletonPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-6 text-text sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="skeleton-float rounded-lg border border-stroke bg-panel p-5 shadow-clean">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-64 max-w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {cards.slice(0, 4).map((item) => (
              <div key={item} className="skeleton-float rounded-lg border border-stroke bg-surface p-4" style={{ animationDelay: `${item * 90}ms` }}>
                <Skeleton className="h-4 w-24" delay={item * 120} />
                <Skeleton className="mt-4 h-9 w-16" delay={item * 120 + 70} />
                <Skeleton className="mt-3 h-3 w-full" delay={item * 120 + 140} />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-stroke bg-panel p-5 shadow-clean">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {cards.map((item) => (
                <div key={item} className="skeleton-float rounded-lg border border-stroke bg-surface p-4" style={{ animationDelay: `${item * 70}ms` }}>
                  <Skeleton className="h-5 w-28" delay={item * 90} />
                  <Skeleton className="mt-4 h-20 w-full" delay={item * 90 + 80} />
                  <Skeleton className="mt-4 h-3 w-4/5" delay={item * 90 + 160} />
                  <Skeleton className="mt-2 h-3 w-2/3" delay={item * 90 + 220} />
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-stroke bg-panel p-5 shadow-clean">
            <Skeleton className="h-7 w-40" />
            <div className="mt-5 space-y-4">
              {rows.slice(0, 7).map((item) => (
                <div key={item} className="skeleton-slide flex items-center gap-3" style={{ animationDelay: `${item * 85}ms` }}>
                  <Skeleton className="h-11 w-11 rounded-full" delay={item * 95} />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-4/5" delay={item * 95 + 60} />
                    <Skeleton className="mt-2 h-3 w-1/2" delay={item * 95 + 120} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-stroke bg-panel p-5 shadow-clean">
          <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-stroke">
            {rows.map((item) => (
              <div key={item} className="skeleton-slide grid gap-4 border-b border-stroke bg-surface p-4 last:border-b-0 md:grid-cols-[1.4fr_repeat(4,1fr)]" style={{ animationDelay: `${item * 38}ms` }}>
                <Skeleton className="h-4 w-full" delay={item * 45} />
                <Skeleton className="h-4 w-3/4" delay={item * 45 + 45} />
                <Skeleton className="h-4 w-2/3" delay={item * 45 + 90} />
                <Skeleton className="h-4 w-4/5" delay={item * 45 + 135} />
                <Skeleton className="h-4 w-1/2" delay={item * 45 + 180} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Skeleton({ className, delay = 0 }: { className: string; delay?: number }) {
  return <div className={`loading-skeleton rounded-md bg-panelSoft ${className}`} style={{ animationDelay: `${delay}ms` }} />;
}
