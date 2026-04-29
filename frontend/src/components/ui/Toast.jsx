import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../utils/cn";

const icons = {
  success: <CheckCircle className="h-5 w-5 text-drac-green" />,
  error: <XCircle className="h-5 w-5 text-drac-red" />,
  warning: <AlertCircle className="h-5 w-5 text-drac-gold" />,
  info: <Info className="h-5 w-5 text-sky-400" />,
};

const colors = {
  success: "border-drac-green/50",
  error: "border-drac-red/50",
  warning: "border-drac-gold/50",
  info: "border-sky-400/50",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "animate-fade-in-up flex min-w-[18rem] items-center gap-3 rounded-2xl border-l-4 bg-drac-surface px-4 py-3 shadow-2xl",
            colors[toast.type] ?? colors.info
          )}
        >
          {icons[toast.type] ?? icons.info}
          <p className="flex-1 text-sm font-medium text-drac-text">
            {toast.message}
          </p>
          <button type="button" onClick={() => removeToast(toast.id)}>
            <X className="h-4 w-4 text-drac-muted hover:text-drac-text" />
          </button>
        </div>
      ))}
    </div>
  );
}
