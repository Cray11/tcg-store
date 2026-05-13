import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountShell from "../../components/account/AccountShell";
import OrderStatusBadge from "../../components/account/OrderStatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { ordersAPI } from "../../api/orders";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getErrorMessage, getPayload } from "../../utils/api";

const TABS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      const response = await ordersAPI.getOrders();
      if (active) {
        setOrders(getPayload(response) ?? []);
        setLoading(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = useMemo(
    () => activeTab === "ALL" ? orders : orders.filter((order) => order.status === activeTab),
    [activeTab, orders]
  );

  const reloadOrders = async () => {
    const response = await ordersAPI.getOrders();
    setOrders(getPayload(response) ?? []);
  };

  const handleCancel = async (id) => {
    try {
      await ordersAPI.cancelOrder(id);
      await reloadOrders();
      setMessage("Order cancelled.");
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to cancel order."));
    }
  };

  return (
    <AccountShell
      title="My Orders"
      description="Filter recent activity and inspect every order across the fulfillment timeline."
    >
      {message ? (
        <div className="rounded-2xl border border-drac-border bg-drac-surface px-4 py-3 text-sm text-drac-text">
          {message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
              activeTab === tab
                ? "border-drac-gold bg-drac-gold text-drac-bg"
                : "border-drac-border bg-drac-surface2 text-drac-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-drac-muted">Loading orders...</p>
      ) : !filteredOrders.length ? (
        <EmptyState
          title="No orders yet"
          description="Start shopping and your completed checkout history will show up here."
          actionLabel="Start Shopping"
          actionTo="/products"
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="drac-panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-sm text-drac-text">{order.order_number}</p>
                    <OrderStatusBadge status={order.status} />
                    {order.payment_summary ? (
                      <span className="badge border-drac-green/30 bg-drac-green/10 text-drac-green">
                        {order.payment_summary.provider_label}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-drac-muted">{formatDate(order.created_at)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-drac-border bg-drac-surface2 text-xs text-drac-muted"
                      >
                        {item.quantity}x
                      </div>
                    ))}
                    {order.items.length > 3 ? (
                      <span className="badge bg-drac-surface2 text-drac-muted">
                        +{order.items.length - 3} more
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-lg font-bold text-drac-gold">
                    {formatCurrency(order.total)}
                  </p>
                  <Link to={`/account/orders/${order.id}`} className="btn-secondary">
                    View Details
                  </Link>
                  {order.status === "PENDING" ? (
                    <Button type="button" variant="outline" onClick={() => handleCancel(order.id)}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
