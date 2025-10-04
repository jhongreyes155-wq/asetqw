import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LabStatus = "draft" | "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: LabStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-status-draft/10 text-status-draft border-status-draft/20",
  },
  pending: {
    label: "Pending Review",
    className: "bg-status-pending/10 text-status-pending border-status-pending/20",
  },
  approved: {
    label: "Approved",
    className: "bg-status-approved/10 text-status-approved border-status-approved/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-status-rejected/10 text-status-rejected border-status-rejected/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
