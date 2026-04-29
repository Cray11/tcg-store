import { X } from "lucide-react";

export default function Modal({ open, title, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-drac-bg/70 px-4 backdrop-blur-sm">
      <div className="drac-panel w-full max-w-2xl p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-3xl tracking-[0.16em] text-drac-gold">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
