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
      className: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
      icon: Clock,
    },
    published: {
      label: "Aktiv",
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      icon: CheckCircle2,
    },
    paused: {
      label: "Pausiert",
      className: "bg-purple-500 hover:bg-purple-600 text-white border-purple-500",
      icon: Pause,
    },
    inactive: {
      label: "Archiviert",
      className: "bg-gray-900 hover:bg-gray-800 text-white border-gray-900",
      icon: XCircle,
    },
  };

  const { label, className: statusClassName, icon: Icon } = config[status] || config.draft;

  return (
    <Badge className={`${statusClassName} ${className || ''}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
