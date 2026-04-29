import ProductCard from "./ProductCard";
import EmptyState from "../ui/EmptyState";
import { ProductCardSkeleton } from "../ui/Skeleton";

export default function ProductGrid({
  products,
  loading,
  columns = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  emptyTitle = "No cards found",
  emptyDescription = "Try a different search or adjust your filters.",
}) {
  if (loading) {
    return (
      <div className={`grid gap-4 ${columns}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`grid gap-4 ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
