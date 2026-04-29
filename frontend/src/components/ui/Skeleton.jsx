export function Skeleton({ className = "" }) {
  return (
    <div className={`skeleton-shimmer rounded-2xl ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="drac-panel overflow-hidden">
      <Skeleton className="h-72 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
