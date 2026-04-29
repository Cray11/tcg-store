import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { ordersAPI } from "../../api/orders";
import AccountShell from "../../components/account/AccountShell";
import OrderStatusBadge from "../../components/account/OrderStatusBadge";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getPayload } from "../../utils/api";

export default function AccountDashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          authAPI.getProfile(),
          ordersAPI.getOrders(),
        ]);

        if (!active) {
          return;
        }

        updateUser(getPayload(profileResponse));
        setOrders(getPayload(ordersResponse) ?? []);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [updateUser]);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);

    return {
      totalOrders: orders.length,
      pendingOrders,
      totalSpent,
    };
  }, [orders]);

  return (
    <AccountShell
      title={`Welcome Back, ${(user?.first_name || "Trainer").toUpperCase()}!`}
      description="Track your orders, collector stats, and key account actions from one control room."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} />
        <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} />
      </div>

      <div className="drac-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Recent Orders</p>
            <h2 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-text">
              Last Five Orders
            </h2>
          </div>
          <Link to="/account/orders" className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-gold">
            View All
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-drac-muted">Loading dashboard...</p>
        ) : !orders.length ? (
          <p className="mt-6 text-sm text-drac-muted">
            No orders yet. Once checkout is complete, your latest orders will appear here.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-drac-muted">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-drac-border">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 font-mono text-drac-text">{order.order_number}</td>
                    <td className="py-4 text-drac-muted">{formatDate(order.created_at)}</td>
                    <td className="py-4 text-drac-muted">{order.items.length}</td>
                    <td className="py-4 text-drac-text">{formatCurrency(order.total)}</td>
                    <td className="py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="py-4 text-right">
                      <Link to={`/account/orders/${order.id}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-gold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccountShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="drac-panel p-6">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 font-heading text-4xl tracking-[0.12em] text-drac-gold">
        {value}
      </p>
    </div>
  );
}
