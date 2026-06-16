export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted/60" />
        <div className="h-8 w-64 rounded bg-muted" />
      </div>

      {/* Grid Content Skeletons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border dark:border-white/10 dark:bg-[#161616] p-6 space-y-3">
            <div className="h-4 w-1/3 rounded bg-muted/60" />
            <div className="h-6 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Big Card Skeleton */}
      <div className="h-64 rounded-xl border dark:border-white/10 dark:bg-[#161616]" />
    </div>
  );
}
