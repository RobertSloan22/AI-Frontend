import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('close-notes-window'),
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  exportNotes: () => ipcRenderer.invoke('export-notes'),
}); 