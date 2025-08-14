import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common card styling classes
 */
export const cardClasses = {
  base: "rounded-xl border bg-card shadow-sm",
  hover: "hover:bg-muted/50 transition-colors",
  interactive: "hover:shadow-md transition-shadow cursor-pointer",
  padding: {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  }
};

/**
 * Common button group styling
 */
export const buttonGroupClasses = {
  horizontal: "flex gap-2",
  vertical: "flex flex-col gap-2",
  centered: "flex items-center justify-center gap-2"
};

/**
 * Common loading skeleton styling
 */
export const skeletonClasses = {
  avatar: "h-10 w-10 rounded-md",
  text: {
    sm: "h-3 w-32",
    md: "h-4 w-48", 
    lg: "h-5 w-64"
  },
  card: "rounded-xl border p-3"
};

/**
 * Common empty state styling  
 */
export const emptyStateClasses = {
  container: "rounded-xl border bg-muted/20 p-6 text-center",
  icon: "text-2xl mb-2",
  text: "text-sm text-muted-foreground mb-3"
};