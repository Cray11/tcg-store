import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { productsAPI } from "../api/products";
import PageWrapper from "../components/layout/PageWrapper";
import ProductCard from "../components/products/ProductCard";
import ProductGrid from "../components/products/ProductGrid";
import { ProductCardSkeleton } from "../components/ui/Skeleton";
import { getPayload } from "../utils/api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHomepage() {
      try {
        const [categoriesResponse, featuredResponse, newArrivalsResponse] = await Promise.all([
          productsAPI.getCategories({ game: "POKEMON" }),
          productsAPI.getFeatured({ game: "POKEMON" }),
          productsAPI.getProducts({ ordering: "-created_at", page_size: 12, game: "POKEMON" }),
        ]);

        if (!active) {
          return;
        }

        setCategories(getPayload(categoriesResponse) ?? []);
        setFeatured(getPayload(featuredResponse) ?? []);
        setNewArrivals(getPayload(newArrivalsResponse) ?? []);
      } catch {
        if (!active) {
          return;
        }
        setCategories([]);
        setFeatured([]);
        setNewArrivals([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHomepage();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="hero-grid relative isolate overflow-hidden border-b border-drac-border bg-drac-bg">
        <div className="scene-particles absolute inset-0 opacity-60">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="page-shell flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center py-20 text-center">
          <img
            src="/DracNest-PNG.png"
            alt="DracNest"
            className="mx-auto w-full max-w-[320px] object-contain"
          />
          <p className="mt-8 font-heading text-[2.5rem] leading-none tracking-[0.18em] text-gradient-gold md:text-[3.25rem]">
            CATCH THEM. COLLECT THEM. DOMINATE.
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.22em] text-drac-muted">
            Philippines&apos; premium Pokemon Trading Card Game store
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/products" className="btn-primary">
              Shop Cards
            </Link>
          </div>
          <div className="mt-16 flex flex-col items-center gap-3 text-drac-muted">
            <div className="pokeball-scroll animate-bounce-soft" />
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>
      </section>

      <PageWrapper>
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Sets</p>
              <h2 className="mt-2 font-heading text-4xl tracking-[0.16em] text-drac-text">
                Category Strip
              </h2>
            </div>
            <Link to="/products" className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-gold">
              Browse All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category__slug=${category.slug}`}
                className="whitespace-nowrap rounded-full border border-drac-border bg-drac-surface2 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-drac-text transition-colors hover:border-drac-gold hover:text-drac-gold"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Curated</p>
              <h2 className="section-title mt-2">Featured Cards</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-gold">
              View Collection
            </Link>
          </div>
          <div className="hidden gap-4 overflow-x-auto lg:flex">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="min-w-[280px] max-w-[320px] flex-1">
                  <ProductCardSkeleton />
                </div>
              ))
              : featured.map((product) => (
                <div key={product.id} className="min-w-[280px] max-w-[320px] flex-1">
                  <ProductCard product={product} />
                </div>
              ))}
          </div>
          <div className="lg:hidden">
            <ProductGrid
              products={featured}
              loading={loading}
              columns="grid-cols-2"
            />
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-5">
            <p className="section-kicker">Fresh Pulls</p>
            <h2 className="mt-2 font-heading text-4xl tracking-[0.16em] text-drac-text">
              New Arrivals
            </h2>
          </div>
          <ProductGrid
            products={newArrivals}
            loading={loading}
            columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
          />
        </section>

        <section className="mb-12">
          <div className="mb-5">
            <p className="section-kicker">Why DracNest</p>
            <h2 className="mt-2 font-heading text-4xl tracking-[0.16em] text-drac-text">
              Built For Trainers
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "Fast Shipping",
                description: "Nationwide delivery built for collectors who do not like waiting on chase cards.",
              },
              {
                icon: Sparkles,
                title: "Condition Graded",
                description: "Every listing is reviewed and tagged so you know exactly what lands in your binder.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Checkout",
                description: "Structured demo checkout with payment references, invoice email output, and a polished end-to-end ordering flow.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="drac-panel p-6">
                  <div className="mb-4 inline-flex rounded-full border border-drac-border bg-drac-surface2 p-3 text-drac-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-3xl tracking-[0.14em] text-drac-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-drac-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}
