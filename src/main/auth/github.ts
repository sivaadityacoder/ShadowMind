import { BrowserWindow, shell, ipcMain } from 'electron';
import { URLSearchParams } from 'url';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  access_token: string;
}

class GitHubAuth {
  private clientId = 'your_github_client_id'; // Users need to register their own app
  private clientSecret = 'your_github_client_secret';
  private redirectUri = 'http://localhost:8080/auth/github/callback';
  private scopes = ['user:email', 'repo', 'gist'];

  async authenticate(): Promise<GitHubUser | null> {
    return new Promise((resolve, reject) => {
      const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: this.scopes.join(' '),
        state: Math.random().toString(36).substring(7)
      })}`;

      // Create auth window
      const authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: true,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      authWindow.loadURL(authUrl);

      // Handle auth callback
      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (url.startsWith(this.redirectUri)) {
          const urlParams = new URL(url);
          const code = urlParams.searchParams.get('code');
          const error = urlParams.searchParams.get('error');

          authWindow.close();

          if (error) {
            reject(new Error(`GitHub auth error: ${error}`));
            return;
          }

          if (code) {
            try {
              const user = await this.exchangeCodeForToken(code);
              resolve(user);
            } catch (err) {
              reject(err);
            }
          }
        }
      });

      authWindow.on('closed', () => {
        resolve(null);
      });
    });
  }

  private async exchangeCodeForToken(code: string): Promise<GitHubUser> {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const tokenData: any = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`Token exchange error: ${tokenData.error_description}`);
    }

    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData: any = await userResponse.json();

    return {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      access_token: accessToken,
    };
  }

  async getUserRepos(accessToken: string) {
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    return response.json();
  }

  async createRepo(accessToken: string, name: string, description?: string) {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: false,
        auto_init: true,
      }),
    });

    return response.json();
  }
}

export const githubAuth = new GitHubAuth();

// Setup IPC handlers
export function setupGitHubIPC() {
  ipcMain.handle('github:authenticate', async () => {
    try {
      return await githubAuth.authenticate();
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw error;
    }
  });

  ipcMain.handle('github:get-repos', async (event, accessToken: string) => {
    try {
      return await githubAuth.getUserRepos(accessToken);
    } catch (error) {
      console.error('GitHub get repos error:', error);
      throw error;
    }
  });

  ipcMain.handle('github:create-repo', async (event, accessToken: string, name: string, description?: string) => {
    try {
      return await githubAuth.createRepo(accessToken, name, description);
    } catch (error) {
      console.error('GitHub create repo error:', error);
      throw error;
    }
  });
}
