import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { productsAPI } from "../api/products";
import ProductCard from "../components/products/ProductCard";
import { ProductCardSkeleton } from "../components/ui/Skeleton";
import PageWrapper from "../components/layout/PageWrapper";

const GAMES = [
  { name: "Pokémon", slug: "pokemon", emoji: "🔴",
    color: "from-yellow-400 to-red-500", desc: "Singles, packs & boxes" },
  { name: "Magic: The Gathering", slug: "mtg", emoji: "🧙",
    color: "from-blue-500 to-purple-600", desc: "All sets & formats" },
  { name: "Yu-Gi-Oh!", slug: "yugioh", emoji: "⚡",
    color: "from-yellow-500 to-orange-600", desc: "Singles & sealed" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getFeatured()
      .then(({ data }) => setFeatured(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500
        text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-accent-500 text-white text-xs font-bold
            uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Philippines #1 TCG Store
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Trade Cards,<br />
            <span className="text-accent-400">Build Legends.</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
            Shop thousands of singles, booster packs, and sealed products
            for Pokémon, MTG, and Yu-Gi-Oh!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products"
              className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Browse Cards <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products?product_type=BOX"
              className="btn-outline border-white text-white hover:bg-white
                hover:text-primary-700 text-base px-8 py-3">
              Sealed Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <PageWrapper>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary-700 mb-6">Shop by Game</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GAMES.map((game) => (
              <Link key={game.slug}
                to={`/products?game=${game.slug}`}
                className={`bg-gradient-to-br ${game.color} rounded-2xl p-6
                  text-white hover:shadow-xl hover:-translate-y-1
                  transition-all duration-200`}>
                <span className="text-4xl">{game.emoji}</span>
                <h3 className="text-xl font-bold mt-2">{game.name}</h3>
                <p className="text-sm opacity-80">{game.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-700">Featured Cards</h2>
            <Link to="/products"
              className="text-sm text-accent-500 font-semibold hover:underline
                flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.length > 0
                ? featured.map((p) => <ProductCard key={p.id} product={p} />)
                : <p className="text-gray-400 col-span-full text-center py-8">
                    No featured products yet.
                  </p>
            }
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <Truck className="h-6 w-6" />, title: "Fast Shipping",
              desc: "Standard & express delivery nationwide" },
            { icon: <Shield className="h-6 w-6" />, title: "Secure Payments",
              desc: "Powered by Stripe — 100% secure checkout" },
            { icon: <Zap className="h-6 w-6" />, title: "Condition Guaranteed",
              desc: "All cards graded and verified before shipping" },
          ].map((f) => (
            <div key={f.title}
              className="card p-6 flex flex-col items-center text-center gap-3">
              <div className="text-accent-500 bg-accent-50 rounded-full p-3">
                {f.icon}
              </div>
              <h3 className="font-semibold text-primary-700">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </section>
      </PageWrapper>
    </div>
  );
}