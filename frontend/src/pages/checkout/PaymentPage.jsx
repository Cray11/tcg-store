import { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../api/orders";
import { paymentsAPI } from "../../api/payments";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload, getMessage } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";
import CheckoutLayout from "./CheckoutLayout";
import Button from "../../components/ui/Button";
import StripePaymentForm from "../../components/checkout/StripePaymentForm";
import Spinner from "../../components/ui/Spinner";
import { SHIPPING_OPTIONS } from "../../utils/constants";
import { useAuthStore } from "../../store/authStore";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart } = useCartStore();
  const { checkoutDraft, setCheckoutDraft, addToast } = useUIStore();
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [stripeWarning, setStripeWarning] = useState("");

  const shippingAmount = useMemo(
    () => SHIPPING_OPTIONS.find((option) => option.value === checkoutDraft.shippingMethod)?.amount ?? 99,
    [checkoutDraft.shippingMethod]
  );

  useEffect(() => {
    let active = true;

    async function preparePayment() {
      if (!checkoutDraft.addressId) {
        navigate("/checkout/shipping", { replace: true });
        return;
      }

      setLoading(true);
      setError("");
      setStripeWarning("");

      try {
        let orderData;
        let orderId = checkoutDraft.orderId;

        if (orderId) {
          const orderResponse = await ordersAPI.getOrder(orderId);
          orderData = getPayload(orderResponse);
        } else {
          const createResponse = await ordersAPI.createOrder({
            address_id: checkoutDraft.addressId,
            shipping_method: checkoutDraft.shippingMethod,
            customer_note: checkoutDraft.customerNote,
            promo_code: checkoutDraft.promoCode || undefined,
          });
          orderData = getPayload(createResponse);
          orderId = orderData.id;
          setCheckoutDraft({ orderId });
        }

        if (!active) {
          return;
        }

        setOrder(orderData);

        if (stripePromise) {
          try {
            const intentResponse = await paymentsAPI.createPaymentIntent(orderId);
            if (!active) {
              return;
            }
            setClientSecret(getPayload(intentResponse).client_secret);
            setMessage(getMessage(intentResponse));
          } catch (requestError) {
            if (!active) {
              return;
            }
            setStripeWarning(
              getErrorMessage(
                requestError,
                "Stripe could not be prepared, but the demo payment flow is still available."
              )
            );
          }
        }
      } catch (requestError) {
        if (!active) {
          return;
        }
        const nextError = getErrorMessage(requestError, "Unable to prepare payment.");
        setError(nextError);
        addToast(nextError, "error");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    preparePayment();

    return () => {
      active = false;
    };
  }, [addToast, checkoutDraft.addressId, checkoutDraft.customerNote, checkoutDraft.orderId, checkoutDraft.promoCode, checkoutDraft.shippingMethod, navigate, setCheckoutDraft]);

  const handleDemoPayment = async () => {
    if (!order) {
      return;
    }

    setDemoLoading(true);
    try {
      const response = await paymentsAPI.simulatePaymentSuccess(order.id);
      addToast(getMessage(response) || "Demo payment completed.", "success");
      navigate(`/checkout/success?order=${order.id}`);
    } catch (requestError) {
      addToast(getErrorMessage(requestError, "Unable to simulate payment."), "error");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <CheckoutLayout
      currentStep="payment"
      title="Payment"
      subtitle="Use the demo payment simulator to send an invoice email and complete checkout, or keep the live Stripe path when keys are configured."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {loading ? (
            <div className="drac-panel flex min-h-[280px] items-center justify-center p-6">
              <Spinner size="lg" className="text-drac-gold" />
            </div>
          ) : null}

          {error ? (
            <div className="drac-panel border-drac-red/40 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-drac-red" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-red">
                    Payment Setup Failed
                  </p>
                  <p className="mt-2 text-sm leading-7 text-drac-muted">{error}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/checkout/method")}>
                  Back to Method
                </Button>
                <Button type="button" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : null}

          {!loading && !error && order ? (
            <>
              <div className="drac-panel p-6">
                <p className="section-kicker">Order Ready</p>
                <h2 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-text">
                  Order {order.order_number}
                </h2>
                {message ? <p className="mt-3 text-sm text-drac-muted">{message}</p> : null}
              </div>

              <div className="drac-panel p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full border border-drac-green/30 bg-drac-green/10 p-3 text-drac-green">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="section-kicker">Demo Payment Simulation</p>
                    <h3 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-gold">
                      Continue Payment
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-drac-muted">
                      This simulates a successful payment, marks the order as paid, and sends an
                      invoice-style email using your configured no-reply sender.
                    </p>
                    <div className="mt-5 rounded-2xl border border-drac-border bg-drac-surface2 p-4">
                      <div className="flex items-center gap-3 text-sm text-drac-text">
                        <Mail className="h-4 w-4 text-drac-gold" />
                        Invoice recipient: {user?.email || "your account email"}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm text-drac-text">
                        <ShieldCheck className="h-4 w-4 text-drac-gold" />
                        Sender uses `DEFAULT_FROM_EMAIL` from your backend email config
                      </div>
                    </div>
                    <Button
                      type="button"
                      loading={demoLoading}
                      className="mt-6"
                      onClick={handleDemoPayment}
                    >
                      Continue Payment
                    </Button>
                  </div>
                </div>
              </div>

              {stripeWarning ? (
                <div className="drac-panel border-drac-gold/30 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-gold">
                    Live Stripe Unavailable
                  </p>
                  <p className="mt-2 text-sm leading-7 text-drac-muted">
                    {stripeWarning}
                  </p>
                </div>
              ) : null}

              {clientSecret && stripePromise ? (
                <div className="drac-panel p-6">
                  <p className="section-kicker">Optional Live Stripe</p>
                  <h3 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-text">
                    Card Payment
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-drac-muted">
                    Keep this if you want to test the real card flow too.
                  </p>
                  <div className="mt-5">
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "night",
                          variables: {
                            colorPrimary: "#F5C842",
                            colorBackground: "#162032",
                            colorText: "#F0F4F8",
                            colorDanger: "#E63946",
                          },
                        },
                      }}
                    >
                      <StripePaymentForm orderId={order.id} />
                    </Elements>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="drac-panel h-fit p-6">
          <p className="section-kicker">Order Summary</p>
          <div className="mt-5 space-y-3 text-sm text-drac-muted">
            {(order?.items ?? cart?.items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <span className="line-clamp-2">
                  {item.product_name || item.product?.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.total_price || item.line_total)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order?.shipping_cost ?? shippingAmount)}</span>
            </div>
            {order?.discount_amount ? (
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            ) : null}
          </div>
          <div className="glass-divider my-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">Total</span>
            <span className="text-2xl font-bold text-drac-gold">
              {formatCurrency(order?.total ?? Number(cart?.subtotal ?? 0) + shippingAmount)}
            </span>
          </div>
          <Button type="button" variant="outline" fullWidth className="mt-6" onClick={() => navigate("/checkout/method")}>
            Back
          </Button>
        </div>
      </div>
    </CheckoutLayout>
  );
}
