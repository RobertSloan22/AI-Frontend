export {};

declare global {
  interface Window {
    electron: {
      getEnv(key: string): Promise<string>;
      // Add other electron methods as needed
    };
  }
} 