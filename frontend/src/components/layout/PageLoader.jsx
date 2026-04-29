import { LoaderCircle } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export default function PageLoader() {
  const { pageLoading } = useUIStore();

  if (!pageLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-drac-bg/65 backdrop-blur-sm">
      <div className="drac-panel flex items-center gap-3 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-drac-gold">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading arena
      </div>
    </div>
  );
}
