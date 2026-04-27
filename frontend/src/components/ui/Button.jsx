import Spinner from "./Spinner";

export default function Button({
  children, onClick, type = "button",
  variant = "primary", size = "md",
  loading = false, disabled = false,
  className = "", fullWidth = false,
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "text-gray-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all",
    danger: "bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        inline-flex items-center justify-center gap-2
        ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}