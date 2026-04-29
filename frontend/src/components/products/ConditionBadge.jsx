import Badge from "../ui/Badge";

const styles = {
  NM: "border-[#1D9E75]/50 bg-[#1D9E75]/20 text-[#E1F5EE]",
  LP: "border-[#639922]/50 bg-[#639922]/20 text-[#EAF3DE]",
  MP: "border-[#BA7517]/50 bg-[#BA7517]/20 text-[#FAEEDA]",
  HP: "border-[#D85A30]/50 bg-[#D85A30]/20 text-[#FAECE7]",
  DMG: "border-[#A32D2D]/50 bg-[#A32D2D]/20 text-[#FCEBEB]",
};

export default function ConditionBadge({ condition }) {
  return (
    <Badge className={styles[condition] ?? "bg-drac-surface2 text-drac-muted"}>
      {condition}
    </Badge>
  );
}
