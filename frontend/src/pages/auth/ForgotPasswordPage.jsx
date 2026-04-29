import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/auth";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getMessage } from "../../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.resetPassword(email);
      setSuccessMessage(getMessage(response) || "Reset email requested.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Your Password"
      subtitle="Enter the email on your DracNest account and we&apos;ll trigger the reset flow."
      footer={(
        <Link to="/login" className="font-semibold text-drac-gold hover:underline">
          Back to login
        </Link>
      )}
    >
      {successMessage ? (
        <div className="rounded-3xl border border-drac-green/30 bg-drac-green/10 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-drac-green" />
          <p className="mt-4 text-sm leading-7 text-drac-text">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
