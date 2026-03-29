/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API?: string;
  readonly VITE_MOCK_AUTH_USERNAME?: string;
  readonly VITE_MOCK_AUTH_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
