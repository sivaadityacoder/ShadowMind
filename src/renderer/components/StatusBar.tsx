import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';

const StatusBarContainer = styled.div`
  background: #007acc;
  color: white;
  height: 22px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  border-top: 1px solid #3e3e3e;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
  }
`;

const StatusSpacer = styled.div`
  flex: 1;
`;

const StatusBar: React.FC = () => {
  const { tabs, activeTabId } = useSelector((state: RootState) => state.editor);
  const { rootPath } = useSelector((state: RootState) => state.explorer);
  const { providers } = useSelector((state: RootState) => state.ai);
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const fileName = activeTab ? activeTab.name : 'No file open';
  const language = activeTab ? activeTab.language : '';
  
  const copilotStatus = providers.copilot.authenticated ? 'Copilot: Ready' : 'Copilot: Not authenticated';
  const chatgptStatus = providers.chatgpt.authenticated ? 'ChatGPT: Ready' : 'ChatGPT: Not authenticated';

  return (
    <StatusBarContainer>
      <StatusItem>{fileName}</StatusItem>
      {language && <StatusItem>{language.toUpperCase()}</StatusItem>}
      {rootPath && <StatusItem>📁 {rootPath.split('/').pop()}</StatusItem>}
      
      <StatusSpacer />
      
      <StatusItem title={copilotStatus}>
        🤖 {providers.copilot.authenticated ? '✓' : '⚠'}
      </StatusItem>
      <StatusItem title={chatgptStatus}>
        💬 {providers.chatgpt.authenticated ? '✓' : '⚠'}
      </StatusItem>
      <StatusItem>
        Line {activeTab ? '1' : '0'}, Column {activeTab ? '1' : '0'}
      </StatusItem>
      <StatusItem>
        UTF-8
      </StatusItem>
      <StatusItem>
        LF
      </StatusItem>
    </StatusBarContainer>
  );
};

export default StatusBar;
