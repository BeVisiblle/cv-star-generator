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
    <div className={`rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-8 text-center ${className}`}>
      {icon && <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}