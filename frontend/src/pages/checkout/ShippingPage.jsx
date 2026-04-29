import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { cartAPI } from "../../api/cart";
import AddressForm from "../../components/checkout/AddressForm";
import CheckoutLayout from "./CheckoutLayout";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  zip_code: "",
  country: "Philippines",
  is_default: false,
};

export default function ShippingPage() {
  const navigate = useNavigate();
  const { cart, setCart } = useCartStore();
  const { checkoutDraft, setCheckoutDraft, addToast } = useUIStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(checkoutDraft.addressId);
  const [customerNote, setCustomerNote] = useState(checkoutDraft.customerNote);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadShippingState() {
      try {
        const [cartResponse, addressResponse] = await Promise.all([
          cartAPI.getCart(),
          authAPI.getAddresses(),
        ]);

        if (!active) {
          return;
        }

        const nextCart = getPayload(cartResponse);
        const nextAddresses = getPayload(addressResponse) ?? [];
        setCart(nextCart);
        setAddresses(nextAddresses);

        setSelectedAddressId((current) => {
          if (current) {
            return current;
          }
          return (nextAddresses.find((address) => address.is_default) ?? nextAddresses[0])?.id ?? "";
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadShippingState();

    return () => {
      active = false;
    };
  }, [setCart]);

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      const response = await authAPI.createAddress(form);
      const nextAddress = getPayload(response);
      const nextAddresses = [...addresses, nextAddress];
      setAddresses(nextAddresses);
      setSelectedAddressId(nextAddress.id);
      setForm(EMPTY_FORM);
      setShowForm(false);
      addToast("Address added.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to save address."), "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      addToast("Select or create an address first.", "warning");
      return;
    }

    setCheckoutDraft({
      addressId: selectedAddressId,
      customerNote,
      orderId: "",
    });
    navigate("/checkout/method");
  };

  const items = cart?.items ?? [];

  if (!loading && !items.length) {
    return (
      <CheckoutLayout
        currentStep="shipping"
        title="Shipping"
        subtitle="Choose where your order lands before we move to shipping methods."
      >
        <EmptyState
          title="Your cart is empty"
          description="Add products first, then return to checkout."
          actionLabel="Browse Products"
          actionTo="/products"
        />
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout
      currentStep="shipping"
      title="Shipping"
      subtitle="Choose a saved address or create a new one for this order."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="drac-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Addresses</p>
                <h2 className="mt-2 font-heading text-3xl tracking-[0.14em] text-drac-text">
                  Select Delivery Address
                </h2>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowForm((current) => !current)}>
                {showForm ? "Hide Form" : "Add New Address"}
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`block cursor-pointer rounded-3xl border p-5 transition-colors ${
                    selectedAddressId === address.id
                      ? "border-drac-gold bg-drac-gold/10"
                      : "border-drac-border bg-drac-surface2"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-drac-text">{address.full_name}</p>
                        {address.is_default ? (
                          <span className="badge border-drac-gold/40 bg-drac-gold/15 text-drac-gold">Default</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-drac-muted">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                        <br />
                        {address.city}, {address.province} {address.zip_code}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {showForm ? (
              <div className="mt-6 rounded-3xl border border-drac-border bg-drac-surface2 p-5">
                <AddressForm
                  form={form}
                  onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={handleSaveAddress}
                  submitting={savingAddress}
                />
              </div>
            ) : null}
          </div>

          <div className="drac-panel p-6">
            <p className="section-kicker">Customer Note</p>
            <textarea
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              rows={4}
              className="input-field mt-4"
              placeholder="Add delivery notes or collector instructions..."
            />
          </div>
        </div>

        <div className="drac-panel h-fit p-6">
          <p className="section-kicker">Order Summary</p>
          <div className="mt-5 space-y-3 text-sm text-drac-muted">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <span className="line-clamp-2">
                  {item.product.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="glass-divider my-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-drac-text">Subtotal</span>
            <span className="text-xl font-bold text-drac-gold">{formatCurrency(cart?.subtotal)}</span>
          </div>
          <Button type="button" fullWidth size="lg" className="mt-6" onClick={handleContinue}>
            Continue to Method
          </Button>
        </div>
      </div>
    </CheckoutLayout>
  );
}
