import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import {
  CONDITIONS,
  LANGUAGES,
  PRODUCT_TYPES,
  RARITIES,
  SORT_OPTIONS,
} from "../../utils/constants";
import { cn } from "../../utils/cn";

export default function FilterSidebar({
  categories,
  filters,
  searchValue,
  onChange,
  onSearchChange,
  onClear,
  className = "",
}) {
  return (
    <aside className={cn("drac-panel h-fit p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Filter Arena</p>
          <h2 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-gold">
            Refine Hunt
          </h2>
        </div>
        <button type="button" onClick={onClear} className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-muted hover:text-drac-gold">
          Clear All
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <Input
          label="Search"
          name="search"
          placeholder="Charizard, Paldea..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <Select
          label="Sort"
          name="ordering"
          value={filters.ordering}
          onChange={(event) => onChange("ordering", event.target.value)}
          options={SORT_OPTIONS}
        />

        <div>
          <p className="field-label">Set</p>
          <div className="grid gap-2">
            {categories.map((category) => {
              const selected = filters.categorySlug === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChange("categorySlug", selected ? "" : category.slug)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-drac-gold bg-drac-gold/10 text-drac-gold"
                      : "border-drac-border bg-drac-surface2 text-drac-text hover:border-drac-gold/35"
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <FilterButtonGroup
          label="Rarity"
          options={RARITIES}
          value={filters.rarity}
          onChange={(value) => onChange("rarity", value)}
        />

        <FilterButtonGroup
          label="Condition"
          options={CONDITIONS}
          value={filters.condition}
          onChange={(value) => onChange("condition", value)}
          compact
        />

        <FilterButtonGroup
          label="Product Type"
          options={PRODUCT_TYPES}
          value={filters.productType}
          onChange={(value) => onChange("productType", value)}
          compact
        />

        <div>
          <p className="field-label">Price Range</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="min_price"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
            />
            <Input
              name="max_price"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="field-label">Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => {
              const selected = filters.language === language;
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => onChange("language", selected ? "" : language)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                    selected
                      ? "border-drac-gold bg-drac-gold text-drac-bg"
                      : "border-drac-border bg-drac-surface2 text-drac-text"
                  )}
                >
                  {language}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-drac-border bg-drac-surface2 px-4 py-3 text-sm text-drac-text">
          In Stock Only
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onChange("inStock", event.target.checked)}
            className="h-4 w-4 rounded border-drac-border bg-drac-surface text-drac-gold"
          />
        </label>

        <Button type="button" variant="outline" fullWidth onClick={onClear}>
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}

function FilterButtonGroup({ label, options, value, onChange, compact = false }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <div className={cn("flex flex-wrap gap-2", compact && "gap-2")}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(selected ? "" : option.value)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                selected
                  ? "border-drac-gold bg-drac-gold text-drac-bg"
                  : "border-drac-border bg-drac-surface2 text-drac-text"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
