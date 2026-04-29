export const RARITY_STYLES = {
  COMMON: "border-[#888] text-[#d0d5db]",
  UNCOMMON: "border-[#4CAF50] text-[#8dd38f] shadow-[0_0_12px_rgba(76,175,80,0.25)]",
  RARE: "border-[#2196F3] text-[#8ec8ff] shadow-glow-blue",
  RARE_HOLO: "border-[#9C27B0] text-[#d39ef3] shadow-glow-purple",
  ULTRA_RARE:
    "rarity-ultra border-[#FF9800] text-[#ffc266] shadow-glow-orange",
  SECRET_RARE:
    "rarity-secret border-drac-gold text-drac-gold shadow-gold-sm",
  FULL_ART: "border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)]",
  PROMO: "border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
};

export const RARITY_LABELS = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  RARE_HOLO: "Rare Holo",
  ULTRA_RARE: "Ultra Rare",
  SECRET_RARE: "Secret Rare",
  FULL_ART: "Full Art",
  PROMO: "Promo",
};

export function getRarityStyles(rarity) {
  return RARITY_STYLES[rarity] ?? "border-drac-border text-drac-muted";
}
