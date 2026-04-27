import { Link } from "react-router-dom";
import { Sword } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <Sword className="h-5 w-5 text-accent-400" />
              <span>TCG <span className="text-accent-400">Store</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop shop for Pokémon, Magic: The Gathering,
              and Yu-Gi-Oh! singles, packs, and sealed products.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              {["Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "Booster Boxes"].map((item) => (
                <li key={item}>
                  <Link to="/products"
                    className="hover:text-accent-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "My Account", to: "/account" },
                { label: "My Orders", to: "/account/orders" },
                { label: "Cart", to: "/cart" },
                { label: "Login", to: "/login" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to}
                    className="hover:text-accent-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} TCG Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}