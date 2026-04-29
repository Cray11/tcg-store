import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { cartAPI } from "../../api/cart";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";
  const { setAuth } = useAuthStore();
  const { setCart } = useCartStore();
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);
      const payload = getPayload(response);
      setAuth(payload.user, payload.tokens.access, payload.tokens.refresh);

      try {
        const cartResponse = await cartAPI.getCart();
        setCart(getPayload(cartResponse));
      } catch {
        // Ignore cart bootstrap failures during login.
      }

      addToast(`Welcome back, ${payload.user.first_name || "Trainer"}!`, "success");
      navigate(from, { replace: true });
    } catch (error) {
      setError("root", { message: getErrorMessage(error, "Login failed.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Jump back into the arena and continue building your collection."
      footer={(
        <>
          New to DracNest?{" "}
          <Link to="/register" className="font-semibold text-drac-gold hover:underline">
            Create an account
          </Link>
        </>
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          register={register}
          error={errors.password}
          required
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold uppercase tracking-[0.16em] text-drac-muted hover:text-drac-gold">
            Forgot Password
          </Link>
        </div>

        {errors.root ? (
          <div className="rounded-2xl border border-drac-red/30 bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
            {errors.root.message}
          </div>
        ) : null}

        <Button type="submit" loading={loading} fullWidth size="lg">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
