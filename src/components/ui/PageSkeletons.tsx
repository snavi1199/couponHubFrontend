/** Pulse skeleton for a coupon card */
function CardSkeleton() {
  return (
    <div className="ticket-card overflow-hidden">
      <div className="p-4 pb-3 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-line/50" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-line/60" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-line/50" />
      </div>
      <div className="px-4 pb-3 flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-line/40" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-line/30" />
      </div>
      <div className="mx-4 h-px bg-line/40" />
      <div className="px-4 py-3 flex justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-line/50" />
        <div className="h-4 w-10 animate-pulse rounded bg-line/30" />
      </div>
    </div>
  );
}

export function CouponListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Filter bar skeleton */}
      <div className="mb-6 flex gap-3">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-line/40" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-line/30" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-line/30" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-line/50" />
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-line/40" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-line/30" />
          </div>
        </div>
        <div className="h-9 w-36 animate-pulse rounded-xl bg-line/40" />
      </div>
      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ticket-card p-4 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-line/40" />
            <div className="h-7 w-12 animate-pulse rounded bg-line/50" />
          </div>
        ))}
      </div>
      {/* Panels */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="ticket-card p-5 space-y-3 min-h-48">
            <div className="h-5 w-32 animate-pulse rounded bg-line/50" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="rounded-lg border border-line/40 p-3 space-y-1.5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-line/40" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-line/30" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="ticket-card overflow-hidden">
        <div className="p-6 sm:p-8 space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-line/40" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-line/50" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-line/40" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-line/40" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-line/30" />
          </div>
        </div>
        <div className="mx-6 h-px bg-line/40" />
        <div className="p-6 sm:p-8 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-line/40" />
          <div className="h-12 w-full max-w-xs animate-pulse rounded-xl bg-line/50" />
        </div>
      </div>
    </div>
  );
}
