import confetti from "canvas-confetti";
import { AlertTriangle, Copy, PartyPopper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cartAPI } from "../../api/cart";
import { ordersAPI } from "../../api/orders";
import PageWrapper from "../../components/layout/PageWrapper";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getPayload } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const CONFIRMED_STATUSES = new Set(["PROCESSING", "SHIPPED", "DELIVERED"]);

function getStatusPresentation(order) {
  if (!order) {
    return {
      title: "Checkout Update",
      description: "We could not verify the latest order state yet.",
      accentClass: "text-drac-gold",
      icon: PartyPopper,
      iconClass: "border-drac-green/40 bg-drac-green/15 text-drac-green",
    };
  }

  if (CONFIRMED_STATUSES.has(order.status)) {
    return {
      title: "Order Confirmed!",
      description: "Your order is in the nest. We'll keep things moving as payment and fulfillment progress.",
      accentClass: "text-drac-gold",
      icon: PartyPopper,
      iconClass: "border-drac-green/40 bg-drac-green/15 text-drac-green",
    };
  }

  if (order.status === "PENDING") {
    return {
      title: "Payment Processing",
      description: "We received your order, but payment is still being confirmed. If you just paid, check your order again in a moment.",
      accentClass: "text-amber-300",
      icon: AlertTriangle,
      iconClass: "border-amber-300/40 bg-amber-300/10 text-amber-300",
    };
  }

  return {
    title: "Order Update",
    description: `This order is currently marked as ${order.status.toLowerCase()}.`,
    accentClass: "text-drac-text",
    icon: AlertTriangle,
    iconClass: "border-drac-border bg-drac-surface text-drac-text",
  };
}

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackDeliveryDate] = useState(() =>
    formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000))
  );
  const { resetCheckoutDraft, addToast } = useUIStore();
  const { setCart } = useCartStore();
  const orderId = searchParams.get("order");

  useEffect(() => {
    resetCheckoutDraft();
  }, [resetCheckoutDraft]);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const [orderResponse, cartResponse] = await Promise.allSettled([
          orderId ? ordersAPI.getOrder(orderId) : Promise.resolve(null),
          cartAPI.getCart(),
        ]);

        if (!active) {
          return;
        }

        if (orderResponse.status === "fulfilled" && orderResponse.value) {
          setOrder(getPayload(orderResponse.value));
        } else {
          setOrder(null);
        }

        if (cartResponse.status === "fulfilled") {
          setCart(getPayload(cartResponse.value));
        }
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
  }, [orderId, setCart]);

  useEffect(() => {
    if (!order || !CONFIRMED_STATUSES.has(order.status)) {
      return;
    }

    confetti({
      particleCount: 120,
      spread: 80,
      colors: ["#F5C842", "#1A3A5C", "#E63946"],
    });
  }, [order]);

  const estimatedDelivery = useMemo(() => {
    if (!order) {
      return "";
    }
    return order.estimated_delivery || fallbackDeliveryDate;
  }, [fallbackDeliveryDate, order]);
  const paymentSummary = order?.payment_summary;

  const presentation = getStatusPresentation(order);
  const StatusIcon = presentation.icon;

  return (
    <PageWrapper className="py-16">
      <div className="mx-auto max-w-3xl">
        <div className="drac-panel p-10 text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${presentation.iconClass}`}>
            <StatusIcon className="h-10 w-10" />
          </div>
          <h1 className={`mt-6 font-heading text-6xl tracking-[0.16em] ${presentation.accentClass}`}>
            {presentation.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-drac-muted">
            {presentation.description}
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

              {paymentSummary ? (
                <>
                  <div className="glass-divider my-5" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="section-kicker">Payment Method</p>
                      <p className="mt-2 text-sm text-drac-text">{paymentSummary.provider_label}</p>
                    </div>
                    <div>
                      <p className="section-kicker">Payment Status</p>
                      <p className="mt-2 text-sm text-drac-text">{paymentSummary.status}</p>
                    </div>
                    <div>
                      <p className="section-kicker">Receipt Email</p>
                      <p className="mt-2 break-all text-sm text-drac-text">{paymentSummary.receipt_email}</p>
                    </div>
                    <div>
                      <p className="section-kicker">Reference</p>
                      <p className="mt-2 break-all font-mono text-xs text-drac-text">{paymentSummary.reference}</p>
                    </div>
                  </div>
                </>
              ) : null}

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
