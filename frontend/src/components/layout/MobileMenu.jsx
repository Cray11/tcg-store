import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/products", label: "All Cards" },
  { to: "/search?q=charizard", label: "Popular Search" },
];

export default function MobileMenu({
  open,
  authenticated,
  itemCount,
  wishlistCount,
  onClose,
  onLogout,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-drac-bg/95 backdrop-blur md:hidden">
      <div className="page-shell flex min-h-screen flex-col justify-between py-8">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="section-kicker">Menu</p>
            <div className="glass-divider" />
          </div>

          <nav className="space-y-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="block rounded-2xl border border-drac-border bg-drac-surface px-5 py-4 text-lg font-semibold text-drac-text"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={onClose}
              className="block rounded-2xl border border-drac-border bg-drac-surface px-5 py-4 text-lg font-semibold text-drac-text"
            >
              Cart {itemCount > 0 ? `(${itemCount})` : ""}
            </Link>
            <Link
              to={authenticated ? "/account/wishlist" : "/login"}
              state={authenticated ? undefined : { from: { pathname: "/account/wishlist" } }}
              onClick={onClose}
              className="block rounded-2xl border border-drac-border bg-drac-surface px-5 py-4 text-lg font-semibold text-drac-text"
            >
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
            </Link>
            {authenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={onClose}
                  className="block rounded-2xl border border-drac-border bg-drac-surface px-5 py-4 text-lg font-semibold text-drac-text"
                >
                  My Account
                </Link>
                <Link
                  to="/account/orders"
                  onClick={onClose}
                  className="block rounded-2xl border border-drac-border bg-drac-surface px-5 py-4 text-lg font-semibold text-drac-text"
                >
                  My Orders
                </Link>
              </>
            ) : (
              <Link to="/login" onClick={onClose} className="btn-primary w-full">
                Sign In
              </Link>
            )}
          </nav>
        </div>

        {authenticated && (
          <button type="button" onClick={onLogout} className="btn-secondary w-full">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
