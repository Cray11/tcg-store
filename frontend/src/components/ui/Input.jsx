export default function Input({
  label, name, type = "text", placeholder,
  register, error, required = false, className = "",
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name}
          className="text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`input-field ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
        {...(register ? register(name) : {})}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}