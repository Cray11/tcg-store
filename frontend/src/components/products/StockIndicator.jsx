export default function StockIndicator({ stock, threshold = 5 }) {
  if (stock === 0)
    return <span className="text-xs font-semibold text-red-500">Out of Stock</span>;
  if (stock <= threshold)
    return <span className="text-xs font-semibold text-orange-500">Low Stock ({stock} left)</span>;
  return <span className="text-xs font-semibold text-green-600">In Stock</span>;
}