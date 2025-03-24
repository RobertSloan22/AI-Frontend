let notesWindow: BrowserWindow | null = null;

function createNotesWindow() {
  notesWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload/notesPreload.js')
    },
    parent: mainWindow,
    modal: true,
    show: false
  });

  notesWindow.loadURL(`file://${__dirname}/notes.html`);
  notesWindow.once('ready-to-show', () => {
    notesWindow?.show();
  });

  notesWindow.on('closed', () => {
    notesWindow = null;
  });
}

// Add these IPC handlers
ipcMain.handle('show-notes-window', () => {
  if (!notesWindow) {
    createNotesWindow();
  } else {
    notesWindow.show();
  }
});

ipcMain.on('close-notes-window', () => {
  notesWindow?.close();
});

ipcMain.handle('load-notes', async () => {
  // Use your existing notes loading logic
  return await conversationService.getNotes();
});

ipcMain.handle('export-notes', async () => {
  // Use your existing notes export logic
  return await conversationService.exportNotes();
}); 