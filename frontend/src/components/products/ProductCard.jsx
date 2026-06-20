import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cartAPI } from "../../api/cart";
import { useWishlistActions } from "../../hooks/useWishlistActions";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { getErrorMessage, getPayload } from "../../utils/api";
import { cn } from "../../utils/cn";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";
import ConditionBadge from "./ConditionBadge";
import RarityBadge from "./RarityBadge";
import { getRarityStyles } from "./rarityStyles";
import StockIndicator from "./StockIndicator";

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const { setCart } = useCartStore();
  const { addToast } = useUIStore();
  const hasWishlistLoaded = useWishlistStore((state) => state.hasLoaded);
  const isWishlisted = useWishlistStore((state) =>
    state.items.some((entry) => entry.product.id === product.id)
  );
  const wishlistPending = useWishlistStore((state) => Boolean(state.pendingIds[product.id]));
  const { toggleWishlist } = useWishlistActions();
  const rarityClass = getRarityStyles(product.rarity);
  const heartActive = hasWishlistLoaded ? isWishlisted : Boolean(product.is_in_wishlist);

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.stock === 0) {
      return;
    }

    setAdding(true);
    try {
      const response = await cartAPI.addToCart(product.id);
      setCart(getPayload(response));
      addToast(`${product.name} added to cart!`, "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Failed to add to cart."), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-drac-surface shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        rarityClass
      )}
    >
      <div className="relative">
        <Link to={`/products/${product.slug}`} className="block">
          <div className="card-holo product-flip relative overflow-hidden border-b border-drac-border bg-drac-surface2">
            <div className="product-flip-inner relative h-72">
              <div className="product-face absolute inset-0">
                <div className="flex h-full items-center justify-center p-4">
                  <img
                    src={product.image_url || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
              </div>
              <div className="product-back absolute inset-0 flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.15),transparent_35%),linear-gradient(180deg,#1e2d42_0%,#101a29_100%)] p-6 text-center">
                {product.image_back_url ? (
                  <img
                    src={product.image_back_url}
                    alt={`${product.name} back`}
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <>
                    <img
                      src="/DracNest-PNG.png"
                      alt="DracNest"
                      className="w-28 object-contain opacity-90"
                    />
                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-drac-muted">
                      Collector-grade listings
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="absolute left-3 top-3 flex gap-2">
              {product.discount_percent ? (
                <span className="badge border-drac-red/40 bg-drac-red text-white">
                  -{product.discount_percent}%
                </span>
              ) : null}
              {product.is_foil ? (
                <span className="badge border-drac-gold/40 bg-drac-gold/15 text-drac-gold">
                  Foil
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={wishlistPending}
              aria-label={heartActive ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-drac-border bg-drac-bg/60 backdrop-blur transition-colors",
                heartActive
                  ? "border-drac-red/50 text-drac-red"
                  : "text-drac-muted hover:text-drac-gold",
                wishlistPending && "cursor-wait opacity-70"
              )}
            >
              <Heart className={cn("h-4 w-4", heartActive && "fill-current")} />
            </button>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-drac-muted">
              {product.card_number || "Set card"} {product.set_name ? `• ${product.set_name}` : ""}
            </p>
            <Link to={`/products/${product.slug}`}>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-drac-text">
                {product.name}
              </h3>
            </Link>
          </div>
          <ConditionBadge condition={product.condition} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <RarityBadge rarity={product.rarity} />
          {product.language ? (
            <span className="badge bg-drac-surface2 text-drac-muted">
              {product.language}
            </span>
          ) : null}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-drac-gold">
                {formatCurrency(product.price)}
              </p>
              {product.compare_price ? (
                <p className="text-xs text-drac-muted line-through">
                  {formatCurrency(product.compare_price)}
                </p>
              ) : null}
            </div>
            <StockIndicator stock={product.stock} />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300",
              product.stock === 0
                ? "cursor-not-allowed border border-drac-border bg-drac-surface2 text-drac-muted"
                : "translate-y-0 bg-drac-gold text-drac-bg md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
