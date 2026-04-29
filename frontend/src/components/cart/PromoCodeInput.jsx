import Button from "../ui/Button";
import Input from "../ui/Input";

export default function PromoCodeInput({
  promoCode,
  onChange,
  onApply,
  helperText,
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Input
          name="promo_code"
          placeholder="Promo code"
          value={promoCode}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={onApply}>
          Apply
        </Button>
      </div>
      {helperText ? <p className="text-xs text-drac-muted">{helperText}</p> : null}
    </div>
  );
}
