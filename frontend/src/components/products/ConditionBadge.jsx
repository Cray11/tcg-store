const styles = {
  NM:  "bg-green-100 text-green-800",
  LP:  "bg-lime-100 text-lime-800",
  MP:  "bg-yellow-100 text-yellow-800",
  HP:  "bg-orange-100 text-orange-800",
  DMG: "bg-red-100 text-red-800",
};

export default function ConditionBadge({ condition }) {
  return (
    <span className={`badge ${styles[condition] ?? "bg-gray-100 text-gray-600"}`}>
      {condition}
    </span>
  );
}