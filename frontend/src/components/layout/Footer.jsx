import { CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-drac-border bg-[#09121d]">
      <div className="page-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <img
              src="/DracNest-PNG.png"
              alt="DracNest"
              className="h-auto w-40 object-contain"
            />
            <p className="mt-4 max-w-md text-sm leading-7 text-drac-muted">
              Philippines&apos; premium Pokemon Trading Card Game store for
              collector-grade singles, sealed product drops, and checkout flows
              built for serious trainers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-drac-muted">
              <span className="badge bg-drac-surface2 text-drac-text">
                <CreditCard className="h-3.5 w-3.5" />
                Visa
              </span>
              <span className="badge bg-drac-surface2 text-drac-text">
                <WalletCards className="h-3.5 w-3.5" />
                Mastercard
              </span>
              <span className="badge bg-drac-surface2 text-drac-text">
                <ShieldCheck className="h-3.5 w-3.5" />
                GCash
              </span>
            </div>
          </div>

          <div>
            <h4 className="section-kicker mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-drac-muted">
              {[
                { label: "Singles", to: "/products?product_type=SINGLE" },
                { label: "Booster Packs", to: "/products?product_type=PACK" },
                { label: "Sealed Boxes", to: "/products?product_type=BOX" },
                { label: "Bundles & Tins", to: "/products?product_type=BUNDLE" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-drac-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-kicker mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-drac-muted">
              {[
                { label: "My Account", to: "/account" },
                { label: "My Orders", to: "/account/orders" },
                { label: "Checkout", to: "/checkout/shipping" },
                { label: "Login", to: "/login" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-drac-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-drac-border pt-6 text-xs text-drac-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 DracNest. All rights reserved.</p>
          <p>Catch them. Collect them. Dominate.</p>
        </div>
      </div>
    </footer>
  );
}
