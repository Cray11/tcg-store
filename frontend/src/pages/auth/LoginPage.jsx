import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { cartAPI } from "../../api/cart";
import { useUIStore } from "../../store/uiStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { Sword } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { setCart } = useCartStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(values);
      const { user, tokens } = data.data;
      setAuth(user, tokens.access, tokens.refresh);

      // Load cart after login
      try {
        const cartRes = await cartAPI.getCart();
        setCart(cartRes.data.data);
      } catch {}

      addToast(`Welcome back, ${user.first_name}!`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.errors?.detail ?? "Login failed.";
      setError("root", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sword className="h-7 w-7 text-accent-500" />
              <span className="text-2xl font-bold text-primary-700">
                TCG <span className="text-accent-500">Store</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" name="email" type="email"
              placeholder="you@example.com"
              register={register} error={errors.email} required />
            <Input label="Password" name="password" type="password"
              placeholder="••••••••"
              register={register} error={errors.password} required />

            {errors.root && (
              <p className="text-sm text-red-500 text-center bg-red-50
                rounded-lg py-2 px-3">{errors.root.message}</p>
            )}

            <div className="flex justify-end">
              <Link to="/forgot-password"
                className="text-xs text-accent-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent-500 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}