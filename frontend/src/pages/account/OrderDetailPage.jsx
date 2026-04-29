import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ordersAPI } from "../../api/orders";
import AccountShell from "../../components/account/AccountShell";
import OrderStatusBadge from "../../components/account/OrderStatusBadge";
import OrderTimeline from "../../components/account/OrderTimeline";
import Button from "../../components/ui/Button";
import { useUIStore } from "../../store/uiStore";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getErrorMessage, getPayload } from "../../utils/api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { addToast } = useUIStore();
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      const response = await ordersAPI.getOrder(id);
      if (active) {
        setOrder(getPayload(response));
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [id]);

  const handleCancel = async () => {
    try {
      await ordersAPI.cancelOrder(id);
      const response = await ordersAPI.getOrder(id);
      setOrder(getPayload(response));
      setMessage("Order cancelled.");
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to cancel order."));
    }
  };

  if (!order) {
    return (
      <AccountShell title="Order Detail" description="Review a specific order and its delivery state.">
        <p className="text-sm text-drac-muted">Loading order...</p>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      title="Order Detail"
      description="Inspect every line item, shipping detail, and current order progression."
    >
      <Link to="/account/orders" className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-gold">
        Back to Orders
      </Link>

      {message ? (
        <div className="rounded-2xl border border-drac-border bg-drac-surface px-4 py-3 text-sm text-drac-text">
          {message}
        </div>
      ) : null}

      <div className="drac-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-sm text-drac-text">{order.order_number}</p>
            <p className="mt-2 text-sm text-drac-muted">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {order.status === "PENDING" ? (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel Order
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <OrderTimeline status={order.status} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="drac-panel p-6">
          <p className="section-kicker">Items</p>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-drac-border bg-drac-surface2 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-drac-text">{item.product_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-drac-muted">
                      {item.product_sku} • {item.product_condition || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-drac-muted">Qty {item.quantity}</p>
                    <p className="text-sm font-semibold text-drac-gold">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="drac-panel p-6">
            <p className="section-kicker">Totals</p>
            <div className="mt-5 space-y-3 text-sm text-drac-muted">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span>{formatCurrency(order.discount_amount)}</span>
              </div>
            </div>
            <div className="glass-divider my-5" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">Total</span>
              <span className="text-2xl font-bold text-drac-gold">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="drac-panel p-6">
            <p className="section-kicker">Shipping Address</p>
            <p className="mt-4 text-sm leading-7 text-drac-muted">
              {order.shipping_full_name}
              <br />
              {order.shipping_line1}
              {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
              <br />
              {order.shipping_city}, {order.shipping_province} {order.shipping_zip}
              <br />
              {order.shipping_country}
            </p>
          </div>

          {order.tracking_number ? (
            <div className="drac-panel p-6">
              <p className="section-kicker">Tracking</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="font-mono text-sm text-drac-text">{order.tracking_number}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(order.tracking_number);
                    addToast("Tracking number copied.", "success");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AccountShell>
  );
}
