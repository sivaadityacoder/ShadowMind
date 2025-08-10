import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GitHubContainer = styled.div`
  padding: 16px;
  background: #252526;
  border-left: 1px solid #333;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #cccccc;
  font-weight: 600;
`;

const LoginButton = styled.button`
  background: #0e639c;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover:not(:disabled) {
    background: #1177bb;
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  color: #cccccc;
  font-weight: 600;
  font-size: 13px;
`;

const UserLogin = styled.div`
  color: #999;
  font-size: 11px;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  color: #cccccc;
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 8px;
`;

const RepoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const RepoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 6px 8px;
  background: #1e1e1e;
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background: #383838;
  }
`;

const RepoName = styled.div`
  color: #cccccc;
  font-size: 12px;
  flex: 1;
`;

const RepoActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: #2d2d30;
  border: 1px solid #555;
  border-radius: 3px;
  color: #cccccc;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  
  &:hover {
    background: #383838;
  }
`;

const CreateRepoForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
`;

const Input = styled.input`
  background: #3c3c3c;
  border: 1px solid #555;
  border-radius: 3px;
  color: #cccccc;
  padding: 6px 8px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const ErrorMessage = styled.div`
  color: #f48771;
  font-size: 11px;
  padding: 4px;
  background: #3c1c1c;
  border-radius: 3px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #555;
  border-radius: 50%;
  border-top-color: #007acc;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  access_token: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
}

export const GitHubPanel: React.FC = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userData = await (window as any).electronAPI.githubAuthenticate();
      if (userData) {
        setUser(userData);
        await loadRepos(userData.access_token);
      }
    } catch (error: any) {
      console.error('GitHub login error:', error);
      setError('Failed to authenticate with GitHub: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRepos = async (accessToken: string) => {
    try {
      const reposData = await (window as any).electronAPI.githubGetRepos(accessToken);
      setRepos(reposData.slice(0, 10)); // Show first 10 repos
    } catch (error: any) {
      console.error('Failed to load repos:', error);
      setError('Failed to load repositories: ' + error.message);
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim() || !user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const newRepo = await (window as any).electronAPI.githubCreateRepo(
        user.access_token,
        newRepoName.trim(),
        newRepoDescription.trim() || undefined
      );
      
      setRepos(prev => [newRepo, ...prev]);
      setNewRepoName('');
      setNewRepoDescription('');
      setShowCreateRepo(false);
    } catch (error: any) {
      console.error('Failed to create repo:', error);
      setError('Failed to create repository: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRepos([]);
    setError('');
    setShowCreateRepo(false);
  };

  const openRepo = (repo: Repository) => {
    (window as any).electronAPI.openExternal?.(repo.html_url);
  };

  return (
    <GitHubContainer>
      <Header>
        <span>GitHub Integration</span>
        {user && (
          <ActionButton onClick={handleLogout}>
            Logout
          </ActionButton>
        )}
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!user ? (
        <div>
          <div style={{ color: '#999', fontSize: '12px', marginBottom: '16px' }}>
            Connect your GitHub account to access repositories, create new repos, and manage your code.
          </div>
          <LoginButton onClick={handleLogin} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Login with GitHub'}
          </LoginButton>
          <div style={{ color: '#999', fontSize: '10px', marginTop: '8px' }}>
            Note: You'll need to register a GitHub OAuth app and configure the client ID in the code.
          </div>
        </div>
      ) : (
        <>
          <UserInfo>
            <Avatar src={user.avatar_url} alt={user.name} />
            <UserDetails>
              <UserName>{user.name || user.login}</UserName>
              <UserLogin>@{user.login}</UserLogin>
            </UserDetails>
          </UserInfo>

          <Section>
            <SectionTitle>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Repositories</span>
                <ActionButton onClick={() => setShowCreateRepo(!showCreateRepo)}>
                  {showCreateRepo ? 'Cancel' : 'New Repo'}
                </ActionButton>
              </div>
            </SectionTitle>

            {showCreateRepo && (
              <CreateRepoForm>
                <Input
                  placeholder="Repository name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <LoginButton onClick={handleCreateRepo} disabled={loading || !newRepoName.trim()}>
                    {loading ? <LoadingSpinner /> : 'Create'}
                  </LoginButton>
                  <ActionButton onClick={() => setShowCreateRepo(false)}>
                    Cancel
                  </ActionButton>
                </div>
              </CreateRepoForm>
            )}

            <RepoList>
              {repos.map((repo) => (
                <RepoItem key={repo.id}>
                  <RepoName onClick={() => openRepo(repo)}>
                    {repo.name}
                    {repo.description && (
                      <div style={{ color: '#999', fontSize: '10px' }}>
                        {repo.description}
                      </div>
                    )}
                  </RepoName>
                  <RepoActions>
                    <ActionButton onClick={() => openRepo(repo)}>
                      Open
                    </ActionButton>
                  </RepoActions>
                </RepoItem>
              ))}
            </RepoList>
          </Section>

          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <ActionButton onClick={() => loadRepos(user.access_token)}>
                Refresh Repositories
              </ActionButton>
              <ActionButton onClick={() => (window as any).electronAPI.openExternal?.('https://github.com/' + user.login)}>
                Open GitHub Profile
              </ActionButton>
            </div>
          </Section>
        </>
      )}
    </GitHubContainer>
  );
};
