import de from './de.json';

export type Locale = 'de';

export const locales: Locale[] = ['de'];

export const defaultLocale: Locale = 'de';

export const translations = {
  de,
} as const;

export type TranslationKeys = typeof de;

export function getTranslation(key: string, locale: Locale = defaultLocale): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export function t(key: string, params?: Record<string, string | number>, locale: Locale = defaultLocale): string {
  let translation = getTranslation(key, locale);
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value));
    });
  }
  
  return translation;
}

export function useTranslation(locale: Locale = defaultLocale) {
  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, params, locale),
    locale,
  };
}
