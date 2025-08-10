import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from './store';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import TerminalPanel from './components/TerminalPanel';
import StatusBar from './components/StatusBar';
import { AIPanel } from './components/RealAIPanel';
import { FreeAIPanel } from './components/FreeAIPanel';
import { GitHubPanel } from './components/GitHubPanel';
import { setRootPath } from './store/features/explorer/explorerSlice';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Segoe UI', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CentralArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const EditorContainer = styled.div<{ hasTerminal: boolean }>`
  display: flex;
  flex: 1;
  min-height: 0;
  height: ${props => props.hasTerminal ? 'calc(100% - 300px)' : '100%'};
`;

function App() {
  const dispatch = useDispatch();
  const { visible: explorerVisible } = useSelector((state: RootState) => state.explorer);
  const { panelVisible: terminalVisible } = useSelector((state: RootState) => state.terminal);
  const { panelVisible: aiVisible } = useSelector((state: RootState) => state.ai);
  const { panelVisible: githubVisible } = useSelector((state: RootState) => state.github);

  useEffect(() => {
    // Set up electron event listeners
    if (window.electronAPI) {
      window.electronAPI.onMenuAction((event, action, data) => {
        handleMenuAction(action, data);
      });
    }

    // Load saved workspace
    loadWorkspace();

    return () => {
      // Cleanup listeners
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu:new-file');
        window.electronAPI.removeAllListeners('menu:save');
        window.electronAPI.removeAllListeners('menu:save-as');
        window.electronAPI.removeAllListeners('menu:find');
        window.electronAPI.removeAllListeners('menu:replace');
        window.electronAPI.removeAllListeners('menu:toggle-explorer');
        window.electronAPI.removeAllListeners('menu:toggle-terminal');
        window.electronAPI.removeAllListeners('menu:new-terminal');
        window.electronAPI.removeAllListeners('menu:split-terminal');
        window.electronAPI.removeAllListeners('menu:about');
        window.electronAPI.removeAllListeners('file:open');
        window.electronAPI.removeAllListeners('folder:open');
      }
    };
  }, []);

  const loadWorkspace = async () => {
    if (window.electronAPI) {
      const savedWorkspace = await window.electronAPI.getStoreValue('workspace');
      if (savedWorkspace) {
        dispatch(setRootPath(savedWorkspace));
      }
    }
  };

  const handleMenuAction = async (action: string, data?: any) => {
    switch (action) {
      case 'menu:new-file':
        // Handle new file
        break;
      case 'menu:save':
        // Handle save
        break;
      case 'menu:save-as':
        // Handle save as
        break;
      case 'menu:find':
        // Handle find
        break;
      case 'menu:replace':
        // Handle replace
        break;
      case 'menu:toggle-explorer':
        // Handle toggle explorer
        break;
      case 'menu:toggle-terminal':
        // Handle toggle terminal
        break;
      case 'menu:new-terminal':
        // Handle new terminal
        break;
      case 'menu:split-terminal':
        // Handle split terminal
        break;
      case 'menu:about':
        // Handle about
        break;
      case 'file:open':
        // Handle file open
        break;
      case 'folder:open':
        if (data) {
          dispatch(setRootPath(data));
          if (window.electronAPI) {
            await window.electronAPI.setStoreValue('workspace', data);
          }
        }
        break;
    }
  };

  return (
    <AppContainer>
      <MainContent>
        <ActivityBar />
        {explorerVisible && <Sidebar />}
        <CentralArea>
          <EditorContainer hasTerminal={terminalVisible}>
            <EditorArea />
            {aiVisible && <FreeAIPanel />}
            {githubVisible && <GitHubPanel />}
          </EditorContainer>
          {terminalVisible && <TerminalPanel />}
        </CentralArea>
      </MainContent>
      <StatusBar />
    </AppContainer>
  );
}

export default App;
