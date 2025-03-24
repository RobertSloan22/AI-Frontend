// API related types
export interface ImportMetaEnv {
  VITE_OPENAI_API_KEY: string;
  // Add other env variables as needed
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
} 