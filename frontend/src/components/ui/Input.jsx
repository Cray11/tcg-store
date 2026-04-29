import { cn } from "../../utils/cn";

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  required = false,
  className = "",
  helperText = "",
  ...rest
}) {
  const fieldProps = register ? register(name) : {};

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={name} className="field-label">
          {label}
          {required ? <span className="ml-1 text-drac-red">*</span> : null}
        </label>
      ) : null}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "input-field",
          error && "border-drac-red focus:border-drac-red focus:ring-drac-red/25",
          className
        )}
        {...fieldProps}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-drac-red">{error.message}</p>
      ) : helperText ? (
        <p className="text-xs text-drac-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
