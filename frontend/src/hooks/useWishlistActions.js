import { useLocation, useNavigate } from "react-router-dom";
import { wishlistAPI } from "../api/wishlist";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { useWishlistStore } from "../store/wishlistStore";
import { getErrorMessage, getPayload } from "../utils/api";

export function useWishlistActions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addToast = useUIStore((state) => state.addToast);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const setPending = useWishlistStore((state) => state.setPending);
  const navigate = useNavigate();
  const location = useLocation();

  const requireWishlistAuth = () => {
    if (accessToken) {
      return true;
    }

    addToast("Sign in to save cards to your wishlist.", "info");
    navigate("/login", { state: { from: location } });
    return false;
  };

  const toggleWishlist = async (product) => {
    if (!requireWishlistAuth()) {
      return false;
    }

    const productId = product.id;
    const state = useWishlistStore.getState();

    if (state.pendingIds[productId]) {
      return state.isWishlisted(productId);
    }

    const alreadyWishlisted = state.isWishlisted(productId);
    setPending(productId, true);

    try {
      if (alreadyWishlisted) {
        await wishlistAPI.removeFromWishlist(productId);
        removeItem(productId);
        addToast(`${product.name} removed from wishlist.`, "success");
        return false;
      }

      const response = await wishlistAPI.addToWishlist(productId);
      addItem(getPayload(response));
      addToast(`${product.name} saved to wishlist.`, "success");
      return true;
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update wishlist."), "error");
      return alreadyWishlisted;
    } finally {
      setPending(productId, false);
    }
  };

  return {
    requireWishlistAuth,
    toggleWishlist,
  };
}
