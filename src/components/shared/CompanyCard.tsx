import type { CompanyBase } from '@/types/company';

interface CompanyCardProps {
  company: CompanyBase;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * Standardized company card component for lists and grids
 * @param company - Company data to display
 * @param subtitle - Optional subtitle text (location, industry, etc.)
 * @param action - Optional action button or component
 * @param onClick - Click handler for card
 * @param href - Optional link href (creates anchor wrapper)
 * @param className - Additional CSS classes
 */
export function CompanyCard({ 
  company, 
  subtitle, 
  action, 
  onClick, 
  href, 
  className = '' 
}: CompanyCardProps) {
  const cardContent = (
    <div className={`flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex min-w-0 items-center gap-3 flex-1">
        <img 
          src={company.logo_url || '/placeholder.svg'} 
          alt={company.name}
          className="h-10 w-10 rounded-md bg-muted object-cover flex-shrink-0" 
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{company.name}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}

/**
 * Utility function to format company subtitle
 */
export function formatCompanySubtitle(company: CompanyBase): string {
  const parts = [
    company.main_location || '—',
    company.industry || '—',
    company.employee_count ? `${company.employee_count} MA` : '—'
  ];
  return parts.join(' • ');
}