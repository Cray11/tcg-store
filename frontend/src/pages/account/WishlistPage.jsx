import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { wishlistAPI } from "../../api/wishlist";
import AccountShell from "../../components/account/AccountShell";
import ProductGrid from "../../components/products/ProductGrid";
import EmptyState from "../../components/ui/EmptyState";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import { useWishlistStore } from "../../store/wishlistStore";
import { getErrorMessage, getPayload } from "../../utils/api";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const hasLoaded = useWishlistStore((state) => state.hasLoaded);
  const setWishlist = useWishlistStore((state) => state.setWishlist);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoaded) {
      return undefined;
    }

    let active = true;

    async function loadWishlist() {
      try {
        const response = await wishlistAPI.getWishlist();
        if (active) {
          setError("");
          setWishlist(getPayload(response) ?? []);
        }
      } catch (wishlistError) {
        if (active) {
          setError(getErrorMessage(wishlistError, "Unable to load your wishlist."));
          setWishlist([]);
        }
      }
    }

    loadWishlist();

    return () => {
      active = false;
    };
  }, [hasLoaded, setWishlist]);

  const products = items.map((item) => item.product);

  return (
    <AccountShell
      title="Wishlist"
      description="Keep your chase cards in one place, then jump back in when you're ready to buy."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="drac-panel p-6 md:col-span-1">
          <p className="section-kicker">Saved Cards</p>
          <p className="mt-3 font-heading text-4xl tracking-[0.12em] text-drac-gold">
            {products.length}
          </p>
          <p className="mt-2 text-sm text-drac-muted">
            Hearts stay synced across the catalog and product pages.
          </p>
        </div>
        <div className="drac-panel p-6 md:col-span-2">
          <p className="section-kicker">How It Works</p>
          <p className="mt-3 text-sm leading-7 text-drac-muted">
            Tap the heart on any card to save it here. You can remove items at any time or add
            them straight to your cart from this page.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-drac-red/30 bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
          {error}
        </div>
      ) : null}

      {!hasLoaded ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length ? (
        <ProductGrid
          products={products}
          loading={false}
          emptyTitle="Your wishlist is empty"
          emptyDescription="Start exploring cards and tap the heart to save your favorites."
        />
      ) : (
        <EmptyState
          title="Your wishlist is empty"
          description="Start exploring cards and tap the heart to build your collector shortlist."
          actionLabel="Browse Cards"
          actionTo="/products"
          icon={<Heart className="h-7 w-7" />}
        />
      )}
    </AccountShell>
  );
}
