import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Pause, XCircle } from "lucide-react";

type JobStatus = "draft" | "published" | "paused" | "inactive";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = {
    draft: {
      label: "Entwurf",
      variant: "secondary" as const,
      icon: Clock,
    },
    published: {
      label: "Veröffentlicht",
      variant: "default" as const,
      icon: CheckCircle2,
    },
    paused: {
      label: "Pausiert",
      variant: "outline" as const,
      icon: Pause,
    },
    inactive: {
      label: "Archiviert",
      variant: "destructive" as const,
      icon: XCircle,
    },
  };

  const { label, variant, icon: Icon } = config[status] || config.draft;

  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
