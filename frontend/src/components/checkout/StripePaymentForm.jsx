import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

export default function StripePaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Payment confirmation failed.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-3xl border border-drac-border bg-drac-surface2 p-4">
        <PaymentElement />
      </div>
      {error ? (
        <p className="rounded-2xl border border-drac-red/30 bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting} fullWidth size="lg">
        Place Order
      </Button>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.16em] text-drac-muted">
        <span className="badge bg-drac-surface2 text-drac-text">Visa</span>
        <span className="badge bg-drac-surface2 text-drac-text">MC</span>
        <span className="badge bg-drac-surface2 text-drac-text">Amex</span>
        <span className="badge bg-drac-surface2 text-drac-text">
          <ShieldCheck className="h-3.5 w-3.5" />
          SSL Secure
        </span>
      </div>
    </form>
  );
}
