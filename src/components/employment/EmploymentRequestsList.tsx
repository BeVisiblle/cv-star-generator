import { useMyEmploymentRequests } from '@/hooks/useEmployment';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function EmploymentRequestsList() {
  const { data: requests = [], isLoading } = useMyEmploymentRequests();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Noch keine Beschäftigungsanfragen</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Wartend';
      case 'accepted':
        return 'Bestätigt';
      case 'declined':
        return 'Abgelehnt';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Meine Beschäftigungsanfragen</h3>
      {requests.map((request: any) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            {request.companies?.logo_url ? (
              <img 
                src={request.companies.logo_url} 
                alt={request.companies.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="font-medium">{request.companies?.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), { 
                  addSuffix: true, 
                  locale: de 
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            <Badge variant={getStatusVariant(request.status)}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}