import { Heart, LogOut, MapPin, Package2, Shield, User2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { cn } from "../../utils/cn";

const LINKS = [
  { to: "/account", label: "Dashboard", icon: Shield, end: true },
  { to: "/account/orders", label: "My Orders", icon: Package2 },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/profile", label: "Profile", icon: User2 },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/password", label: "Change Password", icon: Shield },
];

export default function AccountSidebar() {
  const navigate = useNavigate();
  const { user, logout, refreshToken } = useAuthStore();
  const { clearCart } = useCartStore();
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const { addToast } = useUIStore();

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}` || "DN";

  const handleLogout = async () => {
    try {
      await authAPI.logout(refreshToken);
    } catch {
      // Ignore backend logout failures and clear local state.
    }

    logout();
    clearCart();
    clearWishlist();
    addToast("Logged out successfully.", "success");
    navigate("/");
  };

  return (
    <aside className="drac-panel sticky top-28 h-fit p-5">
      <img src="/DracNest-PNG.png" alt="DracNest" className="w-28 object-contain" />
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-drac-border bg-drac-surface2 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-drac-gold text-lg font-bold text-drac-bg">
          {initials.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-drac-text">
            {user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Trainer"}
          </p>
          <p className="truncate text-xs text-drac-muted">{user?.email}</p>
        </div>
      </div>

      <nav className="mt-5 space-y-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              end={item.end}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "border-drac-gold/40 bg-drac-gold/10 text-drac-gold"
                    : "text-drac-muted hover:border-drac-border hover:bg-white/5 hover:text-drac-text"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-drac-red/35 bg-drac-red/10 px-4 py-3 text-sm font-semibold text-drac-red transition-colors hover:bg-drac-red/20"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
