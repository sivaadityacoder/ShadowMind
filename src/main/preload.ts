import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('directory:read', dirPath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('file:delete', filePath),
  createDirectory: (dirPath: string) => ipcRenderer.invoke('file:create-directory', dirPath),
  listDirectory: (dirPath: string) => ipcRenderer.invoke('file:list-directory', dirPath),
  copyFile: (sourcePath: string, destPath: string) => ipcRenderer.invoke('file:copy', sourcePath, destPath),
  moveFile: (sourcePath: string, destPath: string) => ipcRenderer.invoke('file:move', sourcePath, destPath),

  // Enhanced dialog operations
  openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('file:open-folder-dialog'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('file:save-dialog', defaultPath),

  // GitHub integration
  githubAuthenticate: () => ipcRenderer.invoke('github:authenticate'),
  githubGetRepos: (accessToken: string) => ipcRenderer.invoke('github:get-repos', accessToken),
  githubCreateRepo: (accessToken: string, name: string, description?: string) => ipcRenderer.invoke('github:create-repo', accessToken, name, description),

  // ChatGPT integration with Google OAuth
  chatgptAuthenticate: () => ipcRenderer.invoke('chatgpt:authenticate'),
  chatgptIsAuthenticated: () => ipcRenderer.invoke('chatgpt:is-authenticated'),
  chatgptLogout: () => ipcRenderer.invoke('chatgpt:logout'),
  chatgptSendMessage: (messages: any[], model?: string) => ipcRenderer.invoke('chatgpt:send-message', messages, model),
  chatgptGenerateCode: (prompt: string, language: string) => ipcRenderer.invoke('chatgpt:generate-code', prompt, language),
  chatgptExplainCode: (code: string, language: string) => ipcRenderer.invoke('chatgpt:explain-code', code, language),
  chatgptReviewCode: (code: string, language: string) => ipcRenderer.invoke('chatgpt:review-code', code, language),
  chatgptOptimizeCode: (code: string, language: string) => ipcRenderer.invoke('chatgpt:optimize-code', code, language),

  // Terminal operations
  createTerminal: (id: string, cwd?: string) => ipcRenderer.invoke('terminal:create', id, cwd),
  writeToTerminal: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
  resizeTerminal: (id: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', id, cols, rows),
  destroyTerminal: (id: string) => ipcRenderer.invoke('terminal:destroy', id),

  // Store operations
  getStoreValue: (key: string) => ipcRenderer.invoke('store:get', key),
  setStoreValue: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
  deleteStoreValue: (key: string) => ipcRenderer.invoke('store:delete', key),

  // Event listeners
  onMenuAction: (callback: (event: any, action: string, data?: any) => void) => {
    const channels = [
      'menu:new-file',
      'menu:save',
      'menu:save-as',
      'menu:find',
      'menu:replace',
      'menu:toggle-explorer',
      'menu:toggle-terminal',
      'menu:new-terminal',
      'menu:split-terminal',
      'menu:about',
      'file:open',
      'folder:open',
    ];
    
    channels.forEach(channel => {
      ipcRenderer.on(channel, callback);
    });
  },

  onTerminalData: (callback: (event: any, data: { id: string; data: string }) => void) => {
    ipcRenderer.on('terminal:data', callback);
  },

  onTerminalExit: (callback: (event: any, data: { id: string }) => void) => {
    ipcRenderer.on('terminal:exit', callback);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      fileExists: (filePath: string) => Promise<boolean>;
      readDirectory: (dirPath: string) => Promise<{ success: boolean; files?: Array<{ name: string; isDirectory: boolean; path: string }>; error?: string }>;
      openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      openFolderDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      saveFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
      createTerminal: (id: string, cwd?: string) => Promise<{ success: boolean; error?: string }>;
      writeToTerminal: (id: string, data: string) => Promise<boolean>;
      resizeTerminal: (id: string, cols: number, rows: number) => Promise<boolean>;
      destroyTerminal: (id: string) => Promise<boolean>;
      getStoreValue: (key: string) => Promise<any>;
      setStoreValue: (key: string, value: any) => Promise<void>;
      deleteStoreValue: (key: string) => Promise<void>;
      onMenuAction: (callback: (event: any, action: string, data?: any) => void) => void;
      onTerminalData: (callback: (event: any, data: { id: string; data: string }) => void) => void;
      onTerminalExit: (callback: (event: any, data: { id: string }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
