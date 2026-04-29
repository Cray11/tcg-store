import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../../api/auth";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getMessage } from "../../utils/api";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    new_password: "",
    new_password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.resetPasswordConfirm({
        uid,
        token,
        ...form,
      });
      const nextMessage = getMessage(response) || "Password reset successfully.";
      setMessage(nextMessage);
      addToast("Password updated. Sign in with your new password.", "success");
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set New Password"
      subtitle="Lock in a fresh password for your DracNest account."
      footer={(
        <Link to="/login" className="font-semibold text-drac-gold hover:underline">
          Back to login
        </Link>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          name="new_password"
          type="password"
          placeholder="New password"
          register={() => bind("new_password")}
          required
        />
        <Input
          label="Confirm Password"
          name="new_password2"
          type="password"
          placeholder="Repeat your password"
          register={() => bind("new_password2")}
          required
        />
        {error ? (
          <div className="rounded-2xl border border-drac-red/30 bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-drac-green/30 bg-drac-green/10 px-4 py-3 text-sm text-drac-green">
            {message}
          </div>
        ) : null}
        <Button type="submit" loading={loading} fullWidth size="lg">
          Reset Password
        </Button>
      </form>
    </AuthShell>
  );
}
