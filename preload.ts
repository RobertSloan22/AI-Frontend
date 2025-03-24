
    const { contextBridge, ipcRenderer } = require('electron');

    contextBridge.exposeInMainWorld('elizaAPI', {
        sendMessage: async (agentId, message) => 
            ipcRenderer.invoke('eliza-send-message', { agentId, message }),
        checkServerStatus: async () => 
            ipcRenderer.invoke('eliza-check-server'),
    });

    contextBridge.exposeInMainWorld('microphone', {
        checkPermission: () => ipcRenderer.invoke('check-microphone-permission'),
        requestPermission: () => ipcRenderer.invoke('request-microphone-permission'),
    });

    contextBridge.exposeInMainWorld('electron', {
        env: process.env
    });
