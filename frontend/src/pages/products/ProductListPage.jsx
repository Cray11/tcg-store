import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsAPI } from "../../api/products";
import ProductCard from "../../components/products/ProductCard";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import PageWrapper from "../../components/layout/PageWrapper";
import { SlidersHorizontal, X } from "lucide-react";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];
const TYPES = ["SINGLE", "PACK", "BOX", "BUNDLE", "TIN"];
const SORT_OPTIONS = [
  { label: "Newest", value: "-created_at" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Name A-Z", value: "name" },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = Number(searchParams.get("page") ?? 1);

  const fetchProducts = () => {
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    productsAPI.getProducts(params)
      .then(({ data }) => {
        setProducts(data.data ?? []);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [searchParams.toString()]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-700">Browse Cards</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total} products found
            </p>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 btn-outline text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className={`md:block w-full md:w-64 shrink-0
          ${showFilters ? "block" : "hidden"}`}>
          <div className="card p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters}
                className="text-xs text-accent-500 hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all
              </button>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-2">Sort By</label>
              <select
                value={searchParams.get("ordering") ?? "-created_at"}
                onChange={(e) => updateParam("ordering", e.target.value)}
                className="input-field text-sm">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-2">Condition</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button key={c}
                    onClick={() => updateParam("condition",
                      searchParams.get("condition") === c ? "" : c)}
                    className={`badge cursor-pointer transition-all ${
                      searchParams.get("condition") === c
                        ? "bg-primary-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type */}
            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-2">Product Type</label>
              <div className="space-y-1">
                {TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type"
                      checked={searchParams.get("product_type") === t}
                      onChange={() => updateParam("product_type",
                        searchParams.get("product_type") === t ? "" : t)}
                      className="text-primary-700" />
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-2">Price Range (₱)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min"
                  value={searchParams.get("min_price") ?? ""}
                  onChange={(e) => updateParam("min_price", e.target.value)}
                  className="input-field text-sm" />
                <input type="number" placeholder="Max"
                  value={searchParams.get("max_price") ?? ""}
                  onChange={(e) => updateParam("max_price", e.target.value)}
                  className="input-field text-sm" />
              </div>
            </div>

            {/* In Stock only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={searchParams.get("in_stock") === "true"}
                onChange={(e) => updateParam("in_stock", e.target.checked ? "true" : "")}
                className="rounded text-primary-700" />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-4xl mb-3">🃏</p>
              <h3 className="font-semibold text-gray-700">No products found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
              <button onClick={clearFilters} className="btn-primary mt-4 text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={!pagination.has_previous}
                    onClick={() => updateParam("page", currentPage - 1)}
                    className="btn-outline text-sm disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    disabled={!pagination.has_next}
                    onClick={() => updateParam("page", currentPage + 1)}
                    className="btn-outline text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}