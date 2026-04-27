import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import ConditionBadge from "./ConditionBadge";
import StockIndicator from "./StockIndicator";
import { cartAPI } from "../../api/cart";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useState } from "react";

const PLACEHOLDER = "https://placehold.co/300x420?text=No+Image";

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const { setCart } = useCartStore();
  const { addToast } = useUIStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setAdding(true);
    try {
      const { data } = await cartAPI.addToCart(product.id);
      setCart(data.data);
      addToast(`${product.name} added to cart!`, "success");
    } catch (err) {
      addToast(
        err.response?.data?.message ?? "Failed to add to cart.",
        "error"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="card block group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100 h-52">
        <img
          src={product.image || PLACEHOLDER}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105
            transition-transform duration-300 p-2"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {product.discount_percent && (
          <span className="absolute top-2 left-2 badge bg-accent-500 text-white">
            -{product.discount_percent}%
          </span>
        )}
        {product.is_foil && (
          <span className="absolute top-2 right-2 badge bg-yellow-400 text-yellow-900">
            ✨ Foil
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <ConditionBadge condition={product.condition} />
        </div>

        {product.set_name && (
          <p className="text-xs text-gray-500 truncate">{product.set_name}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-base font-bold text-primary-700">
              ₱{Number(product.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
            {product.compare_price && (
              <span className="text-xs text-gray-400 line-through ml-1">
                ₱{Number(product.compare_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <StockIndicator stock={product.stock} />
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`mt-1 w-full flex items-center justify-center gap-2
            text-sm font-semibold py-2 rounded-lg transition-all
            ${product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary-700 hover:bg-primary-900 text-white"}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}