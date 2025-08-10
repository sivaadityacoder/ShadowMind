import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { FileNode, setFileTree, setSelectedPath, toggleExpanded } from '../store/features/explorer/explorerSlice';

const SidebarContainer = styled.div`
  background: #252526;
  border-right: 1px solid #3e3e3e;
  width: 280px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const SidebarHeader = styled.div`
  background: #2d2d30;
  padding: 8px 12px;
  border-bottom: 1px solid #3e3e3e;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #d4d4d4;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileTreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const FileTreeItem = styled.div<{ selected?: boolean; depth: number }>`
  padding: 4px 8px 4px ${props => 12 + props.depth * 16}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 13px;
  color: #d4d4d4;
  background: ${props => props.selected ? '#094771' : 'transparent'};

  &:hover {
    background: ${props => props.selected ? '#094771' : '#2a2d2e'};
  }
`;

const FileIcon = styled.span<{ isDirectory?: boolean; expanded?: boolean }>`
  margin-right: 6px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  &::before {
    content: ${props => {
      if (props.isDirectory) {
        return props.expanded ? '"📂"' : '"📁"';
      } else {
        return '"📄"';
      }
    }};
  }
`;

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expanded: boolean;
  selected: boolean;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  expanded,
  selected,
  onSelect,
  onToggle,
}) => {
  const handleClick = () => {
    if (node.isDirectory) {
      onToggle(node.path);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <>
      <FileTreeItem
        selected={selected}
        depth={depth}
        onClick={handleClick}
      >
        <FileIcon isDirectory={node.isDirectory} expanded={expanded} />
        <FileName>{node.name}</FileName>
      </FileTreeItem>
      {node.isDirectory && expanded && node.children && (
        <>
          {node.children.map((child) => (
            <FileTreeNodeContainer
              key={child.path}
              node={child}
              depth={depth + 1}
            />
          ))}
        </>
      )}
    </>
  );
};

interface FileTreeNodeContainerProps {
  node: FileNode;
  depth: number;
}

const FileTreeNodeContainer: React.FC<FileTreeNodeContainerProps> = ({ node, depth }) => {
  const dispatch = useDispatch();
  const { selectedPath, expandedPaths } = useSelector((state: RootState) => state.explorer);

  const expanded = expandedPaths.has(node.path);
  const selected = selectedPath === node.path;

  const handleSelect = (path: string) => {
    dispatch(setSelectedPath(path));
    // TODO: Open file in editor
  };

  const handleToggle = async (path: string) => {
    dispatch(toggleExpanded(path));
    
    // Load children if directory is being expanded
    if (!expanded && node.isDirectory && window.electronAPI) {
      try {
        const result = await window.electronAPI.readDirectory(path);
        if (result.success && result.files) {
          const children: FileNode[] = result.files.map(file => ({
            name: file.name,
            path: file.path,
            isDirectory: file.isDirectory,
            children: file.isDirectory ? [] : undefined,
          }));
          
          // Update the node with children
          const updatedNode = { ...node, children };
          // TODO: Update the file tree with the new children
        }
      } catch (error) {
        console.error('Failed to read directory:', error);
      }
    }
  };

  return (
    <FileTreeNode
      node={node}
      depth={depth}
      expanded={expanded}
      selected={selected}
      onSelect={handleSelect}
      onToggle={handleToggle}
    />
  );
};

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { rootPath, fileTree } = useSelector((state: RootState) => state.explorer);

  useEffect(() => {
    if (rootPath && window.electronAPI) {
      loadFileTree(rootPath);
    }
  }, [rootPath]);

  const loadFileTree = async (path: string) => {
    try {
      const result = await window.electronAPI.readDirectory(path);
      if (result.success && result.files) {
        const nodes: FileNode[] = result.files.map(file => ({
          name: file.name,
          path: file.path,
          isDirectory: file.isDirectory,
          children: file.isDirectory ? [] : undefined,
        }));
        dispatch(setFileTree(nodes));
      }
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        Explorer
      </SidebarHeader>
      <FileTreeContainer>
        {fileTree.map((node) => (
          <FileTreeNodeContainer
            key={node.path}
            node={node}
            depth={0}
          />
        ))}
      </FileTreeContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
