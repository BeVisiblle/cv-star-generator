import { Database } from "@/integrations/supabase/types";

export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type ApplicationSource = Database["public"]["Enums"]["application_source"];

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  new: {
    label: "Neu",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: "⭐",
  },
  unlocked: {
    label: "Freigeschaltet",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: "🔓",
  },
  interview: {
    label: "Im Gespräch",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    icon: "💬",
  },
  offer: {
    label: "Angebot gemacht",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    icon: "📄",
  },
  hired: {
    label: "Eingestellt",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    icon: "✅",
  },
  rejected: {
    label: "Abgelehnt",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: "❌",
  },
  archived: {
    label: "Archiviert",
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950",
    icon: "📦",
  },
};

export const APPLICATION_SOURCE_CONFIG: Record<ApplicationSource, StatusConfig> = {
  applied: {
    label: "Beworben",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: "📬",
  },
  sourced: {
    label: "Gesourced",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    icon: "🔍",
  },
};

export function getStatusConfig(status: ApplicationStatus): StatusConfig {
  return APPLICATION_STATUS_CONFIG[status];
}

export function getSourceConfig(source: ApplicationSource): StatusConfig {
  return APPLICATION_SOURCE_CONFIG[source];
}

export const STATUS_WORKFLOW: ApplicationStatus[] = [
  "new",
  "unlocked",
  "interview",
  "offer",
  "hired",
];

export const REJECTION_REASONS = [
  { value: "not_qualified", label: "Nicht qualifiziert" },
  { value: "overqualified", label: "Überqualifiziert" },
  { value: "position_filled", label: "Stelle besetzt" },
  { value: "salary_mismatch", label: "Gehaltsvorstellungen passen nicht" },
  { value: "location_mismatch", label: "Standort passt nicht" },
  { value: "other", label: "Sonstiges" },
];
