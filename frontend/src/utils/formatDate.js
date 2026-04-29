export function formatDate(value, options = {}) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(new Date(value));
}
