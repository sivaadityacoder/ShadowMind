import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { removeTab, setActiveTab } from '../store/features/editor/editorSlice';

const TabBarContainer = styled.div`
  background: #2d2d30;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  overflow-x: auto;
  min-height: 35px;
`;

const Tab = styled.div<{ active?: boolean }>`
  background: ${props => props.active ? '#1e1e1e' : '#2d2d30'};
  color: ${props => props.active ? '#d4d4d4' : '#969696'};
  padding: 8px 16px;
  border-right: 1px solid #3e3e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  min-width: 120px;
  position: relative;
  font-size: 13px;

  &:hover {
    color: #d4d4d4;
    background: ${props => props.active ? '#1e1e1e' : '#383838'};
  }
`;

const TabLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabClose = styled.div`
  margin-left: 8px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  opacity: 0.7;
  font-size: 12px;
  
  &:hover {
    background: #424242;
    opacity: 1;
  }
`;

const DirtyIndicator = styled.span`
  margin-left: 4px;
  width: 6px;
  height: 6px;
  background: #d4d4d4;
  border-radius: 50%;
`;

const TabBar: React.FC = () => {
  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector((state: RootState) => state.editor);

  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab(tabId));
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    dispatch(removeTab(tabId));
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || 'Untitled';
  };

  return (
    <TabBarContainer>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          active={tab.id === activeTabId}
          onClick={() => handleTabClick(tab.id)}
        >
          <TabLabel>{getFileName(tab.path)}</TabLabel>
          {tab.isDirty && <DirtyIndicator />}
          <TabClose onClick={(e) => handleTabClose(e, tab.id)}>
            ×
          </TabClose>
        </Tab>
      ))}
    </TabBarContainer>
  );
};

export default TabBar;
