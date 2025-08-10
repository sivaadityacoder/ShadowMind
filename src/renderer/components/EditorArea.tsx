import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import MonacoEditor from './MonacoEditor';
import TabBar from './TabBar';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  background: #1e1e1e;
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  background: #1e1e1e;
  color: #d4d4d4;
`;

const WelcomeTitle = styled.h1`
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 16px;
  text-align: center;
`;

const WelcomeSubtitle = styled.p`
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
  max-width: 400px;
  line-height: 1.5;
`;

const ShortcutList = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  opacity: 0.8;
`;

const ShortcutKey = styled.span`
  background: #3c3c3c;
  border: 1px solid #464647;
  border-radius: 3px;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 11px;
  min-width: 120px;
  text-align: center;
`;

const EditorArea: React.FC = () => {
  const { tabs, activeTabId } = useSelector((state: RootState) => state.editor);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  if (tabs.length === 0) {
    return (
      <EditorContainer>
        <WelcomeScreen>
          <WelcomeTitle>Welcome to Vibe Editor</WelcomeTitle>
          <WelcomeSubtitle>
            A powerful code editor with integrated AI features including ChatGPT and GitHub Copilot.
            Start by opening a file or folder to begin coding.
          </WelcomeSubtitle>
          <ShortcutList>
            <ShortcutItem>
              <ShortcutKey>Ctrl+O</ShortcutKey>
              <span>Open File</span>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutKey>Ctrl+Shift+O</ShortcutKey>
              <span>Open Folder</span>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutKey>Ctrl+N</ShortcutKey>
              <span>New File</span>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutKey>Ctrl+`</ShortcutKey>
              <span>Toggle Terminal</span>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutKey>Ctrl+Shift+E</ShortcutKey>
              <span>Toggle Explorer</span>
            </ShortcutItem>
          </ShortcutList>
        </WelcomeScreen>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <TabBar />
      {activeTab && (
        <MonacoEditor
          value={activeTab.content}
          language={activeTab.language}
          path={activeTab.path}
          onChange={(value) => {
            // TODO: Update tab content
          }}
        />
      )}
    </EditorContainer>
  );
};

export default EditorArea;
