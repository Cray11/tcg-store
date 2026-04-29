import { SHIPPING_OPTIONS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";
import { cn } from "../../utils/cn";

export default function ShippingOptions({ value, onChange }) {
  return (
    <div className="grid gap-3">
      {SHIPPING_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "drac-panel text-left transition-all",
            value === option.value
              ? "border-drac-gold shadow-gold-sm"
              : "hover:border-drac-gold/35"
          )}
        >
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">
                {option.label}
              </p>
              <p className="mt-1 text-sm text-drac-muted">{option.description}</p>
            </div>
            <p className="text-lg font-bold text-drac-gold">
              {formatCurrency(option.amount)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
