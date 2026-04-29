import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}) {
  return (
    <div className="drac-panel p-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-drac-border bg-drac-surface2 text-drac-gold">
        {icon || <SearchX className="h-7 w-7" />}
      </div>
      <h2 className="font-heading text-4xl tracking-[0.16em] text-drac-gold">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-drac-muted">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
