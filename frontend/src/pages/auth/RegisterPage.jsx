import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { Sword } from "lucide-react";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(values);
      const { user, tokens } = data.data;
      setAuth(user, tokens.access, tokens.refresh);
      addToast("Account created! Welcome to TCG Store 🎴", "success");
      navigate("/");
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs?.email) setError("email", { message: errs.email[0] });
      else setError("root", { message: "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sword className="h-7 w-7 text-accent-500" />
              <span className="text-2xl font-bold text-primary-700">
                TCG <span className="text-accent-500">Store</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Create an account</h1>
            <p className="text-sm text-gray-500 mt-1">Join thousands of TCG players</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" name="first_name"
                placeholder="Juan" register={register}
                error={errors.first_name} required />
              <Input label="Last Name" name="last_name"
                placeholder="Dela Cruz" register={register}
                error={errors.last_name} required />
            </div>
            <Input label="Email" name="email" type="email"
              placeholder="you@example.com"
              register={register} error={errors.email} required />
            <Input label="Password" name="password" type="password"
              placeholder="Min. 8 characters"
              register={register} error={errors.password} required />
            <Input label="Confirm Password" name="password2" type="password"
              placeholder="Repeat password"
              register={register} error={errors.password2} required />

            {errors.root && (
              <p className="text-sm text-red-500 text-center bg-red-50
                rounded-lg py-2 px-3">{errors.root.message}</p>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}