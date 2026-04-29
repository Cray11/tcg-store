import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

const STEPS = [
  { id: "shipping", label: "Shipping" },
  { id: "method", label: "Method" },
  { id: "payment", label: "Payment" },
];

export default function CheckoutStepper({ currentStep }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="mb-8 grid gap-3 md:grid-cols-3">
      {STEPS.map((step, index) => {
        const completed = currentIndex > index;
        const active = currentIndex === index;

        return (
          <div key={step.id} className="drac-panel flex items-center gap-3 p-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
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
              <p className="section-kicker">Step {index + 1}</p>
              <p className="text-sm font-semibold text-drac-text">{step.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
