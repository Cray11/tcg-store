import { useEffect, useState } from "react";
import { authAPI } from "../../api/auth";
import AccountShell from "../../components/account/AccountShell";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const response = await authAPI.getProfile();
      const profile = getPayload(response);
      if (active) {
        setForm({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
        });
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const bind = (field) => () => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      const updated = getPayload(response);
      updateUser(updated);
      addToast("Profile updated.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update profile."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell
      title="Profile Settings"
      description="Update your core account info and keep order communications accurate."
    >
      <div className="drac-panel p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First Name" name="first_name" register={bind("first_name")} />
            <Input label="Last Name" name="last_name" register={bind("last_name")} />
          </div>
          <Input label="Email" name="email" value={form.email} disabled />
          <Input label="Phone" name="phone" register={bind("phone")} />
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </form>
      </div>
    </AccountShell>
  );
}
