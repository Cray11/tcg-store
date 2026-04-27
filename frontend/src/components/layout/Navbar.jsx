import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, Sword } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { authAPI } from "../../api/auth";
import { useUIStore } from "../../store/uiStore";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, accessToken, logout, refreshToken } = useAuthStore();
  const { itemCount } = useCartStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout(refreshToken);
    } catch {}
    logout();
    addToast("Logged out successfully.", "success");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-primary-700 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Sword className="h-6 w-6 text-accent-400" />
            <span>TCG <span className="text-accent-400">Store</span></span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards, sets, games..."
                className="w-full bg-primary-900 text-white placeholder-gray-400
                  rounded-full pl-10 pr-4 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
          </form>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Browse Cards
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-200 hover:text-white transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white
                  text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {accessToken ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium
                  text-gray-200 hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                  <span>{user?.first_name}</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl
                  shadow-xl border border-gray-100 opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/account"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                    My Account
                  </Link>
                  <Link to="/account/orders"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    My Orders
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500
                      hover:bg-red-50 rounded-b-xl">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login"
                className="bg-accent-500 hover:bg-accent-600 text-white
                  text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen
              ? <X className="h-6 w-6" />
              : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-900 border-t border-primary-500 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-primary-700 text-white placeholder-gray-400
                  rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </form>
          <Link to="/products" onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-200 py-2">Browse Cards</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-200 py-2">
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link>
          {accessToken ? (
            <>
              <Link to="/account" onClick={() => setMobileOpen(false)}
                className="block text-sm text-gray-200 py-2">My Account</Link>
              <button onClick={handleLogout}
                className="block text-sm text-red-400 py-2">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="block text-sm text-accent-400 py-2 font-semibold">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}