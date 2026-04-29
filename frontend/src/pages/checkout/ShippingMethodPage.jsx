import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ShippingOptions from "../../components/checkout/ShippingOptions";
import CheckoutLayout from "./CheckoutLayout";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { SHIPPING_OPTIONS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ShippingMethodPage() {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const { checkoutDraft, setCheckoutDraft, addToast } = useUIStore();

  const shippingAmount = useMemo(
    () => SHIPPING_OPTIONS.find((option) => option.value === checkoutDraft.shippingMethod)?.amount ?? 99,
    [checkoutDraft.shippingMethod]
  );

  if (!checkoutDraft.addressId) {
    return (
      <CheckoutLayout
        currentStep="method"
        title="Shipping Method"
        subtitle="Select a delivery speed for your order."
      >
        <div className="drac-panel p-8 text-center">
          <p className="text-sm text-drac-muted">
            Choose a shipping address first before selecting a method.
          </p>
          <Button type="button" className="mt-5" onClick={() => navigate("/checkout/shipping")}>
            Back to Shipping
          </Button>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout
      currentStep="method"
      title="Shipping Method"
      subtitle="Choose how fast you want your order to arrive."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="drac-panel p-6">
          <ShippingOptions
            value={checkoutDraft.shippingMethod}
            onChange={(value) => setCheckoutDraft({ shippingMethod: value, orderId: "" })}
          />
          <div className="mt-6 flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/checkout/shipping")}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!checkoutDraft.addressId) {
                  addToast("Select an address first.", "warning");
                  return;
                }
                navigate("/checkout/payment");
              }}
            >
              Continue to Payment
            </Button>
          </div>
        </div>

        <div className="drac-panel h-fit p-6">
          <p className="section-kicker">Summary</p>
          <div className="mt-5 space-y-3 text-sm text-drac-muted">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{formatCurrency(cart?.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingAmount)}</span>
            </div>
            {checkoutDraft.promoCode ? (
              <div className="flex items-center justify-between">
                <span>Promo Code</span>
                <span>{checkoutDraft.promoCode}</span>
              </div>
            ) : null}
          </div>
          <div className="glass-divider my-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">Estimated Total</span>
            <span className="text-xl font-bold text-drac-gold">
              {formatCurrency(Number(cart?.subtotal ?? 0) + shippingAmount)}
            </span>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
