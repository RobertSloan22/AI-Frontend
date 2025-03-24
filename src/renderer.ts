interface ElectronAPI {
    env: {
        VITE_API_URL: string;
        VITE_OPENAI_API_KEY: string;
    }
}

declare global {
    interface Window {
        elizaAPI: {
            sendMessage: (agentId: string, message: any) => Promise<any>;
            checkServerStatus: () => Promise<boolean>;
        };
        openai: {
            createChatCompletion: (model: string, messages: any[]) => Promise<any>;
            createSession: () => Promise<any>;
        };
        electron: {
            readonly env: {
                readonly VITE_API_URL: string;
                readonly VITE_OPENAI_API_KEY: string;
            }
        };
    }
}

export const API_BASE_URL = window.electron?.env?.VITE_API_URL || 'http://localhost:3500';

export const sendMessage = async (message: string) => {
    try {
        const response = await window.elizaAPI.sendMessage('default', { content: message });
        return response;
    } catch (error) {
        console.error('Error communicating with Eliza server:', error);
        throw error;
    }
};

export const checkServerStatus = async () => {
    try {
        return await window.elizaAPI.checkServerStatus();
    } catch (error) {
        console.error('Error checking server status:', error);
        return false;
    }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
    const baseUrl = API_BASE_URL;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Example us