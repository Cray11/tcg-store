export const PLACEHOLDER_IMAGE =
  "https://placehold.co/480x640/162032/F0F4F8?text=DracNest";

export const CONDITIONS = [
  { value: "NM", label: "Near Mint" },
  { value: "LP", label: "Lightly Played" },
  { value: "MP", label: "Moderately Played" },
  { value: "HP", label: "Heavily Played" },
  { value: "DMG", label: "Damaged" },
];

export const RARITIES = [
  { value: "COMMON", label: "Common" },
  { value: "UNCOMMON", label: "Uncommon" },
  { value: "RARE", label: "Rare" },
  { value: "RARE_HOLO", label: "Rare Holo" },
  { value: "ULTRA_RARE", label: "Ultra Rare" },
  { value: "SECRET_RARE", label: "Secret Rare" },
  { value: "FULL_ART", label: "Full Art" },
  { value: "PROMO", label: "Promo" },
];

export const PRODUCT_TYPES = [
  { value: "SINGLE", label: "Single" },
  { value: "PACK", label: "Pack" },
  { value: "BOX", label: "Box" },
  { value: "BUNDLE", label: "Bundle" },
  { value: "TIN", label: "Tin" },
];

export const LANGUAGES = ["English", "Japanese", "Korean"];

export const SORT_OPTIONS = [
  { label: "Newest", value: "-created_at" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Name A-Z", value: "name" },
];

export const SHIPPING_OPTIONS = [
  {
    value: "STANDARD",
    label: "Standard Shipping",
    description: "3-5 days",
    amount: 99,
  },
  {
    value: "EXPRESS",
    label: "Express Shipping",
    description: "1-2 days",
    amount: 199,
  },
];

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];
