import Spinner from "./Spinner";
import { cn } from "../../utils/cn";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  fullWidth = false,
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline:
      "inline-flex items-center justify-center gap-2 rounded-full border border-drac-gold/65 bg-transparent px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-drac-gold transition-all duration-200 hover:-translate-y-0.5 hover:bg-drac-gold/10",
    ghost: "btn-ghost",
    danger:
      "inline-flex items-center justify-center gap-2 rounded-full border border-drac-red/50 bg-drac-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:-translate-y-0.5",
  };
  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
