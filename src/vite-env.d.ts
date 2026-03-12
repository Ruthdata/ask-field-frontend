// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly NODE_ENV: "development" | "production" | "test";
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }