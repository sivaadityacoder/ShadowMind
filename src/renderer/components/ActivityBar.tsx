import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { setVisible } from '../store/features/explorer/explorerSlice';
import { setPanelVisible } from '../store/features/ai/aiSlice';

const ActivityBarContainer = styled.div`
  background: #333333;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-right: 1px solid #3e3e3e;
`;

const ActivityItem = styled.div<{ active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
  cursor: pointer;
  border-radius: 4px;
  color: #d4d4d4;
  background: ${props => props.active ? '#094771' : 'transparent'};
  
  &:hover {
    background: ${props => props.active ? '#094771' : '#404040'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ExplorerIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13H2V7h4.49l.35-.15L7.69 6h6.3v5.49z"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.4zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"/>
  </svg>
);

const GitIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const DebugIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M9.73 2.11a.765.765 0 0 1 1.52 0c.04.85-.31 1.87-.89 2.34-.53.43-1.23.25-1.57-.4-.37-.7-.37-1.52-.06-1.94zM4.08 8.46L3 10.5l.86.5 1.33-2.3c.54.86 1.31 1.3 2.32 1.3 1.01 0 1.78-.44 2.32-1.3L11.16 11l.86-.5-1.08-2.04c.13-.47.21-.94.21-1.42 0-1.07-.55-2.02-1.39-2.56L8.5 5.5v1.04c0 .28-.22.5-.5.5s-.5-.22-.5-.5V5.5L6.21 4.48C5.37 5.02 4.82 5.97 4.82 7.04c0 .48.08.95.21 1.42H4.08zM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/>
  </svg>
);

const ExtensionsIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 2v12h16V2H0zm1 11V3h14v10H1zm2-2h10v1H3v-1zm0-2h10v1H3V9zm0-2h10v1H3V7zm0-2h10v1H3V5z"/>
  </svg>
);

const AIIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0L5.5 5L0 8l5.5 3L8 16l2.5-5L16 8l-5.5-3L8 0zM8 2.83L9.79 6.5l3.67 1.5-3.67 1.5L8 13.17 6.21 9.5 2.54 8l3.67-1.5L8 2.83z"/>
  </svg>
);

const ActivityBar: React.FC = () => {
  const dispatch = useDispatch();
  const { visible: explorerVisible } = useSelector((state: RootState) => state.explorer);
  const { panelVisible: aiVisible } = useSelector((state: RootState) => state.ai);

  const handleExplorerClick = () => {
    dispatch(setVisible(!explorerVisible));
  };

  const handleAIClick = () => {
    dispatch(setPanelVisible(!aiVisible));
  };

  return (
    <ActivityBarContainer>
      <ActivityItem active={explorerVisible} onClick={handleExplorerClick} title="Explorer">
        <ExplorerIcon />
      </ActivityItem>
      <ActivityItem title="Search">
        <SearchIcon />
      </ActivityItem>
      <ActivityItem title="Source Control">
        <GitIcon />
      </ActivityItem>
      <ActivityItem title="Run and Debug">
        <DebugIcon />
      </ActivityItem>
      <ActivityItem title="Extensions">
        <ExtensionsIcon />
      </ActivityItem>
      <ActivityItem active={aiVisible} onClick={handleAIClick} title="AI Assistant">
        <AIIcon />
      </ActivityItem>
    </ActivityBarContainer>
  );
};

export default ActivityBar;
