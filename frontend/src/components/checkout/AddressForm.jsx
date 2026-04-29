import Button from "../ui/Button";
import Input from "../ui/Input";

export default function AddressForm({
  form,
  onChange,
  onSubmit,
  submitting,
}) {
  const bind = (field) => () => ({
    value: form[field],
    onChange: (event) => onChange(field, event.target.value),
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name" name="full_name" register={bind("full_name")} required />
        <Input label="Phone" name="phone" register={bind("phone")} required />
      </div>
      <Input label="Address Line 1" name="line1" register={bind("line1")} required />
      <Input label="Address Line 2" name="line2" register={bind("line2")} />
      <div className="grid gap-4 md:grid-cols-3">
        <Input label="City" name="city" register={bind("city")} required />
        <Input label="Province" name="province" register={bind("province")} required />
        <Input label="ZIP" name="zip_code" register={bind("zip_code")} required />
      </div>
      <Button type="submit" loading={submitting} fullWidth>
        Save Address
      </Button>
    </form>
  );
}
