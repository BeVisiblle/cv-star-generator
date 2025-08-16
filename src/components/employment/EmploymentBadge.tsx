import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface EmploymentBadgeProps {
  companyName: string;
  companyLogo?: string | null;
  companyId: string;
  role?: string;
  status?: 'accepted' | 'pending' | 'declined';
  size?: 'sm' | 'md' | 'lg';
  hideForJobSearch?: boolean;
}

export default function EmploymentBadge({
  companyName,
  companyLogo,
  companyId,
  role = 'Azubi',
  status = 'accepted',
  size = 'md',
  hideForJobSearch = false
}: EmploymentBadgeProps) {
  if (hideForJobSearch) return null;

  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="text-xs">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
        Warte auf Bestätigung
      </Badge>
    );
  }

  if (status === 'declined') {
    return null;
  }

  const badgeContent = (
    <div className="flex items-center gap-1.5">
      {companyLogo ? (
        <img 
          src={companyLogo} 
          alt={companyName}
          className="h-4 w-4 rounded-sm object-cover"
        />
      ) : (
        <Building2 className="h-4 w-4" />
      )}
      <span className="truncate">
        {role} bei {companyName}
      </span>
    </div>
  );

  return (
    <Badge 
      variant="outline" 
      className={`
        cursor-pointer transition-colors hover:bg-primary/5
        ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}
      `}
      onClick={() => window.location.href = `/companies/${companyId}`}
      title={`Frag nach Erfahrungen bei ${companyName}`}
    >
      {badgeContent}
    </Badge>
  );
}