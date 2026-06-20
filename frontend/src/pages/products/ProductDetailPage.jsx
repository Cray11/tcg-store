import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { cartAPI } from "../../api/cart";
import { productsAPI } from "../../api/products";
import PageWrapper from "../../components/layout/PageWrapper";
import ConditionBadge from "../../components/products/ConditionBadge";
import ProductCard from "../../components/products/ProductCard";
import RarityBadge from "../../components/products/RarityBadge";
import StockIndicator from "../../components/products/StockIndicator";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useWishlistActions } from "../../hooks/useWishlistActions";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { getErrorMessage, getPayload } from "../../utils/api";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";

const CONDITION_GUIDE = [
  { code: "NM", label: "Near Mint" },
  { code: "LP", label: "Lightly Played" },
  { code: "MP", label: "Moderately Played" },
  { code: "HP", label: "Heavily Played" },
  { code: "DMG", label: "Damaged" },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showBack, setShowBack] = useState(false);
  const [showConditionGuide, setShowConditionGuide] = useState(false);
  const { setCart } = useCartStore();
  const { addToast } = useUIStore();
  const hasWishlistLoaded = useWishlistStore((state) => state.hasLoaded);
  const isWishlisted = useWishlistStore((state) =>
    product ? state.items.some((entry) => entry.product.id === product.id) : false
  );
  const { toggleWishlist } = useWishlistActions();

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      try {
        const response = await productsAPI.getProduct(slug);
        const currentProduct = getPayload(response);
        const productGame = currentProduct?.game ?? currentProduct?.category?.game;
        if (!active) {
          return;
        }

        if (productGame && productGame !== "POKEMON") {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        setProduct(currentProduct);
        setQuantity(1);

        if (currentProduct?.set_name) {
          const relatedResponse = await productsAPI.getProducts({
            set_name: currentProduct.set_name,
            page_size: 8,
            game: "POKEMON",
          });
          if (!active) {
            return;
          }
          setRelatedProducts(
            (getPayload(relatedResponse) ?? []).filter((item) => item.id !== currentProduct.id)
          );
        } else {
          setRelatedProducts([]);
        }
      } catch {
        if (!active) {
          return;
        }
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  const stockLabel = useMemo(() => {
    if (!product) {
      return "";
    }
    if (product.stock === 0) {
      return "Out of Stock";
    }
    if (product.is_low_stock) {
      return `Low Stock - ${product.stock} left`;
    }
    return "In Stock";
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) {
      return;
    }

    setAdding(true);
    try {
      const response = await cartAPI.addToCart(product.id, quantity);
      setCart(getPayload(response));
      addToast("Added to cart!", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Failed to add item."), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) {
      return;
    }

    setWishlisting(true);
    try {
      await toggleWishlist(product);
    } finally {
      setWishlisting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-drac-gold" />
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="drac-panel p-12 text-center">
          <h1 className="font-heading text-4xl tracking-[0.16em] text-drac-gold">
            Product Not Found
          </h1>
          <p className="mt-3 text-sm text-drac-muted">
            This card may have left the nest.
          </p>
          <Link to="/products" className="btn-primary mt-6">
            Back to Products
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const currentImage = showBack && product.image_back_url
    ? product.image_back_url
    : product.image_url || PLACEHOLDER_IMAGE;
  const heartActive = hasWishlistLoaded ? isWishlisted : Boolean(product.is_in_wishlist);

  return (
    <PageWrapper>
      <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-drac-muted hover:text-drac-gold">
        <ChevronLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className="drac-panel overflow-hidden p-6">
          <div className="relative rounded-[28px] bg-white p-4">
            <img
              src={currentImage}
              alt={product.name}
              className="mx-auto h-full max-h-[680px] w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
              onError={(event) => {
                event.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
            {product.image_back_url ? (
              <button
                type="button"
                onClick={() => setShowBack((current) => !current)}
                className="absolute right-4 top-4 rounded-full border border-drac-border bg-drac-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-drac-text"
              >
                {showBack ? "Front View" : "Back View"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-drac-muted">
              {product.set_name || "Pokemon Trading Card Game"}
              {product.card_number ? ` - ${product.card_number}` : ""}
            </p>
            <h1 className="mt-3 font-heading text-6xl leading-none tracking-[0.12em] text-drac-gold">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RarityBadge rarity={product.rarity} />
              <ConditionBadge condition={product.condition} />
              {product.language ? (
                <span className="badge bg-drac-surface2 text-drac-text">{product.language}</span>
              ) : null}
              {product.is_foil ? (
                <span className="badge border-drac-gold/40 bg-drac-gold/15 text-drac-gold">
                  Foil
                </span>
              ) : null}
              {product.is_first_edition ? (
                <span className="badge border-sky-400/40 bg-sky-400/15 text-sky-200">
                  1st Edition
                </span>
              ) : null}
            </div>
          </div>

          <div className="drac-panel p-6">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-4xl font-bold text-drac-gold">
                {formatCurrency(product.price)}
              </p>
              {product.compare_price ? (
                <p className="text-xl text-drac-muted line-through">
                  {formatCurrency(product.compare_price)}
                </p>
              ) : null}
              {product.discount_percent ? (
                <span className="badge border-drac-red/40 bg-drac-red text-white">
                  {product.discount_percent}% off
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <StockIndicator stock={product.stock} threshold={product.low_stock_threshold} />
              <span className="text-sm text-drac-muted">{stockLabel}</span>
            </div>
          </div>

          <div className="drac-panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-full border border-drac-border bg-drac-surface2">
                <button
                  type="button"
                  className="px-4 py-3 text-drac-text"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  className="px-4 py-3 text-drac-text"
                  onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                type="button"
                onClick={handleAddToCart}
                loading={adding}
                disabled={product.stock === 0}
                className="sm:flex-1"
              >
                <ShoppingCart className="h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleWishlistToggle}
                loading={wishlisting}
                className={heartActive ? "border-drac-red/50 text-drac-red hover:bg-drac-red/10" : ""}
              >
                <Heart className={`h-4 w-4 ${heartActive ? "fill-current" : ""}`} />
                {heartActive ? "Saved to Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>

          <div className="glass-divider" />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Set Name", product.set_name || "N/A"],
              ["Set Code", product.set_code || "N/A"],
              ["Card Number", product.card_number || "N/A"],
              ["Language", product.language || "N/A"],
              ["Condition", product.condition],
              ["Rarity", product.rarity?.replaceAll("_", " ") || "N/A"],
              ["Foil", product.is_foil ? "Yes" : "No"],
              ["1st Edition", product.is_first_edition ? "Yes" : "No"],
              ["Product Type", product.product_type],
            ].map(([label, value]) => (
              <div key={label} className="drac-panel p-4">
                <p className="section-kicker">{label}</p>
                <p className="mt-2 text-sm font-semibold text-drac-text">{value}</p>
              </div>
            ))}
          </div>

          {product.description ? (
            <div className="drac-panel p-6">
              <p className="section-kicker">Description</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-drac-muted">
                {product.description}
              </p>
            </div>
          ) : null}

          <div className="drac-panel p-6">
            <button
              type="button"
              onClick={() => setShowConditionGuide((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="section-kicker">Condition Guide</p>
                <p className="mt-2 text-sm text-drac-muted">
                  Understand our NM, LP, MP, HP, and DMG grading.
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-drac-muted transition-transform ${showConditionGuide ? "rotate-180" : ""}`} />
            </button>
            {showConditionGuide ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {CONDITION_GUIDE.map((item) => (
                  <div key={item.code} className="rounded-2xl border border-drac-border bg-drac-surface2 p-4">
                    <p className="text-sm font-semibold text-drac-text">
                      {item.code} - {item.label}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-drac-muted">
                      Collector-standard condition reference for listings and checkout confidence.
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Related</p>
            <h2 className="mt-2 font-heading text-4xl tracking-[0.16em] text-drac-text">
              From The Same Set
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full border border-drac-border bg-drac-surface p-3 text-drac-muted">
              <ChevronLeft className="h-4 w-4" />
            </span>
            <span className="rounded-full border border-drac-border bg-drac-surface p-3 text-drac-muted">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {relatedProducts.length ? (
            <div className="grid min-w-[960px] grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related cards yet"
              description="We couldn't find more listings from this set right now."
            />
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
