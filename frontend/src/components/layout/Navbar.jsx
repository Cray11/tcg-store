import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import { authAPI } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { useWishlistStore } from "../../store/wishlistStore";
import MobileMenu from "./MobileMenu";
import SearchBar from "../products/SearchBar";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, accessToken, logout, refreshToken } = useAuthStore();
  const { itemCount, clearCart } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout(refreshToken);
    } catch {
      // Ignore backend logout failures and clear local state.
    }

    logout();
    clearCart();
    clearWishlist();
    setMobileOpen(false);
    addToast("Logged out successfully.", "success");
    navigate("/");
  };

  const handleSearch = (query) => {
    setMobileOpen(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const initials = user?.first_name?.[0] || user?.email?.[0] || "D";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-drac-border bg-drac-bg/85 backdrop-blur-xl">
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <Link to="/" className="navbar-brand flex shrink-0 items-center w-32 sm:w-36">
            <img
              src="/DracNest-PNG.png"
              alt="DracNest"
              className="object-contain"
            />
          </Link>

          <SearchBar onSubmit={handleSearch} className="hidden flex-1 md:block" />

          <div className="hidden items-center gap-5 md:flex">
            <Link to="/products" className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-muted hover:text-drac-gold">
              Shop
            </Link>
            <Link
              to={accessToken ? "/account/wishlist" : "/login"}
              state={accessToken ? undefined : { from: { pathname: "/account/wishlist" } }}
              className="relative rounded-full border border-drac-border bg-drac-surface p-3 text-drac-text hover:border-drac-gold/50"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-drac-red text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link to="/cart" className="relative rounded-full border border-drac-border bg-drac-surface p-3 text-drac-text hover:border-drac-gold/50">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-drac-gold text-[10px] font-bold text-drac-bg">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Link>
            {accessToken ? (
              <div className="group relative">
                <button type="button" className="flex items-center gap-3 rounded-full border border-drac-border bg-drac-surface px-3 py-2 text-sm font-medium text-drac-text">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-drac-gold font-semibold text-drac-bg">
                    {initials.toUpperCase()}
                  </span>
                  <span className="max-w-24 truncate">{user?.first_name || "Trainer"}</span>
                  <ChevronDown className="h-4 w-4 text-drac-muted" />
                </button>
                <div className="invisible absolute right-0 mt-3 w-56 translate-y-2 rounded-2xl border border-drac-border bg-drac-surface p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link to="/account" className="block rounded-xl px-4 py-3 text-sm text-drac-text hover:bg-white/5">
                    My Account
                  </Link>
                  <Link to="/account/profile" className="block rounded-xl px-4 py-3 text-sm text-drac-text hover:bg-white/5">
                    Profile
                  </Link>
                  <Link to="/account/orders" className="block rounded-xl px-4 py-3 text-sm text-drac-text hover:bg-white/5">
                    My Orders
                  </Link>
                  <Link to="/account/wishlist" className="block rounded-xl px-4 py-3 text-sm text-drac-text hover:bg-white/5">
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-drac-red hover:bg-drac-red/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              to={accessToken ? "/account/wishlist" : "/login"}
              state={accessToken ? undefined : { from: { pathname: "/account/wishlist" } }}
              className="relative rounded-full border border-drac-border bg-drac-surface p-3 text-drac-text"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-drac-red text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link to="/cart" className="relative rounded-full border border-drac-border bg-drac-surface p-3 text-drac-text">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-drac-gold text-[10px] font-bold text-drac-bg">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="rounded-full border border-drac-border bg-drac-surface p-3"
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        authenticated={Boolean(accessToken)}
        itemCount={itemCount}
        wishlistCount={wishlistCount}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
