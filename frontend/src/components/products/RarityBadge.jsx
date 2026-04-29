import Badge from "../ui/Badge";
import { cn } from "../../utils/cn";
import { getRarityStyles, RARITY_LABELS } from "./rarityStyles";

export default function RarityBadge({ rarity, className = "" }) {
  if (!rarity) {
    return null;
  }

  return (
    <Badge className={cn("bg-transparent", getRarityStyles(rarity), className)}>
      {RARITY_LABELS[rarity] ?? rarity.replaceAll("_", " ")}
    </Badge>
  );
}
