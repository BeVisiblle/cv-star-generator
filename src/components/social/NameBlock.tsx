import { ReactNode } from 'react';

interface NameBlockProps {
  children?: ReactNode;
  displayName?: string;
  subline?: string;
  userId?: string;
}

export function NameBlock({ children, displayName, subline }: NameBlockProps) {
  return (
    <div>
      {displayName && <div className="font-medium">{displayName}</div>}
      {subline && <div className="text-sm text-muted-foreground">{subline}</div>}
      {children}
    </div>
  );
}

export default NameBlock;
