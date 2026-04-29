import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import Button from "../ui/Button";

export default function CartSummary({
  itemCount,
  subtotal,
  promoCode,
  onCheckout,
}) {
  return (
    <div className="drac-panel sticky top-28 p-6">
      <p className="section-kicker">Order Summary</p>
      <div className="mt-5 space-y-3 text-sm text-drac-muted">
        <div className="flex items-center justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        {promoCode ? (
          <div className="flex items-center justify-between">
            <span>Promo Code</span>
            <span>{promoCode}</span>
          </div>
        ) : null}
      </div>

      <div className="glass-divider my-5" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">
          Total
        </span>
        <span className="text-2xl font-bold text-drac-gold">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <Button type="button" fullWidth size="lg" className="mt-6" onClick={onCheckout}>
        Proceed to Checkout
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-drac-border bg-drac-surface2 px-4 py-3 text-xs uppercase tracking-[0.16em] text-drac-muted">
        <ShieldCheck className="h-4 w-4 text-drac-green" />
        Secure Checkout Powered by Stripe
      </div>

      <Link to="/products" className="mt-4 block text-center text-xs font-semibold uppercase tracking-[0.16em] text-drac-gold">
        Continue Shopping
      </Link>
    </div>
  );
}
