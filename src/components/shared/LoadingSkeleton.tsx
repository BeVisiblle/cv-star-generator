import { Skeleton } from '@/components/ui/skeleton';

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