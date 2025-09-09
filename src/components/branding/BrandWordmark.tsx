'use client';
import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  text?: string;
  location: 'navbar' | 'sidebar';
  className?: string;
};

export default function BrandWordmark({ text = 'Ausbildungsbasis', location, className }: Props) {
  const tid = location === 'navbar' ? 'brand-wordmark-navbar' : 'brand-wordmark-sidebar';
  return (
    <span
      data-testid={tid}
      className={cn('font-semibold tracking-tight leading-none select-none',
        location === 'navbar' ? 'text-base md:text-lg' : 'text-sm',
        className)}
    >
      {text}
    </span>
  );
}