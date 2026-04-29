import { useEffect, useState } from "react";
import { authAPI } from "../../api/auth";
import AccountShell from "../../components/account/AccountShell";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useUIStore } from "../../store/uiStore";
import { getErrorMessage, getPayload } from "../../utils/api";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  zip_code: "",
  country: "Philippines",
  is_default: false,
};

export default function AddressBookPage() {
  const { addToast } = useUIStore();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    const response = await authAPI.getAddresses();
    setAddresses(getPayload(response) ?? []);
  };

  useEffect(() => {
    let active = true;

    authAPI.getAddresses().then((response) => {
      if (active) {
        setAddresses(getPayload(response) ?? []);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const bind = (field) => () => ({
    value: form[field],
    onChange: (event) => {
      const nextValue = field === "is_default" ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: nextValue }));
    },
  });

  const openCreate = () => {
    setEditingId("");
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditingId(address.id);
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      province: address.province,
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await authAPI.updateAddress(editingId, form);
      } else {
        await authAPI.createAddress(form);
      }
      await loadAddresses();
      setModalOpen(false);
      addToast(`Address ${editingId ? "updated" : "created"}.`, "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to save address."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await authAPI.deleteAddress(id);
      await loadAddresses();
      addToast("Address deleted.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to delete address."), "error");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await authAPI.setDefaultAddress(id);
      await loadAddresses();
      addToast("Default address updated.", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "Unable to update default address."), "error");
    }
  };

  return (
    <AccountShell
      title="Address Book"
      description="Manage saved delivery addresses and choose which one leads your checkout flow."
    >
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add New Address
        </Button>
      </div>

      {!addresses.length ? (
        <EmptyState
          title="No addresses yet"
          description="Add your first shipping address so checkout can move fast."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="drac-panel p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-drac-text">{address.full_name}</p>
                    {address.is_default ? (
                      <span className="badge border-drac-gold/40 bg-drac-gold/15 text-drac-gold">Default</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-drac-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    <br />
                    {address.city}, {address.province} {address.zip_code}
                    <br />
                    {address.country}
                  </p>
                  {address.phone ? <p className="mt-2 text-sm text-drac-muted">{address.phone}</p> : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => openEdit(address)}>
                  Edit
                </Button>
                {!address.is_default ? (
                  <Button type="button" variant="ghost" onClick={() => handleSetDefault(address.id)}>
                    Set as Default
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={() => handleDelete(address.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? "Edit Address" : "Add Address"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="full_name" register={bind("full_name")} required />
          <Input label="Phone" name="phone" register={bind("phone")} />
          <Input label="Address Line 1" name="line1" register={bind("line1")} required />
          <Input label="Address Line 2" name="line2" register={bind("line2")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="City" name="city" register={bind("city")} required />
            <Input label="Province" name="province" register={bind("province")} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="ZIP Code" name="zip_code" register={bind("zip_code")} required />
            <Input label="Country" name="country" register={bind("country")} required />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-drac-border bg-drac-surface2 px-4 py-3 text-sm text-drac-text">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))}
            />
            Make this my default address
          </label>
          <Button type="submit" loading={saving} fullWidth>
            {editingId ? "Save Address" : "Create Address"}
          </Button>
        </form>
      </Modal>
    </AccountShell>
  );
}
