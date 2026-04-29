import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageLoader from "./components/layout/PageLoader";
import ToastContainer from "./components/ui/Toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { authAPI } from "./api/auth";
import { cartAPI } from "./api/cart";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useUIStore } from "./store/uiStore";
import { getPayload } from "./utils/api";

import Spinner from "./components/ui/Spinner";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ProductListPage = lazy(() => import("./pages/products/ProductListPage"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const SearchResultsPage = lazy(() => import("./pages/products/SearchResultsPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const AccountDashboardPage = lazy(() => import("./pages/account/AccountDashboardPage"));
const ProfilePage = lazy(() => import("./pages/account/ProfilePage"));
const AddressBookPage = lazy(() => import("./pages/account/AddressBookPage"));
const OrderHistoryPage = lazy(() => import("./pages/account/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("./pages/account/OrderDetailPage"));
const ChangePasswordPage = lazy(() => import("./pages/account/ChangePasswordPage"));
const ShippingPage = lazy(() => import("./pages/checkout/ShippingPage"));
const ShippingMethodPage = lazy(() => import("./pages/checkout/ShippingMethodPage"));
const PaymentPage = lazy(() => import("./pages/checkout/PaymentPage"));
const OrderSuccessPage = lazy(() => import("./pages/checkout/OrderSuccessPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("./pages/ServerErrorPage"));

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const { accessToken, updateUser, logout } = useAuthStore();
  const { setCart, clearCart } = useCartStore();
  const { setPageLoading } = useUIStore();

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      if (!accessToken) {
        clearCart();
        return;
      }

      setPageLoading(true);
      try {
        const [profileResponse, cartResponse] = await Promise.allSettled([
          authAPI.getProfile(),
          cartAPI.getCart(),
        ]);

        if (!active) {
          return;
        }

        if (profileResponse.status === "fulfilled") {
          updateUser(getPayload(profileResponse.value));
        } else {
          logout();
        }

        if (cartResponse.status === "fulfilled") {
          setCart(getPayload(cartResponse.value));
        }
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      active = false;
    };
  }, [accessToken, clearCart, logout, setCart, setPageLoading, updateUser]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageLoader />
      <div className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + location.search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout/shipping"
                  element={
                    <ProtectedRoute>
                      <ShippingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/method"
                  element={
                    <ProtectedRoute>
                      <ShippingMethodPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/success"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressBookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/password"
                  element={
                    <ProtectedRoute>
                      <ChangePasswordPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="page-shell flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" className="text-drac-gold" />
    </div>
  );
}
