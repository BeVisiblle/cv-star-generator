'use client';
import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  size?: number;
  className?: string;
  'data-testid'?: string;
};

export function BrandMark({ size = 32, className, 'data-testid': tid = 'brand-logomark' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      data-testid={tid}
      aria-hidden
      role="img"
    >
      {/* Minimaler, neutraler Logomark (anpassbar) */}
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#g)" />
      <path d="M9 21h14M9 16h10M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}