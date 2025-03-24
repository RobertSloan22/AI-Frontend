interface ImportMetaEnv {
    VITE_OPENAI_API_KEY: string;
    // Add other env variables as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  interface NoteEntry {
    id?: string;
    timestamp: string;
    topic: string;
    tags: string[];
    keyPoints: string[];
    codeExamples?: {
      language: string;
      code: string;
    }[];
    resources?: string[];
  }