import confetti from "canvas-confetti";
import { Copy, PartyPopper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ordersAPI } from "../../api/orders";
import PageWrapper from "../../components/layout/PageWrapper";
import Button from "../../components/ui/Button";
import { useUIStore } from "../../store/uiStore";
import { getPayload } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackDeliveryDate] = useState(() =>
    formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000))
  );
  const { resetCheckoutDraft, addToast } = useUIStore();
  const orderId = searchParams.get("order");

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      colors: ["#F5C842", "#1A3A5C", "#E63946"],
    });

    resetCheckoutDraft();
  }, [resetCheckoutDraft]);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await ordersAPI.getOrder(orderId);
        if (!active) {
          return;
        }
        setOrder(getPayload(response));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const estimatedDelivery = useMemo(() => {
    if (!order) {
      return "";
    }
    return order.estimated_delivery || fallbackDeliveryDate;
  }, [fallbackDeliveryDate, order]);

  return (
    <PageWrapper className="py-16">
      <div className="mx-auto max-w-3xl">
        <div className="drac-panel p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-drac-green/40 bg-drac-green/15 text-drac-green">
            <PartyPopper className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-heading text-6xl tracking-[0.16em] text-drac-gold">
            Order Confirmed!
          </h1>
          <p className="mt-3 text-sm leading-7 text-drac-muted">
            Your order is in the nest. We&apos;ll keep things moving as payment and fulfillment progress.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-drac-muted">Loading order details...</p>
          ) : order ? (
            <div className="mt-8 rounded-3xl border border-drac-border bg-drac-surface2 p-6 text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="section-kicker">Order Number</p>
                  <p className="mt-2 font-mono text-lg text-drac-text">{order.order_number}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(order.order_number);
                    addToast("Order number copied.", "success");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              <div className="mt-6 grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-drac-muted">
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="glass-divider my-5" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">
                  Estimated Delivery
                </span>
                <span className="text-sm text-drac-gold">{estimatedDelivery}</span>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-drac-muted">
              We could not load the order details, but your payment flow returned successfully.
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {order ? (
              <Link to={`/account/orders/${order.id}`} className="btn-primary">
                View My Order
              </Link>
            ) : null}
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
