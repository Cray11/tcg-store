import Badge from "../ui/Badge";

const STATUS_STYLES = {
  PENDING: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  PROCESSING: "border-sky-400/40 bg-sky-400/15 text-sky-200",
  SHIPPED: "border-violet-400/40 bg-violet-400/15 text-violet-200",
  DELIVERED: "border-drac-green/40 bg-drac-green/15 text-[#d8fff2]",
  CANCELLED: "border-drac-red/40 bg-drac-red/15 text-[#ffd6da]",
  REFUNDED: "border-slate-400/40 bg-slate-500/15 text-slate-200",
};

export default function OrderStatusBadge({ status }) {
  return (
    <Badge className={STATUS_STYLES[status] ?? "bg-drac-surface2 text-drac-muted"}>
      {status}
    </Badge>
  );
}
