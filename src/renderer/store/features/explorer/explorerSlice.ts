import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

interface ExplorerState {
  rootPath: string | null;
  fileTree: FileNode[];
  selectedPath: string | null;
  expandedPaths: Set<string>;
  visible: boolean;
}

const initialState: ExplorerState = {
  rootPath: null,
  fileTree: [],
  selectedPath: null,
  expandedPaths: new Set(),
  visible: true,
};

const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    setRootPath: (state, action: PayloadAction<string>) => {
      state.rootPath = action.payload;
    },
    setFileTree: (state, action: PayloadAction<FileNode[]>) => {
      state.fileTree = action.payload;
    },
    setSelectedPath: (state, action: PayloadAction<string | null>) => {
      state.selectedPath = action.payload;
    },
    toggleExpanded: (state, action: PayloadAction<string>) => {
      if (state.expandedPaths.has(action.payload)) {
        state.expandedPaths.delete(action.payload);
      } else {
        state.expandedPaths.add(action.payload);
      }
    },
    setVisible: (state, action: PayloadAction<boolean>) => {
      state.visible = action.payload;
    },
    updateFileNode: (state, action: PayloadAction<{ path: string; node: FileNode }>) => {
      // Update a specific file node in the tree
      const updateNode = (nodes: FileNode[], targetPath: string, newNode: FileNode): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].path === targetPath) {
            nodes[i] = newNode;
            return true;
          }
          if (nodes[i].children && updateNode(nodes[i].children!, targetPath, newNode)) {
            return true;
          }
        }
        return false;
      };
      updateNode(state.fileTree, action.payload.path, action.payload.node);
    },
  },
});

export const {
  setRootPath,
  setFileTree,
  setSelectedPath,
  toggleExpanded,
  setVisible,
  updateFileNode,
} = explorerSlice.actions;

export default explorerSlice.reducer;
