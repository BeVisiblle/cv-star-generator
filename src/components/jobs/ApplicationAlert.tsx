import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ApplicationAlertProps {
  appliedAt?: string | null;
}

export function ApplicationAlert({ appliedAt }: ApplicationAlertProps) {
  if (!appliedAt) return null;
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Alert className="bg-green-50 border-green-200 mb-4">
      <Info className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Bewerbung eingegangen</AlertTitle>
      <AlertDescription className="text-green-700">
        Dieser Kandidat hat sich am {formatDate(appliedAt)} aktiv auf diese Stelle beworben.
      </AlertDescription>
    </Alert>
  );
}
