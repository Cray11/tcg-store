import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderTimeline({ status }) {
  const activeIndex = STEPS.indexOf(status);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {STEPS.map((step, index) => {
        const completed = activeIndex > index || (status === "DELIVERED" && index === activeIndex);
        const active = activeIndex === index;

        return (
          <div key={step} className="flex items-center gap-3 rounded-2xl border border-drac-border bg-drac-surface p-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold",
                completed
                  ? "border-drac-green bg-drac-green text-drac-bg"
                  : active
                    ? "border-drac-gold bg-drac-gold text-drac-bg"
                    : "border-drac-border bg-drac-surface2 text-drac-muted"
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-drac-muted">Step</p>
              <p className="text-sm font-semibold text-drac-text">
                {step.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
