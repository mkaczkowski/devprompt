import { i18n } from '@lingui/core';

export const locales = {
  en: 'English',
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'en';

// Locale loaders using explicit imports for each locale
const localeLoaders: Record<Locale, () => Promise<{ messages: Record<string, string> }>> = {
  en: () => import('../locales/en/messages.mjs'),
};

/**
 * Load a locale catalog and activate it.
 */
export async function loadCatalog(locale: Locale): Promise<void> {
  const loader = localeLoaders[locale];
  if (!loader) {
    console.warn(`No loader for locale: ${locale}`);
    return;
  }
  const { messages } = await loader();
  i18n.load(locale, messages);
  i18n.activate(locale);
}

/**
 * Initialize i18n with the default locale.
 * Call this before rendering the app.
 */
export async function initI18n(): Promise<void> {
  await loadCatalog(defaultLocale);
}

export { i18n };
