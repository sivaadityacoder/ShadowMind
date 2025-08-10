import { ipcMain, dialog } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { watch, FSWatcher } from 'chokidar';

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
  extension?: string;
}

class FileManager {
  private watchers: Map<string, FSWatcher> = new Map();

  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await fs.rmdir(filePath, { recursive: true });
      } else {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  }

  async listDirectory(dirPath: string): Promise<FileInfo[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files: FileInfo[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        
        files.push({
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: entry.isFile() ? stats.size : undefined,
          modified: stats.mtime,
          extension: entry.isFile() ? path.extname(entry.name) : undefined,
        });
      }

      // Sort: directories first, then files alphabetically
      return files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error listing directory:', error);
      throw new Error(`Failed to list directory: ${dirPath}`);
    }
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      const dir = path.dirname(destPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.copyFile(sourcePath, destPath);
    } catch (error) {
      console.error('Error copying file:', error);
      throw new Error(`Failed to copy file from ${sourcePath} to ${destPath}`);
    }
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      const dir = path.dirname(destPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.rename(sourcePath, destPath);
    } catch (error) {
      console.error('Error moving file:', error);
      throw new Error(`Failed to move file from ${sourcePath} to ${destPath}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  watchDirectory(dirPath: string, callback: (event: string, path: string) => void): string {
    const watcherId = Math.random().toString(36).substring(7);
    
    const watcher = watch(dirPath, {
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
    });

    watcher.on('add', (path) => callback('add', path));
    watcher.on('change', (path) => callback('change', path));
    watcher.on('unlink', (path) => callback('unlink', path));
    watcher.on('addDir', (path) => callback('addDir', path));
    watcher.on('unlinkDir', (path) => callback('unlinkDir', path));

    this.watchers.set(watcherId, watcher);
    return watcherId;
  }

  stopWatching(watcherId: string): void {
    const watcher = this.watchers.get(watcherId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(watcherId);
    }
  }

  async getRecentFiles(maxFiles = 10): Promise<string[]> {
    // This would typically be stored in app settings
    // For now, return empty array - to be implemented with settings storage
    return [];
  }
}

export const fileManager = new FileManager();

// Setup IPC handlers
export function setupFileManagerIPC() {
  ipcMain.handle('file:read', async (event, filePath: string) => {
    return await fileManager.readFile(filePath);
  });

  ipcMain.handle('file:write', async (event, filePath: string, content: string) => {
    return await fileManager.writeFile(filePath, content);
  });

  ipcMain.handle('file:delete', async (event, filePath: string) => {
    return await fileManager.deleteFile(filePath);
  });

  ipcMain.handle('file:create-directory', async (event, dirPath: string) => {
    return await fileManager.createDirectory(dirPath);
  });

  ipcMain.handle('file:list-directory', async (event, dirPath: string) => {
    return await fileManager.listDirectory(dirPath);
  });

  ipcMain.handle('file:copy', async (event, sourcePath: string, destPath: string) => {
    return await fileManager.copyFile(sourcePath, destPath);
  });

  ipcMain.handle('file:move', async (event, sourcePath: string, destPath: string) => {
    return await fileManager.moveFile(sourcePath, destPath);
  });

  ipcMain.handle('file:exists', async (event, filePath: string) => {
    return await fileManager.fileExists(filePath);
  });

  ipcMain.handle('file:open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'xml', 'yml', 'yaml'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs'] },
      ],
    });
    return result;
  });

  ipcMain.handle('file:open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result;
  });

  ipcMain.handle('file:save-dialog', async (event, defaultPath?: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'xml', 'yml', 'yaml'] },
        { name: 'Code Files', extensions: ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs'] },
      ],
    });
    return result;
  });

  ipcMain.handle('file:watch-directory', async (event, dirPath: string) => {
    const watcherId = fileManager.watchDirectory(dirPath, (eventType, path) => {
      event.sender.send('file:watch-event', { watcherId, eventType, path });
    });
    return watcherId;
  });

  ipcMain.handle('file:stop-watching', async (event, watcherId: string) => {
    fileManager.stopWatching(watcherId);
  });

  ipcMain.handle('file:get-recent', async () => {
    return await fileManager.getRecentFiles();
  });
}
