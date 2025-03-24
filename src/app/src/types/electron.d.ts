export interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
}

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
      env?: NodeJS.ProcessEnv;
    };
  }
} 