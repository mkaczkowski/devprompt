import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
  compileNamespace: 'es',
};

export default config;
