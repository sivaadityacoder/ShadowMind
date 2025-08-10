/// <reference types="electron" />

declare global {
  interface Window {
    electronAPI: {
      // File operations
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      fileExists: (filePath: string) => Promise<boolean>;
      readDirectory: (dirPath: string) => Promise<{ 
        success: boolean; 
        files?: Array<{ name: string; isDirectory: boolean; path: string }>; 
        error?: string 
      }>;

      // Dialog operations
      openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      openFolderDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      saveFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePath?: string }>;

      // Terminal operations
      createTerminal: (id: string, cwd?: string) => Promise<{ success: boolean; error?: string }>;
      writeToTerminal: (id: string, data: string) => Promise<boolean>;
      resizeTerminal: (id: string, cols: number, rows: number) => Promise<boolean>;
      destroyTerminal: (id: string) => Promise<boolean>;

      // Store operations
      getStoreValue: (key: string) => Promise<any>;
      setStoreValue: (key: string, value: any) => Promise<void>;
      deleteStoreValue: (key: string) => Promise<void>;

      // GitHub operations
      githubAuthenticate: () => Promise<any>;
      githubIsAuthenticated: () => Promise<{ isAuthenticated: boolean; user?: any }>;
      githubLogout: () => Promise<{ success: boolean }>;
      githubGetRepos: (accessToken: string) => Promise<any[]>;
      githubCreateRepo: (accessToken: string, name: string, description?: string) => Promise<any>;
      githubGetUserInfo: (accessToken: string) => Promise<any>;

      // ChatGPT operations
      chatgptAuthenticate: () => Promise<{ success: boolean; user?: any }>;
      chatgptIsAuthenticated: () => Promise<{ isAuthenticated: boolean; user?: any }>;
      chatgptLogout: () => Promise<{ success: boolean }>;
      chatgptSendMessage: (messages: Array<{ role: string; content: string }>, model?: string) => Promise<any>;
      chatgptGenerateCode: (prompt: string, language: string) => Promise<string>;
      chatgptExplainCode: (code: string, language: string) => Promise<string>;
      chatgptReviewCode: (code: string, language: string) => Promise<string>;
      chatgptOptimizeCode: (code: string, language: string) => Promise<string>;

      // External links
      openExternal: (url: string) => Promise<void>;

      // Event listeners
      onMenuAction: (callback: (event: any, action: string, data?: any) => void) => void;
      onTerminalData: (callback: (event: any, data: { id: string; data: string }) => void) => void;
      onTerminalExit: (callback: (event: any, data: { id: string }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }

  // Global process object for renderer
  namespace NodeJS {
    interface Process {
      platform: string;
      cwd(): string;
    }
  }

  declare const process: NodeJS.Process;
}

export {};
