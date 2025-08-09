import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Capitalization helpers
export function capitalizeFirst(value: string) {
  if (!value) return value;
  return value.replace(/^\s*([a-zäöüß])/iu, (m, p1) => m.replace(p1, p1.toUpperCase()));
}

export function capitalizeWords(value: string) {
  if (!value) return value;
  return value.replace(/\b([a-zäöüß])/giu, (m) => m.toUpperCase());
}

export function capitalizeSentences(value: string) {
  if (!value) return value;
  return value.replace(/(^\s*[a-zäöüß])|([.!?]\s+[a-zäöüß])/giu, (match) => match.toUpperCase());
}
