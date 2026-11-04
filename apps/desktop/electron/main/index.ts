import { app, BrowserWindow, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { initSqliteDatabase } from '../database/sqlite';
import { registerIpcHandlers } from '../ipc/handlers';

const debugLogPath = path.join(os.tmpdir(), 'cyberlim_debug.log');
function logDebug(msg: string) {
  try {
    console.log(`[CyberLim Main] ${msg}`);
    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    /* ignore */
  }
}

logDebug('--- Electron Process Launched ---');
logDebug(`app.getAppPath: ${app ? app.getAppPath() : 'no app'}`);
logDebug(`__dirname: ${__dirname}`);

// Prevent silent crashes on uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', error);
  logDebug(`FATAL UNCAUGHT EXCEPTION: ${error.stack || error.message}`);
  try {
    dialog?.showErrorBox('Application Error', `${error.stack || error.message}`);
  } catch {
    /* ignore */
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('FATAL UNHANDLED REJECTION:', reason);
  logDebug(`FATAL UNHANDLED REJECTION: ${reason}`);
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  logDebug('createWindow() called');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'CyberLim POS',
    backgroundColor: '#FAF8F9',
    autoHideMenuBar: true,
    show: false, // Show once ready to avoid white flash
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, '../preload/index.cjs'))
        ? path.join(__dirname, '../preload/index.cjs')
        : path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    logDebug('mainWindow ready-to-show');
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Guarantee window visibility even if ready-to-show takes time
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      logDebug('Forcing show after timeout fallback');
      mainWindow.show();
      mainWindow.focus();
    }
  }, 2000);

  // Handle external links securely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logDebug(`did-fail-load: ${errorCode} ${errorDescription} ${validatedURL}`);
    dialog.showErrorBox('Page Load Failed', `Error ${errorCode}: ${errorDescription}\nURL: ${validatedURL}`);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    logDebug(`Loading dev server URL: ${process.env.VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Robust path resolution for packaged electron app (.asar)
    const candidates = [
      path.join(app.getAppPath(), 'dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
      path.join(__dirname, '../dist/index.html'),
    ];

    const targetFile = candidates.find((c) => fs.existsSync(c)) || candidates[0];
    logDebug(`targetFile chosen: ${targetFile} (exists: ${fs.existsSync(targetFile)})`);
    mainWindow.loadFile(targetFile).then(() => {
      logDebug(`loadFile success for ${targetFile}`);
    }).catch((err) => {
      logDebug(`mainWindow.loadFile failed: ${err.message}`);
      dialog.showErrorBox('File Load Error', `Could not load: ${targetFile}\n${err.message}`);
    });
  }
}

app.whenReady().then(() => {
  logDebug('app.whenReady resolved');
  // 1. Initialize SQLite Database safely
  try {
    const { raw } = initSqliteDatabase();
    registerIpcHandlers(raw);
    logDebug('SQLite and IPC registered successfully');
  } catch (err: any) {
    logDebug(`SQLite initialization error: ${err.message}`);
  }

  // 2. Create Main Window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((err) => {
  logDebug(`app.whenReady catch error: ${err.message}`);
  dialog.showErrorBox('Startup Error', String(err));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

