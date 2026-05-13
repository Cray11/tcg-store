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

const PUBLIC_ROUTES = [
  { path: "/", component: HomePage },
  { path: "/products", component: ProductListPage },
  { path: "/products/:slug", component: ProductDetailPage },
  { path: "/search", component: SearchResultsPage },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/forgot-password", component: ForgotPasswordPage },
  { path: "/reset-password/:uid/:token", component: ResetPasswordPage },
  { path: "/verify-email", component: VerifyEmailPage },
  { path: "/cart", component: CartPage },
  { path: "/500", component: ServerErrorPage },
  { path: "*", component: NotFoundPage },
];

const PROTECTED_ROUTES = [
  { path: "/checkout/shipping", component: ShippingPage },
  { path: "/checkout/method", component: ShippingMethodPage },
  { path: "/checkout/payment", component: PaymentPage },
  { path: "/checkout/success", component: OrderSuccessPage },
  { path: "/account", component: AccountDashboardPage },
  { path: "/account/profile", component: ProfilePage },
  { path: "/account/addresses", component: AddressBookPage },
  { path: "/account/orders", component: OrderHistoryPage },
  { path: "/account/orders/:id", component: OrderDetailPage },
  { path: "/account/password", component: ChangePasswordPage },
];

const ROUTE_TRANSITION = { duration: 0.2 };

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const { accessToken, hasHydrated, updateUser, logout } = useAuthStore();
  const { setCart, clearCart } = useCartStore();
  const { setPageLoading } = useUIStore();

  useEffect(() => {
    if (!hasHydrated) {
      return undefined;
    }

    let active = true;

    async function bootstrapSession() {
      const showLoader = Boolean(accessToken);

      if (showLoader) {
        setPageLoading(true);
      } else {
        setPageLoading(false);
      }
      try {
        if (!accessToken) {
          updateUser(null);

          try {
            const cartResponse = await cartAPI.getCart();
            if (!active) {
              return;
            }
            setCart(getPayload(cartResponse));
          } catch {
            if (active) {
              clearCart();
            }
          }
          return;
        }

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
        } else {
          clearCart();
        }
      } finally {
        if (active && showLoader) {
          setPageLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      active = false;
    };
  }, [accessToken, clearCart, hasHydrated, logout, setCart, setPageLoading, updateUser]);

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
              transition={ROUTE_TRANSITION}
            >
              <Routes location={location}>
                {PUBLIC_ROUTES.map(({ path, component: Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                {PROTECTED_ROUTES.map(({ path, component: Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute>
                        <Component />
                      </ProtectedRoute>
                    }
                  />
                ))}
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
