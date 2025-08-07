import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  children: React.ReactElement;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error, children, className }) => {
  return (
    <div className={cn("space-y-1", className)}>
      {React.cloneElement(children, {
        className: cn(
          children.props.className,
          error ? "border-destructive focus:border-destructive ring-destructive" : ""
        )
      })}
      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
};