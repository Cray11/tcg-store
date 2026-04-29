import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string().min(8, "Confirm your password"),
    terms: z.boolean().refine((value) => value, {
      message: "You need to accept the terms to continue",
    }),
  })
  .refine((values) => values.password === values.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const requestBody = { ...values };
      delete requestBody.terms;

      const response = await authAPI.register(requestBody);
      const payload = getPayload(response);
      setAuth(payload.user, payload.tokens.access, payload.tokens.refresh);
      addToast("Welcome to DracNest!", "success");
      navigate("/");
    } catch (error) {
      setError("root", { message: getErrorMessage(error, "Registration failed.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Join DracNest"
      subtitle="Create your account and start hunting singles, sealed drops, and collector grails."
      footer={(
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-drac-gold hover:underline">
            Sign in
          </Link>
        </>
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            name="first_name"
            placeholder="Ash"
            register={register}
            error={errors.first_name}
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            placeholder="Ketchum"
            register={register}
            error={errors.last_name}
            required
          />
        </div>
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
          placeholder="At least 8 characters"
          register={register}
          error={errors.password}
          required
        />
        <Input
          label="Confirm Password"
          name="password2"
          type="password"
          placeholder="Repeat password"
          register={register}
          error={errors.password2}
          required
        />
        <label className="flex items-center gap-3 rounded-2xl border border-drac-border bg-drac-surface2 px-4 py-3 text-sm text-drac-text">
          <input type="checkbox" {...register("terms")} />
          I agree to DracNest&apos;s terms and collector policies.
        </label>
        {errors.terms ? <p className="text-xs text-drac-red">{errors.terms.message}</p> : null}

        {errors.root ? (
          <div className="rounded-2xl border border-drac-red/30 bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
            {errors.root.message}
          </div>
        ) : null}

        <Button type="submit" loading={loading} fullWidth size="lg">
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
