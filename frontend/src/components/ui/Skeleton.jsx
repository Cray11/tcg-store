export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton className="h-52 rounded-none rounded-t-xl" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-1" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}