/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: import('vite/types/hot.d.ts').ViteHotContext;
}
