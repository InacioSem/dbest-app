import { Request, Response, NextFunction } from 'express';
import type { Locale } from '../../shared/types';
import { LOCALES, DEFAULT_LOCALE } from '../../shared/types';

export interface LocaleRequest extends Request {
  locale?: Locale;
}

function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * Locale detection middleware.
 * Priority order:
 *   1. Query parameter ?locale=
 *   2. Accept-Language header
 *   3. Default locale (en)
 */
export async function localeMiddleware(
  req: LocaleRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // 1. Check query parameter
  const queryLocale = req.query.locale as string | undefined;
  if (queryLocale && isValidLocale(queryLocale)) {
    req.locale = queryLocale;
    next();
    return;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    // Parse Accept-Language: "fr-FR,fr;q=0.9,en;q=0.8,ht;q=0.7"
    const languages = acceptLanguage
      .split(',')
      .map((part) => {
        const [lang, qPart] = part.trim().split(';');
        const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1.0;
        // Extract primary language code (e.g., "fr-FR" -> "fr")
        const primaryLang = lang.split('-')[0].toLowerCase();
        return { lang: primaryLang, q };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of languages) {
      if (isValidLocale(lang)) {
        req.locale = lang;
        next();
        return;
      }
    }
  }

  // 3. Default locale
  req.locale = DEFAULT_LOCALE;
  next();
}
