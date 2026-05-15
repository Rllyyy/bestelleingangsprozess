import { Badge } from "./ui/badge";

type OrderStatus = "new" | "under_review" | "faulty" | "submitted";

const statusStyles: Record<
  OrderStatus,
  { label: string; className: string; variant?: "default" | "secondary" | "destructive" | "outline" }
> = {
  new: { label: "New", className: "bg-blue-100 text-blue-800", variant: "secondary" },
  under_review: { label: "Under review", className: "bg-amber-100 text-amber-800", variant: "secondary" },
  faulty: { label: "Faulty", className: "bg-red-100 text-red-800", variant: "secondary" },
  submitted: { label: "Submitted", className: "bg-emerald-600 text-white", variant: "default" },
};

export default function OrderStatusBadge({ status }: { status?: string | null }) {
  if (!status || !(status in statusStyles)) return <span>—</span>;

  const { label, className, variant = "default" } = statusStyles[status as OrderStatus];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
