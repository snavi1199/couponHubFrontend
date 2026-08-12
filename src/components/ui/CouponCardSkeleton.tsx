export function CouponCardSkeleton() {
  return (
    <div className="ticket-card flex flex-col overflow-hidden">
      <div className="space-y-2 p-4 pb-3">
        <div className="h-3 w-20 animate-pulse rounded bg-line/50" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-line/60" />
      </div>
      <div className="flex gap-2 px-4 pb-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-line/40" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-line/40" />
      </div>
      <div className="tear-line mx-4" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-5 w-16 animate-pulse rounded bg-line/50" />
        <div className="h-4 w-8 animate-pulse rounded bg-line/40" />
      </div>
    </div>
  );
}

export function CouponGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <CouponCardSkeleton key={i} />)}
    </div>
  );
}
