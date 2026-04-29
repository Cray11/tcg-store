import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-10 w-10" };

  return (
    <LoaderCircle
      className={cn("animate-spin text-current", sizes[size] ?? sizes.md, className)}
    />
  );
}
