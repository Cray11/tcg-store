import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
  initialValue = "",
  placeholder = "Search cards, sets, card numbers...",
  onSubmit,
  className = "",
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      className={className}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-drac-muted" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="input-field rounded-full pl-11 pr-4"
        />
      </div>
    </form>
  );
}
