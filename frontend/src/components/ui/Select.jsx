import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Select({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <label htmlFor={name} className="field-label">{label}</label> : null}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={cn("input-field appearance-none pr-10", className)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drac-muted" />
      </div>
    </div>
  );
}
