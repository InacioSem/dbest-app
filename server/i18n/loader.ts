import type { Locale } from '../../shared/types';
import { DEFAULT_LOCALE } from '../../shared/types';

import en from './en.json';
import fr from './fr.json';
import ht from './ht.json';
import es from './es.json';

type TranslationData = Record<string, unknown>;

const translations: Record<Locale, TranslationData> = {
  en: en as TranslationData,
  fr: fr as TranslationData,
  ht: ht as TranslationData,
  es: es as TranslationData,
};

/**
 * Get a translated string by dot-notation key.
 * Falls back to English if the key is not found in the requested locale.
 */
export function getTranslation(locale: Locale | string, key: string): string {
  const safeLocale = (locale in translations ? locale : DEFAULT_LOCALE) as Locale;
  const parts = key.split('.');

  let value: unknown = translations[safeLocale];
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      // Fall back to English
      value = undefined;
      break;
    }
  }

  if (typeof value === 'string') {
    return value;
  }

  // Fallback to English
  if (safeLocale !== DEFAULT_LOCALE) {
    return getTranslation(DEFAULT_LOCALE, key);
  }

  // If even English doesn't have it, return the key itself
  return key;
}
