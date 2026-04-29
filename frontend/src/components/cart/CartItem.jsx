import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ConditionBadge from "../products/ConditionBadge";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CartItem({
  item,
  updating,
  onQuantityChange,
  onRemove,
}) {
  return (
    <div className="drac-panel p-4">
      <div className="flex gap-4">
        <img
          src={item.product.image_url || PLACEHOLDER_IMAGE}
          alt={item.product.name}
          className="h-24 w-[68px] rounded-2xl bg-white object-contain p-1"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Link to={`/products/${item.product.slug}`} className="text-base font-semibold text-drac-text hover:text-drac-gold">
                {item.product.name}
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-drac-muted">
                {item.product.set_name || "Pokemon Trading Card Game"}
              </p>
              <div className="mt-2">
                <ConditionBadge condition={item.product.condition} />
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-drac-muted">Unit Price</p>
              <p className="text-lg font-bold text-drac-gold">
                {formatCurrency(item.product.price)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center rounded-full border border-drac-border bg-drac-surface2">
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || updating}
                className="px-4 py-3 text-drac-text disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold">
                {updating ? "..." : item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock || updating}
                className="px-4 py-3 text-drac-text disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-drac-text">
                {formatCurrency(item.line_total)}
              </p>
              <button
                type="button"
                onClick={() => onRemove(item.id, item.product.name)}
                className="rounded-full border border-drac-border bg-drac-surface2 p-3 text-drac-muted transition-colors hover:text-drac-red"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
