import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error:   <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
};

const colors = {
  success: "border-l-green-500",
  error:   "border-l-red-500",
  warning: "border-l-yellow-500",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 bg-white rounded-xl shadow-lg
            border-l-4 ${colors[t.type]} px-4 py-3 min-w-72
            animate-in slide-in-from-right`}>
          {icons[t.type]}
          <p className="text-sm font-medium text-gray-800 flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)}>
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  );
}