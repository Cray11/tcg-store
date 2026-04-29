import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { productsAPI } from "../../api/products";
import PageWrapper from "../../components/layout/PageWrapper";
import FilterSidebar from "../../components/products/FilterSidebar";
import ProductGrid from "../../components/products/ProductGrid";
import SearchBar from "../../components/products/SearchBar";
import Pagination from "../../components/ui/Pagination";
import Select from "../../components/ui/Select";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  CONDITIONS,
  LANGUAGES,
  PRODUCT_TYPES,
  RARITIES,
  SORT_OPTIONS,
} from "../../utils/constants";
import { getPagination, getPayload } from "../../utils/api";
import { cn } from "../../utils/cn";

export function CatalogPage({ mode = "browse" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchParamName = mode === "search" ? "q" : "search";
  const currentSearch = searchParams.get(searchParamName) ?? "";
  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch === currentSearch) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      next.set(searchParamName, debouncedSearch);
    } else {
      next.delete(searchParamName);
    }
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [currentSearch, debouncedSearch, searchParamName, searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      setLoading(true);
      try {
        const params = {
          ...Object.fromEntries(searchParams.entries()),
          game: "POKEMON",
        };
        if (mode === "search") {
          params.search = params.q ?? "";
          delete params.q;
        }

        const requests = [productsAPI.getProducts(params)];
        if (mode === "browse") {
          requests.push(productsAPI.getCategories({ game: "POKEMON" }));
        }

        const [productsResponse, categoriesResponse] = await Promise.all(requests);

        if (!active) {
          return;
        }

        setProducts(getPayload(productsResponse) ?? []);
        setPagination(getPagination(productsResponse));
        if (categoriesResponse) {
          setCategories(getPayload(categoriesResponse) ?? []);
        }
      } catch {
        if (!active) {
          return;
        }
        setProducts([]);
        setPagination(null);
        if (mode === "browse") {
          setCategories([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, [mode, searchParams]);

  const filters = useMemo(
    () => ({
      search: currentSearch,
      ordering: searchParams.get("ordering") ?? "-created_at",
      categorySlug: searchParams.get("category__slug") ?? "",
      rarity: searchParams.get("rarity") ?? "",
      condition: searchParams.get("condition") ?? "",
      productType: searchParams.get("product_type") ?? "",
      minPrice: searchParams.get("min_price") ?? "",
      maxPrice: searchParams.get("max_price") ?? "",
      inStock: searchParams.get("in_stock") === "true",
      language: searchParams.get("language") ?? "",
    }),
    [currentSearch, searchParams]
  );

  const resultLabel = mode === "search"
    ? `${pagination?.total ?? 0} results for "${currentSearch || "all cards"}"`
    : `${pagination?.total ?? 0} cards found`;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    const mapping = {
      ordering: "ordering",
      categorySlug: "category__slug",
      rarity: "rarity",
      condition: "condition",
      productType: "product_type",
      minPrice: "min_price",
      maxPrice: "max_price",
      inStock: "in_stock",
      language: "language",
      page: "page",
    };

    const paramKey = mapping[key] ?? key;

    if (value === "" || value === false || value == null) {
      next.delete(paramKey);
    } else if (typeof value === "boolean") {
      next.set(paramKey, value ? "true" : "false");
    } else {
      next.set(paramKey, String(value));
    }

    if (paramKey !== "page") {
      next.delete("page");
    }

    setSearchParams(next);
  };

  const clearFilters = () => {
    if (mode === "search") {
      const next = new URLSearchParams();
      if (currentSearch) {
        next.set("q", currentSearch);
      }
      setSearchInput(currentSearch);
      setSearchParams(next);
      return;
    }
    setSearchInput("");
    setSearchParams({});
  };

  const activeChips = [
    filters.categorySlug && categories.find((category) => category.slug === filters.categorySlug)?.name,
    filters.rarity && RARITIES.find((item) => item.value === filters.rarity)?.label,
    filters.condition && CONDITIONS.find((item) => item.value === filters.condition)?.label,
    filters.productType && PRODUCT_TYPES.find((item) => item.value === filters.productType)?.label,
    filters.language && LANGUAGES.find((language) => language === filters.language),
    filters.inStock && "In Stock",
    filters.minPrice && `Min ${filters.minPrice}`,
    filters.maxPrice && `Max ${filters.maxPrice}`,
  ].filter(Boolean);

  return (
    <PageWrapper>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">
            <Link to="/" className="hover:text-drac-gold">Home</Link>
            {" > "}
            {mode === "search" ? "Search" : "Cards"}
          </p>
          <h1 className="mt-2 font-heading text-5xl tracking-[0.16em] text-drac-gold">
            {mode === "search" ? "Search Results" : "All Pokemon Cards"}
          </h1>
          <p className="mt-2 text-sm text-drac-muted">{resultLabel}</p>
        </div>

        <div className="flex items-center gap-3">
          {mode === "search" ? (
            <SearchBar
              key={currentSearch}
              initialValue={currentSearch}
              placeholder="Search for Charizard, Pikachu, Paldea..."
              onSubmit={(value) => setSearchInput(value)}
              className="w-full md:w-[360px]"
            />
          ) : null}
          <div className="w-full md:w-56">
            <Select
              name="ordering"
              value={filters.ordering}
              onChange={(event) => updateParam("ordering", event.target.value)}
              options={SORT_OPTIONS}
            />
          </div>
          {mode === "browse" ? (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-drac-border bg-drac-surface px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-drac-text md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          ) : null}
        </div>
      </div>

      {activeChips.length ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span key={chip} className="filter-chip">
              {chip}
            </span>
          ))}
          <button type="button" onClick={clearFilters} className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-gold">
            Clear All
          </button>
        </div>
      ) : null}

      <div className={cn("grid gap-6", mode === "browse" && "lg:grid-cols-[280px_minmax(0,1fr)]")}>
        {mode === "browse" ? (
          <>
            <FilterSidebar
              categories={categories}
              filters={filters}
              searchValue={searchInput}
              onChange={updateParam}
              onSearchChange={setSearchInput}
              onClear={clearFilters}
              className={cn(
                "hidden lg:block",
                mobileFiltersOpen && "block"
              )}
            />
            {mobileFiltersOpen ? (
              <div className="fixed inset-0 z-40 bg-drac-bg/80 px-4 py-24 backdrop-blur lg:hidden">
                <FilterSidebar
                  categories={categories}
                  filters={filters}
                  searchValue={searchInput}
                  onChange={updateParam}
                  onSearchChange={setSearchInput}
                  onClear={() => {
                    clearFilters();
                    setMobileFiltersOpen(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="absolute right-6 top-24 rounded-full border border-drac-border bg-drac-surface p-3 text-drac-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        <div>
          <ProductGrid
            products={products}
            loading={loading}
            columns={mode === "search"
              ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}
            emptyTitle={mode === "search" ? `No results for "${currentSearch}"` : "No cards found"}
            emptyDescription={mode === "search"
              ? "Try checking spelling or search for a set name instead."
              : "Try different filters to find more cards."}
          />

          <Pagination
            page={pagination?.page ?? 1}
            totalPages={pagination?.total_pages ?? 1}
            hasNext={pagination?.has_next}
            hasPrevious={pagination?.has_previous}
            onChange={(page) => updateParam("page", page)}
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default function ProductListPage() {
  return <CatalogPage mode="browse" />;
}
