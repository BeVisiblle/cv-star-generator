interface EmptyStateProps {
  text: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable empty state component for lists and cards
 * @param text - Main empty state message
 * @param icon - Optional emoji or icon to display
 * @param action - Optional action button or link
 * @param className - Additional CSS classes
 */
export function EmptyState({ text, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-xl border bg-muted/20 p-6 text-center ${className}`}>
      {icon && <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>}
      <p className="text-sm text-muted-foreground mb-3">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}