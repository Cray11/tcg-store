export default function StockIndicator({ stock, threshold = 5 }) {
  if (stock === 0) {
    return <span className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-red">Out of Stock</span>;
  }
  if (stock <= threshold) {
    return (
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
        Low Stock - {stock} left
      </span>
    );
  }
  return <span className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-green">In Stock</span>;
}
