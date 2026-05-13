import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../api/orders";
import { paymentsAPI } from "../../api/payments";
import { cartAPI } from "../../api/cart";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload, getMessage } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";
import CheckoutLayout from "./CheckoutLayout";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { SHIPPING_OPTIONS } from "../../utils/constants";
import { useAuthStore } from "../../store/authStore";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const { checkoutDraft, setCheckoutDraft, addToast } = useUIStore();
  const [order, setOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

        const prepareResponse = await paymentsAPI.prepareDemoPayment(orderId);
        if (!active) {
          return;
        }

        setPaymentDetails(getPayload(prepareResponse));
        setMessage(getMessage(prepareResponse));
      } catch (requestError) {
        if (!active) {
          return;
        }
        const nextError = getErrorMessage(requestError, "Unable to prepare demo checkout.");
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
      const response = await paymentsAPI.completeDemoPayment(order.id);
      try {
        const cartResponse = await cartAPI.getCart();
        setCart(getPayload(cartResponse));
      } catch {
        // Leave the current cart state alone if the refresh fails.
      }
      addToast(getMessage(response) || "Demo payment completed.", "success");
      navigate(`/checkout/success?order=${order.id}`);
    } catch (requestError) {
      addToast(getErrorMessage(requestError, "Unable to complete demo payment."), "error");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <CheckoutLayout
      currentStep="payment"
      title="Payment"
      subtitle="Review the prepared demo payment, send the invoice email, and complete checkout."
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
                    Demo Checkout Failed
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

              <div className="drac-panel border-drac-green/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full border border-drac-green/30 bg-drac-green/10 p-3 text-drac-green">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="section-kicker">Demo Checkout</p>
                    <h3 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-gold">
                      Complete Payment
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-drac-muted">
                      This structured demo flow reserves inventory, records a payment reference,
                      sends an invoice-style email, and advances the order into processing.
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
                      {paymentDetails ? (
                        <div className="mt-4 grid gap-3 rounded-2xl border border-drac-border/80 bg-drac-surface px-4 py-3 text-sm text-drac-muted sm:grid-cols-2">
                          <div>
                            <p className="section-kicker">Reference</p>
                            <p className="mt-2 break-all font-mono text-xs text-drac-text">
                              {paymentDetails.payment_reference}
                            </p>
                          </div>
                          <div>
                            <p className="section-kicker">Status</p>
                            <p className="mt-2 text-sm text-drac-text">{paymentDetails.status}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      loading={demoLoading}
                      className="mt-6"
                      onClick={handleDemoPayment}
                    >
                      Complete Demo Payment
                    </Button>
                  </div>
                </div>
              </div>
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
