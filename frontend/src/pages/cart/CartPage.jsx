import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../api/cart";
import PageWrapper from "../../components/layout/PageWrapper";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import PromoCodeInput from "../../components/cart/PromoCodeInput";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";

export default function CartPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const { cart, setCart, subtotal } = useCartStore();
  const { addToast, checkoutDraft, setCheckoutDraft } = useUIStore();

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const response = await cartAPI.getCart();
        if (!active) {
          return;
        }
        setCart(getPayload(response));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      active = false;
    };
  }, [setCart]);

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    setUpdatingId(itemId);
    try {
      const response = await cartAPI.updateItem(itemId, quantity);
      setCart(getPayload(response));
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update quantity."), "error");
    } finally {
      setUpdatingId("");
    }
  };

  const handleRemove = async (itemId, productName) => {
    setUpdatingId(itemId);
    try {
      const response = await cartAPI.removeItem(itemId);
      setCart(getPayload(response));
      addToast(`${productName} removed from cart.`, "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to remove item."), "error");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <PageWrapper className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-drac-gold" />
      </PageWrapper>
    );
  }

  const items = cart?.items ?? [];

  if (!items.length) {
    return (
      <PageWrapper className="py-16">
        <EmptyState
          title="Your cart is empty"
          description="Your next rare pull is waiting. Add cards and sealed products to start checkout."
          actionLabel="Shop Now"
          actionTo="/products"
          icon={<ShoppingBag className="h-7 w-7" />}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <p className="section-kicker">Cart</p>
        <h1 className="mt-2 font-heading text-5xl tracking-[0.16em] text-drac-gold">
          Your Battle Stack
        </h1>
        <p className="mt-3 text-sm text-drac-muted">
          Review quantities, set your promo code, and head into checkout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updating={updatingId === item.id}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}

          <div className="drac-panel p-6">
            <p className="section-kicker">Promo Code</p>
            <h2 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-text">
              Save Your Code
            </h2>
            <div className="mt-4">
              <PromoCodeInput
                promoCode={checkoutDraft.promoCode}
                onChange={(value) => setCheckoutDraft({ promoCode: value, orderId: "" })}
                onApply={() => addToast("Promo code saved for checkout validation.", "info")}
                helperText="Promo codes are validated during order creation because the backend does not expose a cart-level apply endpoint yet."
              />
            </div>
          </div>
        </div>

        <CartSummary
          itemCount={cart.total_items}
          subtotal={subtotal}
          promoCode={checkoutDraft.promoCode}
          onCheckout={() => navigate("/checkout/shipping")}
        />
      </div>
    </PageWrapper>
  );
}
