import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { cartAPI } from "../../api/cart";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import PageWrapper from "../../components/layout/PageWrapper";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const PLACEHOLDER = "https://placehold.co/80x112?text=Card";

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    cartAPI.getCart()
      .then(({ data }) => setCart(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(itemId);
    try {
      const { data } = await cartAPI.updateItem(itemId, newQty);
      setCart(data.data);
    } catch (err) {
      addToast(err.response?.data?.message ?? "Update failed.", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId, productName) => {
    setUpdating(itemId);
    try {
      const { data } = await cartAPI.removeItem(itemId);
      setCart(data.data);
      addToast(`${productName} removed from cart.`, "success");
    } catch {
      addToast("Failed to remove item.", "error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <PageWrapper>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </PageWrapper>
  );

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);

  if (items.length === 0) return (
    <PageWrapper>
      <div className="card p-16 text-center max-w-md mx-auto mt-8">
        <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Browse our collection and add some cards!
        </p>
        <Link to="/products" className="btn-primary">Browse Cards</Link>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-primary-700 mb-6">
        Shopping Cart
        <span className="text-base font-normal text-gray-500 ml-2">
          ({cart.total_items} items)
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img
                src={item.product.image || PLACEHOLDER}
                alt={item.product.name}
                className="w-16 h-20 sm:w-20 sm:h-28 object-contain rounded-lg
                  bg-gray-50 flex-shrink-0"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`}
                  className="font-semibold text-gray-800 hover:text-accent-500
                    line-clamp-2 text-sm sm:text-base transition-colors">
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.product.set_name} · {item.product.condition}
                </p>
                <p className="text-base font-bold text-primary-700 mt-1">
                  ₱{Number(item.product.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity control */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                      className="px-3 py-1.5 hover:bg-gray-100 text-gray-600
                        disabled:opacity-40 transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold min-w-8 text-center">
                      {updating === item.id ? "..." : item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock || updating === item.id}
                      className="px-3 py-1.5 hover:bg-gray-100 text-gray-600
                        disabled:opacity-40 transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">
                      ₱{Number(item.line_total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id, item.product.name)}
                      disabled={updating === item.id}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.total_items} items)</span>
                <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-800">
                <span>Total</span>
                <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <Link to="/checkout/shipping" className="btn-primary w-full text-center
              mt-5 block py-3 text-sm font-semibold rounded-lg">
              Proceed to Checkout →
            </Link>
            <Link to="/products"
              className="block text-center text-sm text-gray-500
                hover:text-primary-700 mt-3 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}