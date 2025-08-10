import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { spawn } from 'child_process';
import Store from 'electron-store';
import * as fs from 'fs/promises';
import { setupGitHubIPC } from './auth/github';
import { setupChatGPTIPC } from './auth/chatgpt';
import { setupFileManagerIPC } from './services/fileManager';

// Initialize store for persistent data
const store = new Store();

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized?: boolean;
}

class VibeEditor {
  private mainWindow: BrowserWindow | null = null;
  private terminals: Map<string, any> = new Map();

  constructor() {
    this.setupApp();
  }

  private setupApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupIpcHandlers();
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app activate (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    // Get saved window state
    const savedState = store.get('windowState') as WindowState | undefined;

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: savedState?.width || 1200,
      height: savedState?.height || 800,
      x: savedState?.x,
      y: savedState?.y,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        webSecurity: false, // Allow loading local files for development
      },
      titleBarStyle: 'default',
      show: false,
      icon: join(__dirname, '../../assets/icon.png'),
    });

    // Load the app
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      if (savedState?.isMaximized) {
        this.mainWindow?.maximize();
      }
      this.mainWindow?.show();
    });

    // Save window state on close
    this.mainWindow.on('close', () => {
      if (!this.mainWindow) return;

      const bounds = this.mainWindow.getBounds();
      const isMaximized = this.mainWindow.isMaximized();

      store.set('windowState', {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized,
      });
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New File',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.sendToRenderer('menu:new-file'),
          },
          {
            label: 'Open File',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.openFile(),
          },
          {
            label: 'Open Folder',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => this.openFolder(),
          },
          { type: 'separator' },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.sendToRenderer('menu:save'),
          },
          {
            label: 'Save As',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.sendToRenderer('menu:save-as'),
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          { type: 'separator' },
          {
            label: 'Find',
            accelerator: 'CmdOrCtrl+F',
            click: () => this.sendToRenderer('menu:find'),
          },
          {
            label: 'Replace',
            accelerator: 'CmdOrCtrl+H',
            click: () => this.sendToRenderer('menu:replace'),
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Explorer',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => this.sendToRenderer('menu:toggle-explorer'),
          },
          {
            label: 'Toggle Terminal',
            accelerator: 'CmdOrCtrl+`',
            click: () => this.sendToRenderer('menu:toggle-terminal'),
          },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
          { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
          { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
          { type: 'separator' },
          { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Terminal',
        submenu: [
          {
            label: 'New Terminal',
            accelerator: 'CmdOrCtrl+Shift+`',
            click: () => this.sendToRenderer('menu:new-terminal'),
          },
          {
            label: 'Split Terminal',
            accelerator: 'CmdOrCtrl+Shift+5',
            click: () => this.sendToRenderer('menu:split-terminal'),
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Vibe Editor',
            click: () => this.sendToRenderer('menu:about'),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Setup real working integrations
    setupGitHubIPC();
    setupChatGPTIPC();
    setupFileManagerIPC();

    // Terminal operations
    ipcMain.handle('terminal:create', (_, id: string, cwd?: string) => {
      return this.createTerminal(id, cwd);
    });

    ipcMain.handle('terminal:write', (_, id: string, data: string) => {
      const terminal = this.terminals.get(id);
      if (terminal) {
        terminal.write(data);
        return true;
      }
      return false;
    });

    ipcMain.handle('terminal:resize', (_, id: string, cols: number, rows: number) => {
      const terminal = this.terminals.get(id);
      if (terminal) {
        terminal.resize(cols, rows);
        return true;
      }
      return false;
    });

    ipcMain.handle('terminal:destroy', (_, id: string) => {
      const terminal = this.terminals.get(id);
      if (terminal) {
        terminal.kill();
        this.terminals.delete(id);
        return true;
      }
      return false;
    });

    // Store operations
    ipcMain.handle('store:get', (_, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store:set', (_, key: string, value: any) => {
      store.set(key, value);
    });

    ipcMain.handle('store:delete', (_, key: string) => {
      store.delete(key);
    });

    // External links
    ipcMain.handle('open-external', (_, url: string) => {
      shell.openExternal(url);
    });
  }

  private createTerminal(id: string, cwd?: string) {
    try {
      // Simple process spawn for cross-platform compatibility
      const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
      const terminal = spawn(shell, [], {
        cwd: cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      terminal.stdout?.on('data', (data) => {
        this.mainWindow?.webContents.send('terminal:data', { id, data: data.toString() });
      });

      terminal.stderr?.on('data', (data) => {
        this.mainWindow?.webContents.send('terminal:data', { id, data: data.toString() });
      });

      terminal.on('exit', () => {
        this.mainWindow?.webContents.send('terminal:exit', { id });
        this.terminals.delete(id);
      });

      this.terminals.set(id, {
        process: terminal,
        write: (data: string) => terminal.stdin?.write(data),
        resize: () => {}, // Not implemented for simple spawn
        kill: () => terminal.kill(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async openFile(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'h'] },
      ],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.sendToRenderer('file:open', result.filePaths[0]);
    }
  }

  private async openFolder(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.sendToRenderer('folder:open', result.filePaths[0]);
    }
  }

  private sendToRenderer(channel: string, data?: any): void {
    this.mainWindow?.webContents.send(channel, data);
  }
}

// Create and start the application
new VibeEditor();
