import { useState } from "react";
import { authAPI } from "../../api/auth";
import AccountShell from "../../components/account/AccountShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getMessage } from "../../utils/api";

export default function ChangePasswordPage() {
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password2: "",
  });
  const [saving, setSaving] = useState(false);

  const bind = (field) => () => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.changePassword(form);
      addToast(getMessage(response) || "Password changed.", "success");
      setForm({
        current_password: "",
        new_password: "",
        new_password2: "",
      });
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to change password."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell
      title="Change Password"
      description="Refresh your account security without leaving the DracNest dashboard."
    >
      <div className="drac-panel p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Current Password" name="current_password" type="password" register={bind("current_password")} required />
          <Input label="New Password" name="new_password" type="password" register={bind("new_password")} required />
          <Input label="Confirm New Password" name="new_password2" type="password" register={bind("new_password2")} required />
          <Button type="submit" loading={saving}>
            Change Password
          </Button>
        </form>
      </div>
    </AccountShell>
  );
}
