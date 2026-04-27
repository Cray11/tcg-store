import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/ui/Toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProductListPage from "./pages/products/ProductListPage";
import CartPage from "./pages/cart/CartPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductListPage />} />

            {/* Protected */}
            <Route path="/cart" element={
              <ProtectedRoute><CartPage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}