import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

/**
 * Reusable loading skeleton for cards and lists
 * @param rows - Number of skeleton rows to show (default: 3)
 * @param showAvatar - Whether to show avatar placeholder (default: true)
 * @param className - Additional CSS classes
 */
export function LoadingSkeleton({ 
  rows = 3, 
  showAvatar = true, 
  className = '' 
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="flex items-center gap-3">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />}
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LogoSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string } = {}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}