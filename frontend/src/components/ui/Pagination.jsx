import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPagination } from "../../utils/api";
import { cn } from "../../utils/cn";

export default function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onChange,
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = buildPagination(page, totalPages);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={() => onChange(page - 1)}
        className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
            item === page
              ? "border-drac-gold bg-drac-gold text-drac-bg"
              : "border-drac-border bg-drac-surface text-drac-text hover:border-drac-gold/45"
          )}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => onChange(page + 1)}
        className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
