import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children }) {
  const { accessToken, hasHydrated } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-drac-gold" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
